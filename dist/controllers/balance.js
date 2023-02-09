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
exports.getBalance = exports.getCryptos = void 0;
const postgres_1 = __importDefault(require("../config/postgres"));
const utils_1 = require("../helpers/utils");
const btc_services_1 = require("../services/btc.services");
const eth_services_1 = require("../services/eth.services");
const near_services_1 = require("../services/near.services");
const tron_services_1 = require("../services/tron.services");
const bsc_services_1 = require("../services/bsc.services");
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
        const cryptos = yield (0, utils_1.getCryptosFn)();
        const balances = [];
        for (let crypto of cryptos) {
            const balanceCrypto = {
                coin: crypto.coin,
                blockchain: crypto.blockchain,
                balance: 0,
                tokens: []
            };
            const addressItem = addresses.find(element => element.name === crypto.coin);
            const address = addressItem.address || "";
            switch (crypto.coin) {
                case "BTC": {
                    if (NETWORK === "mainnet") {
                        balanceCrypto.balance = yield (0, btc_services_1.getBalanceBTC)(address);
                    }
                    else {
                        balanceCrypto.balance = yield (0, btc_services_1.getBalanceBTC_Cypher)(address);
                    }
                    break;
                }
                case "ETH": {
                    balanceCrypto.balance = yield (0, eth_services_1.getBalanceETH)(address);
                    for (let token of crypto.tokens) {
                        const itemToken = {
                            coin: token.coin,
                            balance: 0,
                        };
                        itemToken.balance = yield (0, eth_services_1.getBalanceTokenETH)(address, token.contract, token.decimals);
                        balanceCrypto.tokens.push(itemToken);
                    }
                    break;
                }
                case "NEAR": {
                    balanceCrypto.balance = yield (0, near_services_1.getBalanceNEAR)(address);
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
                    if (!address) {
                        balanceCrypto.balance = 0;
                        break;
                    }
                    balanceCrypto.balance = yield (0, bsc_services_1.getBalanceBNB)(address);
                    for (let token of crypto.tokens) {
                        const itemToken = {
                            coin: token.coin,
                            balance: 0,
                        };
                        itemToken.balance = yield (0, bsc_services_1.getBalanceTokenBSC)(address, token.contract, token.decimals);
                        balanceCrypto.tokens.push(itemToken);
                    }
                    break;
                }
                case "TRX": {
                    if (!address) {
                        balanceCrypto.balance = 0;
                        break;
                    }
                    balanceCrypto.balance = yield (0, tron_services_1.getBalanceTRON)(address);
                    for (let token of crypto.tokens) {
                        const itemToken = {
                            coin: token.coin,
                            balance: 0,
                        };
                        itemToken.balance = yield (0, tron_services_1.getBalanceTokenTRON)(address, token.contract, token.decimals);
                        balanceCrypto.tokens.push(itemToken);
                    }
                    break;
                }
                default: {
                    //statements; 
                    break;
                }
            }
            balances.push(balanceCrypto);
        }
        res.send(balances);
        balanceDataBaseFn(defixId, balances);
    }
    catch (error) {
        res.status(404).send();
    }
});
exports.getBalance = getBalance;
// UTILS
const balanceDataBaseFn = (defixId, balances) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const conexion = yield (0, postgres_1.default)();
        for (let balance of balances) {
            const resultado = yield conexion.query("select * from balances where defix_id = $1 and blockchain = $2 and coin = $3", [defixId, balance.blockchain, balance.coin]);
            if (resultado.rows.length === 0) {
                yield conexion.query(`insert into balances
		 													(defix_id, blockchain, coin, balance)
		 													values ($1, $2, $3, $4)`, [defixId, balance.blockchain, balance.coin, balance.balance]);
            }
            else {
                yield conexion.query("update balances\
		 													set balance = $1 where\
		 													defix_id = $2 and blockchain = $3 and coin = $4 \
		 													", [balance.balance, defixId, balance.blockchain, balance.coin]);
            }
            for (let token of balance.tokens) {
                const resultado = yield conexion.query("select * from balances where defix_id = $1 and blockchain = $2 and coin = $3", [defixId, balance.blockchain, token.coin]);
                if (resultado.rows.length === 0) {
                    yield conexion.query(`insert into balances
														 (defix_id, blockchain, coin, balance)
														 values ($1, $2, $3, $4)`, [defixId, balance.blockchain, token.coin, token.balance]);
                }
                else {
                    yield conexion.query("update balances\
																 set balance = $1 where\
																 defix_id = $2 and blockchain = $3 and coin = $4 \
																 ", [token.balance, defixId, balance.blockchain, token.coin]);
                }
            }
        }
    }
    catch (error) {
        console.log(error);
    }
    ;
});
