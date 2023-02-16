import { Request, Response, Router } from "express";
import { swapPreview} from "../controllers/swap";

const router = Router();

router.post('/swap-preview/', swapPreview)

export { router };
