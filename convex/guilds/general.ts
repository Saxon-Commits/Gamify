import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { getCurrentUserId, hasPermission, logGuildActivity, MAX_GUILD_MEMBERS } from "./common";

// Get all guild memberships for the current user
// Get all guild memberships for the current user
export const getMyGuilds = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getCurrentUserId(ctx);
        if (!userId) return [];

        const memberships = await ctx.db
            .query("guildMembers")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .collect();

        // Join with guild data
        const guilds = await Promise.all(
            memberships.map(async (m) => {
                const guild = await ctx.db.get(m.guildId);
                if (!guild) return null;

                // We need member count for the UI
                const memberCount = (await ctx.db
                    .query("guildMembers")
                    .withIndex("by_guild", (q) => q.eq("guildId", guild._id))
                    .collect()).length;

                return {
                    guild,
                    memberCount,
                    membership: {
                        userId: m.userId,
                        role: m.role,
                        joinedAt: m.joinedAt,
                    }
                };
            })
        );

        return guilds.filter((g) => g !== null);
    },
});

export const getMyGuild = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getCurrentUserId(ctx);
        if (!userId) return null;

        const membership = await ctx.db
            .query("guildMembers")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .first();

        if (!membership) return null;

        const guild = await ctx.db.get(membership.guildId);
        if (!guild) return null;

        return {
            ...guild,
            role: membership.role,
        };
    },
});

export const get = query({ // getGuild
    args: { guildId: v.id("guilds") },
    handler: async (ctx, args) => {
        const guild = await ctx.db.get(args.guildId);
        if (!guild) return null;

        const leader = await ctx.db.get(guild.leaderId);

        return {
            ...guild,
            leaderName: leader?.name || "Unknown",
        };
    },
});

export const getActivity = query({ // getGuildActivity
    args: { guildId: v.id("guilds"), limit: v.optional(v.number()) },
    handler: async (ctx, args) => {
        const userId = await getCurrentUserId(ctx);
        if (!userId) return [];

        const activities = await ctx.db
            .query("guildActivities")
            .withIndex("by_guild", (q) => q.eq("guildId", args.guildId))
            // Index is not sorted by time descending, so we fetch limits and sort in memory? 
            // Better to fetch meaningful amount and sort.
            .take(args.limit || 20);

        // Sort in memory (newest first)
        const sortedActivities = activities.sort((a, b) => b._creationTime - a._creationTime);

        return Promise.all(
            sortedActivities.map(async (a) => {
                const user = await ctx.db.get(a.userId);
                return {
                    ...a,
                    userName: user?.name || "Unknown",
                    userAvatar: user?.pictureUrl,
                };
            })
        );
    },
});

export const getPublic = query({ // getPublicGuilds
    args: {},
    handler: async (ctx) => {
        const guilds = await ctx.db
            .query("guilds")
            // Can't filter by nested field in standard query easily without index? 
            // Convex supports .filter(q => q.eq(q.field("settings.isPublic"), true))?
            // "nested properties are not supported in filter by default unless using specific syntax"
            // Actually, Convex allows traversing objects.
            .collect();

        // Manual filter for now to avoid complexity
        const publicGuilds = guilds.filter(g => g.settings?.isPublic === true);

        // Limit results or pagination? For now fetch all (MVP).
        return Promise.all(
            publicGuilds.map(async (g) => {
                const memberCount = (await ctx.db
                    .query("guildMembers")
                    .withIndex("by_guild", (q) => q.eq("guildId", g._id))
                    .collect()).length;

                return {
                    ...g,
                    memberCount,
                };
            })
        );
    },
});

export const create = mutation({ // createGuild
    args: {
        name: v.string(),
        description: v.optional(v.string()),
        isPublic: v.boolean(),
    },
    handler: async (ctx, args) => {
        const userId = await getCurrentUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        // Check limit
        const existingMemberships = await ctx.db
            .query("guildMembers")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .collect();

        if (existingMemberships.length >= 5) {
            throw new Error("You can only join up to 5 guilds.");
        }

        const guildId = await ctx.db.insert("guilds", {
            name: args.name,
            description: args.description || "",
            leaderId: userId,
            xp: 0,
            level: 1,
            treasury: { gold: 0, gems: 0 },
            settings: {
                isPublic: args.isPublic,
                joinRequiresApproval: false
            },
            createdAt: Date.now(),
        });

        // Add creator as leader member
        await ctx.db.insert("guildMembers", {
            guildId,
            userId,
            role: "leader",
            contribution: { xp: 0, gold: 0, tasks: 0 },
            joinedAt: Date.now(),
        });

        await logGuildActivity(ctx, guildId, userId, "created", { name: args.name });

        return guildId;
    },
});

export const join = mutation({ // joinGuild
    args: { guildId: v.id("guilds") },
    handler: async (ctx, args) => {
        const userId = await getCurrentUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const guild = await ctx.db.get(args.guildId);
        if (!guild) throw new Error("Guild not found");
        if (!guild.settings?.isPublic) throw new Error("This guild is private. You need an invite.");

        // Check existing memberships
        const existingMemberships = await ctx.db
            .query("guildMembers")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .collect();

        if (existingMemberships.some((m) => m.guildId === args.guildId)) {
            // Already joined
            return args.guildId;
        }

        if (existingMemberships.length >= 5) {
            throw new Error("You have reached the limit of 5 guilds.");
        }

        // Check member limit
        const memberCount = (await ctx.db
            .query("guildMembers")
            .withIndex("by_guild", (q) => q.eq("guildId", args.guildId))
            .collect()).length;

        if (memberCount >= MAX_GUILD_MEMBERS) {
            throw new Error(`Guild is full (Max ${MAX_GUILD_MEMBERS} members)`);
        }

        await ctx.db.insert("guildMembers", {
            guildId: args.guildId,
            userId,
            role: "member",
            contribution: { xp: 0, gold: 0, tasks: 0 },
            joinedAt: Date.now(),
        });

        const user = await ctx.db.get(userId);
        await logGuildActivity(ctx, args.guildId, userId, "joined", { userName: user?.name ?? "Unknown", method: "public" });

        return args.guildId;
    },
});

export const leave = mutation({ // leaveGuild
    args: { guildId: v.id("guilds") },
    handler: async (ctx, args) => {
        const userId = await getCurrentUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const guild = await ctx.db.get(args.guildId);
        if (!guild) throw new Error("Guild not found");

        if (guild.leaderId === userId) {
            throw new Error("Leader cannot leave. Transfer leadership or disband.");
        }

        const membership = await ctx.db
            .query("guildMembers")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .filter((q) => q.eq(q.field("guildId"), args.guildId))
            .first();

        if (!membership) throw new Error("Not a member");

        await ctx.db.delete(membership._id);

        const user = await ctx.db.get(userId);
        await logGuildActivity(ctx, args.guildId, userId, "left", { userName: user?.name ?? "Unknown" });

        return true;
    },
});

export const update = mutation({ // updateGuild
    args: {
        guildId: v.id("guilds"),
        name: v.optional(v.string()),
        description: v.optional(v.string()),
        isPublic: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const userId = await getCurrentUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const hasPerms = await hasPermission(ctx, args.guildId, userId, "officer");
        if (!hasPerms) throw new Error("Permission denied");

        const guild = await ctx.db.get(args.guildId);
        if (!guild) throw new Error("Guild not found");

        const updates: any = {};
        if (args.name !== undefined) updates.name = args.name;
        if (args.description !== undefined) updates.description = args.description;

        if (args.isPublic !== undefined) {
            updates.settings = {
                ...guild.settings,
                isPublic: args.isPublic
            };
        }

        await ctx.db.patch(args.guildId, updates);
        return true;
    },
});

export const disband = mutation({ // disbandGuild
    args: { guildId: v.id("guilds") },
    handler: async (ctx, args) => {
        const userId = await getCurrentUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const guild = await ctx.db.get(args.guildId);
        if (!guild) throw new Error("Guild not found");

        if (guild.leaderId !== userId) throw new Error("Only leader can disband");

        // Use same logic as admin command but for user
        // Delete members
        const members = await ctx.db.query("guildMembers").withIndex("by_guild", q => q.eq("guildId", args.guildId)).collect();
        for (const m of members) await ctx.db.delete(m._id);

        // Delete activities
        const activities = await ctx.db.query("guildActivities").withIndex("by_guild", q => q.eq("guildId", args.guildId)).collect();
        for (const a of activities) await ctx.db.delete(a._id);

        // Delete invites
        const invites = await ctx.db.query("guildInvites").withIndex("by_guild", q => q.eq("guildId", args.guildId)).collect();
        for (const i of invites) await ctx.db.delete(i._id);

        // Delete projects
        const projects = await ctx.db.query("guildProjects").withIndex("by_guild", q => q.eq("guildId", args.guildId)).collect();
        for (const p of projects) await ctx.db.delete(p._id);

        // Delete bounties
        const bounties = await ctx.db.query("guildBounties").withIndex("by_guild", q => q.eq("guildId", args.guildId)).collect();
        for (const b of bounties) await ctx.db.delete(b._id);

        // Delete Guild
        await ctx.db.delete(args.guildId);

        return true;
    },
});

export const log = mutation({ // logActivity
    args: {
        type: v.string(),
        data: v.any(),
    },
    handler: async (ctx, args) => {
        const userId = await getCurrentUserId(ctx);
        if (!userId) return;

        const membership = await ctx.db
            .query("guildMembers")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .first();

        if (!membership) return;

        await logGuildActivity(ctx, membership.guildId, userId, args.type, args.data);
    },
});


// Debugging/Admin: Add XP manually
export const addXp = mutation({ // addGuildXp
    args: {
        guildId: v.id("guilds"),
        amount: v.number(),
    },
    handler: async (ctx, args) => {
        const userId = await getCurrentUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const guild = await ctx.db.get(args.guildId);
        if (!guild) throw new Error("Guild not found");

        // Verify permission (leader only for now for this cheat tool)
        if (guild.leaderId !== userId) throw new Error("Only leader can add XP");

        let newXp = guild.xp + args.amount;
        let newLevel = guild.level;

        // Leveling logic
        while (newXp >= newLevel * 1000) {
            newXp -= newLevel * 1000;
            newLevel++;

            await logGuildActivity(ctx, args.guildId, userId, "guild_level_up", {
                newLevel,
                prevLevel: newLevel - 1
            });
        }

        await ctx.db.patch(args.guildId, {
            xp: newXp,
            level: newLevel,
        });

        return { newLevel, newXp };
    },
});

export const donate = mutation({ // donateToTreasury
    args: {
        guildId: v.id("guilds"),
        amount: v.number(),
        currency: v.string(), // 'gold' | 'gems'
    },
    handler: async (ctx, args) => {
        const userId = await getCurrentUserId(ctx);
        if (!userId) throw new Error("Not authenticated");
        if (args.amount <= 0) throw new Error("Invalid amount");

        // Fetch User (for name) and GameState (for currency)
        const user = await ctx.db.get(userId);
        if (!user) throw new Error("User not found");

        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");

        const gameState = await ctx.db
            .query("gameState")
            .withIndex("by_user", (q) => q.eq("userId", identity.subject))
            .first();

        if (!gameState || !gameState.state || !gameState.state.stats) {
            throw new Error("Game state not found");
        }

        // Verify membership
        const membership = await ctx.db
            .query("guildMembers")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .first();

        if (!membership || membership.guildId !== args.guildId) {
            throw new Error("You are not a member of this guild");
        }

        const guild = await ctx.db.get(args.guildId);
        if (!guild) throw new Error("Guild not found");

        const currentStats = gameState.state.stats;

        // Check funds and deduct
        if (args.currency === 'gold') {
            const currentGold = currentStats.gold || 0;
            if (currentGold < args.amount) throw new Error("Insufficient Gold");
            currentStats.gold -= args.amount;
        } else if (args.currency === 'gems') {
            const currentGems = currentStats.gems || 0;
            if (currentGems < args.amount) throw new Error("Insufficient Gems");
            currentStats.gems -= args.amount;
        } else {
            throw new Error("Invalid currency");
        }

        // Update GameState
        await ctx.db.patch(gameState._id, { state: gameState.state });

        // Add to treasury
        const currentTreasury = guild.treasury || { gold: 0, gems: 0 };
        const newTreasury = {
            gold: (currentTreasury.gold || 0) + (args.currency === 'gold' ? args.amount : 0),
            gems: (currentTreasury.gems || 0) + (args.currency === 'gems' ? args.amount : 0),
        };

        await ctx.db.patch(guild._id, { treasury: newTreasury });

        // Update member contribution
        const currentContribution = membership.contribution || { xp: 0, gold: 0, tasks: 0 };
        await ctx.db.patch(membership._id, {
            contribution: {
                ...currentContribution,
                gold: (currentContribution.gold || 0) + (args.currency === 'gold' ? args.amount : 0),
            }
        });

        // Log activity
        await logGuildActivity(ctx, args.guildId, userId, "donation", {
            amount: args.amount,
            currency: args.currency,
            userName: user.name ?? "Member"
        });

        return { success: true, newBalance: args.currency === 'gold' ? currentStats.gold : currentStats.gems };
    },
});
