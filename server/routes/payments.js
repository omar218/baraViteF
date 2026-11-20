import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import {
  initUnlock,
  paymentHistory,
  paymentStatus,
  paymentWebhook,
  unlockPrice
} from "../controllers/payments.js";
import { authorize, protect } from "../middlewares/auth.js";

const router = Router();
const initLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false
});

router.post("/webhook", paymentWebhook);
router.get("/unlock-price", unlockPrice);
router.post("/init-unlock", initLimit, protect, authorize("client"), initUnlock);
router.get("/status/:transactionId", protect, authorize("client"), paymentStatus);
router.get("/history", protect, authorize("client"), paymentHistory);

export default router;
