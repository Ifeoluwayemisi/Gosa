import express from "express";
import { createVariant, bulkCreateVariants, getVariantById, getVariantsByProduct, getVariant, updateVariant, deleteVariant,recoverVariant, hardDeleteVariant } from "../controllers/variantController.js";
import { authorize, protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", protect, authorize("ADMIN"), createVariant);
router.post("/bulk", protect, authorize("ADMIN"), bulkCreateVariants);
router.put("/:id", protect, authorize("ADMIN"), updateVariant);
router.delete("/:id", protect, authorize("ADMIN"), deleteVariant);
router.patch("/recover/:id", protect, authorize("ADMIN"), recoverVariant );
router.delete("/hard-delete/;id", protect, authorize("ADMIN"), hardDeleteVariant);

router.get("/product/:productId", getVariantsByProduct);
router.get("/:id", getVariantById);
router.get("/", getVariant);

export default router