import { User } from "../models/user.model.js"


export const authorizeRole = (...roles) => {
    return async (req, res, next) => {
        const userId = req.userId;
        console.log(userId)
        try {
            const user = await User.findById(userId)
            console.log(user)
            if (!user) {
                console.log("User not found")
                return res.status(400).json({ errors: "User not found" })
            }

            if (!roles.includes(user.role)) {
                console.log("You are not authorized for this action")
                return res.status(400).json({ errors: "You are not authorized for this action" })
            }

            next();
        } catch (error) {
            console.log("Server error in role check", error)
            return res.status(500).json({ errors: "Server error in role check" });
        }

    }
}