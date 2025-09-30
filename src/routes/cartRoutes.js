import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { getCart, addToCart, updateCartItem, removeCartItem, clearCart } from "../controllers/cartController.js";

const router = express.Router();

router.get("/", protect, getCart);
router.post("/", protect, addToCart);
router.put("/:id", protect, updateCartItem);
router.delete("/:id", protect, removeCartItem);
router.delete("/", protect, clearCart)

export default router;