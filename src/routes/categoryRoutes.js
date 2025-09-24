import express from "express";
import { protect, authorize } from "../middlewares/authMiddleware.js";
import { createCategory, getCategories } from "../controllers/categoryController.js";

const router = express.Router();

router.post("/", protect, authorize("ADMIN"), createCategory);
router.get("/", getCategories);

export default router;