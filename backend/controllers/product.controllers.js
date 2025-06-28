import { Product } from "../models/product.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js"


export const addProduct = async (req, res) => {
    try {
        const {
            name,
            description,
            brand,
            price,
            category,
            stock,
            size,
            color,
            material,
            gender,
            warranty,
            specs,
            weight,
            expiryDate
        } = req.body;




        // 🔐 Base validations

        if (!name || !description || !brand || !price || !category || !stock) {
            console.log("Name, description, brand, price, category and stock are required for product")
            return res.status(400).json({ errors: "Name, description, brand, price, category and stock are required for product" })
        }

        // 🔐 Category-based validations

        if (category === "fashion") {
            if (!size || size.length === 0 || !color || color.length === 0 || !material || !gender) {
                console.log("Fashion items must include size, color, material and gender")
                return res.status(400).json({ errors: "Fashion items must include size, color, material and gender" })
            }
        }

        if (category === "tech") {
            if (!specs || !warranty) {
                console.log("Tech items must include spces and warrenty")
                return res.status(400).json({ errors: "Tech items must include spces and warrenty" })
            }
        }

        if (category === "grocery") {
            if (!weight || !expiryDate) {
                console.log("Grocery items must include weight and expiryDate")
                return res.status(400).json({ errors: "Grocery items must include weight and expiryDate" })
            }
        }

        if (!req.files || req.files.length === 0) {
            console.log("Image files required");
            return res.status(400).json({ error: "At least one image is required." });
        }

        const productImagesPath = req.files.map(file => file.path)

        if (!productImagesPath) {
            console.log("Products images required")
        }

        const allowedFormat = ["image/png", "image/jpeg", "image/jpg"]
        const isAllImagesValid = req.files.every(file => allowedFormat.includes(file.mimetype))

        if (!isAllImagesValid) {
            console.log("Invalid image format found");
            return res.status(400).json({ error: "Only PNG, JPEG, and JPG formats are allowed." });
        }

        const cloudResults = await Promise.all(
            req.files.map(file => uploadOnCloudinary(file.path))
        );

        const imageUrls = cloudResults.map(r => r?.secure_url).filter(Boolean);


        // ✅ Build product object

        const productData = {
            name,
            description,
            brand,
            price,
            category,
            stock,
            productImages: imageUrls
        }

        //✅ Assign extra fields in product data

        if (category === "fashion") {
            Object.assign(productData, { size, color, material, gender });
        }
        else if (category === "tech") {
            Object.assign(productData, { specs, warranty })
        }
        else if (category === "grocery") {
            Object.assign(productData, { weight, expiryDate })
        }

        const newProduct = await Product.create(productData)
        console.log("sucess", newProduct)
        return res.status(200).json({ message: "Product added successfully!", newProduct })


    } catch (error) {
        console.log("Failed to add product", error)
        return res.status(400).json({ errors: "Failed to add product. Please try again!" })
    }
}

export const updateProduct = async (req, res) => {
    const { productId } = req.params;
    const {
        name,
        description,
        brand,
        price,
        category,
        stock,
        size,
        color,
        material,
        gender,
        warranty,
        specs,
        weight,
        expiryDate
    } = req.body;

    try {
        const product = await Product.findById(productId)

        if (!product) {
            console.log("Product not found");
            return res.status(400).json({ errors: "Product not found" })
        }

        console.log("success1")


        const productImagesPath = req.files.map(file => file.path)

        if (!productImagesPath) {
            console.log("Products images required")
        }

        const allowedFormat = ["image/png", "image/jpeg", "image/jpg"]
        const isAllImagesValid = req.files.every(file => allowedFormat.includes(file.mimetype))

        if (!isAllImagesValid) {
            console.log("Invalid image format found");
            return res.status(400).json({ error: "Only PNG, JPEG, and JPG formats are allowed." });
        }

        const cloudResults = await Promise.all(
            req.files.map(file => uploadOnCloudinary(file.path))
        );

        const imageUrls = cloudResults.map(r => r?.secure_url).filter(Boolean);
        const commonFields = { name, description, brand, price, category, stock };

        // ✅ Step 2: Category-specific fields

        const fashion = { size, color, material, gender };
        const tech = { specs, warranty };
        const grocery = { weight, expiryDate };

        let fieldsToUpdate = {}

        if (category === "fashion") {
            if (!size || size.length === 0 || !color || color.length === 0 || !material || !gender) {
                console.log("Fashion items must include size, color, material and gender")
                return res.status(400).json({ errors: "Fashion items must include size, color, material and gender" })
            }

            fieldsToUpdate = {
                ...commonFields,
                ...fashion
            }
        }
        else if (category === "tech") {
            if (!specs || !warranty) {
                console.log("Tech items must include spces and warrenty")
                return res.status(400).json({ errors: "Tech items must include spces and warrenty" })
            }

            fieldsToUpdate = {
                ...commonFields,
                ...tech
            }
        }
        else if (category === "grocery") {
            if (!weight || !expiryDate) {
                console.log("Grocery items must include weight and expiryDate")
                return res.status(400).json({ errors: "Grocery items must include weight and expiryDate" })
            }

            fieldsToUpdate = {
                ...commonFields,
                ...grocery
            }
        }

        // ✅ Step 4: Assign only non-undefined fields
        Object.entries(fieldsToUpdate).forEach(([key, value]) => {
            if (value !== undefined) {
                product[key] = value;
            }
        });

        fieldsToUpdate.images = imageUrls



        const productUpdate = await Product.findOneAndUpdate(
            {
                _id: productId
            },
            {
                ...fieldsToUpdate
            },
            {
                new: true
            }
        )

        console.log("success4")

        if (!productUpdate) {
            return res.status(403).json({ errors: "Not authorized to update this product" });
        }

        console.log("Product updated successfully")
        return res.status(200).json({ message: "Product updated successfully", productUpdate })

    } catch (error) {
        console.log(error)
        return res.status(400).json({ errors: "Error in updating product data", error })
    }
}

export const deleteProduct = async (req, res) => {
    const { productId } = req.params;
    try {
        const product = await Product.findByIdAndDelete(productId)

        if (!product) {
            console.log("Product not found")
            return res.status(400).json({ errors: "Product not found" })
        }

        return res.status(200).json({ message: "Product deleted successfully" })
    } catch (error) {
        console.log("Error in deleting the product", error)
        return res.status(400).json({ errors: "Error in deleting the product" })
    }
}

export const searchProduct = async (req, res) => {

    try {
        const keyword = req.query.search ? {
            name: { $regex: req.query.search, $options: "i" },
            description: { $regex: req.query.search, $options: "i" }
        } : {}


        const products = await Product.find({ ...keyword })
        return res.status(200).json({ message: "Success", products })
    } catch (error) {
        console.log("failed", error)
        return res.status(400).json({ error: "failed", error })

    }
}

export const filterProducts = async (req, res) => {
    try {
        const min = parseInt(req.query.min) || 0;
        const max = parseInt(req.query.max) || Number.MAX_SAFE_INTEGER;
        const price = { price: { $gte: min, $lte: max } };

        const brand = req.query.brand ? {
            brand: { $regex: req.query.brand, $options: "i" }
        } : {};


        //fashion
        const gender = req.query.gender ? {
            gender: { $regex: req.query.gender, $options: "i" }
        } : {};

        const material = req.body.material ? {
            material: { $regex: req.query.material, $options: "i" }
        } : {};

        const color = req.body.color ? {
            color: { $regex: req.query.color, $options: "i" }
        } : {};

        const size = req.query.size ? {
            size: { $regex: req.query.size, $options: "i" }
        } : {};



        const filters = { ...price, ...brand, ...gender, ...material, ...color, ...size }

        const products = await Product.find(filters)
        return res.status(200).json({ message: "Filtered products fetched successfully", products })
    } catch (error) {
        console.log("Failed to filter products", error)
    }
}

export const productDetails = async (req, res) => {
    const { productId } = req.params;

    try {
        const product = await Product.findById(productId);

        if (!product) {
            console.log("Product not found");
            return res.status(404).json({ error: "Product not found" });
        }

        console.log("Product fetched successfully");
        return res.status(200).json({ message: "Product fetched successfully", product });
    } catch (error) {
        console.error("Failed to fetch product:", error.message);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export const sortProducts = async (req, res) => {
    const sortOrder = req.query.sort === "desc" ? -1 : 1;
    const sortBy = req.query.sortBy || "price";

    try {
        const products = await Product.find().sort({ [sortBy]: sortOrder })

        console.log("Products fetched in order successfully")
        return res.status(200).json({ message: "Products fetched in order successfully", products })
    } catch (error) {
        console.log("Failed to fetch products in order", error)
        return res.status(400).json({ errors: "Failed to fetch products in order" })
    }
}


