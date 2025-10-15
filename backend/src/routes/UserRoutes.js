import express from "express";
import {
  completeProfile,
  updateProfile,
  uploadProfileImage,
  getMe,
} from "../controllers/userController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Complete profile (1-time)
router.post("/complete-profile", protect, uploadProfileImage, completeProfile);

// Update profile
router.put("/update-profile", protect, uploadProfileImage, updateProfile);

// Get logged-in user
router.get("/me", protect, getMe);

export default router;
