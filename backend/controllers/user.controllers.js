import z from "zod"
import bcrypt from "bcrypt"
import { User } from "../models/user.model.js"
import jwt from "jsonwebtoken"


export const registerUser = async (req, res) => {

    const { fullName, email, password } = req.body

    if (!fullName || !email || !password) {
        console.log("All feilds are required")
        return res.status(400).json({ errors: "All fields are required" })
    }

    const userSchema = await z.object({
        fullName: z.string().min(3, { message: "Fullname must be atleast 3 character long" }),
        email: z.string().email(),
        password: z.string().min(5, { message: "Password must be atleast 5 character long" })
    })

    const validateData = userSchema.safeParse(req.body)

    if (!validateData.success) {
        return res.status(400).json({ errors: validateData.error.issues.map((err) => err.message) })
    }


    const hashPassword = await bcrypt.hash(password, 10)

    const verifyUser = await User.findOne({ email: email })

    if (verifyUser) {
        console.log("User already exist")
        return res.status(400).json({ errors: "User already exist" })
    }

    try {
        const user = new User({
            fullName,
            email,
            password: hashPassword
        })

        await user.save()
        console.log("User registered successfully", user)
        return res.status(200).json({ message: "User registered successfully", user })
    } catch (error) {
        console.log("Error in registering user", error)
        return res.status(400).json({ errors: "Error in registering user", error })
    }
}

export const loginUser = async (req, res) => {
    const { email, password } = req.body;


    try {

        if (!email || !password) {
            console.log("Invalid credentials")
            return res.status(400).json({ errors: "Invalid credentials" })
        }

        const user = await User.findOne({ email: email })

        if (!user) {
            console.log("Invalid credentials")
            return res.status(400).json({ errors: "Invalid credentials" })
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if (!isPasswordCorrect) {
            console.log("Invalid credentials")
            return res.status(400).json({ errors: "Invalid credentials" })
        }

        const token = jwt.sign(
            {
                id: User._id
            },
            process.env.JWT_SECRET_KEY,
            {
                expiresIn: "1d"
            }
        )

        const cookieOptions = {
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV === "production"
        }

        console.log("User logged in successfully")
        return res.status(200).json({ message: "User logged in successfully", user, token })
    } catch (error) {
        console.log("Error in logging user", error)
        return res.status(400).json({ errors: "Error in logging user", error })
    }
}

export const logoutUser = async (req, res) => {
    try {
        res.clearCookie("jwt", {
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV === "production"
        })

        console.log("User logged out successfully")
        return res.status(200).json({ message: "User logged out successfully" })
    } catch (error) {
        console.log("Error in logging out user", error)
        return res.status(400).json({ errors: "Error in logging out user", error })
    }
}

//testing due
export const likeProduct = async (req, res) => {
    const { productId } = req.params;
    const userId = req.user._id;

    try {
        const user = await User.findById(userId)

        if (user.likedProducts.includes(productId)) {
            user.likedProducts.pull(productId)
        } else {
            user.likedProducts.push(productId)
        }

        await user.save();
        return res.status(200).json({ message: "Like updated", likedProducts: user.likedProducts })

    } catch (error) {
        console.log("Like update error", error)
        return res.status(400).json({ errors: "Like update error" })
    }
}

export const getLikedProducts = async (req, res) => {
    const userId = req.user._id;

    try {
        const user = await User.findById(userId);

        const products = user.likedProducts

        console.log("Liked products fetched successfully",)
        return res.status(200).json({ message: "Liked products fecthed successfully", products })
    } catch (error) {
        console.log("Failed to fetch like products", error)
        return res.status(400).json({ errors: "Failed to fetch liked products" })
    }
}
