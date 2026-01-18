
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getPending = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const user = await ctx.db
            .query("users")
            .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
            .unique();

        if (!user) return [];

        return await ctx.db
            .query("pendingRewards")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .collect();
    },
});

export const claim = mutation({
    args: { rewardId: v.id("pendingRewards") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        const user = await ctx.db
            .query("users")
            .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
            .unique();

        if (!user) throw new Error("User not found");

        const reward = await ctx.db.get(args.rewardId);
        if (!reward) throw new Error("Reward not found");

        if (reward.userId !== user._id) {
            throw new Error("Unauthorized claim");
        }

        // We delete the reward to mark it as claimed
        // The client MUST add the resources to their local store optimistically OR 
        // rely on a full re-sync if we were doing server-side state mgmt.
        // Since we are client-authoritative (Zustand), the client "SyncManager" 
        // will add the funds to the local store and THEN call this claim mutation.
        await ctx.db.delete(args.rewardId);

        return { success: true, type: reward.type, amount: reward.amount };
    }
});
