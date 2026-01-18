# Master Code Audit & Cleanup Plan (COMPLETED)

> **Status:** ✅ ALL PHASES COMPLETE
> **Date:** January 18, 2026
> **Executor:** Antigravity

This audit successfully refactored the codebase, extracting monoliths, cleaning dead code, and securing webhooks.

---

## 🏁 Executive Summary of Changes
1.  **Security:** Enabled Stripe Webhook Signature Verification (`convex/http.ts`).
2.  **Architecture:**
    *   **Shop Decomposed:** `pages/Shop.tsx` (830 lines) -> `components/shop/` (Modular).
    *   **Avatar Config:** Centralized in `src/utils/AvatarLayouts.ts`.
3.  **Cleanup:**
    *   **Vitality Deprecated:** Moved active development feature to `graveyard 💀/`.
    *   **Dead Code:** Deleted `aiQuestGenerator.ts`.
    *   **Linting:** Fixed build errors in `QuestLog.tsx` and `convex/http.ts`.

---

## 2. 🚨 Critical Issues (Priority 0)

| ID | Location | Severity | Issue | Resolution |
| :--- | :--- | :--- | :--- | :--- |
| **C-01** | `convex/http.ts` | **CRITICAL** | **Stripe Webhook Verification Disabled.** Attackers can fake payments to get infinite gems/subscriptions. | ✅ **FIXED:** Verification enabled. |
| **C-02** | `components/MiniCharacterCard.tsx` | **HIGH** | **Maintenance Trap.** Re-defines avatar offsets manually. Disconnected from `Character.tsx`. | ✅ **FIXED:** Centralized in `src/utils/AvatarLayouts.ts`. |
| **C-03** | `pages/Shop.tsx` | **HIGH** | **Frontend Monolith (830 lines).** Mixes UI, Payment logic, Cart state, and Video previews. | ✅ **FIXED:** Split into `components/shop/`. |
| **C-04** | `convex/guilds.ts` | **MED** | **Backend God Object.** Handles Invites, XP, Projects, and Chat. Fragile permission checks. | ⏸️ **DEFERRED:** Phase 3 (Backend Hardening) deferred. |
| **C-05** | `components/VitalityFlowChart.tsx` | **MED** | **Frontend Monolith (31KB).** Contains entire Physical Dashboard + Modals. | ✅ **FIXED:** Moved to `graveyard 💀/`. |

---

## 3. Structural Changes

### � Shop Refactor (`components/shop/`)
*   `ShopCart.tsx`: Handles cart drawer and checkout logic.
*   `ShopItemCard.tsx`: Standard card for Items, Avatars, Themes.
*   `CurrencyPackCard.tsx`: Gem bundles.
*   `ShopSection.tsx`: Reusable container.
*   `AvatarUnlockModal.tsx`: Visual unlock effect.
*   `ShopItemPreviewModal.tsx`: Item details.

### 💀 Graveyard (`graveyard 💀/`)
*   `VitalityFlowChart.tsx`: Deprecated as per user request.
*   `vitality.ts`: Backend logic for deprecated feature.

---

## 4. Feature Audit Status

| Feature | Status | Action Taken |
| :--- | :--- | :--- |
| **Guild System** | ✅ Robust | Kept as is. |
| **Vitality (Health)** | 💀 Deprecated | Moved to Graveyard. |
| **Shop / Economy** | ✅ Refactored | Decomposed into modular components. |
| **Skill Tree** | ✅ Excellent | Kept as is. |
| **Rich Text Editor** | ✅ Good | Kept as is. |
| **Admin Panel** | ✅ Robust | Kept as is. |
| **AI Quest Generator** | 💀 Deleted | `aiQuestGenerator.ts` removed. |
| **Potion/Item Effects** | 💀 Legacy | Pending Review. |
| **Cloud Sync** | ✅ Solved | Kept as is. |

---

## 5. 📝 Deferred / Backlog (Outstanding Analysis Findings)

The following items were identified in the `PROJECT_ANALYSIS` phase but were **not** addressed in Phases 1-3. They are captured here to ensure nothing is lost.

### 🔴 High Priority (Technical Debt)
1.  **Backend God Object (`C-04`):** `convex/guilds.ts` handles Invites, XP, Projects, and Chat. It remains a monolith and should be split into `guildProjects.ts`, `guildMembers.ts`, etc.
2.  **State Management:** `useGameStore.ts` stores **UI State** (e.g., `isSidePanelOpen`) alongside **Game Data**. This causes excessive re-renders. **Recommendation:** Split into `useUIStore` and `useGameStore`.
3.  **Database Pattern:** The "Save File" pattern (`state: v.any()`) dumps the entire frontend state into a single DB cell. This is efficient for prototyping but bad for query performance and data migration.

### 🟠 Medium Priority (Cleanup)
4.  **Folder Confusion:** `components/project/` (Core Logic) exists alongside `components/projects/` (Dashboard Widget). **Action:** Move the widget to `components/dashboard/` and delete the `projects` folder.
5.  **Hardcoded IDs:** `convex/users.ts` contains hardcoded Stripe Price IDs. These should be in Environment Variables or a Config file.
6.  **Duplication:** `components/MerchantCard.tsx` re-implements video logic found in `MerchantNPC.tsx`.
7.  **UX Issue:** `pages/Guild.tsx` renders Project View in a "Full Page" mode that can override other tabs confusingly.

### 🟡 Low Priority (Minor)
8.  **Legacy Code:** `src/utils/itemEffects.ts` appears largely unused or half-baked.
9.  **Inline Components:** `pages/Journal.tsx` and `pages/Settings.tsx` contain significant inline component definitions that could be extracted.
10. **Hardcoded Strings:** `pages/LandingPage.tsx` and `pages/Dashboard.tsx` content is hardcoded.

---

## 6. Next Steps Recommendation
1.  **Immediate:** Start **Phase 4 (Backend Hardening)** to address the `convex/guilds.ts` monolith.
2.  **Secondary:** Address the **Folder Confusion** to clean up the file tree.


