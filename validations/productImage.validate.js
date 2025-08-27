import Joi from "joi";

// Validate khi thêm ảnh cho product
export const createProductImageSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    "number.base": "Product ID phải là số",
    "number.positive": "Product ID phải lớn hơn 0",
    "any.required": "Thiếu product ID",
  }),
});

// Validate khi update / delete ảnh
export const updateDeleteImageSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    "number.base": "Image ID phải là số",
    "number.positive": "Image ID phải lớn hơn 0",
    "any.required": "Thiếu image ID",
  }),
});
