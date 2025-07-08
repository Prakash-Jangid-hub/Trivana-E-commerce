import jwt from "jsonwebtoken";
import { JWT_SECRET_KEY } from "../config/config.js";


export const userMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    console.log("Inside middleware");

    if (!authHeader || !authHeader.startsWith("Bearer")) {
        console.log("No token or invalid format");
        return res.status(400).json({ errors: "No token provided" });
    }
     console.log("Inside middleware");
    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET_KEY);
        req.userId = decoded.id;
         console.log(req.userId);
        next();

    } catch (error) {
        console.log("Invalid token or expired", error.message);
        return res.status(400).json({ errors: "Invalid token or expired" });
    }
};
