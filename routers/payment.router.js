import express from "express";
import { createPayment, deletePayment, getPaymentById, getPayments, updatePayment } from "../controllers/payment.controller.js";

const paymentRouter = express.Router();

paymentRouter.get("/", getPayments);
paymentRouter.get("/:id", getPaymentById);
paymentRouter.post("/", createPayment);
paymentRouter.put("/:id", updatePayment);
paymentRouter.delete("/:id", deletePayment);

export default paymentRouter;