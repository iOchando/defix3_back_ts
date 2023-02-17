import { Request, Response, Router } from "express";
import { swapPreview} from "../controllers/swap";

const router = Router();

/**
 * @swagger
 * /swap-preview/:
 *    post:
 *      tags:
 *        - Swap
 *      summary: Obtiene el Preview del swap, Tasa de cambio, hash y monto recibido..
 *      description: Manda campos requeridos para obtener el priceRoute.
 *      requestBody:
 *          content:
 *            application/json:
 *              schema:
 *                type: "object"
 *                required: [fromCoin, toCoin, amount, blockchain]
 *                properties: {
 *                  fromCoin: {
 *                    type: "string"
 *                  },
 *                  toCoin: {
 *                    type: "string"
 *                  },
 *                  amount: {
 *                    type: "number"
 *                  },
 *                  blockchain: {
 *                    type: "string"
 *                  }
 *                }
 *      responses:
 *        '200':
 *          description: Devuelve el preview o priceRoute del swap a realizar. 
 *        '400':
 *          description: Bad Request.
 *        '500':
 *          description: Bad Request.
 */
router.post('/swap-preview/', swapPreview)

export { router };
