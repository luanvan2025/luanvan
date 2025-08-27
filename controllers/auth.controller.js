import prisma from '../models/prismaClient.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { registerSchema, loginSchema } from '../validations/auth.validate.js';
import { DEFAULT_AVATAR } from '../config/constants.js';


// Helper: tạo token
const generateToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    process.env.KEY,
    { expiresIn: '1d' }
  );

// Helper:trả về thông tin user
const userSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  avatar: true,
  role: true,
  is_active: true,
  google_id: true,
  last_login: true,
  date_of_birth: true,
  created_at: true,
  updated_at: true
};

// ĐĂNG KÝ
export const register = async (req, res) => {
  try {
  // 1) Validate body (value là dữ liệu đã được Joi làm sạch)
    const { error, value } = registerSchema.validate(req.body, { abortEarly: false });
    if (error) return res.status(400).json({ mess: error.details.map(e => e.message) });

    const { name, phone, email, password } = value;
    // 2) Check trùng email
    if (await prisma.users.findUnique({ where: { email } }))
      return res.status(400).json({ mess: 'Email đã tồn tại' });
    // 3) Tạo user mới (hash mật khẩu trước khi lưu)
    const user = await prisma.users.create({
      data: {
        name,
        phone,
        email,
        password: await bcrypt.hash(password, 10),
        is_active: 'active',
        role: 'user',
        avatar: DEFAULT_AVATAR,          
        created_at: new Date(),
        updated_at: new Date()
      },
      select: userSelect
    });
    // 4) Tạo token và trả về
    if (!user) return res.status(500).json({ mess: 'Đăng ký thất bại' });
    res.status(201).json({ mess: 'Đăng ký thành công', user, token: generateToken(user) });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ mess: 'Lỗi server', error: err.message });
  }
};

// ĐĂNG NHẬP
export const login = async (req, res) => {
  try {
        // 1) Validate body
    const { error, value } = loginSchema.validate(req.body, { abortEarly: false });
    if (error) return res.status(400).json({ mess: error.details.map(e => e.message) });

    const { email, password } = value;
        // 2) Tìm user theo email
    const user = await prisma.users.findUnique({ where: { email } });
    // 3) Check trạng thái tài khoản (nếu dùng)
    if (user && user.is_active !== 'active')
      return res.status(403).json({ mess: 'Tài khoản không hoạt động' });
    if (!user) return res.status(400).json({ mess: 'Email không tồn tại' });
        // 4) So sánh mật khẩu 
    const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ mess: 'Sai mật khẩu' });
      }
    // 5) Cập nhật last_login và lấy user mới nhất để trả về
    const updatedUser = await prisma.users.update({
      where: { id: user.id },
      data: { last_login: new Date() },
      select: userSelect
    });

    res.status(200).json({
      mess: 'Đăng nhập thành công',
      user: updatedUser,
      token: generateToken(user)
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ mess: 'Lỗi server', error: err.message });
  }
};


// Đăng nhập bằng Google
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleLogin = async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ mess: 'Thiếu token từ frontend' });

  try {
    // 1) Xác thực token với Google
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID, // phải trùng với clientId bên frontend
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub: google_id } = payload;

    // 2) Kiểm tra user trong DB
    let user = await prisma.users.findUnique({ where: { email } });

    // 3) Nếu chưa có thì tạo mới
    if (!user) {
      const now = new Date();
      user = await prisma.users.create({
        data: {
          name,
          email,
          google_id,
          avatar: picture || DEFAULT_AVATAR,
          role: 'user',
          is_active: 'active',
          created_at: now,
          updated_at: now
        },
        select: userSelect
      });
    }

    // 4) Cập nhật last_login
    user = await prisma.users.update({
      where: { id: user.id },
      data: { last_login: new Date() },
      select: userSelect
    });

    // 5) Tạo JWT token
    const jwtToken = generateToken(user);

    res.status(200).json({
      mess: 'Đăng nhập Google thành công',
      token: jwtToken,
      user
    });

  } catch (err) {
    console.error('Google Login Failed:', err);
    res.status(401).json({ mess: 'Xác thực Google thất bại', error: err.message });
  }
};


////chức năng quên mật khẩu
import { sendMail } from '../helpers/send.mail.js';

// Quên mật khẩu -> gửi OTP qua email
export const sendOtpForgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email || !/\S+@\S+\.\S+/.test(email)) {
    return res.status(400).json({ mess: "Email không hợp lệ" });
  }

  try {
    // 1. Tìm user
    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ mess: "Email không tồn tại" });

    // Chặn user đăng nhập Google
    if (user.google_id) {
      return res.status(400).json({
        mess: "Tài khoản đăng nhập bằng Google, không thể đặt lại mật khẩu bằng OTP"
      });
    }
    // 2. Sinh OTP (6 số)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 5 * 60 * 1000); // 5 phút

    // 3. Lưu OTP: dùng upsert vì user_id là unique
    await prisma.password_resets.upsert({
      where: { user_id: user.id },
      update: {
        otp_code: hashedOtp,
        expired_at: expiresAt,
        used: false,
        created_at: now,
        updated_at: now,
      },
      create: {
        user_id: user.id,
        otp_code: hashedOtp,
        expired_at: expiresAt,
        used: false,
        created_at: now,
        updated_at: now,
      },
    });

    // 4. Gửi mail OTP
   const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 10px; background: #f9f9f9;">
        <h2 style="color: #333;">Yêu cầu đặt lại mật khẩu</h2>
        <p>Xin chào <strong>${user.name || 'bạn'}</strong>,</p>
        <p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản <strong>${email}</strong>.</p>
        <p style="font-size: 24px; letter-spacing: 4px; font-weight: bold; color: #007bff; text-align: center; margin: 30px 0;">
          ${otp}
        </p>
        <p>Mã OTP này có hiệu lực trong <strong>5 phút</strong>. Vui lòng không chia sẻ mã này với bất kỳ ai.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #888;">Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
        <p style="font-size: 12px; color: #888;">Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.</p>
      </div>
    `;

    await sendMail({
      email,
      subject: "Mã OTP đặt lại mật khẩu",
      html: htmlContent,
    });

    res.json({ mess: "OTP đã gửi vào email" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};


// ===== Reset mật khẩu bằng OTP =====
export const resetPasswordWithOtp = async (req, res) => {
  const { email, otp_code, newPassword, confirmPassword } = req.body;

  if (!email || !otp_code || !newPassword || !confirmPassword) {
    return res.status(400).json({ mess: 'Thiếu thông tin' });
  }
  if (newPassword !== confirmPassword) {
    return res.status(400).json({ mess: 'Mật khẩu xác nhận không khớp' });
  }

  try {
    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ mess: 'Email không tồn tại' });

    // Chặn user đăng nhập Google
    if (user.google_id) {
      return res.status(400).json({
        mess: "Tài khoản đăng nhập bằng Google, không thể reset mật khẩu"
      });
    }

    // Lấy OTP mới nhất chưa dùng và còn hiệu lực
    const otpRecord = await prisma.password_resets.findFirst({
      where: {
        user_id: user.id,
        used: false,
        expired_at: { gte: new Date() }
      },
      orderBy: { created_at: 'desc' }
    });

    if (!otpRecord) return res.status(400).json({ mess: 'OTP không hợp lệ hoặc đã hết hạn' });

    // So sánh OTP
    const isValidOtp = await bcrypt.compare(otp_code, otpRecord.otp_code);
    if (!isValidOtp) return res.status(400).json({ mess: 'OTP không đúng' });

    // Hash mật khẩu mới
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Cập nhật mật khẩu user
    await prisma.users.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });

    // Đánh dấu OTP đã dùng
    await prisma.password_resets.update({
      where: { id: otpRecord.id },
      data: { used: true }
    });

    res.json({ mess: 'Cập nhật mật khẩu thành công' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mess: 'Lỗi server', error: err.message });
  }
};