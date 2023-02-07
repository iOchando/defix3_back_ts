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
exports.getBalanceBNB = exports.isAddressBNB = exports.createWalletBNB = void 0;
const ethers_1 = require("ethers");
const web3_1 = __importDefault(require("web3"));
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
        const item = { coin: "BNB", balance: 0 };
        let balance = yield web3BSC.eth.getBalance(address);
        if (balance) {
            let value = Math.pow(10, 18);
            item.balance = Number(balance) / value;
            if (item.balance === null) {
                item.balance = 0;
            }
            ;
            return item;
        }
        else {
            item.balance = 0;
            return item;
        }
    }
    catch (error) {
        console.error(error);
    }
    ;
});
exports.getBalanceBNB = getBalanceBNB;
