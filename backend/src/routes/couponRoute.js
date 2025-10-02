import express from "express";
import { applyCoupon } from "../controllers/couponController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/apply", protect, applyCoupon);

export default router;
