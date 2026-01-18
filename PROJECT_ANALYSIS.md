# Project Deep Dive Analysis
**Date:** 2026-01-18
**Status:** In Progress

## 1. File Inventory & Stats
| Directory | Files | Key Issues |
| :--- | :--- | :--- |
| `convex/` | 17 | `guilds.ts` is a monolith. Duplicate `textSafety.ts`. |
| `store/` | 3 | `useGameStore.ts` contains hardcoded business logic & content. |
| `pages/` | 13 | `QuestLog.tsx` is a monolith. |
| `components/` | 17 (Root) | Cluttered root. `MerchantCard` is unused? |
| `src/utils/` | 10 | `itemEffects.ts` contains dead "Potion" logic. |

---

## 2. Component Analysis

### A. Backend (`convex/`)
*   **`guilds.ts`**: Critical Monolith. Security Exploit in `addGuildXp`. Copy-pasted economy logic.
*   **`textSafety.ts`**: Duplicate file. One in `convex/`, one in `src/utils/`.

### B. State (`store/`)
*   **`useGameStore.ts`**: Hardcoded content (Quests, Projects). Logic for specific skills (Greed, Haste) mixed with storage.

### C. Frontend (`pages/` & `components/`)
*   **`QuestLog.tsx`**: 1400 lines. Internal definitions of components. Hardcoded "Foundations" logic.
*   **`components/projects`**: Contains one file `ProjectsCard.tsx`.
*   **`components/project`**: Contains 5 files. **Redundant Folder.**

### D. Utils (`src/utils/`)
*   **`itemEffects.ts`**: Contains logic for `stim_pack`, `ubereats_token`, `netflix_pass`. Likely the "Potion Logic" user wants to kill.
*   **`CosmeticsData.ts`**: Massive hardcoded list of items. Includes `NEW_WEAPONS` (empty/commented out) and confusing list of "Themes".
*   **`aiQuestGenerator.ts`**: Uses hardcoded arrays (`TITLES`, `DESCRIPTIONS`) instead of real AI. Potential dead code.

---

## 3. Structural Findings
1.  **Duplicate Folders**: `components/project` vs `components/projects`.
2.  **Duplicate Logic**: `textSafety.ts` exists in two places.
3.  **Root Clutter**: 17 components sitting in the root of `components/` (e.g. `VitalityFlowChart.tsx`).

