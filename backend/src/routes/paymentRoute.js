import express from "express";
import { initiatePayment, paymentCallback } from "../controllers/paymentController.js";
import { protect} from "../middlewares/authMiddleware.js"
const router = express.Router();

router.get("/callback", paymentCallback);
router.post("/initiate", protect, initiatePayment);

export default router;