import express from "express";
import { createCoupon } from "../controllers/couponController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { applyCoupon } from "../controllers/couponController.js";

const router = express.Router();

router.post("/", protect, authorize("ADMIN"), createCoupon);
router.post("/apply", protect, authorize("ADMIN"), applyCoupon);
router.post("/", protect, authorize("ADMIN"), createCoupon);
router.get("/", protect, authorize("ADMIN"), getCoupons);
router.get("/:id", protect, authorize("ADMIN"), getCouponById);
router.delete("/:id", protect, authorize("ADMIN"), deleteCoupon);
router.patch("/:id/restore", protect, authorize("ADMIN"), restoreCoupon);

export default router;