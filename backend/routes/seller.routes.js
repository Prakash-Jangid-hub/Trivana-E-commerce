import express from "express"
import { loginSeller, logoutSeller, registerSeller } from "../controllers/seller.controller.js";

const router = express.Router();

router.route("/signup").post(registerSeller)
router.route("/login").post(loginSeller)
router.route("/logout").delete(logoutSeller)

export default router;