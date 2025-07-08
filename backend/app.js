import express from "express";
import productRoute from "./routes/product.routes.js";
import userRoute from "./routes/user.routes.js";
import sellerRoute from "./routes/seller.routes.js";
import orderRoute from "./routes/order.routes.js";
import paymentRoute from "./routes/payment.routes.js";
import { stripeWebhook } from "./controllers/payment.controller.js"; // ✅ direct import

const app = express();

app.post("/api/v1/payment/webhook", express.raw({ type: "application/json" }), stripeWebhook);

app.use(express.json());

app.use("/api/v1/product", productRoute);
app.use("/api/v1/user", userRoute);
app.use("/api/v1/seller", sellerRoute);
app.use("/api/v1/order", orderRoute);
app.use("/api/v1/payment", paymentRoute);

export { app };
