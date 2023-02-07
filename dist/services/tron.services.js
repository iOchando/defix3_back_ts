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
exports.getBalanceTokenTRON = exports.getBalanceTRON = exports.isAddressTRON = exports.createWalletTRON = void 0;
const TronWeb = require('tronweb');
const HttpProvider = TronWeb.providers.HttpProvider;
const TRON_PRO_API_KEY = process.env.TRON_PRO_API_KEY;
const FULL_NODE = process.env.FULL_NODE;
const SOLIDITY_NODE = process.env.SOLIDITY_NODE;
const EVENT_SERVER = process.env.EVENT_SERVER;
const fullNode = new HttpProvider(FULL_NODE);
const solidityNode = new HttpProvider(SOLIDITY_NODE);
const eventServer = new HttpProvider(EVENT_SERVER);
const tronWeb = new TronWeb(fullNode, solidityNode, eventServer);
tronWeb.setHeader({ "TRON-PRO-API-KEY": TRON_PRO_API_KEY });
const createWalletTRON = (mnemonic) => __awaiter(void 0, void 0, void 0, function* () {
    const account = yield tronWeb.fromMnemonic(mnemonic);
    let privateKey;
    if (account.privateKey.indexOf('0x') === 0) {
        privateKey = account.privateKey.slice(2);
    }
    else {
        privateKey = account.privateKey;
    }
    const credential = {
        name: "TRON",
        address: account.address,
        privateKey: privateKey
    };
    return credential;
});
exports.createWalletTRON = createWalletTRON;
const isAddressTRON = (address) => __awaiter(void 0, void 0, void 0, function* () {
    const is_address = yield tronWeb.isAddress(address);
    return is_address;
});
exports.isAddressTRON = isAddressTRON;
const getBalanceTRON = (address) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let balanceTotal = 0;
        const balance = yield tronWeb.trx.getBalance(address);
        if (balance) {
            let value = Math.pow(10, 6);
            balanceTotal = balance / value;
            if (!balanceTotal) {
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
exports.getBalanceTRON = getBalanceTRON;
const getBalanceTokenTRON = (address, srcContract, decimals) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        tronWeb.setAddress(srcContract);
        const contract = yield tronWeb.contract().at(srcContract);
        const balance = yield contract.balanceOf(address).call();
        let balanceTotal = 0;
        if (balance) {
            let value = Math.pow(10, decimals);
            balanceTotal = balance / value;
            if (!balanceTotal) {
                balanceTotal = 0;
            }
            return balanceTotal;
        }
        else {
            return balanceTotal;
        }
    }
    catch (error) {
        return 0;
    }
});
exports.getBalanceTokenTRON = getBalanceTokenTRON;
