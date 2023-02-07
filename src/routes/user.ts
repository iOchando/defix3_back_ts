import { Request, Response, Router } from "express";
import { getCloseAllSesions, closeAllSessions, setEmailData, getEmailData } from "../controllers/user";

const router = Router();

router.post('/close-all-sessions/', closeAllSessions)
router.post('/get-close-all-sessions/', getCloseAllSesions)
router.post('/set-email-data/', setEmailData)
router.post('/get-email-data/', getEmailData)

export { router };
