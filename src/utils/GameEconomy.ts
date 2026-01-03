import { Task, QuestDifficulty, AvatarPerks } from '../../types';

export const GOLD_REWARDS: Record<QuestDifficulty, number> = {
    TRIVIAL: 1,
    EASY: 5,
    MEDIUM: 15,
    HARD: 40,
    EPIC: 100
};

export const SHOP_ITEMS = [
    // A. System Consumables
    {
        id: 'stim_pack',
        name: 'Stim-Pack (Energy)',
        cost: 50,
        type: 'SYSTEM',
        currency: 'GOLD',
        description: '+20 Energy immediately.',
        flavor: 'Synthesized caffeine equivalent. Stabilizes focus levels.',
        imageUrl: '/assets/items/stim_pack.png'
    },
    {
        id: 'chronos_key',
        name: 'Chronos Key',
        cost: 300,
        type: 'SYSTEM',
        currency: 'GOLD',
        description: 'Extend a Quest deadline by 24h.',
        flavor: 'A glitched fragment of time. Delays the inevitable.',
        imageUrl: '/assets/items/chronos_key.png'
    },
    {
        id: 'data_scrub',
        name: 'Data Scrub (Mulligan)',
        cost: 500,
        type: 'SYSTEM',
        currency: 'GOLD',
        description: 'Removes 1 "Missed Task" penalty from history.',
        flavor: 'Erases failure from the logs. It never happened.',
        imageUrl: '/assets/items/data_scrub.png'
    },
    {
        id: 'overclock_mode',
        name: 'Overclock Mode',
        cost: 1000,
        type: 'SYSTEM',
        currency: 'GOLD',
        description: '2x XP for the next 4 hours.',
        flavor: 'Push the hardware to its limits. Warning: Heat generation imminent.',
        imageUrl: '/assets/items/overclock_mode.png'
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
    {
        id: 'oracle_protocol',
        name: 'The Oracle',
        cost: 200,
        type: 'BLACK_MARKET',
        currency: 'GEMS',
        description: 'Auto-complete 1 Daily Task.',
        flavor: 'Injecting truth into the simulation.'
    },
    {
        id: 'mind_wipe',
        name: 'Mind Wipe',
        cost: 500,
        type: 'BLACK_MARKET',
        currency: 'GEMS',
        description: 'Reset a Skill Tree branch to recover Skill Points.',
        flavor: 'Selective memory formatting.'
    },

    // D. Equipment & Accessories
    {
        id: 'w_cursed_staff',
        name: 'Cursed Void Staff',
        cost: 1500,
        type: 'BLACK_MARKET',
        currency: 'GEMS',
        description: 'A staff corrupted by forbidden spaghetti code.',
        flavor: 'It whispers optimization tips.',
        imageUrl: '/assets/items/w_cursed_staff.png'
    },
    // --- WEAPONS ---
    {
        id: 'w_thunder_hammer',
        name: 'Thunder Hammer',
        cost: 3200,
        type: 'BLACK_MARKET',
        currency: 'GOLD',
        description: 'Heavy impact with a shockwave finish.',
        flavor: 'Stop. Hammer time.',
        imageUrl: '/assets/items/w_thunder_hammer.png'
    },
    {
        id: 'w_neural_dagger',
        name: 'Neural Dagger',
        cost: 1800,
        type: 'BLACK_MARKET',
        currency: 'GOLD',
        description: 'Silent but deadly. Disconnects neural links.',
        flavor: 'Did you feel that? No? Good.',
        imageUrl: '/assets/items/w_neural_dagger.png'
    },
    {
        id: 'w_molten_sword',
        name: 'Molten Greatsword',
        cost: 3500,
        type: 'BLACK_MARKET',
        currency: 'GOLD',
        description: 'Forged in the core of a dying server.',
        flavor: 'Hotfix incoming.',
        imageUrl: '/assets/items/w_molten_sword.png'
    },
    {
        id: 'w_cyber_sword',
        name: 'Cyber Blade',
        cost: 2800,
        type: 'BLACK_MARKET',
        currency: 'GOLD',
        description: 'A blade of pure energy.',
        flavor: 'Sharp enough to cut through firewalls.',
        imageUrl: '/assets/items/w_cyber_sword.png'
    },

    // --- ARMOR ---
    {
        id: 'a_nano_vest',
        name: 'Nano-Weave Vest',
        cost: 800,
        type: 'BLACK_MARKET',
        currency: 'GOLD',
        description: 'Lightweight protection against bugs.',
        flavor: 'Comfortable and stylish.',
        imageUrl: '/assets/items/a_nano_vest.png'
    },
    {
        id: 'a_titan_exo',
        name: 'Titan Exoskeleton',
        cost: 5000,
        type: 'BLACK_MARKET',
        currency: 'GOLD',
        description: 'Turn yourself into a walking tank.',
        flavor: 'Heavy metal inbound.',
        imageUrl: '/assets/items/a_titan_exo.png'
    },
    {
        id: 'a_void_cloak',
        name: 'Void Cloak',
        cost: 1200,
        type: 'BLACK_MARKET',
        currency: 'GEMS',
        description: 'Shimmering fabric from the null sector.',
        flavor: 'Now you see me...',
        imageUrl: '/assets/items/a_void_cloak.png'
    },

    // --- HEADGEAR ---
    {
        id: 'h_tac_visor',
        name: 'Tactical Visor',
        cost: 1200,
        type: 'BLACK_MARKET',
        currency: 'GOLD',
        description: 'Highlights objectives and critical errors.',
        flavor: 'I\'ve got you in my sights.',
        imageUrl: '/assets/items/h_tac_visor.png'
    },
    {
        id: 'h_oni_mask',
        name: 'Oni Mask',
        cost: 2200,
        type: 'BLACK_MARKET',
        currency: 'GOLD',
        description: 'Strike fear into the hearts of daemons.',
        flavor: 'Demon mode engaged.',
        imageUrl: '/assets/items/h_oni_mask.png'
    },
    {
        id: 'h_gas_mask',
        name: 'Hazmat Mask',
        cost: 900,
        type: 'BLACK_MARKET',
        currency: 'GOLD',
        description: 'Filters out toxic comments and radiation.',
        flavor: 'Breathe deep.',
        imageUrl: '/assets/items/h_gas_mask.png'
    },

    // --- ACCESSORIES ---
    {
        id: 'a_grav_boots',
        name: 'Grav-Boots',
        cost: 2000,
        type: 'BLACK_MARKET',
        currency: 'GOLD',
        description: 'Defy gravity. Walk on walls (metaphorically).',
        flavor: 'One small step.',
        imageUrl: '/assets/items/a_grav_boots.png'
    },
    {
        id: 'acc_holo_drone',
        name: 'Holo-Drone',
        cost: 500,
        type: 'BLACK_MARKET',
        currency: 'GEMS',
        description: 'A loyal companion that hovers nearby.',
        flavor: 'Beep boop.',
        imageUrl: '/assets/items/acc_holo_drone.png'
    },
    {
        id: 'a_cyber_goggles',
        name: 'Cyber Goggles',
        cost: 1100,
        type: 'BLACK_MARKET',
        currency: 'GOLD',
        description: 'See the matrix.',
        flavor: 'My eyes are augmented.',
        imageUrl: '/assets/items/a_cyber_goggles.png'
    },
    {
        id: 'w_data_gauntlet',
        name: 'Data Gauntlet',
        cost: 2100,
        type: 'BLACK_MARKET',
        currency: 'GOLD',
        description: 'Hack the planet with a wave of your hand.',
        flavor: 'Power glove on.',
        imageUrl: '/assets/items/w_data_gauntlet.png'
    },
    {
        id: 'acc_cyber_shield',
        name: 'Cyber Shield',
        cost: 1500,
        type: 'BLACK_MARKET',
        currency: 'GOLD',
        description: 'Holographic defense barrier.',
        flavor: 'Access denied.',
        imageUrl: '/assets/items/acc_cyber_shield.png'
    },
    {
        id: 'acc_void_whisp',
        name: 'Void Whisp',
        cost: 2000,
        type: 'BLACK_MARKET',
        currency: 'GEMS',
        description: 'A fragmented soul from the void.',
        flavor: 'It hums with unknown energy.',
        imageUrl: '/assets/items/acc_void_whisp.png'
    },

    // --- CONSUMABLES ---
    {
        id: 'c_memory_chip',
        name: 'Memory Chip',
        cost: 500,
        type: 'SYSTEM',
        currency: 'GOLD',
        description: 'Instantly learn something useless.',
        flavor: 'Downloading kung fu...',
        imageUrl: '/assets/items/c_memory_chip.png'
    },
    {
        id: 'c_phoenix_feather',
        name: 'Phoenix Feather',
        cost: 5000,
        type: 'SYSTEM',
        currency: 'GOLD',
        description: 'A rare artifact of revival.',
        flavor: 'Rise from the ashes.',
        imageUrl: '/assets/items/c_phoenix_feather.png'
    },
    // E. Avatars
    {
        id: 'grand_wizard',
        name: 'Grand Wizard',
        cost: 2500, // Premium
        rarity: 'LEGENDARY',
        slots: ['WEAPON', 'ARMOR', 'ACCESSORY'],
        type: 'AVATAR',
        currency: 'GEMS',
        description: 'The master of the arcane. Commands all elements.',
        lore: "Some say he was the first developer. Others say he IS the code.",
        flavor: 'Unlimited power.',
        imageUrl: '/assets/avatars/grand_wizard/grand_wizard_w_void_cloak_and_cursed_void_staff_shop_preview.png',
        videoUrl: '/assets/grand_wizard_idle.mp4',
        perks: {
            xpModifier: 0.5, // +50% XP
            goldModifier: 0.5, // +50% Gold
            luckModifier: 0.2 // +20% Luck
        }
    },
    {
        id: 'hero_star_general',
        name: 'Dark Warlord',
        cost: 1000,
        type: 'AVATAR',
        currency: 'GEMS',
        description: 'Command the fleet.',
        lore: 'A conqueror of a thousand repos per second. His commit history is written in blood.',
        flavor: 'To infinity.',
        imageUrl: '/assets/avatars/hero_star_general.png',
        rarity: 'MYSTIC',
        slots: ['WEAPON', 'ACCESSORY'],
        perks: { shopDiscount: 0.15, goldModifier: 0.10 }
    },
    {
        id: 'hero_dark_warrior',
        name: 'Iron Viking',
        cost: 500,
        type: 'AVATAR',
        currency: 'GEMS',
        description: 'Embrace the dark mode.',
        lore: 'Forged in the frosty north of the server farm. Resilient and unyielding.',
        flavor: 'Shadows guide you.',
        imageUrl: '/assets/avatars/hero_dark_warrior.png',
        rarity: 'RARE',
        slots: ['ACCESSORY'],
        perks: { goldModifier: 0.10, luckModifier: 0.05 }
    },
    {
        id: 'hero_cyber_knight',
        name: 'Cyber Knight',
        cost: 1500,
        type: 'AVATAR',
        currency: 'GEMS',
        description: 'The futuristic defender of the net.',
        lore: 'A digital warrior reconstructed from corrupted data.',
        flavor: 'System online.',
        imageUrl: '/assets/avatars/cyber_knight/base.png',
        rarity: 'MYSTIC',
        slots: ['WEAPON', 'ACCESSORY', 'ARMOR'],
        perks: { xpModifier: 0.10, energyMaxBonus: 20 }
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
