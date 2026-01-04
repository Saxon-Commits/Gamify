import { v } from "convex/values";
import { action, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import Stripe from 'stripe';

export const createCheckoutSession = action({
    args: { priceId: v.string() },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Not authenticated");
        }

        const stripe = new Stripe(process.env.STRIPE_KEY!, {
            apiVersion: '2025-12-15.clover', // Use latest or pinned version
        });

        const domain = process.env.HOST_URL || 'http://localhost:5173';

        const session = await stripe.checkout.sessions.create({
            line_items: [
                {
                    price: args.priceId,
                    quantity: 1,
                },
            ],
            mode: 'payment', // 'subscription' for Pro, 'payment' for Lifetime/Gems
            success_url: `${domain}/app/settings?success=true`,
            cancel_url: `${domain}/app/settings?canceled=true`,
            metadata: {
                userId: identity.tokenIdentifier, // Pass Full Token Identifier for database lookup
                priceId: args.priceId
            },
        });

        return session.url;
    },
});
