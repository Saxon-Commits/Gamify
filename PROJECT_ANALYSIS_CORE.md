## Phase 2: Core Infrastructure Findings

### 1. `convex/schema.ts`
*   **The "Save File" Pattern:** Line 30 `state: v.any()` confirms that the entire frontend state (potentially megabytes of JSON) is being dumped into a single database cell.
    *   *Risk:* Performance. Loading the game loads *everything*. Queries cannot filter inside this blob easily.
*   **Legacy Tables?** `pendingRewards` exists but `users.ts` handles payments directly. `dailyStats` seems unconnected to `gameState`.

### 2. `types.ts`
*   **God Interface:** The `GameState` interface (Line 182) mixes:
    *   **Data:** `tasks`, `inventory`.
    *   **Logic:** `completeTask`, `checkDailyReset`.
    *   **UI State:** `isSidePanelOpen`, `hoveredNode`.
    *   *Critique:* If we save this entire object to `convex`, we are saving "isSidePanelOpen" to the database. That's sloppy.

### 3. `convex/users.ts`
*   **Hardcoded IDs:** Stripe Price IDs are hardcoded in the file (Lines 5-11).
*   **Potential Bug:** Comments (Line 45) suggest a mismatch between `tokenIdentifier` (what the DB expects) and `subject` (what `pay.ts` might be sending).

### 4. `convex/auth.config.ts`
*   ✅ **Clean.** No issues.

---
**Next Step Recommendation:**
Investigate the **Payment Flow** and **State Sync** to confirm the bugs suspected above.
1.  `convex/pay.ts` (Check the ID mismatch).
2.  `convex/gameState.ts` (Check what actually gets saved—does it strip UI state?).
