import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv"

dotenv.config()

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
});

const uploadOnCloudinary = async (productImagesPath) => {
    try {
        if (!productImagesPath) return null;

        const response = await cloudinary.uploader.upload(productImagesPath, {
            folder:"trivana"
        });

        // Delete local file safely
        if (fs.existsSync(productImagesPath)) {
            fs.unlinkSync(productImagesPath);
        }

        return response;
    } catch (error) {
        console.error("Cloudinary upload failed:", error);

        // Try deleting the file only if it exists
        if (fs.existsSync(productImagesPath)) {
            fs.unlinkSync(productImagesPath);
        }

        return null;
    }
};

export { uploadOnCloudinary };
