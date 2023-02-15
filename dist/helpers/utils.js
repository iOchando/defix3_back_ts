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
exports.getCryptosFn = exports.ADDRESS_VAULT = exports.GET_COMISION = exports.validateEmail = exports.validateMnemonicDefix = exports.CONFIG = exports.validateDefixId = exports.getAddressUser = exports.saveTransaction = void 0;
const postgres_1 = __importDefault(require("../config/postgres"));
const near_services_1 = require("../services/near.services");
const axios_1 = __importDefault(require("axios"));
const user_entity_1 = require("../entities/user.entity");
const addresses_entity_1 = require("../entities/addresses.entity");
const NETWORK = process.env.NETWORK;
function saveTransaction(fromDefix, toDefix, coin, amount, fromAddress, toAddress, hash, tipo) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let date_ob = new Date();
            let date = ("0" + date_ob.getDate()).slice(-2);
            let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
            let year = date_ob.getFullYear();
            let hours = date_ob.getHours();
            let minutes = date_ob.getMinutes();
            let seconds = date_ob.getSeconds();
            let date_time = (year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds);
            let dateFech = (year + "-" + month + "-" + date);
            const conexion = yield (0, postgres_1.default)();
            const response = yield conexion.query(`insert into transactions
      (from_defix, from_address, to_defix, to_address, coin, value, date_time, date_fech ,date_year, date_month, hash, tipo)
      values
      ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`, [fromDefix, fromAddress, toDefix, toAddress, coin, String(amount), String(date_time), String(dateFech), String(year), String(month), hash, tipo])
                .then(() => {
                const transaction = {
                    from_defix: fromDefix,
                    from_address: fromAddress,
                    to_defix: toDefix,
                    to_address: toAddress,
                    coin: coin,
                    value: String(amount),
                    date_time: String(date_time),
                    date_fech: String(dateFech),
                    date_year: String(year),
                    date_month: String(month),
                    hash: hash,
                    tipo: tipo
                };
                return transaction;
            }).catch((error) => {
                return false;
            });
            return response;
        }
        catch (error) {
            return false;
        }
    });
}
exports.saveTransaction = saveTransaction;
function getAddressUser(defixId, blockchain) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const address = yield addresses_entity_1.Address.findOneBy({ user: { defix_id: defixId }, name: blockchain });
            if (!address)
                return false;
            return address.address;
        }
        catch (error) {
            return false;
        }
    });
}
exports.getAddressUser = getAddressUser;
const validateDefixId = (defixId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_entity_1.User.findOneBy({ defix_id: defixId });
        if (!user)
            return false;
        return true;
    }
    catch (err) {
        return false;
    }
});
exports.validateDefixId = validateDefixId;
const validateMnemonicDefix = (defixId, mnemonic) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_entity_1.User.findOneBy({ defix_id: defixId });
        if (!user)
            return false;
        const id = yield (0, near_services_1.getIdNear)(mnemonic);
        if (user.import_id === id) {
            return true;
        }
        return false;
    }
    catch (err) {
        return false;
    }
});
exports.validateMnemonicDefix = validateMnemonicDefix;
const validateEmail = (email) => {
    const regex = /\S+@\S+\.\S+/;
    return regex.test(email);
};
exports.validateEmail = validateEmail;
function CONFIG(keyStores) {
    switch (NETWORK) {
        case 'mainnet':
            return {
                networkId: 'mainnet',
                nodeUrl: 'https://rpc.mainnet.near.org',
                keyStore: keyStores,
                walletUrl: 'https://wallet.near.org',
                helperUrl: 'https://helper.mainnet.near.org',
                explorerUrl: 'https://explorer.mainnet.near.org'
            };
        case 'testnet':
            return {
                networkId: 'testnet',
                keyStore: keyStores,
                nodeUrl: 'https://rpc.testnet.near.org',
                walletUrl: 'https://wallet.testnet.near.org',
                helperUrl: 'https://helper.testnet.near.org',
                explorerUrl: 'https://explorer.testnet.near.org'
            };
        default:
            throw new Error(`Unconfigured environment '${NETWORK}'`);
    }
}
exports.CONFIG = CONFIG;
function ADDRESS_VAULT(coin) {
    switch (coin) {
        case 'BTC':
            return process.env.VAULT_BTC;
        case 'NEAR':
            return process.env.VAULT_NEAR;
        case 'ETH':
            return process.env.VAULT_ETH;
        case 'TRX':
            return process.env.VAULT_TRON;
        case 'BNB':
            return process.env.VAULT_BNB;
        default:
            throw new Error(`Unconfigured environment '${coin}'`);
    }
}
exports.ADDRESS_VAULT = ADDRESS_VAULT;
function GET_COMISION(coin) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const url = process.env.URL_DJANGO + "api/v1/get-comision/" + coin;
            const result = axios_1.default.get(url)
                .then(function (response) {
                return response.data;
            })
                .catch(function (xhr) {
                return false;
            });
            return result;
        }
        catch (error) {
            return false;
        }
    });
}
exports.GET_COMISION = GET_COMISION;
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
exports.getCryptosFn = getCryptosFn;
