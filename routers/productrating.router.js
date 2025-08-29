import express from "express";
import { createProductRating, deleteProductRating, getProductRatingById, getProductRatings, updateProductRating } from "../controllers/productRating.controller.js";

const productRatingRouter = express.Router();

productRatingRouter.get("/", getProductRatings);
productRatingRouter.get("/:id", getProductRatingById);
productRatingRouter.post("/", createProductRating);
productRatingRouter.put("/:id", updateProductRating);
productRatingRouter.delete("/:id", deleteProductRating);

export default productRatingRouter;