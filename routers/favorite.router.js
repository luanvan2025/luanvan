import express from "express";
import { getFavorites, toggleFavorite } from "../controllers/favorite.controller.js";
import { isLogin, isUser } from "../middleware/auth.middleware.js";

const router = express.Router();
router.use(isLogin, isUser); // chỉ user login mới dùng yêu thích

// Lấy danh sách yêu thích
router.get("/", getFavorites);

// Toggle sản phẩm yêu thích
router.post("/toggle", toggleFavorite);

export default router;
