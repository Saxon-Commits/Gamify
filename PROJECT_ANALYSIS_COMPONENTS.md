# Project Analysis: Components & Utils

## 🚨 Critical Findings

### 1. `components/MiniCharacterCard.tsx` (High Risk)
*   **Issue:** Creates a **Maintenance Trap**. It manually re-defines `AVATAR_CONFIGS`, `COMPANION_CONFIGS`, and `BACKDROP_CONFIGS`.
*   **Risk:** These are already defined in `pages/Character.tsx` (and partially in `utils/AvatarLayouts.ts`). Any change to an avatar's offset in the main Character screen will **NOT** reflect in the Mini Card, leading to visual bugs (chopped heads, bad alignment).
*   **Recommendation:** Centralize ALL avatar layout matching/offsets into `src/utils/AvatarLayouts.ts` and import it in both places.

### 2. `components/VitalityFlowChart.tsx` (Monolith)
*   **Size:** 31KB, 560+ lines.
*   **Structure:** It is not just a chart. It contains:
    *   `LogStepsModal` (Internal Component)
    *   `PhysicalDashboard` (Huge Internal Component)
    *   Complex "Gap Filling" logic for charts.
    *   Its own Mutations/Queries.
*   **Recommendation:** Break into `components/vitality/`.

### 3. Folder Redundancy (`project` vs `projects`)
*   `components/project/`: Contains the core logic (`ProjectOverview`, `ProjectKanban`, `ProjectEditor`).
*   `components/projects/`: Contains only `ProjectsCard.tsx` (The dashboard widget).
*   **Recommendation:** Move `ProjectsCard.tsx` to `components/dashboard/` or merge into `components/project/`.

---

## 🔍 Component Deep Dives

### `components/SyncManager.tsx`
*   **Status:** ✅ **Excellent.**
*   **Role:** Acts as the "Heartbeat" of the app. Handles:
    *   Initial Cloud Hydration.
    *   Auto-Save (Debounced).
    *   Pending Reward Injection (Gold/Gems).
*   **Note:** It assumes `cloudState` is the full state object.

### `components/MerchantCard.tsx` vs `MerchantNPC.tsx`
*   **MerchantCard:** The Sidebar UI. Contains an internal `MerchantVideo`.
*   **MerchantNPC:** A reusable visual component.
*   **Duplication:** `MerchantCard` re-implements the video logic instead of using `MerchantNPC`. Minor but annoying.

### `components/TutorialOverlay.tsx`
*   **Feature:** Handles the "First Run" experience.
*   **Identity:** This is the **primary place** where usernames are set initially.
*   **Routes:** Hardcoded targets (e.g. `/quests`). If routes change, this breaks.

### `components/MasteryUnlockModal.tsx`
*   **Status:** ✅ Clean.
*   **Features:** Handles the "Level Up / Unlock" celebration with Confetti and Audio.

---

## 📂 Source Utilities (`src/utils/`)

*   **`GameEconomy.ts`:** Defines rewards/costs.
*   **`CosmeticsData.ts`:** **MASSIVE** static data file for items. Safe but large.
*   **`EquipmentConfig.ts`:** Static offsets for accessories.
*   **`itemEffects.ts`:** Defines logic for consumables (`stim_pack`, etc).
*   **`aiQuestGenerator.ts`:** (Legacy?) Uses hardcoded arrays to "simulate" AI generation.

## ✅ Garbage Collection Status
*   No obvious "garbage" files found in `components/` root (e.g. `Temp.tsx`, `Old.tsx`).
*   The `project` vs `projects` confusion is the only structural "mess".
