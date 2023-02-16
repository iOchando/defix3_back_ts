import { Request, Response } from "express";
import axios from "axios";
import { swapPreviewETH } from "../services/eth.services";
import { swapPreviewBNB } from "../services/bsc.services";

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

    return res.send({priceRoute: priceRoute})
  } catch (error) {
    return res.status(500).send()
  }
}

export { swapPreview }