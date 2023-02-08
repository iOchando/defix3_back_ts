import { Request, Response } from "express";
import dbConnect from "../config/postgres";
import { validateDefixId, validateEmail, getAddressUser, saveTransaction } from "../helpers/utils";
import { encrypt, decrypt } from "../helpers/crypto";
import { generateMnemonic } from 'bip39';

import { createWalletBTC, isAddressBTC } from "../services/btc.services";
import { transactionETH } from "../services/eth.services";
import { transactionNEAR } from "../services/near.services";
import { createWalletTRON, isAddressTRON } from "../services/tron.services";
import { createWalletBNB, isAddressBNB } from "../services/bsc.services";

import { Wallet } from "../interfaces/wallet.interface";
import { Credential } from "../interfaces/credential.interface";

import { minAbi } from "../helpers/minabi";
import { EnvioCorreo, getEmailFlagFN } from "../helpers/mail";



async function Ejecutartransaction(req: Request, res: Response) {
  try {
    const { fromDefix, pkEncrypt, toDefix, coin, amount, blockchain } = req.body
    let transactionHash, fromAddress, toAddress, tipoEnvio;

    const privateKey = decrypt(pkEncrypt)

    if (!fromDefix || !privateKey || !toDefix || !coin || !amount || !blockchain) return res.status(400).send()

    if (fromDefix.includes(".defix3")) {
      fromAddress = await getAddressUser(fromDefix, blockchain)
    } else {
      fromAddress = fromDefix
    }

    if (toDefix.includes(".defix3")) {
      fromAddress = await getAddressUser(fromDefix, blockchain)
      tipoEnvio = "user"
    } else {
      toAddress = toDefix
      tipoEnvio = "wallet"
    }

    if (!fromAddress || !toAddress) return res.status(400).send()

    const srcContract = await getTokenContract(coin, blockchain)

    if (blockchain === "BTC") {
    //  transactionHash = await transactionBTC(fromDefix, fromAddress, privateKey, toDefix, toAddress, coin, amount, tipoEnvio)
    } else if (blockchain === "NEAR") {
      transactionHash = await transactionNEAR(fromAddress, privateKey, toAddress, coin, amount)
    } else if (blockchain === "ETH") {
      if (srcContract) {
       // transactionHash = await transactionTokenETH(fromDefix, fromAddress, privateKey, toDefix, toAddress, coin, amount, tipoEnvio)
      } else {
      //  transactionHash = await transactionETH(fromAddress, privateKey, toAddress, coin, amount)
      }
    } else if (blockchain === "TRON") {
      if (srcContract) {
       //  transactionHash = await transactionTokenTRON(fromDefix, fromAddress, privateKey, toDefix, toAddress, coin, amount, tipoEnvio)
      } else {
        // transactionHash = await transactionTRON(fromDefix, fromAddress, privateKey, toDefix, toAddress, coin, amount, tipoEnvio)
      }
    } else if (blockchain === "BNB") {
      // transactionHash = await transactionBNB(fromDefix, fromAddress, privateKey, toDefix, toAddress, coin, amount, tipoEnvio)
    } else {
      transactionHash = false
    }

    if (transactionHash) {
      const resSend = await getEmailFlagFN(fromDefix, 'SEND');
      const resReceive = await getEmailFlagFN(toDefix, 'RECEIVE');
      const item = {
        monto: amount,
        moneda: coin,
        receptor: toDefix,
        emisor: fromDefix,
        tipoEnvio: tipoEnvio
      };
      EnvioCorreo(resSend, resReceive, 'envio', item);
      
      const transaction = await saveTransaction(
        fromDefix,
        toDefix,
        coin,
        amount,
        fromAddress,
        toAddress,
        transactionHash as string,
        'TRANSFER'
      );
      await saveFrequent(fromDefix, toDefix)
      return res.send(transaction)
    }
    return res.status(500).send()
  } catch (error) {
    return res.status(500).send()
  }
}

async function saveFrequent(defixId: string, frequentUser: string) {
  try {
    const conexion = await dbConnect()

    const resultados = await conexion.query("select * \
                                              from frequent where \
                                              defix_id = $1 and frequent_user = $2\
                                              ", [defixId, frequentUser])

    if (resultados.rows.length === 0) {
      await conexion.query(`insert into frequent
              (defix_id, frequent_user)
              values ($1, $2)`, [defixId, frequentUser])
        .then(() => {
          return true
        }).catch(() => {
          return false
        })
    }
    return false
  } catch (error) {
    return false
  }
}

const getTokenContract = async (token: string, blockchain: string) => {
  try {
    const conexion = await dbConnect()
    const response = await conexion.query("SELECT *\
                                          FROM backend_token a\
                                          inner join backend_cryptocurrency b on b.id = a.cryptocurrency_id\
                                          where a.coin = $1 and b.coin = $2",
      [token, blockchain])

    if (response.rows.length === 0) return false
    return response.rows[0]
  } catch (error) {
    return false
  }
}

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