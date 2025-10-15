import express from "express";
import {
  register,
  login,
  googleLogin,
  googleCallback,
  resetPassword,
  getLoginActivity,
  logoutAllDevices,
  forgotPassword
} from "../controllers/authController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("forgot-password", forgotPassword)
router.get("/google", googleLogin);
router.get("/google/callback", googleCallback);

//new update
router.put("/reset-password", protect, resetPassword);
router.get("/activity", protect, getLoginActivity);
router.post("/logout-all", protect, logoutAllDevices)
export default router;
