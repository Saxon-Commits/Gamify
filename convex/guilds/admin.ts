import { v } from "convex/values";
import { mutation, query } from "../_generated/server";

// Helper: Verify Admin Status
async function ensureAdmin(ctx: any) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
        .query("users")
        .withIndex("by_token", (q: any) => q.eq("tokenIdentifier", identity.tokenIdentifier))
        .unique();

    if (!user || user.role !== 'admin') {
        throw new Error("Access Denied: Admins Only");
    }

    return user;
}

export const getAll = query({
    args: {},
    handler: async (ctx) => {
        await ensureAdmin(ctx);
        const guilds = await ctx.db.query("guilds").collect();

        // Enrich with leader name and member count
        return await Promise.all(guilds.map(async (g) => {
            let leaderName = "Unknown";
            if (g.leaderId) {
                const leader = await ctx.db.get(g.leaderId);
                if (leader) leaderName = leader.name || "Unknown";
            }

            const memberCount = (await ctx.db
                .query("guildMembers")
                .withIndex("by_guild", q => q.eq("guildId", g._id))
                .collect()).length;

            return {
                ...g,
                leaderName,
                memberCount
            };
        }));
    }
});

export const disband = mutation({
    args: { guildId: v.id("guilds") },
    handler: async (ctx, args) => {
        await ensureAdmin(ctx);
        const guild = await ctx.db.get(args.guildId);
        if (!guild) throw new Error("Guild not found");

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

        return { success: true, message: "Guild disbanded by Admin Order" };
    }
});
