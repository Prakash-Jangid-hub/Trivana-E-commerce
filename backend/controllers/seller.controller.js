import { User } from "../models/user.model.js";
import bcrypt from "bcrypt"
import z from "zod"
import jwt from "jsonwebtoken"


export const registerSeller = async (req, res) => {
    const { fullName, email, password } = req.body

    const sellerSchema = z.object({
        fullName: z.string().min(3, { message: "Fullname must be atleast 3 character long" }),
        email: z.string().email(),
        password: z.string().min(4, { message: "Password must be atleast 4 character long" })
    })

    const validateData = sellerSchema.safeParse(req.body)

    if (!validateData.success) {
        return res.status(400).json({ errors: validateData.error.issues.map((err) => err.message) })
    }

    if (!fullName || !email || !password) {
        console.log("All feilds are required")
        return res.status(400).json({ errors: "All feilds are required" })
    }

    const hashPassword = await bcrypt.hash(password, 10)

    const verifyUser = await User.findOne({ email: email })
    if (verifyUser) {
        console.log("User already exist")
        return res.status(400).json({ errors: "User already exist" })
    }


    try {
        const newUser = new User({
            fullName,
            email,
            password: hashPassword
        })

        await newUser.save()
        console.log("User registered successfully")
        return res.status(200).json({ message: "User registered successfully", newUser })
    } catch (error) {
        console.log("Error in registering user", error)
        return res.status(400).json({ errors: "Error in registering user" })
    }
}

export const loginSeller = async (req, res) => {
    const { email, password } = req.body;


    try {

        if (!email || !password) {
            console.log("All fields are required")
            return res.status(400).json({ errors: "All fields are required" })
        }

        const seller = await User.findOne({ email: email })

        if (!seller) {
            console.log("Invalid credentials")
            return res.status(400).json({ errors: "Invalid credentials" })
        }

        const isPasswordCorrect = await bcrypt.compare(password, seller.password)

        if (!isPasswordCorrect) {
            console.log("Invalid credentials")
            return res.status(400).json({ errors: "Invalid credentials" })
        }

        const token = jwt.sign({
            id: User._id
        },
            process.env.JWT_SECRET_KEY, {
            expiresIn: "1d"
        })

        const cookieOptions = {
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict"
        }

        res.cookie("jwt", token, cookieOptions);
        console.log("Seller logged in successfully", seller)
        return res.status(200).json({ message: "Seller logged in successfully", seller })
    } catch (error) {
        console.log("Error in logging Seller", error)
        return res.status(400).json({ errors: "Error in logging seller", error })
    }
}

export const logoutSeller = async (req, res) => {
    try {
        res.clearCookie("jwt", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: true
        })

        console.log("Seller logged out successfully")
        return res.status(200).json({ message: "Seller logged out successfully" })
    } catch (error) {
        console.log("Error in logging out seller", error)
        return res.status(400).json({ errors: "Error in logging out seller", error })
    }
}