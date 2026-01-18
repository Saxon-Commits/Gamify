import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { getCurrentUserId, hasPermission } from "./common";

// Get all members of a guild
export const getByGuild = query({
    args: { guildId: v.id("guilds") },
    handler: async (ctx, args) => {
        const userId = await getCurrentUserId(ctx);
        if (!userId) return []; // Or throw auth error? Returning empty is safer for UI

        const members = await ctx.db
            .query("guildMembers")
            .withIndex("by_guild", (q) => q.eq("guildId", args.guildId))
            .collect();

        // Enrich with user details and game state
        const enrichedMembers = await Promise.all(
            members.map(async (member) => {
                const user = await ctx.db.get(member.userId);
                if (!user) {
                    return {
                        ...member,
                        userName: "Unknown",
                        avatar: "",
                        level: 1,
                        avatarId: "starter_villager_male"
                    };
                }

                let level = 1;
                let avatarId = "starter_villager_male";
                let armorId = undefined;
                let companionId = undefined;
                let backdropId = undefined;

                // Extract subject ID from tokenIdentifier
                // Clerk format: "https://issuer|user_id" -> we need "user_id"
                const parts = user.tokenIdentifier.split('|');
                const subjectId = parts.length > 1 ? parts[1] : parts[0];

                // Lookup GameState using subject ID (matches gameState.ts logic)
                const gs = await ctx.db
                    .query("gameState")
                    .withIndex("by_user", (q) => q.eq("userId", subjectId))
                    .first();

                if (gs?.state?.stats) {
                    level = gs.state.stats.level || 1;
                    avatarId = gs.state.stats.activeAvatarId || "starter_villager_male";
                    armorId = gs.state.stats.activeArmorId;
                    companionId = gs.state.stats.activeAccessoryId;
                    backdropId = gs.state.stats.activeBackdropId;
                }

                return {
                    ...member,
                    userName: user.name || "Unknown",  // Property name must match GuildMembersPanel interface
                    avatar: user.pictureUrl || "",
                    level,
                    avatarId,
                    armorId,
                    companionId,
                    backdropId
                };
            })
        );

        // Sort: Leader -> Officers -> Members
        return enrichedMembers.sort((a, b) => {
            const roleWeight = (role: string) => {
                if (role === 'leader') return 3;
                if (role === 'officer') return 2;
                return 1;
            };
            return roleWeight(b.role || 'member') - roleWeight(a.role || 'member');
        });
    },
});

export const kick = mutation({
    args: { memberId: v.id("guildMembers") },
    handler: async (ctx, args) => {
        const userId = await getCurrentUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const targetMember = await ctx.db.get(args.memberId);
        if (!targetMember) throw new Error("Member not found");

        const guild = await ctx.db.get(targetMember.guildId);
        if (!guild) throw new Error("Guild not found");

        // Leader cannot be kicked
        if (guild.leaderId === targetMember.userId) throw new Error("Cannot kick the leader");

        // Check permissions
        // - Leader can kick anyone
        // - Officer can kick members
        // - Officer CANNOT kick other officers
        const isLeader = guild.leaderId === userId;
        const hasOfficerPerms = await hasPermission(ctx, guild._id, userId, "officer");

        if (!hasOfficerPerms) throw new Error("Permission denied");

        if (!isLeader && targetMember.role === "officer") {
            throw new Error("Officers cannot kick other officers");
        }

        await ctx.db.delete(args.memberId);
        return true;
    },
});

export const promote = mutation({
    args: { memberId: v.id("guildMembers") },
    handler: async (ctx, args) => {
        const userId = await getCurrentUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const targetMember = await ctx.db.get(args.memberId);
        if (!targetMember) throw new Error("Member not found");

        const hasLeaderPerms = await hasPermission(ctx, targetMember.guildId, userId, "leader");
        if (!hasLeaderPerms) throw new Error("Only leader can promote members");

        await ctx.db.patch(args.memberId, { role: "officer" });
        return true;
    },
});

export const demote = mutation({
    args: { memberId: v.id("guildMembers") },
    handler: async (ctx, args) => {
        const userId = await getCurrentUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const targetMember = await ctx.db.get(args.memberId);
        if (!targetMember) throw new Error("Member not found");

        const hasLeaderPerms = await hasPermission(ctx, targetMember.guildId, userId, "leader");
        if (!hasLeaderPerms) throw new Error("Only leader can demote members");

        await ctx.db.patch(args.memberId, { role: "member" });
        return true;
    },
});
