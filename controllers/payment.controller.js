import prisma from "../models/prismaClient.js";

// Lấy tất cả phương thức thanh toán
export const getPayments = async (req, res) => {
    try {
        const payments = await prisma.payments.findMany({
            include: { orders: true } // lấy luôn thông tin order
        });

        // Map lại để amount = total_amount của order
        const paymentsWithOrderAmount = payments.map(p => ({
            ...p,
            amount: p.orders ? p.orders.total_amount : p.amount
        }));

        res.status(200).json({ mess: "Lấy danh sách các phương thức thanh toán", payments: paymentsWithOrderAmount });
    } catch (error) {
        res.status(500).json({ mess: "Lỗi lấy danh sách các phương thức thanh toán!", error: error.message });
    }
};

// Lấy phương thức thanh toán theo ID
export const getPaymentById = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id))
            return res.status(400).json({ error: "ID không hợp lệ" });

        const payment = await prisma.payments.findUnique({
            where: { id },
            include: { orders: true }
        });

        if (!payment)
            return res.status(404).json({ error: "Phương thức thanh toán không tồn tại" });

        // Gán amount = total_amount của order
        const paymentWithAmount = {
            ...payment,
            amount: payment.orders ? payment.orders.total_amount : payment.amount
        };

        res.status(200).json({ mess: "Lấy thanh toán theo ID", payment: paymentWithAmount });
    } catch (err) {
        res.status(500).json({ mess: "Lỗi lấy thanh toán theo ID!", error: err.message });
    }
};

// Tạo mới thanh toán
export const createPayment = async (req, res) => {
    try {
        const { order_id, payment_method, payment_status, paid_at, transaction_id, created_at } = req.body;

        if (!order_id || isNaN(Number(order_id)))
            return res.status(400).json({ mess: "order_id không hợp lệ !!!" });

        // Kiểm tra order tồn tại
        const order = await prisma.orders.findUnique({
            where: { id: Number(order_id) }
        });

        if (!order)
            return res.status(404).json({ mess: "Order không tồn tại !!!" });

        if (!["cod", "bank", "momo"].includes(payment_method))
            return res.status(400).json({ mess: "payment_method không hợp lệ !!!" });

        if (!["pending", "paid", "failed"].includes(payment_status))
            return res.status(400).json({ mess: "payment_status không hợp lệ !!!" });

        let paidDate = null;
        if (paid_at) {
            const d = new Date(paid_at);
            if (isNaN(d.getTime()))
                return res.status(400).json({ mess: "paid_at không hợp lệ !!!" });
            paidDate = d;
        }

        // Tạo payment, amount = total_amount của order
        const newPayment = await prisma.payments.create({
            data: {
                orders: { connect: { id: Number(order_id) } },
                payment_method,
                payment_status,
                paid_at: paidDate,
                amount: order.total_amount,
                transaction_id,
                created_at: created_at ? new Date(created_at) : new Date()
            }
        });

        res.status(201).json({ mess: "Tạo mới thanh toán thành công", payment: newPayment });
    } catch (err) {
        res.status(500).json({ mess: "Lỗi tạo mới thanh toán!", error: err.message });
    }
};

// Cập nhật thanh toán
export const updatePayment = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id || isNaN(Number(id)))
            return res.status(400).json({ mess: "ID không hợp lệ !!!" });

        const existingPayment = await prisma.payments.findUnique({
            where: { id: Number(id) }, include: { orders: true }
        });

        if (!existingPayment)
            return res.status(404).json({ mess: "Phương thức thanh toán không tồn tại !!!" });

        const { order_id, payment_method, payment_status, paid_at, transaction_id } = req.body;
        const data = {};

        if (order_id !== undefined) {
            if (isNaN(Number(order_id)))
                return res.status(400).json({ mess: "order_id không hợp lệ !!!" });

            const order = await prisma.orders.findUnique({
                where: { id: Number(order_id) }
            });

            if (!order)
                return res.status(404).json({ mess: "Order không tồn tại !!!" });

            data.orders = { connect: { id: Number(order_id) } };
            // Cập nhật luôn amount = total_amount của order mới
            data.amount = order.total_amount;
        }

        if (payment_method !== undefined) {
            if (!["cod", "bank", "momo"].includes(payment_method))
                return res.status(400).json({ mess: "payment_method không hợp lệ !!!" });
            data.payment_method = payment_method;
        }

        if (payment_status !== undefined) {
            if (!["pending", "paid", "failed"].includes(payment_status))
                return res.status(400).json({ mess: "payment_status không hợp lệ !!!" });
            data.payment_status = payment_status;
        }

        if (paid_at !== undefined) {
            const d = new Date(paid_at);
            if (isNaN(d.getTime()))
                return res.status(400).json({ mess: "paid_at không hợp lệ !!!" });
            data.paid_at = d;
        }

        if (transaction_id !== undefined) {
            data.transaction_id = transaction_id;
        }

        const updatedPayment = await prisma.payments.update({
            where: { id: Number(id) },
            data
        });

        res.json({ mess: "Cập nhật thanh toán thành công", data: updatedPayment });
    } catch (error) {
        res.status(500).json({ mess: "Cập nhật thanh toán thất bại", error: error.message });
    }
};

// Xóa thanh toán
export const deletePayment = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id))
            return res.status(400).json({ error: "ID không hợp lệ" });

        await prisma.payments.delete({
            where: { id }
        });

        res.status(200).json({ mess: "Xóa thanh toán thành công" });
    } catch (err) {
        res.status(500).json({ mess: "Lỗi xóa thanh toán!", error: err.message });
    }
};
