import prisma from "../models/prismaClient.js";
import cloudinary from "../config/cloudinary.js";

// ================== CREATE (nhiều ảnh) ==================
export const createProductImage = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const files = req.files; // nhiều ảnh

    // Kiểm tra product_id hợp lệ
    if (isNaN(id)) {
      return res.status(400).json({ message: "Product ID không hợp lệ" });
    }

    // Kiểm tra sản phẩm có tồn tại không
    const product = await prisma.products.findUnique({ where: { id } });
    if (!product) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }
    // Kiểm tra có file upload không
    if (!files || files.length === 0) {
      return res.status(400).json({ message: "Vui lòng upload ít nhất 1 ảnh" });
    }

    // Tạo nhiều bản ghi ảnh
    const newImages = await prisma.product_images.createMany({
      data: files.map((file) => ({
        product_id: id,
        image_url: file.path,
        public_id: file.filename,
        created_at: new Date(),
        updated_at: new Date(),
      })),
    });

    res.status(201).json({
      message: "Thêm ảnh sản phẩm thành công",
      count: newImages.count,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi thêm ảnh",
      error: error.message,
    });
  }
};


// ================== GET ALL BY PRODUCT ==================
export const getImagesByProduct = async (req, res) => {
  try {
    const productId = parseInt(req.params.productId);
    if (isNaN(productId)) {
      return res.status(400).json({ message: "Product ID không hợp lệ" });
    }
// Kiểm tra sản phẩm tồn tại
    const product = await prisma.products.findUnique({ where: { id: productId } });
    if (!product) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }

    const images = await prisma.product_images.findMany({
      where: { product_id: productId },
      orderBy: { created_at: "desc" },
      include: { products: true },

    });
    if (images.length === 0) {
      return res.status(404).json({ message: "Sản phẩm này chưa có ảnh" });
    }

    res.json({ code: 200, data: images });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi lấy danh sách ảnh",
      error: error.message,
    });
  }
};

// ================== UPDATE ==================
export const updateProductImage = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const file = req.file;
    if (isNaN(id)) {
      return res.status(400).json({ message: "Image ID không hợp lệ" });
    }

    const image = await prisma.product_images.findUnique({ where: { id } });
    if (!image) {
      return res.status(404).json({ message: "Ảnh không tồn tại" });
    }

    if (!file) {
      return res.status(400).json({ message: "Vui lòng upload ảnh mới" });
    }

    // Xóa ảnh cũ trên Cloudinary nếu có
    if (image.public_id) {
      await cloudinary.uploader.destroy(image.public_id, { invalidate: true });
    }

    const updated = await prisma.product_images.update({
      where: { id },
      data: {
        image_url: file.path,
        public_id: file.filename,
        updated_at: new Date(),
      },
    });

    res.status(200).json({
      message: "Cập nhật ảnh thành công",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi cập nhật ảnh",
      error: error.message,
    });
  }
};

// ================== DELETE ==================
export const deleteProductImage = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Image ID không hợp lệ" });
    }

    const image = await prisma.product_images.findUnique({ where: { id } });
    if (!image) {
      return res.status(404).json({ message: "Ảnh không tồn tại" });
    }

    // Xoá ảnh trên Cloudinary nếu có
    if (image.public_id) {
      await cloudinary.uploader.destroy(image.public_id, { invalidate: true });
    }

    // Xoá record trong DB
    await prisma.product_images.delete({ where: { id } });

    res.status(200).json({ message: "Xóa ảnh thành công" });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi xóa ảnh",
      error: error.message,
    });
  }
};
