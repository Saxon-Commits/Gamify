import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    // Users Table: Stores user identity linked to Auth provider (Clerk)
    users: defineTable({
        tokenIdentifier: v.string(), // Extracted from Clerk JWT
        name: v.optional(v.string()),
        username: v.optional(v.string()), // Unique handle (@username)
        email: v.optional(v.string()),
        pictureUrl: v.optional(v.string()),
        // Monetization
        subscription: v.optional(v.string()), // 'free', 'pro', 'lifetime'
        credits: v.optional(v.number()), // 'gems' (virtual currency - keeping generic name 'credits' or explicit 'gems'?) -> Let's use 'gems' as per plan but verify if 'credits' is better. Plan said 'gems'.
        gems: v.optional(v.number()),
        // RBAC
        role: v.optional(v.string()), // 'admin' | 'user'
    })
        .index("by_token", ["tokenIdentifier"])
        .index("by_username", ["username"]),

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

    // ============================================
    // GUILD SYSTEM TABLES
    // ============================================

    // Guilds table - Core guild entity
    guilds: defineTable({
        name: v.string(),
        description: v.optional(v.string()),
        bannerId: v.optional(v.string()), // cosmetic banner ID
        leaderId: v.id("users"),
        level: v.number(), // guild level (starts at 1)
        xp: v.number(), // collective XP earned
        treasury: v.object({
            gold: v.number(),
            gems: v.number(),
        }),
        settings: v.object({
            isPublic: v.boolean(), // can anyone join?
            joinRequiresApproval: v.boolean(), // needs officer approval?
        }),
        createdAt: v.number(),
    }).index("by_leader", ["leaderId"]),

    // Guild members - tracks who is in which guild
    guildMembers: defineTable({
        guildId: v.id("guilds"),
        userId: v.id("users"),
        role: v.string(), // 'leader' | 'officer' | 'member'
        contribution: v.object({
            xp: v.number(),
            gold: v.number(),
            tasks: v.number(),
        }),
        joinedAt: v.number(),
    })
        .index("by_guild", ["guildId"])
        .index("by_user", ["userId"]),

    // Guild activity feed - tracks events for the feed
    guildActivities: defineTable({
        guildId: v.id("guilds"),
        userId: v.id("users"),
        type: v.string(), // 'quest_complete', 'level_up', 'joined', 'left', 'achievement', 'project_contribution'
        data: v.any(), // flexible payload for each event type
        timestamp: v.number(),
    }).index("by_guild", ["guildId"]),

    // Guild invites - for invite links and direct invites
    guildInvites: defineTable({
        guildId: v.id("guilds"),
        invitedUserId: v.optional(v.id("users")), // for direct invites
        inviteCode: v.optional(v.string()), // for link invites
        status: v.string(), // 'pending', 'accepted', 'declined', 'expired'
        createdAt: v.number(),
        expiresAt: v.optional(v.number()),
    })
        .index("by_guild", ["guildId"])
        .index("by_user", ["invitedUserId"])
        .index("by_code", ["inviteCode"]),

    // Guild shared projects - collaborative goals
    guildProjects: defineTable({
        guildId: v.id("guilds"),
        title: v.string(),
        description: v.optional(v.string()),
        status: v.string(), // 'active', 'completed', 'archived'
        targetTasks: v.number(), // goal count
        completedTasks: v.number(), // current progress
        contributors: v.array(v.object({
            userId: v.id("users"),
            tasks: v.number(),
        })),
        rewards: v.object({
            xp: v.number(),
            gold: v.number(),
            gems: v.optional(v.number()),
        }),
        // New Fields for Enhanced Projects
        storedTasks: v.optional(v.array(v.object({
            id: v.string(),
            name: v.string(),
            description: v.optional(v.string()),
            xpReward: v.number(),
            goldReward: v.number(),
            difficulty: v.string(),
        }))),
        // Contest / Submission Features
        allowSubmissions: v.optional(v.boolean()),
        submissionDeadline: v.optional(v.number()), // Timestamp
        consolidateRewards: v.optional(v.boolean()), // If 2nd/3rd not awarded, give all to 1st
        rankedRewards: v.optional(v.object({
            firstPlace: v.object({ gold: v.number(), xp: v.number(), gems: v.optional(v.number()) }),
            secondPlace: v.optional(v.object({ gold: v.number(), xp: v.number(), gems: v.optional(v.number()) })),
            thirdPlace: v.optional(v.object({ gold: v.number(), xp: v.number(), gems: v.optional(v.number()) })),
        })),
        // Escrow & Winners
        totalEscrowed: v.optional(v.object({
            gold: v.number(),
            gems: v.number(),
        })),
        winners: v.optional(v.object({
            firstPlaceUserId: v.optional(v.id("users")),
            secondPlaceUserId: v.optional(v.id("users")),
            thirdPlaceUserId: v.optional(v.id("users")),
        })),
        joinedUserIds: v.optional(v.array(v.id("users"))),
        createdAt: v.number(),
        completedAt: v.optional(v.number()),
        // Editor Tracking
        lastEditedByName: v.optional(v.string()),
        lastEditedAt: v.optional(v.number()),
        creatorId: v.optional(v.id("users")),
    }).index("by_guild", ["guildId"]),

    // Guild messages - simple chat/announcements
    guildMessages: defineTable({
        guildId: v.id("guilds"),
        userId: v.id("users"),
        content: v.string(),
        isPinned: v.boolean(), // true for announcements
        likes: v.optional(v.array(v.id("users"))), // Array of user IDs who liked the message
        timestamp: v.number(),
    }).index("by_guild_time", ["guildId", "timestamp"]),

    // Vitality Stats - Daily tracking
    dailyStats: defineTable({
        userId: v.id("users"),
        date: v.string(), // YYYY-MM-DD
        steps: v.number(),
        calories: v.optional(v.number()),
        activeMinutes: v.optional(v.number()),
        goalMet: v.optional(v.boolean()),
    })
        .index("by_user_date", ["userId", "date"]),
    // Project Documents (Command Center)
    projectDocuments: defineTable({
        projectId: v.string(), // e.g. 'p-titan-1'
        userId: v.id("users"),
        title: v.string(),
        content: v.string(), // HTML or Markdown
        type: v.string(), // 'doc', 'note', 'kanban_state' etc
        isPrivate: v.optional(v.boolean()),
        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index("by_project", ["projectId"])
        .index("by_user", ["userId"]),

    // Guild Bounties - Tasks created by leaders for members
    guildBounties: defineTable({
        guildId: v.id("guilds"),
        title: v.string(),
        description: v.string(),
        reward: v.object({
            gold: v.number(),
            gems: v.optional(v.number()),
        }),
        createdBy: v.id("users"), // Leader/Officer
        status: v.string(), // 'OPEN', 'CLAIMED', 'SUBMITTED', 'COMPLETED'
        claimedBy: v.optional(v.id("users")),
        submittedAt: v.optional(v.number()),
        proof: v.optional(v.string()), // Text/Link proof
        createdAt: v.number(),
    })
        .index("by_guild", ["guildId"])
        .index("by_claimant", ["claimedBy"]),

    // System Flags - Global Config (Maintenance, Banner, etc.)
    // Key is the 'flag' name (e.g. 'maintenance_mode')
    systemFlags: defineTable({
        key: v.string(),
        value: v.any(),
        updatedAt: v.number(),
    }).index("by_key", ["key"]),

    // Pending Rewards - For async injection (Admin grants, off-chain logic, etc.)
    pendingRewards: defineTable({
        userId: v.id("users"),
        type: v.string(), // 'gold', 'gems', 'item'
        amount: v.number(),
        data: v.optional(v.any()), // item details if needed
        description: v.optional(v.string()), // 'Admin Grant', 'Weekly Bonus'
        createdAt: v.number(),
    }).index("by_user", ["userId"]),

    // Secure Grindstone Sessions
    focusSessions: defineTable({
        userId: v.id("users"),
        startTime: v.number(),
        durationMinutes: v.number(),
        status: v.string(), // 'active', 'completed', 'abandoned', 'cheated'
        cheated: v.optional(v.boolean()),
    }).index("by_user_status", ["userId", "status"]),
});
