import express from "express"
import { getProductComment, getProductCommentsById, postProductComment, searchProductComments, updateProductComment } from "../controllers/productcomments.controller.js"

const productCommentRouter = express.Router()

productCommentRouter.get("/", getProductComment)
productCommentRouter.get("/:id", getProductCommentsById)
productCommentRouter.post("/create", postProductComment)
productCommentRouter.put("/update", updateProductComment)
productCommentRouter.delete("/:id", getProductComment)
productCommentRouter.get("/search", searchProductComments)

export default productCommentRouter 