import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import Stripe from 'stripe';

const http = httpRouter();

http.route({
    path: "/stripe_webhook",
    method: "POST",
    handler: httpAction(async (ctx, request) => {
        const signature = request.headers.get("stripe-signature") as string;
        const body = await request.text();

        const stripe = new Stripe(process.env.STRIPE_KEY!, {
            apiVersion: '2025-12-15.clover',
        });

        // Verify webhook signature (using a specific webhook secret would be better for prod)
        // For now, we'll try to parse the event safely. 
        // In a real app, you MUST use constructEvent with process.env.STRIPE_WEBHOOK_SECRET
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
        if (!webhookSecret) {
            console.error("Missing STRIPE_WEBHOOK_SECRET environment variable");
            return new Response("Server Configuration Error", { status: 500 });
        }

        let event: Stripe.Event;
        try {
            event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        } catch (err: any) {
            console.error(`Webhook Signature Verification Failed: ${err.message}`);
            return new Response(`Webhook Error: ${err.message}`, { status: 400 });
        }

        switch (event.type) {
            case 'checkout.session.completed':
                const session = event.data.object as Stripe.Checkout.Session;
                const userId = session.metadata?.userId;
                const priceId = session.metadata?.priceId;

                // TODO: Map Price IDs to logic
                // Lifetime ID: price_1SlpqyLQXrapzCX8bubgyJ0C

                if (userId && priceId) {
                    await ctx.runMutation(internal.users.fulfillPurchase, {
                        userId,
                        priceId,
                        paymentStatus: session.payment_status
                    });
                }
                break;
            default:
                console.log(`Unhandled event type ${event.type}`);
        }

        return new Response(null, { status: 200 });
    }),
});

export default http;
