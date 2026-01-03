import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Load the full game state for the authenticated user
export const load = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return null;
        }

        const gameState = await ctx.db
            .query("gameState")
            .withIndex("by_user", (q) => q.eq("userId", identity.subject))
            .first();

        return gameState ? gameState.state : null;
    },
});

// Save (overwrite) the full game state
export const save = mutation({
    args: {
        state: v.any(), // Accepts the full Zustand state object
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Unauthenticated call to save");
        }

        const userId = identity.subject;

        // Check if state exists
        const existingState = await ctx.db
            .query("gameState")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .first();

        if (existingState) {
            // Update existing
            await ctx.db.patch(existingState._id, {
                state: args.state,
                lastSyncedAt: Date.now(),
            });
        } else {
            // Create new
            await ctx.db.insert("gameState", {
                userId,
                state: args.state,
                lastSyncedAt: Date.now(),
            });
        }
    },
});
