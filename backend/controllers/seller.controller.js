import { User } from "../models/user.model.js";
import { Product } from "../models/product.model.js";
import { Order } from "../models/order.model.js"
import z from "zod"
import mongoose from "mongoose";


export const becomeSeller = async (req, res) => {
    const userId = req.userId;
    const { storeName, businessEmail, address, phone, stripeAccountId } = req.body;

    if (!storeName || !businessEmail || !address || !phone || !stripeAccountId) {
        console.log("All fields are required")
        return res.status(400).json({ errors: "All fileds are required" })
    }

    const sellerSchema = await z.object({
        storeName: z.string().min(2, "Store name is too short"),
        businessEmail: z.string().email("Invalid email"),
        phone: z.string().regex(/^[6-9]\d{9}$/, {
            message: "Phone number must be a valid 10-digit Indian number"
        }),
        address: z.string().optional()
    })

    const validateSellerSchema = sellerSchema.safeParse(req.body)

    if (!validateSellerSchema.success) {
        console.log("Invalid data credentials")
        return res.status(400).json({ errors: validateSellerSchema.error.issues.map((err) => err.message) })
    }

    try {
        const user = await User.findById(userId)

        if (!user) {
            console.log("User not found")
            return res.status(400).json({ errors: "User not found" })
        }

        Object.assign(user, {
            role: "seller",
            storeName,
            businessEmail,
            address,
            phone,
            stripeAccountId,
            isVerifiedSeller: false
        })

        await user.save();

        console.log("You have become a seller now", user);
        return res.status(200).json({ message: "You have become a seller now", user })
    } catch (error) {
        console.log("Failed to register as a seller", error)
        return res.status(400).json({ errors: "Failed to register as a seller" })
    }

};

export const showSellerProducts = async (req, res) => {
    const userId = req.userId;

    try {
        const products = await Product.find({ creator: userId })

        if (!products || products.length === 0) {
            console.log("No products found")
            return res.status(400).json({ errors: "No products found" })
        }

        console.log("Seller products fetched successfully", products)
        return res.status(200).json({ message: "Seller products fetched successfully", products })

    } catch (error) {
        console.log("Failed to fetch seller products", error)
        return res.status(400).json({ errors: "Failed to fetch seller products" })
    }
};

export const getSellerOrders = async (req, res) => {
    const userId = req.userId;

    try {
        const orders = await Order.aggregate([
            { $unwind: "$orderItems" },

            {
                $lookup: {
                    from: "products",
                    localField: "orderItems.product",
                    foreignField: "_id",
                    as: "productDetails"
                }
            },

            { $unwind: "$productDetails" },

            {
                $match: {
                    "productDetails.creator": new mongoose.Types.ObjectId(userId)
                }
            },

            {
                $group: {
                    _id: "$_id",
                    user: { $first: "$user" },
                    shippingAddress: { $first: "$shippingAddress" },
                    paymentMethod: { $first: "$paymentMethod" },
                    totalPrice: { $first: "$totalPrice" },
                    orderItems: { $push: "$orderItems" },
                    createdAt: { $first: "$createdAt" }
                }
            },

            { $sort: { createdAt: -1 } }
        ]);

        return res.status(200).json({ message: "Orders fetched successfully", orders })
    } catch (error) {
        console.error("Aggregation error:", error);
        res.status(500).json({ errors: "Aggregation error:" });
    }
};

export const getTotalRevenue = async (req, res) => {
    const userId = req.userId;

    try {
        console.log(userId)
        const totalRevenue = await Order.aggregate([
            { $unwind: "$orderItems" },

            {
                $lookup: {
                    from: "products",
                    localField: "orderItems.product",
                    foreignField: "_id",
                    as: "productDetails"
                }
            },
            { $unwind: "$productDetails" },

            {
                $match: {
                    "productDetails.creator": new mongoose.Types.ObjectId(userId)
                }
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: {
                        $sum: {
                            $multiply: ["$orderItems.quantity", "$productDetails.price"]
                        }
                    }
                }
            }
        ]);

        const revenue = totalRevenue[0]?.totalRevenue || 0;

        console.log("Total Revenue fetched successfully", revenue);
        return res
            .status(200)
            .json({ message: "Total Revenue fetched successfully", revenue, totalRevenue });
    } catch (error) {
        console.log("Failed to fetch Total Revenue", error);
        return res
            .status(400)
            .json({ errors: "Failed to fetch Total Revenue"});
    }
};
