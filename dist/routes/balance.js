"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const balance_1 = require("../controllers/balance");
const router = (0, express_1.Router)();
exports.router = router;
/**
 * Post track
 * @openapi
 * /generate-mnemonic/:
 *    post:
 *      tags:
 *        - Wallet
 *      summary: Obtener Mnemonic
 *      description: Te genera un Mnemonic si el usuario esta disponible
 *      requestBody:
 *          content:
 *            application/json:
 *              schema:
 *                type: "object"
 *                required: ["defixId"]
 *                properties: {
 *                  defixId: {
 *                    type: "string"
 *                  }
 *                }
 *      responses:
 *        '200':
 *          description: Si el usuario esta disponible responde un "ok" y el seedPhrase generado, si no "user".
 *          content:
 *            application/json:
 *              schema:
 *                type: "object"
 *                required: ["defixId"]
 *                properties: {
 *                  respuesta: {
 *                    type: "string"
 *                  },
 *                  mnemonic: {
 *                    type: "string"
 *                  }
 *                }
 *        '400':
 *          description: Bad Request.
 *        '500':
 *          description: Bad Request.
 */
router.get("/get-cryptos", balance_1.getCryptos);
router.post("/get-balance/", balance_1.getBalance);
