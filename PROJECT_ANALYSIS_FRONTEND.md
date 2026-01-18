## Phase 3: Frontend Pages Findings (Batch 1)

### 1. `pages/Shop.tsx` (Critical Monolith)
*   **Size:** 830+ lines long.
*   **Responsibilities:**
    *   Renders Merchant Card (Sidebar).
    *   Renders "Avatars", "Companions", "Equipment", "Gems", "Themes" (Grid Layouts).
    *   Handles **Stripe Payments** directly (Line 32).
    *   Handles **Cart Management** (Line 650).
    *   Handles **Avatar Preview/Video** (Line 752).
*   **Critique:** This is a classic "God Component". It needs to be broken down into:
    *   `ShopAvailableItems.tsx`
    *   `ShopCart.tsx`
    *   `ShopItemPreview.tsx`
    *   `ShopCurrency.tsx`

### 2. `pages/Character.tsx`
*   **Structure:** much cleaner than Shop. It delegates heavy lifting to:
    *   `AttributesPanel.tsx`
    *   `LoadoutPanel.tsx`
    *   `CharacterDisplayCard.tsx`
*   **Observation:** The `useEffect` on Line 22 syncs `activeAvatarId` to `selectedAvatarPath`. This implies a visual disconnect where the user might "select" something visually without "equipping" it.

### 3. `pages/Dashboard.tsx`
*   **Duplication:** Renders "Daily Tasks Widget" (Line 16) which looks very similar to `QuestCard.tsx` logic.
*   **Hardcoded Limits:** Slices tasks to 6 and projects to 3 (Lines 10-11).

## Phase 3: Frontend Pages Findings (Batch 2)

### 4. `pages/Guild.tsx`
*   **Structure:** Acts as a Router/Controller for:
    *   `GuildProjectsView` (Project Management)
    *   `GuildBountyBoard`
    *   `GuildChat`
    *   `AnnouncementsCard`, `ProjectsCard`, `BountyBoardCard` (Dashboard Widgets)
*   **Observation:** It correctly uses `activeTab` to switch views.
*   **Potential Issue:** Line 231 renders `GuildProjectsView` in a weird "Full Page" mode if `selectedGuildProjectId` is set, overriding other tabs. This might be confusing UX.

### 5. `pages/Journal.tsx`
*   **Components:** Contains inline `QuickLogWidget` (Lines 9-60). Consider extracting.
*   **Logic:** Uses `RichTextEditor`. Has "Grimoire" (Templates) hardcoded (Lines 81-85).
*   **State:** Local state for searches and folders. Clean.

### 6. `pages/SkillTree.tsx`
*   ✅ **Clean.** Uses `ReactFlow`.
*   **Data:** Loads data from `useGameStore` (`skillNodes`, `skillEdges`).
*   **UI:** Contains inline `NodeInfoPanel`.

## Phase 3: Frontend Pages Findings (Batch 3)

### 7. `pages/Settings.tsx`
*   **Inline Components:** Contains `ProfileSettings` defined *inside* the file (Lines 17-90). This is acceptable for now but could be extracted.
*   **Stripe Intgegration:** Hardcoded `LIFETIME_PRICE_ID` (Line 14) and direct Checkout call (Line 95).
*   **Cloud Sync:** Has a "Beta" label and `CloudSyncControls`.

### 8. `pages/LandingPage.tsx`
*   **Hardcoded Content:** Features, Pricing Tiers, and testimonials are all hardcoded text.
*   **UI:** Very clean, uses Tailwind well. Features a "Hero Section" and "Features Grid".
*   **Recommendation:** If dynamic content is needed (e.g., from a CMS), this will need a rewrite. For now, it's fine as a static page.

### 9. `pages/Admin.tsx`
*   **Security:** Uses `AdminRoute` wrapper in `App.tsx` (Line 10). Good.
*   **Features:**
    *   **User Search:** via Convex `searchUsers`.
    *   **Economy Injection:** Manual controls for Gold/Gems.
    *   **Banning:** `banUser`/`unbanUser` mutations.
    *   **System Flags:** Maintenance mode, Global Banners.
    *   **Guild Inspector:** `getAllGuildsAdmin`.
*   **Verdict:** Solid administration panel.

### 10. `App.tsx`
*   **Routing:** Uses `HashRouter` (Line 155). This is typical for SPAs but might affect SEO if not careful (though Landing Page is catching `/`).
*   **Logic:**
    *   Syncs Clerk User to Convex on mount (useEffect Line 61).
    *   Initializes PostHog.
    *   Handles "Daily Check" (Line 100).
    *   Handles **Global Ban/Maintenance Lockouts**.

### 11. `components/Layout.tsx`
*   **Navigation:** Defines core `NavLinks`.
*   **Mobile:** Has `MobileHamburgerNav` (Line 125).
*   **Complexity:** Handles "Fantasy" vs "Default" nav button styles. Displays Resource Bar (Gold, Shards, Gems).
*   **Overlay:** Renders `GlobalBanner` if active.

---
**Next Step Recommendation:**
Proceed to **Phase 4: Components Sweep**. I need to verify `components/` for any large, unused, or duplicate files that were not caught in the page analysis.
