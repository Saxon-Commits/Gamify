import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get messages for a guild
export const getMessages = query({
    args: { guildId: v.id("guilds") },
    handler: async (ctx, args) => {
        const messages = await ctx.db
            .query("guildMessages")
            .withIndex("by_guild_time", (q) => q.eq("guildId", args.guildId))
            .order("desc")
            .take(50); // Load last 50 messages

        // Enrich with user details
        return await Promise.all(
            messages.map(async (msg) => {
                const user = await ctx.db.get(msg.userId);

                // Get derived username logic (mirroring guilds.ts)
                const userName = user?.username ?? user?.name ?? "Unknown";

                return {
                    ...msg,
                    userName,
                    userPictureUrl: user?.pictureUrl,
                };
            })
        );
    },
});

// Send a message
export const sendMessage = mutation({
    args: {
        guildId: v.id("guilds"),
        content: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");

        const user = await ctx.db
            .query("users")
            .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
            .unique();

        if (!user) throw new Error("User not found");

        // Verify membership?
        const membership = await ctx.db
            .query("guildMembers")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .first();

        if (!membership || membership.guildId !== args.guildId) {
            throw new Error("Not a member of this guild");
        }

        await ctx.db.insert("guildMessages", {
            guildId: args.guildId,
            userId: user._id,
            content: args.content,
            isPinned: false,
            timestamp: Date.now(),
        });
    },
});
// Get announcements (latest 3 pinned messages)
export const getAnnouncements = query({
    args: { guildId: v.id("guilds") },
    handler: async (ctx, args) => {
        const messages = await ctx.db
            .query("guildMessages")
            .withIndex("by_guild_time", (q) => q.eq("guildId", args.guildId))
            .filter(q => q.eq(q.field("isPinned"), true))
            .order("desc")
            .take(3);

        return await Promise.all(
            messages.map(async (msg) => {
                const user = await ctx.db.get(msg.userId);
                const userName = user?.username ?? user?.name ?? "Unknown";

                return {
                    ...msg,
                    userName,
                    userPictureUrl: user?.pictureUrl,
                };
            })
        );
    },
});

// Post an announcement (Leader/Officer only)
export const postAnnouncement = mutation({
    args: {
        guildId: v.id("guilds"),
        content: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");

        const user = await ctx.db
            .query("users")
            .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
            .unique();

        if (!user) throw new Error("User not found");

        const membership = await ctx.db
            .query("guildMembers")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .first();

        if (!membership || membership.guildId !== args.guildId) throw new Error("Not a member");
        if (membership.role !== "leader" && membership.role !== "officer") {
            throw new Error("Only leaders and officers can post announcements");
        }

        await ctx.db.insert("guildMessages", {
            guildId: args.guildId,
            userId: user._id,
            content: args.content,
            isPinned: true,
            timestamp: Date.now(),
        });
    },
});

// Delete an announcement (Leader/Officer only)
export const deleteAnnouncement = mutation({
    args: {
        messageId: v.id("guildMessages"),
        guildId: v.id("guilds"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");

        const user = await ctx.db
            .query("users")
            .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
            .unique();

        if (!user) throw new Error("User not found");

        const membership = await ctx.db
            .query("guildMembers")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .first();

        if (!membership || membership.guildId !== args.guildId) throw new Error("Not a member");
        if (membership.role !== "leader" && membership.role !== "officer") {
            throw new Error("Permission denied");
        }

        const message = await ctx.db.get(args.messageId);
        if (!message) throw new Error("Message not found");
        if (!message.isPinned) throw new Error("Not an announcement");

        await ctx.db.delete(args.messageId);
    },
});
