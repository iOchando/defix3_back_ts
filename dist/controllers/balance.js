"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCryptos = void 0;
const postgres_1 = __importDefault(require("../config/postgres"));
const btc_1 = require("../services/btc");
const eth_1 = require("../services/eth");
const NETWORK = process.env.NETWORK;
const getCryptos = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const conexion = yield (0, postgres_1.default)();
        const cryptocurrencys = yield conexion.query("select * from backend_cryptocurrency");
        const cryptos = [];
        for (let cryptocurrency of cryptocurrencys.rows) {
            const tokens = yield conexion.query("select * from backend_token where cryptocurrency_id = $1", [cryptocurrency.id]);
            cryptocurrency.tokens = tokens.rows;
            cryptos.push(cryptocurrency);
        }
        res.send(cryptos);
    }
    catch (error) {
        console.log(error);
        res.status(400).send();
    }
    ;
});
exports.getCryptos = getCryptos;
const getBalance = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { defixId } = req.body;
        const conexion = yield (0, postgres_1.default)();
        const resultados = yield conexion.query("select * \
																				from addresses where \
																				defix_id = $1\
																				", [defixId]);
        if (resultados.rows.length === 0)
            return res.status(405).send();
        const addresses = resultados.rows;
        const cryptos = yield getCryptosFn();
        const balances = [];
        for (let crypto of cryptos) {
            const address = addresses.find(element => element.name === crypto.coin);
            const balanceCrypto = {
                coin: crypto.coin,
                balance: 0,
                tokens: []
            };
            switch (crypto.coin) {
                case "BTC": {
                    if (NETWORK === "mainnet") {
                        balanceCrypto.balance = yield (0, btc_1.getBalanceBTC)(address);
                    }
                    else {
                        balanceCrypto.balance = yield (0, btc_1.getBalanceBTC_Cypher)(address);
                    }
                    break;
                }
                case "ETH": {
                    balanceCrypto.balance = yield (0, eth_1.getBalanceETH)(address);
                    for (let token of crypto.tokens) {
                        const itemToken = {
                            coin: token.coin,
                            balance: 0,
                        };
                        itemToken.balance = yield (0, eth_1.getBalanceTokenETH)(address, token.contract, token.decimals);
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
    }
    catch (error) {
        res.status(404).json();
    }
});
// UTILS
const getCryptosFn = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const conexion = yield (0, postgres_1.default)();
        const cryptocurrencys = yield conexion.query("select * from backend_cryptocurrency");
        const cryptos = [];
        for (let cryptocurrency of cryptocurrencys.rows) {
            const tokens = yield conexion.query("select * from backend_token where cryptocurrency_id = $1", [cryptocurrency.id]);
            cryptocurrency.tokens = tokens.rows;
            cryptos.push(cryptocurrency);
        }
        return cryptos;
    }
    catch (error) {
        console.log(error);
        return [];
    }
    ;
});
