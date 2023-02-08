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
const postgres_1 = __importDefault(require("../config/postgres"));
const utils_1 = require("../helpers/utils");
const crypto_1 = require("../helpers/crypto");
const near_services_1 = require("../services/near.services");
const mail_1 = require("../helpers/mail");
function Ejecutartransaction(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { fromDefix, pkEncrypt, toDefix, coin, amount, blockchain } = req.body;
            let transactionHash, fromAddress, toAddress, tipoEnvio;
            const privateKey = (0, crypto_1.decrypt)(pkEncrypt);
            if (!fromDefix || !privateKey || !toDefix || !coin || !amount || !blockchain)
                return res.status(400).send();
            if (fromDefix.includes(".defix3")) {
                fromAddress = yield (0, utils_1.getAddressUser)(fromDefix, blockchain);
            }
            else {
                fromAddress = fromDefix;
            }
            if (toDefix.includes(".defix3")) {
                fromAddress = yield (0, utils_1.getAddressUser)(fromDefix, blockchain);
                tipoEnvio = "user";
            }
            else {
                toAddress = toDefix;
                tipoEnvio = "wallet";
            }
            if (!fromAddress || !toAddress)
                return res.status(400).send();
            const srcContract = yield getTokenContract(coin, blockchain);
            if (blockchain === "BTC") {
                //  transactionHash = await transactionBTC(fromDefix, fromAddress, privateKey, toDefix, toAddress, coin, amount, tipoEnvio)
            }
            else if (blockchain === "NEAR") {
                transactionHash = yield (0, near_services_1.transactionNEAR)(fromAddress, privateKey, toAddress, coin, amount);
            }
            else if (blockchain === "ETH") {
                if (srcContract) {
                    // transactionHash = await transactionTokenETH(fromDefix, fromAddress, privateKey, toDefix, toAddress, coin, amount, tipoEnvio)
                }
                else {
                    //  transactionHash = await transactionETH(fromAddress, privateKey, toAddress, coin, amount)
                }
            }
            else if (blockchain === "TRON") {
                if (srcContract) {
                    //  transactionHash = await transactionTokenTRON(fromDefix, fromAddress, privateKey, toDefix, toAddress, coin, amount, tipoEnvio)
                }
                else {
                    // transactionHash = await transactionTRON(fromDefix, fromAddress, privateKey, toDefix, toAddress, coin, amount, tipoEnvio)
                }
            }
            else if (blockchain === "BNB") {
                // transactionHash = await transactionBNB(fromDefix, fromAddress, privateKey, toDefix, toAddress, coin, amount, tipoEnvio)
            }
            else {
                transactionHash = false;
            }
            if (transactionHash) {
                const resSend = yield (0, mail_1.getEmailFlagFN)(fromDefix, 'SEND');
                const resReceive = yield (0, mail_1.getEmailFlagFN)(toDefix, 'RECEIVE');
                const item = {
                    monto: amount,
                    moneda: coin,
                    receptor: toDefix,
                    emisor: fromDefix,
                    tipoEnvio: tipoEnvio
                };
                (0, mail_1.EnvioCorreo)(resSend, resReceive, 'envio', item);
                const transaction = yield (0, utils_1.saveTransaction)(fromDefix, toDefix, coin, amount, fromAddress, toAddress, transactionHash, 'TRANSFER');
                yield saveFrequent(fromDefix, toDefix);
                return res.send(transaction);
            }
            return res.status(500).send();
        }
        catch (error) {
            return res.status(500).send();
        }
    });
}
function saveFrequent(defixId, frequentUser) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const conexion = yield (0, postgres_1.default)();
            const resultados = yield conexion.query("select * \
                                              from frequent where \
                                              defix_id = $1 and frequent_user = $2\
                                              ", [defixId, frequentUser]);
            if (resultados.rows.length === 0) {
                yield conexion.query(`insert into frequent
              (defix_id, frequent_user)
              values ($1, $2)`, [defixId, frequentUser])
                    .then(() => {
                    return true;
                }).catch(() => {
                    return false;
                });
            }
            return false;
        }
        catch (error) {
            return false;
        }
    });
}
const getTokenContract = (token, blockchain) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const conexion = yield (0, postgres_1.default)();
        const response = yield conexion.query("SELECT *\
                                          FROM backend_token a\
                                          inner join backend_cryptocurrency b on b.id = a.cryptocurrency_id\
                                          where a.coin = $1 and b.coin = $2", [token, blockchain]);
        if (response.rows.length === 0)
            return false;
        return response.rows[0];
    }
    catch (error) {
        return false;
    }
});
// const transaction = async (req, res) => {
//   const { fromDefix } = req.body
//   status2fa(fromDefix).then((respStatus) => {
//     switch (respStatus) {
//       case true: {
//         const { code } = req.body;
//         validarCode2fa(code, fromDefix).then((respValidacion) => {
//           console.log(respValidacion);
//           switch (respValidacion) {
//             case true: {
//               return Ejecutartransaction(req, res);
//             }
//             case false: {
//               res.json({ respuesta: "code" });
//             }
//               break;
//             default: res.status(500).json({ respuesta: "Error interno del sistema" })
//               break;
//           }
//         })
//       }
//         break;
//       case false: {
//         return Ejecutartransaction(req, res);
//       }
//       default: res.status(500).json({ respuesta: "Error interno del sistema" })
//         break;
//     }
//   })
// }
