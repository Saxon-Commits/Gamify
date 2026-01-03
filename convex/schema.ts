import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    // Users Table: Stores user identity linked to Auth provider (Clerk)
    users: defineTable({
        tokenIdentifier: v.string(), // Extracted from Clerk JWT
        name: v.optional(v.string()),
        email: v.optional(v.string()),
        pictureUrl: v.optional(v.string()),
    }).index("by_token", ["tokenIdentifier"]),

    // GameState Table: Stores the full monolithic state for the user
    // GameState Table: Stores the full monolithic state for the user
    gameState: defineTable({
        userId: v.string(), // Reference to our users table (Clerk ID)

        // We store the massive zustand state as a JSON object for flexibility.
        // In a production app, we might normalize this, but for a "Save File", this is efficient.
        // syncing logic: On change, frontend sends the new state.
        state: v.any(), // "any" allows us to store the complex State object without rigid schema validation issues initially
        lastSyncedAt: v.number(), // Timestamp
    }).index("by_user", ["userId"]),

    // Journal Entries: We keep these separate so we can query/filter them efficiently without loading the whole game state
    journalEntries: defineTable({
        userId: v.id("users"),
        title: v.string(),
        content: v.string(), // HTML/Rich Text content
        date: v.string(), // ISO String
        tags: v.array(v.string()),
        folder: v.string(), // 'Journal' | 'Mind Wipes' etc.
    })
        .index("by_user", ["userId"])
        .index("by_user_date", ["userId", "date"]),
});
