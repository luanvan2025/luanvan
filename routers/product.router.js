import express from "express";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import { createProductSchema,updateProductSchema} from "../validations/product.validate.js";
import { uploadProduct } from "../middleware/uploadcloud.js"; 


const router = express.Router();

router.post("/",uploadProduct.single("image"), validate(createProductSchema),  createProduct);
router.get("/", getProducts);
router.get("/:id", getProductById);
router.put("/:id", uploadProduct.single("image"), validate(updateProductSchema), updateProduct);
router.delete("/:id", deleteProduct);

export default router;
