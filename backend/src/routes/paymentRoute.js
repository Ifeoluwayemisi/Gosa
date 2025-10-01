import express from "express";
import { paymentCallback } from "../controllers/paymentController.js";
const router = express.Router();

router.get("/callback", paymentCallback);

export default router;