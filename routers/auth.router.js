import express from 'express';
import { register, login,googleLogin,sendOtpForgotPassword,resetPasswordWithOtp } from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);

// Thêm các route quên mật khẩu
router.post('/send-otp', sendOtpForgotPassword);      // Gửi mã OTP vào email
router.post('/reset', resetPasswordWithOtp);           // Đặt lại mật khẩu mới

export default router;
