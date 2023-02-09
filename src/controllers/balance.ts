import { Request, Response } from "express";
import dbConnect from "../config/postgres";
import { validateDefixId, getCryptosFn } from "../helpers/utils";

import { getBalanceBTC, getBalanceBTC_Cypher } from "../services/btc.services";
import { getBalanceETH, getBalanceTokenETH } from "../services/eth.services";
import { getBalanceNEAR } from "../services/near.services";
import { getBalanceTRON, getBalanceTokenTRON } from "../services/tron.services";
import { getBalanceBNB, getBalanceTokenBSC } from "../services/bsc.services";

import { Wallet } from "../interfaces/wallet.interface";
import { Credential } from "../interfaces/credential.interface";
import { BalanceCrypto } from "../interfaces/balance_crypto.interface";
import { Balance } from "../interfaces/balance.interface";

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

		const balances: BalanceCrypto[] = []

		for (let crypto of cryptos) {
			const balanceCrypto: BalanceCrypto = {
				coin: crypto.coin,
				blockchain: crypto.blockchain,
				balance: 0,
				tokens: []
			}

			const addressItem = addresses.find(element => element.name === crypto.coin)

			const address = addressItem.address || ""

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
						const itemToken: Balance = {
							coin: token.coin,
							balance: 0,
						}

						itemToken.balance = await getBalanceTokenETH(address, token.contract, token.decimals)

						balanceCrypto.tokens.push(itemToken)
					}
					break;
				}
				case "NEAR": {
					balanceCrypto.balance = await getBalanceNEAR(address)
					// for (let token of crypto.tokens) {
					// 	const itemToken: Balance = {
					// 		coin: token.coin,
					// 		balance: 0,
					// 	}

					// 	itemToken.balance = await getBalanceTokenETH(address, token.contract, token.decimals)

					// 	balanceCrypto.tokens.push(itemToken)
					// }
					break;
				}
				case "BNB": {
					if (!address) { balanceCrypto.balance = 0; break; }
					balanceCrypto.balance = await getBalanceBNB(address)
					for (let token of crypto.tokens) {
						const itemToken: Balance = {
							coin: token.coin,
							balance: 0,
						}

						itemToken.balance = await getBalanceTokenBSC(address, token.contract, token.decimals)

						balanceCrypto.tokens.push(itemToken)
					}
					break;
				}
				case "TRX": {
					if (!address) { balanceCrypto.balance = 0; break; }
					balanceCrypto.balance = await getBalanceTRON(address)
					for (let token of crypto.tokens) {
						const itemToken: Balance = {
							coin: token.coin,
							balance: 0,
						}

						itemToken.balance = await getBalanceTokenTRON(address, token.contract, token.decimals)

						balanceCrypto.tokens.push(itemToken)
					}
					break;
				}
				default: {
					//statements; 
					break;
				}
			}
			balances.push(balanceCrypto)
		}

		res.send(balances)

		balanceDataBaseFn(defixId, balances)
	} catch (error) {
		res.status(404).send()
	}
}

// UTILS

const balanceDataBaseFn = async (defixId: string, balances: BalanceCrypto[]) => {
	try {
		const conexion = await dbConnect();

		for (let balance of balances) {
			const resultado = await conexion.query("select * from balances where defix_id = $1 and blockchain = $2 and coin = $3", [defixId, balance.blockchain, balance.coin])

			if (resultado.rows.length === 0) {
				await conexion.query(`insert into balances
		 													(defix_id, blockchain, coin, balance)
		 													values ($1, $2, $3, $4)`, [defixId, balance.blockchain, balance.coin, balance.balance])

			} else {
				await conexion.query("update balances\
		 													set balance = $1 where\
		 													defix_id = $2 and blockchain = $3 and coin = $4 \
		 													", [balance.balance, defixId, balance.blockchain, balance.coin])
			}

			for (let token of balance.tokens) {
				const resultado = await conexion.query("select * from balances where defix_id = $1 and blockchain = $2 and coin = $3", [defixId, balance.blockchain, token.coin])

				if (resultado.rows.length === 0) {
					await conexion.query(`insert into balances
														 (defix_id, blockchain, coin, balance)
														 values ($1, $2, $3, $4)`, [defixId, balance.blockchain, token.coin, token.balance])
				} else {
					await conexion.query("update balances\
																 set balance = $1 where\
																 defix_id = $2 and blockchain = $3 and coin = $4 \
																 ", [token.balance, defixId, balance.blockchain, token.coin])
				}
			}
		}
	} catch (error) {
		console.log(error)
	};
};

export { getCryptos, getBalance }