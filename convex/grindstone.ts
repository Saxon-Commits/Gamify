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

        // REMOVED: Multi-session check (too aggressive - blocks legitimate use)
        // The other anti-cheat measures (time validation, tab switching, fullscreen) 
        // are sufficient for preventing exploits

        // RATE LIMITING: Prevent session spam (skip for admins)
        if (user.role !== 'admin') {
            const recentSessions = await ctx.db
                .query("focusSessions")
                .filter((q) => q.eq(q.field("userId"), user._id))
                .order("desc")
                .take(10);

            const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
            const recentStarts = recentSessions.filter(s => s.startTime > fiveMinutesAgo);

            if (recentStarts.length >= 10) {
                throw new Error("Too many sessions started recently. Please wait a moment.");
            }
        }

        const sessionId = await ctx.db.insert("focusSessions", {
            userId: user._id,
            startTime: Date.now(),
            durationMinutes: args.durationMinutes,
            status: 'active'
        });

        return { success: true, sessionId };
    }
});

// 2. Complete Secure Session (Enhanced Anti-Cheat)
export const completeSession = mutation({
    args: { sessionId: v.id("focusSessions") },
    handler: async (ctx, args) => {
        const user = await ensureUser(ctx);
        const session = await ctx.db.get(args.sessionId);

        // Security Checks
        if (!session) throw new Error("Session not found.");
        if (session.userId !== user._id) throw new Error("Unauthorized session access.");
        if (session.status !== 'active') throw new Error("Session already finished or invalid.");

        // TIME VERIFICATION
        const now = Date.now();
        const expectedDurationMs = session.durationMinutes * 60 * 1000;
        const elapsedTime = now - session.startTime;

        // CHECK 1: Too Early (Time Manipulation)
        const minimumRequiredTime = expectedDurationMs - 10000; // 10s buffer for network latency
        if (elapsedTime < minimumRequiredTime) {
            await ctx.db.patch(args.sessionId, {
                status: 'cheated',
                cheated: true
            });

            const secondsEarly = Math.round((minimumRequiredTime - elapsedTime) / 1000);
            console.error(`🚨 CHEAT DETECTED: User ${user.name || user.email} finished ${secondsEarly}s early`);

            return {
                success: false,
                reason: `Time verification failed. Session ended ${secondsEarly} seconds too early.`
            };
        }

        // CHECK 2: Too Late (AFK Detection)
        const maximumAllowedTime = expectedDurationMs + (10 * 60 * 1000); // +10 min grace period
        if (elapsedTime > maximumAllowedTime) {
            await ctx.db.patch(args.sessionId, {
                status: 'abandoned',
            });

            const minutesLate = Math.round((elapsedTime - expectedDurationMs) / 60000);
            console.warn(`⏰ ABANDONED: User ${user.name || user.email} took ${minutesLate} extra minutes (AFK)`);

            return {
                success: false,
                reason: `Session expired. Focus window closed ${minutesLate} minutes ago.`
            };
        }

        // ✅ VERIFIED SUCCESS
        await ctx.db.patch(args.sessionId, { status: 'completed' });

        // AWARD REWARDS (with daily caps)
        let xp = 0;
        let gold = 0;

        if (session.durationMinutes >= 90) { xp = 400; gold = 100; }
        else if (session.durationMinutes >= 60) { xp = 250; gold = 60; }
        else if (session.durationMinutes >= 30) { xp = 100; gold = 25; }
        else { xp = 50; gold = 10; }

        // CHECK DAILY CAPS (3600 XP, 900 Gold max per day)
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const todayStats = await ctx.db
            .query("dailyStats")
            .withIndex("by_user_date", (q) =>
                q.eq("userId", user._id).eq("date", today)
            )
            .first();

        const currentGrindstoneXP = todayStats?.grindstoneXP || 0;
        const currentGrindstoneGold = todayStats?.grindstoneGold || 0;

        const DAILY_XP_CAP = 3600;
        const DAILY_GOLD_CAP = 900;

        // Calculate capped rewards
        let cappedXP = Math.min(xp, DAILY_XP_CAP - currentGrindstoneXP);
        let cappedGold = Math.min(gold, DAILY_GOLD_CAP - currentGrindstoneGold);

        // Ensure non-negative
        cappedXP = Math.max(0, cappedXP);
        cappedGold = Math.max(0, cappedGold);

        const wasCapped = cappedXP < xp || cappedGold < gold;

        // Update daily stats
        if (todayStats) {
            await ctx.db.patch(todayStats._id, {
                grindstoneXP: currentGrindstoneXP + cappedXP,
                grindstoneGold: currentGrindstoneGold + cappedGold,
            });
        } else {
            // Create new daily stats entry
            await ctx.db.insert("dailyStats", {
                userId: user._id,
                date: today,
                steps: 0,
                grindstoneXP: cappedXP,
                grindstoneGold: cappedGold,
            });
        }

        // Queue Rewards (only if not capped to 0)
        if (cappedGold > 0) {
            await ctx.db.insert("pendingRewards", {
                userId: user._id,
                type: 'gold',
                amount: cappedGold,
                description: 'Focus Session Complete',
                createdAt: now
            });
        }

        if (cappedXP > 0) {
            await ctx.db.insert("pendingRewards", {
                userId: user._id,
                type: 'xp',
                amount: cappedXP,
                description: 'Focus Session Complete',
                createdAt: now
            });
        }

        if (cappedXP > 0 || cappedGold > 0) {
            console.log(`✅ Session verified: User ${user.name || user.email} earned ${cappedXP} XP, ${cappedGold} gold`);
        }

        if (wasCapped) {
            console.log(`⚠️ Daily cap reached: Reduced from ${xp} XP/${gold} gold to ${cappedXP} XP/${cappedGold} gold`);
        }

        return {
            success: true,
            verified: true,
            rewards: { xp: cappedXP, gold: cappedGold },
            capped: wasCapped,
            remainingXP: DAILY_XP_CAP - (currentGrindstoneXP + cappedXP),
            remainingGold: DAILY_GOLD_CAP - (currentGrindstoneGold + cappedGold),
        };
    }
});
