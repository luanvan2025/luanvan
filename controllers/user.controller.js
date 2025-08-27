import prisma from "../models/prismaClient.js";
import bcrypt from "bcrypt";
import cloudinary from "../config/cloudinary.js";
import { DEFAULT_AVATAR } from "../config/constants.js";



// Hàm chuẩn hoá dữ liệu user trả về cho FE
const userResponse = (user) => ({
  id: user.id,
  email: user.email,
  name: user.name,
  avatar: user.avatar,        // null hoặc link ảnh
  phone: user.phone,
  date_of_birth: user.date_of_birth,
  role: user.role,
  is_active: user.is_active,
  last_login: user.last_login,
  created_at: user.created_at,
  updated_at: user.updated_at,
});

// Lấy thông tin user
export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;//B1:Lấy userId từ token (req.user.id)
    const user = await prisma.users.findUnique({ where: { id: userId } });//B2:Query DB -> tìm user

    if (!user) return res.status(404).json({ message: "User không tồn tại" });//B3:Nếu không tồn tại => 404

    res.json({
      code: 200,
      message: "Lấy thông tin thành công",
      data: { user: userResponse(user) },//B4:Nếu có => trả về dữ liệu đã chuẩn hóa (userResponse)
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

//Đổi mật khẩu
export const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;//Lấy userId từ token
    const { oldPassword, newPassword, confirmPassword } = req.body;//Lấy dữ liệu từ fe nhập 

    // Kiểm tra dữ liệu nhập
    if (!oldPassword || !newPassword || !confirmPassword) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập đầy đủ thông tin" });
    }
    if (newPassword !== confirmPassword) {
      return res
        .status(400)
        .json({ message: "Mật khẩu mới và xác nhận không khớp" });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ message: "Mật khẩu phải ít nhất 8 ký tự" });
    }
    // Lấy thông tin user từ DB
    const user = await prisma.users.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ message: "User không tồn tại" });

    // so sánh mật khẩu cũ nhập vào với password trong DB (dùng bcrypt.compare)
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Mật khẩu cũ không đúng" });
    }

    // Hash mật khẩu mới,Nếu khớp -> hash newPassword bằng bcrypt
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    //Update DB với password mới (hash), cập nhật updated_at
    await prisma.users.update({
      where: { id: userId },
      data: { password: hashedPassword, updated_at: new Date() },
    });

    res.json({ message: "Đổi mật khẩu thành công" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Gộp update user info + avatar + xoá avatar
export const updateUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, phone, date_of_birth, removeAvatar } = req.body;
    const file = req.file; // avatar mới (nếu có)

    // 1. Kiểm tra user tồn tại
    const user = await prisma.users.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ message: "User không tồn tại" });

    // 2. Chuẩn bị dữ liệu update
    const updateData = { updated_at: new Date() };

    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (date_of_birth) updateData.date_of_birth = new Date(date_of_birth);

    // Nếu có file upload avatar mới
    if (file) {
      if (user.avatar_public_id) {
        await cloudinary.uploader.destroy(user.avatar_public_id, { invalidate: true });
      }
      updateData.avatar = file.path;
      updateData.avatar_public_id = file.filename;
    }

    // Nếu FE gửi cờ removeAvatar = true thì xoá avatar
    if (removeAvatar === "true" || removeAvatar === true) {
      if (user.avatar_public_id) {
        await cloudinary.uploader.destroy(user.avatar_public_id, { invalidate: true });
      }
      updateData.avatar = DEFAULT_AVATAR;// để avatar mặc định
      updateData.avatar_public_id = null;
    }

    // 3. Update vào DB
    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: updateData,
    });

    return res.json({
      code: 200,
      message: "Cập nhật user thành công",
      data: { user: userResponse(updatedUser) },
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};
