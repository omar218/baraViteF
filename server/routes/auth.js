import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { login, me, register, requestPasswordReset, resetPassword } from "../controllers/auth.js";
import { protect } from "../middlewares/auth.js";

const router = Router();
const passwordResetRequestLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false
});
const passwordResetLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false
});

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", passwordResetRequestLimit, requestPasswordReset);
router.post("/reset-password", passwordResetLimit, resetPassword);
router.get("/me", protect, me);

export default router;
