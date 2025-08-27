import Joi from "joi";

/**
 * Schema cho thêm mới biến thể sản phẩm
 * - Bắt buộc: product_id, price, stock
 * - Các trường khác optional để mô tả thêm
 */
export const createVariantSchema = Joi.object({
  // Liên kết tới sản phẩm gốc (FK: products.id)
  product_id: Joi.number().integer().required().messages({
    "any.required": "product_id là bắt buộc",
    "number.base": "product_id phải là số nguyên",
  }),

  // Giá gốc (bắt buộc, >0)
  price: Joi.number().positive().required().messages({
    "any.required": "Giá là bắt buộc",
    "number.base": "Giá phải là số",
    "number.positive": "Giá phải lớn hơn 0",
  }),

  // Giá khuyến mãi (có thể null hoặc rỗng, >0)
  discount_price: Joi.number().positive().allow(null, "").messages({
    "number.base": "Giá khuyến mãi phải là số",
    "number.positive": "Giá khuyến mãi phải lớn hơn 0",
  }),

  // Số lượng tồn kho (bắt buộc, ≥0)
  stock: Joi.number().integer().min(0).required().messages({
    "any.required": "Số lượng tồn kho là bắt buộc",
    "number.base": "Số lượng tồn kho phải là số",
    "number.min": "Số lượng tồn kho không được âm",
  }),

  // Thông tin mô tả chi tiết cho từng biến thể
  color: Joi.string().allow(null, "").messages({
    "string.base": "Màu sắc phải là chuỗi",
  }),
  size: Joi.string().allow(null, ""),          // Kích thước (ví dụ: M, L, XL…)
  capacity: Joi.string().allow(null, ""),      // Dung tích (ví dụ: 500ml, 1L…)
  power: Joi.string().allow(null, ""),         // Công suất (ví dụ: 200W…)
  material: Joi.string().allow(null, ""),      // Chất liệu (thép, nhựa…)
  voltage: Joi.string().allow(null, ""),       // Điện áp (220V…)
  weight: Joi.string().allow(null, ""),        // Trọng lượng
  dimensions: Joi.string().allow(null, ""),    // Kích thước (dài x rộng x cao…)
  warranty: Joi.string().allow(null, ""),      // Bảo hành (12 tháng…)
  energy_class: Joi.string().allow(null, ""),  // Hạng năng lượng (A+, A…)
  functions_text: Joi.string().allow(null, ""),// Mô tả chức năng
  intended_use: Joi.string().allow(null, ""),  // Mục đích sử dụng
  safety_features: Joi.string().allow(null, ""), // Tính năng an toàn
});


/**
 * Schema cho update biến thể sản phẩm
 * - Không bắt buộc phải truyền tất cả field
 * - Chỉ field nào được truyền mới validate
 */
export const updateVariantSchema = Joi.object({
  product_id: Joi.number().integer().messages({
    "number.base": "product_id phải là số nguyên",
  }),

  price: Joi.number().positive().messages({
    "number.base": "Giá phải là số",
    "number.positive": "Giá phải lớn hơn 0",
  }),

  discount_price: Joi.number().positive().allow(null, "").messages({
    "number.base": "Giá khuyến mãi phải là số",
    "number.positive": "Giá khuyến mãi phải lớn hơn 0",
  }),

  stock: Joi.number().integer().min(0).messages({
    "number.base": "Số lượng tồn kho phải là số",
    "number.min": "Số lượng tồn kho không được âm",
  }),

  color: Joi.string().allow(null, ""),
  size: Joi.string().allow(null, ""),
  capacity: Joi.string().allow(null, ""),
  power: Joi.string().allow(null, ""),
  material: Joi.string().allow(null, ""),
  voltage: Joi.string().allow(null, ""),
  weight: Joi.string().allow(null, ""),
  dimensions: Joi.string().allow(null, ""),
  warranty: Joi.string().allow(null, ""),
  energy_class: Joi.string().allow(null, ""),
  functions_text: Joi.string().allow(null, ""),
  intended_use: Joi.string().allow(null, ""),
  safety_features: Joi.string().allow(null, ""),
});
