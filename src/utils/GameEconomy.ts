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
    // A. System Consumables
    {
        id: 'stim_pack',
        name: 'Stim-Pack (Energy)',
        cost: 50,
        type: 'SYSTEM',
        currency: 'GOLD',
        description: '+20 Energy immediately.',
        flavor: 'Synthesized caffeine equivalent. Stabilizes focus levels.',
        imageUrl: '/items/stim_pack.png'
    },
    {
        id: 'chronos_key',
        name: 'Chronos Key',
        cost: 300,
        type: 'SYSTEM',
        currency: 'GOLD',
        description: 'Extend a Quest deadline by 24h.',
        flavor: 'A glitched fragment of time. Delays the inevitable.',
        imageUrl: '/items/chronos_key.png'
    },
    {
        id: 'data_scrub',
        name: 'Data Scrub (Mulligan)',
        cost: 500,
        type: 'SYSTEM',
        currency: 'GOLD',
        description: 'Removes 1 "Missed Task" penalty from history.',
        flavor: 'Erases failure from the logs. It never happened.',
        imageUrl: '/items/data_scrub.png'
    },
    {
        id: 'overclock_mode',
        name: 'Overclock Mode',
        cost: 1000,
        type: 'SYSTEM',
        currency: 'GOLD',
        description: '2x XP for the next 4 hours.',
        flavor: 'Push the hardware to its limits. Warning: Heat generation imminent.',
        imageUrl: '/items/overclock_mode.png'
    },
    {
        id: 'stasis_pod',
        name: 'Stasis Pod',
        cost: 2000,
        type: 'SYSTEM',
        currency: 'GOLD',
        description: '"Pauses" your streaks for 1 weekend (Vacation Mode).',
        flavor: 'Cryogenic suspension for the weary traveler.',
    },

    // B. Real-World Rewards
    {
        id: 'youtube_token',
        name: 'Guilt-Free YouTube',
        cost: 30,
        type: 'REAL_LIFE',
        currency: 'GOLD',
        description: '30 mins of mindless content consumption.',
        flavor: 'Authorized dopamine intake.'
    },
    {
        id: 'ubereats_token',
        name: 'UberEats Token',
        cost: 150,
        type: 'REAL_LIFE',
        currency: 'GOLD',
        description: 'Permission to order delivery instead of cooking.',
        flavor: 'Sustenance deployment requested.'
    },
    {
        id: 'offline_protocol',
        name: 'The "Offline" Protocol',
        cost: 500,
        type: 'REAL_LIFE',
        currency: 'GOLD',
        description: '1 entire evening with NO work/projects allowed.',
        flavor: 'Disconnecting from the grid... Success.'
    },
    {
        id: 'skin_upgrade',
        name: 'Skin Upgrade',
        cost: 2000,
        type: 'REAL_LIFE',
        currency: 'GOLD',
        description: 'Buy a new piece of clothing (Shirt/Shoes).',
        flavor: 'Visual modification for the avatar.'
    },
    {
        id: 'hardware_upgrade',
        name: 'Hardware Upgrade',
        cost: 5000,
        type: 'REAL_LIFE',
        currency: 'GOLD',
        description: 'Buy that new mouse/keyboard/monitor you want.',
        flavor: 'System architecture improvement.'
    },

    // C. Black Market (Premium)


    // D. Equipment & Accessories
    /*
    {
        id: 'w_cursed_staff',
        name: 'Cursed Void Staff',
        cost: 1500,
        type: 'BLACK_MARKET',
        currency: 'GEMS',
        description: 'A staff corrupted by forbidden spaghetti code.',
        flavor: 'It whispers optimization tips.',
        imageUrl: '/items/cursed_staff.png',
        slots: ['WEAPON']
    },
    */
    // --- WEAPONS - ORPHANED/HIDDEN ---
    /*
    {
        id: 'w_thunder_hammer',
        name: 'Thunder Hammer',
        cost: 3200,
        type: 'BLACK_MARKET',
        currency: 'GOLD',
        description: 'Heavy impact with a shockwave finish.',
        flavor: 'Stop. Hammer time.',
        imageUrl: '/items/thunder_hammer.png',
        slots: ['WEAPON']
    },
    {
        id: 'w_neural_dagger',
        name: 'Neural Dagger',
        cost: 1800,
        type: 'BLACK_MARKET',
        currency: 'GOLD',
        description: 'Silent but deadly. Disconnects neural links.',
        flavor: 'Did you feel that? No? Good.',
        imageUrl: '/items/neural_dagger.png',
        slots: ['WEAPON']
    },
    {
        id: 'w_molten_sword',
        name: 'Molten Greatsword',
        cost: 3500,
        type: 'BLACK_MARKET',
        currency: 'GOLD',
        description: 'Forged in the core of a dying server.',
        flavor: 'Hotfix incoming.',
        imageUrl: '/items/molten_sword.png',
        slots: ['WEAPON']
    },
    {
        id: 'w_cyber_sword',
        name: 'Cyber Blade',
        cost: 2800,
        type: 'BLACK_MARKET',
        currency: 'GOLD',
        description: 'A blade of pure energy.',
        flavor: 'Sharp enough to cut through firewalls.',
        imageUrl: '/items/cyber_sword.png',
        slots: ['WEAPON']
    },
    */

    // --- ARMOR ---


    {
        id: 'a_adapt_cloak',
        name: 'Adaptive Cloak',
        cost: 1200,
        type: 'BLACK_MARKET',
        currency: 'GEMS',
        description: 'Shimmering fabric from the null sector.',
        flavor: 'Now you see me...',
        imageUrl: '/items/void_cloak.png',
        slots: ['ARMOR']
    },

    // --- HEADGEAR ---

    {
        id: 'h_oni_mask',
        name: 'Oni Mask',
        cost: 2200,
        type: 'BLACK_MARKET',
        currency: 'GOLD',
        description: 'Strike fear into the hearts of daemons.',
        flavor: 'Demon mode engaged.',
        imageUrl: '/items/oni_mask.png',
        slots: ['ARMOR']
    },


    // --- ACCESSORIES ---
    /*
    {
        id: 'a_grav_boots',
        name: 'Grav-Boots',
        cost: 2000,
        type: 'BLACK_MARKET',
        currency: 'GOLD',
        description: 'Defy gravity. Walk on walls (metaphorically).',
        flavor: 'One small step.',
        imageUrl: '/items/grav_boots.png',
        slots: ['ARMOR']
    },
    */


    /*
    {
        id: 'w_data_gauntlet',
        name: 'Data Gauntlet',
        cost: 2100,
        type: 'BLACK_MARKET',
        currency: 'GOLD',
        description: 'Hack the planet with a wave of your hand.',
        flavor: 'Power glove on.',
        imageUrl: '/items/data_gauntlet.png',
        slots: ['WEAPON']
    },
    */


    // --- CONSUMABLES ---
    {
        id: 'c_memory_chip',
        name: 'Memory Chip',
        cost: 500,
        type: 'SYSTEM',
        currency: 'GOLD',
        description: 'Instantly learn something useless.',
        flavor: 'Downloading kung fu...',
        imageUrl: '/items/memory_chip.png'
    },
    {
        id: 'c_phoenix_feather',
        name: 'Phoenix Feather',
        cost: 5000,
        type: 'SYSTEM',
        currency: 'GOLD',
        description: 'A rare artifact of revival.',
        flavor: 'Rise from the ashes.',
        imageUrl: '/items/phoenix_feather.png'
    },

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
