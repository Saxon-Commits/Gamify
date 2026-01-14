export interface EquipmentOffset {
    top: number; // Percent
    left: number; // Percent
    scale: number; // Multiplier
    rotation: number; // Degrees
    zIndex: number;
}

// Map: ItemID -> AvatarID -> Offset
export const EQUIPMENT_CONFIGS: Record<string, Record<string, EquipmentOffset>> = {
    // Seraph Wings Configuration
    'a_seraph_wings': {
        'grand_wizard': { top: -50, left: -67, scale: 0.38, rotation: 0, zIndex: 5 },
        'starter_elf_male': { top: -49.5, left: -68, scale: 0.38, rotation: 0, zIndex: 5 },
        'starter_elf_female': { top: -49.5, left: -68, scale: 0.38, rotation: 0, zIndex: 5 },
        'starter_villager_male': { top: -49.5, left: -68, scale: 0.38, rotation: 0, zIndex: 5 },
        'starter_villager_female': { top: -47, left: -66.5, scale: 0.36, rotation: 0, zIndex: 5 },
        'hero_cyber_knight': { top: -49.5, left: -64.5, scale: 0.38, rotation: 0, zIndex: 5 },
        'dark_wizard': { top: -51, left: -66.5, scale: 0.38, rotation: 0, zIndex: 5 },
        'benevolent_wizard': { top: -51, left: -66.5, scale: 0.38, rotation: 0, zIndex: 5 },
        'seraph_knight': { top: -53.5, left: -65, scale: 0.43, rotation: 0, zIndex: 5 },
        'warlord': { top: -51, left: -66.5, scale: 0.38, rotation: 0, zIndex: 5 },
        'geisha_android': { top: -48, left: -66.5, scale: 0.37, rotation: 0, zIndex: 5 },
        'toxic_alchemist': { top: -54.5, left: -66.5, scale: 0.38, rotation: 0, zIndex: 5 },
        'xv_android': { top: -60, left: -66, scale: 0.38, rotation: 0, zIndex: 5 },
        'avatar_scribe_master': { top: -50.5, left: -66, scale: 0.4, rotation: 0, zIndex: 5 },
        'avatar_master_blacksmith': { top: -59, left: -69.5, scale: 0.41, rotation: 0, zIndex: 5 },
        'avatar_master_bounty_hunter': { top: -50, left: -66, scale: 0.38, rotation: 0, zIndex: 5 },
    }
};
