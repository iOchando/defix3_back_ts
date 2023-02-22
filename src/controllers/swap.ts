import { Request, Response } from "express";
import axios from "axios";
import { swapPreviewETH, swapTokenETH } from "../services/eth.services";
import { swapPreviewBNB, swapTokenBSC } from "../services/bsc.services";
import { decrypt } from "../helpers/crypto";
import { validation2FA } from "../helpers/2fa";
import { EnvioCorreo, getEmailFlagFN } from "../helpers/mail";
import { saveTransaction } from "../helpers/utils";

async function swapPreview(req: Request, res: Response) {
  try {
    const { fromCoin, toCoin, amount, blockchain } = req.body

    let priceRoute

    if (!fromCoin || !toCoin || !amount || !blockchain) return res.status(400).send()

    if (blockchain === "ETH") {
      priceRoute = await swapPreviewETH(fromCoin, toCoin, amount, blockchain)
      console.log(priceRoute)
    } else if (blockchain === "BNB") {
      priceRoute = await swapPreviewBNB(fromCoin, toCoin, amount, blockchain)
    } else {
      priceRoute = false
    }

    if (!priceRoute) return res.status(400).send()

    return res.send({ priceRoute: priceRoute })
  } catch (error) {
    return res.status(500).send()
  }
}

async function swapToken(req: Request, res: Response) {
  try {
    const { fromDefix, fromCoin, toCoin, pkEncrypt, priceRoute, blockchain, code } = req.body

    const privateKey = decrypt(pkEncrypt)

    if (!fromCoin || !toCoin || !fromDefix || !priceRoute || !privateKey || !blockchain || !code) return res.status(400).send()

    if (!await validation2FA(fromDefix, code)) return res.status(401).send()

    let swapHash: any
    if (blockchain === "ETH") {
      swapHash = await swapTokenETH(fromCoin, privateKey, priceRoute)
    } else if (blockchain === "BNB") {
      swapHash = await swapTokenBSC(fromCoin, privateKey, priceRoute)
    } else {
      swapHash = false
    }

    const resSend = await getEmailFlagFN(fromDefix, "DEX")
    const item = {
      user: fromDefix,
      montoA: priceRoute.srcAmount / Math.pow(10, priceRoute.srcDecimals),
      monedaA: fromCoin,
      montoB: priceRoute.destAmount / Math.pow(10, priceRoute.destDecimals),
      monedaB: toCoin
    }
    EnvioCorreo(resSend, null, "swap", item)

    let amountA = priceRoute.srcAmount / Math.pow(10, priceRoute.srcDecimals)

    let coin = fromCoin + "/" + toCoin

    if (!swapHash) return res.status(500).send()

    const transaction = await saveTransaction(
      fromDefix,
      fromDefix,
      coin,
      blockchain,
      amountA,
      swapHash.address,
      swapHash.address,
      swapHash as string,
      'DEX'
    );
    console.log(transaction)

    return res.send(transaction)
  } catch (error) {
    console.log(error)
    return res.status(500).send()
  }
}

const TronWeb = require('tronweb');
const HttpProvider = TronWeb.providers.HttpProvider;

const TRON_PRO_API_KEY = process.env.TRON_PRO_API_KEY;

const FULL_NODE = process.env.FULL_NODE;
const SOLIDITY_NODE = process.env.SOLIDITY_NODE;
const EVENT_SERVER = process.env.EVENT_SERVER;

const fullNode = new HttpProvider(FULL_NODE);
const solidityNode = new HttpProvider(SOLIDITY_NODE);
const eventServer = new HttpProvider(EVENT_SERVER);

const tronWeb = new TronWeb(fullNode, solidityNode, eventServer);
tronWeb.setHeader({ "TRON-PRO-API-KEY": TRON_PRO_API_KEY });

async function swapTron(req: Request, res: Response) {
  try {
    const inputTokenAddress = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t'; // USDT
    const outputTokenAddress = 'TEkxiTehnzSmSe2XqrBj4w32RUN966rdz8'; // USDC

    // Crear una instancia del contrato inteligente del intercambio (DEX)

    console.log("HOLA")
    tronWeb.setAddress("TSwPWGzz3tmzwUT6eDusX3tEkAcvxie9kz");
    const dexAddress = 'TSwPWGzz3tmzwUT6eDusX3tEkAcvxie9kz';
    const dexContract = await tronWeb.contract().at(dexAddress);

    console.log("DEX", dexContract)

    // Especificar los parámetros para la transacción de intercambio
    const inputAmount = 1000; // Cantidad de tokens de entrada a intercambiar
    const minOutputAmount = 900; // Cantidad mínima de tokens de salida esperados
    const userAddress = 'TCNYe4DjnoBQkScqYKa2wRPpjpgwMzwEaC'; // Dirección de la billetera del usuario
    const deadline = Math.floor(Date.now() / 1000) + 60 * 10; // Fecha de caducidad de la transacción (10 minutos)

    // Llamar a la función de intercambio del contrato inteligente
    await dexContract.swap(
      inputTokenAddress,
      outputTokenAddress,
      inputAmount,
      minOutputAmount,
      userAddress,
      { from: userAddress }
    );
  } catch (error) {
    console.log(error)
  }
}

export { swapPreview, swapToken, swapTron }