import { Order } from "../models/order.model.js";
import { Product } from "../models/product.model.js";
import Stripe from "stripe";


export const placeOrder = async (req, res) => {
    const userId = req.userId;
    const {
        orderItems,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        shippingPrice,
        taxPrice,
        totalPrice
    } = req.body;

    try {
        if (!orderItems || !orderItems.length === 0) {
            console.log("No order items")
            return res.status(400).json({ errors: "No order items" })
        }

        let productsPrice = 0;
        let allPrice = 0;

        for (const item of orderItems) {
            const product = await Product.findById(item.product)

            if (!product) {
                console.log("Invalid product in order")
                return res.status(400).json({ errors: "Invalid product in order" })
            }

            productsPrice += product.price * item.quantity

            allPrice = productsPrice + taxPrice + shippingPrice
        }

        if (paymentMethod === "cod") {
            const order = new Order({
                user: userId,
                orderItems,
                shippingAddress,
                paymentMethod,
                itemsPrice: productsPrice,
                shippingPrice,
                taxPrice,
                totalPrice: allPrice,
                isPaid: paymentMethod === "cod" ? false : false
            });

            const newOrder = await order.save()
            console.log("Order placed successfully", newOrder)
            return res.status(200).json({ message: "Order placed successfully", newOrder })
        }

        if (paymentMethod === "stripe") {
            const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

            const line_items = orderItems.map(item => ({
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: item.name,
                    },
                    unit_amount: item.price * 100,
                },
                quantity: item.quantity,
            }));

            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                mode: 'payment',
                line_items,
                success_url: `${process.env.CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${process.env.CLIENT_URL}/cart`,
                metadata: {
                    userId,
                    shippingAddress: JSON.stringify(shippingAddress),
                    orderItems: JSON.stringify(orderItems),
                    taxPrice,
                    shippingPrice,
                    itemsPrice: productsPrice,
                    totalPrice: allPrice,
                },
            });

            return res.status(200).json({ url: session.url }); // ✅ Send session URL to frontend
        }



    } catch (error) {
        console.log("Failed to place order", error)
        return res.status(400).json({ errors: "Failed to place order" })
    }
};

