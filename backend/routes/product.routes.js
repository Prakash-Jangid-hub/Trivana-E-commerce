import { Router } from "express";
import { addProduct, deleteProduct, filterProducts, productDetails, searchProduct, sortProducts, updateProduct } from "../controllers/product.controller.js";
import { upload } from "../middleware/multer.js"
import { userMiddleware } from "../middleware/user.mid.js";
import { authorizeRole } from "../middleware/authorizerRole.js";

const router = Router()

router.route("/addproduct").post(upload.array("images"), userMiddleware, authorizeRole("seller", "admin"), addProduct)
router.route("/updateproduct/:productId").put(upload.array("images"), userMiddleware, authorizeRole("seller", "admin"), updateProduct)
router.route("/deleteproduct/:productId").delete(userMiddleware, authorizeRole("seller", "admin"), deleteProduct)
router.route("/searchproducts").get(searchProduct)
router.route("/filterproducts").get(filterProducts)
router.route("/productdetails/:productId").get(productDetails)
router.route("/sortproducts").get(sortProducts)

export default router;