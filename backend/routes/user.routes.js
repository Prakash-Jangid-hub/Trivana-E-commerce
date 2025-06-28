import express from "express";
import { getLikedProducts, likeProduct, loginUser, logoutUser, registerUser } from "../controllers/user.controllers.js";

const router = express.Router()

router.route("/signup").post(registerUser)
router.route("/login").post(loginUser)
router.route("/logout").delete(logoutUser)
router.route("/likeproduct/:productId").post(likeProduct)
router.route("/likedproducts").get(getLikedProducts)

export default router