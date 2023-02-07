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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBalanceNEAR = exports.isAddressNEAR = exports.importWalletNEAR = exports.getIdNear = exports.createWalletNEAR = void 0;
const near_api_js_1 = require("near-api-js");
// const { KeyPair } = nearAPI;
const nearSEED = require("near-seed-phrase");
const utils_1 = require("../helpers/utils");
const NETWORK = process.env.NETWORK;
const ETHERSCAN = process.env.ETHERSCAN;
const createWalletNEAR = (mnemonic) => __awaiter(void 0, void 0, void 0, function* () {
    const walletSeed = yield nearSEED.parseSeedPhrase(mnemonic);
    const keyPair = near_api_js_1.KeyPair.fromString(walletSeed.secretKey);
    const implicitAccountId = Buffer.from(keyPair.getPublicKey().data).toString('hex');
    const credential = {
        name: "NEAR",
        address: implicitAccountId,
        privateKey: walletSeed.secretKey
    };
    return credential;
});
exports.createWalletNEAR = createWalletNEAR;
const importWalletNEAR = (nearId, mnemonic) => __awaiter(void 0, void 0, void 0, function* () {
    const walletSeed = yield nearSEED.parseSeedPhrase(mnemonic);
    const credential = {
        name: "NEAR",
        address: nearId,
        privateKey: walletSeed.secretKey
    };
    return credential;
});
exports.importWalletNEAR = importWalletNEAR;
const getIdNear = (mnemonic) => __awaiter(void 0, void 0, void 0, function* () {
    const walletSeed = yield nearSEED.parseSeedPhrase(mnemonic);
    const split = String(walletSeed.publicKey).split(':');
    const id = String(split[1]);
    return id;
});
exports.getIdNear = getIdNear;
const isAddressNEAR = (address) => __awaiter(void 0, void 0, void 0, function* () {
    const keyStore = new near_api_js_1.keyStores.InMemoryKeyStore();
    const near = new near_api_js_1.Near((0, utils_1.CONFIG)(keyStore));
    const account = new near_api_js_1.Account(near.connection, address);
    const is_address = yield account.state()
        .then((response) => {
        return true;
    }).catch((error) => {
        return false;
    });
    return is_address;
});
exports.isAddressNEAR = isAddressNEAR;
const getBalanceNEAR = (address) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield validateNearId(address);
        if (response) {
            const keyStore = new near_api_js_1.keyStores.InMemoryKeyStore();
            const near = new near_api_js_1.Near((0, utils_1.CONFIG)(keyStore));
            const account = new near_api_js_1.Account(near.connection, address);
            const balanceAccount = yield account.state();
            const valueStorage = Math.pow(10, 19);
            const valueYocto = Math.pow(10, 24);
            const storage = (balanceAccount.storage_usage * valueStorage) / valueYocto;
            const item = {
                coin: "NEAR",
                balance: (Number(balanceAccount.amount) / valueYocto) - storage - 0.05
            };
            if (item.balance === null || item.balance < 0) {
                item.balance = 0;
            }
            ;
            return item;
        }
        else {
            return {
                coin: "NEAR",
                balance: 0
            };
        }
        ;
    }
    catch (error) {
        return {
            coin: "NEAR",
            balance: 0
        };
    }
    ;
});
exports.getBalanceNEAR = getBalanceNEAR;
const validateNearId = (address) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const keyStore = new near_api_js_1.keyStores.InMemoryKeyStore();
        const near = new near_api_js_1.Near((0, utils_1.CONFIG)(keyStore));
        const account = new near_api_js_1.Account(near.connection, address);
        const response = yield account.state()
            .then((response) => {
            return true;
        }).catch((error) => {
            return false;
        });
        return response;
    }
    catch (error) {
        return false;
    }
    ;
});
