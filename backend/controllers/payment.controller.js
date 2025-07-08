// backend/controllers/payment.controller.js
import Stripe from "stripe";
import { Order } from "../models/order.model.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const stripeWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];

    let event;
    try {
        event = stripe.webhooks.constructEvent(
            req.rawBody,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.log("Webhook signature verification failed", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the completed checkout session
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;

        try {
            const newOrder = await Order.create({
                user: session.metadata.userId,
                orderItems: JSON.parse(session.metadata.orderItems),
                shippingAddress: JSON.parse(session.metadata.shippingAddress),
                paymentMethod: "stripe",
                itemsPrice: session.metadata.itemsPrice,
                shippingPrice: session.metadata.shippingPrice,
                taxPrice: session.metadata.taxPrice,
                totalPrice: session.metadata.totalPrice,
                isPaid: true,
                paidAt: new Date(),
                paymentResult: {
                    id: session.id,
                    status: session.payment_status,
                    email_address: session.customer_email,
                },
            });

            console.log("Order saved from Stripe webhook", newOrder);
        } catch (error) {
            console.log("Failed to save order from webhook", error.message);
            return res.status(500).json({ error: "Failed to create order" });
        }
    }

    res.status(200).json({ received: true });
};
