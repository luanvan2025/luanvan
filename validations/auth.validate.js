import Joi from 'joi';

export const registerSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .required()
    .messages({
      'string.empty': 'Họ tên không được bỏ trống',
      'string.min': 'Họ tên phải ít nhất 2 ký tự',
      'any.required': 'Họ tên là bắt buộc'
    }),

  email: Joi.string()
    .trim()
    .lowercase() // Chuyển thành chữ thường
    .email()
    .required()
    .messages({
      'string.email': 'Email không hợp lệ',
      'string.empty': 'Email không được bỏ trống',
      'any.required': 'Email là bắt buộc'
    }),

  password: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.min': 'Mật khẩu phải ít nhất 6 ký tự',
      'string.empty': 'Mật khẩu không được bỏ trống',
      'any.required': 'Mật khẩu là bắt buộc'
    }),

  phone: Joi.string()
    .trim()
    .pattern(/^(0[1-9][0-9]{8})$/)
    .required()
    .messages({
      'string.pattern.base': 'Số điện thoại không hợp lệ',
      'string.empty': 'Số điện thoại không được bỏ trống',
      'any.required': 'Số điện thoại là bắt buộc'
    })
});


// Schema validate cho login
export const loginSchema = Joi.object({
  email: Joi.string().trim().email().required().messages({
    'string.email': 'Email không hợp lệ',
    'string.empty': 'Email không được bỏ trống',
    'any.required': 'Email là bắt buộc'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Mật khẩu phải ít nhất 6 ký tự',
    'string.empty': 'Mật khẩu không được bỏ trống',
    'any.required': 'Mật khẩu là bắt buộc'
  })
});