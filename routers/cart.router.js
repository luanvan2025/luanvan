import express from "express";
import { isLogin, isUser } from "../middleware/auth.middleware.js";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart
} from "../controllers/cart.controller.js";

const router = express.Router();

router.use(isLogin, isUser); // chỉ user login mới dùng giỏ hàng

router.get("/", getCart);
router.post("/add", addToCart);
router.put("/update", updateCartItem);
router.delete("/remove/:itemId", removeCartItem);
router.delete("/clear", clearCart);

export default router;
