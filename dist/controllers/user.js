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
exports.getEmailData = exports.setEmailData = exports.closeAllSessions = exports.getCloseAllSesions = void 0;
const postgres_1 = __importDefault(require("../config/postgres"));
const utils_1 = require("../helpers/utils");
const _2fa_1 = require("./2fa");
const crypto_1 = require("../helpers/crypto");
const setEmailData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { defixId } = req.body;
    (0, _2fa_1.status2faFn)(defixId).then((respStatus) => {
        switch (respStatus) {
            case true:
                {
                    const { code } = req.body;
                    (0, _2fa_1.validarCode2fa)(code, defixId).then((respValidacion) => {
                        console.log(respValidacion);
                        switch (respValidacion) {
                            case true: {
                                return EjecutarsetEmailData(req, res);
                            }
                            case false:
                                {
                                    res.json({ respuesta: "code" });
                                }
                                break;
                            default:
                                res.status(500).json({ respuesta: "Error interno del sistema" });
                                break;
                        }
                    });
                }
                break;
            case false: {
                return EjecutarsetEmailData(req, res);
            }
            default:
                res.status(500).json({ respuesta: "Error interno del sistema" });
                break;
        }
    });
});
exports.setEmailData = setEmailData;
function EjecutarsetEmailData(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { defixId, seedPhrase, email, flag_send, flag_receive, flag_dex, flag_fiat, name, last_name, legal_document, type_document } = req.body;
            const mnemonic = (0, crypto_1.decrypt)(seedPhrase);
            if (!mnemonic)
                return res.status(400).send();
            const response = yield (0, utils_1.validateMnemonicDefix)(defixId, mnemonic);
            var result;
            if (legal_document == !null) {
                if (type_document == !"v" && type_document == !"j") {
                    return res.status(204).json({ respuesta: "Error tipo de documento" });
                }
            }
            if (!response)
                return res.status(400).send();
            const conexion = yield (0, postgres_1.default)();
            yield conexion.query("update users\
                                set email = $1, flag_send = $2, flag_receive = $3, flag_dex = $4, flag_fiat = $5, name = $6, last_name = $7, legal_document = $8, type_document=$9 where\
                                defix_id = $10\
                                ", [email, flag_send, flag_receive, flag_dex, flag_fiat, name, last_name, legal_document, type_document, defixId])
                .then(() => {
                result = true;
            }).catch(() => {
                result = false;
            });
            return res.json({ respuesta: "ok", data: result });
        }
        catch (error) {
            return res.status(500).send();
        }
    });
}
const getEmailData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { defixId } = req.body;
        const response = yield (0, utils_1.validateDefixId)(defixId);
        if (!response)
            return res.status(400).send();
        const conexion = yield (0, postgres_1.default)();
        const resultados = yield conexion.query("select email, flag_send, flag_receive, flag_dex, flag_fiat, name, last_name, legal_document, type_document, dosfa \
                                                    from users where \
                                                    defix_id = $1\
                                                    ", [defixId]);
        res.send(resultados.rows[0]);
    }
    catch (error) {
        return res.status(500).send();
    }
});
exports.getEmailData = getEmailData;
const closeAllSessions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { defixId, seedPhrase } = req.body;
        const mnemonic = (0, crypto_1.decrypt)(seedPhrase);
        if (!mnemonic)
            return res.status(400).send();
        const response = yield (0, utils_1.validateMnemonicDefix)(defixId, mnemonic);
        if (!response)
            return res.status(400).send();
        var result;
        const conexion = yield (0, postgres_1.default)();
        yield conexion.query("update users\
															set close_sessions = $1 where\
															defix_id = $2\
															", [true, defixId])
            .then(() => {
            result = true;
        }).catch(() => {
            result = false;
        });
        res.json(result);
    }
    catch (error) {
        return res.status(500).send();
    }
});
exports.closeAllSessions = closeAllSessions;
const getCloseAllSesions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { defixId } = req.body;
        const response = yield (0, utils_1.validateDefixId)(defixId);
        if (!response)
            return res.status(400).send();
        const conexion = yield (0, postgres_1.default)();
        const resultados = yield conexion.query("select close_sessions \
																									from users where \
																									defix_id = $1\
																									", [defixId]);
        res.send(resultados.rows[0].close_sessions);
    }
    catch (error) {
        return res.status(500).send();
    }
});
exports.getCloseAllSesions = getCloseAllSesions;
