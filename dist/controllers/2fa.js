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
exports.status2faFn = exports.validarCode2fa = exports.status2fa = exports.desactivar2fa = exports.activar2fa = exports.generar2fa = void 0;
const postgres_1 = __importDefault(require("../config/postgres"));
const otplib_1 = require("otplib");
const qrcode_1 = __importDefault(require("qrcode"));
const utils_1 = require("../helpers/utils");
const crypto_1 = require("../helpers/crypto");
const generar2fa = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { defixId, seedPhrase } = req.body;
        const mnemonic = (0, crypto_1.decrypt)(seedPhrase);
        if (!mnemonic)
            return res.status(400).send();
        const validate = yield (0, utils_1.validateMnemonicDefix)(defixId, mnemonic);
        if (!validate)
            return res.status(400).send();
        const conexion = yield (0, postgres_1.default)();
        const resultados = yield conexion.query("select dosfa, secret from users where defix_id = $1", [defixId]);
        if (resultados.rowCount === 1) {
            switch (resultados.rows[0].dosfa) {
                case true:
                    {
                        res.json({ respuesta: "dosfa" });
                    }
                    break;
                case false:
                    {
                        if (resultados.rows[0].secret == null) {
                            const secret = otplib_1.authenticator.generateSecret();
                            yield conexion.query("update users set secret = $1 where defix_id = $2 ", [secret, defixId])
                                .then(() => {
                                let codigo = otplib_1.authenticator.keyuri(defixId, 'Defix3 App', secret);
                                qrcode_1.default.toDataURL(codigo, (err, url) => {
                                    if (err) {
                                        throw err;
                                    }
                                    res.json({ respuesta: "ok", qr: url, codigo: secret });
                                });
                            }).catch(() => {
                                res.status(500).json({ respuesta: "error en la base de datos" });
                            });
                        }
                        else {
                            let codigo = otplib_1.authenticator.keyuri(defixId, 'Defix3 App', resultados.rows[0].secret);
                            qrcode_1.default.toDataURL(codigo, (err, url) => {
                                if (err) {
                                    throw err;
                                }
                                res.json({ respuesta: "ok", qr: url, codigo: resultados.rows[0].secret });
                            });
                        }
                    }
                    break;
                default:
                    res.status(500).json({ respuesta: "error en el campo dosfa" });
                    break;
            }
        }
        else {
            res.status(500).json({ respuesta: "user no existe" });
        }
    }
    catch (error) {
        return res.status(500).json({ respuesta: error });
    }
});
exports.generar2fa = generar2fa;
const activar2fa = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { defixId, seedPhrase, code } = req.body;
        const mnemonic = (0, crypto_1.decrypt)(seedPhrase);
        if (!mnemonic)
            return res.status(400).send();
        const response = yield (0, utils_1.validateMnemonicDefix)(defixId, mnemonic);
        if (!response)
            return res.status(400).send();
        const conexion = yield (0, postgres_1.default)();
        const resultados = yield conexion.query("select dosfa, secret from users where defix_id = $1", [defixId]);
        if (resultados.rowCount === 1) {
            console.log(resultados.rows[0].secret);
            if (resultados.rows[0].secret != null) {
                var auth = otplib_1.authenticator.check(code.toString(), resultados.rows[0].secret);
                if (auth) {
                    yield conexion.query("update users set dosfa = true where defix_id = $1 ", [defixId])
                        .then(() => {
                        res.json({ respuesta: "ok" });
                    }).catch(() => {
                        res.status(500).json({ respuesta: "error en la base de datos" });
                    });
                }
                else {
                    res.json({ respuesta: "code" });
                }
            }
            else {
                res.json({ respuesta: "secret" });
            }
        }
    }
    catch (error) {
        return res.status(500).send();
    }
});
exports.activar2fa = activar2fa;
const desactivar2fa = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { defixId, code } = req.body;
    validarCode2fa(code, defixId).then((result) => __awaiter(void 0, void 0, void 0, function* () {
        switch (result) {
            case true:
                {
                    const conexion = yield (0, postgres_1.default)();
                    const resultados = yield conexion.query("select dosfa, secret from users where defix_id = $1", [defixId]);
                    if (resultados.rowCount === 1) {
                        if (resultados.rows[0].dosfa === true) {
                            yield conexion.query("update users set dosfa = false, secret = null where defix_id = $1 ", [defixId])
                                .then(() => {
                                res.json({ respuesta: "ok" });
                            }).catch(() => {
                                res.status(500).json({ respuesta: "error en la base de datos" });
                            });
                        }
                        else {
                            res.json({ respuesta: "ok" });
                        }
                    }
                }
                break;
            case false:
                {
                    res.json({ respuesta: "code" });
                }
                break;
            default:
                res.status(500).json({ respuesta: "error inesperado" });
                break;
        }
    }));
});
exports.desactivar2fa = desactivar2fa;
const status2fa = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { defixId } = req.body;
    status2faFn(defixId).then(result => {
        res.json(result);
    });
});
exports.status2fa = status2fa;
// UTILS
function validarCode2fa(code, defixId) {
    return __awaiter(this, void 0, void 0, function* () {
        const conexion = yield (0, postgres_1.default)();
        const resultados = yield conexion.query("select secret from users where defix_id = $1", [defixId]);
        if (resultados.rowCount === 1) {
            var auth = otplib_1.authenticator.check(String(code), resultados.rows[0].secret);
            return auth;
        }
        return null;
    });
}
exports.validarCode2fa = validarCode2fa;
function status2faFn(defixId) {
    return __awaiter(this, void 0, void 0, function* () {
        const conexion = yield (0, postgres_1.default)();
        const resultados = yield conexion.query("select dosfa from users where defix_id = $1", [defixId]);
        if (resultados.rowCount === 1) {
            return resultados.rows[0].dosfa;
        }
        return null;
    });
}
exports.status2faFn = status2faFn;
