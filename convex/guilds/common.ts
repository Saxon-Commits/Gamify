import { v } from "convex/values";
import { Id } from "../_generated/dataModel";

// Helper to get current user's internal ID
// Based on current 'users' table structure which keys by tokenIdentifier
export async function getCurrentUserId(ctx: any): Promise<Id<"users"> | null> {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
        .query("users")
        .withIndex("by_token", (q: any) => q.eq("tokenIdentifier", identity.tokenIdentifier))
        .unique();

    if (!user) return null;
    return user._id;
}

// Helper to check if user has permission (officer or leader)
export async function hasPermission(ctx: any, guildId: Id<"guilds">, userId: Id<"users">, requiredRole: 'leader' | 'officer' | 'member' = 'officer'): Promise<boolean> {
    const guild = await ctx.db.get(guildId);
    if (!guild) return false;

    if (guild.leaderId === userId) return true;
    if (requiredRole === 'leader') return false; // Only leader passed

    const member = await ctx.db
        .query("guildMembers")
        .withIndex("by_user", (q: any) => q.eq("userId", userId))
        .filter((q: any) => q.eq(q.field("guildId"), guildId))
        .first();

    if (!member) return false;
    if (member.role === 'admin') return true; // 'admin' role in member table (if exists) or officer??
    // Schema says role is "member" | "officer"
    if (member.role === 'officer') return true;
    if (requiredRole === 'officer') return false;

    return true; // member role satisfies 'member'
}

// Helper to log guild activity
export async function logGuildActivity(ctx: any, guildId: Id<"guilds">, userId: Id<"users">, type: string, data: any) {
    await ctx.db.insert("guildActivities", {
        guildId,
        userId,
        type,
        data,
        createdAt: Date.now(),
    });
}
export const MAX_GUILD_MEMBERS = 50;
