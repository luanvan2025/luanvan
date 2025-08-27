import express from "express";
import {
  createProductVariant,
  updateProductVariant,
  getProductVariants,
  getProductVariantById,
  deleteProductVariant,
  getVariantsByProductId,
} from "../controllers/productVariant.controller.js";

import { validate } from "../middleware/validate.middleware.js";
import { createVariantSchema, updateVariantSchema } from "../validations/productVariant.validate.js";

const router = express.Router();

// CRUD biến thể
router.post("/", validate(createVariantSchema), createProductVariant);
router.get("/", getProductVariants);
router.get("/:id", getProductVariantById);
router.put("/:id", validate(updateVariantSchema), updateProductVariant);
router.delete("/:id", deleteProductVariant);

// Lấy theo product_id, lấy tất cả biến thể của riêng 1 sản phẩm.
router.get("/by-product/:productId", getVariantsByProductId);

export default router;
