import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";

// Price IDs (We could move these to a shared config)
const PRICES = {
    LIFETIME: 'price_1SlpqyLQXrapzCX8bubgyJ0C',
    GEMS_100: 'price_100_gems',
    GEMS_500: 'price_500_gems',
    GEMS_1000: 'price_1000_gems',
    GEMS_10000: 'price_10000_gems'
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
        } else if (args.priceId === PRICES.GEMS_100) {
            await ctx.db.patch(user._id, { gems: (user.gems || 0) + 100 });
        } else if (args.priceId === PRICES.GEMS_500) {
            await ctx.db.patch(user._id, { gems: (user.gems || 0) + 500 });
        } else if (args.priceId === PRICES.GEMS_1000) {
            await ctx.db.patch(user._id, { gems: (user.gems || 0) + 1000 });
        } else if (args.priceId === PRICES.GEMS_10000) {
            await ctx.db.patch(user._id, { gems: (user.gems || 0) + 10000 });
        }
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

export const checkUsername = query({
    args: { username: v.string() },
    handler: async (ctx, args) => {
        const normalized = args.username.trim().toLowerCase();

        // Basic validation
        if (normalized.length < 3) return { available: false, reason: "Too short" };
        if (normalized.length > 20) return { available: false, reason: "Too long" };
        if (!/^[a-z0-9_]+$/.test(normalized)) return { available: false, reason: "Invalid characters" };

        const existing = await ctx.db
            .query("users")
            .withIndex("by_username", (q) => q.eq("username", normalized))
            .first();

        // If existing user is ME, it's "available" (to keep)
        if (existing) {
            const identity = await ctx.auth.getUserIdentity();
            if (identity && existing.tokenIdentifier === identity.tokenIdentifier) {
                return { available: true, reason: "Current username" };
            }
            return { available: false, reason: "Username taken" };
        }

        return {
            available: true,
            reason: "Available"
        };
    },
});

export const setUsername = mutation({
    args: { username: v.string() },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");

        const normalized = args.username.trim().toLowerCase();

        // 1. Validate format
        if (normalized.length < 3 || normalized.length > 20 || !/^[a-z0-9_]+$/.test(normalized)) {
            throw new Error("Invalid username format");
        }

        // 2. Check uniqueness 
        const existing = await ctx.db
            .query("users")
            .withIndex("by_username", (q) => q.eq("username", normalized))
            .first();

        // If it exists AND it's not me, fail
        if (existing && existing.tokenIdentifier !== identity.tokenIdentifier) {
            throw new Error("Username already taken");
        }

        // 3. Find my user record
        const user = await ctx.db
            .query("users")
            .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
            .unique();

        if (!user) {
            throw new Error("User record not found");
        }

        // 4. Update
        await ctx.db.patch(user._id, {
            username: normalized
        });

        return { success: true, username: normalized };
    },
});

// Delete all user data from Convex (called before deleting Clerk account)
export const deleteAccount = mutation({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const userId = identity.subject;

        // Find user record
        const user = await ctx.db
            .query("users")
            .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
            .first();

        if (!user) {
            console.warn("User not found in database, nothing to delete");
            return;
        }

        console.log(`🗑️  Starting comprehensive account deletion for user ${user._id} (${user.username || user.email})`);

        // 1. Delete gameState
        const gameState = await ctx.db
            .query("gameState")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .first();
        if (gameState) {
            await ctx.db.delete(gameState._id);
            console.log("✓ Deleted gameState");
        }

        // 2. Delete journal entries
        const journals = await ctx.db
            .query("journalEntries")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .collect();
        for (const journal of journals) {
            await ctx.db.delete(journal._id);
        }
        console.log(`✓ Deleted ${journals.length} journal entries`);

        // 3. Delete pending rewards
        const rewards = await ctx.db
            .query("pendingRewards")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .collect();
        for (const reward of rewards) {
            await ctx.db.delete(reward._id);
        }
        console.log(`✓ Deleted ${rewards.length} pending rewards`);

        // 4. Delete project documents
        const docs = await ctx.db
            .query("projectDocuments")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .collect();
        for (const doc of docs) {
            await ctx.db.delete(doc._id);
        }
        console.log(`✓ Deleted ${docs.length} project documents`);

        // 5. Delete daily stats
        const stats = await ctx.db
            .query("dailyStats")
            .filter((q) => q.eq(q.field("userId"), user._id))
            .collect();
        for (const stat of stats) {
            await ctx.db.delete(stat._id);
        }
        console.log(`✓ Deleted ${stats.length} daily stats entries`);

        // 6. Delete focus sessions
        const sessions = await ctx.db
            .query("focusSessions")
            .filter((q) => q.eq(q.field("userId"), user._id))
            .collect();
        for (const session of sessions) {
            await ctx.db.delete(session._id);
        }
        console.log(`✓ Deleted ${sessions.length} focus sessions`);

        // 7. Leave all guilds (delete membership records)
        const memberships = await ctx.db
            .query("guildMembers")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .collect();
        for (const membership of memberships) {
            await ctx.db.delete(membership._id);
        }
        console.log(`✓ Left ${memberships.length} guilds`);

        // 8. Delete guild invites (sent to this user)
        const invites = await ctx.db
            .query("guildInvites")
            .filter((q) => q.eq(q.field("invitedUserId"), user._id))
            .collect();
        for (const invite of invites) {
            await ctx.db.delete(invite._id);
        }
        console.log(`✓ Deleted ${invites.length} guild invites`);

        // 9. Delete guild activities (created by this user)
        const activities = await ctx.db
            .query("guildActivities")
            .filter((q) => q.eq(q.field("userId"), user._id))
            .collect();
        for (const activity of activities) {
            await ctx.db.delete(activity._id);
        }
        console.log(`✓ Deleted ${activities.length} guild activities`);

        // 10. Delete guild messages
        const messages = await ctx.db
            .query("guildMessages")
            .filter((q) => q.eq(q.field("userId"), user._id))
            .collect();
        for (const message of messages) {
            await ctx.db.delete(message._id);
        }
        console.log(`✓ Deleted ${messages.length} guild messages`);

        // 11. Delete guild bounties (created or claimed by this user)
        const bounties = await ctx.db
            .query("guildBounties")
            .filter((q) =>
                q.or(
                    q.eq(q.field("createdBy"), user._id),
                    q.eq(q.field("claimedBy"), user._id)
                )
            )
            .collect();
        for (const bounty of bounties) {
            await ctx.db.delete(bounty._id);
        }
        console.log(`✓ Deleted ${bounties.length} guild bounties`);

        // 12. Delete guilds where user is the leader
        const ownedGuilds = await ctx.db
            .query("guilds")
            .withIndex("by_leader", (q) => q.eq("leaderId", user._id))
            .collect();
        for (const guild of ownedGuilds) {
            // Delete all related guild data first
            const guildProjects = await ctx.db
                .query("guildProjects")
                .withIndex("by_guild", (q) => q.eq("guildId", guild._id))
                .collect();
            for (const project of guildProjects) {
                await ctx.db.delete(project._id);
            }

            // Then delete the guild itself
            await ctx.db.delete(guild._id);
        }
        console.log(`✓ Deleted ${ownedGuilds.length} owned guilds and their projects`);

        // 13. Delete user record (last)
        await ctx.db.delete(user._id);
        console.log("✓ Deleted user record");

        console.log(`✅ Complete deletion finished for ${user.username || user.email}`);
    },
});
