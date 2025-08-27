import prisma from "../models/prismaClient.js";

/**
 * Lấy danh sách sản phẩm yêu thích của user
 */
export const getFavorites = async (req, res) => {
  try {
    const userId = req.user.id;

    const favorites = await prisma.favorites.findMany({
      where: { user_id: userId },
      include: {
        products: {
          include: {
            product_variants: true,
            brands: true,
            categories: true,
          },
        },
      },
    });

    return res.json({
      code: 200,
      message: "Danh sách yêu thích",
      data: favorites,
    });
  } catch (error) {
    return res.status(500).json({
      code: 500,
      message: error.message,
    });
  }
};

/**
 * Toggle sản phẩm yêu thích (nếu có thì xóa, chưa có thì thêm)
 */
export const toggleFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { product_id } = req.body;

    if (!product_id) {
      return res.status(400).json({ code: 400, message: "Thiếu product_id" });
    }

    // Kiểm tra sản phẩm có tồn tại không
    const product = await prisma.products.findUnique({
      where: { id: Number(product_id) },
    });
    if (!product) {
      return res.status(404).json({ code: 404, message: "Sản phẩm không tồn tại" });
    }

    // Kiểm tra có trong favorites chưa
    const existed = await prisma.favorites.findUnique({
      where: {
        user_id_product_id: {
          user_id: userId,
          product_id: Number(product_id),
        },
      },
    });

    if (existed) {
      // Nếu có thì xóa
      await prisma.favorites.delete({
        where: {
          user_id_product_id: {
            user_id: userId,
            product_id: Number(product_id),
          },
        },
      });
      return res.json({
        code: 200,
        message: "Đã xóa khỏi yêu thích",
        data: { isFavorite: false },
      });
    } else {
      // Nếu chưa có thì thêm
      const newFavorite = await prisma.favorites.create({
        data: {
          user_id: userId,
          product_id: Number(product_id),
          created_at: new Date(),
          updated_at: new Date(),
        },
      });
      return res.json({
        code: 200,
        message: "Đã thêm vào yêu thích",
        data: { isFavorite: true, favorite: newFavorite },
      });
    }
  } catch (error) {
    return res.status(500).json({ code: 500, message: error.message });
  }
};
