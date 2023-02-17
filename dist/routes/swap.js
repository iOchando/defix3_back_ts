"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const swap_1 = require("../controllers/swap");
const router = (0, express_1.Router)();
exports.router = router;
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
router.post('/swap-preview/', swap_1.swapPreview);
