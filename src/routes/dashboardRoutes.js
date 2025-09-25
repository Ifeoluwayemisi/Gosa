import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { getUserOrders } from "../controllers/orderController.js";
import { getUserCoupons } from "../controllers/couponController.js";
import { getUserActivity } from "../controllers/activityController.js";

const router = express.Router();

// Protect all routes
router.use(protect);

// Orders
router.get("/orders", getUserOrders);
router.get("/order/:id", getUserOrders); // optionally separate single order endpoint

// Coupons
router.get("/coupons", getUserCoupons);

// Activity Log
router.get("/activity", getUserActivity);

export default router;