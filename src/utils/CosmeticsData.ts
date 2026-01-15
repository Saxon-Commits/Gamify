import { InventoryItem } from '../../types';

// Pricing Tiers (Gems)
// 100 Gems ≈ $1.00
const GEM_COST = {
    BASIC: 500,    // $5
    STANDARD: 1000, // $10
    PREMIUM: 2000, // $20
    ULTRA: 3500,   // $35
    LEGENDARY: 5000 // $50
};

export const COSMETIC_SHOP_ITEMS: InventoryItem[] = [
    // --- AVATARS (Premium Skins) ---
    {
        id: 'hero_cyber_knight',
        name: 'Cyber Knight',
        description: 'The futuristic defender of the net.',
        lore: 'A digital warrior reconstructed from corrupted data.',
        type: 'AVATAR',
        rarity: 'MYSTIC',
        cost: 0,
        premiumPrice: 1500,
        currency: 'GEMS',
        acquiredAt: '',
        quantity: 1,
        imageUrl: '/avatars/cyber_knight/base.png',
        slots: ['WEAPON', 'ARMOR', 'ACCESSORY']
    },
    {
        id: 'dark_wizard',
        name: 'Dark Wizard',
        description: 'Wielder of forbidden arts.',
        lore: 'Power at any cost.',
        type: 'AVATAR',
        rarity: 'LEGENDARY',
        cost: 0,
        premiumPrice: 2000,
        currency: 'GEMS',
        imageUrl: '/avatars/premium/dark_wizard_base.png',
        slots: ['WEAPON', 'ARMOR', 'ACCESSORY']
    },
    {
        id: 'benevolent_wizard',
        name: 'Benevolent Wizard',
        description: 'A guide for the lost.',
        lore: 'Light in the darkness.',
        type: 'AVATAR',
        rarity: 'RARE',
        cost: 0,
        premiumPrice: 800,
        currency: 'GEMS',
        imageUrl: '/avatars/premium/benevolent_wizard.png',
        slots: ['WEAPON', 'ARMOR', 'ACCESSORY']
    },
    {
        id: 'seraph_knight',
        name: 'Seraph Knight',
        description: 'Blessed by the light.',
        lore: 'A warrior of divine purpose.',
        type: 'AVATAR',
        rarity: 'MYSTIC',
        cost: 0,
        premiumPrice: 2500,
        currency: 'GEMS',
        imageUrl: '/avatars/premium/seraph_knight.png',
        slots: ['WEAPON', 'ARMOR', 'ACCESSORY']
    },
    {
        id: 'warlord',
        name: 'Iron Warlord',
        description: 'Conqueror of realms.',
        lore: 'Victory is the only option.',
        type: 'AVATAR',
        rarity: 'LEGENDARY',
        cost: 0,
        premiumPrice: 1800,
        currency: 'GEMS',
        imageUrl: '/avatars/premium/warlord.png',
        slots: ['WEAPON', 'ARMOR', 'ACCESSORY']
    },
    {
        id: 'geisha_android',
        name: 'Cyber Geisha',
        description: 'Grace in the machine.',
        lore: 'Tradition meets innovation.',
        type: 'AVATAR',
        rarity: 'RARE',
        cost: 0,
        premiumPrice: 1200,
        currency: 'GEMS',
        imageUrl: '/avatars/premium/geisha_android.png',
        slots: ['WEAPON', 'ARMOR', 'ACCESSORY']
    },
    {
        id: 'xv_android',
        name: 'XV-7 Sentinel',
        description: 'Automated defense unit.',
        lore: 'Programming: Protect.',
        type: 'AVATAR',
        rarity: 'RARE',
        cost: 0,
        premiumPrice: 1000,
        currency: 'GEMS',
        imageUrl: '/avatars/premium/xv_android.png',
        slots: ['WEAPON', 'ARMOR', 'ACCESSORY']
    },
    {
        id: 'toxic_alchemist',
        name: 'Toxic Alchemist',
        description: 'Master of poisons.',
        lore: 'Science gone wrong.',
        type: 'AVATAR',
        rarity: 'RARE',
        cost: 0,
        premiumPrice: 900,
        currency: 'GEMS',
        imageUrl: '/avatars/premium/toxic_alchemist.png',
        slots: ['WEAPON', 'ARMOR', 'ACCESSORY']
    },
    {
        id: 'grand_wizard',
        name: 'Grand Wizard',
        description: 'The master of the arcane. Commands all elements.',
        lore: 'Some say he was the first developer. Others say he IS the code.',
        type: 'AVATAR',
        rarity: 'LEGENDARY',
        cost: 0,
        premiumPrice: 2500,
        currency: 'GEMS',
        acquiredAt: '',
        quantity: 1,
        imageUrl: '/avatars/grand_wizard/grand_wizard_a_void_cloak.png',
        videoUrl: '/avatars/grand_wizard/idle.mp4',
        flavor: 'Unlimited power.',
        slots: ['WEAPON', 'ARMOR', 'ACCESSORY']
    },


    // --- MASTERY AVATARS (Skill Tree Unlocks) ---
    {
        id: 'avatar_scribe_master',
        name: 'Scribe Master',
        description: 'The keeper of the sacred texts.',
        lore: 'Words are power. You have mastered them all.',
        type: 'AVATAR',
        rarity: 'LEGENDARY',
        cost: 0,
        currency: 'GEMS', // Not purchasable, but field required
        acquiredAt: '',
        quantity: 1, // Will be 0 until unlocked
        imageUrl: '/avatars/mastery/scribe_master.png',
        flavor: 'Written in stone.',
        slots: ['WEAPON', 'ARMOR', 'ACCESSORY']
    },
    {
        id: 'avatar_master_blacksmith',
        name: 'Master Blacksmith',
        description: 'Forged in the fires of discipline.',
        lore: 'Your will is as unbreakable as the steel you shape.',
        type: 'AVATAR',
        rarity: 'LEGENDARY',
        cost: 0,
        currency: 'GEMS',
        acquiredAt: '',
        quantity: 1,
        imageUrl: '/avatars/mastery/master_blacksmith.png',
        flavor: 'Strike while hot.',
        slots: ['WEAPON', 'ARMOR', 'ACCESSORY']
    },
    {
        id: 'avatar_master_bounty_hunter',
        name: 'Master Hunter',
        description: 'No target escapes you.',
        lore: 'Efficiency is the only law that matters.',
        type: 'AVATAR',
        rarity: 'LEGENDARY',
        cost: 0,
        currency: 'GEMS',
        acquiredAt: '',
        quantity: 1,
        imageUrl: '/avatars/mastery/master_bounty_hunter.png',
        flavor: 'Paid in full.',
        slots: ['WEAPON', 'ARMOR', 'ACCESSORY']
    },





    {
        id: 'theme-code-rain',
        name: 'Code Rain',
        description: 'digital rain from above backdrop.',
        type: 'THEME',
        rarity: 'RARE',
        cost: 0,
        premiumPrice: GEM_COST.STANDARD,
        currency: 'GOLD',
        acquiredAt: '',
        quantity: 1,
        image: '/images/ui/heart_icon.png',
        imageUrl: '/backgrounds/code_rain.mp4'
    },
    {
        id: 'theme-pixel-dungeon',
        name: 'Pixel Dungeon',
        description: 'The classic stone halls where your journey began.',
        type: 'THEME',
        rarity: 'COMMON',
        cost: 0,
        premiumPrice: 250,
        currency: 'GEMS',
        acquiredAt: '',
        quantity: 1,
        imageUrl: '/backgrounds/pixel_dungeon.png'
    },
    // Premium Backdrops
    {
        id: 'theme-apocalyptic-ruins',
        name: 'Apocalyptic Ruins',
        description: 'A post-apocalyptic city reclaimed by nature, where deer roam among rusted cars.',
        type: 'THEME',
        rarity: 'EPIC',
        cost: 0,
        premiumPrice: GEM_COST.PREMIUM,
        currency: 'GEMS',
        acquiredAt: '',
        quantity: 1,
        imageUrl: '/backgrounds/apocalyptic ruins.png'
    },
    {
        id: 'theme-crystal-cavern',
        name: 'Crystal Cavern',
        description: 'A magnificent underground cavern with massive gem formations in rainbow colors.',
        type: 'THEME',
        rarity: 'LEGENDARY',
        cost: 0,
        premiumPrice: GEM_COST.ULTRA,
        currency: 'GEMS',
        acquiredAt: '',
        quantity: 1,
        imageUrl: '/backgrounds/crystal cavern.png'
    },
    {
        id: 'theme-digital-city',
        name: 'Digital City',
        description: 'A neon-lit cyberpunk cityscape with holographic billboards and flying vehicles.',
        type: 'THEME',
        rarity: 'EPIC',
        cost: 0,
        premiumPrice: GEM_COST.PREMIUM,
        currency: 'GEMS',
        acquiredAt: '',
        quantity: 1,
        imageUrl: '/backgrounds/digital city.png'
    },
    {
        id: 'theme-frozen-tundra',
        name: 'Frozen Tundra',
        description: 'A harsh frozen wasteland with ancient ice ruins and the northern lights overhead.',
        type: 'THEME',
        rarity: 'RARE',
        cost: 0,
        premiumPrice: GEM_COST.STANDARD,
        currency: 'GEMS',
        acquiredAt: '',
        quantity: 1,
        imageUrl: '/backgrounds/frozen tundra.png'
    },
    // --- REUSED ITEM DEFINITIONS ---
    {
        id: 'acc_holo_drone',
        name: 'Holo Drone',
        description: 'A floating AI companion.',
        lore: 'Always watching.',
        type: 'ACCESSORY',
        rarity: 'RARE',
        cost: 0,
        premiumPrice: 500,
        currency: 'GEMS',
        acquiredAt: '',
        quantity: 1,
        imageUrl: '/companions/holo drone companion.png'
    },
    {
        id: 'acc_void_whisp',
        name: 'Void Whisp',
        description: 'A spectral entity from the void.',
        lore: 'It whispers secrets of the deep.',
        type: 'ACCESSORY',
        rarity: 'EPIC',
        cost: 0,
        premiumPrice: 800,
        currency: 'GEMS',
        acquiredAt: '',
        quantity: 1,
        imageUrl: '/companions/void whisp companion.png'
    },
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
        acquiredAt: '',
        quantity: 1,
        imageUrl: '/items/void_cloak.png',
        slots: ['ARMOR']
    },
    {
        id: 'theme-mushroom-grove',
        name: 'Mushroom Grove',
        description: 'A whimsical underground forest with giant glowing fungi and floating spores.',
        type: 'THEME',
        rarity: 'EPIC',
        cost: 0,
        premiumPrice: GEM_COST.PREMIUM,
        currency: 'GEMS',
        acquiredAt: '',
        quantity: 1,
        imageUrl: '/backgrounds/mushroom grove.png'
    },
    {
        id: 'theme-ocean-depths',
        name: 'Ocean Depths',
        description: 'A mystical underwater kingdom with sunken ruins and bioluminescent creatures.',
        type: 'THEME',
        rarity: 'LEGENDARY',
        cost: 0,
        premiumPrice: GEM_COST.ULTRA,
        currency: 'GEMS',
        acquiredAt: '',
        quantity: 1,
        imageUrl: '/backgrounds/ocean depths.png'
    },
    {
        id: 'theme-sakura-temple',
        name: 'Sakura Temple',
        description: 'A tranquil Japanese temple courtyard with cherry blossoms and a koi pond.',
        type: 'THEME',
        rarity: 'EPIC',
        cost: 0,
        premiumPrice: GEM_COST.PREMIUM,
        currency: 'GEMS',
        acquiredAt: '',
        quantity: 1,
        imageUrl: '/backgrounds/sakura temple.png'
    },
    {
        id: 'theme-space-station',
        name: 'Space Station',
        description: 'The interior of a futuristic space station with a view of distant nebulae.',
        type: 'THEME',
        rarity: 'LEGENDARY',
        cost: 0,
        premiumPrice: GEM_COST.ULTRA,
        currency: 'GEMS',
        acquiredAt: '',
        quantity: 1,
        imageUrl: '/backgrounds/space station.png'
    },
    {
        id: 'theme-sunset-mountain',
        name: 'Sunset Mountain',
        description: 'A serene mountain peak at golden hour with dramatic sunset clouds.',
        type: 'THEME',
        rarity: 'RARE',
        cost: 0,
        premiumPrice: GEM_COST.STANDARD,
        currency: 'GEMS',
        acquiredAt: '',
        quantity: 1,
        imageUrl: '/backgrounds/sunset mountain.png'
    },
    {
        id: 'theme-volcanic-hellscape',
        name: 'Volcanic Hellscape',
        description: 'A crumbling volcanic wasteland with rivers of lava and ash-filled skies.',
        type: 'THEME',
        rarity: 'LEGENDARY',
        cost: 0,
        premiumPrice: GEM_COST.ULTRA,
        currency: 'GEMS',
        acquiredAt: '',
        quantity: 1,
        imageUrl: '/backgrounds/volcanic hellscape.png'
    },
    {
        id: 'theme-wizards-library',
        name: "Wizard's Library",
        description: 'An ancient tower library with towering bookshelves and floating candles.',
        type: 'THEME',
        rarity: 'EPIC',
        cost: 0,
        premiumPrice: GEM_COST.PREMIUM,
        currency: 'GEMS',
        acquiredAt: '',
        quantity: 1,
        imageUrl: "/backgrounds/wizard's library.png"
    }
] as InventoryItem[];

export const NEW_WEAPONS: InventoryItem[] = [
    // Weapons Orphaned/Hidden as per request
    /*
    {
        id: 'weapon-iron-broadsword',
        name: 'Iron Broadsword',
        description: 'A sturdy blade for a reliable warrior.',
        type: 'IN_GAME',
        rarity: 'COMMON',
        cost: 100,
        currency: 'GOLD',
        acquiredAt: '',
        quantity: 1,
        slots: ['WEAPON'],
        imageUrl: '/items/iron broadsword.png',
    },
    {
        id: 'weapon-oak-longbow',
        name: 'Oak Longbow',
        description: 'Crafted from the finest ancient oak.',
        type: 'IN_GAME',
        rarity: 'COMMON',
        cost: 150,
        currency: 'GOLD',
        acquiredAt: '',
        quantity: 1,
        slots: ['WEAPON'],
        imageUrl: '/items/oak longbow.png'
    },
    {
        id: 'weapon-battle-axe',
        name: 'Battle Axe',
        description: 'Heavy hitter for heavy problems.',
        type: 'IN_GAME',
        rarity: 'UNCOMMON',
        cost: 250,
        currency: 'GOLD',
        acquiredAt: '',
        quantity: 1,
        slots: ['WEAPON'],
        imageUrl: '/items/battle axe.png',
    },
    {
        id: 'weapon-crystal-staff',
        name: 'Crystal Staff',
        description: 'Channels raw arcane energy.',
        type: 'IN_GAME',
        rarity: 'RARE',
        cost: 500,
        currency: 'GOLD',
        acquiredAt: '',
        quantity: 1,
        slots: ['WEAPON'],
        imageUrl: '/items/crystal staff.png',
    },
    {
        id: 'weapon-rogues-dagger',
        name: "Rogue's Dagger",
        description: 'Swift and silent.',
        type: 'IN_GAME',
        rarity: 'UNCOMMON',
        cost: 200,
        currency: 'GOLD',
        acquiredAt: '',
        quantity: 1,
        slots: ['WEAPON'],
        imageUrl: "/items/rogue's dagger.png",
    },
    */
];

export const NEW_COMPANIONS: InventoryItem[] = [
    // Timber Wolf Removed
    // Actually the user provided distinct filenames check list in Step 24.
    // data serpent, digital ghost, floating grimoire, medic drone, pebble golem, phoenix hatchling.
    {
        id: 'companion-data-serpent',
        name: 'Data Serpent',
        description: 'Slithering through the code.',
        type: 'COMPANION',
        rarity: 'EPIC',
        cost: 0,
        premiumPrice: GEM_COST.STANDARD,
        currency: 'GOLD',
        acquiredAt: '',
        quantity: 1,
        imageUrl: '/companions/data serpent companion.png'
    },
    {
        id: 'companion-digital-ghost',
        name: 'Digital Ghost',
        description: 'A friendly specter from the machine.',
        type: 'COMPANION',
        rarity: 'EPIC',
        cost: 0,
        premiumPrice: GEM_COST.STANDARD,
        currency: 'GOLD',
        acquiredAt: '',
        quantity: 1,
        imageUrl: '/companions/digital ghost companion.png'
    },
    {
        id: 'companion-floating-grimoire',
        name: 'Floating Grimoire',
        description: 'Knowledge that follows you.',
        type: 'COMPANION',
        rarity: 'RARE',
        cost: 0,
        premiumPrice: GEM_COST.STANDARD,
        currency: 'GOLD',
        acquiredAt: '',
        quantity: 1,
        imageUrl: '/companions/floating grimoire companion.png'
    },
    {
        id: 'companion-medic-drone',
        name: 'Medic Drone',
        description: 'Always there to patch you up.',
        type: 'COMPANION',
        rarity: 'RARE',
        cost: 0,
        premiumPrice: GEM_COST.STANDARD,
        currency: 'GOLD',
        acquiredAt: '',
        quantity: 1,
        imageUrl: '/companions/medic drone companion.png'
    },
    {
        id: 'companion-pebble-golem',
        name: 'Pebble Golem',
        description: 'Small, sturdy, and rock solid.',
        type: 'COMPANION',
        rarity: 'UNCOMMON',
        cost: 0,
        premiumPrice: GEM_COST.BASIC,
        currency: 'GOLD',
        acquiredAt: '',
        quantity: 1,
        imageUrl: '/companions/pebble golem companion.png'
    },
    {
        id: 'companion-phoenix-hatchling',
        name: 'Phoenix Hatchling',
        description: 'A tiny spark of eternal life.',
        type: 'COMPANION',
        rarity: 'LEGENDARY',
        cost: 0,
        premiumPrice: GEM_COST.PREMIUM,
        currency: 'GOLD',
        acquiredAt: '',
        quantity: 1,
        imageUrl: '/companions/phoenix hatchling companion.png'
    },
    {
        id: 'companion-holo-drone',
        name: 'Holo-Drone',
        description: 'A loyal companion that hovers nearby.',
        type: 'COMPANION',
        rarity: 'RARE',
        cost: 0,
        premiumPrice: GEM_COST.BASIC,
        currency: 'GOLD',
        acquiredAt: '',
        quantity: 1,
        imageUrl: '/companions/holo drone companion.png',
        flavor: 'Beep boop.'
    },
    {
        id: 'companion-void-whisp',
        name: 'Void Whisp',
        description: 'A fragmented soul from the void.',
        type: 'COMPANION',
        rarity: 'MYSTIC',
        cost: 0,
        premiumPrice: GEM_COST.PREMIUM,
        currency: 'GOLD',
        acquiredAt: '',
        quantity: 1,
        imageUrl: '/companions/void whisp companion.png',
        flavor: 'It hums with unknown energy.'
    },
    {
        id: 'a_seraph_wings',
        name: 'Seraph Wings',
        description: 'Wings of pure light.',
        type: 'BLACK_MARKET',
        rarity: 'LEGENDARY',
        cost: 3000,
        premiumPrice: GEM_COST.PREMIUM,
        currency: 'GOLD',
        acquiredAt: '',
        quantity: 1,
        slots: ['ARMOR'],
        imageUrl: '/items/seraph_wings.png',
        flavor: 'Ascend.'
    },
    /*
    {
        id: 'w_photon_blaster',
        name: 'Photon Blaster',
        description: 'High-energy particle accelerator.',
        type: 'IN_GAME',
        rarity: 'RARE',
        cost: 1200,
        currency: 'GOLD',
        acquiredAt: '',
        quantity: 1,
        slots: ['WEAPON'],
        imageUrl: '/items/photon_blaster.png',
    },
    {
        id: 'w_gnarled_red_staff',
        name: 'Gnarled Red Staff',
        description: 'Corrupted by ancient magic.',
        type: 'IN_GAME',
        rarity: 'LEGENDARY',
        cost: 2500,
        currency: 'GOLD',
        acquiredAt: '',
        quantity: 1,
        slots: ['WEAPON'],
        imageUrl: '/items/gnarled_red_staff.png',
    }
    */
];

export const STARTER_AVATARS: InventoryItem[] = [
    {
        id: 'starter_elf_male',
        name: 'Elven Ranger',
        description: 'A scout from the woodlands.',
        type: 'AVATAR',
        rarity: 'COMMON',
        cost: 0,
        imageUrl: '/avatars/starters/starter_elf_male.png',
        quantity: 1,
        currency: 'GOLD',
        acquiredAt: new Date().toISOString()
    },
    {
        id: 'starter_elf_female',
        name: 'Elven Archer',
        description: 'A sharp-eyed guardian.',
        type: 'AVATAR',
        rarity: 'COMMON',
        cost: 0,
        imageUrl: '/avatars/starters/starter_elf_female.png',
        quantity: 1,
        currency: 'GOLD',
        acquiredAt: new Date().toISOString()
    },
    {
        id: 'starter_villager_male',
        name: 'Villager (Male)',
        description: 'A humble beginning.',
        type: 'AVATAR',
        rarity: 'COMMON',
        cost: 0,
        imageUrl: '/avatars/starters/starter_villager_male.png',
        quantity: 1,
        currency: 'GOLD',
        acquiredAt: new Date().toISOString()
    },
    {
        id: 'starter_villager_female',
        name: 'Villager (Female)',
        description: 'A humble beginning.',
        type: 'AVATAR',
        rarity: 'COMMON',
        cost: 0,
        imageUrl: '/avatars/starters/starter_villager_female.png',
        quantity: 1,
        currency: 'GOLD',
        acquiredAt: new Date().toISOString()
    }
];

export const ALL_COSMETIC_ITEMS = [...COSMETIC_SHOP_ITEMS, ...NEW_WEAPONS, ...NEW_COMPANIONS, ...STARTER_AVATARS];
