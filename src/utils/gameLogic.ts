export const XP_CONSTANTS = {
    BASE_XP: 100,
    DIFFICULTY_FACTOR: 2.0, // Quadratic curve (x^2.0) - Standard RPG pacing
};

export const QUEST_REWARDS = {
    TRIVIAL: 10,  // e.g. Drink Water
    EASY: 50,     // e.g. 15 min chore
    MEDIUM: 150,  // e.g. 1 hour Gym
    HARD: 300,    // e.g. Deep Work Session
    EPIC: 1000,   // e.g. Complete Main Project
};

/**
 * Calculates the TOTAL XP required to reach the START of the target level.
 * Formula: Round( Base * (Level-1)^Factor ) to nearest 100
 * 
 * Level 1 starts at 0 XP.
 * Level 2 require 100 XP total.
 */
export const calculateTotalXpForLevel = (level: number): number => {
    if (level <= 1) return 0;
    const rawXp = XP_CONSTANTS.BASE_XP * Math.pow(level - 1, XP_CONSTANTS.DIFFICULTY_FACTOR);
    // Round to nearest 50 to keep clean numbers
    return Math.max(100, Math.round(rawXp / 50) * 50);
};

/**
 * Calculates how much XP is needed to go from current level to next level.
 * This is effectively: TotalXP(Level+1) - TotalXP(Level)
 */
export const calculateXpToNextLevel = (currentLevel: number): number => {
    const currentLevelTotal = calculateTotalXpForLevel(currentLevel);
    const nextLevelTotal = calculateTotalXpForLevel(currentLevel + 1);
    return nextLevelTotal - currentLevelTotal;
};

/**
 * Calculates player level based on accumulated lifetime XP.
 * Uses a basic iterative check since the max level isn't infinity (optimized for <Level 100).
 * For very high levels, we could invert the formula, but loop is safer for discrete steps.
 */
export const calculateLevelFromTotalXp = (totalXp: number): number => {
    let level = 1;
    while (true) {
        const nextLevelThreshold = calculateTotalXpForLevel(level + 1);
        if (totalXp < nextLevelThreshold) {
            return level;
        }
        level++;
    }
};
