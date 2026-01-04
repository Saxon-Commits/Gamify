import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const storeUser = mutation({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Called storeUser without authentication present");
        }

        // Check if we've already stored this identity.
        const user = await ctx.db
            .query("users")
            .withIndex("by_token", (q) =>
                q.eq("tokenIdentifier", identity.tokenIdentifier)
            )
            .first();

        if (user !== null) {
            // If we've seen this identity before but the name has changed, patch the value.
            if (user.name !== identity.name || user.email !== identity.email || user.pictureUrl !== identity.pictureUrl) {
                await ctx.db.patch(user._id, {
                    name: identity.name,
                    email: identity.email,
                    pictureUrl: identity.pictureUrl,
                });
            }
            return user._id;
        }

        // If it's a new identity, create a new User.
        const userId = await ctx.db.insert("users", {
            tokenIdentifier: identity.tokenIdentifier,
            name: identity.name,
            email: identity.email,
            pictureUrl: identity.pictureUrl,
            subscription: 'free',
            credits: 0,
            gems: 0,
        });

        return userId;
    },
});
