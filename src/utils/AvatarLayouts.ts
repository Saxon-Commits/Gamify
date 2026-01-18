// Defines layout configurations for avatars, backdrops, and companions
// This acts as the single source of truth for visual positioning across the app.

// ------------------------------------------------------------------
// 1. AVATAR LAYOUTS (Positions & Scales of the Avatar Image itself)
// ------------------------------------------------------------------
export const AVATAR_OFFSETS: Record<string, { height: number; offsetX: number; offsetY: number }> = {
    'starter_elf_male': { height: 77, offsetX: -4, offsetY: -2 },
    'starter_elf_female': { height: 77, offsetX: -4, offsetY: -2 },
    'starter_villager_male': { height: 77, offsetX: -4, offsetY: -2 },
    'starter_villager_female': { height: 77, offsetX: -4, offsetY: -2 },
    'grand_wizard': { height: 77, offsetX: 1, offsetY: -16 },
    'hero_cyber_knight': { height: 77, offsetX: 5, offsetY: -2 },
    'dark_wizard': { height: 77, offsetX: 1, offsetY: -16 },
    'benevolent_wizard': { height: 77, offsetX: 1, offsetY: -16 },
    'seraph_knight': { height: 77, offsetX: 1, offsetY: -16 },
    'warlord': { height: 77, offsetX: 1, offsetY: -2 },
    'geisha_android': { height: 77, offsetX: 1, offsetY: -16 },
    'xv_android': { height: 77, offsetX: 1, offsetY: -30 },
    'toxic_alchemist': { height: 77, offsetX: 1, offsetY: -16 },
    'avatar_scribe_master': { height: 77, offsetX: 1, offsetY: -16 },
    'avatar_master_blacksmith': { height: 77, offsetX: 1, offsetY: -31 },
    'avatar_master_bounty_hunter': { height: 77, offsetX: 11, offsetY: -11 },
};

// ------------------------------------------------------------------
// 2. BACKDROP OFFSETS (Zoom & Pan for Theme Backgrounds)
// ------------------------------------------------------------------
export const BACKDROP_CONFIGS: Record<string, { scale: number; offsetX: number; offsetY: number }> = {
    'theme-apocalyptic-ruins': { scale: 142, offsetX: 0, offsetY: -67 },
    'theme-crystal-cavern': { scale: 116, offsetX: 0, offsetY: -32 },
    'theme-digital-city': { scale: 125, offsetX: 29, offsetY: -45 },
    'theme-frozen-tundra': { scale: 100, offsetX: 0, offsetY: 0 },
    'theme-mushroom-grove': { scale: 98, offsetX: 0, offsetY: 25 },
    'theme-ocean-depths': { scale: 100, offsetX: 0, offsetY: 0 },
    'theme-sakura-temple': { scale: 100, offsetX: 0, offsetY: 0 },
    'theme-space-station': { scale: 100, offsetX: 0, offsetY: 0 },
    'theme-sunset-mountain': { scale: 117, offsetX: 0, offsetY: 12 },
    'theme-volcanic-hellscape': { scale: 105, offsetX: 0, offsetY: 7 },
    'theme-wizards-library': { scale: 118, offsetX: 5, offsetY: 15 },
};

// ------------------------------------------------------------------
// 3. COMPANION OFFSETS (Positioning relative to container %)
// ------------------------------------------------------------------
export const COMPANION_CONFIGS: Record<string, { top: number; right: number; scale: number; rot: number }> = {
    'companion-data-serpent': { top: 68.5, right: 67, scale: 1.05, rot: 1 },
    'companion-digital-ghost': { top: 41, right: 63, scale: 1.25, rot: -1 },
    'companion-floating-grimoire': { top: 52.5, right: 64.5, scale: 1.05, rot: 20 },
    'companion-medic-drone': { top: 38.5, right: 63, scale: 1.40, rot: -1 },
    'companion-pebble-golem': { top: 64.5, right: 63.5, scale: 1.30, rot: 1 },
    'companion-phoenix-hatchling': { top: 66.5, right: 66, scale: 1.20, rot: 1 },
    'companion-holo-drone': { top: 41, right: 63, scale: 1.10, rot: -1 },
    'acc_holo_drone': { top: 41, right: 63, scale: 1.10, rot: -1 },
    'companion-void-whisp': { top: 38.5, right: 63, scale: 1.00, rot: 7 },
    'active-protocol-droid': { top: 26, right: 53, scale: 1.2, rot: 0 }
};

// ------------------------------------------------------------------
// 4. HAND POSITIONS (Legacy / Equipment Anchors)
// ------------------------------------------------------------------
export interface HandPosition {
    top: number;   // % from top
    left: number;  // % from left
    rotate: number; // degrees
    scale: number; // scale factor (1 = 100%)
    zIndex?: number; // 2 = in front of avatar, 0 = behind
}

export const AVATAR_HAND_POSITIONS: Record<string, HandPosition> = {
    // defaults
    'default': { top: 50, left: 80, rotate: 0, scale: 1, zIndex: 2 },

    // Avatar IDs (must match those in GameEconomy or Character page)
    'base': { top: 55, left: 75, rotate: -15, scale: 0.8, zIndex: 2 },
    'hero_mage_wizard': { top: 45, left: 82, rotate: 10, scale: 1, zIndex: 2 },
    'hero_cursed_void': { top: 50, left: 80, rotate: 0, scale: 1, zIndex: 2 },
    'hero_voidwalker': { top: 50, left: 80, rotate: 0, scale: 1, zIndex: 2 },
    'hero_cyber_future': { top: 50, left: 80, rotate: 0, scale: 1, zIndex: 2 }, // Sentinel
    'hero_luna_witch': { top: 50, left: 80, rotate: 0, scale: 1, zIndex: 2 },
    'hero_star_general': { top: 50, left: 80, rotate: 0, scale: 1, zIndex: 2 }, // Dark Warlord
    'hero_solar_champion': { top: 50, left: 80, rotate: 0, scale: 1, zIndex: 2 }, // Golden Paladin
    'hero_dark_warrior': { top: 50, left: 80, rotate: 0, scale: 1, zIndex: 2 }, // Iron Viking
    'hero_exo_hunter': { top: 50, left: 80, rotate: 0, scale: 1, zIndex: 2 }, // Crimson Hunter
    'hero_cyber': { top: 50, left: 80, rotate: 0, scale: 1, zIndex: 2 }, // Netrunner
    'hero_mage': { top: 50, left: 80, rotate: 0, scale: 1, zIndex: 2 }, // Sorcerer
    'hero_rare': { top: 50, left: 80, rotate: 0, scale: 1, zIndex: 2 },
};
