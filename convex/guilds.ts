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
// Helper to check if user has permission (officer or leader)
async function hasPermission(ctx: any, guildId: Id<"guilds">, userId: Id<"users">, requiredRole: 'leader' | 'officer' | 'member' = 'officer'): Promise<boolean> {
    const members = await ctx.db
        .query("guildMembers")
        .withIndex("by_user", (q: any) => q.eq("userId", userId))
        .collect();

    const member = members.find((m: any) => m.guildId.toString() === guildId.toString());

    if (!member) {
        console.log(`hasPermission FAIL: User ${userId} is not in guild ${guildId}. Memberships:`, members.map((m: any) => m.guildId));
        return false;
    }

    if (requiredRole === 'leader') return member.role === 'leader';
    if (requiredRole === 'officer') return member.role === 'leader' || member.role === 'officer';
    return true;
}

// ============================================
// CONSTANTS
// ============================================

export const MAX_GUILD_MEMBERS = 50;

// ============================================
// QUERIES
// ============================================

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

        if (memberships.length === 0) return [];

        // Fetch guild details for each membership
        const guildsWithDetails = await Promise.all(
            memberships.map(async (membership) => {
                const guild = await ctx.db.get(membership.guildId);
                if (!guild) return null;

                const members = await ctx.db
                    .query("guildMembers")
                    .withIndex("by_guild", (q) => q.eq("guildId", membership.guildId))
                    .collect();

                return {
                    guild,
                    membership,
                    memberCount: members.length,
                };
            })
        );

        return guildsWithDetails.filter((g) => g !== null);
    },
});

// Deprecated (kept for backward compatibility lightly, but ideally should switch frontend)
// This will just return the first one found, or null
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

                let stats: any = {};

                if (user) {
                    // GameState is keyed by Clerk ID (identity.subject), while User is keyed by tokenIdentifier (issuer|subject).
                    // We need to extract the subject to find the game state.
                    const clerkId = user.tokenIdentifier.split('|')[1];

                    if (clerkId) {
                        const gameStateRec = await ctx.db
                            .query("gameState")
                            .withIndex("by_user", (q) => q.eq("userId", clerkId))
                            .first();

                        if (gameStateRec?.state?.stats) {
                            stats = gameStateRec.state.stats;
                        }
                    }
                }

                return {
                    ...member,
                    userName: user?.username ?? user?.name ?? "Unknown",
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

        // Check max guilds (5)
        const myMemberships = await ctx.db
            .query("guildMembers")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .collect();

        if (myMemberships.length >= 5) {
            throw new Error("You have joined the maximum number of guilds (5). Leave one to create a new one.");
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

        // Check if already in THIS guild
        const existing = await ctx.db
            .query("guildMembers")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .filter(q => q.eq(q.field("guildId"), args.guildId))
            .first();

        if (existing) {
            throw new Error("You are already a member of this guild");
        }

        // Check max guilds (5)
        const allMyMemberships = await ctx.db
            .query("guildMembers")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .collect();

        if (allMyMemberships.length >= 5) {
            throw new Error("You have reached the maximum number of guilds (5).");
        }

        const guild = await ctx.db.get(args.guildId);
        if (!guild) throw new Error("Guild not found");
        if (!guild.settings.isPublic) throw new Error("This guild is private");

        // Check member limit
        const memberCount = (await ctx.db
            .query("guildMembers")
            .withIndex("by_guild", (q) => q.eq("guildId", args.guildId))
            .collect()).length;

        if (memberCount >= MAX_GUILD_MEMBERS) {
            throw new Error(`Guild is full (Max ${MAX_GUILD_MEMBERS} members)`);
        }

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
    args: { guildId: v.id("guilds") },
    handler: async (ctx, args) => {
        const userId = await getCurrentUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const membership = await ctx.db
            .query("guildMembers")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .filter(q => q.eq(q.field("guildId"), args.guildId))
            .first();

        if (!membership) throw new Error("You are not in this guild");

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
        targetTasks: v.optional(v.number()),
        rewards: v.optional(v.object({
            xp: v.number(),
            gold: v.number(),
            gems: v.optional(v.number()),
        })),
        tasks: v.optional(v.array(v.object({
            id: v.string(),
            name: v.string(),
            description: v.optional(v.string()),
            xpReward: v.number(),
            goldReward: v.number(),
            difficulty: v.string(),
        }))),
        // New optional args for contest setup
        allowSubmissions: v.optional(v.boolean()),
        submissionDeadline: v.optional(v.number()),
        rankedRewards: v.optional(v.object({
            firstPlace: v.object({ gold: v.number(), xp: v.number(), gems: v.optional(v.number()) }),
            secondPlace: v.optional(v.object({ gold: v.number(), xp: v.number(), gems: v.optional(v.number()) })),
            thirdPlace: v.optional(v.object({ gold: v.number(), xp: v.number(), gems: v.optional(v.number()) })),
        })),
    },
    handler: async (ctx, args) => {
        const userId = await getCurrentUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const hasPerms = await hasPermission(ctx, args.guildId, userId, "officer");
        if (!hasPerms) throw new Error("Only officers can start projects");

        // VALIDATE TREASURY FUNDS
        const guild = await ctx.db.get(args.guildId);
        if (!guild) throw new Error("Guild not found");

        const standardGold = args.rewards?.gold || 0;
        const standardGems = args.rewards?.gems || 0;

        // Calculate Ranked Rewards Cost
        // NOTE: We assume these are ONE-TIME payouts from the treasury pool.
        let rankedGold = 0;
        let rankedGems = 0;

        if (args.rankedRewards) {
            rankedGold += (args.rankedRewards.firstPlace?.gold || 0);
            rankedGems += (args.rankedRewards.firstPlace?.gems || 0);

            if (args.rankedRewards.secondPlace) {
                rankedGold += (args.rankedRewards.secondPlace.gold || 0);
                rankedGems += (args.rankedRewards.secondPlace.gems || 0);
            }
            if (args.rankedRewards.thirdPlace) {
                rankedGold += (args.rankedRewards.thirdPlace.gold || 0);
                rankedGems += (args.rankedRewards.thirdPlace.gems || 0);
            }
        }

        const totalGoldCost = standardGold + rankedGold;
        const totalGemsCost = standardGems + rankedGems;

        if (totalGoldCost > 0 || totalGemsCost > 0) {
            const currentGold = guild.treasury.gold || 0;
            const currentGems = guild.treasury.gems || 0;

            if (currentGold < totalGoldCost) throw new Error(`Insufficient Treasury Gold (Has: ${currentGold}, Needs: ${totalGoldCost})`);
            if (currentGems < totalGemsCost) throw new Error(`Insufficient Treasury Gems (Has: ${currentGems}, Needs: ${totalGemsCost})`);

            // DEDUCT FUNDS
            await ctx.db.patch(args.guildId, {
                treasury: {
                    ...guild.treasury,
                    gold: currentGold - totalGoldCost,
                    gems: currentGems - totalGemsCost,
                }
            });
        }

        const projectId = await ctx.db.insert("guildProjects", {
            guildId: args.guildId,
            title: args.title || "New Project",
            description: args.description || "",
            status: "active",
            targetTasks: args.targetTasks || args.tasks?.length || 100,
            completedTasks: 0,
            contributors: [],
            rewards: args.rewards || { xp: 0, gold: 0, gems: 0 },
            rankedRewards: args.rankedRewards,
            totalEscrowed: {
                gold: totalGoldCost,
                gems: totalGemsCost
            },
            storedTasks: args.tasks,
            allowSubmissions: args.allowSubmissions ?? false,
            submissionDeadline: args.submissionDeadline,
            joinedUserIds: [userId], // Auto-join creator
            createdAt: Date.now(),
            creatorId: userId,
        });

        await logGuildActivity(ctx, args.guildId, userId, "project_started", {
            projectTitle: args.title,
            projectId,
            cost: { gold: totalGoldCost, gems: totalGemsCost }
        });

        return projectId;
    },
});

export const updateProject = mutation({
    args: {
        projectId: v.id("guildProjects"),
        title: v.optional(v.string()),
        description: v.optional(v.string()),
        allowSubmissions: v.optional(v.boolean()),
        submissionDeadline: v.optional(v.number()),
        consolidateRewards: v.optional(v.boolean()),
        rankedRewards: v.optional(v.object({
            firstPlace: v.object({ gold: v.number(), xp: v.number(), gems: v.optional(v.number()) }),
            secondPlace: v.optional(v.object({ gold: v.number(), xp: v.number(), gems: v.optional(v.number()) })),
            thirdPlace: v.optional(v.object({ gold: v.number(), xp: v.number(), gems: v.optional(v.number()) })),
        })),
        rewards: v.optional(v.object({
            xp: v.number(),
            gold: v.number(),
            gems: v.optional(v.number()),
        })),
    },
    handler: async (ctx, args) => {
        const userId = await getCurrentUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const project = await ctx.db.get(args.projectId);
        if (!project) throw new Error("Project not found");

        const hasPerms = await hasPermission(ctx, project.guildId, userId, "officer"); // Only officers can update settings
        if (!hasPerms) {
            // Check if just editing description (allowed for members?) - NO, only officers should change project settings
            // But members might collaboratively edit the "About" doc? 
            // For now, restrict settings updates to officers.
            throw new Error("Only officers can update project settings");
        }

        const updates: any = {};

        // HANDLE ESCROW UPDATES
        // Calculate New Total Cost
        const newStandardGold = args.rewards?.gold ?? project.rewards.gold;
        const newStandardGems = args.rewards?.gems ?? project.rewards.gems ?? 0;

        let newRankedGold = 0;
        let newRankedGems = 0;

        // Use new ranked rewards if provided, otherwise use existing
        const activeRankedRewards = args.rankedRewards !== undefined ? args.rankedRewards : project.rankedRewards;

        if (activeRankedRewards) {
            newRankedGold += (activeRankedRewards.firstPlace?.gold || 0);
            newRankedGems += (activeRankedRewards.firstPlace?.gems || 0);
            if (activeRankedRewards.secondPlace) {
                newRankedGold += (activeRankedRewards.secondPlace.gold || 0);
                newRankedGems += (activeRankedRewards.secondPlace.gems || 0);
            }
            if (activeRankedRewards.thirdPlace) {
                newRankedGold += (activeRankedRewards.thirdPlace.gold || 0);
                newRankedGems += (activeRankedRewards.thirdPlace.gems || 0);
            }
        }

        const newTotalGold = newStandardGold + newRankedGold;
        const newTotalGems = newStandardGems + newRankedGems;

        const oldEscrowGold = project.totalEscrowed?.gold || 0;
        const oldEscrowGems = project.totalEscrowed?.gems || 0;

        const goldDelta = newTotalGold - oldEscrowGold;
        const gemsDelta = newTotalGems - oldEscrowGems;

        if (goldDelta !== 0 || gemsDelta !== 0) {
            const guild = await ctx.db.get(project.guildId);
            if (!guild) throw new Error("Guild not found");

            // If cost increased, check treasury
            if (goldDelta > 0 && (guild.treasury.gold || 0) < goldDelta) {
                throw new Error(`Insufficient Treasury Gold for update (Needs: ${goldDelta})`);
            }
            if (gemsDelta > 0 && (guild.treasury.gems || 0) < gemsDelta) {
                throw new Error(`Insufficient Treasury Gems for update (Needs: ${gemsDelta})`);
            }

            // Apply Treasury Patch
            await ctx.db.patch(project.guildId, {
                treasury: {
                    ...guild.treasury,
                    gold: (guild.treasury.gold || 0) - goldDelta,
                    gems: (guild.treasury.gems || 0) - gemsDelta
                }
            });

            // Update Project Escrow
            updates.totalEscrowed = {
                gold: newTotalGold,
                gems: newTotalGems
            };
        }

        const updatesToApply: any = { ...updates };
        if (args.title !== undefined) updatesToApply.title = args.title;
        if (args.description !== undefined) updatesToApply.description = args.description;
        if (args.allowSubmissions !== undefined) updatesToApply.allowSubmissions = args.allowSubmissions;
        if (args.submissionDeadline !== undefined) updatesToApply.submissionDeadline = args.submissionDeadline;
        if (args.consolidateRewards !== undefined) updatesToApply.consolidateRewards = args.consolidateRewards;
        if (args.rankedRewards !== undefined) updatesToApply.rankedRewards = args.rankedRewards;

        // Add Editor Metadata
        const user = await ctx.db.get(userId);
        if (user) {
            updatesToApply.lastEditedByName = user.username || "Unknown Member";
            updatesToApply.lastEditedAt = Date.now();
        }

        await ctx.db.patch(args.projectId, updatesToApply);
        return true;
    },
});

export const deleteProject = mutation({
    args: {
        projectId: v.id("guildProjects"),
    },
    handler: async (ctx, args) => {
        const userId = await getCurrentUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const project = await ctx.db.get(args.projectId);
        if (!project) throw new Error("Project not found");

        const hasPerms = await hasPermission(ctx, project.guildId, userId, "officer");
        if (!hasPerms) throw new Error("Only officers can delete projects");

        // Refund Treasury
        const guild = await ctx.db.get(project.guildId);
        if (guild && project.status === "active") {
            const refundGold = project.totalEscrowed?.gold ?? project.rewards.gold ?? 0;
            const refundGems = project.totalEscrowed?.gems ?? project.rewards.gems ?? 0;

            if (refundGold > 0 || refundGems > 0) {
                await ctx.db.patch(project.guildId, {
                    treasury: {
                        ...guild.treasury,
                        gold: (guild.treasury.gold || 0) + refundGold,
                        gems: (guild.treasury.gems || 0) + refundGems,
                    }
                });
            }
        }

        await ctx.db.delete(args.projectId);

        await logGuildActivity(ctx, project.guildId, userId, "project_deleted", {
            projectTitle: project.title
        });

        return true;
    },
});

export const joinProject = mutation({
    args: {
        guildId: v.id("guilds"),
        projectId: v.id("guildProjects"),
    },
    handler: async (ctx, args) => {
        const userId = await getCurrentUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const project = await ctx.db.get(args.projectId);
        if (!project) throw new Error("Project not found");

        if (project.joinedUserIds?.includes(userId)) {
            throw new Error("Already joined");
        }

        await ctx.db.patch(args.projectId, {
            joinedUserIds: [...(project.joinedUserIds || []), userId]
        });

        await logGuildActivity(ctx, project.guildId, userId, "project_joined", {
            projectTitle: project.title
        });

        return true;
    },
});

export const leaveProject = mutation({
    args: {
        guildId: v.id("guilds"),
        projectId: v.id("guildProjects"),
    },
    handler: async (ctx, args) => {
        const userId = await getCurrentUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const project = await ctx.db.get(args.projectId);
        if (!project) throw new Error("Project not found");

        if (!project.joinedUserIds?.includes(userId)) {
            throw new Error("You are not part of this project");
        }

        // Remove user from joined list
        const newJoinedIds = project.joinedUserIds.filter((id: string) => id !== userId);
        await ctx.db.patch(args.projectId, {
            joinedUserIds: newJoinedIds
        });

        await logGuildActivity(ctx, args.guildId, userId, "project_contribution", {
            projectTitle: project.title,
            action: "left"
        });

        return true;
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
                const xpReward = project.rewards.xp;
                let newXp = guild.xp + xpReward;
                let newLevel = guild.level;

                // Simple Leveling Curve: Next Level = CurrentLevel * 1000
                // While we have enough XP to level up...
                while (newXp >= newLevel * 1000) {
                    newXp -= newLevel * 1000;
                    newLevel++;

                    // Log Level Up
                    await logGuildActivity(ctx, project.guildId, userId, "guild_level_up", {
                        newLevel,
                        prevLevel: newLevel - 1
                    });
                }

                await ctx.db.patch(project.guildId, {
                    xp: newXp,
                    level: newLevel,
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
        const projects = await ctx.db
            .query("guildProjects")
            .withIndex("by_guild", (q) => q.eq("guildId", args.guildId))
            .filter(q => q.neq(q.field("status"), "archived"))
            .collect();

        // Enrich with preview of joined users (up to 3)
        return await Promise.all(projects.map(async (p) => {
            const joinedIds = p.joinedUserIds || [];
            const previewIds = joinedIds.slice(0, 3);

            const previewUsers = await Promise.all(previewIds.map(async (id) => {
                const user = await ctx.db.get(id);
                return {
                    name: user?.name || "Unknown",
                    pictureUrl: user?.pictureUrl
                };
            }));

            return {
                ...p,
                joinedMemberCount: joinedIds.length,
                previewMembers: previewUsers
            };
        }));
    },
});

// ============================================
// INVITE SYSTEM
// ============================================

export const createInvite = mutation({
    args: { guildId: v.id("guilds") },
    handler: async (ctx, args) => {
        const userId = await getCurrentUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        // Check if member
        // Check if member
        const members = await ctx.db
            .query("guildMembers")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .collect();

        const member = members.find(m => m.guildId === args.guildId);

        if (!member || member.guildId !== args.guildId) throw new Error("Not a member of this guild");

        // Generate simple 6-char code
        const code = Math.random().toString(36).substring(2, 8).toUpperCase();

        await ctx.db.insert("guildInvites", {
            guildId: args.guildId,
            inviteCode: code,
            status: "active",
            createdAt: Date.now(),
            expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
        });

        return code;
    },
});

export const joinGuildByCode = mutation({
    args: { inviteCode: v.string() },
    handler: async (ctx, args) => {
        const userId = await getCurrentUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const invite = await ctx.db
            .query("guildInvites")
            .withIndex("by_code", (q) => q.eq("inviteCode", args.inviteCode))
            .first();

        if (!invite) throw new Error("Invalid invite code");
        if (!invite.status || invite.status !== "active") throw new Error("Invite expired or inactive");
        if (invite.expiresAt && invite.expiresAt < Date.now()) throw new Error("Invite expired");

        // Check if already in a guild
        // Check existing memberships
        const existingMemberships = await ctx.db
            .query("guildMembers")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .collect();

        // Idempotency: If already in THIS guild, just return success
        if (existingMemberships.some(m => m.guildId === invite.guildId)) {
            return invite.guildId;
        }

        if (existingMemberships.length >= 5) {
            throw new Error("You have reached the maximum limit of 5 guilds.");
        }

        // Check member limit
        const memberCount = (await ctx.db
            .query("guildMembers")
            .withIndex("by_guild", (q) => q.eq("guildId", invite.guildId))
            .collect()).length;

        if (memberCount >= MAX_GUILD_MEMBERS) {
            throw new Error(`Guild is full (Max ${MAX_GUILD_MEMBERS} members)`);
        }

        // Add member
        await ctx.db.insert("guildMembers", {
            guildId: invite.guildId,
            userId,
            role: "member",
            contribution: { xp: 0, gold: 0, tasks: 0 },
            joinedAt: Date.now(),
        });

        // Log
        const user = await ctx.db.get(userId);
        await logGuildActivity(ctx, invite.guildId, userId, "joined", { userName: user?.name ?? "Unknown", method: "invite" });

        return invite.guildId;
    },
});

export const getGuildInvites = query({
    args: { guildId: v.id("guilds") },
    handler: async (ctx, args) => {
        const userId = await getCurrentUserId(ctx);
        if (!userId) return [];

        // Check if user is officer+
        const hasPerms = await hasPermission(ctx, args.guildId, userId, "officer");
        if (!hasPerms) return [];

        const invites = await ctx.db
            .query("guildInvites")
            .withIndex("by_guild", (q) => q.eq("guildId", args.guildId))
            .filter((q) => q.eq(q.field("status"), "active"))
            .collect();

        return invites;
    },
});

export const revokeInvite = mutation({
    args: { inviteId: v.id("guildInvites") },
    handler: async (ctx, args) => {
        const userId = await getCurrentUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const invite = await ctx.db.get(args.inviteId);
        if (!invite) throw new Error("Invite not found");

        const hasPerms = await hasPermission(ctx, invite.guildId, userId, "officer");
        if (!hasPerms) throw new Error("Permission denied");

        await ctx.db.delete(args.inviteId);
        return true;
    },
});
// Debugging/Admin: Add XP manually
export const addGuildXp = mutation({
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

export const donateToTreasury = mutation({
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
        // Fetch User (for name) and GameState (for currency)
        const user = await ctx.db.get(userId);
        if (!user) throw new Error("User not found");

        // Identity needed for gameState lookup (uses subject ID, not Convex ID)
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
        // Note: We need to update the whole state object or carefully patch it. 
        // Since 'state' is 'v.any()', we can patch the whole stats object inside it if we constructed it, 
        // but here we modified `currentStats` which is a reference to `gameState.state.stats`.
        // So `gameState.state` is mutated in memory. We put it back.
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
                // Only tracking Gold in contribution based on schema? 
                // Schema has { xp, gold, tasks }. Maybe we should add 'gems' to schema?
                // For now, let's keep it simple or map gems to gold value? No, just track gold or ignore gems in "contribution" stats for now.
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



export const awardContestWinners = mutation({
    args: {
        projectId: v.id("guildProjects"),
        firstPlaceUserId: v.optional(v.id("users")),
        secondPlaceUserId: v.optional(v.id("users")),
        thirdPlaceUserId: v.optional(v.id("users")),
    },
    handler: async (ctx, args) => {
        const userId = await getCurrentUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const project = await ctx.db.get(args.projectId);
        if (!project) throw new Error("Project not found");

        const hasPerms = await hasPermission(ctx, project.guildId, userId, "officer");
        if (!hasPerms) throw new Error("Only officers can award winners");

        // 1. Distribute Prizes
        const winners: { place: number, userId: Id<"users">, rewards: any }[] = [];

        // Helper to process winner
        const processWinner = async (uid: Id<"users"> | undefined, rank: 'firstPlace' | 'secondPlace' | 'thirdPlace', placeVal: number) => {
            if (!uid) return;

            const reward = project.rankedRewards?.[rank];
            if (!reward) return;

            const user = await ctx.db.get(uid);
            if (!user) return; // Users might disappear?

            // Standardize reward addition
            const clerkId = user.tokenIdentifier.split('|')[1];
            if (!clerkId) return;

            const gameState = await ctx.db
                .query("gameState")
                .withIndex("by_user", (q) => q.eq("userId", clerkId))
                .first();

            if (gameState) {
                const newState = { ...gameState.state };
                if (!newState.stats) newState.stats = {};
                newState.stats.gold = (newState.stats.gold || 0) + (reward.gold || 0);
                newState.stats.xp = (newState.stats.xp || 0) + (reward.xp || 0);

                await ctx.db.patch(gameState._id, { state: newState });
            }

            // Update Gems on User Table
            if (reward.gems && reward.gems > 0) {
                await ctx.db.patch(uid, {
                    gems: (user.gems || 0) + reward.gems
                });
            }

            winners.push({ place: placeVal, userId: uid, rewards: reward });
        };

        if (args.firstPlaceUserId) await processWinner(args.firstPlaceUserId, 'firstPlace', 1);
        if (args.secondPlaceUserId) await processWinner(args.secondPlaceUserId, 'secondPlace', 2);
        if (args.thirdPlaceUserId) await processWinner(args.thirdPlaceUserId, 'thirdPlace', 3);

        // 2. Refund Unused Escrow
        const spentGold = winners.reduce((acc, w) => acc + (w.rewards.gold || 0), 0);
        const spentGems = winners.reduce((acc, w) => acc + (w.rewards.gems || 0), 0);

        const totalEscrowedGold = project.totalEscrowed?.gold || 0;
        const totalEscrowedGems = project.totalEscrowed?.gems || 0;

        const standardReservedGold = (project.rewards?.gold || 0);
        const rankedEscrowGold = totalEscrowedGold - standardReservedGold;
        const rankedEscrowGems = totalEscrowedGems - (project.rewards?.gems || 0);

        const refundGold = Math.max(0, rankedEscrowGold - spentGold);
        const refundGems = Math.max(0, rankedEscrowGems - spentGems);

        if (refundGold > 0 || refundGems > 0) {
            const guild = await ctx.db.get(project.guildId);
            if (guild) {
                await ctx.db.patch(project.guildId, {
                    treasury: {
                        ...guild.treasury,
                        gold: (guild.treasury.gold || 0) + refundGold,
                        gems: (guild.treasury.gems || 0) + refundGems,
                    }
                });
            }
        }

        // 3. Mark as Completed & Store Winners
        await ctx.db.patch(args.projectId, {
            status: "completed",
            completedAt: Date.now(),
            winners: {
                firstPlaceUserId: args.firstPlaceUserId,
                secondPlaceUserId: args.secondPlaceUserId,
                thirdPlaceUserId: args.thirdPlaceUserId,
            }
        });

        await logGuildActivity(ctx, project.guildId, userId, "project_awarded", {
            projectTitle: project.title,
            winners: winners.map(w => ({ place: w.place, userId: w.userId }))
        });

        return true;
    },
});


// ============================================
// BOUNTY BOARD MUTATIONS (Verified)
// ============================================

// Helper to award funds to user
async function awardUser(ctx: any, userId: Id<"users">, gold: number, gems: number) {
    const user = await ctx.db.get(userId);
    if (!user) return;
    // User is keyed by tokenIdentifier. GameState is keyed by userId (Convex ID) OR token subject?
    // Let's check getGuildMembers query:
    // const clerkId = user.tokenIdentifier.split('|')[1];
    // const gameStateRec = await ctx.db.query("gameState").withIndex("by_user", ...).first();

    // We must mirror that logic.
    const clerkId = user.tokenIdentifier.split('|')[1];

    const userState = await ctx.db.query("gameState").withIndex("by_user", (q: any) => q.eq("userId", clerkId)).first();

    if (userState && userState.state && userState.state.stats) {
        const stats = userState.state.stats;
        await ctx.db.patch(userState._id, {
            state: {
                ...userState.state,
                stats: {
                    ...stats,
                    gold: (stats.gold || 0) + gold,
                    gems: (stats.gems || 0) + gems
                }
            }
        });
    }
}

export const createBounty = mutation({
    args: {
        guildId: v.id("guilds"),
        title: v.string(),
        description: v.string(),
        reward: v.object({
            gold: v.number(),
            gems: v.optional(v.number()),
        }),
    },
    handler: async (ctx, args) => {
        const userId = await getCurrentUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const hasPerms = await hasPermission(ctx, args.guildId, userId, "officer");
        if (!hasPerms) throw new Error("Only officers can create bounties");

        const guild = await ctx.db.get(args.guildId);
        if (!guild) throw new Error("Guild not found");

        const costGold = args.reward.gold;
        const costGems = args.reward.gems || 0;

        if (guild.treasury.gold < costGold) throw new Error("Insufficient Treasury Gold");
        if ((guild.treasury.gems || 0) < costGems) throw new Error("Insufficient Treasury Gems");

        // Deduct from Treasury (Escrow)
        await ctx.db.patch(args.guildId, {
            treasury: {
                ...guild.treasury,
                gold: guild.treasury.gold - costGold,
                gems: (guild.treasury.gems || 0) - costGems,
            }
        });

        const bountyId = await ctx.db.insert("guildBounties", {
            guildId: args.guildId,
            title: args.title,
            description: args.description,
            reward: args.reward,
            createdBy: userId,
            status: "OPEN",
            createdAt: Date.now(),
        });

        await logGuildActivity(ctx, args.guildId, userId, "bounty_created", {
            title: args.title,
            reward: args.reward
        });

        return bountyId;
    },
});

export const claimBounty = mutation({
    args: { bountyId: v.id("guildBounties") },
    handler: async (ctx, args) => {
        const userId = await getCurrentUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const bounty = await ctx.db.get(args.bountyId);
        if (!bounty) throw new Error("Bounty not found");

        if (bounty.status !== "OPEN") throw new Error("Bounty is not available");

        // Check if member
        const member = await ctx.db.query("guildMembers")
            .withIndex("by_user", q => q.eq("userId", userId))
            .filter(q => q.eq(q.field("guildId"), bounty.guildId))
            .first();

        if (!member) throw new Error("You must be a member to claim this bounty");

        await ctx.db.patch(args.bountyId, {
            status: "CLAIMED",
            claimedBy: userId,
        });

        return true;
    },
});

export const submitBounty = mutation({
    args: {
        bountyId: v.id("guildBounties"),
        proof: v.string(), // Description or Link
    },
    handler: async (ctx, args) => {
        const userId = await getCurrentUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const bounty = await ctx.db.get(args.bountyId);
        if (!bounty) throw new Error("Bounty not found");

        if (bounty.claimedBy !== userId) throw new Error("You have not claimed this bounty");
        if (bounty.status !== "CLAIMED") throw new Error("Bounty is not in claimed status");

        await ctx.db.patch(args.bountyId, {
            status: "SUBMITTED",
            submittedAt: Date.now(),
            proof: args.proof,
        });

        return true;
    },
});

export const approveBounty = mutation({
    args: { bountyId: v.id("guildBounties") },
    handler: async (ctx, args) => {
        const userId = await getCurrentUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const bounty = await ctx.db.get(args.bountyId);
        if (!bounty) throw new Error("Bounty not found");
        if (bounty.status !== "SUBMITTED") throw new Error("Bounty is not submitted");

        const hasPerms = await hasPermission(ctx, bounty.guildId, userId, "officer");
        if (!hasPerms) throw new Error("Only officers can approve bounties");

        if (!bounty.claimedBy) throw new Error("No claimant found");

        // Transfer Rewards
        await awardUser(ctx, bounty.claimedBy, bounty.reward.gold, bounty.reward.gems || 0);

        await ctx.db.patch(args.bountyId, {
            status: "COMPLETED",
        });

        const claimant = await ctx.db.get(bounty.claimedBy);
        await logGuildActivity(ctx, bounty.guildId, userId, "bounty_completed", {
            title: bounty.title,
            winner: claimant?.name ?? "Unknown",
            reward: bounty.reward
        });

        // Update contributor stats
        const membership = await ctx.db.query("guildMembers")
            .withIndex("by_user", q => q.eq("userId", bounty.claimedBy!))
            .filter(q => q.eq(q.field("guildId"), bounty.guildId))
            .first();

        if (membership) {
            await ctx.db.patch(membership._id, {
                contribution: {
                    ...membership.contribution,
                    tasks: membership.contribution.tasks + 1,
                }
            });
        }

        return true;
    },
});

export const denyBounty = mutation({
    args: { bountyId: v.id("guildBounties") },
    handler: async (ctx, args) => {
        const userId = await getCurrentUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const bounty = await ctx.db.get(args.bountyId);
        if (!bounty) throw new Error("Bounty not found");

        const hasPerms = await hasPermission(ctx, bounty.guildId, userId, "officer");
        if (!hasPerms) throw new Error("Only officers can deny bounties");

        await ctx.db.patch(args.bountyId, {
            status: "CLAIMED",
            submittedAt: undefined,
            proof: undefined, // Clear proof
        });

        return true;
    },
});

export const cancelBounty = mutation({
    args: { bountyId: v.id("guildBounties") },
    handler: async (ctx, args) => {
        const userId = await getCurrentUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const bounty = await ctx.db.get(args.bountyId);
        if (!bounty) throw new Error("Bounty not found");
        if (bounty.status === "COMPLETED") throw new Error("Cannot cancel completed bounty");

        const hasPerms = await hasPermission(ctx, bounty.guildId, userId, "officer");
        if (!hasPerms) throw new Error("Only officers can cancel bounties");

        // Refund Treasury
        const guild = await ctx.db.get(bounty.guildId);
        if (guild) {
            await ctx.db.patch(bounty.guildId, {
                treasury: {
                    ...guild.treasury,
                    gold: guild.treasury.gold + bounty.reward.gold,
                    gems: (guild.treasury.gems || 0) + (bounty.reward.gems || 0),
                }
            });
        }

        await ctx.db.delete(args.bountyId);
        return true;
    },
});

export const dropBounty = mutation({
    args: { bountyId: v.id("guildBounties") },
    handler: async (ctx, args) => {
        const userId = await getCurrentUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const bounty = await ctx.db.get(args.bountyId);
        if (!bounty) throw new Error("Bounty not found");
        if (bounty.claimedBy !== userId) throw new Error("You do not own this claim");
        if (bounty.status === "COMPLETED") throw new Error("Already completed");

        await ctx.db.patch(args.bountyId, {
            status: "OPEN",
            claimedBy: undefined,
            submittedAt: undefined,
            proof: undefined,
        });

        return true;
    },
});


export const getGuildBounties = query({
    args: { guildId: v.id("guilds") },
    handler: async (ctx, args) => {
        const bounties = await ctx.db
            .query("guildBounties")
            .withIndex("by_guild", (q) => q.eq("guildId", args.guildId))
            .collect();

        // Enrich with user data
        return Promise.all(
            bounties.map(async (b) => {
                const creator = await ctx.db.get(b.createdBy);
                const claimant = b.claimedBy ? await ctx.db.get(b.claimedBy) : null;
                return {
                    ...b,
                    creatorName: creator?.name ?? "Unknown",
                    claimantName: claimant?.name ?? "Unknown",
                    claimantAvatar: claimant?.pictureUrl,
                };
            })
        );
    },
});
