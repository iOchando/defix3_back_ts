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
exports.CONFIG = exports.validateDefixId = void 0;
const postgres_1 = __importDefault(require("../config/postgres"));
const NETWORK = process.env.NETWORK;
const validateDefixId = (defixId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const conexion = yield (0, postgres_1.default)();
        const resultados = yield conexion.query("select * \
                                            from users where \
                                            defix_id = $1\
                                            ", [defixId]);
        if (resultados.rows.length > 0) {
            return true;
        }
        return false;
    }
    catch (err) {
        console.log(err);
        return false;
    }
});
exports.validateDefixId = validateDefixId;
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
