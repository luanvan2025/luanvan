import prisma from "../models/prismaClient.js";
import cloudinary from "../config/cloudinary.js";

// Lấy tất cả comments
export const getProductComment = async (req, res) => {
    try {
        const data = await prisma.product_comments.findMany({
            include: {
                products: true,
                users: { select: { id: true, name: true, avatar: true } }
            },
            orderBy: { user_id: "desc" }
        })

        return res.status(200).json({
            message: "Lấy danh sách comments sản phẩm thành công",
            data: data
        })
    } catch (error) {
        return res.status(500).json({
            message: "Lấy danh sách comments sản phẩm thất bại!",
            error: error.message
        })
    }
}

// Lấy comment theo id
export const getProductCommentsById = async (req, res) => {
    try {
        const id = parseInt(req.params.id)

        const data = await prisma.product_comments.findUnique({
            where: { id },
            include: {
                products: true,
                users: { select: { id: true, name: true, avatar: true } },
            },
        })

        if (!data) {
            return res.status(404).json({ message: "Không tìm thấy comment!" })
        }

        return res.status(200).json({
            message: "Lấy comment sản phẩm thành công",
            data: data
        })
    } catch (error) {
        return res.status(500).json({
            message: "Lấy comment sản phẩm thất bại!",
            error: error.message
        })
    }
}

// Tạo comment
export const postProductComment = async (req, res) => {
    try {
        const { product_id, user_id, comment } = req.body

        // Ép kiểu về số
        const productId = product_id ? Number(product_id) : null
        const userId = user_id ? Number(user_id) : null

        // Kiểm tra dữ liệu đầu vào
        if (!productId) {
            return res.status(400).json({ mess: "Thiếu product_id !!!" })
        }

        if (!userId) {
            return res.status(400).json({ mess: "Thiếu user_id !!!" })
        }

        if (!comment || comment.trim() === "") {
            return res.status(400).json({ mess: "Comment không được để trống !!!" })
        }

        // Kiểm tra product có tồn tại không
        const product = await prisma.products.findUnique({
            where: { id: productId }
        })
        if (!product) {
            return res.status(404).json({ mess: "Sản phẩm không tồn tại !!!" })
        }

        // Kiểm tra user có tồn tại không
        const user = await prisma.users.findUnique({
            where: { id: userId }
        })
        if (!user) {
            return res.status(404).json({ mess: "User không tồn tại !!!" })
        }

        // Tạo comment mới
        const newComment = await prisma.product_comments.create({
            data: {
                product_id: productId,
                user_id: userId,
                comment: comment,
                created_at: new Date(),
                updated_at: new Date(),
            }
        })

        return res.status(201).json({ mess: "Tạo comment thành công", data: newComment })
    } catch (error) {
        return res.status(500).json({ mess: "Tạo comment thất bại", error: error.message })
    }
}


// Sửa comment
export const updateProductComment = async (req, res) => {
    try {
        const id = parseInt(req.params.id)
        const { comment } = req.body

        // Ép kiểu id
        const commentId = Number(id)

        // Kiểm tra có id không
        if (!commentId) {
            return res.status(400).json({ mess: "Thiếu id comment !!!" })
        }

        // Kiểm tra comment có tồn tại không
        const existingComment = await prisma.product_comments.findUnique({
            where: { id: commentId }
        })
        if (!existingComment) {
            return res.status(404).json({ mess: "Comment không tồn tại !!!" })
        }

        // Kiểm tra nội dung comment
        if (!comment || comment.trim() === "") {
            return res.status(400).json({ mess: "Nội dung comment không được để trống !!!" })
        }

        // Update comment
        const updatedComment = await prisma.product_comments.update({
            where: { id: commentId },
            data: { comment: comment },
            include: {
                users: { select: { id: true, name: true, avatar: true } },
                products: true
            }
        })

        return res.status(200).json({ mess: "Sửa comment thành công", data: updatedComment })
    } catch (error) {
        return res.status(500).json({ mess: "Sửa comment thất bại", error: error.message })
    }
}

// Xóa 
export const deleteProductComment = async (req, res) => {
    try {
        const { id } = req.params
        const commentId = Number(id)

        // Kiểm tra có id không
        if (!commentId) {
            return res.status(400).json({ mess: "Thiếu id comment !!!" })
        }

        // Kiểm tra comment có tồn tại không
        const existingComment = await prisma.product_comments.findUnique({
            where: { id: commentId }
        })
        if (!existingComment) {
            return res.status(404).json({ mess: "Comment không tồn tại !!!" })
        }

        // Xóa comment
        await prisma.product_comments.delete({
            where: { id: commentId }
        })

        return res.status(200).json({ mess: "Xóa comment thành công" })
    } catch (error) {
        return res.status(500).json({ mess: "Xóa comment thất bại", error: error.message })
    }
}

//Tìm 
export const searchProductComments = async (req, res) => {
    try {
        const { keyword } = req.query

        if (!keyword || keyword.trim() === "") {
            return res.status(400).json({ mess: "Vui lòng nhập từ khóa tìm kiếm !!!" })
        }

        const comments = await prisma.product_comments.findMany({
            where: {
                comment: {
                    contains: keyword,
                    mode: "insensitive" // không phân biệt hoa thường
                }
            },
            include: {
                users: { select: { id: true, name: true, avatar: true } },
                products: true
            },
            orderBy: { id: "desc" }
        })

        if (comments.length === 0) {
            return res.status(404).json({ mess: "Không tìm thấy comment nào phù hợp !!!" })
        }

        return res.status(200).json({ mess: "Tìm kiếm comment thành công", data: comments })
    } catch (error) {
        return res.status(500).json({ mess: "Tìm kiếm comment thất bại", error: error.message })
    }
}
