// routes/orderRoutes.js
import express from "express";
import { getMyOrders, getOrderById } from "../controllers/orderController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Get all user orders
router.get("/me", protect, getMyOrders);

// Get single order
router.get("/:id", protect, getOrderById);

export default router;
