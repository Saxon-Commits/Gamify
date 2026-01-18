# Master Handoff Document: Gamify Development Session
**Date:** 2026-01-18
**Project:** Gamify (Life RPG)
**User:** Saxon

## 1. Executive Summary
This document summarizes a massive development session focused on **Admin Infrastructure**, **Game Economy/XP Systems**, **Developer Tools**, and **Critical Stability Fixes**.

**Major Achievements:**
*   **XP System Overhaul:** Implemented a new "Hybrid Tiered" XP curve system.
*   **Admin Panel:** Built a secure, comprehensive Admin Dashboard (`/admin`) with RBAC.
*   **Global Dev Tools:** Refactored developer controls into a global, admin-only overlay.
*   **User Management:** Added Ban/Unban, Inventory Inspection, and Resource Injection tools.
*   **System Controls:** Added Maintenance Mode and Global Announcements.
*   **Guild Features:** Implemented Guild Bounty Board and Project Wizards.
*   **Security:** Added Server-Side Anti-Cheat for Focus Sessions.
*   **Stability:** Resolved critical crashes in the Admin Panel and global layout.

---

## 2. Core Systems Implemented

### A. XP & Progression System (`gameLogic.ts`)
*   **Logic:** Implemented a piecewise function for XP leveling (Levels 1-10: Flat, 11-30: Linear, 31-60: Exponential, 60+: Soft Cap).
*   **Functions:** `calculateLevelFromXP`, `calculateXPForLevel`, `getXPProgress`.
*   **Integration:** Wired into `useGameStore` to trigger level-ups and track progress.

### B. Role-Based Access Control (RBAC)
*   **Schema:** Added `role: "admin" | "user"` to the `users` table in Convex.
*   **Security:** Created `convex/admin.ts` (and `convex/guilds.ts` admin extensions) to gate sensitive server functions.
*   **Middleware:** Created `AdminRoute` component to protect Frontend routes.
*   **Script:** Added `scripts/set_admin.ts` to manually promote users via CLI.

### C. Global Developer Tools
*   **Architecture:** Moved from scattered buttons to a centralized **Global Overlay** (`DevControls.tsx`).
*   **State Management:** Created `useDevStore` (Zustand) to manage dev UI state independent of game state.
*   **Features:**
    *   **"Time God":** Force Day Reset, Time Travel (+1 Day).
    *   **Economy:** "+100k Gold", "Unlock All Items".
    *   **Visual Editor:** Live tweak scale/position of Avatars, Companions, and Backdrops.
*   **Safety:** The overlay is ONLY visible to users with `role: 'admin'`.

### D. System Control Flags
*   **Schema:** Added `system_flags` table.
*   **Features:**
    *   **Maintenance Mode:** Locks out non-admin users with a "Under Maintenance" screen.
    *   **Global Banner:** Displays critical announcements at the top of the app layout.

### E. Analytics & Telemetry
*   **Integration:** Integrated **PostHog** for event tracking and user analytics.
*   **Identification:** Linked Clerk User IDs to PostHog profiles for robust cross-session tracking.

---

## 3. Admin Panel (`pages/Admin.tsx`)

A fully-featured dashboard offering five major sections:
1.  **Overview:** Stats (Total Users, Guilds, Active Sessions).
2.  **User Management:**
    *   Search/Filter Users.
    *   **Inspector:** View user inventory, currency, and equipped items.
    *   **Actions:** Ban/Unban User, Grant Gold/Gems/Items (Santa Console).
    *   **Robustness:** Implemented a **Reward Queue** (`pendingRewards` table) to ensure manual grants are successfully claimed even if the user is offline.
3.  **Guild Inspector:**
    *   View all guilds, member counts, and leaders.
    *   **Action:** Force Disband Guild (nukes all associated data).
4.  **System Control:** Toggle Maintenance Mode, Set Global Banner.
5.  **Analytics:** (Integrated via PostHog).

---

## 4. Guild & Social Features

### A. Guild Bounty Board
*   **Schema:** `guildBounties` table.
*   **Flow:** Officers create bounties (funds escrowed from Treasury) -> Members claim -> Officers approve (Funds released).
*   **UI:** Kanban-style board for Available/Active/Review/Completed.

### B. Project Management
*   **Wizard:** Multi-step wizard for creating Guild Projects.
*   **Logic:** Support for "Ranked Rewards" (1st/2nd/3rd place payouts).

---

## 5. Security & Anti-Cheat
*   **Focus Sessions:** Migrated from trusted-client to **Server-Authoritative Timing**.
    *   **Schema:** `focusSessions` table tracks start/end times.
    *   **Validation:** Server verifies duration upon completion to prevent client-side clock manipulation.

---

## 6. Critical Bug Fixes (The "Crash Saga")

We encountered and resolved two major instability issues:

### 🔴 Issue 1: The "Global White Screen"
*   **Cause:** A **React Hook Order Violation** in `DevControls.tsx`. The component returned `null` conditionally *before* calling `useDevStore`.
*   **Fix:** Moved all hooks to the top level.
*   **Lesson:** Never put hooks after an `if (loading) return null;`.

### 🔴 Issue 2: Admin Panel "Function Not Found"
*   **Cause:** The Convex backend silent-failed to build `convex/guilds.ts`.
    *   The file `convex/textSafety.ts` utilized `require("bad-words")`, which is not fully compatible with the Convex runtime environment or bundler in its current configuration.
    *   This caused the compilation of `convex/guilds.ts` (which imports `textSafety.ts`) to fail silently.
    *   As a result, the *new* admin functions (`getAllGuildsAdmin`, `disbandGuildByAdmin`) were never actually deployed to the server, leading to the 404-like error on the client.
*   **Fix:**
    1.  **Disabled Profanity Filter:** Commented out `bad-words` in `textSafety.ts`.
    2.  **Refactor:** Moved reliable Admin functions into `convex/guilds.ts`.
    3.  **Frontend:** Updated `Admin.tsx` to key off `api.guilds`.

---

## 7. Technical Debt & TODOs

### ⚠️ Profanity Filter is DISABLED
In `convex/textSafety.ts`, the functions `cleanText` and `hasProfanity` are hardcoded to pass-through.
*   **Task:** Restore this functionality using a Convex-compatible method or library.

### ⚠️ Deferred Tasks
*   **Image NSFW Detection:** Deferred because there are no user image uploads yet.
*   **Streak Counter UI:** Needs to be added to the Grindstone view.

## 8. How to Continue
1.  **Start:** Run `npx convex dev` and `npm run dev`.
2.  **Verify:** Check the **Admin Panel** > **Guild Inspector**.
3.  **Next Objective:** Pick up the **"UI: Streak Counter"** task or verify **"Strategic Command"** (Kanban unlock).
