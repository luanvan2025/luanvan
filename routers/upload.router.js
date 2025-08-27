import express from "express";
import { uploadAvatar, uploadProduct, uploadBanner } from "../middleware/uploadcloud.js";
import { uploadImage,deleteImage } from "../controllers/upload.controller.js";

const router = express.Router();

// Upload avatar
router.post("/avatar", uploadAvatar.single("image"), uploadImage);

// Upload product (nhiều ảnh, tối đa 5)
router.post("/product", uploadProduct.array("image",5), uploadImage);

// Upload banner
router.post("/banner", uploadBanner.single("image"), uploadImage);

// Xóa ảnh (chung cho avatar, product, banner)
router.delete("/delete", deleteImage);

export default router;
