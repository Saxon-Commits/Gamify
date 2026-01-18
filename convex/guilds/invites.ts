import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { getCurrentUserId, hasPermission, logGuildActivity, MAX_GUILD_MEMBERS } from "./common";

export const create = mutation({
    args: { guildId: v.id("guilds") },
    handler: async (ctx, args) => {
        const userId = await getCurrentUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

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

export const join = mutation({ // joinGuildByCode
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

export const getByGuild = query({ // getGuildInvites
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

export const revoke = mutation({ // revokeInvite
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
