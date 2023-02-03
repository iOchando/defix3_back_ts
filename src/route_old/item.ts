import { Request, Response, Router } from "express";
import {
  deleteItem,
  getItem,
  getItems,
  postItem,
  updateItem,
} from "../controllers/item";
import { logMiddleware } from "../middleware/log";

const router = Router();

/**
 * Post track
 * @openapi
 * /generate-mnemonic:
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
router.get("/", getItems);

router.get("/:id", logMiddleware, getItem);

router.post("/", postItem);

router.put("/:id", updateItem);

router.delete("/:id", deleteItem);

export { router };
