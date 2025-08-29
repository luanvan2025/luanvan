import prisma from "../models/prismaClient.js";

// Lấy tất cả phương thức đánh giá sản phẩm
export const getProductRatings = async (req, res) => {
    try {
        const productRatings = await prisma.product_ratings.findMany({
            include: { products: true, users: true } // lấy luôn thông tin sản phẩm và người dùng
        });
        res.status(200).json({ mess: "Lấy danh sách các đánh giá sản phẩm", productRatings });
    } catch (error) {
        res.status(500).json({ mess: "Lỗi lấy danh sách các đánh giá sản phẩm!", error: error.message });
    }
};

// Lấy đánh giá sản phẩm theo ID
export const getProductRatingById = async (req, res) => {
    const { id } = req.params;
    try {
        const productRating = await prisma.product_ratings.findUnique({
            where: { id: parseInt(id) },
            include: { products: true, users: true } // lấy luôn thông tin sản phẩm và người dùng
        });
        if (!productRating) {
            return res.status(404).json({ mess: "Không tìm thấy đánh giá sản phẩm!" });
        }
        res.status(200).json({ mess: "Lấy đánh giá sản phẩm thành công", productRating });
    } catch (error) {
        res.status(500).json({ mess: "Lỗi lấy đánh giá sản phẩm!", error: error.message });
    }
};

// Tạo mới đánh giá sản phẩm
export const createProductRating = async (req, res) => {
    try {
        const { product_id, user_id, rating, created_at } = req.body;

        if (!product_id || isNaN(Number(product_id)))
            return res.status(400).json({ mess: "product_id không hợp lệ" });

        if (!user_id || isNaN(Number(user_id)))
            return res.status(400).json({ mess: "user_id không hợp lệ" });

        if (!rating || isNaN(Number(rating)) || Number(rating) < 1 || Number(rating) > 5)
            return res.status(400).json({ mess: "rating phải từ 1 đến 5" });

        const product = await prisma.products.findUnique({
            where: { id: Number(product_id) }
        });
        if (!product)
            return res.status(404).json({ mess: "Sản phẩm không tồn tại" });

        const user = await prisma.users.findUnique({
            where: { id: Number(user_id) }
        });
        if (!user)
            return res.status(404).json({ mess: "Người dùng không tồn tại" });

        const newProductRating = await prisma.product_ratings.create({
            data: {
                product_id: Number(product_id),
                user_id: Number(user_id),
                rating: Number(rating),
                created_at: created_at ? new Date(created_at) : new Date()
            }
        });

        res.status(201).json({ mess: "Tạo mới đánh giá sản phẩm thành công", newProductRating });

    } catch (error) {
        res.status(500).json({ mess: "Lỗi tạo mới đánh giá sản phẩm!", error: error.message });
    }
};

// Cập nhật đánh giá sản phẩm
export const updateProductRating = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id || isNaN(Number(id)))
            return res.status(400).json({ mess: "ID không hợp lệ" });
        const productRating = await prisma.product_ratings.findUnique({
            where: { id: Number(id) }
        });
        if (!productRating)
            return res.status(404).json({ mess: "Đánh giá sản phẩm không tồn tại" });
        const { product_id, user_id, rating, created_at } = req.body;
        const data = {};

        if (product_id !== undefined) {
            if (isNaN(Number(product_id)))
                return res.status(400).json({ mess: "product_id không hợp lệ" });
            const product = await prisma.products.findUnique({
                where: { id: Number(product_id) }
            });
            if (!product)
                return res.status(404).json({ mess: "Sản phẩm không tồn tại" });
            data.product_id = Number(product_id);
        }
        if (user_id !== undefined) {
            if (isNaN(Number(user_id)))
                return res.status(400).json({ mess: "user_id không hợp lệ" });
            const user = await prisma.users.findUnique({
                where: { id: Number(user_id) }
            });
            if (!user)
                return res.status(404).json({ mess: "Người dùng không tồn tại" });
            data.user_id = Number(user_id);
        }
        if (rating !== undefined) {
            if (isNaN(Number(rating)) || Number(rating) < 1 || Number(rating) > 5)
                return res.status(400).json({ mess: "rating phải từ 1 đến 5" });
            data.rating = Number(rating);
        }
        if (created_at !== undefined) {
            const d = new Date(created_at);
            if (isNaN(d.getTime()))
                return res.status(400).json({ mess: "created_at không hợp lệ" });
            data.created_at = d;
        }
        const updatedProductRating = await prisma.product_ratings.update({
            where: { id: Number(id) },
            data
        });
        res.status(200).json({ mess: "Cập nhật đánh giá sản phẩm thành công", updatedProductRating });
    } catch (error) {
        res.status(500).json({ mess: "Lỗi cập nhật đánh giá sản phẩm!", error: error.message });
    }
};

//Xóa đánh giá sản phẩm
export const deleteProductRating = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id || isNaN(Number(id)))
            return res.status(400).json({ mess: "ID không hợp lệ !!!" });
        const productRating = await prisma.product_ratings.findUnique({
            where: { id: Number(id) }
        });
        if (!productRating)
            return res.status(404).json({ mess: "Đánh giá sản phẩm không tồn tại !!!" });

        await prisma.product_ratings.delete({
            where: { id: Number(id) }
        });
        res.status(200).json({ mess: "Xóa đánh giá sản phẩm thành công" });
    } catch (error) {
        res.status(500).json({ mess: "Lỗi xóa đánh giá sản phẩm!", error: error.message });
    }
};