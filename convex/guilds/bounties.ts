import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { Id } from "../_generated/dataModel";
import { cleanText } from "../textSafety";
import { getCurrentUserId, hasPermission, logGuildActivity } from "./common";

// Helper to award funds to user via pending rewards queue
// This ensures SyncManager picks up the rewards and shows toast notifications
async function awardUser(ctx: any, userId: Id<"users">, gold: number, gems: number) {
    const user = await ctx.db.get(userId);
    if (!user) return;

    // Queue gold reward if > 0
    if (gold > 0) {
        await ctx.db.insert("pendingRewards", {
            userId: userId,
            type: "gold",
            amount: gold,
            description: "Guild Bounty Reward",
            createdAt: Date.now(),
        });
    }

    // Queue gems reward if > 0
    if (gems > 0) {
        await ctx.db.insert("pendingRewards", {
            userId: userId,
            type: "gems",
            amount: gems,
            description: "Guild Bounty Reward",
            createdAt: Date.now(),
        });
    }
}

export const create = mutation({
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
            title: cleanText(args.title),
            description: cleanText(args.description),
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

export const claim = mutation({
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

export const submit = mutation({
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

export const approve = mutation({
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

export const deny = mutation({
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

export const cancel = mutation({
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

export const drop = mutation({
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

export const getByGuild = query({
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
