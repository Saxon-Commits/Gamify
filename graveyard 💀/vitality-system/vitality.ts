import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Helper to get today's date string YYYY-MM-DD
const getTodayStr = () => new Date().toISOString().split('T')[0];

// Helper to get past dates
const getPastDateStr = (daysAgo: number) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().split('T')[0];
};

export const getVitalityStats = query({
    args: {
        endDate: v.optional(v.string()), // Optional upper bound
        limit: v.optional(v.number())    // Default 7
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return { history: [], today: null };

        const user = await ctx.db
            .query("users")
            .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
            .first();

        if (!user) return { history: [], today: null };

        const limit = args.limit || 7;
        const fetchLimit = limit * 2; // Fetch double to calculate previous period trends

        // If endDate provided, filter. Else just get latest.
        let q = ctx.db.query("dailyStats").withIndex("by_user_date", q =>
            args.endDate
                ? q.eq("userId", user._id).lte("date", args.endDate)
                : q.eq("userId", user._id)
        );

        const stats = await q.order("desc").take(fetchLimit);

        // Reverse to get oldest -> newest for chart
        const history = stats.reverse();

        // Check if we have today's entry in the list
        const todayStr = getTodayStr();
        const todayEntry = history.find(d => d.date === todayStr) || null;

        return {
            history,
            today: todayEntry,
            limit
        };
    },
});

export const logSteps = mutation({
    args: {
        steps: v.number(),
        date: v.optional(v.string()) // Optional, defaults to today
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        const user = await ctx.db
            .query("users")
            .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
            .first();

        if (!user) throw new Error("User not found");

        const dateStr = args.date || getTodayStr();

        // Check if entry exists for this date
        const existing = await ctx.db
            .query("dailyStats")
            .withIndex("by_user_date", q => q.eq("userId", user._id).eq("date", dateStr))
            .first();

        if (existing) {
            // Determine if goal met (Sticky: Once true, always true)
            const alreadyMet = existing.goalMet || false;
            const nowMet = args.steps >= 10000;
            const finalGoalMet = alreadyMet || nowMet;

            // TODO: Grant Reward (XP/Coins) if (nowMet && !alreadyMet)

            // Update
            await ctx.db.patch(existing._id, {
                steps: args.steps,
                // Simple logic: Assuming activeMinutes/calories derived roughly from steps for now if not provided
                // For V1 we just store steps. calories/activeMinutes can be updated later or calc on frontend
                calories: Math.floor(args.steps * 0.04), // Avg ~0.04 kcal/step
                activeMinutes: Math.floor(args.steps / 100), // Avg ~100 steps/min
                goalMet: finalGoalMet
            });
        } else {
            // Insert
            const isMet = args.steps >= 10000;
            // TODO: Grant Reward (XP/Coins) if isMet

            await ctx.db.insert("dailyStats", {
                userId: user._id,
                date: dateStr,
                steps: args.steps,
                calories: Math.floor(args.steps * 0.04),
                activeMinutes: Math.floor(args.steps / 100),
                goalMet: isMet
            });
        }
    }
});
