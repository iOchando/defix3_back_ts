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
exports.getBalanceTokenBSC = exports.getBalanceBNB = exports.isAddressBNB = exports.createWalletBNB = void 0;
const ethers_1 = require("ethers");
const web3_1 = __importDefault(require("web3"));
const minabi_1 = require("../helpers/minabi");
const WEB_BSC = process.env.WEB_BSC;
const web3BSC = new web3_1.default(new web3_1.default.providers.HttpProvider(WEB_BSC || ""));
const ETHERSCAN = process.env.ETHERSCAN;
const createWalletBNB = (mnemonic) => __awaiter(void 0, void 0, void 0, function* () {
    const provider = new ethers_1.ethers.EtherscanProvider(ETHERSCAN);
    const wallet = ethers_1.ethers.Wallet.fromPhrase(mnemonic);
    const credential = {
        name: "BNB",
        address: wallet.address,
        privateKey: wallet.privateKey
    };
    return credential;
});
exports.createWalletBNB = createWalletBNB;
const isAddressBNB = (address) => __awaiter(void 0, void 0, void 0, function* () {
    const is_address = yield web3BSC.utils.isAddress(address);
    return is_address;
});
exports.isAddressBNB = isAddressBNB;
const getBalanceBNB = (address) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let balanceTotal = 0;
        let balance = yield web3BSC.eth.getBalance(address);
        if (balance) {
            let value = Math.pow(10, 18);
            balanceTotal = Number(balance) / value;
            if (!balanceTotal) {
                balanceTotal = 0;
            }
            ;
            return balanceTotal;
        }
        else {
            return balanceTotal;
        }
    }
    catch (error) {
        console.error(error);
        return 0;
    }
    ;
});
exports.getBalanceBNB = getBalanceBNB;
const getBalanceTokenBSC = (address, srcContract, decimals) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const minABI = (0, minabi_1.minAbi)();
        let contract = new web3BSC.eth.Contract(minABI, srcContract);
        const balance = yield contract.methods.balanceOf(address).call();
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
exports.getBalanceTokenBSC = getBalanceTokenBSC;
