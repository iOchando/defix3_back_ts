"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.getBalanceBTC_Cypher = exports.getBalanceBTC = exports.isAddressBTC = exports.createWalletBTC = void 0;
const bitcoinjs_lib_1 = require("bitcoinjs-lib");
const bip39_1 = require("bip39");
const WAValidator = require("wallet-address-validator");
const axios_1 = __importDefault(require("axios"));
const bip32_1 = __importDefault(require("bip32"));
const ecc = __importStar(require("tiny-secp256k1"));
const bip32 = (0, bip32_1.default)(ecc);
const NETWORK = process.env.NETWORK;
const createWalletBTC = (mnemonic) => __awaiter(void 0, void 0, void 0, function* () {
    // try {
    let network;
    let path;
    if (NETWORK === "mainnet") {
        network = bitcoinjs_lib_1.networks.bitcoin; //use networks.testnet networks.bitcoin for testnet
        path = `m/49'/0'/0'/0`; // Use m/49'/1'/0'/0 for testnet mainnet `m/49'/0'/0'/0
    }
    else {
        network = bitcoinjs_lib_1.networks.testnet;
        path = `m/49'/1/0'/0`;
    }
    const seed = (0, bip39_1.mnemonicToSeedSync)(mnemonic);
    const root = bip32.fromSeed(seed, network);
    const account = root.derivePath(path);
    const node = account.derive(0).derive(0);
    const btcAddress = bitcoinjs_lib_1.payments.p2pkh({
        pubkey: node.publicKey,
        network: network,
    }).address;
    const credential = {
        name: "BTC",
        address: btcAddress || "",
        privateKey: node.toWIF()
    };
    return credential;
});
exports.createWalletBTC = createWalletBTC;
const isAddressBTC = (address) => __awaiter(void 0, void 0, void 0, function* () {
    const is_address = WAValidator.validate(address, "BTC");
    return is_address;
});
exports.isAddressBTC = isAddressBTC;
const getBalanceBTC = (address) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const method = 'get';
        const url = "https://blockchain.info/q/addressbalance/" + address;
        const balance = yield axios_1.default[method](url, {
            headers: {
                'Content-Type': 'application/json',
            },
        }).then((response) => __awaiter(void 0, void 0, void 0, function* () {
            if (response.data || response.data === 0) {
                const satoshi = response.data;
                const value_satoshi = 100000000;
                const balance = (satoshi / value_satoshi) || 0;
                return balance;
            }
            ;
            const item = yield getBalanceBTC_Cypher(address);
            return item;
        })).catch((error) => __awaiter(void 0, void 0, void 0, function* () {
            const item = yield getBalanceBTC_Cypher(address);
            return item;
        }));
        return balance;
    }
    catch (error) {
        console.error(error);
        const item = yield getBalanceBTC_Cypher(address);
        return item;
    }
});
exports.getBalanceBTC = getBalanceBTC;
const getBalanceBTC_Cypher = (address) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const method = 'get';
        const url = 'https://api.blockcypher.com/v1/btc/' + process.env.BLOCKCYPHER + '/addrs/' + address + '/balance?token=' + "efe763283ba84fef88d23412be0c5970";
        const balance = yield axios_1.default[method](url, {
            headers: {
                'Content-Type': 'application/json',
            },
        }).then((response) => {
            if (response.data) {
                const satoshi = response.data.balance;
                const value_satoshi = 100000000;
                return (satoshi / value_satoshi) || 0;
            }
            ;
            return 0;
        }).catch((error) => {
            return 0;
        });
        return balance;
    }
    catch (error) {
        console.log(error);
        return 0;
    }
    ;
});
exports.getBalanceBTC_Cypher = getBalanceBTC_Cypher;
