import { Request, Response, Router } from "express";
import { transaction } from "../controllers/transaction";

const router = Router();

router.post('/transaction/', transaction)

export { router };
