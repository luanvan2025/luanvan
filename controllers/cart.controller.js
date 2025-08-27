import prisma from "../models/prismaClient.js";

// Hàm build lại dữ liệu giỏ hàng 
const buildCartResponse = async (userId) => {
  const cart = await prisma.carts.findUnique({
    where: { user_id: userId },
    include: {
      cart_items: {
        include: {
          product_variants: {
            include: {
              products: {
                select: { id: true, name: true, image: true }
              }
            }
          }
        }
      }
    }
  });

  if (!cart || cart.cart_items.length === 0) {
    return { items: [], total: 0 };
  }

  const items = cart.cart_items.map(item => {
    const variant = item.product_variants;
    const product = variant.products;

    const price = (variant.discount_price !== null && variant.discount_price > 0)
      ? Number(variant.discount_price)
      : Number(variant.price);

    return {
      id: item.id,
      quantity: item.quantity,
      subtotal: price * item.quantity,
      variant: {
        id: variant.id,
        price: Number(variant.price),
        discount_price: (variant.discount_price !== null && variant.discount_price > 0)
          ? Number(variant.discount_price)
          : null,
        stock: variant.stock
      },
      product: {
        id: product.id,
        name: product.name,
        image: product.image
      }
    };
  });

  const total = items.reduce((sum, item) => sum + item.subtotal, 0);
  return { items, total };
};

// ========== 1. Lấy giỏ hàng ==========
export const getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { items, total } = await buildCartResponse(userId);
    res.json({ code: 200, message: "Lấy giỏ hàng thành công", data: items, total });
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 500, message: "Lỗi server", error: error.message });
  }
};

// ========== 2. Thêm sản phẩm vào giỏ hàng ==========
export const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { variantId, quantity } = req.body;

    if (!variantId || !quantity || quantity <= 0) {
      return res.status(400).json({ code: 400, message: "Thiếu variantId hoặc số lượng không hợp lệ" });
    }

    // Kiểm tra biến thể có tồn tại không
    const variant = await prisma.product_variants.findUnique({ where: { id: Number(variantId) } });
    if (!variant) {
      return res.status(404).json({ code: 404, message: "Biến thể sản phẩm không tồn tại" });
    }

    // Kiểm tra số lượng tồn kho
    if (variant.stock !== null && quantity > variant.stock) {
      return res.status(400).json({ code: 400, message: "Số lượng vượt quá tồn kho" });
    }

    // Tìm hoặc tạo giỏ hàng cho user
    let cart = await prisma.carts.findUnique({ where: { user_id: userId } });
    if (!cart) {
      cart = await prisma.carts.create({
        data: { user_id: userId, created_at: new Date(), updated_at: new Date() }
      });
    }

    // Kiểm tra variant đã tồn tại trong giỏ hàng chưa
    const existingItem = await prisma.cart_items.findFirst({
      where: { cart_id: cart.id, product_variant_id: variantId }
    });

    if (existingItem) {
      // Cập nhật số lượng
      const newQty = existingItem.quantity + quantity;
      if (variant.stock !== null && newQty > variant.stock) {
        return res.status(400).json({ code: 400, message: "Số lượng vượt quá tồn kho" });
      }

      await prisma.cart_items.update({
        where: { id: existingItem.id },
        data: { quantity: newQty, updated_at: new Date() }
      });
    } else {
      // Thêm mới
      await prisma.cart_items.create({
        data: {
          cart_id: cart.id,
          product_variant_id: variantId,
          quantity,
          created_at: new Date(),
          updated_at: new Date()
        }
      });
    }
    const { items, total } = await buildCartResponse(userId);

    res.json({ code: 200, message: "Thêm vào giỏ hàng thành công", data: items, total });
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 500, message: "Lỗi server", error: error.message });
  }
};

// ========== 3. Cập nhật số lượng ==========
export const updateCartItem = async (req, res) => {
  try {
    const { itemId, quantity } = req.body;
    if (!itemId || quantity <= 0) {
      return res.status(400).json({ code: 400, message: "Thiếu itemId hoặc số lượng không hợp lệ" });
    }

    // Kiểm tra item có tồn tại không
    const item = await prisma.cart_items.findUnique({
      where: { id: Number(itemId) },
      include: { product_variants: true }
    });
    if (!item) {
      return res.status(404).json({ code: 404, message: "Sản phẩm trong giỏ không tồn tại" });
    }
    // Nếu quantity = 0 → xóa item
    if (quantity === 0) {
      await prisma.cart_items.delete({ where: { id: Number(itemId) } });
      return res.json({ code: 200, message: "Đã xoá sản phẩm khỏi giỏ hàng" });
    }

    // Kiểm tra tồn kho
    if (item.product_variants.stock !== null && quantity > item.product_variants.stock) {
      return res.status(400).json({ code: 400, message: "Số lượng vượt quá tồn kho" });
    }

    await prisma.cart_items.update({
      where: { id: Number(itemId) },
      data: { quantity, updated_at: new Date() }
    });
    const { items, total } = await buildCartResponse(userId);
    res.json({ code: 200, message: "Cập nhật giỏ hàng thành công", data: items, total });
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 500, message: "Lỗi server", error: error.message });
  }
};

// ========== 4. Xoá sản phẩm khỏi giỏ hàng ==========
export const removeCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;

    const item = await prisma.cart_items.findUnique({ where: { id: Number(itemId) } });
    if (!item) {
      return res.status(404).json({ code: 404, message: "Sản phẩm trong giỏ không tồn tại" });
    }

    await prisma.cart_items.delete({ where: { id: Number(itemId) } });

    const { items, total } = await buildCartResponse(userId);
    res.json({ code: 200, message: "Xoá sản phẩm thành công", data: items, total });

  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 500, message: "Lỗi server", error: error.message });
  }
};

// ========== 5. Xoá toàn bộ giỏ hàng ==========
export const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const cart = await prisma.carts.findUnique({ where: { user_id: userId } });
    if (!cart) {
      return res.json({ code: 200, message: "Giỏ hàng đã trống", data: [], total: 0 });
    }

    await prisma.cart_items.deleteMany({ where: { cart_id: cart.id } });

    res.json({ code: 200, message: "Đã xoá toàn bộ giỏ hàng", data: [], total: 0 });

  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 500, message: "Lỗi server", error: error.message });
  }
};
