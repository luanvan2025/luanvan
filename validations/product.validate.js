import Joi from "joi";

// Schema tạo sản phẩm (create) – bắt buộc đủ thông tin
export const createProductSchema = Joi.object({
  name: Joi.string().trim().min(3).max(255).required().messages({
    "string.base": "Tên sản phẩm phải là chuỗi",
    "string.empty": "Tên sản phẩm không được bỏ trống",
    "string.min": "Tên sản phẩm phải có ít nhất {#limit} ký tự",
    "string.max": "Tên sản phẩm không vượt quá {#limit} ký tự",
    "any.required": "Tên sản phẩm là bắt buộc",
  }),

  category_id: Joi.number().integer().required().messages({
    "number.base": "Category ID phải là số nguyên",
    "any.required": "Category ID là bắt buộc",
  }),

  brand_id: Joi.number().integer().required().messages({
    "number.base": "Brand ID phải là số nguyên",
    "any.required": "Brand ID là bắt buộc",
  }),

  description: Joi.string().allow(null, "").messages({
    "string.base": "Mô tả phải là chuỗi",
  }),

  status: Joi.string()
    .valid("in_stock", "out_of_stock")
    .default("in_stock")
    .messages({
      "any.only": "Trạng thái sản phẩm chỉ có thể là in_stock hoặc out_of_stock",
    }),
});

// Schema cập nhật sản phẩm (update) – cho phép optional
export const updateProductSchema = Joi.object({
  name: Joi.string().trim().min(3).max(255).messages({
    "string.base": "Tên sản phẩm phải là chuỗi",
    "string.empty": "Tên sản phẩm không được bỏ trống",
    "string.min": "Tên sản phẩm phải có ít nhất {#limit} ký tự",
    "string.max": "Tên sản phẩm không vượt quá {#limit} ký tự",
  }),

  category_id: Joi.number().integer().messages({
    "number.base": "Category ID phải là số nguyên",
  }),

  brand_id: Joi.number().integer().messages({
    "number.base": "Brand ID phải là số nguyên",
  }),

  description: Joi.string().allow(null, "").messages({
    "string.base": "Mô tả phải là chuỗi",
  }),

  status: Joi.string()
    .valid("in_stock", "out_of_stock")
    .messages({
      "any.only": "Trạng thái sản phẩm chỉ có thể là in_stock hoặc out_of_stock",
    }),
});
