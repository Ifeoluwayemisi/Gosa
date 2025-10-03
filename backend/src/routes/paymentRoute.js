import express from "express";
import { initiatePayment, paymentCallback } from "../controllers/paymentController.js";
const router = express.Router();

router.get("/callback", paymentCallback);
router.post("/initiate", initiatePayment);

export default router;