import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// --- HELPER: Verify User identity ---
const ensureUser = async (ctx: any) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    // We need the user document to get the _id
    const user = await ctx.db
        .query("users")
        .withIndex("by_token", (q: any) => q.eq("tokenIdentifier", identity.tokenIdentifier))
        .unique();

    if (!user) throw new Error("User not found");
    return user;
};

// 1. Start Secure Session
export const startSession = mutation({
    args: { durationMinutes: v.number() },
    handler: async (ctx, args) => {
        const user = await ensureUser(ctx);

        // Optional: Fail if already has an active session? 
        // For now, we'll just let them start a new one (overwriting the concept of 'current' in UI implies we track it)
        // Let's just insert.

        const sessionId = await ctx.db.insert("focusSessions", {
            userId: user._id,
            startTime: Date.now(),
            durationMinutes: args.durationMinutes,
            status: 'active'
        });

        return { success: true, sessionId };
    }
});

// 2. Complete Secure Session (The Anti-Cheat Check)
export const completeSession = mutation({
    args: { sessionId: v.id("focusSessions") },
    handler: async (ctx, args) => {
        const user = await ensureUser(ctx);
        const session = await ctx.db.get(args.sessionId);

        // Security Checks
        if (!session) throw new Error("Session not found");
        if (session.userId !== user._id) throw new Error("Unauthorized session access");
        if (session.status !== 'active') throw new Error("Session already finished or invalid");

        // TIME VERIFICATION
        const now = Date.now();
        const expectedDurationMs = session.durationMinutes * 60 * 1000;
        const elapsedTime = now - session.startTime;

        // Tolerance: Allow 5 seconds of leniency for network latency/clock drift
        // BUT strict on early finish.
        // If they finish 1 second early, it's suspicious but maybe network.
        // If they finish 10 minutes early, it's a cheat.
        const minimumRequiredTime = expectedDurationMs - 10000; // 10s buffer

        if (elapsedTime < minimumRequiredTime) {
            // CHEAT DETECTED
            await ctx.db.patch(args.sessionId, {
                status: 'cheated',
                cheated: true
            });
            console.error(`CHEAT DETECTED: User ${user.name} tried to fast-forward focus time.`);
            // Silent fail? Or loud fail?
            // Loud fail is better for UX if it's an honest bug, but blocks cheaters.
            return { success: false, reason: "Time verification failed. Session too short." };
        }

        // VERIFIED SUCCESS
        await ctx.db.patch(args.sessionId, { status: 'completed' });

        // AWARD REWARDS
        // Calculate Rewards based on duration (Mirroring Client Logic but securely)
        // 15m = 50 XP, 10 Gold
        // 30m = 100 XP, 25 Gold
        // 60m = 250 XP, 60 Gold
        // 90m = 400 XP, 100 Gold

        // We can approximate or map it. Let's map strict milestones or use a formula.
        // For simplicity/consistency, let's use the exact values from client if possible, 
        // or just re-implement the standard lookup.
        let xp = 0;
        let gold = 0;

        if (session.durationMinutes >= 90) { xp = 400; gold = 100; }
        else if (session.durationMinutes >= 60) { xp = 250; gold = 60; }
        else if (session.durationMinutes >= 30) { xp = 100; gold = 25; }
        else { xp = 50; gold = 10; } // Default 15m

        // Queue Rewards (SyncManager will pick them up)
        // We use pendingRewards table which we already built!
        await ctx.db.insert("pendingRewards", {
            userId: user._id,
            type: 'gold',
            amount: gold,
            description: 'Focus Session Complete',
            createdAt: now
        });

        // XP is usually handled by client state, but we can queue generic 'resource' reward?
        // Our pendingRewards currently supports 'gold', 'gems', 'item'. 
        // We might need to add 'xp' handling to SyncManager or just let client add XP confidently 
        // (if they can cheat XP locally, they can do it anyway via console, 
        // but guarding the GOLD/GEMS is the main economic priority).

        // Let's trust client for XP for now to avoid refactoring SyncManager excessively, 
        // OR add XP support to SyncManager.
        // Adding XP support to SyncManager is safer.
        await ctx.db.insert("pendingRewards", {
            userId: user._id,
            type: 'xp',
            amount: xp,
            description: 'Focus Session Complete',
            createdAt: now
        });

        return { success: true, verified: true, rewards: { xp, gold } };
    }
});
