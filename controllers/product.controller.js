import prisma from "../models/prismaClient.js";
import cloudinary from "../config/cloudinary.js"; // import cấu hình cloudinary


// Thêm mới sản phẩm
export const createProduct = async (req, res) => {
  try {
    const { name, description, status, category_id, brand_id } = req.body;
    const file = req.file;

    // Ép kiểu về Int
    const categoryId = category_id ? Number(category_id) : null;
    const brandId = brand_id ? Number(brand_id) : null;

    // Check category tồn tại
    if (categoryId) {
      const category = await prisma.categories.findUnique({ where: { id: categoryId } });
      if (!category) {
        return res.status(400).json({ message: "Category không tồn tại" });
      }
    }

    // Check brand tồn tại
    if (brandId) {
      const brand = await prisma.brands.findUnique({ where: { id: brandId } });
      if (!brand) {
        return res.status(400).json({ message: "Brand không tồn tại" });
      }
    }

    // Tạo sản phẩm
    const newProduct = await prisma.products.create({
      data: {
        name,
        description,
        status,
        image: file ? file.path : null,
        product_public_id: file ? file.filename : null,
        category_id: categoryId,
        brand_id: brandId,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    return res.status(201).json({
      message: "Thêm sản phẩm thành công",
      data: newProduct,
    });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi khi thêm sản phẩm", error: error.message });
  }
};



// Lấy danh sách sản phẩm
export const getProducts = async (req, res) => {
  try {
    const products = await prisma.products.findMany({
      include: {
        brands: true,          // lấy thêm thông tin brand
        categories: true,      // lấy thêm thông tin category
        product_images: true,  // lấy danh sách ảnh phụ
        product_variants: true // lấy các biến thể sản phẩm (giá, màu, size,...)
      },
      orderBy: {
        created_at: "desc"
      }
    });

    res.status(200).json({
      message: "Lấy danh sách sản phẩm thành công",
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi lấy danh sách sản phẩm",
      error: error.message,
    });
  }
};



// Lấy chi tiết sản phẩm
export const getProductById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const product = await prisma.products.findUnique({
      where: { id },
      include: {
        brands: true,
        categories: true,
        product_images: true,
        product_variants: true,
        product_comments: {
          include: {
            users: {
              select: { id: true, name: true, avatar: true },
            },
          },
        },
        product_ratings: {
          include: {
            users: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }

    res.status(200).json({
      message: "Lấy chi tiết sản phẩm thành công",
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi lấy chi tiết sản phẩm",
      error: error.message,
    });
  }
};




// Cập nhật sản phẩm
export const updateProduct = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, description, status, category_id, brand_id } = req.body;
    const file = req.file;
    // Kiểm tra sản phẩm tồn tại
    const product = await prisma.products.findUnique({ where: { id } });
    if (!product) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }
    // Ép kiểu cho category_id và brand_id
    const categoryId = category_id ? Number(category_id) : null;
    const brandId = brand_id ? Number(brand_id) : null;

    // Check category tồn tại nếu có truyền
    if (categoryId) {
      const category = await prisma.categories.findUnique({ where: { id: categoryId } });
      if (!category) {
        return res.status(400).json({ message: "Category không tồn tại" });
      }
    }

    // Check brand tồn tại nếu có truyền
    if (brandId) {
      const brand = await prisma.brands.findUnique({ where: { id: brandId } });
      if (!brand) {
        return res.status(400).json({ message: "Brand không tồn tại" });
      }
    }

    const updateData = { updated_at: new Date() };
    // Nếu có file mới → xóa ảnh cũ + cập nhật ảnh mới
    if (file) {
      // Xoá ảnh cũ nếu có
      if (product.product_public_id) {
        await cloudinary.uploader.destroy(product.product_public_id, { invalidate: true });
      }
      updateData.image = file.path;
      updateData.product_public_id = file.filename;
    }

    //Chỉ update những field mà người dùng gửi lên (không gửi thì giữ nguyên)
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (status) updateData.status = status;
    if (category_id) updateData.category_id = parseInt(category_id);
    if (brand_id) updateData.brand_id = parseInt(brand_id);

    const updatedProduct = await prisma.products.update({
      where: { id },
      data: updateData,
    });

    res.status(200).json({
      message: "Cập nhật sản phẩm thành công",
      data: updatedProduct,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi cập nhật sản phẩm", error: error.message });
  }
};



// Xóa sản phẩm + ảnh phụ
export const deleteProduct = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "ID không hợp lệ" });
    // 1. Kiểm tra sản phẩm có tồn tại không
    const product = await prisma.products.findUnique({ where: { id } });
    if (!product) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }
    // Nếu có variants thì không cho xoá
    const variant = await prisma.product_variants.findFirst({ where: { product_id: id } });
    if (variant) {
      return res.status(400).json({ message: "Không thể xóa sản phẩm vì còn biến thể liên kết" });
    }

    // 2. Lấy danh sách ảnh phụ của sản phẩm
    const subImages = await prisma.product_images.findMany({
      where: { product_id: id },
    });

    // 3. Xóa ảnh chính trên Cloudinary (nếu có)
    if (product.product_public_id) {
      await cloudinary.uploader.destroy(product.product_public_id, { invalidate: true });
    }

    // 4. Xóa ảnh phụ trên Cloudinary
    for (const img of subImages) {
      if (img.public_id) {
        await cloudinary.uploader.destroy(img.public_id, { invalidate: true });
      }
    }

    // 5. Xóa ảnh phụ trong DB
    await prisma.product_images.deleteMany({ where: { product_id: id } });

    // 6. Xóa sản phẩm trong DB
    await prisma.products.delete({ where: { id } });

    res.status(200).json({ message: "Xóa sản phẩm và toàn bộ ảnh thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi xóa sản phẩm", error: error.message });
  }
};