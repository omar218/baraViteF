import { Router } from "express";
import { getPro, listPros } from "../controllers/pros.js";
import { optionalProtect } from "../middlewares/auth.js";

const router = Router();

router.get("/", optionalProtect, listPros);
router.get("/:id", optionalProtect, getPro);

export default router;
