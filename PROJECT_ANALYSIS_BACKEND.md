## Phase 2: Backend Functions Findings

### 1. `convex/admin.ts`
*   ✅ **Good Security:** Uses `ensureAdmin` helper extensively. logic looks solid.
*   *Note:* The `banUser` mutation just sets a role flag but doesn't seem to disconnect them immediately (minor issue).

### 2. `convex/vitality.ts`
*   **Duplicate Logic:** This file handles `logSteps` and calculates calories/activeMinutes.
*   *Conflict:* The Frontend *Also* likely calculates this. If the frontend sends steps, and backend calculates calories, we need to match them.
*   **Missing Features:** Logic for rewards (Lines 88, 102) is commented out with `// TODO`. **This is unfinished code.**

### 3. `convex/grindstone.ts`
*   ✅ **Good Anti-Cheat:** Implements server-side time verification (comparing `startTime` vs `now`).
*   **XP Handling:** It queues 'xp' rewards in `pendingRewards` (Lines 115), but we need to confirm `SyncManager` actually listens for 'xp' type rewards (it might only listen for 'gold'/'gems').

### 4. `convex/http.ts` (Stripe Webhook)
*   🚨 **CRITICAL SECURITY FLAW:** Line 24 (Signature Verification) is commented out:
    ```typescript
    // event = stripe.webhooks.constructEvent(...)
    event = JSON.parse(body);
    ```
    *   *Risk:* Any attacker can POST to `/stripe_webhook` with a fake payload and grant themselves "Lifetime" status or infinite Gems.

### 5. `convex/rewards.ts`
*   ✅ **Architecture Confirmed:** Confirms that the client is expected to claim rewards *after* syncing to local store.

### 6. `convex/guildChat.ts`
*   **Minor Duplication:** Re-implements logic for username derivation (`user.username ?? user.name`). Should be a helper function.
