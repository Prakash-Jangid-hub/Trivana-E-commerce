import express from "express"
import { userMiddleware } from "../middleware/user.mid.js";
import { authorizeRole } from "../middleware/authorizerRole.js";
import { getTotalRevenue } from "../controllers/seller.controller.js";


const router = express.Router();

router.route("/gettotalrevenue").get(userMiddleware, authorizeRole("seller", "admin"), getTotalRevenue)

export default router;