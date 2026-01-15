import { Task, QuestDifficulty, AvatarPerks, InventoryItem } from '../../types';

export const GOLD_REWARDS: Record<QuestDifficulty, number> = {
    TRIVIAL: 1,
    EASY: 5,
    MEDIUM: 15,
    HARD: 40,
    EPIC: 100
};

export type ShopItem = Omit<InventoryItem, 'acquiredAt' | 'quantity'>;

export const SHOP_ITEMS: ShopItem[] = [
    {
        id: 'a_adapt_cloak',
        name: 'Adaptive Cloak',
        description: 'Shimmers with dark energy.',
        lore: 'Woven from shadows.',
        type: 'IN_GAME',
        rarity: 'EPIC',
        cost: 0,
        premiumPrice: 1000,
        currency: 'GEMS',
        imageUrl: '/items/void_cloak.png',
        slots: ['ARMOR']
    }
];



/**
 * Calculates rewards for a completed task.
 * Enforces:
 * - NO Skill Points for daily tasks (handled by caller passing isProject=false)
 * - Fixed Gold Rewards
 */
export const calculateRewards = (difficulty: QuestDifficulty, isProject: boolean = false, perks?: AvatarPerks) => {
    let gold = GOLD_REWARDS[difficulty];
    let sp = isProject ? 2 : 0;

    // Apply Perks
    if (perks) {
        if (perks.goldModifier) gold = Math.round(gold * (1 + perks.goldModifier));
        // XP modifier is handled where XP is awarded
    }

    return { gold, sp };
};

export const calculateGambitChance = (successChance: number, perks?: AvatarPerks) => {
    let finalChance = successChance;
    if (perks?.luckModifier) {
        finalChance += perks.luckModifier;
    }
    return Math.min(finalChance, 1.0); // Cap at 100%
};
