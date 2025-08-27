import express from "express";
import { uploadProductDetail } from "../middleware/uploadcloud.js";
import {
  createProductImage,
  getImagesByProduct,
  updateProductImage,
  deleteProductImage
} from "../controllers/productImage.controller.js";



const router = express.Router();
// Upload 1 hoặc nhiều ảnh chi tiết cho 1 sản phẩm
router.post("/:id", uploadProductDetail.array("image", 10),  createProductImage);

// Lấy danh sách ảnh chi tiết theo productId
router.get("/by-product/:productId", getImagesByProduct);

// Cập nhật ảnh chi tiết (thay ảnh mới)
router.put("/:id", uploadProductDetail.single("image"),  updateProductImage);

// Xóa ảnh chi tiết
router.delete("/:id", deleteProductImage);

export default router;
