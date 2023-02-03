import { Request, Response, Router } from "express";
import { generateMnemonic } from "../controllers/wallet";

const router = Router();
router.post("/generate-mnemonic", generateMnemonic);

export { router };
