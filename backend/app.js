import express from "express";
const app = express()
import productRoute from "./routes/product.routes.js"
import userRoute from "./routes/user.routes.js"
import sellerRoute from "./routes/seller.routes.js"

app.use(express.json())

app.use("/api/v1/product", productRoute)
app.use("/api/v1/user", userRoute)
app.use("/api/v1/seller", sellerRoute)


export { app }

