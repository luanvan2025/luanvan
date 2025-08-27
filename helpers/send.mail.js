import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config(); //Dòng này nạp tất cả biến từ file .env vào process.env
//email: địa chỉ người nhận.subject: tiêu đề email.html: nội dung email (dạng HTML).
export const sendMail = async ({ email, subject, html }) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const message = {
    from: 'ADMIN FROM WEB BAN HANG <no-reply@banhang.vn>',
    to: email,
    subject,
    html,

  };

  const result=await transporter.sendMail(message)
  return result;
};
