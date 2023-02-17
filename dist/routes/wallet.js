"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const wallet_1 = require("../controllers/wallet");
const router = (0, express_1.Router)();
exports.router = router;
router.post("/encrypt/", wallet_1.encryptAPI);
wallet_1.importFromPK;
router.post("/import-from-pk/", wallet_1.importFromPK);
/**
 * Post track
 * @swagger
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
router.post("/generate-mnemonic/", wallet_1.generateMnemonicAPI);
/**
 * Post track
 * @swagger
 * /create-wallet/:
 *    post:
 *      tags:
 *        - Wallet
 *      summary: Crear wallet Defix3
 *      description: Te registra y crea una wallet Defix3 con todos los address de las blockchains admitidas.
 *      requestBody:
 *          content:
 *            application/json:
 *              schema:
 *                type: "object"
 *                required: [defixId, mnemonic]
 *                properties: {
 *                  defixId: {
 *                    type: "string"
 *                  },
 *                  mnemonic: {
 *                    type: "string"
 *                  },
 *                  email: {
 *                    type: "string"
 *                  },
 *                }
 *      responses:
 *        '200':
 *          description: Responde un Json con todas las credenciales y address de la wallet.
 *        '204':
 *          description: Bad Request.
 *        '400':
 *          description: Bad Request.
 *        '500':
 *          description: Bad Request.
 */
router.post("/create-wallet/", wallet_1.createWallet);
/**
 * Post track
 * @swagger
 * /import-wallet/:
 *    post:
 *      tags:
 *        - Wallet
 *      summary: Iniciar Sesion con wallet Defix3
 *      description: Ingresa el seedPhrase y te devuelve el username defix3 y las credenciales de la wallet.
 *      requestBody:
 *          content:
 *            application/json:
 *              schema:
 *                type: "object"
 *                required: [mnemonic]
 *                properties: {
 *                  mnemonic: {
 *                    type: "string"
 *                  }
 *                }
 *      responses:
 *        '200':
 *          description: Al igual que create, responde un Json con todas las credenciales y address de la wallet.
 *        '204':
 *          description: Bad Request.
 *        '400':
 *          description: Bad Request.
 *        '500':
 *          description: Bad Request.
 */
router.post('/import-wallet/', wallet_1.importWallet);
/**
 * Post track
 * @swagger
 * /validate-defix3/:
 *    post:
 *      tags:
 *        - Wallet
 *      summary: Validar si un usuario defix3 existe.
 *      description: Response un Boolean si el usuario existe o no.
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
 *          description: Responde un boolean.
 *        '400':
 *          description: Bad Request.
 *        '500':
 *          description: Bad Request.
 */
router.post('/validate-defix3/', wallet_1.validateDefixIdAPI);
/**
 * Post track
 * @swagger
 * /import-from-mnemonic/:
 *    post:
 *      tags:
 *        - Wallet
 *      summary: Crear wallet Defix3 con mnemonic.
 *      description: Te registra y crea una wallet Defix3 con el mnemonic de metamask y con las mismas addresses.
 *      requestBody:
 *          content:
 *            application/json:
 *              schema:
 *                type: "object"
 *                required: [defixId, mnemonic]
 *                properties: {
 *                  defixId: {
 *                    type: "string"
 *                  },
 *                  mnemonic: {
 *                    type: "string"
 *                  }
 *                }
 *      responses:
 *        '200':
 *          description: Responde un Json con todas las credenciales y address de la wallet.
 *        '204':
 *          description: Bad Request.
 *        '400':
 *          description: Bad Request.
 *        '500':
 *          description: Bad Request.
 */
router.post('/import-from-mnemonic/', wallet_1.importFromMnemonic);
/**
 * Post track
 * @swagger
 * /get-users:
 *    get:
 *      tags:
 *        - Wallet
 *      summary: Lista los username de los usuarios registrados.
 *      description: Responde solo el defixId de los usuarios.
 *      responses:
 *        '200':
 *          description: Responde un Array con la lista de usuarios.
 *        '400':
 *          description: Bad Request.
 *        '500':
 *          description: Bad Request.
 */
router.get('/get-users', wallet_1.getUsers);
/**
 * Post track
 * @swagger
 * /validate-address/:
 *    post:
 *      tags:
 *        - Wallet
 *      summary: Validar si un address es valido.
 *      description: Valida si el address existe en la blockchain segun el coin, "BTC", "ETH", "NEAR" ...
 *      requestBody:
 *          content:
 *            application/json:
 *              schema:
 *                type: "object"
 *                required: [address, coin]
 *                properties: {
 *                  address: {
 *                    type: "string"
 *                  },
 *                  coin: {
 *                    type: "string"
 *                  }
 *                }
 *      responses:
 *        '200':
 *          description: Responde un boolean.
 *        '400':
 *          description: Bad Request.
 *        '500':
 *          description: Bad Request.
 */
router.post('/validate-address/', wallet_1.validateAddress);
