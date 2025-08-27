import prisma from '../models/prismaClient.js';
// Thêm mới thương hiệu
export const createBrand = async (req, res) => {
  try {
    const { name, country } = req.body;
    
    const existedBrand = await prisma.brands.findFirst({ where: { name } });
    if (existedBrand) {
      return res.status(400).json({ message: "Thương hiệu đã tồn tại" });
    }

    const newBrand = await prisma.brands.create({
      data: {
        name,
        country,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    res.status(201).json({
      message: "Thêm thương hiệu thành công",
      data: newBrand,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi thêm thương hiệu", error: error.message });
  }
};

// Lấy tất cả thương hiệu
export const getBrands = async (req, res) => {
  try {
    const brands = await prisma.brands.findMany({
      orderBy: { created_at: "desc" },
    });
    res.status(200).json(brands);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy danh sách thương hiệu", error: error.message });
  }
};

// Lấy chi tiết thương hiệu theo ID
export const getBrandById = async (req, res) => {
  try {
    const  id  = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "ID không hợp lệ" });
    }
    const brand = await prisma.brands.findUnique({
      where: { id },
    });

    if (!brand) {
      return res.status(404).json({ message: "Không tìm thấy thương hiệu" });
    }

    res.status(200).json(brand);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy chi tiết thương hiệu", error: error.message });
  }
};

// Cập nhật thương hiệu
export const updateBrand = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "ID không hợp lệ" });
    }
    const { name, country } = req.body;
    //  Check brand tồn tại
    const brand = await prisma.brands.findUnique({ where: { id } });
    if (!brand) {
      return res.status(404).json({ message: "Thương hiệu không tồn tại" });
    }

     // 2. Check tên khi update trùng với tên brand khác thì không đc update
    if (name) {
      const existedBrand = await prisma.brands.findFirst({
        where: {
          name: name,
          NOT:{ id: id },//bỏ qua chính nó khi đang update.
//Nhờ vậy, bạn update tên cũ của nó thì không báo trùng, nhưng update sang tên của brand khác thì báo lỗi.
        },
      });

      if (existedBrand) {
        return res.status(400).json({ message: "Tên thương hiệu đã tồn tại" });
      }
    }
//update
    const updatedBrand = await prisma.brands.update({
      where: { id },
      data: {
        name,
        country,
        updated_at: new Date(),
      },
    });

    res.status(200).json({
      message: "Cập nhật thương hiệu thành công",
      data: updatedBrand,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi cập nhật thương hiệu", error: error.message });
  }
};

// Xóa thương hiệu
export const deleteBrand = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "ID không hợp lệ" });
    }
    // 1. Check brand tồn tại
    const brand = await prisma.brands.findUnique({ where: { id } });
    if (!brand) {
      return res.status(404).json({ message: "Thương hiệu không tồn tại" });
    }
     // 2. Check còn sản phẩm liên kết không
    const products = await prisma.products.findFirst({ where: { brand_id: id } });
    if (products) {
      return res.status(400).json({ message: "Không thể xóa thương hiệu vì vẫn còn sản phẩm liên kết" });
    }
    // 3. Xóa thương hiệu
    await prisma.brands.delete({
      where: { id },
    });

    res.status(200).json({ message: "Xóa thương hiệu thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi xóa thương hiệu", error: error.message });
  }
};