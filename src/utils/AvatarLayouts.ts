// Defines where the "Main Hand" is located for each avatar.
// Coordinates are in percentages relative to the avatar container (400x500 standard aspect ratio).

export interface HandPosition {
    top: number;   // % from top
    left: number;  // % from left
    rotate: number; // degrees
    scale: number; // scale factor (1 = 100%)
    zIndex?: number; // 2 = in front of avatar, 0 = behind
}

export const AVATAR_LAYOUTS: Record<string, HandPosition> = {
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
