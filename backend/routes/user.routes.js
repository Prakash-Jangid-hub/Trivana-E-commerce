import express from "express";
import { addToCart, verifyEmail, getAllCartProducts, getLikedProducts, likeProduct, loginUser, logoutUser, registerUser, removeCartProduct, sendVerifyOtp, showPlacedOrders, sendResetPasswordOtp, resetPassword } from "../controllers/user.controller.js";
import { userMiddleware } from "../middleware/user.mid.js";
import { authorizeRole } from "../middleware/authorizerRole.js";
import { becomeSeller, getSellerOrders, showSellerProducts } from "../controllers/seller.controller.js";

const router = express.Router()

router.route("/signup").post(registerUser)
router.route("/login").post(loginUser)
router.route("/logout").delete(logoutUser)

router.route("/likeproduct/:productId").post(userMiddleware, likeProduct)
router.route("/likedproducts").get(userMiddleware, getLikedProducts)

router.route("/addtocart").post(userMiddleware, addToCart)
router.route("/removefromcart/:productId").delete(userMiddleware, removeCartProduct)
router.route("/getallcartproducts").get(userMiddleware, getAllCartProducts)

router.route("/sendverifyotp").post(userMiddleware, sendVerifyOtp)
router.route("/checkverifyotp").post(userMiddleware, verifyEmail)

router.route("/sendresetpasswordotp").post(sendResetPasswordOtp)
router.route("/resetpassword").post(resetPassword)


router.route("/showplacedorders").get(userMiddleware, showPlacedOrders)

router.route("/becomeseller").post(userMiddleware, becomeSeller)
router.route("/showSellerProducts").get(userMiddleware, authorizeRole("seller", "admin"), showSellerProducts)
router.route("/getsellerorders").get(userMiddleware, authorizeRole("seller", "admin"), getSellerOrders)

export default router