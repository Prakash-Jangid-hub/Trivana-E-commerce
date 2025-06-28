import { connectDB } from "./db/db.js";
import { app } from "./app.js";
import dotenv from "dotenv"

dotenv.config()

connectDB().then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is listening on port ${process.env.PORT}`)
    })
}).catch((error) => {
    console.log("MongoDB connection failed !!!", error)
})