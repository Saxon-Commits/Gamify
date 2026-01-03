import { InventoryItem } from '../../types';

// Pricing Tiers (Gems)
// 100 Gems ≈ $1.00
const GEM_COST = {
    BASIC: 500,    // $5
    STANDARD: 1000, // $10
    PREMIUM: 2000, // $20
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
        imageUrl: '/assets/avatars/cyber_knight/base.png',
        perks: { xpModifier: 0.1, energyMaxBonus: 20 }
    },
    {
        id: 'avatar-ethereal-mage',
        name: 'Ethereal Mage',
        description: 'Weave the void itself.',
        lore: 'Touched by the void, this form drifts between realities.',
        type: 'AVATAR',
        rarity: 'MYSTIC',
        cost: 0,
        premiumPrice: GEM_COST.PREMIUM,
        currency: 'GOLD',
        acquiredAt: '',
        quantity: 1,
        imageUrl: '/assets/avatars/ethereal-mage.png',
        perks: { intellect: 5, voidShards: 1 }
    },
    {
        id: 'avatar-golden-king',
        name: 'Midas Touch',
        description: 'Everything you touch turns to gold.',
        lore: 'The ultimate symbol of wealth and discipline.',
        type: 'AVATAR',
        rarity: 'LEGENDARY',
        cost: 0,
        premiumPrice: GEM_COST.LEGENDARY,
        currency: 'GOLD',
        acquiredAt: '',
        quantity: 1,
        imageUrl: '/assets/avatars/midas.png',
        perks: { goldModifier: 0.5 }
    },

    // --- THEMES (UI Skins) ---
    {
        id: 'theme-matrix',
        name: 'System Override',
        description: 'Green code rain aesthetic.',
        type: 'IN_GAME',
        rarity: 'RARE',
        cost: 0,
        premiumPrice: GEM_COST.BASIC,
        currency: 'GOLD',
        acquiredAt: '',
        quantity: 1,
        imageUrl: '/assets/themes/matrix-preview.png'
    },
    {
        id: 'theme-royal',
        name: 'Royal Decree',
        description: 'Gold and purple luxury UI.',
        type: 'IN_GAME',
        rarity: 'EPIC',
        cost: 0,
        premiumPrice: GEM_COST.STANDARD,
        currency: 'GOLD',
        acquiredAt: '',
        quantity: 1,
        imageUrl: '/assets/themes/royal-preview.png'
    },

    {
        id: 'theme-code-rain',
        name: 'Code Rain',
        description: 'Matrix-style digital rain backdrop.',
        type: 'THEME',
        rarity: 'RARE',
        cost: 0,
        premiumPrice: GEM_COST.STANDARD,
        currency: 'GOLD',
        acquiredAt: '',
        quantity: 1,
        imageUrl: '/assets/themes/code_rain.mp4'
    },

    // --- PETS (Dashboard Companions) ---
    {
        id: 'pet-bit-bot',
        name: 'BitBot 3000',
        description: 'A floating helper drone.',
        type: 'IN_GAME',
        rarity: 'COMMON',
        cost: 0,
        premiumPrice: GEM_COST.BASIC,
        currency: 'GOLD',
        acquiredAt: '',
        quantity: 1,
        imageUrl: '/assets/pets/bitbot.png'
    },
    {
        id: 'pet-void-wisp',
        name: 'Void Wisp',
        description: 'A glowing orb from the abyss.',
        type: 'IN_GAME',
        rarity: 'MYSTIC',
        cost: 0,
        premiumPrice: GEM_COST.PREMIUM,
        currency: 'GOLD',
        acquiredAt: '',
        quantity: 1,
        imageUrl: '/assets/pets/wisp.png'
    }
] as InventoryItem[];
