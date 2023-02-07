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
exports.setEmailSuscribe = void 0;
const postgres_1 = __importDefault(require("../config/postgres"));
const utils_1 = require("../helpers/utils");
function setEmailSuscribe(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { email } = req.body;
            var result;
            if (yield (0, utils_1.validateEmail)(email)) {
                const conexion = yield (0, postgres_1.default)();
                yield conexion.query(`insert into suscribe
                  (email)
                  values ($1)`, [email])
                    .then(() => {
                    result = true;
                }).catch(() => {
                    result = false;
                });
                res.send({ respuesta: "ok", data: result });
            }
            else {
                res.status(400).send();
            }
        }
        catch (error) {
            console.log(error);
            res.status(500).send();
        }
    });
}
exports.setEmailSuscribe = setEmailSuscribe;
