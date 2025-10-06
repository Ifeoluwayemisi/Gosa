import express from "express";
import { completeProfile, updateProfile, uploadProfileImage } from "../controllers/userController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/complete-profile", protect, uploadProfileImage, completeProfile);
router.put("/update-profile", protect, updateProfile);
router.put("/profile", protect, updateProfile);
router.get("/me", protect, async (req, res) => {
  res.json({ message: "Protected route", user: req.user });
});


export default router;