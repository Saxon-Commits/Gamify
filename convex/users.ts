import { v } from "convex/values";
import { internalMutation, query } from "./_generated/server";

// Price IDs (We could move these to a shared config)
const PRICES = {
    LIFETIME: 'price_1SlpqyLQXrapzCX8bubgyJ0C',
    PRO_MONTHLY: 'price_PRO_PLACEHOLDER', // TODO: Update
    GEMS_500: 'price_GEMS_PLACEHOLDER', // TODO: Update
};

export const fulfillPurchase = internalMutation({
    args: {
        userId: v.string(), // This is the Clerk Subject ID (tokenIdentifier suffix)
        priceId: v.string(),
        paymentStatus: v.string(),
    },
    handler: async (ctx, args) => {
        if (args.paymentStatus !== 'paid') {
            console.error("Payment not paid", args);
            return;
        }

        // FIND USER
        // Note: Our schema indexes by `tokenIdentifier`. 
        // Clerk IDs (user_2p...) are usually the suffix or the whole thing depending on how we store it.
        // In `gameState.ts`, we see `identity.subject` being used.
        // Let's assume `userId` passed here is the `tokenIdentifier` (or strict match).

        // We'll search for the user by tokenIdentifier
        // Since we don't have the full "issuer|subject" string from the webhook metadata (just subject),
        // we might need to do a slightly looser search or ensure we store just the subject.
        // But traditionally `tokenIdentifier` is `issuer|subject`.

        // Wait, pay.ts sends `identity.subject`. 
        // Let's create a helper or just search by tokenIdentifier if we can reconstruct it, 
        // OR simply rely on the fact that for now we might need to query safely.

        // Actually, let's look at `gameState.ts` logic? 
        // It uses `ctx.auth.getUserIdentity()`.

        // For now, let's assume we can query `users` by `tokenIdentifier`. 
        // Since `identity.tokenIdentifier` is the full string, and we passed `identity.subject`?
        // Ah, `pay.ts` passed `identity.subject`. That is NOT the tokenIdentifier.
        // We should probably pass `identity.tokenIdentifier` in `pay.ts` to be safe/consistent.

        // Let's fix `pay.ts` in a moment. For now, let's assume we receive the correct ID.
        // Or better: Let's query by `tokenIdentifier` prefix if possible? No.

        // REVISION: I will update `pay.ts` to pass `identity.tokenIdentifier` instead of `subject`.

        const user = await ctx.db
            .query("users")
            .withIndex("by_token", (q) => q.eq("tokenIdentifier", args.userId))
            .first();

        if (!user) {
            console.error(`User not found for ID: ${args.userId}`);
            // Fallback: Use `storeUser` logic if creating new? 
            // Unlikely for a purchase, they must exist.
            return;
        }

        // APPLY LOGIC
        if (args.priceId === PRICES.LIFETIME) {
            await ctx.db.patch(user._id, {
                subscription: 'lifetime',
            });
            console.log(`Upgraded user ${user._id} to LIFETIME`);
        }
        // Add other cases later
    },
});

export const getMe = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return null;
        }
        const user = await ctx.db
            .query("users")
            .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
            .first();
        return user;
    },
});
