import express from "express"
import { placeOrder } from "../controllers/order.controller.js";
import { userMiddleware } from "../middleware/user.mid.js";

const router = express.Router()

router.route("/placeorder").post(userMiddleware, placeOrder)

export default router;