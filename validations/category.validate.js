import Joi from "joi";

// Schema cho tạo mới category
export const categorySchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(3)
    .max(100)
    .required()
    .messages({
      "string.empty": "Tên danh mục không được bỏ trống",
      "string.min": "Tên danh mục phải có ít nhất {#limit} ký tự",
      "string.max": "Tên danh mục không được vượt quá {#limit} ký tự",
      "any.required": "Tên danh mục là bắt buộc",
    }),

  quantity: Joi.number()
    .integer()
    .min(0)
    .required()
    .messages({
      "number.base": "Số lượng phải là số",
      "number.min": "Số lượng phải lớn hơn hoặc bằng {#limit}",
      "any.required": "Số lượng là bắt buộc",
    }),
});

// Schema cho cập nhật category
export const categoryUpdateSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(3)
    .max(100)
    .optional()
    .messages({
      "string.empty": "Tên danh mục không được bỏ trống",
      "string.min": "Tên danh mục phải có ít nhất {#limit} ký tự",
      "string.max": "Tên danh mục không được vượt quá {#limit} ký tự",
    }),

  quantity: Joi.number()
    .integer()
    .min(0)
    .optional()
    .messages({
      "number.base": "Số lượng phải là số",
      "number.min": "Số lượng phải lớn hơn hoặc bằng {#limit}",
    }),
});
