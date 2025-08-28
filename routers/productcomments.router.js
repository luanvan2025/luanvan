import express from "express"
import { getProductComment, getProductCommentsById, postProductComment, searchProductComments, updateProductComment } from "../controllers/productcomments.controller"

const productCommentRouter = express.Router()

router.get("/", getProductComment)
router.get("/:id", getProductCommentsById)
router.post("/create", postProductComment)
router.put("/update", updateProductComment)
router.delete("/:id", getProductComment)
router.get("/search", searchProductComments)

export default productCommentRouter 