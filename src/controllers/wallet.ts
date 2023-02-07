import { Request, Response } from "express";
import dbConnect from "../config/postgres";
import { validateDefixId, validateEmail } from "../helpers/utils";
import { generateMnemonic } from 'bip39';

import { createWalletBTC, isAddressBTC } from "../services/btc.services";
import { createWalletETH, isAddressETH } from "../services/eth.services";
import { createWalletNEAR, getIdNear, importWalletNEAR, isAddressNEAR } from "../services/near.services";
import { createWalletTRON, isAddressTRON } from "../services/tron.services";
import { createWalletBNB, isAddressBNB } from "../services/bsc.services";

import { Wallet } from "../interfaces/wallet.interface";
import { Credential } from "../interfaces/credential.interface";



const generateMnemonicAPI = async (req: Request, res: Response) => {
	try {
		const { defixId } = req.body;

		if (!defixId || !defixId.includes(".defix3") || defixId.includes(" ")) return res.status(400).send();

		const resp: boolean = await validateDefixId(defixId.toLowerCase());

		if (resp) return res.status(400).send();

		const mnemonic = await generateMnemonic();

		res.send({ resp: "ok", mnemonic: mnemonic });
	} catch (err) {
		console.log(err);
		res.status(500).send({ err });
	}
}

const createWallet = async (req: Request, res: Response) => {
	try {
		const { defixId, mnemonic, email } = req.body;

		if (!defixId || !defixId.includes(".defix3") || defixId.includes(" ") || !mnemonic) return res.status(400).send();

		const exists: boolean = await validateDefixId(defixId.toLowerCase());

		if (!exists) {

			const credentials: Array<Credential> = [];

			credentials.push(await createWalletBTC(mnemonic));
			credentials.push(await createWalletETH(mnemonic));
			credentials.push(await createWalletNEAR(mnemonic));
			credentials.push(await createWalletTRON(mnemonic));
			credentials.push(await createWalletBNB(mnemonic));

			const wallet: Wallet = {
				defixId: defixId,
				mnemonic: mnemonic,
				credentials: credentials
			};

			const nearId = await getIdNear(mnemonic)

			const save = await saveUser(nearId, wallet)

			if (save) {
				if (await validateEmail(email)) {
					// EnviarPhraseCorreo(mnemonic, defixID.toLowerCase(), email)
					console.log("envia correo")
				}
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

const importWallet = async (req: Request, res: Response) => {
	try {
		const { mnemonic } = req.body;

		if (!mnemonic) return res.status(400).send();

		const nearId = await getIdNear(mnemonic);

		const conexion = await dbConnect();

		const response = await conexion.query("select * \
																					from users where \
																					import_id = $1\
																					", [nearId]);

		if (response.rows.length === 0) return res.status(400).send();

		let responseAccount = response.rows[0];

		const defixId = responseAccount.defix_id;

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
																					defix_id = $1 and name = 'TRON'\
																					", [defixId]);

		// Crypto news

		if (addressTRON.rows.length === 0) {
			console.log("NO TIENE CUENTRA TRON")
			const addresstron = credentials.find(element => element.name === 'TRON')
			if (addresstron) {
				await conexion.query(`insert into addresses
																	(defix_id, name, address)
																	values ($1, $2, $3)`, [defixId, 'TRON', addresstron.address])
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
		const { defixId, mnemonic } = req.body

		if (!defixId || !defixId.includes(".defix3") || defixId.includes(" ") || !mnemonic) return res.status(400).send();

		const exists: boolean = await validateDefixId(defixId.toLowerCase());

		if (!exists) {
			const credentials: Array<Credential> = [];

			credentials.push(await createWalletBTC(mnemonic));
			credentials.push(await createWalletETH(mnemonic));
			credentials.push(await createWalletNEAR(mnemonic));
			credentials.push(await createWalletTRON(mnemonic));
			credentials.push(await createWalletBNB(mnemonic));

			const wallet: Wallet = {
				defixId: defixId,
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
		else if (coin === 'TRON') {
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

export { generateMnemonicAPI, createWallet, validateDefixIdAPI, importWallet, importFromMnemonic, validateAddress, getUsers }