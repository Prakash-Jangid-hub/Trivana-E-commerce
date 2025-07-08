import z from "zod"
import bcrypt from "bcrypt"
import { User } from "../models/user.model.js"
import jwt from "jsonwebtoken"
import { Order } from "../models/order.model.js";
import transporter from "../config/nodemailer.js";


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
};

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
                id: user._id
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

        const mailOptions = {
            from: "kanekiken8333@gmail.com",
            to: email,
            subject: "Welcome to Trivana, Your own Super Market",
            text: `Welcome to trivana. Your account has been created with email id: ${email}`
        }

        await transporter.sendMail(mailOptions);

        res.cookie("jwt", token, cookieOptions);
        console.log("User logged in successfully")
        return res.status(200).json({ message: "User logged in successfully", user, token })
    } catch (error) {
        console.log("Error in logging user", error)
        return res.status(400).json({ errors: "Error in logging user", error })
    }
};

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
};

export const sendVerifyOtp = async (req, res) => {
    const userId = req.userId
    try {
        const user = await User.findById(userId)

        if (user.isAccountVerified) {
            console.log("Account is already verified")
            return res.status(400).json({ errors: "Account is already verified" })
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000))

        user.verifyOtp = otp;

        user.verifyOtpExpireAt = Date.now() + 1 * 60 * 60 * 1000;

        await user.save();

        const mailOptions = {
            from: "kanekiken8333@gmail.com",
            to: user.email,
            subject: "Account verification OTP",
            text: `Your OTP is ${otp}. Verify your account using this OTP`
        };

        await transporter.sendMail(mailOptions)

        console.log("Verification otp send on email")
        return res.status(400).json({ message: "Verification OTP sent on Email" })
    } catch (error) {
        console.log("Error in sending verification otp", error)
        return res.status(400).json({ errors: "Error in sending verification otp" })
    }
};

export const verifyEmail = async (req, res) => {
    const userId = req.userId;
    const { verifyOtp } = req.body;

    try {
        const user = await User.findById(userId);

        if (user.isAccountVerified) {
            console.log("Account is already verified")
            return res.status(400).json({ errors: "Account is already verified" })
        }

        if (!verifyOtp) {
            console.log("Missing details")
            return res.status(400).json({ errors: "Missing details" })
        }

        if (user.verifyOtp === "" || user.verifyOtp !== verifyOtp) {
            console.log("Invalid OTP")
            return res.status(400).json({ errors: "Invalid OTP" })
        }

        if (user.verifyOtpExpireAt < Date.now()) {
            console.log("OTP has been expired")
            return res.status(400).json({ errors: "OTP has been expired" })
        }

        user.isAccountVerified = true;
        user.verifyOtp = "";
        user.verifyOtpExpireAt = 0;

        await user.save();

        console.log("Account verified successfully");
        return res.status(200).json({ message: "Account verified successfully" })
    } catch (error) {
        console.log("Failed to verify user")
        return res.status(400).json({ errors: "Failed to verify user" })
    }
};

export const sendResetPasswordOtp = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ errors: "Email is required" })
    }

    try {
        const user = await User.findOne({ email: email });

        if (!user || user.email !== email) {
            console.log("Invalid email")
            return res.status(400).json({ errors: "Invalid email" })
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000))

        user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000;
        user.resetOtp = otp;

        const mailOptions = {
            from: "kanekiken8333@gmail.com",
            to: user.email,
            subject: "Password reset OTP",
            text: `Your OTP is ${otp}. Reset your account password using this OTP`
        }

        await transporter.sendMail(mailOptions)

        await user.save()

        console.log("Password reset OTP has been sent on Email");
        return res.status(200).json({ message: "Password reset OTP has been sent on Email" })
    } catch (error) {
        console.log("Error in sending password reset OTP", error)
        return res.status(400).json({ errors: "Error in sending password reset OTP" })
    }
};

export const resetPassword = async (req, res) => {
    const { resetOtp, newPassword, email } = req.body;

    if (!resetOtp || !newPassword || !email) {
        return res.status(400).json({ errors: "Email, OTP and newPassword are required" })
    }

    try {
        const user = await User.findOne({ email: email })

        if (!user || user.email !== email) {
            console.log("Invalid email")
            return res.status(400).json({ errors: "Invalid email" })
        };

        if (user.resetOtp !== resetOtp || user.resetOtp === "") {
            return res.status(400).json({ errors: "Invalid OTP" })
        };

        if (user.resetOtpExpireAt < Date.now()) {
            return res.status(400).json({ errors: "OTP has been expired" })
        };

        const hashPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashPassword;
        user.resetOtp = "";
        user.resetOtpExpireAt = 0;

        await user.save()

        console.log("User password has been reset successfully")
        return res.status(200).json({ message: "User password has been reset successfully" })


    } catch (error) {
        console.log("Failed to reset password")
        return res.status(400).json({ errors: "Failed to reset password" })
    }
};

export const likeProduct = async (req, res) => {
    const { productId } = req.params;
    const userId = req.userId;

    console.log("Like product route hit");
    console.log("User ID from middleware:", userId);
    console.log("Product ID:", productId);

    try {
        const user = await User.findById(userId);

        if (!user) {
            console.log("User not found");
            return res.status(404).json({ errors: "User not found" });
        }

        if (user.likedProducts.includes(productId)) {
            user.likedProducts.pull(productId);
        } else {
            user.likedProducts.push(productId);
        }

        await user.save();

        return res
            .status(200)
            .json({ message: "Like updated", likedProducts: user.likedProducts });
    } catch (error) {
        console.log("Like update error", error.message);
        return res.status(400).json({ errors: "Like update error" });
    }
};

export const getLikedProducts = async (req, res) => {
    const userId = req.userId;

    try {
        const user = await User.findById(userId);

        const products = user.likedProducts

        console.log("Liked products fetched successfully",)
        return res.status(200).json({ message: "Liked products fecthed successfully", products })
    } catch (error) {
        console.log("Failed to fetch like products", error)
        return res.status(400).json({ errors: "Failed to fetch liked products" })
    }
};

export const addToCart = async (req, res) => {
    const { productId, quantity } = req.body;
    const userId = req.userId;

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const itemIndex = user.cart.findIndex(
            item => item.product?.toString() === productId
        );

        if (itemIndex > -1) {
            user.cart[itemIndex].quantity += quantity;
        } else {
            user.cart.push({
                product: productId,
                quantity
            });
        }

        await user.save();

        console.log("Product added to cart successfully");
        return res.status(200).json({
            message: "Product added to cart successfully",
            cart: user.cart
        });

    } catch (error) {
        console.error("Failed to add product in cart", error);
        return res.status(500).json({ error: "Failed to add product in cart" });
    }
};

export const removeCartProduct = async (req, res) => {
    const userId = req.userId;
    const { productId } = req.params;

    try {
        const user = await User.findById(userId)

        if (!user) {
            console.log("User not found")
            return res.status(400).json({ errors: "User not found" })
        }

        user.cart = user.cart.filter(item => item.product.toString() !== productId)

        await user.save()

        const userCart = user.cart
        console.log("Product removed from cart successfully")
        return res.status(200).json({ message: "Product removed from cart successfully", userCart })
    } catch (error) {
        console.log("Failed to remove product from cart", error)
        return res("Failed to remove product from cart")
    }
};

export const getAllCartProducts = async (req, res) => {
    const userId = req.userId

    try {
        const user = await User.findById(userId);

        if (!user) {
            console.log("User not found")
            return res.status(400).json({ errors: "User not found" })
        }

        const products = user.cart

        console.log("Cart products fetched successfully")
        return res.status(200).json({ message: "Cart products fetched successfully", products })
    } catch (error) {
        console.log("Failed to fetch cart products")
        return res.status(400).json({ errors: "Failed to fetch cart products" })
    }
};

export const showPlacedOrders = async (req, res) => {
    const userId = req.userId

    try {
        const products = await Order.find({ user: userId });

        if (!products || products.length === 0) {
            console.log("Didn't place any order yet")
            return res.status(400).json({ errors: "Didn't place any order yet" })
        }

        console.log("Placed orders fetched successfully", products)
        return res.status(200).json({ message: "Placed orders fetched successfully", products })

    } catch (error) {
        console.log("Failed to fetch placed orders", error)
        return res.status(400).json({ errors: "Failed to fetch placed orders" })
    }
};