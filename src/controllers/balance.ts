import { Request, Response } from "express";
import dbConnect from "../config/postgres";
import { validateDefixId } from "../helpers/utils";

import { getBalanceBTC, getBalanceBTC_Cypher } from "../services/btc";
import { getBalanceETH, getBalanceTokenETH } from "../services/eth";
import { getBalanceNEAR } from "../services/near";
import { getBalanceTRON } from "../services/tron";
import { getBalanceBNB } from "../services/bnb";

import { Wallet } from "../interfaces/wallet.interface";
import { Credential } from "../interfaces/credential.interface";

const NETWORK = process.env.NETWORK;

const getCryptos = async (req: Request, res: Response) => {
	try {
		const conexion = await dbConnect();
		const cryptocurrencys = await conexion.query("select * from backend_cryptocurrency");

		const cryptos = []

		for (let cryptocurrency of cryptocurrencys.rows) {
			const tokens = await conexion.query("select * from backend_token where cryptocurrency_id = $1", [cryptocurrency.id]);
			cryptocurrency.tokens = tokens.rows
			cryptos.push(cryptocurrency)
		}

		res.send(cryptos)
	} catch (error) {
		console.log(error)
		res.status(400).send()
	};
};

const getBalance = async (req: Request, res: Response) => {
	try {
		const { defixId } = req.body

		const conexion = await dbConnect()
		const resultados = await conexion.query("select * \
																				from addresses where \
																				defix_id = $1\
																				", [defixId])

		if (resultados.rows.length === 0) return res.status(405).send()

		const addresses = resultados.rows

		const cryptos = await getCryptosFn()

		const balances = []

		for (let crypto of cryptos) {
			const address = addresses.find(element => element.name === crypto.coin)

			const balanceCrypto = {
				coin: crypto.coin,
				balance: 0,
				tokens: []
			}

			switch (crypto.coin) {
				case "BTC": {
					if (NETWORK === "mainnet") {
						balanceCrypto.balance = await getBalanceBTC(address)
					} else {
						balanceCrypto.balance = await getBalanceBTC_Cypher(address)
					}
					break;
				}
				case "ETH": {
					balanceCrypto.balance = await getBalanceETH(address)
					for (let token of crypto.tokens) {
						const itemToken = {
							coin: token.coin,
							balance: 0,
						}

						itemToken.balance = await getBalanceTokenETH(address, token.contract, token.decimals)

						// balanceCrypto.tokens.push(itemToken)
					}
					break;
				}
				default: {
					//statements; 
					break;
				}
			}
		}

		// let balanceTRON

		// if (addresstron) {
		// 	balanceTRON = await getBalanceTRON(addresstron.address)
		// 	allBalances.push(balanceTRON)
		// } else {
		// 	balanceTRON = { coin: 'TRON', balance: 0 }
		// 	allBalances.push(balanceTRON)
		// }

		// let balanceBNB

		// if (addressbnb) {
		// 	balanceBNB = await getBalanceBNB(addressbnb.address)
		// 	allBalances.push(balanceBNB)
		// } else {
		// 	balanceBNB = { coin: 'BNB', balance: 0 }
		// 	allBalances.push(balanceBNB)
		// }

		// const resultado = await conexion.query("select * \
		// 																					from balance where \
		// 																					defix_id = $1\
		// 																					", [defixId])


		// if (resultado.rows[0]) {
		// 	const result = await conexion.query("update balance\
		// 													set btc = $1, eth = $2, near = $3, usdt = $4, usdc = $5, dai = $6, tron = $7, bnb = $8 where\
		// 													defix_id = $9\
		// 													", [balanceBTC.balance, balanceETH.balance, balanceNEAR.balance, balanceUSDT.balance, balanceUSDC.balance, balanceDAI.balance, balanceTRON.balance, balanceBNB.balance, defixId])
		// 		.then(() => {
		// 			return true
		// 		}).catch((error) => {
		// 			return false
		// 		})


		// 	if (result === true) {
		// 		res.json(allBalances)
		// 	} else {
		// 		res.status(500).json()
		// 	}
		// } else {
		// 	const result = await conexion.query(`insert into balance
		// 													(defix_id, btc, eth, near, usdt, usdc, dai, tron, bnb)
		// 													values ($1, $2, $3, $4, $5, $6, $7, $8, $9)`, [defixId, balanceBTC.balance, balanceETH.balance, balanceNEAR.balance, balanceUSDT.balance, balanceUSDC.balance, balanceDAI.balance, balanceTRON.balance, balanceBNB.balance])
		// 		.then(() => {
		// 			return true
		// 		}).catch(() => {
		// 			return false
		// 		})
		// 	if (result === true) {
		// 		res.json(allBalances)
		// 	} else {
		// 		res.status(204).json()
		// 	}
		// }


	} catch (error) {
		res.status(404).json()
	}
}

// UTILS

const getCryptosFn = async () => {
	try {
		const conexion = await dbConnect();
		const cryptocurrencys = await conexion.query("select * from backend_cryptocurrency");

		const cryptos = []

		for (let cryptocurrency of cryptocurrencys.rows) {
			const tokens = await conexion.query("select * from backend_token where cryptocurrency_id = $1", [cryptocurrency.id]);
			cryptocurrency.tokens = tokens.rows
			cryptos.push(cryptocurrency)
		}

		return cryptos
	} catch (error) {
		console.log(error)
		return []
	};
};

export { getCryptos }