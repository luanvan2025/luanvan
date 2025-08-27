import jwt from 'jsonwebtoken';
import prisma from '../models/prismaClient.js';
//B1:Xác thực người dùng đã đăng nhập hay chưa
export const isLogin = async (req, res, next) => {
  const authHeader = req.headers.authorization;//Lấy header Authorization từ request (dạng: "Bearer <token>").
  if (!authHeader)
    return res.status(401).json({ mess: 'Thiếu token - chưa đăng nhập' });

  if (!authHeader.startsWith('Bearer '))//B2:Kiểm tra token phải bắt đầu bằng "Bearer " — đúng định dạng chuẩn.
    return res.status(400).json({ mess: 'Token sai định dạng (phải là Bearer)' });

  const token = authHeader.split(' ')[1];//B3:Cắt lấy phần token sau "Bearer "

  try {
    //B4:Giải mã token bằng secret key để lấy thông tin người dùng đã được mã hóa.
    const decoded = jwt.verify(token, process.env.KEY);
    //B5:Dùng email từ token để tìm người dùng trong database (xác thực thông tin vẫn còn đúng).
    const user = await prisma.users.findUnique({ where: { email: decoded.email } });

    if (!user) return res.status(404).json({ mess: 'Người dùng không tồn tại' });

    req.user = user;//gắn thông tin user vào req.user để dùng tiếp trong các middleware hoặc route sau.
    next();
  } catch (error) {
    return res.status(401).json({ mess: 'Token không hợp lệ hoặc hết hạn' });
  }
};
//Chỉ cho USER truy cập
export const isUser = (req, res, next) => {
  if (!req.user) return res.status(401).json({ mess: 'Chưa xác thực người dùng' });
  if (req.user.role === 'user') next();
  else return res.status(403).json({ mess: 'Chức năng này chỉ dành cho USER' });
};
// Chỉ cho ADMIN truy cập
export const isAdmin = (req, res, next) => {
  if (!req.user) return res.status(401).json({ mess: 'Chưa xác thực người dùng' });
  if (req.user.role === 'admin') next();
  else return res.status(403).json({ mess: 'Chức năng này chỉ dành cho ADMIN' });
};
