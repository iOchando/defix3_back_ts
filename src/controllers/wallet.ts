import { Request, Response } from "express";
import dbConnect from "../config/postgres";
import { validateDefixId, validateEmail, getCryptosFn } from "../helpers/utils";
import { encrypt, decrypt } from "../helpers/crypto";
import { generateMnemonic } from 'bip39';

import { createWalletBTC, isAddressBTC } from "../services/btc.services";
import { createWalletETH, isAddressETH } from "../services/eth.services";
import { createWalletNEAR, getIdNear, importWalletNEAR, isAddressNEAR } from "../services/near.services";
import { createWalletTRON, isAddressTRON } from "../services/tron.services";
import { createWalletBNB, isAddressBNB } from "../services/bsc.services";

import { Wallet } from "../interfaces/wallet.interface";
import { Credential } from "../interfaces/credential.interface";
import { EnviarPhraseCorreo } from "../helpers/mail";

const generateMnemonicAPI = async (req: Request, res: Response) => {
	try {
		const { defixId } = req.body;

		if (!defixId || !defixId.includes(".defix3") || defixId.includes(" ")) return res.status(400).send();

		const DefixId = defixId.toLowerCase()

		const resp: boolean = await validateDefixId(DefixId);

		if (resp) return res.status(400).send();

		const mnemonic = await generateMnemonic();

		res.send({ mnemonic: mnemonic });
	} catch (err) {
		console.log(err);
		res.status(500).send({ err });
	}
}

const encryptAPI = async (req: Request, res: Response) => {
	try {
		const { text } = req.body;

		if (!text) return res.status(400).send();

		const resp = encrypt(text);

		if (!resp) return res.status(400).send();

		res.send(resp);
	} catch (err) {
		console.log(err);
		res.status(500).send({ err });
	}
}

const createWallet = async (req: Request, res: Response) => {
	try {
		const { defixId, seedPhrase, email } = req.body;
		const mnemonic = decrypt(seedPhrase)

		if (!defixId || !defixId.includes(".defix3") || defixId.includes(" ") || !mnemonic) return res.status(400).send();

		const DefixId = defixId.toLowerCase()

		const exists: boolean = await validateDefixId(defixId.toLowerCase());

		if (!exists) {
			const credentials: Array<Credential> = [];

			credentials.push(await createWalletBTC(mnemonic));
			credentials.push(await createWalletETH(mnemonic));
			credentials.push(await createWalletNEAR(mnemonic));
			credentials.push(await createWalletTRON(mnemonic));
			credentials.push(await createWalletBNB(mnemonic));

			const wallet: Wallet = {
				defixId: DefixId,
				mnemonic: mnemonic,
				credentials: credentials
			};

			const nearId = await getIdNear(mnemonic)

			const save = await saveUser(nearId, wallet)

			if (save) {
				if (await validateEmail(email)) {
					EnviarPhraseCorreo(mnemonic, DefixId, email)
					console.log("envia correo")
				}
				const enc = JSON.stringify(wallet)
				const walletres = encrypt(enc)
				return res.send(walletres)
			}
			return res.status(400).send()
		}
		res.status(405).send()
	} catch (err) {
		console.log(err);
		res.status(500).send({ err });
	}
};

const importWallet = async (req: Request, res: Response) => {
	try {
		const { seedPhrase } = req.body;

		const mnemonic = decrypt(seedPhrase)

		if (!mnemonic) return res.status(400).send();

		const nearId = await getIdNear(mnemonic);

		const conexion = await dbConnect();

		const response = await conexion.query("select * \
																					from users where \
																					import_id = $1\
																					", [nearId]);

		if (response.rows.length === 0) return res.status(400).send();

		let responseAccount = response.rows[0];

		const defixId = responseAccount.defix_id.toLowerCase();

		const addressNEAR = await conexion.query("select * \
																					from addresses where \
																					defix_id = $1 and name = 'NEAR'\
																					", [defixId]);

		const nearAddress = addressNEAR.rows[0].address;

		const credentials: Array<Credential> = [];

		credentials.push(await createWalletBTC(mnemonic));
		credentials.push(await createWalletETH(mnemonic));
		credentials.push(await importWalletNEAR(nearAddress, mnemonic));
		credentials.push(await createWalletTRON(mnemonic));
		credentials.push(await createWalletBNB(mnemonic));

		const wallet: Wallet = {
			defixId: defixId,
			mnemonic: mnemonic,
			credentials: credentials
		};

		const addressTRON = await conexion.query("select * \
																					from addresses where \
																					defix_id = $1 and name = 'TRX'\
																					", [defixId]);

		// Crypto news

		if (addressTRON.rows.length === 0) {
			console.log("NO TIENE CUENTRA TRX")
			const addresstron = credentials.find(element => element.name === 'TRX')
			if (addresstron) {
				await conexion.query(`insert into addresses
																	(defix_id, name, address)
																	values ($1, $2, $3)`, [defixId, 'TRX', addresstron.address])
			}

		}

		const addressBNB = await conexion.query("select * \
																					from addresses where \
																					defix_id = $1 and name = 'BNB'\
																					", [defixId])

		if (addressBNB.rows.length === 0) {
			console.log("NO TIENE CUENTRA BNB")
			const addressbnb = credentials.find(element => element.name === 'BNB')
			if (addressbnb) {
				await conexion.query(`insert into addresses
																	(defix_id, name, address)
																	values ($1, $2, $3)`, [defixId, 'BNB', addressbnb.address])
			}
		}

		// End

		const resultados = await conexion.query("select * \
																									from users where \
																									defix_id = $1\
																									", [defixId])

		if (resultados.rows.length === 0) {
			await conexion.query(`insert into users
									(defix_id, dosfa, secret, import_id)
									values ($1, false, null, $2)`, [defixId, nearId])
		}

		let result
		await conexion.query("update users\
															set close_sessions = $1 where\
															defix_id = $2\
															", [false, defixId])
			.then(() => {
				result = true
			}).catch(() => {
				result = false
			})

		if (!result) return res.status(400).send()

		res.send(wallet)
	} catch (error) {
		res.status(400).send()
	}
}

const importFromMnemonic = async (req: Request, res: Response) => {
	try {
		const { defixId, seedPhrase } = req.body

		const mnemonic = decrypt(seedPhrase)

		if (!defixId || !defixId.includes(".defix3") || defixId.includes(" ") || !mnemonic) return res.status(400).send();

		const DefixId = defixId.toLowerCase()

		const exists: boolean = await validateDefixId(defixId.toLowerCase());

		if (!exists) {
			const credentials: Array<Credential> = [];

			credentials.push(await createWalletBTC(mnemonic));
			credentials.push(await createWalletETH(mnemonic));
			credentials.push(await createWalletNEAR(mnemonic));
			credentials.push(await createWalletTRON(mnemonic));
			credentials.push(await createWalletBNB(mnemonic));

			const wallet: Wallet = {
				defixId: DefixId,
				mnemonic: mnemonic,
				credentials: credentials
			};

			const nearId = await getIdNear(mnemonic)

			const save = await saveUser(nearId, wallet)

			if (save) {
				return res.send(wallet)
			}
			return res.status(400).send()
		}
		res.status(405).send()
	} catch (err) {
		console.log(err);
		res.status(500).send({ err });
	}
};

const validatePK = async (privateKey: string) => {
	try {

	} catch (error) {
		return false
	}
}

const importFromPK = async (req: Request, res: Response) => {
	try {
		const { pkEncrypt } = req.body

		const privateKey = decrypt(pkEncrypt)

		// if (!privateKey) return res.status(400).send();

		const cryptos = await getCryptosFn()

		console.log(cryptos)

		// const exists: boolean = await validateDefixId(defixId.toLowerCase());

		// if (!exists) {
		// 	const credentials: Array<Credential> = [];

		// 	credentials.push(await createWalletBTC(mnemonic));
		// 	credentials.push(await createWalletETH(mnemonic));
		// 	credentials.push(await createWalletNEAR(mnemonic));
		// 	credentials.push(await createWalletTRON(mnemonic));
		// 	credentials.push(await createWalletBNB(mnemonic));

		// 	const wallet: Wallet = {
		// 		defixId: defixId,
		// 		mnemonic: mnemonic,
		// 		credentials: credentials
		// 	};

		// 	const nearId = await getIdNear(mnemonic)

		// 	const save = await saveUser(nearId, wallet)

		// 	if (save) {
		// 		return res.send(wallet)
		// 	}
		// 	return res.status(400).send()
		// }
		// res.status(405).send()
	} catch (err) {
		console.log(err);
		res.status(500).send({ err });
	}
};

const getUsers = async (req: Request, res: Response) => {
	try {
		const conexion = await dbConnect();
		const response = await conexion.query("select defix_id \
																					from users");
		res.send(response.rows);
	} catch (error) {
		res.status(400).send(error);
	};
};

// UTILS

const validateAddress = async (req: Request, res: Response) => {
	try {
		const { address, coin } = req.body
		if (!address || !coin) return res.status(400).send()

		if (coin === 'BTC') {
			return res.send(await isAddressBTC(address))
		}
		else if (coin === 'NEAR') {
			return res.send(await isAddressNEAR(address))
		}
		else if (coin === 'ETH') {
			return res.send(await isAddressETH(address))
		}
		else if (coin === 'BNB') {
			return res.send(await isAddressBNB(address))
		}
		else if (coin === 'TRX') {
			return res.send(await isAddressTRON(address))
		}
		res.status(400).send()
	} catch (error) {
		res.status(400).send({ "error": error })
	}
}

const saveUser = async (nearId: string, wallet: Wallet) => {
	try {
		const conexion = await dbConnect()
		const result: boolean = await conexion.query(`insert into users
				(defix_id, dosfa, secret, import_id)
				values ($1, false, null, $2)`, [wallet.defixId, nearId])
			.then(async () => {
				for (let credential of wallet.credentials) {
					await conexion.query(`insert into addresses
														(defix_id, name, address)
														values ($1, $2, $3)`, [wallet.defixId, credential.name, credential.address])
				}
				return true
			}).catch(() => {
				return false
			})

		if (result) return true
		return false
	} catch (error) {
		return false
	}
}

const validateDefixIdAPI = async (req: Request, res: Response) => {
	try {
		const { defixId } = req.body;

		if (!defixId || !defixId.includes(".defix3") || defixId.includes(" ")) return res.status(400).send();

		const resp: boolean = await validateDefixId(defixId.toLowerCase());

		res.send(resp);
	} catch (err) {
		console.log(err);
		res.status(500).send({ err });
	}
}

export { encryptAPI, generateMnemonicAPI, createWallet, validateDefixIdAPI, importWallet, importFromMnemonic, validateAddress, getUsers, importFromPK }