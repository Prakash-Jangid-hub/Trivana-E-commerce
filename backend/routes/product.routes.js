import { Router } from "express";
import { addProduct, deleteProduct, filterProducts, productDetails, searchProduct, sortProducts, updateProduct } from "../controllers/product.controllers.js";
import { upload } from "../middleware/multer.js"

const router = Router()

router.route("/addproduct").post(upload.array("images"), addProduct)
router.route("/updateproduct/:productId").put(upload.array("images"), updateProduct)
router.route("/deleteproduct/:productId").delete(deleteProduct)
router.route("/searchproducts").get(searchProduct)
router.route("/filterproducts").get(filterProducts)
router.route("/productdetails/:productId").get(productDetails)
router.route("/sortproducts").get(sortProducts)

export default router;