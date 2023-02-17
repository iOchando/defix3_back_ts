"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const suscribe_1 = require("../controllers/suscribe");
const router = (0, express_1.Router)();
exports.router = router;
/**
 * Post track
 * @openapi
 * /set-email-suscribe/:
 *    post:
 *      tags:
 *        - Suscribe
 *      summary: Enviar correo para suscribirse a Defix3.
 *      description: Registrar correo.
 *      requestBody:
 *          content:
 *            application/json:
 *              schema:
 *                type: "object"
 *                required: [email]
 *                properties: {
 *                  email: {
 *                    type: "string"
 *                  }
 *                }
 *      responses:
 *        '200':
 *          description: Success.
 *        '400':
 *          description: Bad Request.
 *        '500':
 *          description: Bad Request.
 */
router.post('/set-email-suscribe/', suscribe_1.setEmailSuscribe);
