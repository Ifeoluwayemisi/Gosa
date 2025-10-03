// routes/paymentRoutes.js
import express from "express";
import multer from "multer";
import {
  uploadReceipt,
  confirmPayment,
} from "../controllers/confirmationController.js";
import { protect, admin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Multer setup for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/receipts/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

router.post(
  "/:orderId/upload-receipt",
  protect,
  upload.single("receipt"),
  uploadReceipt
);
router.put("/:orderId/confirm", protect, admin, confirmPayment);

export default router;