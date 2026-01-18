export const XP_CONSTANTS = {
    BASE_XP: 100,
    DIFFICULTY_FACTOR: 2.0, // Deprecated in favor of piecewise logic, kept for reference
};

export const QUEST_REWARDS = {
    TRIVIAL: 10,  // e.g. Drink Water
    EASY: 50,     // e.g. 15 min chore
    MEDIUM: 150,  // e.g. 1 hour Gym
    HARD: 300,    // e.g. Deep Work Session
    EPIC: 1000,   // e.g. Complete Main Project
};

/**
 * Calculates how much XP is needed to go from current level to next level.
 * Implements the "Gamify Hybrid Curve":
 * 1. Novice (1-10): Fast Linear (100 * Level)
 * 2. Adept (11-50): Steady Slope (1500 + 100/lvl)
 * 3. Master (50+): Fixed Cap (5500)
 */
export const calculateXpToNextLevel = (level: number): number => {
    // TIER 1: NOVICE (Levels 1-10)
    // Pace: Very Fast
    if (level < 11) {
        return 100 * level;
        // L1->2: 100
        // L10->11: 1000
    }

    // TIER 2: ADEPT (Levels 11-50)
    // Pace: ~1-2 Weeks per level
    if (level < 50) {
        const base = 1500;
        const increment = 100;
        return base + ((level - 11) * increment);
        // L11->12: 1500
        // L20->21: 2400
        // L49->50: 5300
    }

    // TIER 3: MASTER (Levels 50+)
    // Pace: Prestige Cap (~2 Weeks fixed)
    return 5500;
};

/**
 * Calculates the TOTAL XP required to reach the START of the target level.
 * Sums up the specific requirements from level 1 to target level.
 */
export const calculateTotalXpForLevel = (targetLevel: number): number => {
    if (targetLevel <= 1) return 0;

    let total = 0;
    // Sum up the cost of every level prior to target
    for (let i = 1; i < targetLevel; i++) {
        total += calculateXpToNextLevel(i);
    }
    return total;
};

/**
 * Calculates player level based on accumulated lifetime XP.
 * Uses a basic iterative check since the max level isn't infinity (optimized for <Level 100).
 */
export const calculateLevelFromTotalXp = (totalXp: number): number => {
    let level = 1;
    while (true) {
        const xpNeededForNext = calculateXpToNextLevel(level);
        // If we have enough XP to complete this level, advance properties
        // Wait, standard logic is usually: totalXp vs Threshold.
        const nextLevelThreshold = calculateTotalXpForLevel(level + 1);

        if (totalXp < nextLevelThreshold) {
            return level;
        }
        level++;

        // Safety Break for infinite loops (e.g. if logic fails)
        if (level > 1000) return level;
    }
};
