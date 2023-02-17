import { Request, Response, Router } from "express";
import { transaction, getTransactionHistory } from "../controllers/transaction";

const router = Router();

/**
 * @swagger
 * /transaction/:
 *    post:
 *      tags:
 *        - Transaction
 *      summary: Hacer Transaccion.
 *      description: Manda campos requeridos para hacer una transaction.
 *      requestBody:
 *          content:
 *            application/json:
 *              schema:
 *                type: "object"
 *                required: [defixId, seedPhrase]
 *                properties: {
 *                  defixId: {
 *                    type: "string"
 *                  },
 *                  pkEncrypt: {
 *                    type: "string"
 *                  },
 *                  toDefix: {
 *                    type: "string"
 *                  },
 *                  coin: {
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
 *          description: Devuelve la transaccion realizada. 
 *        '400':
 *          description: Bad Request.
 *        '500':
 *          description: Bad Request.
 */
router.post('/transaction/', transaction)

router.post('/transaction-history/', getTransactionHistory)

export { router };
