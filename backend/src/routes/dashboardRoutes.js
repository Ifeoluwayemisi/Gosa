import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  getUserOrders,
  getOrderById as getUserOrderById,
} from "../controllers/orderController.js";
import { getCoupons } from "../controllers/couponController.js";
import { getUserActivity } from "../controllers/activityController.js";
import { getDashboardOverview } from "../controllers/dashboardController.js";

const router = express.Router();

router.use(protect);

// Dashboard Overview
router.get("/", getDashboardOverview);

// Orders
router.get("/orders", getUserOrders);
router.get("/order/:id", getUserOrderById);

// Coupons
router.get("/coupons", getCoupons);

// Activity
router.get("/activity", getUserActivity);

export default router;
