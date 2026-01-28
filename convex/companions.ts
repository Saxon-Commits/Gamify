import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Evolve a companion for the current user
export const evolveCompanion = mutation({
    args: {
        companionId: v.string(),
    },
    async handler(ctx, args) {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");

        const user = await ctx.db
            .query("users")
            .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
            .unique();

        if (!user) throw new Error("User not found");

        // Get the user's game state
        const gameState = await ctx.db
            .query("gameState")
            .withIndex("by_user", (q) => q.eq("userId", identity.subject))
            .unique();

        if (!gameState) throw new Error("Game state not found");

        // Parse the state
        const state = gameState.state;

        // Initialize evolvedCompanions array if it doesn't exist
        if (!state.evolvedCompanions) {
            state.evolvedCompanions = [];
        }

        // Check if companion is already evolved
        if (state.evolvedCompanions.includes(args.companionId)) {
            return { success: false, message: "Companion already evolved" };
        }

        // Add companion to evolved list
        state.evolvedCompanions.push(args.companionId);

        // Update the game state
        await ctx.db.patch(gameState._id, {
            state: state,
            lastSyncedAt: Date.now(),
        });

        return { success: true, companionId: args.companionId };
    },
});

// Check if a companion is evolved
export const isCompanionEvolved = query({
    args: {
        companionId: v.string(),
    },
    async handler(ctx, args) {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return false;

        const gameState = await ctx.db
            .query("gameState")
            .withIndex("by_user", (q) => q.eq("userId", identity.subject))
            .unique();

        if (!gameState) return false;

        const state = gameState.state;
        return state.evolvedCompanions?.includes(args.companionId) || false;
    },
});
