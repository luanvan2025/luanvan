import prisma from "../models/prismaClient.js"

export const getOrder = async (req, res) => {
    try {
        const data = await prisma.orders.findMany({
            include: {
                users: { select: { id: true, name: true, avatar: true } },
            }
        })

        return res.status(200).json({ mess: " Danh Sách Đơn Hàng", data: data })
    } catch (error) {
        return res.status(500).json({ mess: "Lỗi Danh Sách Đơn Hàng !!!", error: error.message })
    }
}

// Lấy order theo ID
export const getOrderById = async (req, res) => {
    try {
        const { id } = req.params
        if (isNaN(Number(id))) return res.status(400).json({ message: "ID không hợp lệ" })

        const order = await prisma.orders.findUnique({ where: { id: Number(id) } })
        if (!order) return res.status(404).json({ message: "Không tìm thấy order" })

        res.json(order)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

export const createOrder = async (req, res) => {
    try {
        const { user_id, shipping_address_id, total_amount, order_status, payment_method } = req.body

        // --- Ràng buộc trực tiếp ---
        if (!user_id || isNaN(Number(user_id)))
            return res.status(400).json({ mess: "Thiếu hoặc user_id không hợp lệ !!!" })
        if (!shipping_address_id || isNaN(Number(shipping_address_id)))
            return res.status(400).json({ mess: "Thiếu hoặc shipping_address_id không hợp lệ !!!" })
        if (!total_amount || isNaN(Number(total_amount)) || Number(total_amount) <= 0)
            return res.status(400).json({ mess: "total_amount phải > 0 !!!" })
        if (!order_status || !["pending", "paid", "shipped", "canceled"].includes(order_status))
            return res.status(400).json({ mess: "order_status không hợp lệ !!!" })
        if (!payment_method || !["cod", "bank", "momo"].includes(payment_method))
            return res.status(400).json({ mess: "payment_method không hợp lệ !!!" })

        // Kiểm tra user tồn tại
        const user = await prisma.users.findUnique({
            where: { id: Number(user_id) }
        })
        if (!user)
            return res.status(404).json({ mess: "User không tồn tại !!!" })

        // Kiểm tra shipping_address tồn tại
        const address = await prisma.shipping_addresses.findUnique({
            where: { id: Number(shipping_address_id) }
        })
        if (!address)
            return res.status(404).json({ mess: "Shipping address không tồn tại !!!" })

        // Tạo order
        const newOrder = await prisma.orders.create({
            data: {
                user_id: Number(user_id),
                shipping_address_id: Number(shipping_address_id),
                total_amount: Number(total_amount),
                order_status,
                payment_method,
                created_at: new Date(),
                updated_at: new Date(),
            }
        })

        res.status(201).json({ mess: "Tạo order thành công", data: newOrder })
    } catch (error) {
        res.status(500).json({ mess: "Tạo order thất bại", error: error.message })
    }
}

// Cập nhật order theo ID
export const updateOrder = async (req, res) => {
    try {
        const { id } = req.params
        if (!id || isNaN(Number(id))) return res.status(400).json({ mess: "ID không hợp lệ !!!" })

        const existingOrder = await prisma.orders.findUnique({ where: { id: Number(id) } })
        if (!existingOrder) return res.status(404).json({ mess: "Order không tồn tại !!!" })

        const { user_id, shipping_address_id, total_amount, order_status, payment_method } = req.body
        const data = {}

        if (user_id !== undefined) {
            if (isNaN(Number(user_id)))
                return res.status(400).json({ mess: "user_id không hợp lệ !!!" })
            const user = await prisma.users.findUnique({
                where: { id: Number(user_id) }
            })
            if (!user)
                return res.status(404).json({ mess: "User không tồn tại !!!" })
            data.user_id = Number(user_id)
        }

        if (shipping_address_id !== undefined) {
            if (isNaN(Number(shipping_address_id)))
                return res.status(400).json({ mess: "shipping_address_id không hợp lệ !!!" })
            const address = await prisma.shipping_addresses.findUnique({
                where: { id: Number(shipping_address_id) }
            })
            if (!address)
                return res.status(404).json({ mess: "Shipping address không tồn tại !!!" })
            data.shipping_address_id = Number(shipping_address_id)
        }

        if (total_amount !== undefined) {
            if (isNaN(Number(total_amount)) || Number(total_amount) <= 0)
                return res.status(400).json({ mess: "total_amount phải > 0 !!!" })
            data.total_amount = Number(total_amount)
        }

        if (order_status !== undefined) {
            if (!["pending", "paid", "shipped", "canceled"].includes(order_status))
                return res.status(400).json({ mess: "order_status không hợp lệ !!!" })
            data.order_status = order_status
        }

        if (payment_method !== undefined) {
            if (!["cod", "bank", "momo"].includes(payment_method))
                return res.status(400).json({ mess: "payment_method không hợp lệ !!!" })
            data.payment_method = payment_method
        }

        data.updated_at = new Date()

        const updatedOrder = await prisma.orders.update({
            where: { id: Number(id) }, data
        })
        res.json({ mess: "Cập nhật order thành công", data: updatedOrder })
    } catch (error) {
        res.status(500).json({ mess: "Cập nhật order thất bại", error: error.message })
    }
}


// Xóa order theo ID
export const deleteOrder = async (req, res) => {
    try {
        const { id } = req.params
        if (isNaN(Number(id))) return res.status(400).json({ message: "ID không hợp lệ" })

        await prisma.orders.delete({ where: { id: Number(id) } })
        res.json({ message: "Xóa order thành công" })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}