import mongoose from "mongoose";

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("Database connected successfully✅");
    } catch (error) {
        console.error("Error in connecting to database❌", error.message);
        process.exit(1);
    }
}

export { connectDB }