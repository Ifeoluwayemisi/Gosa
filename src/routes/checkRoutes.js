import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { checkout } from "../controllers/checkoutController.js";

const router = express.Router();

router.post("/", protect, checkout);

export default router;