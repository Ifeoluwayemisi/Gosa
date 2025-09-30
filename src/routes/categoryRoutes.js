import express from "express";
import { protect, authorize } from "../middlewares/authMiddleware.js";
import { createCategory, getCategories, updateCategory, getCategoryById, softDeleteCategory,recoverCategory, hardDeleteCategory } from "../controllers/categoryController.js";

const router = express.Router();

router.post("/", protect, authorize("ADMIN"), createCategory);
router.get("/", getCategories);
router.get("/:id", getCategoryById);
router.put("/:id", protect, authorize("ADMIN"), updateCategory);
router.delete("/:id", protect, authorize("ADMIN"), softDeleteCategory);
router.patch("/:id/recover", protect, authorize("ADMIN"), recoverCategory);
router.delete("/:id/hard-delete", protect, authorize("ADMIN"), hardDeleteCategory);

export default router;