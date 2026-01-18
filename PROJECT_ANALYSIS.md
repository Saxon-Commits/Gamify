# Project Analysis Master Checklist
**Status:** In Progress

We will analyze every file in the codebase.

## 🔴 Critical / Core (Priority 1)
| File | Status | Notes |
| :--- | :--- | :--- |
| `convex/schema.ts` | 🟨 Analyzed | `gameState` uses `v.any()` (bloat risk). `guildProjects` heavily duplicated. |
| `convex/auth.config.ts` | ✅ Analyzed | Standard Clerk config. |
| `convex/users.ts` | 🟨 Analyzed | Hardcoded Stripe Price IDs. Potential `pay.ts` mismatch bug. |
| `convex/gameState.ts` | 🟨 Analyzed | **Core Loop.** Saves Raw State (including UI flags). Uses `subject` vs `tokenIdentifier`. |
| `store/useGameStore.ts` | 🟨 Analyzed | **Critical**: Contains hardcoded logic & excessive state. |
| `App.tsx` | ⬜ Pending | Root component. |
| `types.ts` | 🟨 Analyzed | `GameState` interface mixes Data, Logic, and UI state. |

## 🟣 Backend Functions (Priority 2)
| File | Status | Notes |
| :--- | :--- | :--- |
| `convex/guilds.ts` | 🟨 Analyzed | **Critical**: Monolith. Security issues found. |
| `convex/admin.ts` | ✅ Analyzed | Logic sound. Helper `ensureAdmin` is good. |
| `convex/vitality.ts` | 🟨 Analyzed | Partial duplicate of `useGameStore`. Logic for "Steps" exists here AND frontend. |
| `convex/grindstone.ts` | ✅ Analyzed | Secure anti-cheat logic for Focus Timer. Good. |
| `convex/documents.ts` | ✅ Analyzed | Standard CRUD. Global `projectId` but filtered by ownership/privacy. |
| `convex/guildChat.ts` | 🟨 Analyzed | Duplicate username logic. |
| `convex/pay.ts` | ✅ Analyzed | Correctly passes `tokenIdentifier`. |
| `convex/rewards.ts` | ✅ Analyzed | Confirms `SyncManager` pattern. Logic safe. |
| `convex/http.ts` | 🟥 **SECURE** | **CRITICAL**: Stripe Signature Verification is commented out. |
| `convex/storeUser.ts` | ✅ Analyzed | Consistent `tokenIdentifier` usage. |
| `convex/textSafety.ts` | 🟨 Analyzed | **Duplicate** of src/utils. |

## 🔵 Frontend Pages (Priority 3)
| File | Status | Notes |
| :--- | :--- | :--- |
| `pages/QuestLog.tsx` | 🟨 Analyzed | **Monolith**. inline components. |
| `pages/Dashboard.tsx` | 🟨 Analyzed | UI-heavy. Duplicates reward display logic. |
| `pages/Character.tsx` | 🟨 Analyzed | **Core Page.** Heavy use of sub-components (`AttributesPanel`, `LoadoutPanel`). Logic seems split between Page and Components. |
| `pages/Shop.tsx` | 🟥 **CRITICAL** | **Monolith.** 830+ lines. Mixing payment logic (Stripe), UI state, and massive hardcoded lists. Needs refactor. |
| `pages/Guild.tsx` | 🟨 Analyzed | Complex. Delegates to 12+ sub-components. `GuildProjectsView` needs deep dive. |
| `pages/Journal.tsx` | 🟨 Analyzed | Self-contained. Uses specific `RichTextEditor`. Includes `QuickLogWidget` |
| `pages/SkillTree.tsx` | ✅ Analyzed | Clean implementation using ReactFlow. Logic delegated to `useGameStore`. |
| `pages/Settings.tsx` | 🟨 Analyzed | Functional. Covers profile, theme, audio, cloud sync (beta). `ProfileSettings` inline component. |
| `pages/LandingPage.tsx` | 🟨 Analyzed | **Hardcoded Content**. Features, pricing, texts are all hardcoded. Clean UI. |
| `pages/Admin.tsx` | 🟨 Analyzed | **Robust.** Handles user management, economy injection, bans, system banners. Good use of `useMutation`. |
| `pages/InvitePage.tsx` | ⬜ Pending | |
| `pages/PrivacyPolicy.tsx` | ⬜ Pending | |
| `pages/TermsOfService.tsx` | ⬜ Pending | |
| `App.tsx` | 🟨 Analyzed | **Route Controller.** Handles Auth (`Clerk`), PostHog, Theme Sync, and Routing. Clean. |
| `components/Layout.tsx` | 🟨 Analyzed | Complex Navigation. Handles Mobile/Desktop nav, resources display. |
| `components/SyncManager.tsx` | ✅ Analyzed | **Core Heartbeat**. Handles Cloud Save/Load and Reward Injection. Clean. |
| `components/VitalityFlowChart.tsx` | 🟥 Monolith | **Huge (31kb).** Contains `PhysicalDashboard` and `LogStepsModal`. Needs split. |
| `components/MerchantCard.tsx` | 🟨 Analyzed | Sidebar UI. Duplicates video logic from `MerchantNPC`. |
| `components/MiniCharacterCard.tsx` | 🟥 RISK | **Duplicated Configs.** Re-defines avatars/backdrop offsets from `Character.tsx`. |
| `components/TutorialOverlay.tsx` | 🟨 Analyzed | Handles first-run and Username creation. Hardcoded routes. |
| `src/utils/CosmeticsData.ts` | 🟨 Analyzed | Massive static data file. |
| `components/project` vs `projects` | 🟧 Messy | Confusing naming. `projects` only contains `ProjectsCard`. |
| `components/` (General) | ⬜ Pending | Checking for garbage/orphaned components next. |

## 🟢 Components (Priority 4)
**Root Components:**
- [x] `Layout.tsx` (Analyzed)
- [x] `MerchantCard.tsx` (Analyzed)
- [x] `MiniCharacterCard.tsx` (Analyzed)
- [x] `VitalityFlowChart.tsx` (Analyzed)
- [x] `SyncManager.tsx` (Analyzed)
- [x] `TutorialOverlay.tsx` (Analyzed)
- [ ] `ProjectDetailView.tsx`
- [ ] `RichTextEditor.tsx`
- [ ] `DevControls.tsx` (Debug?)

**Sub-Directories:**
- [ ] `components/guild/*` (15 files)
- [ ] `components/character/*` (8 files)
- [ ] `components/vitality/VitalityDetailPanel.tsx` (102KB!! Huge)
- [ ] `components/project/*` vs `components/projects/*` (Redundant?)

## 🟡 Utilities (Priority 5)
- [ ] `src/utils/gameLogic.ts` (Analyzed)
- [ ] `src/utils/GameEconomy.ts` (Analyzed)
- [ ] `src/utils/itemEffects.ts` (Analyzed)
- [ ] `src/utils/aiQuestGenerator.ts` (Analyzed)
- [ ] `src/utils/CosmeticsData.ts` (Analyzed)
- [ ] `src/utils/AvatarLayouts.ts` (Analyzed)
- [ ] `src/utils/SkillTreeUtils.ts` (Analyzed)

---
**Guidance:** Please select a file or group to analyze next.
