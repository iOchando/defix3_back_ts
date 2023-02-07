import { Request, Response, Router } from "express";
import { generar2fa, activar2fa, desactivar2fa, status2fa } from "../controllers/2fa";

const router = Router();

router.post('/generar-2fa/', generar2fa)
router.post('/activar-2fa/', activar2fa)
router.post('/desactivar-2fa/', desactivar2fa)
router.post('/status-2fa/', status2fa)

export { router };
