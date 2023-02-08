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
exports.getBalanceNEAR = exports.isAddressNEAR = exports.importWalletNEAR = exports.getIdNear = exports.createWalletNEAR = exports.transactionNEAR = void 0;
const near_api_js_1 = require("near-api-js");
const axios_1 = __importDefault(require("axios"));
const nearSEED = require("near-seed-phrase");
const utils_1 = require("../helpers/utils");
const types_1 = require("bitcoinjs-lib/src/types");
const NETWORK = process.env.NETWORK || 'testnet';
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
        let balanceTotal = 0;
        if (response) {
            const keyStore = new near_api_js_1.keyStores.InMemoryKeyStore();
            const near = new near_api_js_1.Near((0, utils_1.CONFIG)(keyStore));
            const account = new near_api_js_1.Account(near.connection, address);
            const balanceAccount = yield account.state();
            const valueStorage = Math.pow(10, 19);
            const valueYocto = Math.pow(10, 24);
            const storage = (balanceAccount.storage_usage * valueStorage) / valueYocto;
            balanceTotal = (Number(balanceAccount.amount) / valueYocto) - storage - 0.05;
            if (balanceTotal === null || balanceTotal < 0) {
                balanceTotal = 0;
            }
            ;
            return balanceTotal;
        }
        else {
            return balanceTotal;
        }
        ;
    }
    catch (error) {
        return 0;
    }
    ;
});
exports.getBalanceNEAR = getBalanceNEAR;
function transactionNEAR(fromAddress, privateKey, toAddress, coin, amount) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const balance_user = yield getBalanceNEAR(fromAddress);
            const keyStore = new near_api_js_1.keyStores.InMemoryKeyStore();
            const keyPair = near_api_js_1.KeyPair.fromString(privateKey);
            keyStore.setKey(NETWORK, fromAddress, keyPair);
            const near = new near_api_js_1.Near((0, utils_1.CONFIG)(keyStore));
            const account = new near_api_js_1.Account(near.connection, fromAddress);
            const resp_comision = yield (0, utils_1.GET_COMISION)(coin);
            const vault_address = yield (0, utils_1.ADDRESS_VAULT)(coin);
            const nearPrice = yield axios_1.default.get('https://nearblocks.io/api/near-price');
            const for_vault = resp_comision.transfer / nearPrice.data.usd;
            const amountInYocto = near_api_js_1.utils.format.parseNearAmount(String(amount));
            const for_vaultYocto = near_api_js_1.utils.format.parseNearAmount(String(for_vault));
            if (balance_user < amount + for_vault)
                return false;
            if (!amountInYocto)
                return false;
            const response = yield account.sendMoney(toAddress, (0, types_1.BufferN)(amountInYocto));
            if (for_vaultYocto !== '0' && vault_address && for_vaultYocto) {
                yield account.sendMoney(vault_address, (0, types_1.BufferN)(for_vaultYocto));
            }
            if (!response.transaction.hash)
                return false;
            return response.transaction.hash;
        }
        catch (error) {
            console.log(error);
            return false;
        }
    });
}
exports.transactionNEAR = transactionNEAR;
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
