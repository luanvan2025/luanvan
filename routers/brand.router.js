import express from "express";
import {
  createBrand,
  getBrands,
  getBrandById,
  updateBrand,
  deleteBrand,
} from "../controllers/brand.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import { brandSchema, brandUpdateSchema } from "../validations/brand.validate.js";

const router = express.Router();

router.post("/", validate(brandSchema), createBrand);             // Thêm mới
router.get("/", getBrands);                                       // Lấy tất cả
router.get("/:id", getBrandById);                                 // Lấy chi tiết
router.put("/:id", validate(brandUpdateSchema), updateBrand);     // Cập nhật
router.delete("/:id", deleteBrand);                               // Xóa

export default router;
