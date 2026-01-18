
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// --- HELPER: Verify Admin Status ---
const ensureAdmin = async (ctx: any) => {
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
};

// --- ADMIN QUERIES --- (Admin Panel v1.3)

export const getStats = query({
    args: {},
    handler: async (ctx) => {
        await ensureAdmin(ctx);

        const totalUsers = (await ctx.db.query("users").collect()).length;
        // In a real app we might paginate or aggregate better, but this is fine for start
        const totalGuilds = (await ctx.db.query("guilds").collect()).length;

        return {
            totalUsers,
            totalGuilds,
        };
    },
});

export const searchUsers = query({
    args: { query: v.string() },
    handler: async (ctx, args) => {
        await ensureAdmin(ctx);
        // Basic scan for now - ideal world uses search index
        const users = await ctx.db.query("users").collect();
        return users.filter((u: any) =>
            (u.name && u.name.toLowerCase().includes(args.query.toLowerCase())) ||
            (u.email && u.email.toLowerCase().includes(args.query.toLowerCase()))
        ).slice(0, 10);
    }
});

export const getUserGameState = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        await ensureAdmin(ctx);
        const user = await ctx.db.get(args.userId);
        if (!user) return null;

        // GameState table uses 'subject' (Clerk ID) as userId, not the full tokenIdentifier.
        // tokenIdentifier format is "issuer|subject"
        const subject = user.tokenIdentifier.split('|')[1];

        const gameState = await ctx.db
            .query("gameState")
            .withIndex("by_user", q => q.eq("userId", subject))
            .unique();

        return gameState ? gameState.state : null;
    }
});


// --- ADMIN MUTATIONS ---

export const grantGold = mutation({
    args: { userId: v.id("users"), amount: v.number() },
    handler: async (ctx, args) => {
        await ensureAdmin(ctx);
        // QUEUE LOGIC: Instead of modifying gameState, we push a pending reward.
        // The client will pick this up via subscription and merge it safely.
        await ctx.db.insert("pendingRewards", {
            userId: args.userId,
            type: 'gold',
            amount: args.amount,
            description: 'Admin Grant',
            createdAt: Date.now(),
        });
        return { success: true, message: "Gold queued for delivery" };
    }
});

export const grantGems = mutation({
    args: { userId: v.id("users"), amount: v.number() },
    handler: async (ctx, args) => {
        await ensureAdmin(ctx);
        await ctx.db.insert("pendingRewards", {
            userId: args.userId,
            type: 'gems',
            amount: args.amount,
            description: 'Admin Grant',
            createdAt: Date.now(),
        });
        return { success: true, message: "Gems queued for delivery" };
    }
});

export const grantItem = mutation({
    args: { userId: v.id("users"), itemId: v.string() },
    handler: async (ctx, args) => {
        await ensureAdmin(ctx);
        await ctx.db.insert("pendingRewards", {
            userId: args.userId,
            type: 'item',
            amount: 1,
            data: { itemId: args.itemId },
            description: 'Admin Grant',
            createdAt: Date.now(),
        });
        return { success: true, message: "Item queued for delivery" };
    }
});

// --- SYSTEM CONTROL ---

// Publicly readable system flags (Banner, Maintenance Status)
export const getSystemFlags = query({
    args: {},
    handler: async (ctx) => {
        const flags = await ctx.db.query("systemFlags").collect();
        // Convert array to object for easier consumption { key: value }
        const flagMap: Record<string, any> = {};
        flags.forEach(f => {
            flagMap[f.key] = f.value;
        });
        return flagMap;
    }
});

// Admin-only setter
export const setSystemFlag = mutation({
    args: { key: v.string(), value: v.any() },
    handler: async (ctx, args) => {
        await ensureAdmin(ctx);
        const existing = await ctx.db
            .query("systemFlags")
            .withIndex("by_key", q => q.eq("key", args.key))
            .unique();

        if (existing) {
            await ctx.db.patch(existing._id, { value: args.value, updatedAt: Date.now() });
        } else {
            await ctx.db.insert("systemFlags", { key: args.key, value: args.value, updatedAt: Date.now() });
        }
        return { success: true };
    }
});

export const banUser = mutation({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const adminUser = await ensureAdmin(ctx);

        if (adminUser._id === args.userId) {
            throw new Error("Cannot ban yourself. Please ask another admin to demote you if necessary.");
        }

        // For now, let's just strip their role or add a 'banned' flag
        // We'll update their role to 'banned'
        await ctx.db.patch(args.userId, { role: 'banned' });
        return { success: true, message: "User banned" };
    }
});

export const unbanUser = mutation({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        await ensureAdmin(ctx);
        // Reset role to 'user' 
        await ctx.db.patch(args.userId, { role: 'user' });
        return { success: true, message: "User unbanned" };
    }
});

// --- GUILD ADMINISTRATION ---



// --- BOOTSTRAP (Dev Only) ---
// DISABLED FOR SECURITY
// export const bootstrapAdmin = mutation({
//     args: { secretUserId: v.optional(v.id("users")) },
//     handler: async (ctx, args) => {
//         let user;

//         if (args.secretUserId) {
//              // Direct ID Method (Easier for Dashboard usage)
//              user = await ctx.db.get(args.secretUserId);
//         } else {
//              const identity = await ctx.auth.getUserIdentity();
//              if (!identity) throw new Error("Unauthorized. Either log in or pass 'secretUserId' arg.");

//              user = await ctx.db
//                  .query("users")
//                  .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
//                  .unique();
//         }

//         if (!user) throw new Error("User not found");

//         // ONLY allow if there are NO admins yet
//         // OR if the user is ALREADY an admin (idempotency for dev convenience)
//         if (user.role === 'admin') {
//              return { success: true, message: "You are already an Admin!" };
//         }

//         const existingAdmin = await ctx.db
//             .query("users")
//             .filter(q => q.eq(q.field("role"), "admin"))
//             .first();

//         if (existingAdmin) {
//              throw new Error("Admin already exists. Cannot bootstrap.");
//         }

//         await ctx.db.patch(user._id, { role: 'admin' });
//         return { success: true, message: "You are now the Super Admin." };
//     }
// });
