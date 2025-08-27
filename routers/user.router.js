import express from "express";
import { getUserProfile,changePassword,updateUser } from "../controllers/user.controller.js";
import { isLogin } from "../middleware/auth.middleware.js";
import { uploadAvatar } from "../middleware/uploadcloud.js";


const router = express.Router();

router.get("/profile", isLogin, getUserProfile);
router.put("/profile/change-password", isLogin, changePassword);//đổi password
router.put("/profile", isLogin, uploadAvatar.single("image"), updateUser); 

export default router;
