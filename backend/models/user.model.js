import mongoose, { Types } from "mongoose";

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    verifyOtp: {
        type: String,
        default: " "
    },
    verifyOtpExpireAt: {
        type: Number,
        default: 0
    },
    resetOtp: {
        type: String,
        default: " "
    },
    resetOtpExpireAt: {
        type: Number,
        default: 0
    },
    isAccountVerified:{
        type: Boolean,
        default: false
    },

    likedProducts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
    }],

    role: {
        type: String,
        enum: ["user", "seller", "admin"],
        default: "user"
    },

    storeName: {
        type: String,
    },
    businessEmail: {
        type: String,
        unique: true
    },
    phone: {
        type: String
    },
    address: {
        type: String
    },
    isVerifiedSeller: {
        type: Boolean,
        default: false
    },
    stripeAccountId: {
        type: String
    },

    cart: [
        {
            product: {
                type: mongoose.Types.ObjectId,
                ref: "Product"
            },
            quantity: {
                type: Number,
                default: 1
            }
        }
    ]
})

export const User = mongoose.model("User", userSchema)