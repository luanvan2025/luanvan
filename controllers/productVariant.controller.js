import prisma from "../models/prismaClient.js";

// Thêm mới biến thể sản phẩm
export const createProductVariant = async (req, res) => {
  try {
    const {
      product_id,
      price,
      discount_price,
      stock,
      color,
      size,
      capacity,
      power,
      material,
      voltage,
      weight,
      dimensions,
      warranty,
      energy_class,
      functions_text,
      intended_use,
      safety_features,
    } = req.body;
  // 1. Check product_id hợp lệ
    if (!product_id) {
      return res.status(400).json({ message: "product_id là bắt buộc" });
    }
    const product = await prisma.products.findUnique({ where: { id: Number(product_id) } });
    if (!product) {
      return res.status(400).json({ message: "Sản phẩm gốc không tồn tại" });
    }
        // 2. Tạo biến thể
    const newVariant = await prisma.product_variants.create({
      data: {
        product_id: Number(product_id),
        price: price ? parseFloat(price) : null,
        discount_price: discount_price ? parseFloat(discount_price) : null,
        stock: stock ? Number(stock) : null,
        color,
        size,
        capacity,
        power,
        material,
        voltage,
        weight,
        dimensions,
        warranty,
        energy_class,
        functions_text,
        intended_use,
        safety_features,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    res.status(201).json({
      message: "Thêm biến thể sản phẩm thành công",
      data: newVariant,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi thêm biến thể", error: error.message });
  }
};

/**
 * Lấy tất cả biến thể sản phẩm
 */
export const getProductVariants = async (req, res) => {
  try {
    const variants = await prisma.product_variants.findMany({
      orderBy: { created_at: "desc" },
      include: { products: true }, // lấy thêm thông tin sản phẩm gốc
    });
    res.json({ code: 200, data: variants });
  } catch (error) {
    res.status(500).json({ code: 500, message: "Lỗi khi lấy danh sách biến thể", error: error.message });
  }
};

/**
 * Lấy chi tiết biến thể theo ID
 */
export const getProductVariantById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const variant = await prisma.product_variants.findUnique({
      where: { id },
      include: { products: true },
    });

    if (!variant) {
      return res.status(404).json({ code: 404, message: "Không tìm thấy biến thể" });
    }

    res.json({
      code: 200,
      message: "Lấy chi tiết biến thể thành công",
      data: variant
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: "Lỗi khi lấy chi tiết biến thể",
      error: error.message
    });
  }
};

/**
 * Cập nhật biến thể sản phẩm (giữ nguyên field cũ nếu không truyền)
 */
export const updateProductVariant = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const {
      product_id,
      price,
      discount_price,
      stock,
      color,
      size,
      capacity,
      power,
      material,
      voltage,
      weight,
      dimensions,
      warranty,
      energy_class,
      functions_text,
      intended_use,
      safety_features,
    } = req.body;

    // 1. Kiểm tra biến thể có tồn tại
    const variant = await prisma.product_variants.findUnique({ where: { id } });
    if (!variant) {
      return res.status(404).json({ message: "Biến thể không tồn tại" });
    }

    // 2. Nếu update product_id → check tồn tại
    if (product_id) {
      const product = await prisma.products.findUnique({ where: { id: Number(product_id) } });
      if (!product) {
        return res.status(400).json({ message: "Sản phẩm gốc không tồn tại" });
      }
    }

    // 3. Chuẩn bị data update
    const updateData = { updated_at: new Date() };
    if (product_id) updateData.product_id = Number(product_id);
    if (price) updateData.price = parseFloat(price);
    if (discount_price) updateData.discount_price = parseFloat(discount_price);
    if (stock) updateData.stock = Number(stock);
    if (color) updateData.color = color;
    if (size) updateData.size = size;
    if (capacity) updateData.capacity = capacity;
    if (power) updateData.power = power;
    if (material) updateData.material = material;
    if (voltage) updateData.voltage = voltage;
    if (weight) updateData.weight = weight;
    if (dimensions) updateData.dimensions = dimensions;
    if (warranty) updateData.warranty = warranty;
    if (energy_class) updateData.energy_class = energy_class;
    if (functions_text) updateData.functions_text = functions_text;
    if (intended_use) updateData.intended_use = intended_use;
    if (safety_features) updateData.safety_features = safety_features;

    // 4. Update DB
    const updatedVariant = await prisma.product_variants.update({
      where: { id },
      data: updateData,
    });

    res.status(200).json({
      message: "Cập nhật biến thể thành công",
      data: updatedVariant,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi cập nhật biến thể", error: error.message });
  }
};


/**
 * Xóa biến thể sản phẩm
 */
export const deleteProductVariant = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    // 1. Kiểm tra biến thể có tồn tại không
    const variant = await prisma.product_variants.findUnique({ where: { id } });
    if (!variant) {
      return res.status(404).json({ message: "Biến thể không tồn tại" });
    }

    // 2. Xóa biến thể
    await prisma.product_variants.delete({ where: { id } });

    res.status(200).json({ message: "Xóa biến thể thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi xóa biến thể", error: error.message });
  }
};


/**
 * Lấy tất cả biến thể theo product_id
 */
export const getVariantsByProductId = async (req, res) => {
  try {
    const productId = parseInt(req.params.productId);

    // check product tồn tại
    const product = await prisma.products.findUnique({ where: { id: productId } });
    if (!product) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }

    const variants = await prisma.product_variants.findMany({
      where: { product_id: productId },
      orderBy: { created_at: "desc" },
    });

    if (!variants || variants.length === 0) {
      return res.status(404).json({ message: "Sản phẩm này chưa có biến thể" });
    }

    res.status(200).json({
      message: "Lấy biến thể theo product_id thành công",
      data: variants,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy biến thể theo product_id", error: error.message });
  }
};
