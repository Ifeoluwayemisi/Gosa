import express from "express";
import { getAllOrders, getOrderById, updateOrderStatus } from "../../controllers/Admin/orderController.js";
import {authorize, protect} from "../../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", protect, authorize("ADMIN"), getAllOrders);
router.get("/:id", protect, authorize("ADMIN"), getOrderById);
router.put("/:id/status", protect, authorize("ADMIN"), updateOrderStatus)


export default router;