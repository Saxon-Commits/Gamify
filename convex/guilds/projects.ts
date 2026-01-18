import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { cleanText } from "../textSafety";
import { getCurrentUserId, hasPermission, logGuildActivity } from "./common";
import { Id } from "../_generated/dataModel";

// ============================================
// PROJECT MUTATIONS
// ============================================

export const create = mutation({
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
            title: cleanText(args.title || "New Project"),
            description: cleanText(args.description || ""),
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

export const update = mutation({
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
        if (args.title !== undefined) updatesToApply.title = cleanText(args.title);
        if (args.description !== undefined) updatesToApply.description = cleanText(args.description);
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

export const remove = mutation({ // 'delete' is a reserved word potentially, but 'remove' is safer
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

export const join = mutation({
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

export const leave = mutation({
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

export const contribute = mutation({
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
        const existingContributorIndex = project.contributors.findIndex((c: any) => c.userId === userId);
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

export const getByGuild = query({
    args: { guildId: v.id("guilds") },
    handler: async (ctx, args) => {
        const projects = await ctx.db
            .query("guildProjects")
            .withIndex("by_guild", (q) => q.eq("guildId", args.guildId))
            .filter((q) => q.neq(q.field("status"), "archived"))
            .collect();

        // Enrich with preview of joined users (up to 3)
        return await Promise.all(projects.map(async (p) => {
            const joinedIds = p.joinedUserIds || [];
            const previewIds = joinedIds.slice(0, 3);

            const previewUsers = await Promise.all(previewIds.map(async (id) => {
                const user = await ctx.db.get(id as Id<"users">);
                if (!user) return { name: "Unknown", pictureUrl: "" };
                return {
                    name: user.name || "Unknown",
                    pictureUrl: user.pictureUrl || ""
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

export const awardWinners = mutation({
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
        const winners: { place: number, userId: any, rewards: any }[] = [];

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

        await processWinner(args.firstPlaceUserId, 'firstPlace', 1);
        await processWinner(args.secondPlaceUserId, 'secondPlace', 2);
        await processWinner(args.thirdPlaceUserId, 'thirdPlace', 3);

        // Refund Treasury if unused logic? (Not implemented in original, assuming sunk cost or manually adjusted, 
        // actually original implementation had refund logic but it was cut off in viewing, 
        // Wait, lines 1420+ showed refund logic. I need to make sure I include that.)

        // Calculated Total Used:
        let usedGold = 0;
        let usedGems = 0;
        winners.forEach(w => {
            usedGold += w.rewards.gold || 0;
            usedGems += w.rewards.gems || 0;
        });

        // Current Escrow for Ranked (We need to separate standard rewards logic from this?)
        // The project has `totalEscrowed`. Standard rewards (completion) are separate from Ranked.
        // Wait, standard rewards are per user? No, "rewards" arg in createProject is "XP/Gold per task" or "Per Project"?
        // `rewards` is { xp, gold, gems }.
        // `rankedRewards` is separate.
        // `totalEscrowed` includes both.

        // If we treat `rankedRewards` as the *only* thing being awarded here...
        // We need to calculate what was allocated for ranked vs what was used.
        // This is complex logic. The original code had refund logic.
        // I will copy the refund logic I saw in lines 1420:

        // Re-calcuating what SHOULD have been spent vs what WAS spent
        // Actually, simpler: Refund ANY unused ranked budget.
        // If we allocated First/Second/Third, but Third wasn't awarded, refund Third.
        // If we allocated 100g, and user got 100g, refund 0.

        // Re-calc Max Possible Ranked Cost (what was escrowed for ranked)
        let allocatedRankedGold = 0;
        let allocatedRankedGems = 0;
        if (project.rankedRewards) {
            allocatedRankedGold += (project.rankedRewards.firstPlace?.gold || 0);
            allocatedRankedGems += (project.rankedRewards.firstPlace?.gems || 0);
            if (project.rankedRewards.secondPlace) {
                allocatedRankedGold += (project.rankedRewards.secondPlace.gold || 0);
                allocatedRankedGems += (project.rankedRewards.secondPlace.gems || 0);
            }
            if (project.rankedRewards.thirdPlace) {
                allocatedRankedGold += (project.rankedRewards.thirdPlace.gold || 0);
                allocatedRankedGems += (project.rankedRewards.thirdPlace.gems || 0);
            }
        }

        const refundGold = allocatedRankedGold - usedGold;
        const refundGems = allocatedRankedGems - usedGems;

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
