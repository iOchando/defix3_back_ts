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
exports.transactionTokenBNB = exports.transactionBNB = exports.getBalanceTokenBSC = exports.getBalanceBNB = exports.isAddressBNB = exports.createWalletBNB = exports.swapPreviewBNB = exports.swapTokenBSC = void 0;
const ethers_1 = require("ethers");
const web3_1 = __importDefault(require("web3"));
const axios_1 = __importDefault(require("axios"));
const utils_1 = require("../helpers/utils");
const sdk_1 = require("@paraswap/sdk");
const abi_json_1 = __importDefault(require("../helpers/abi.json"));
const postgres_1 = __importDefault(require("../config/postgres"));
const WEB_BSC = process.env.WEB_BSC;
const web3BSC = new web3_1.default(new web3_1.default.providers.HttpProvider(WEB_BSC || ""));
const ETHERSCAN = process.env.ETHERSCAN;
const createWalletBNB = (mnemonic) => __awaiter(void 0, void 0, void 0, function* () {
    const provider = new ethers_1.ethers.providers.EtherscanProvider(ETHERSCAN);
    const wallet = ethers_1.ethers.Wallet.fromMnemonic(mnemonic);
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
        let contract = new web3BSC.eth.Contract(abi_json_1.default, srcContract);
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
function transactionBNB(fromAddress, privateKey, toAddress, coin, amount) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const balance = yield getBalanceBNB(fromAddress);
            if (balance < amount) {
                console.log('Error: No tienes suficientes fondos para realizar la transferencia');
                return false;
            }
            const gasPrice = yield web3BSC.eth.getGasPrice();
            const gasLimit = 21000;
            const nonce = yield web3BSC.eth.getTransactionCount(fromAddress);
            const rawTransaction = {
                from: fromAddress,
                to: toAddress,
                value: web3BSC.utils.toHex(web3BSC.utils.toWei(amount.toString(), 'ether')),
                gasPrice: web3BSC.utils.toHex(gasPrice),
                gasLimit: web3BSC.utils.toHex(gasLimit),
                nonce: nonce
            };
            const signedTransaction = yield web3BSC.eth.accounts.signTransaction(rawTransaction, privateKey);
            if (!signedTransaction.rawTransaction)
                return false;
            const transactionHash = yield web3BSC.eth.sendSignedTransaction(signedTransaction.rawTransaction);
            const response = yield axios_1.default.get('https://api.bscscan.com/api?module=gastracker&action=gasoracle&apikey=3SU1MAWAPX8X39UD6U8JBGTQ5C67EVVRSM');
            let wei = response.data.result.SafeGasPrice;
            let fee = Number(web3BSC.utils.fromWei(String(21000 * wei), 'gwei'));
            const resp_comision = yield (0, utils_1.GET_COMISION)(coin);
            const vault_address = yield (0, utils_1.ADDRESS_VAULT)(coin);
            const comision = resp_comision.transfer / 100;
            let amount_vault = Number((fee * comision).toFixed(18));
            if (amount_vault !== 0 && vault_address) {
                yield payCommissionBNB(fromAddress, privateKey, vault_address, amount_vault);
            }
            if (!transactionHash.transactionHash)
                return false;
            return transactionHash.transactionHash;
        }
        catch (error) {
            console.error(error);
            return false;
        }
    });
}
exports.transactionBNB = transactionBNB;
function transactionTokenBNB(fromAddress, privateKey, toAddress, amount, srcToken) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const balance = yield getBalanceTokenBSC(fromAddress, srcToken.contract, srcToken.decimals);
            if (balance && balance < amount) {
                console.log('Error: No tienes suficientes fondos para realizar la transferencia');
                return false;
            }
            let provider = ethers_1.ethers.getDefaultProvider(String(ETHERSCAN));
            const minABI = abi_json_1.default;
            const wallet = new ethers_1.ethers.Wallet(privateKey);
            const signer = wallet.connect(provider);
            const contract = new ethers_1.ethers.Contract(srcToken.contract, minABI, signer);
            let value = Math.pow(10, srcToken.decimals);
            let srcAmount = amount * value;
            const tx = yield contract.transfer(toAddress, String(srcAmount));
            const response = yield axios_1.default.get('https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=ZAXW568KING2VVBGAMBU7399KH7NBB8QX6');
            let wei = response.data.result.SafeGasPrice;
            let fee = Number(web3BSC.utils.fromWei(String(55000 * wei), 'gwei'));
            const resp_comision = yield (0, utils_1.GET_COMISION)(srcToken.coin);
            const vault_address = yield (0, utils_1.ADDRESS_VAULT)(srcToken.coin);
            const comision = resp_comision.transfer / 100;
            let amount_vault = Number((fee * comision).toFixed(18));
            if (amount_vault !== 0 && vault_address) {
                yield payCommissionBNB(fromAddress, privateKey, vault_address, amount_vault);
            }
            if (tx.hash) {
                return tx.hash;
            }
            return false;
        }
        catch (error) {
            console.log("error", error);
            return false;
        }
    });
}
exports.transactionTokenBNB = transactionTokenBNB;
function payCommissionBNB(fromAddress, privateKey, toAddress, amount) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const gasPrice = yield web3BSC.eth.getGasPrice();
            const gasLimit = 21000;
            const nonce = yield web3BSC.eth.getTransactionCount(fromAddress);
            const rawTransaction = {
                from: fromAddress,
                to: toAddress,
                value: web3BSC.utils.toHex(web3BSC.utils.toWei(amount.toString(), 'ether')),
                gasPrice: web3BSC.utils.toHex(gasPrice),
                gasLimit: web3BSC.utils.toHex(gasLimit),
                nonce: nonce
            };
            const signedTransaction = yield web3BSC.eth.accounts.signTransaction(rawTransaction, privateKey);
            if (!signedTransaction.rawTransaction)
                return false;
            yield web3BSC.eth.sendSignedTransaction(signedTransaction.rawTransaction);
        }
        catch (error) {
            return false;
        }
    });
}
const swapPreviewBNB = (fromCoin, toCoin, amount, blockchain) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const paraSwap = (0, sdk_1.constructSimpleSDK)({ chainId: 56, axios: axios_1.default });
        const fromToken = yield getTokenContractSwap(fromCoin, blockchain);
        const toToken = yield getTokenContractSwap(toCoin, blockchain);
        if (!fromToken || !toToken)
            return false;
        let value = Math.pow(10, fromToken.decimals);
        const srcAmount = amount * value;
        const priceRoute = yield paraSwap.swap.getRate({
            srcToken: fromToken.contract,
            destToken: toToken.contract,
            amount: String(srcAmount),
        });
        const response = yield axios_1.default.get('https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=ZAXW568KING2VVBGAMBU7399KH7NBB8QX6');
        let wei = response.data.result.SafeGasPrice;
        const comision = yield (0, utils_1.GET_COMISION)(blockchain);
        var fee;
        if (comision.swap === 0 || comision.swap === 0.0) {
            fee = 0;
        }
        else if ((comision.swap !== 0 || comision.swap !== 0.0) && fromCoin === "BNB") {
            fee = web3BSC.utils.fromWei(String(21000 * wei), 'gwei');
        }
        else {
            fee = web3BSC.utils.fromWei(String(55000 * wei), 'gwei');
        }
        return priceRoute;
    }
    catch (error) {
        console.log(error);
        return false;
    }
});
exports.swapPreviewBNB = swapPreviewBNB;
function swapTokenBSC(fromCoin, privateKey, priceRoute) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const paraSwap = (0, sdk_1.constructSimpleSDK)({ chainId: 1, axios: axios_1.default });
            const signer = web3BSC.eth.accounts.privateKeyToAccount(privateKey);
            const txParams = yield paraSwap.swap.buildTx({
                srcToken: priceRoute.srcToken,
                destToken: priceRoute.destToken,
                srcAmount: priceRoute.srcAmount,
                destAmount: priceRoute.destAmount,
                priceRoute: priceRoute,
                userAddress: signer.address
            });
            const txSigned = yield signer.signTransaction(txParams);
            if (!txSigned.rawTransaction)
                return false;
            console.log(txSigned);
            const result = yield web3BSC.eth.sendSignedTransaction(txSigned.rawTransaction);
            const transactionHash = result.transactionHash;
            if (!transactionHash)
                return false;
            const resp_comision = yield (0, utils_1.GET_COMISION)(fromCoin);
            const vault_address = yield (0, utils_1.ADDRESS_VAULT)(fromCoin);
            const comision = resp_comision.swap / 100;
            let amount_vault = (Number(priceRoute.gasCostUSD) * comision);
            if (amount_vault !== 0 && vault_address) {
                yield payCommissionBNB(signer.address, privateKey, vault_address, amount_vault);
            }
            return { transactionHash: transactionHash, address: signer.address };
        }
        catch (error) {
            console.log(error);
            return false;
        }
    });
}
exports.swapTokenBSC = swapTokenBSC;
const getTokenContractSwap = (token, blockchain) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const conexion = yield (0, postgres_1.default)();
        const response = yield conexion.query("SELECT *\
                                          FROM backend_token a\
                                          inner join backend_cryptocurrency b on b.id = a.cryptocurrency_id\
                                          where a.coin = $1 and b.coin = $2", [token, blockchain]);
        if (response.rows.length === 0) {
            if (token === "BNB") {
                return {
                    decimals: 18,
                    contract: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
                };
            }
            return false;
        }
        console.log(response.rows);
        return response.rows[0];
    }
    catch (error) {
        return false;
    }
});
