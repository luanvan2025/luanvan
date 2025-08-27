import Joi from "joi";

// Schema cho thêm mới brand
export const brandSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      "string.empty": "Tên thương hiệu không được bỏ trống",
      "string.min": "Tên thương hiệu phải có ít nhất {#limit} ký tự",
      "string.max": "Tên thương hiệu không vượt quá {#limit} ký tự",
      "any.required": "Tên thương hiệu là bắt buộc",
    }),

  country: Joi.string()
    .trim()
    .max(100)
    .optional()
    .messages({
      "string.max": "Tên quốc gia không vượt quá {#limit} ký tự",
    }),
});

// Schema cho cập nhật brand
export const brandUpdateSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .optional()
    .messages({
      "string.empty": "Tên thương hiệu không được bỏ trống",
      "string.min": "Tên thương hiệu phải có ít nhất {#limit} ký tự",
      "string.max": "Tên thương hiệu không vượt quá {#limit} ký tự",
    }),

  country: Joi.string()
    .trim()
    .max(100)
    .optional()
    .messages({
      "string.max": "Tên quốc gia không vượt quá {#limit} ký tự",
    }),
});
