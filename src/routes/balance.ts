import { Request, Response, Router } from "express";
import { getCryptos, getBalance } from "../controllers/balance";

const router = Router();

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
router.get("/get-cryptos", getCryptos);

router.post("/get-balance/", getBalance);

export { router };
