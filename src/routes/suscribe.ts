import { Request, Response, Router } from "express";
import { setEmailSuscribe } from "../controllers/suscribe";

const router = Router();

router.post('/set-email-suscribe/', setEmailSuscribe)

export { router };
