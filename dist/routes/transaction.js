"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const transaction_1 = require("../controllers/transaction");
const router = (0, express_1.Router)();
exports.router = router;
/**
 * Post track
 * @openapi
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
router.post('/transaction/', transaction_1.transaction);
