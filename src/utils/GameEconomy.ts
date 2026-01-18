import { Task, AvatarPerks, InventoryItem } from '../../types';

// Fixed rewards for all tasks
export const FIXED_XP_REWARD = 100;
export const FIXED_GOLD_REWARD = 25;

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


export const calculateGambitChance = (successChance: number, perks?: AvatarPerks) => {
    let finalChance = successChance;
    if (perks?.luckModifier) {
        finalChance += perks.luckModifier;
    }
    return Math.min(finalChance, 1.0); // Cap at 100%
};
