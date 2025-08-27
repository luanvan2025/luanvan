import Joi from "joi";

export const addressCreateSchema = Joi.object({
  full_name: Joi.string().trim().min(2).max(100).required(),//.trim() → tự động xóa khoảng trắng dư ở đầu và cuối.
  phone: Joi.string().pattern(/^(0[0-9]{9})$/).required(),//.pattern:bắt đầu bằng số 0,theo sau là 9 số bất kỳ (tổng cộng 10 số).
  street_address: Joi.string().trim().min(5).max(255).required(),
  ward: Joi.string().trim().required(),
  district: Joi.string().trim().required(),
  city: Joi.string().trim().required(),
  postal_code: Joi.string().pattern(/^[0-9]{5,6}$/).allow(null, ""),//null hoặc chuỗi rỗng
  address_type: Joi.string().valid("home", "office").default("home"),
  is_default: Joi.boolean().default(false),
  is_note: Joi.string().max(255).allow(null, "").optional()//.optional() → không bắt buộc gửi.
});

export const addressUpdateSchema = Joi.object({
  full_name: Joi.string().trim().min(2).max(100).optional(),
  phone: Joi.string().pattern(/^(0[0-9]{9})$/).optional(),
  street_address: Joi.string().trim().min(5).max(255).optional(),
  ward: Joi.string().trim().optional(),
  district: Joi.string().trim().optional(),
  city: Joi.string().trim().optional(),
  postal_code: Joi.string().pattern(/^[0-9]{5,6}$/).allow(null, "").optional(),
  address_type: Joi.string().valid("home", "office").optional(),
  is_note: Joi.string().max(255).allow(null, "").optional(),
  is_default: Joi.boolean().optional(),
});
