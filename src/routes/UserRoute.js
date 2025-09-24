import express from "express";
import { completeProfile } from "../controllers/userController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.put("/complete-profile", protect, completeProfile);

export default router;