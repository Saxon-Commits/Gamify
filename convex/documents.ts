import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Get all documents for a specific project
export const getProjectDocuments = query({
    args: { projectId: v.string() },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        const user = await ctx.db
            .query("users")
            .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
            .unique();

        if (!user) throw new Error("User not found");

        const docs = await ctx.db
            .query("projectDocuments")
            .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
            .collect();

        // Filter by user ownership to be safe, though projectId is usually user-specific in this app?
        // Actually, projects are global IDs currently (col-todo), but data is user-scoped?
        // In this app, tasks are stored in a monolith JSON blob, but documents are now a separate table.
        // We MUST verify userId matches to prevent seeing other users' docs for the same project ID.
        // Filter: Users see their own private docs + all public (archived) docs
        return docs.filter(doc => doc.userId === user._id || doc.isPrivate === false).sort((a, b) => b.updatedAt - a.updatedAt);
    },
});

export const createDocument = mutation({
    args: {
        projectId: v.string(),
        title: v.string(),
        content: v.string(),
        type: v.string(), // 'doc', 'note'
        isPrivate: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        const user = await ctx.db
            .query("users")
            .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
            .unique();

        if (!user) throw new Error("User not found");

        const docId = await ctx.db.insert("projectDocuments", {
            projectId: args.projectId,
            userId: user._id,
            title: args.title,
            content: args.content,
            type: args.type,
            isPrivate: args.isPrivate || false,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        });

        return docId;
    },
});

export const updateDocument = mutation({
    args: {
        id: v.id("projectDocuments"),
        title: v.optional(v.string()),
        content: v.optional(v.string()),
        isPrivate: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        const { id, ...updates } = args;

        await ctx.db.patch(id, {
            ...updates,
            updatedAt: Date.now(),
        });
    },
});

export const deleteDocument = mutation({
    args: { id: v.id("projectDocuments") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        await ctx.db.delete(args.id);
    },
});
