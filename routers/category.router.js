import express from "express";
import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import { categorySchema, categoryUpdateSchema } from "../validations/category.validate.js";

const router = express.Router();

router.post("/", validate(categorySchema), createCategory);            // Thêm mới
router.get("/", getCategories);                                       // Lấy tất cả
router.get("/:id", getCategoryById);                                  // Lấy chi tiết
router.put("/:id", validate(categoryUpdateSchema), updateCategory);   // Cập nhật
router.delete("/:id", deleteCategory);                                // Xóa

export default router;
