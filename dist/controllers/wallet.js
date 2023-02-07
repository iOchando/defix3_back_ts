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
exports.getUsers = exports.validateAddress = exports.importFromMnemonic = exports.importWallet = exports.validateDefixIdAPI = exports.createWallet = exports.generateMnemonicAPI = void 0;
const postgres_1 = __importDefault(require("../config/postgres"));
const utils_1 = require("../helpers/utils");
const bip39_1 = require("bip39");
const btc_services_1 = require("../services/btc.services");
const eth_services_1 = require("../services/eth.services");
const near_services_1 = require("../services/near.services");
const tron_services_1 = require("../services/tron.services");
const bsc_services_1 = require("../services/bsc.services");
const generateMnemonicAPI = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { defixId } = req.body;
        if (!defixId || !defixId.includes(".defix3") || defixId.includes(" "))
            return res.status(400).send();
        const resp = yield (0, utils_1.validateDefixId)(defixId.toLowerCase());
        if (resp)
            return res.status(400).send();
        const mnemonic = yield (0, bip39_1.generateMnemonic)();
        res.send({ resp: "ok", mnemonic: mnemonic });
    }
    catch (err) {
        console.log(err);
        res.status(500).send({ err });
    }
});
exports.generateMnemonicAPI = generateMnemonicAPI;
const createWallet = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { defixId, mnemonic, email } = req.body;
        if (!defixId || !defixId.includes(".defix3") || defixId.includes(" ") || !mnemonic)
            return res.status(400).send();
        const exists = yield (0, utils_1.validateDefixId)(defixId.toLowerCase());
        if (!exists) {
            const credentials = [];
            credentials.push(yield (0, btc_services_1.createWalletBTC)(mnemonic));
            credentials.push(yield (0, eth_services_1.createWalletETH)(mnemonic));
            credentials.push(yield (0, near_services_1.createWalletNEAR)(mnemonic));
            credentials.push(yield (0, tron_services_1.createWalletTRON)(mnemonic));
            credentials.push(yield (0, bsc_services_1.createWalletBNB)(mnemonic));
            const wallet = {
                defixId: defixId,
                mnemonic: mnemonic,
                credentials: credentials
            };
            const nearId = yield (0, near_services_1.getIdNear)(mnemonic);
            const save = yield saveUser(nearId, wallet);
            if (save) {
                if (yield (0, utils_1.validateEmail)(email)) {
                    // EnviarPhraseCorreo(mnemonic, defixID.toLowerCase(), email)
                    console.log("envia correo");
                }
                return res.send(wallet);
            }
            return res.status(400).send();
        }
        res.status(405).send();
    }
    catch (err) {
        console.log(err);
        res.status(500).send({ err });
    }
});
exports.createWallet = createWallet;
const importWallet = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { mnemonic } = req.body;
        if (!mnemonic)
            return res.status(400).send();
        const nearId = yield (0, near_services_1.getIdNear)(mnemonic);
        const conexion = yield (0, postgres_1.default)();
        const response = yield conexion.query("select * \
																					from users where \
																					import_id = $1\
																					", [nearId]);
        if (response.rows.length === 0)
            return res.status(400).send();
        let responseAccount = response.rows[0];
        const defixId = responseAccount.defix_id;
        const addressNEAR = yield conexion.query("select * \
																					from addresses where \
																					defix_id = $1 and name = 'NEAR'\
																					", [defixId]);
        const nearAddress = addressNEAR.rows[0].address;
        const credentials = [];
        credentials.push(yield (0, btc_services_1.createWalletBTC)(mnemonic));
        credentials.push(yield (0, eth_services_1.createWalletETH)(mnemonic));
        credentials.push(yield (0, near_services_1.importWalletNEAR)(nearAddress, mnemonic));
        credentials.push(yield (0, tron_services_1.createWalletTRON)(mnemonic));
        credentials.push(yield (0, bsc_services_1.createWalletBNB)(mnemonic));
        const wallet = {
            defixId: defixId,
            mnemonic: mnemonic,
            credentials: credentials
        };
        const addressTRON = yield conexion.query("select * \
																					from addresses where \
																					defix_id = $1 and name = 'TRON'\
																					", [defixId]);
        // Crypto news
        if (addressTRON.rows.length === 0) {
            console.log("NO TIENE CUENTRA TRON");
            const addresstron = credentials.find(element => element.name === 'TRON');
            if (addresstron) {
                yield conexion.query(`insert into addresses
																	(defix_id, name, address)
																	values ($1, $2, $3)`, [defixId, 'TRON', addresstron.address]);
            }
        }
        const addressBNB = yield conexion.query("select * \
																					from addresses where \
																					defix_id = $1 and name = 'BNB'\
																					", [defixId]);
        if (addressBNB.rows.length === 0) {
            console.log("NO TIENE CUENTRA BNB");
            const addressbnb = credentials.find(element => element.name === 'BNB');
            if (addressbnb) {
                yield conexion.query(`insert into addresses
																	(defix_id, name, address)
																	values ($1, $2, $3)`, [defixId, 'BNB', addressbnb.address]);
            }
        }
        // End
        const resultados = yield conexion.query("select * \
																									from users where \
																									defix_id = $1\
																									", [defixId]);
        if (resultados.rows.length === 0) {
            yield conexion.query(`insert into users
									(defix_id, dosfa, secret, import_id)
									values ($1, false, null, $2)`, [defixId, nearId]);
        }
        let result;
        yield conexion.query("update users\
															set close_sessions = $1 where\
															defix_id = $2\
															", [false, defixId])
            .then(() => {
            result = true;
        }).catch(() => {
            result = false;
        });
        if (!result)
            return res.status(400).send();
        res.send(wallet);
    }
    catch (error) {
        res.status(400).send();
    }
});
exports.importWallet = importWallet;
const importFromMnemonic = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { defixId, mnemonic } = req.body;
        if (!defixId || !defixId.includes(".defix3") || defixId.includes(" ") || !mnemonic)
            return res.status(400).send();
        const exists = yield (0, utils_1.validateDefixId)(defixId.toLowerCase());
        if (!exists) {
            const credentials = [];
            credentials.push(yield (0, btc_services_1.createWalletBTC)(mnemonic));
            credentials.push(yield (0, eth_services_1.createWalletETH)(mnemonic));
            credentials.push(yield (0, near_services_1.createWalletNEAR)(mnemonic));
            credentials.push(yield (0, tron_services_1.createWalletTRON)(mnemonic));
            credentials.push(yield (0, bsc_services_1.createWalletBNB)(mnemonic));
            const wallet = {
                defixId: defixId,
                mnemonic: mnemonic,
                credentials: credentials
            };
            const nearId = yield (0, near_services_1.getIdNear)(mnemonic);
            const save = yield saveUser(nearId, wallet);
            if (save) {
                return res.send(wallet);
            }
            return res.status(400).send();
        }
        res.status(405).send();
    }
    catch (err) {
        console.log(err);
        res.status(500).send({ err });
    }
});
exports.importFromMnemonic = importFromMnemonic;
const getUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const conexion = yield (0, postgres_1.default)();
        const response = yield conexion.query("select defix_id \
																					from users");
        res.send(response.rows);
    }
    catch (error) {
        res.status(400).send(error);
    }
    ;
});
exports.getUsers = getUsers;
// UTILS
const validateAddress = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { address, coin } = req.body;
        if (!address || !coin)
            return res.status(400).send();
        if (coin === 'BTC') {
            return res.send(yield (0, btc_services_1.isAddressBTC)(address));
        }
        else if (coin === 'NEAR') {
            return res.send(yield (0, near_services_1.isAddressNEAR)(address));
        }
        else if (coin === 'ETH') {
            return res.send(yield (0, eth_services_1.isAddressETH)(address));
        }
        else if (coin === 'BNB') {
            return res.send(yield (0, bsc_services_1.isAddressBNB)(address));
        }
        else if (coin === 'TRON') {
            return res.send(yield (0, tron_services_1.isAddressTRON)(address));
        }
        res.status(400).send();
    }
    catch (error) {
        res.status(400).send({ "error": error });
    }
});
exports.validateAddress = validateAddress;
const saveUser = (nearId, wallet) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const conexion = yield (0, postgres_1.default)();
        const result = yield conexion.query(`insert into users
				(defix_id, dosfa, secret, import_id)
				values ($1, false, null, $2)`, [wallet.defixId, nearId])
            .then(() => __awaiter(void 0, void 0, void 0, function* () {
            for (let credential of wallet.credentials) {
                yield conexion.query(`insert into addresses
														(defix_id, name, address)
														values ($1, $2, $3)`, [wallet.defixId, credential.name, credential.address]);
            }
            return true;
        })).catch(() => {
            return false;
        });
        if (result)
            return true;
        return false;
    }
    catch (error) {
        return false;
    }
});
const validateDefixIdAPI = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { defixId } = req.body;
        if (!defixId || !defixId.includes(".defix3") || defixId.includes(" "))
            return res.status(400).send();
        const resp = yield (0, utils_1.validateDefixId)(defixId.toLowerCase());
        res.send(resp);
    }
    catch (err) {
        console.log(err);
        res.status(500).send({ err });
    }
});
exports.validateDefixIdAPI = validateDefixIdAPI;
