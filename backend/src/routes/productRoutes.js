import express from "express";
import {protect, authorize} from "../middlewares/authMiddleware.js"
import { createProduct, getProducts, getProductById, updateProduct, softDeleteProduct, recoverProduct, hardDeleteProduct } from "../controllers/ProductController.js";

export const router = express.Router();

router.post("/", protect, authorize("ADMIN"), createProduct);
router.get("/", getProducts);
router.get("/:id", getProductById);
router.put("/:id",protect, authorize("ADMIN"), updateProduct);
router.delete("/:id", protect, authorize("ADMIN"), softDeleteProduct);
router.patch("/:id/recover", protect, authorize("ADMIN"), recoverProduct);
router.delete("/:id/hard-delete", protect, authorize("ADMIN"), hardDeleteProduct);

export default router