import { Request, Response, Router } from "express";
import { setEmailSuscribe } from "../controllers/suscribe";

const router = Router();


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
router.post('/set-email-suscribe/', setEmailSuscribe)

export { router };
