import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * DOMAIN MIGRATION UTILITY
 * 
 * When changing Clerk domain (paraxp.com → xpfocus.com), the tokenIdentifier changes,
 * causing duplicate user accounts. This mutation merges them.
 * 
 * Usage: Call this mutation with the email of the duplicate account.
 * It will find both accounts (old and new domain) and merge all data into the new one.
 */
export const mergeDuplicateUser = mutation({
    args: {
        email: v.string(),
    },
    handler: async (ctx, args) => {
        console.log(`🔄 Starting merge for email: ${args.email}`);

        // Find all users with this email
        const allUsers = await ctx.db.query("users").collect();
        const matchingUsers = allUsers.filter(u => u.email === args.email);

        if (matchingUsers.length < 2) {
            throw new Error(`Found ${matchingUsers.length} users with email ${args.email}. Need exactly 2 to merge.`);
        }

        if (matchingUsers.length > 2) {
            console.warn(`Found ${matchingUsers.length} users with email ${args.email}. Will merge first 2.`);
        }

        // Identify old (paraxp) and new (xpfocus) accounts
        const oldUser = matchingUsers.find(u => u.tokenIdentifier.includes("paraxp.com"));
        const newUser = matchingUsers.find(u => u.tokenIdentifier.includes("xpfocus.com"));

        if (!oldUser || !newUser) {
            throw new Error("Could not identify old and new accounts. Check tokenIdentifiers.");
        }

        console.log(`Old account: ${oldUser._id} (${oldUser.tokenIdentifier})`);
        console.log(`New account: ${newUser._id} (${newUser.tokenIdentifier})`);

        // Get the userId (Clerk subject) from tokenIdentifier
        const oldUserId = oldUser.tokenIdentifier.split("|")[1];
        const newUserId = newUser.tokenIdentifier.split("|")[1];

        // 1. Merge gameState
        const oldGameState = await ctx.db
            .query("gameState")
            .withIndex("by_user", (q) => q.eq("userId", oldUserId))
            .first();

        const newGameState = await ctx.db
            .query("gameState")
            .withIndex("by_user", (q) => q.eq("userId", newUserId))
            .first();

        if (oldGameState && !newGameState) {
            // Transfer old gameState to new user
            await ctx.db.patch(oldGameState._id, { userId: newUserId });
            console.log("✓ Transferred gameState");
        } else if (oldGameState && newGameState) {
            // Both exist - keep newer one, delete old
            await ctx.db.delete(oldGameState._id);
            console.log("✓ Kept new gameState, deleted old");
        }

        // 2. Transfer journal entries
        const oldJournals = await ctx.db
            .query("journalEntries")
            .withIndex("by_user", (q) => q.eq("userId", oldUser._id))
            .collect();

        for (const journal of oldJournals) {
            await ctx.db.patch(journal._id, { userId: newUser._id });
        }
        console.log(`✓ Transferred ${oldJournals.length} journal entries`);

        // 3. Transfer pending rewards
        const oldRewards = await ctx.db
            .query("pendingRewards")
            .withIndex("by_user", (q) => q.eq("userId", oldUser._id))
            .collect();

        for (const reward of oldRewards) {
            await ctx.db.patch(reward._id, { userId: newUser._id });
        }
        console.log(`✓ Transferred ${oldRewards.length} pending rewards`);

        // 4. Transfer guild memberships
        const oldMemberships = await ctx.db
            .query("guildMembers")
            .withIndex("by_user", (q) => q.eq("userId", oldUser._id))
            .collect();

        for (const membership of oldMemberships) {
            await ctx.db.patch(membership._id, { userId: newUser._id });
        }
        console.log(`✓ Transferred ${oldMemberships.length} guild memberships`);

        // 5. Transfer guild ownership
        const ownedGuilds = await ctx.db
            .query("guilds")
            .withIndex("by_leader", (q) => q.eq("leaderId", oldUser._id))
            .collect();

        for (const guild of ownedGuilds) {
            await ctx.db.patch(guild._id, { leaderId: newUser._id });
        }
        console.log(`✓ Transferred ${ownedGuilds.length} owned guilds`);

        // 6. Merge user properties (keep best of both)
        const mergedProps: any = {
            role: oldUser.role || newUser.role, // Keep admin role if either has it
            subscription: oldUser.subscription || newUser.subscription,
            gems: (oldUser.gems || 0) + (newUser.gems || 0), // Combine gems
            credits: (oldUser.credits || 0) + (newUser.credits || 0), // Combine credits
            username: oldUser.username || newUser.username, // Keep whichever has username
        };

        await ctx.db.patch(newUser._id, mergedProps);
        console.log("✓ Merged user properties");

        // 7. Delete old user account
        await ctx.db.delete(oldUser._id);
        console.log("✓ Deleted old user account");

        console.log(`✅ Successfully merged ${args.email} - old account deleted, all data transferred to new account`);

        return {
            success: true,
            oldUserId: oldUser._id,
            newUserId: newUser._id,
            mergedData: mergedProps,
        };
    },
});

/**
 * Admin utility to find duplicate user accounts
 * Returns list of emails that have multiple accounts
 */
export const findDuplicateUsers = query({
    args: {},
    handler: async (ctx) => {
        const allUsers = await ctx.db.query("users").collect();

        // Group by email
        const emailCounts = new Map<string, number>();
        allUsers.forEach(user => {
            if (user.email) {
                emailCounts.set(user.email, (emailCounts.get(user.email) || 0) + 1);
            }
        });

        // Find duplicates
        const duplicates: Array<{ email: string; count: number }> = [];
        emailCounts.forEach((count, email) => {
            if (count > 1) {
                duplicates.push({ email, count });
            }
        });

        return duplicates;
    },
});
