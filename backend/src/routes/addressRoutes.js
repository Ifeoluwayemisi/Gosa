import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  getUserAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
} from "../controllers/addressController.js";

const router = express.Router();

router.use(protect);

router.get("/", getUserAddresses);
router.post("/", addAddress);
router.put("/:id", updateAddress);
router.delete("/:id", deleteAddress);

export default router;
