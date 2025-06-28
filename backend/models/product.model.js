import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    brand: {
        type: String,
        default: "Generic"
    },
    price: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        enum: ["fashion", "tech", "grocery"],
        required: true
    },
    stock: {
        type: Number,
        required: true,
        default: 0
    },
    rating: {
        type: Number,
        default: 0
    },
    productImages: [{
        type: String
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    },

    //fashion
    size: {
        type: [String]
    },
    color: {
        type: [String]
    },
    material: {
        type: String
    },
    gender: {
        type: String
    },

    // Tech
    warranty: {
        type: String
    },
    specs: {
        type: Map, of: String
    },

    //grocery
    weight: {
        type: String
    },
    expiryDate: {
        type: Date
    }



},
    { timestamps: true }
);

export const Product = mongoose.model("Product", productSchema);