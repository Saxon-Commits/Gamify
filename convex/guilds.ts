import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Helper to get current user's internal ID
async function getCurrentUserId(ctx: any): Promise<Id<"users"> | null> {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
        console.log("getCurrentUserId: No identity found. User might not be signed in or auth is misconfigured.");
        return null;
    }

    const user = await ctx.db
        .query("users")
        .withIndex("by_token", (q: any) => q.eq("tokenIdentifier", identity.tokenIdentifier))
        .unique();

    if (!user) {
        console.log("getCurrentUserId: User not found in DB. TokenIdentifier:", identity.tokenIdentifier);
        console.log("Run the app and ensure storeUser is called to sync the user.");
    }

    return user?._id ?? null;
}

// Helper to check if user has permission (officer or leader)
async function hasPermission(ctx: any, guildId: Id<"guilds">, userId: Id<"users">, requiredRole: 'leader' | 'officer' | 'member' = 'officer'): Promise<boolean> {
    const member = await ctx.db
        .query("guildMembers")
        .withIndex("by_user", (q: any) => q.eq("userId", userId))
        .first();

    if (!member || member.guildId !== guildId) return false;

    if (requiredRole === 'leader') return member.role === 'leader';
    if (requiredRole === 'officer') return member.role === 'leader' || member.role === 'officer';
    return true;
}

// ============================================
// QUERIES
// ============================================

// Get current user's guild membership
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

        // Get member count
        const members = await ctx.db
            .query("guildMembers")
            .withIndex("by_guild", (q) => q.eq("guildId", membership.guildId))
            .collect();

        return {
            guild,
            membership,
            memberCount: members.length,
        };
    },
});

// Get guild by ID with details
export const getGuild = query({
    args: { guildId: v.id("guilds") },
    handler: async (ctx, args) => {
        const guild = await ctx.db.get(args.guildId);
        if (!guild) return null;

        const members = await ctx.db
            .query("guildMembers")
            .withIndex("by_guild", (q) => q.eq("guildId", args.guildId))
            .collect();

        const leader = await ctx.db.get(guild.leaderId);

        return {
            ...guild,
            memberCount: members.length,
            leaderName: leader?.name ?? "Unknown",
        };
    },
});

// Get all members of a guild
export const getGuildMembers = query({
    args: { guildId: v.id("guilds") },
    handler: async (ctx, args) => {
        const members = await ctx.db
            .query("guildMembers")
            .withIndex("by_guild", (q) => q.eq("guildId", args.guildId))
            .collect();

        // Enrich with user data and avatar loadout
        const enrichedMembers = await Promise.all(
            members.map(async (member) => {
                const user = await ctx.db.get(member.userId);

                // Fetch game state for avatar loadout
                const gameStateRec = await ctx.db
                    .query("gameState")
                    .withIndex("by_user", (q) => q.eq("userId", member.userId))
                    .first();

                const stats = gameStateRec?.state?.stats || {};

                return {
                    ...member,
                    userName: user?.name ?? "Unknown",
                    userPictureUrl: user?.pictureUrl,
                    level: stats.level || 1,
                    avatarId: stats.activeAvatarId || 'starter_villager_male',
                    weaponId: stats.activeMainHandId || null,
                    armorId: stats.activeArmorId || null,
                    companionId: stats.activeAccessoryId || null,
                    backdropId: stats.activeBackdropId || null,
                };
            })
        );

        // Sort by role (leader first, then officers, then members)
        const roleOrder = { leader: 0, officer: 1, member: 2 };
        return enrichedMembers.sort((a, b) =>
            (roleOrder[a.role as keyof typeof roleOrder] ?? 3) - (roleOrder[b.role as keyof typeof roleOrder] ?? 3)
        );
    },
});

// Get guild activity feed
export const getGuildActivity = query({
    args: { guildId: v.id("guilds"), limit: v.optional(v.number()) },
    handler: async (ctx, args) => {
        const activities = await ctx.db
            .query("guildActivities")
            .withIndex("by_guild", (q) => q.eq("guildId", args.guildId))
            .order("desc")
            .take(args.limit ?? 20);

        // Enrich with user data
        return Promise.all(
            activities.map(async (activity) => {
                const user = await ctx.db.get(activity.userId);
                return {
                    ...activity,
                    userName: user?.name ?? "Unknown",
                    userPictureUrl: user?.pictureUrl,
                };
            })
        );
    },
});

// Get public guilds for browsing
export const getPublicGuilds = query({
    args: {},
    handler: async (ctx) => {
        const allGuilds = await ctx.db.query("guilds").collect();

        // Filter to public guilds and enrich
        const publicGuilds = await Promise.all(
            allGuilds
                .filter((g) => g.settings.isPublic)
                .map(async (guild) => {
                    const members = await ctx.db
                        .query("guildMembers")
                        .withIndex("by_guild", (q) => q.eq("guildId", guild._id))
                        .collect();

                    return {
                        ...guild,
                        memberCount: members.length,
                    };
                })
        );

        return publicGuilds;
    },
});

// ============================================
// MUTATIONS
// ============================================

// Create a new guild
export const createGuild = mutation({
    args: {
        name: v.string(),
        description: v.optional(v.string()),
        isPublic: v.boolean(),
    },
    handler: async (ctx, args) => {
        const userId = await getCurrentUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        // Check if user is already in a guild
        const existingMembership = await ctx.db
            .query("guildMembers")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .first();

        if (existingMembership) {
            throw new Error("You must leave your current guild before creating a new one");
        }

        // Create the guild
        const guildId = await ctx.db.insert("guilds", {
            name: args.name,
            description: args.description,
            leaderId: userId,
            level: 1,
            xp: 0,
            treasury: { gold: 0, gems: 0 },
            settings: {
                isPublic: args.isPublic,
                joinRequiresApproval: !args.isPublic,
            },
            createdAt: Date.now(),
        });

        // Add creator as leader
        await ctx.db.insert("guildMembers", {
            guildId,
            userId,
            role: "leader",
            contribution: { xp: 0, gold: 0, tasks: 0 },
            joinedAt: Date.now(),
        });

        // Log activity
        await ctx.db.insert("guildActivities", {
            guildId,
            userId,
            type: "guild_created",
            data: { guildName: args.name },
            timestamp: Date.now(),
        });

        return guildId;
    },
});

// Join a public guild
export const joinGuild = mutation({
    args: { guildId: v.id("guilds") },
    handler: async (ctx, args) => {
        const userId = await getCurrentUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        // Check if already in a guild
        const existing = await ctx.db
            .query("guildMembers")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .first();

        if (existing) throw new Error("You must leave your current guild first");

        const guild = await ctx.db.get(args.guildId);
        if (!guild) throw new Error("Guild not found");
        if (!guild.settings.isPublic) throw new Error("This guild is private");

        // Add as member
        await ctx.db.insert("guildMembers", {
            guildId: args.guildId,
            userId,
            role: "member",
            contribution: { xp: 0, gold: 0, tasks: 0 },
            joinedAt: Date.now(),
        });

        // Log activity
        const user = await ctx.db.get(userId);
        await ctx.db.insert("guildActivities", {
            guildId: args.guildId,
            userId,
            type: "joined",
            data: { userName: user?.name ?? "Unknown" },
            timestamp: Date.now(),
        });

        return true;
    },
});

// Leave guild
export const leaveGuild = mutation({
    args: {},
    handler: async (ctx) => {
        const userId = await getCurrentUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const membership = await ctx.db
            .query("guildMembers")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .first();

        if (!membership) throw new Error("You are not in a guild");

        const guild = await ctx.db.get(membership.guildId);

        // Leaders can't leave, they must transfer or disband
        if (membership.role === "leader") {
            throw new Error("Leaders must transfer leadership or disband the guild");
        }

        // Log activity before removing
        const user = await ctx.db.get(userId);
        await ctx.db.insert("guildActivities", {
            guildId: membership.guildId,
            userId,
            type: "left",
            data: { userName: user?.name ?? "Unknown" },
            timestamp: Date.now(),
        });

        await ctx.db.delete(membership._id);
        return true;
    },
});

// Kick a member (officer+ only)
export const kickMember = mutation({
    args: { memberId: v.id("guildMembers") },
    handler: async (ctx, args) => {
        const userId = await getCurrentUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const targetMember = await ctx.db.get(args.memberId);
        if (!targetMember) throw new Error("Member not found");

        // Check permission
        const hasPerms = await hasPermission(ctx, targetMember.guildId, userId, "officer");
        if (!hasPerms) throw new Error("You don't have permission to kick members");

        // Can't kick leader
        if (targetMember.role === "leader") throw new Error("Cannot kick the guild leader");

        // Officers can only kick members, not other officers
        const kickerMembership = await ctx.db
            .query("guildMembers")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .first();

        if (kickerMembership?.role === "officer" && targetMember.role === "officer") {
            throw new Error("Officers cannot kick other officers");
        }

        // Log and remove
        const kickedUser = await ctx.db.get(targetMember.userId);
        await ctx.db.insert("guildActivities", {
            guildId: targetMember.guildId,
            userId: targetMember.userId,
            type: "kicked",
            data: { userName: kickedUser?.name ?? "Unknown" },
            timestamp: Date.now(),
        });

        await ctx.db.delete(args.memberId);
        return true;
    },
});

// Promote member to officer (leader only)
export const promoteMember = mutation({
    args: { memberId: v.id("guildMembers") },
    handler: async (ctx, args) => {
        const userId = await getCurrentUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const targetMember = await ctx.db.get(args.memberId);
        if (!targetMember) throw new Error("Member not found");

        const hasPerms = await hasPermission(ctx, targetMember.guildId, userId, "leader");
        if (!hasPerms) throw new Error("Only the leader can promote members");

        if (targetMember.role !== "member") throw new Error("Can only promote regular members");

        await ctx.db.patch(args.memberId, { role: "officer" });

        const promotedUser = await ctx.db.get(targetMember.userId);
        await ctx.db.insert("guildActivities", {
            guildId: targetMember.guildId,
            userId: targetMember.userId,
            type: "promoted",
            data: { userName: promotedUser?.name ?? "Unknown", newRole: "officer" },
            timestamp: Date.now(),
        });

        return true;
    },
});

// Demote officer to member (leader only)
export const demoteMember = mutation({
    args: { memberId: v.id("guildMembers") },
    handler: async (ctx, args) => {
        const userId = await getCurrentUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const targetMember = await ctx.db.get(args.memberId);
        if (!targetMember) throw new Error("Member not found");

        const hasPerms = await hasPermission(ctx, targetMember.guildId, userId, "leader");
        if (!hasPerms) throw new Error("Only the leader can demote officers");

        if (targetMember.role !== "officer") throw new Error("Can only demote officers");

        await ctx.db.patch(args.memberId, { role: "member" });
        return true;
    },
});

// Update guild settings (officer+ only)
export const updateGuild = mutation({
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
        if (!hasPerms) throw new Error("You don't have permission to update the guild");

        const updates: any = {};
        if (args.name !== undefined) updates.name = args.name;
        if (args.description !== undefined) updates.description = args.description;
        if (args.isPublic !== undefined) {
            const guild = await ctx.db.get(args.guildId);
            updates.settings = {
                ...guild?.settings,
                isPublic: args.isPublic,
            };
        }

        await ctx.db.patch(args.guildId, updates);
        return true;
    },
});

// Disband guild (leader only)
export const disbandGuild = mutation({
    args: { guildId: v.id("guilds") },
    handler: async (ctx, args) => {
        const userId = await getCurrentUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const guild = await ctx.db.get(args.guildId);
        if (!guild) throw new Error("Guild not found");
        if (guild.leaderId !== userId) throw new Error("Only the leader can disband the guild");

        // Delete all members
        const members = await ctx.db
            .query("guildMembers")
            .withIndex("by_guild", (q) => q.eq("guildId", args.guildId))
            .collect();

        for (const member of members) {
            await ctx.db.delete(member._id);
        }

        // Delete all activities
        const activities = await ctx.db
            .query("guildActivities")
            .withIndex("by_guild", (q) => q.eq("guildId", args.guildId))
            .collect();

        for (const activity of activities) {
            await ctx.db.delete(activity._id);
        }

        // Delete all invites
        const invites = await ctx.db
            .query("guildInvites")
            .withIndex("by_guild", (q) => q.eq("guildId", args.guildId))
            .collect();

        for (const invite of invites) {
            await ctx.db.delete(invite._id);
        }

        // Delete the guild
        await ctx.db.delete(args.guildId);
        return true;
    },
});

// Helper to log guild activity
async function logGuildActivity(ctx: any, guildId: Id<"guilds">, userId: Id<"users">, type: string, data: any) {
    await ctx.db.insert("guildActivities", {
        guildId,
        userId,
        type,
        data,
        timestamp: Date.now(),
    });
}

// Log activity (internal helper exposed as mutation for client use)
export const logActivity = mutation({
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

// ============================================
// PROJECT MUTATIONS
// ============================================

export const createProject = mutation({
    args: {
        guildId: v.id("guilds"),
        title: v.string(),
        description: v.optional(v.string()),
        targetTasks: v.number(),
        rewards: v.object({
            xp: v.number(),
            gold: v.number(),
        }),
    },
    handler: async (ctx, args) => {
        const userId = await getCurrentUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const hasPerms = await hasPermission(ctx, args.guildId, userId, "officer");
        if (!hasPerms) throw new Error("Only officers can start projects");

        const projectId = await ctx.db.insert("guildProjects", {
            guildId: args.guildId,
            title: args.title,
            description: args.description,
            status: "active",
            targetTasks: args.targetTasks,
            completedTasks: 0,
            contributors: [],
            rewards: args.rewards,
            createdAt: Date.now(),
        });

        await logGuildActivity(ctx, args.guildId, userId, "project_started", { projectTitle: args.title, projectId });

        return projectId;
    },
});

export const contributeToProject = mutation({
    args: {
        projectId: v.id("guildProjects"),
        amount: v.number(), // tasks/contribution amount
    },
    handler: async (ctx, args) => {
        const userId = await getCurrentUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const project = await ctx.db.get(args.projectId);
        if (!project) throw new Error("Project not found");
        if (project.status !== "active") throw new Error("Project is not active");

        // Verify membership
        const member = await ctx.db
            .query("guildMembers")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .first();

        if (!member || member.guildId !== project.guildId) throw new Error("Not a guild member");

        // Update project
        const newCompleted = Math.min(project.completedTasks + args.amount, project.targetTasks);
        const isComplete = newCompleted >= project.targetTasks;

        // Update contributors list
        const existingContributorIndex = project.contributors.findIndex(c => c.userId === userId);
        const newContributors = [...project.contributors];

        if (existingContributorIndex >= 0) {
            newContributors[existingContributorIndex].tasks += args.amount;
        } else {
            newContributors.push({ userId, tasks: args.amount });
        }

        await ctx.db.patch(args.projectId, {
            completedTasks: newCompleted,
            contributors: newContributors,
            status: isComplete ? "completed" : "active",
            completedAt: isComplete ? Date.now() : undefined,
        });

        // Update member stats
        await ctx.db.patch(member._id, {
            contribution: {
                ...member.contribution,
                tasks: member.contribution.tasks + args.amount,
            }
        });

        // Log activity
        if (isComplete) {
            await logGuildActivity(ctx, project.guildId, userId, "project_completed", { projectTitle: project.title });

            // Simple guild XP update
            const guild = await ctx.db.get(project.guildId);
            if (guild) {
                await ctx.db.patch(project.guildId, {
                    xp: guild.xp + project.rewards.xp,
                    treasury: {
                        ...guild.treasury,
                        gold: guild.treasury.gold + project.rewards.gold
                    }
                });
            }
        }

        return true;
    },
});

export const getGuildProjects = query({
    args: { guildId: v.id("guilds") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("guildProjects")
            .withIndex("by_guild", (q) => q.eq("guildId", args.guildId))
            .filter(q => q.neq(q.field("status"), "archived"))
            .collect();
    },
});
