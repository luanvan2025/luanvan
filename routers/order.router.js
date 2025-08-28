import express from "express"
import { createOrder, getOrder, getOrderById, updateOrder } from "../controllers/order.controller.js"
const orderRouter = express.Router()

orderRouter.get("/", getOrder)
orderRouter.get("/:id", getOrderById)
orderRouter.post("/", createOrder)
orderRouter.put("/:id", updateOrder)

export default orderRouter