import prisma from "../models/prismaClient.js";

//Tạo category
export const createCategory = async (req, res) => {
  try {
    const { name, quantity } = req.body;
    // 1. Check tên trùng
    const existedCategory = await prisma.categories.findFirst({ where: { name } });
    if (existedCategory) {
      return res.status(400).json({ message: "Danh mục đã tồn tại" });
    }

    const newCategory = await prisma.categories.create({
      data: {
        name,
        quantity: quantity || 0,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    return res.json({ code: 200, message: "Thêm danh mục thành công", data: newCategory });
  } catch (error) {
    console.error("Lỗi tạo danh mục:", error);
    return res.status(500).json({ message: "Lỗi server", error });
  }
};

// Lấy tất cả category
export const getCategories = async (req, res) => {
  try {
    const categories = await prisma.categories.findMany({
      orderBy: { id: "desc" },
    });
    return res.json({ code: 200, data: categories });
  } catch (error) {
    console.error("Lỗi lấy danh sách danh mục:", error);
    return res.status(500).json({ message: "Lỗi server", error });
  }
};

//  Lấy chi tiết 1 category
export const getCategoryById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "ID không hợp lệ" });
    }

    const category = await prisma.categories.findUnique({
      where: { id },
    });

    if (!category) {
      return res.status(404).json({ message: "Danh mục không tồn tại" });
    }

    return res.json({ code: 200, data: category });
  } catch (error) {
    console.error("Lỗi lấy danh mục theo ID:", error);
    return res.status(500).json({ message: "Lỗi server", error });
  }
};

// Cập nhật category
export const updateCategory = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "ID không hợp lệ" });
    }
    const { name, quantity } = req.body;

    // 1. Check category tồn tại
    const category = await prisma.categories.findUnique({ where: { id } });
    if (!category) {
      return res.status(404).json({ message: "Danh mục không tồn tại" });
    }
    // 2. Check tên trùng với category khác
    if (name) {
      const existedCategory = await prisma.categories.findFirst({
        where: {
          name,
          NOT: { id: id }, // bỏ qua chính nó
        },
      });

      if (existedCategory) {
        return res.status(400).json({ message: "Tên danh mục đã tồn tại" });
      }
    }
    const updatedCategory = await prisma.categories.update({
      where: { id },
      data: {
        name,
        quantity,
        updated_at: new Date(),
      },
    });

    return res.json({ code: 200, message: "Cập nhật danh mục thành công", data: updatedCategory });
  } catch (error) {
    console.error("Lỗi cập nhật danh mục:", error);
    return res.status(500).json({ message: "Lỗi server", error });
  }
};

// Xóa category
export const deleteCategory = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "ID không hợp lệ" });
    }

    // 1. Check tồn tại
    const category = await prisma.categories.findUnique({ where: { id } });
    if (!category) {
      return res.status(404).json({ message: "Danh mục không tồn tại" });
    }

    // 2. Check còn sản phẩm liên kết không
    const product = await prisma.products.findFirst({ where: { category_id: id } });
    if (product) {
      return res.status(400).json({ message: "Không thể xóa danh mục vì vẫn còn sản phẩm liên kết" });
    }

    await prisma.categories.delete({ where: { id } });

    return res.json({ code: 200, message: "Xóa danh mục thành công" });
  } catch (error) {
    console.error("Lỗi xóa danh mục:", error);
    return res.status(500).json({ message: "Lỗi server", error });
  }
};