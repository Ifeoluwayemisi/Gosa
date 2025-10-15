import express from "express";
import {
  initiatePayment,
  paymentCallback,
  addPaymentMethod,
  getPaymentMethods,
  deletePaymentMethod,
  getTransactions,
} from "../controllers/paymentController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

/* -------------------------------------------------------------------------- */
/* 💳 PAYMENT FLOW */
/* -------------------------------------------------------------------------- */

// 🔹 Initialize payment
router.post("/initiate", protect, initiatePayment);

// 🔹 Paystack callback / verification
router.get("/callback", paymentCallback);

/* -------------------------------------------------------------------------- */
/* 🧾 PAYMENT METHODS MANAGEMENT */
/* -------------------------------------------------------------------------- */

// ➕ Add a new payment method (e.g., card, transfer)
router.post("/methods", protect, addPaymentMethod);

// 📋 Get all saved payment methods
router.get("/methods", protect, getPaymentMethods);

// 🗑️ Delete a payment method
router.delete("/methods/:id", protect, deletePaymentMethod);

/* -------------------------------------------------------------------------- */
/* 💰 TRANSACTIONS HISTORY */
/* -------------------------------------------------------------------------- */

// 📜 Get all user transactions
router.get("/transactions", protect, getTransactions);

export default router;
