import React, { useMemo } from 'react';
import { useGameStore } from '../store/useGameStore';
import { Zap, Coins, Award, Shield, Heart, Zap as EnergyIcon, Flame, Brain, CheckCircle2, TrendingUp, Trophy, Activity, Cpu, Sparkles, Crown, Skull, Swords, Sliders, Save, Users, Sword, Ban, Monitor, Hammer, Lock } from 'lucide-react';
import { SHOP_ITEMS } from '../src/utils/GameEconomy';
import { COSMETIC_SHOP_ITEMS, ALL_COSMETIC_ITEMS, STARTER_AVATARS } from '../src/utils/CosmeticsData';


// Helper for Rarity Colors
const getRarityStyles = (rarity: string) => {
    switch (rarity) {
        case 'LEGENDARY': return { border: 'border-amber-500', bg: 'bg-amber-100 dark:bg-[#2e1a0b]', text: 'text-amber-600 dark:text-amber-400', glow: 'from-amber-500/20', badge: 'bg-amber-500 text-black' };
        case 'MYSTIC': return { border: 'border-purple-500', bg: 'bg-purple-100 dark:bg-[#1a0b2e]', text: 'text-purple-600 dark:text-purple-400', glow: 'from-purple-500/20', badge: 'bg-purple-500 text-white' };
        case 'RARE': return { border: 'border-blue-500', bg: 'bg-blue-50 dark:bg-slate-900', text: 'text-blue-600 dark:text-blue-400', glow: 'from-blue-500/20', badge: 'bg-blue-500 text-white' };
        default: return { border: 'border-slate-200 dark:border-slate-700', bg: 'bg-white dark:bg-slate-900', text: 'text-slate-500 dark:text-slate-400', glow: 'from-slate-500/10', badge: 'bg-slate-500 text-white' };
    }
};

const getHeatmapColor = (xp: number) => {
    if (xp === 0) return 'bg-slate-100 dark:bg-slate-800 border-transparent transition-colors duration-300';
    if (xp < 50) return 'bg-green-200 dark:bg-green-900/50 border-green-300 dark:border-green-900';
    if (xp < 100) return 'bg-green-400 dark:bg-green-500/50 border-green-500 dark:border-green-500';
    return 'bg-green-500 dark:bg-green-400 border-green-600 dark:border-green-300 shadow-[0_0_5px_rgba(74,222,128,0.5)]';
};

const ProgressBar = ({ current, max, color, height = "h-4" }: { current: number, max: number, color: string, height?: string }) => {
    const percentage = Math.min(100, Math.max(0, (current / max) * 100));
    return (
        <div className={`w-full ${height} bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden`}>
            <div
                className={`h-full ${color} transition-all duration-500 relative`}
                style={{ width: `${percentage}%` }}
            >
                {percentage > 0 && (
                    <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]" />
                )}
            </div>
        </div>
    );
};

// Dynamically build Available Avatars from all sources
// 1. Starters (Always available)
// 2. Shop/Premium Avatars (Require Item ID)
const AVAILABLE_AVATARS = [
    // STARTERS
    ...STARTER_AVATARS.map(s => ({
        id: s.id,
        path: s.imageUrl,
        name: s.name,
        requiredItemId: s.id
    })),
    // PREMIUM / SHOP AVATARS
    ...ALL_COSMETIC_ITEMS
        .filter(i => i.type === 'AVATAR' && !STARTER_AVATARS.some(s => s.id === i.id)) // Filter out starters if they are duplicated in ALL_COSMETIC_ITEMS (they are)
        .map(i => ({
            id: i.id,
            path: i.imageUrl || '',
            name: i.name,
            requiredItemId: i.id
        }))
];

const MASTERY_AVATARS = [
    { id: 'avatar_scribe_master', path: '/assets/skill_tree_avatars/scribe_master.png' },
    { id: 'avatar_master_blacksmith', path: '/assets/skill_tree_avatars/master_blacksmith.png' },
    { id: 'avatar_master_bounty_hunter', path: '/assets/skill_tree_avatars/master_bounty_hunter.png' }
];

export const Character: React.FC = () => {
    const { stats, tasks, activityLog, skillNodes, inventory, setAvatar, setBackdrop } = useGameStore();
    const totalCompleted = tasks.filter(t => t.completed).length;

    // State for local preview
    // Initialize based on saved activeAvatarId if available
    const initialAvatarPath = React.useMemo(() => {
        const savedId = stats.activeAvatarId;
        // Fallback to Grand Wizard if no ID or previous base ID
        if (!savedId || savedId === 'base') return AVAILABLE_AVATARS[0].path;

        const found = AVAILABLE_AVATARS.find(a => a.requiredItemId === savedId);
        if (found) return found.path;

        const mastery = MASTERY_AVATARS.find(m => m.id === savedId);
        return mastery ? mastery.path : AVAILABLE_AVATARS[0].path;
    }, [stats.activeAvatarId]);

    const [selectedAvatar, setSelectedAvatar] = React.useState(initialAvatarPath);
    const [isHoodOff, setIsHoodOff] = React.useState(false);

    // --- DEV CONTROLS STATE ---
    const [devPanelOpen, setDevPanelOpen] = React.useState(false);
    const [devEditMode, setDevEditMode] = React.useState<'backdrop' | 'avatar' | 'companion'>('backdrop'); // Which element to edit
    const [devCompanionTop, setDevCompanionTop] = React.useState(50);
    const [devCompanionRight, setDevCompanionRight] = React.useState(60);
    const [devCompanionScale, setDevCompanionScale] = React.useState(1.0);
    const [devCompanionRotation, setDevCompanionRotation] = React.useState(0);
    const [devAvatarScale, setDevAvatarScale] = React.useState(95); // Height percentage
    const [devAvatarOffsetX, setDevAvatarOffsetX] = React.useState(0);
    const [devAvatarOffsetY, setDevAvatarOffsetY] = React.useState(0);
    // Backdrop controls
    const [devBackdropScale, setDevBackdropScale] = React.useState(100); // Zoom percentage
    const [devBackdropOffsetX, setDevBackdropOffsetX] = React.useState(0);
    const [devBackdropOffsetY, setDevBackdropOffsetY] = React.useState(0);

    // Determines the ID based on the selected path
    const getAvatarIdFromPath = (path: string) => {
        const found = AVAILABLE_AVATARS.find(a => a.path === path);
        if (found) return found.requiredItemId || AVAILABLE_AVATARS[0].requiredItemId;

        const mastery = MASTERY_AVATARS.find(m => m.path === path);
        return mastery ? mastery.id : AVAILABLE_AVATARS[0].requiredItemId;
    };

    const currentAvatarId = getAvatarIdFromPath(selectedAvatar);

    // Get Active Equipment
    const equippedWeaponId = stats.activeMainHandId;
    const equippedArmorId = stats.activeArmorId;
    const equippedAccessoryId = stats.activeAccessoryId;

    // Active Backdrop
    const activeBackdropItem = useMemo(() => {
        if (!stats.activeBackdropId) return null;
        return COSMETIC_SHOP_ITEMS.find(i => i.id === stats.activeBackdropId);
    }, [stats.activeBackdropId]);

    // SPECIAL COMBOS REGISTRY
    // Keys are constructed: `${avatarId}_${weaponId}_${armorId}_${accessoryId}` (or subsets)
    const SPECIAL_COMBOS: Record<string, string> = {
        // --- BASE & CLOAK ---
        'grand_wizard_a_void_cloak': '/assets/avatars/grand_wizard/grand_wizard_a_void_cloak.png',

        // --- MOLTEN SWORD ---
        'grand_wizard_w_molten_sword_a_void_cloak': '/assets/avatars/grand_wizard/grand_wizard_w_molten_sword_a_void_cloak.png',
        'grand_wizard_w_molten_sword_a_void_cloak_acc_holo_drone': '/assets/avatars/grand_wizard/grand_wizard_w_molten_sword_a_void_cloak_acc_holo_drone.png',

        // --- CURSED STAFF ---
        'grand_wizard_w_cursed_staff_a_void_cloak': '/assets/avatars/grand_wizard/grand_wizard_w_cursed_staff_a_void_cloak.png', // RESTORED using Hood On version
        'grand_wizard_w_cursed_staff_a_void_cloak_acc_holo_drone': '/assets/avatars/grand_wizard/grand_wizard_w_cursed_staff_a_void_cloak_acc_holo_drone.png',

        // --- DATA GAUNTLET ---
        'grand_wizard_w_data_gauntlet_a_void_cloak': '/assets/avatars/grand_wizard/grand_wizard_w_data_gauntlet_a_void_cloak.png',
        'grand_wizard_w_data_gauntlet_a_void_cloak_acc_holo_drone': '/assets/avatars/grand_wizard/grand_wizard_w_data_gauntlet_a_void_cloak_acc_holo_drone.png',

        // --- NEURAL DAGGER ---
        'grand_wizard_w_neural_dagger_a_void_cloak': '/assets/avatars/grand_wizard/grand_wizard_w_neural_dagger_a_void_cloak.png',
        'grand_wizard_w_neural_dagger_a_void_cloak_acc_holo_drone': '/assets/avatars/grand_wizard/grand_wizard_w_neural_dagger_a_void_cloak_acc_holo_drone.png',

        // --- PHOTON BLASTER ---
        'grand_wizard_w_photon_blaster_a_void_cloak': '/assets/avatars/grand_wizard/grand_wizard_w_photon_blaster_a_void_cloak.png',
        'grand_wizard_w_photon_blaster_a_void_cloak_acc_holo_drone': '/assets/avatars/grand_wizard/grand_wizard_w_photon_blaster_a_void_cloak_acc_holo_drone.png',

        // --- THUNDER HAMMER ---
        'grand_wizard_w_thunder_hammer_a_void_cloak': '/assets/avatars/grand_wizard/grand_wizard_w_thunder_hammer_a_void_cloak.png',
        'grand_wizard_w_thunder_hammer_a_void_cloak_acc_holo_drone': '/assets/avatars/grand_wizard/grand_wizard_w_thunder_hammer_a_void_cloak_acc_holo_drone.png',
    };

    // Helper to get ID from path for signature
    const availableAvatarId = (path: string) => {
        // Special case for the new folder structure
        if (path.includes('grand_wizard')) return 'grand_wizard';
        if (path.includes('cyber_knight')) return 'hero_cyber_knight';

        if (path.includes('grand_wizard')) return 'grand_wizard';
        if (path.includes('cyber_knight')) return 'hero_cyber_knight';

        if (path.includes('grand_wizard')) return 'grand_wizard';
        if (path.includes('cyber_knight')) return 'hero_cyber_knight';

        const found = AVAILABLE_AVATARS.find(a => a.path === path);
        if (found) return found.id;

        const mastery = MASTERY_AVATARS.find(a => a.path === path);
        return mastery ? mastery.id : AVAILABLE_AVATARS[0].requiredItemId || 'grand_wizard';
    };

    const getCompositePath = () => {
        const avatar = availableAvatarId(selectedAvatar);

        // --- MASTERY AVATARS (Static Images) ---
        if (avatar === 'avatar_scribe_master') return '/assets/skill_tree_avatars/scribe_master.png';
        if (avatar === 'avatar_master_blacksmith') return '/assets/skill_tree_avatars/master_blacksmith.png';
        if (avatar === 'avatar_master_bounty_hunter') return '/assets/skill_tree_avatars/master_bounty_hunter.png';

        // --- CYBER KNIGHT DYNAMIC LOGIC ---
        if (avatar === 'hero_cyber_knight') {
            const base = '/assets/avatars/cyber_knight/base.png';
            if (!equippedArmorId) return base; // Armor is required for composites in this set

            if (!equippedWeaponId) {
                // Armor Only
                return `/assets/avatars/cyber_knight/composite/${equippedArmorId}.png`;
            } else {
                // Armor + Weapon
                return `/assets/avatars/cyber_knight/composite/${equippedArmorId}_${equippedWeaponId}.png`;
            }
        }

        const hoodSuffix = isHoodOff ? '_hood_off' : '';

        // 1. Full House: Avatar + Weapon + Armor + Accessory
        if (SPECIAL_COMBOS[`${avatar}_${equippedWeaponId}_${equippedArmorId}_${equippedAccessoryId}${hoodSuffix}`])
            return SPECIAL_COMBOS[`${avatar}_${equippedWeaponId}_${equippedArmorId}_${equippedAccessoryId}${hoodSuffix}`];

        // 2. Avatar + Armor + Accessory
        if (SPECIAL_COMBOS[`${avatar}_${equippedArmorId}_${equippedAccessoryId}${hoodSuffix}`])
            return SPECIAL_COMBOS[`${avatar}_${equippedArmorId}_${equippedAccessoryId}${hoodSuffix}`];

        // 3. Avatar + Weapon + Armor
        if (SPECIAL_COMBOS[`${avatar}_${equippedWeaponId}_${equippedArmorId}${hoodSuffix}`])
            return SPECIAL_COMBOS[`${avatar}_${equippedWeaponId}_${equippedArmorId}${hoodSuffix}`];

        // 4. Avatar + Armor
        if (SPECIAL_COMBOS[`${avatar}_${equippedArmorId}${hoodSuffix}`])
            return SPECIAL_COMBOS[`${avatar}_${equippedArmorId}${hoodSuffix}`];

        // 5. Avatar + Weapon (New General Combo Logic)
        if (equippedWeaponId) {
            const comboKey = `${avatar}_${equippedWeaponId}`;
            if (SPECIAL_COMBOS[comboKey]) return SPECIAL_COMBOS[comboKey];
        }

        // 6. Generic Avatar Resolution
        // Check Mastery again (Safety)
        const mastery = MASTERY_AVATARS.find(m => m.id === currentAvatarId);
        if (mastery) return mastery.path;

        // Check Available List
        const found = AVAILABLE_AVATARS.find(a => a.requiredItemId === currentAvatarId);
        if (found) return found.path;

        // Fallback for new Premium Avatars sourced from ALL_COSMETIC_ITEMS
        const cosmetic = ALL_COSMETIC_ITEMS.find(i => i.id === currentAvatarId && i.type === 'AVATAR');
        if (cosmetic && cosmetic.imageUrl) return cosmetic.imageUrl;

        return AVAILABLE_AVATARS[0].path;
    };

    // Update local state if persistent stats change (e.g. on reload)
    React.useEffect(() => {
        if (stats.activeAvatarId) {
            const found = AVAILABLE_AVATARS.find(a => a.requiredItemId === stats.activeAvatarId);
            if (found) {
                setSelectedAvatar(found.path);
            } else {
                const mastery = MASTERY_AVATARS.find(m => m.id === stats.activeAvatarId);
                if (mastery) {
                    setSelectedAvatar(mastery.path);
                } else if (stats.activeAvatarId === 'base') {
                    // Redirect legacy base to new default (Grand Wizard)
                    setSelectedAvatar(AVAILABLE_AVATARS[0].path);
                }
            }
        }
    }, [stats.activeAvatarId]);

    // Reset Hood Toggle when avatar changes
    React.useEffect(() => {
        setIsHoodOff(false);
    }, [selectedAvatar]);






    // Helpers
    // Updated Helpers to support new ID schemas and types
    const isArmor = (item: any) => item.slots?.length ? item.slots.includes('ARMOR') : item.id.startsWith('a_');
    const isWeapon = (item: any) => item.slots?.length ? item.slots.includes('WEAPON') : (item.id.startsWith('w_') || item.id.startsWith('weapon-'));
    const isAccessory = (item: any) => item.slots?.length ? item.slots.includes('ACCESSORY') : (item.id.startsWith('acc_') || item.type === 'COMPANION' || item.id.startsWith('companion-'));

    // Combined Item Registry
    const ALL_ITEMS = useMemo(() => {
        // Dedup by ID
        const map = new Map();
        [...SHOP_ITEMS, ...ALL_COSMETIC_ITEMS].forEach(i => map.set(i.id, i));
        return Array.from(map.values());
    }, []);

    // Avatar Logic
    const avatarConfig = useMemo(() => {
        // Default to empty array if skillNodes is undefined
        const nodes = skillNodes || [];
        const unlockedNodes = nodes.filter(n => n.data && n.data.isUnlocked);
        const titanCount = unlockedNodes.filter(n => n.data && n.data.path === 'titan').length;
        const technoCount = unlockedNodes.filter(n => n.data && n.data.path === 'technomancer').length;

        if (titanCount > technoCount && titanCount >= 1) return { icon: '🛡️', overlay: <Shield className="absolute -top-2 -right-2 text-amber-500 bg-white dark:bg-slate-900 rounded-full p-1 shadow-sm" size={32} fill="currentColor" />, title: 'Titan' };
        if (technoCount > titanCount && technoCount >= 1) return { icon: '🤖', overlay: <Cpu className="absolute -top-2 -right-2 text-cyan-400 bg-white dark:bg-slate-900 rounded-full p-1 shadow-sm" size={32} />, title: 'Technomancer' };
        return { icon: '🧙‍♂️', overlay: null, title: 'Novice' };
    }, [skillNodes]);

    // Heatmap Logic
    const heatmapData = useMemo(() => {
        const days = [];
        const today = new Date();
        // Generate last 12 weeks (approx 84 days)
        for (let i = 83; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const log = (activityLog || []).find(l => l.date === dateStr);
            days.push({ date: dateStr, xp: log ? log.xp : 0 });
        }
        return days;
    }, [activityLog]);



    // --- RARITY & SLOT LOGIC ---
    // Get the full ShopItem object for the currently ACTIVE or SELECTED avatar
    // If we want to show stats for SELECTED, use `selectedAvatar`. If ACTIVE, use `stats.activeAvatarId`.
    // The requirement implies showing info for the equipped/selected avatar.
    // Let's assume we show info for the *Selected* avatar in the card, but `stats` reflect active.

    const selectedShopItem = useMemo(() => {
        const avatarDef = AVAILABLE_AVATARS.find(a => a.path === selectedAvatar);

        // Base Hero Stats
        if (!avatarDef || avatarDef.id === 'base') {
            return {
                name: 'Ben - The Pathfinder',
                rarity: 'COMMON',
                lore: 'A persistent developer starting their journey. Fueled by caffeine and curiosity.',
                description: 'The default reliable hero.',
                perks: { xpModifier: 0.05 }, // 5% XP Boost
                slots: ['WEAPON', 'ARMOR', 'ACCESSORY'] // Base now supports all slots
            };
        }

        return [...SHOP_ITEMS, ...ALL_COSMETIC_ITEMS].find(i => i.id === avatarDef.requiredItemId);
    }, [selectedAvatar]);

    const currentRarity = (selectedShopItem as any)?.rarity || 'COMMON';
    const currentSlots = (selectedShopItem as any)?.slots || [];
    const rarityStyle = getRarityStyles(currentRarity);

    // Filter selectors based on slots
    // Starters can equip companions (accessories) even without explicit ACCESSORY slot
    const isStarterAvatar = STARTER_AVATARS.some(s => s.id === currentAvatarId);
    const canEquipWeapon = currentSlots.includes('WEAPON');
    const canEquipArmor = currentSlots.includes('ARMOR');
    const canEquipAccessory = currentSlots.includes('ACCESSORY') || isStarterAvatar;


    // --- PERK AGGREGATION ---
    const aggregatedPerks = useMemo(() => {
        let xp = 0;
        let gold = 0;
        let luck = 0;
        let energy = 0;
        let discount = 0;

        const processItem = (itemId: string | undefined | null) => {
            if (!itemId) return;
            // Handle 'base' avatar specially if it has perks (it serves as an item)
            if (itemId === 'base') {
                const base = AVAILABLE_AVATARS.find(a => a.id === 'base');
                // Base definition logic duplicate from selectedShopItem logic or look up in SHOP_ITEMS if mapped
                // The SHOP_ITEMS logic handles 'base' id -> 'hero_base' item? No. 
                // Let's assume 'base' has basic perks or defined in SHOP_ITEMS?
                // Looking at SHOP_ITEMS in useGameStore logic... it's often imported.
                // Assuming SHOP_ITEMS contains all items including avatars.
            }
            const item = SHOP_ITEMS.find(i => i.id === itemId || (itemId === 'base' && i.id === 'base_hero'));

            if (item && item.perks) {
                if (item.perks.xpModifier) xp += item.perks.xpModifier;
                if (item.perks.goldModifier) gold += item.perks.goldModifier;
                if (item.perks.luckModifier) luck += item.perks.luckModifier;
                if ((item.perks as any).energyMaxBonus) energy += (item.perks as any).energyMaxBonus;
                if (item.perks.shopDiscount) discount += item.perks.shopDiscount;
            }
        };

        // Active Avatar
        processItem(stats.activeAvatarId);
        // Active Gear
        processItem(stats.activeMainHandId);
        processItem(stats.activeArmorId);
        processItem(stats.activeAccessoryId);

        return { xp, gold, luck, energy, discount };
    }, [stats.activeAvatarId, stats.activeMainHandId, stats.activeArmorId, stats.activeAccessoryId]);

    // Mastery Badges (Apex Nodes)
    const masteryBadges = useMemo(() => {
        if (!skillNodes) return [];
        return skillNodes.filter(n => n.data.type === 'apex');
    }, [skillNodes]);

    const activeAccessoryItem = useMemo(() => {
        return ALL_ITEMS.find(i => i.id === equippedAccessoryId);
    }, [equippedAccessoryId, ALL_ITEMS]);



    return (
        <div className="max-w-[1600px] mx-auto pb-32 space-y-8 px-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* COLUMN 1: DETAILS PANEL (Left) */}
                <div className="lg:col-span-3 space-y-6 lg:sticky lg:top-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-6">
                        {/* Header */}
                        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-4">
                            <Activity size={20} className="text-slate-400" />
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wider">Attributes</h3>
                        </div>

                        {/* Level & XP */}
                        <div className="relative bg-gradient-to-br from-slate-100 via-white to-amber-50 dark:from-slate-900 dark:via-slate-900 dark:to-amber-950/20 rounded-xl p-4 border border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.05)] space-y-2 overflow-hidden">
                            {/* Corner Glow Accent */}
                            <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/10 blur-xl rounded-full -mr-8 -mt-8 pointer-events-none" />
                            <div className="flex justify-between items-end">
                                <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">XP</div>
                                <div className="text-xs text-slate-500 font-mono">
                                    <span className="text-slate-900 dark:text-white font-bold">{stats.xp}</span> / {stats.xpToNext} XP
                                </div>
                            </div>
                            <ProgressBar current={stats.xp} max={stats.xpToNext} color="bg-gradient-to-r from-amber-700 via-amber-500 to-yellow-400" height="h-3" />
                            <div className="flex justify-between items-center pt-2">
                                <div className="flex items-center gap-2">
                                    <div className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded">LVL {stats.level}</div>
                                </div>
                                <div className="text-[10px] text-slate-500">{(((stats.xp / stats.xpToNext) * 100) || 0).toFixed(0)}%</div>
                            </div>
                        </div>

                        {/* Hitpoints */}
                        <div>

                            <div className="flex gap-1">
                                {Array.from({ length: 7 }).map((_, i) => (
                                    <Heart key={i} size={24} className="text-red-500 fill-red-500/20" strokeWidth={2.5} />
                                ))}
                            </div>
                        </div>

                        {/* Aggregated Perks */}
                        <div className="space-y-3">

                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg p-3 flex flex-col gap-1 items-start">
                                    <div className="text-[10px] text-slate-500 uppercase">XP Gain</div>
                                    <div className="text-lg font-bold text-green-600 dark:text-green-400 flex items-center gap-1">
                                        <TrendingUp size={16} /> +{(aggregatedPerks.xp * 100).toFixed(0)}%
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg p-3 flex flex-col gap-1 items-start">
                                    <div className="text-[10px] text-slate-500 uppercase">Gold Found</div>
                                    <div className="text-lg font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                                        <Coins size={16} /> +{(aggregatedPerks.gold * 100).toFixed(0)}%
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg p-3 flex flex-col gap-1 items-start">
                                    <div className="text-[10px] text-slate-500 uppercase">Luck</div>
                                    <div className="text-lg font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1">
                                        <Sparkles size={16} /> +{(aggregatedPerks.luck * 100).toFixed(0)}%
                                    </div>
                                </div>
                                {(aggregatedPerks.energy > 0) && (
                                    <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg p-3 flex flex-col gap-1 items-start">
                                        <div className="text-[10px] text-slate-500 uppercase">Max Energy</div>
                                        <div className="text-lg font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                                            <Zap size={16} /> +{aggregatedPerks.energy}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Mastery Badges */}
                        <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold flex items-center gap-2">
                                <Award size={14} /> Mastery Badges
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {masteryBadges.map(node => (
                                    <div key={node.id} className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center relative group ${node.data.isUnlocked ? 'bg-amber-100 dark:bg-amber-900/20 border-amber-500/50 text-amber-600 dark:text-amber-400' : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600 grayscale opacity-50'}`}>
                                        {/* Icon rendering basic placeholder based on node type if needed, or just specific badge icon */}
                                        <Trophy size={20} />

                                        {/* Tooltip */}
                                        <div className="absolute bottom-full mb-2 w-32 bg-white dark:bg-slate-950/90 text-center p-2 rounded text-[10px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-slate-200 dark:border-slate-700 z-50">
                                            <div className="font-bold text-slate-900 dark:text-white mb-0.5">{node.data.label}</div>
                                            <div className="text-slate-500 dark:text-slate-400">{node.data.isUnlocked ? 'Mastered' : 'Locked'}</div>
                                        </div>
                                    </div>
                                ))}
                                {masteryBadges.length === 0 && (
                                    <div className="text-xs text-slate-600 italic">No mastery nodes found.</div>
                                )}
                            </div>
                        </div>

                    </div>

                    {/* MASTERY AVATARS SELECTOR */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4">
                        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                            <Crown size={20} className="text-amber-500" />
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wider">Mastery Avatars</h3>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { id: 'avatar_scribe_master', label: 'Scribe', icon: <Crown size={16} />, img: '/assets/skill_tree_avatars/scribe_master.png' },
                                { id: 'avatar_master_blacksmith', label: 'Smith', icon: <Hammer size={16} />, img: '/assets/skill_tree_avatars/master_blacksmith.png' },
                                { id: 'avatar_master_bounty_hunter', label: 'Hunter', icon: <Skull size={16} />, img: '/assets/skill_tree_avatars/master_bounty_hunter.png' }
                            ].map((avatar) => {
                                const isUnlocked = inventory.some(i => i.id === avatar.id);
                                const isActive = stats.activeAvatarId === avatar.id;

                                return (
                                    <button
                                        key={avatar.id}
                                        disabled={!isUnlocked}
                                        onClick={() => setAvatar(avatar.id)}
                                        className={`relative group flex flex-col items-center p-2 rounded-xl border-2 transition-all ${isActive
                                            ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                                            : isUnlocked
                                                ? 'border-slate-200 dark:border-slate-700 hover:border-indigo-400 hover:scale-105 bg-slate-50 dark:bg-slate-800'
                                                : 'border-slate-100 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 opacity-50 cursor-not-allowed grayscale'
                                            }`}
                                    >
                                        {/* Image / Icon */}
                                        <div className="w-12 h-12 mb-2 relative flex items-center justify-center">
                                            {isUnlocked ? (
                                                <img src={avatar.img} alt={avatar.label} className="w-full h-full object-contain pixelated" />
                                            ) : (
                                                <div className="text-slate-300 dark:text-slate-600">
                                                    {avatar.icon}
                                                </div>
                                            )}

                                            {/* Lock Icon Overlay */}
                                            {!isUnlocked && (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <Lock size={12} className="text-slate-400" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="text-[10px] font-bold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                                            {avatar.label}
                                        </div>

                                        {isActive && (
                                            <div className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full shadow-lg ring-2 ring-white dark:ring-slate-900" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* COLUMN 2: AVATAR DISPLAY (Center) */}
                <div className="lg:col-span-6 flex flex-col items-center">

                    {/* THE CARD */}
                    <div className={`w-full max-w-[440px] bg-white dark:bg-slate-900 border-4 ${rarityStyle.border} rounded-3xl relative shadow-2xl transition-all duration-500 group`}>

                        {/* Card Header */}
                        <div className={`absolute top-0 inset-x-0 h-24 bg-gradient-to-b ${rarityStyle.glow} to-transparent opacity-50 z-0`}></div>
                        <div className="relative z-10 p-6 flex justify-between items-start">
                            <div>
                                <h2 className={`text-2xl font-black uppercase tracking-wider ${rarityStyle.text} drop-shadow-md`}>
                                    {selectedShopItem?.name || 'Ben - The Pathfinder'}
                                </h2>
                                <div className="flex gap-2">
                                    <div className={`inline-block px-3 py-1 mt-1 text-[10px] font-bold tracking-[0.2em] rounded-full uppercase ${rarityStyle.badge}`}>
                                        {currentRarity} Avatar
                                    </div>
                                    {/* Hood Toggle (Only for Grand Wizard + Void Cloak) */}
                                    {currentAvatarId === 'grand_wizard' && equippedArmorId === 'a_void_cloak' && (
                                        <button
                                            onClick={() => setIsHoodOff(!isHoodOff)}
                                            className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-white text-[10px] uppercase font-bold px-2 py-1 rounded-full transition-colors flex items-center gap-1"
                                        >
                                            <Sliders size={10} /> Hood: {isHoodOff ? 'OFF' : 'ON'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Main Image */}
                        <div
                            className="relative w-full h-[440px] z-10 -mt-4 bg-white dark:bg-slate-900 overflow-hidden"
                        >
                            {/* BACKDROP LAYER */}
                            {(() => {
                                // Backdrop position/scale configs (use dev controls to tune, then paste here)
                                const BACKDROP_CONFIGS: Record<string, { scale: number, offsetX: number, offsetY: number }> = {
                                    'theme-apocalyptic-ruins': { scale: 142, offsetX: 0, offsetY: -67 },
                                    'theme-crystal-cavern': { scale: 116, offsetX: 0, offsetY: -32 },
                                    'theme-digital-city': { scale: 125, offsetX: 29, offsetY: -45 },
                                    'theme-frozen-tundra': { scale: 100, offsetX: 0, offsetY: 0 },
                                    'theme-mushroom-grove': { scale: 98, offsetX: 0, offsetY: 25 },
                                    'theme-ocean-depths': { scale: 100, offsetX: 0, offsetY: 0 },
                                    'theme-sakura-temple': { scale: 100, offsetX: 0, offsetY: 0 },
                                    'theme-space-station': { scale: 100, offsetX: 0, offsetY: 0 },
                                    'theme-sunset-mountain': { scale: 117, offsetX: 0, offsetY: 12 },
                                    'theme-volcanic-hellscape': { scale: 105, offsetX: 0, offsetY: 7 },
                                    'theme-wizards-library': { scale: 118, offsetX: 5, offsetY: 15 },
                                };

                                const backdropId = activeBackdropItem?.id;
                                const savedConfig = backdropId ? BACKDROP_CONFIGS[backdropId] : null;
                                const useDevValues = devPanelOpen && devEditMode === 'backdrop';

                                // Use dev values OR saved config OR defaults
                                const scale = useDevValues ? devBackdropScale : (savedConfig?.scale ?? 100);
                                const offsetX = useDevValues ? devBackdropOffsetX : (savedConfig?.offsetX ?? 0);
                                const offsetY = useDevValues ? devBackdropOffsetY : (savedConfig?.offsetY ?? 0);

                                const backdropStyle = (scale !== 100 || offsetX !== 0 || offsetY !== 0) ? {
                                    transform: `scale(${scale / 100}) translate(${offsetX}px, ${offsetY}px)`,
                                    transformOrigin: 'center center'
                                } : undefined;

                                if (!activeBackdropItem) {
                                    return (
                                        <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-indigo-950 via-slate-900 to-black" />
                                    );
                                }

                                if (activeBackdropItem.imageUrl.endsWith('.mp4')) {
                                    return (
                                        <video
                                            src={activeBackdropItem.imageUrl}
                                            autoPlay
                                            loop
                                            muted
                                            playsInline
                                            className="absolute inset-0 w-full h-full object-cover opacity-80"
                                            style={backdropStyle}
                                        />
                                    );
                                }

                                return (
                                    <img
                                        src={activeBackdropItem.imageUrl}
                                        className="absolute inset-0 w-full h-full object-cover pixelated"
                                        style={backdropStyle}
                                    />
                                );
                            })()}
                            {/* Grounding Gradient Overlay - Conditional Based on Backdrop */}
                            {(() => {
                                // 1. PIXEL DUNGEON -> No Gradient (Let the art speak)
                                if (activeBackdropItem?.id === 'theme-pixel-dungeon') return null;

                                // 2. CODE RAIN -> Stronger Gradient (Higher contrast for visibility)
                                if (activeBackdropItem?.id === 'theme-code-rain') {
                                    return <div className="absolute bottom-0 inset-x-0 h-64 bg-gradient-to-t from-black via-black/80 to-transparent z-0 pointer-events-none" />;
                                }

                                // 3. DEFAULT (Gradient) -> Standard subtle grounding
                                return <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent z-0 pointer-events-none" />;
                            })()}

                            {/* Avatar - positioned at bottom, scaled to fill nicely */}
                            {(() => {
                                // AVATAR CONFIGURATIONS (Add tuned values here)
                                // Use the dev panel to find values, then paste them here
                                const AVATAR_CONFIGS: Record<string, { height: number, offsetX: number, offsetY: number }> = {
                                    // Starters
                                    'starter_elf_male': { height: 77, offsetX: -4, offsetY: -2 },
                                    'starter_elf_female': { height: 77, offsetX: -4, offsetY: -2 },
                                    'starter_villager_male': { height: 77, offsetX: -4, offsetY: -2 },
                                    'starter_villager_female': { height: 77, offsetX: -4, offsetY: -2 },
                                    // Premium
                                    'grand_wizard': { height: 77, offsetX: 1, offsetY: -16 },
                                    'hero_cyber_knight': { height: 77, offsetX: 5, offsetY: -2 },
                                    'dark_wizard': { height: 77, offsetX: 1, offsetY: -16 },
                                    'benevolent_wizard': { height: 77, offsetX: 1, offsetY: -16 },
                                    'seraph_knight': { height: 77, offsetX: 1, offsetY: -16 },
                                    'warlord': { height: 77, offsetX: 1, offsetY: -2 },
                                    'geisha_android': { height: 77, offsetX: 1, offsetY: -16 },
                                    'xv_android': { height: 77, offsetX: 1, offsetY: -30 },
                                    'toxic_alchemist': { height: 77, offsetX: 1, offsetY: -16 },
                                    // Mastery
                                    'avatar_scribe_master': { height: 77, offsetX: 1, offsetY: -16 },
                                    'avatar_master_blacksmith': { height: 77, offsetX: 1, offsetY: -31 },
                                    'avatar_master_bounty_hunter': { height: 77, offsetX: 11, offsetY: -11 },
                                };

                                const config = AVATAR_CONFIGS[currentAvatarId];

                                // Use dev controls only when panel is open AND in avatar edit mode
                                const useDevValues = devPanelOpen && devEditMode === 'avatar';
                                const height = useDevValues ? devAvatarScale : (config?.height ?? 95);
                                const offsetX = useDevValues ? devAvatarOffsetX : (config?.offsetX ?? 0);
                                const offsetY = useDevValues ? devAvatarOffsetY : (config?.offsetY ?? 0);

                                return (
                                    <img
                                        key={`${selectedAvatar}-${equippedWeaponId}-${equippedArmorId}-${equippedAccessoryId}`}
                                        src={getCompositePath() || selectedAvatar}
                                        className="absolute left-1/2 w-auto object-contain pixelated"
                                        alt="Avatar"
                                        style={{
                                            imageRendering: 'pixelated',
                                            backfaceVisibility: 'hidden',
                                            transform: `translateX(calc(-50% + ${offsetX}px)) translateY(${offsetY}px) translateZ(0)`,
                                            WebkitFontSmoothing: 'none',
                                            height: `${height}%`,
                                            bottom: 0
                                        }}
                                    />
                                );
                            })()}

                            {/* UNIVERSAL COMPANION OVERLAY (For non-composite avatars, excluding Base Hero) */}
                            {/* UNIVERSAL COMPANION OVERLAY */}
                            {activeAccessoryItem && (() => {
                                // FINAL COMPANION CONFIGURATIONS
                                const COMPANION_CONFIGS: Record<string, { top: number, right: number, scale: number, rot: number }> = {
                                    'companion-data-serpent': { top: 68.5, right: 67, scale: 1.05, rot: 1 },
                                    'companion-digital-ghost': { top: 41, right: 63, scale: 1.25, rot: -1 },
                                    'companion-floating-grimoire': { top: 52.5, right: 64.5, scale: 1.05, rot: 20 },
                                    'companion-medic-drone': { top: 38.5, right: 63, scale: 1.40, rot: -1 },
                                    'companion-pebble-golem': { top: 64.5, right: 63.5, scale: 1.30, rot: 1 },
                                    'companion-phoenix-hatchling': { top: 66.5, right: 66, scale: 1.20, rot: 1 },
                                    'companion-holo-drone': { top: 41, right: 63, scale: 1.10, rot: -1 },
                                    'acc_holo_drone': { top: 41, right: 63, scale: 1.10, rot: -1 }, // Alias
                                    'companion-void-whisp': { top: 38.5, right: 63, scale: 1.00, rot: 7 },
                                    'active-protocol-droid': { top: 26, right: 53, scale: 1.2, rot: 0 } // Default for now
                                };

                                const config = COMPANION_CONFIGS[activeAccessoryItem.id];

                                // Use dev controls only when panel is open AND in companion edit mode
                                const useDevValues = devPanelOpen && devEditMode === 'companion';
                                const finalStyle: any = useDevValues ? {
                                    top: `${devCompanionTop}%`,
                                    right: `${devCompanionRight}%`,
                                    transform: `scale(${devCompanionScale}) rotate(${devCompanionRotation}deg)`,
                                    position: 'absolute',
                                    left: 'auto',
                                    zIndex: 20
                                } : config ? {
                                    top: `${config.top}%`,
                                    right: `${config.right}%`,
                                    transform: `scale(${config.scale}) rotate(${config.rot}deg)`,
                                    position: 'absolute',
                                    left: 'auto',
                                    zIndex: 20
                                } : {
                                    // Fallback Position
                                    bottom: '16px',
                                    left: '16px',
                                    position: 'absolute',
                                    zIndex: 20
                                };

                                finalStyle.animationDuration = '4s';

                                // Define Glow Colors (RGB Format)
                                const GLOW_COLORS: Record<string, string> = {
                                    'companion-medic-drone': '239, 68, 68',       // Red
                                    'companion-data-serpent': '34, 197, 94',      // Emerald Green
                                    'companion-digital-ghost': '6, 182, 212',     // Cyan
                                    'companion-floating-grimoire': '168, 85, 247',// Purple
                                    'companion-pebble-golem': '168, 162, 158',    // Stone Grey
                                    'companion-phoenix-hatchling': '249, 115, 22',// Orange
                                    'companion-holo-drone': '59, 130, 246',       // Blue
                                    'acc_holo_drone': '59, 130, 246',             // Blue
                                    'companion-void-whisp': '139, 92, 246',       // Violet
                                    'pet-void-wisp': '139, 92, 246',              // Violet
                                    'active-protocol-droid': '148, 163, 184'      // Slate
                                };

                                const glowColor = GLOW_COLORS[activeAccessoryItem.id] || '255, 255, 255';
                                const animName = `glow-${activeAccessoryItem.id.replace(/[^a-zA-Z0-9-]/g, '')}`;

                                // Boost intensity for specific ethereal companions per user request
                                const isHighIntensity = [
                                    'companion-void-whisp', 'pet-void-wisp',
                                    'companion-digital-ghost',
                                    'companion-holo-drone', 'acc_holo_drone'
                                ].includes(activeAccessoryItem.id);

                                const minOp = isHighIntensity ? 0.6 : 0.5;
                                const maxOp = isHighIntensity ? 1.0 : 0.9;
                                const maxBlur = isHighIntensity ? '14px' : '10px';

                                return (
                                    <div className="absolute transition-all duration-500 hover:scale-110 group/pet w-max" style={finalStyle}>
                                        <style>
                                            {`
                                            @keyframes ${animName} {
                                                0%, 100% { filter: drop-shadow(0 0 2px rgba(${glowColor}, ${minOp})); }
                                                50% { filter: drop-shadow(0 0 ${maxBlur} rgba(${glowColor}, ${maxOp})); }
                                            }
                                            `}
                                        </style>

                                        {/* Bounce Wrapper */}
                                        <div className="relative animate-bounce-slow">
                                            {/* Glow Layer (Behind) */}
                                            <img
                                                src={activeAccessoryItem.imageUrl}
                                                alt=""
                                                aria-hidden="true"
                                                style={{ animation: `${animName} 3s infinite ease-in-out` }}
                                                className="absolute inset-0 w-28 h-28 object-contain pixelated z-0"
                                            />

                                            {/* Main Value Layer (Front) */}
                                            <img
                                                src={activeAccessoryItem.imageUrl}
                                                alt={activeAccessoryItem.name}
                                                className="relative w-28 h-28 object-contain pixelated z-10"
                                            />
                                        </div>
                                    </div>
                                );
                            })()}

                        </div>

                        {/* Card Footer: Lore & Perks (Specific to Avatar for context) */}
                        <div className={`bg-slate-50 dark:bg-slate-950/90 border-t ${rarityStyle.border} p-6 space-y-4 relative z-20 min-h-[160px] flex flex-col justify-end`}>

                            {/* Lore */}
                            {selectedShopItem && (selectedShopItem as any).lore && (
                                <div className="relative pl-4 border-l-2 border-slate-300 dark:border-slate-700 italic text-slate-500 text-xs leading-relaxed">
                                    "{(selectedShopItem as any).lore}"
                                </div>
                            )}

                            {/* NOTE: Moved full perk breakdown to Left Column. Keeping simple rarity/class info here or leaving empty if Lore is enough. */}
                        </div>
                    </div>

                </div>

                {/* COLUMN 3: LOADOUT (4 cols) - RIGHT */}
                <div className="lg:col-span-3 space-y-2 lg:sticky lg:top-4">

                    {/* Header */}
                    <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-1">
                        <Swords size={20} className="text-slate-400" />
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wider">Loadout</h3>
                    </div>

                    {/* AVATARS SELECTOR (Moved from Wardrobe) */}
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                <Users size={14} /> Avatars
                            </label>
                        </div>
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1.5 grid grid-cols-6 gap-1">
                            {AVAILABLE_AVATARS.map(avatar => {
                                const isUnlocked = !avatar.requiredItemId || inventory.some(i => i.id === avatar.requiredItemId) || STARTER_AVATARS.some(s => s.id === avatar.id);
                                // Check both explicit ID match OR fallback to 'base'
                                const currentId = avatar.requiredItemId || 'base';
                                const activeId = stats.activeAvatarId || 'base';

                                // Special case: 'base' logic might be tricky if activeAvatarId is undefined.
                                // If activeAvatarId is a mastery avatar (e.g. 'avatar_scribe_master'), this should be false for all these standard avatars.
                                const isSelected = currentId === activeId;

                                return (
                                    <button
                                        key={avatar.id}
                                        onClick={() => {
                                            if (isUnlocked) {
                                                setSelectedAvatar(avatar.path);
                                                setAvatar(avatar.requiredItemId || 'base');
                                            }
                                        }}
                                        className={`aspect-square rounded-lg border-2 relative group flex items-center justify-center bg-slate-100 dark:bg-black/40 overflow-hidden ${isSelected ? 'border-amber-400 shadow-lg' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600'} ${!isUnlocked && 'grayscale opacity-30'}`}
                                    >
                                        <img src={avatar.path} className="w-full h-full object-cover pixelated" />
                                        {isSelected && <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-amber-400 rounded-full shadow-[0_0_5px_rgba(251,191,36,0.8)]"></div>}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* WEAPON SLOT */}
                    {/* ARMOR SLOT */}
                    <div className={`transition-opacity duration-500 ${canEquipArmor ? 'opacity-100' : 'opacity-30 grayscale pointer-events-none'}`}>
                        <div className="flex justify-between items-center mb-1">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                <Shield size={14} /> Armor
                            </label>
                            {!canEquipArmor && <span className="text-[10px] text-red-500 font-bold uppercase border border-red-500/30 bg-red-900/10 px-2 py-0.5 rounded">Locked</span>}
                        </div>
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1.5 grid grid-cols-6 gap-1">
                            {/* NONE OPTION */}
                            <button
                                onClick={() => canEquipArmor && useGameStore.getState().equipItem('armor', null)}
                                className={`aspect-square rounded-lg border-2 relative group flex items-center justify-center bg-slate-100 dark:bg-black/40 ${!equippedArmorId ? 'border-amber-400 shadow-lg' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600'}`}
                            >
                                <div className="text-slate-600 group-hover:text-slate-400 transition-colors">
                                    <Ban size={16} />
                                </div>
                                {!equippedArmorId && <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-amber-400 rounded-full shadow-[0_0_5px_rgba(251,191,36,0.8)]"></div>}
                            </button>

                            {ALL_ITEMS.filter(i => isArmor(i) && i.type !== 'AVATAR' && inventory.some(inv => inv.id === i.id))
                                .sort((a, b) => (a.id === 'a_void_cloak' ? -1 : b.id === 'a_void_cloak' ? 1 : 0))
                                .map(item => (
                                    <button
                                        key={item.id}
                                        onClick={() => canEquipArmor && useGameStore.getState().equipItem('armor', item.id === equippedArmorId ? null : item.id)}
                                        className={`aspect-square rounded-lg border-2 relative group flex items-center justify-center bg-slate-100 dark:bg-black/40 ${equippedArmorId === item.id ? 'border-amber-400 shadow-lg' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600'}`}
                                    >
                                        <img src={item.imageUrl} className="w-3/4 h-3/4 object-contain pixelated" />
                                        {equippedArmorId === item.id && <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-amber-400 rounded-full shadow-[0_0_5px_rgba(251,191,36,0.8)]"></div>}
                                    </button>
                                ))}
                        </div>
                    </div>

                    {/* BACKDROP SLOT */}
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                <Monitor size={14} /> Backdrop
                            </label>
                        </div>
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1.5 grid grid-cols-6 gap-1">
                            {/* NONE OPTION */}
                            <button
                                onClick={() => setBackdrop(null)}
                                className={`aspect-square rounded-lg border-2 relative group flex items-center justify-center bg-slate-100 dark:bg-black/40 ${!stats.activeBackdropId ? 'border-amber-400 shadow-lg' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600'}`}
                            >
                                <div className="text-slate-600 group-hover:text-slate-400 transition-colors">
                                    <Ban size={16} />
                                </div>
                                {!stats.activeBackdropId && <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-amber-400 rounded-full shadow-[0_0_5px_rgba(251,191,36,0.8)]"></div>}
                            </button>

                            {COSMETIC_SHOP_ITEMS.filter(i => i.type === 'THEME' && inventory.some(inv => inv.id === i.id)).map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => setBackdrop(item.id === stats.activeBackdropId ? null : item.id)}
                                    className={`aspect-square rounded-lg border-2 relative group flex items-center justify-center bg-slate-100 dark:bg-black/40 overflow-hidden ${stats.activeBackdropId === item.id ? 'border-amber-400 shadow-lg' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600'}`}
                                    title={item.name}
                                >
                                    {item.imageUrl.endsWith('.mp4') ? (
                                        <video src={item.imageUrl} className="w-full h-full object-cover opacity-80" muted loop autoPlay playsInline />
                                    ) : (
                                        <img src={item.imageUrl} className="w-full h-full object-cover" />
                                    )}
                                    {stats.activeBackdropId === item.id && <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-amber-400 rounded-full shadow-[0_0_5px_rgba(251,191,36,0.8)]"></div>}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ARMOR SLOT */}
                    {/* WEAPON SLOT */}
                    {/* WEAPON SLOT */}
                    <div className={`transition-opacity duration-500 relative ${canEquipWeapon ? 'opacity-100' : 'opacity-50 grayscale'}`}>
                        {/* Overlay to prevent clicks on buttons when locked, but allow hover on header */}
                        {!canEquipWeapon && <div className="absolute inset-0 z-10" />}

                        <div className="flex justify-between items-center mb-1 relative group">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                <Sword size={14} /> Weapon
                            </label>

                            {!canEquipWeapon && (
                                <div className="flex items-center cursor-help">
                                    <span className="text-[10px] text-red-500 font-bold uppercase border border-red-500/30 bg-red-900/10 px-2 py-0.5 rounded">Locked</span>


                                </div>
                            )}
                        </div>
                        {/* Selector UI (Reuse existing logic but check canEquipWeapon) */}
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1.5 grid grid-cols-6 gap-1">
                            {/* NONE OPTION */}
                            <button
                                onClick={() => canEquipWeapon && useGameStore.getState().equipItem('mainHand', null)}
                                className={`aspect-square rounded-lg border-2 relative group flex items-center justify-center bg-slate-100 dark:bg-black/40 ${!equippedWeaponId ? 'border-amber-400 shadow-lg' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600'}`}
                            >
                                <div className="text-slate-600 group-hover:text-slate-400 transition-colors">
                                    <Ban size={16} />
                                </div>
                                {!equippedWeaponId && <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-amber-400 rounded-full shadow-[0_0_5px_rgba(251,191,36,0.8)]"></div>}
                            </button>

                            {ALL_ITEMS.filter(i => isWeapon(i) && i.type !== 'AVATAR' && inventory.some(inv => inv.id === i.id)).map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => canEquipWeapon && useGameStore.getState().equipItem('mainHand', item.id === equippedWeaponId ? null : item.id)}
                                    className={`aspect-square rounded-lg border-2 relative group flex items-center justify-center bg-slate-100 dark:bg-black/40 ${equippedWeaponId === item.id ? 'border-amber-400 shadow-lg' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600'}`}
                                >
                                    <img src={item.imageUrl} className="w-3/4 h-3/4 object-contain pixelated" />
                                    {equippedWeaponId === item.id && <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-amber-400 rounded-full shadow-[0_0_5px_rgba(251,191,36,0.8)]"></div>}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ACCESSORY SLOT */}
                    <div className={`transition-opacity duration-500 ${canEquipAccessory ? 'opacity-100' : 'opacity-30 grayscale pointer-events-none'}`}>
                        <div className="flex justify-between items-center mb-1">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                <Sparkles size={14} /> Companion
                            </label>
                            {!canEquipAccessory && <span className="text-[10px] text-red-500 font-bold uppercase border border-red-500/30 bg-red-900/10 px-2 py-0.5 rounded">Locked</span>}
                        </div>
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1.5 grid grid-cols-6 gap-1">
                            {/* NONE OPTION */}
                            <button
                                onClick={() => canEquipAccessory && useGameStore.getState().equipItem('accessory', null)}
                                className={`aspect-square rounded-lg border-2 relative group flex items-center justify-center bg-slate-100 dark:bg-black/40 ${!equippedAccessoryId ? 'border-amber-400 shadow-lg' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600'}`}
                            >
                                <div className="text-slate-600 group-hover:text-slate-400 transition-colors">
                                    <Ban size={16} />
                                </div>
                                {!equippedAccessoryId && <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-amber-400 rounded-full shadow-[0_0_5px_rgba(251,191,36,0.8)]"></div>}
                            </button>

                            {ALL_ITEMS.filter(i => isAccessory(i) && i.type !== 'AVATAR' && inventory.some(inv => inv.id === i.id)).map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => canEquipAccessory && useGameStore.getState().equipItem('accessory', item.id === equippedAccessoryId ? null : item.id)}
                                    className={`aspect-square rounded-lg border-2 relative group flex items-center justify-center bg-slate-100 dark:bg-black/40 ${equippedAccessoryId === item.id ? 'border-amber-400 shadow-lg' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600'}`}
                                >
                                    <img src={item.imageUrl} className="w-3/4 h-3/4 object-contain pixelated" />
                                    {equippedAccessoryId === item.id && <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-amber-400 rounded-full shadow-[0_0_5px_rgba(251,191,36,0.8)]"></div>}
                                </button>
                            ))}
                        </div>
                    </div>

                </div>

            </div>

            <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center">
                        <Activity size={14} className="mr-2 text-green-400" />
                        Consistency Graph
                    </h3>
                    <div className="flex items-center gap-1 text-[10px] text-slate-500">
                        <span>Less</span>
                        <div className="w-2 h-2 bg-slate-200 dark:bg-slate-800 rounded mx-1"></div>
                        <div className="w-2 h-2 bg-green-900/50 rounded mx-1"></div>
                        <div className="w-2 h-2 bg-green-500/50 rounded mx-1"></div>
                        <div className="w-2 h-2 bg-green-400 rounded mx-1"></div>
                        <span>More</span>
                    </div>
                </div>

                <div className="flex justify-center overflow-x-auto pb-2">
                    <div className="grid grid-rows-7 grid-flow-col gap-1">
                        {heatmapData.map((day, i) => (
                            <div
                                key={day.date}
                                title={`${day.date}: ${day.xp} XP`}
                                className={`w - 3 h - 3 rounded - sm border ${getHeatmapColor(day.xp)} transition - all hover: scale - 125 hover: z - 10`}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* DEV CONTROL PANEL */}
            <div className="fixed bottom-4 left-4 z-50">
                <button
                    onClick={() => setDevPanelOpen(!devPanelOpen)}
                    className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg shadow-lg font-bold text-sm flex items-center gap-2"
                >
                    <Sliders size={16} />
                    {devPanelOpen ? 'Close Dev Panel' : 'Dev Controls'}
                </button>

                {devPanelOpen && (
                    <div className="absolute bottom-12 left-0 bg-slate-900 border border-slate-700 rounded-xl p-4 w-80 shadow-2xl space-y-4 max-h-[80vh] overflow-y-auto">
                        {/* Edit Mode Selector */}
                        <div className="space-y-2">
                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Edit Mode (others use saved configs)</p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setDevEditMode('backdrop')}
                                    className={`flex-1 px-2 py-1.5 rounded text-[10px] font-bold uppercase transition-colors ${devEditMode === 'backdrop' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                                >
                                    Backdrop
                                </button>
                                <button
                                    onClick={() => setDevEditMode('avatar')}
                                    className={`flex-1 px-2 py-1.5 rounded text-[10px] font-bold uppercase transition-colors ${devEditMode === 'avatar' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                                >
                                    Avatar
                                </button>
                                <button
                                    onClick={() => setDevEditMode('companion')}
                                    className={`flex-1 px-2 py-1.5 rounded text-[10px] font-bold uppercase transition-colors ${devEditMode === 'companion' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                                >
                                    Companion
                                </button>
                            </div>
                        </div>

                        <h4 className={`font-bold text-sm uppercase tracking-wider border-b pb-2 ${devEditMode === 'companion' ? 'text-purple-400 border-purple-700' : 'text-slate-600 border-slate-800'}`}>Companion Controls</h4>

                        <div className="space-y-2">
                            <label className="text-slate-400 text-xs flex justify-between">
                                Top: <span className="text-white">{devCompanionTop}%</span>
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                step="0.5"
                                value={devCompanionTop}
                                onChange={(e) => setDevCompanionTop(parseFloat(e.target.value))}
                                className="w-full accent-purple-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-slate-400 text-xs flex justify-between">
                                Right: <span className="text-white">{devCompanionRight}%</span>
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                step="0.5"
                                value={devCompanionRight}
                                onChange={(e) => setDevCompanionRight(parseFloat(e.target.value))}
                                className="w-full accent-purple-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-slate-400 text-xs flex justify-between">
                                Scale: <span className="text-white">{devCompanionScale.toFixed(2)}</span>
                            </label>
                            <input
                                type="range"
                                min="0.1"
                                max="3"
                                step="0.05"
                                value={devCompanionScale}
                                onChange={(e) => setDevCompanionScale(parseFloat(e.target.value))}
                                className="w-full accent-purple-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-slate-400 text-xs flex justify-between">
                                Rotation: <span className="text-white">{devCompanionRotation}°</span>
                            </label>
                            <input
                                type="range"
                                min="-180"
                                max="180"
                                step="1"
                                value={devCompanionRotation}
                                onChange={(e) => setDevCompanionRotation(parseFloat(e.target.value))}
                                className="w-full accent-purple-500"
                            />
                        </div>

                        <h4 className={`font-bold text-sm uppercase tracking-wider border-b pb-2 pt-2 ${devEditMode === 'avatar' ? 'text-amber-400 border-amber-700' : 'text-slate-600 border-slate-800'}`}>Avatar Controls</h4>

                        <div className="space-y-2">
                            <label className="text-slate-400 text-xs flex justify-between">
                                Height: <span className="text-white">{devAvatarScale}%</span>
                            </label>
                            <input
                                type="range"
                                min="50"
                                max="150"
                                step="1"
                                value={devAvatarScale}
                                onChange={(e) => setDevAvatarScale(parseFloat(e.target.value))}
                                className="w-full accent-amber-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-slate-400 text-xs flex justify-between">
                                X Offset: <span className="text-white">{devAvatarOffsetX}px</span>
                            </label>
                            <input
                                type="range"
                                min="-100"
                                max="100"
                                step="1"
                                value={devAvatarOffsetX}
                                onChange={(e) => setDevAvatarOffsetX(parseFloat(e.target.value))}
                                className="w-full accent-amber-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-slate-400 text-xs flex justify-between">
                                Y Offset: <span className="text-white">{devAvatarOffsetY}px</span>
                            </label>
                            <input
                                type="range"
                                min="-100"
                                max="100"
                                step="1"
                                value={devAvatarOffsetY}
                                onChange={(e) => setDevAvatarOffsetY(parseFloat(e.target.value))}
                                className="w-full accent-amber-500"
                            />
                        </div>

                        {/* Companion Config Output */}
                        <div className="pt-2 border-t border-slate-700">
                            <div className="flex items-center justify-between mb-1">
                                <p className="text-[10px] text-purple-400 font-bold uppercase">Companion Config</p>
                                <button
                                    onClick={() => navigator.clipboard.writeText(`{ top: ${devCompanionTop}, right: ${devCompanionRight}, scale: ${devCompanionScale.toFixed(2)}, rot: ${devCompanionRotation} }`)}
                                    className="text-[10px] bg-purple-600 hover:bg-purple-500 text-white px-2 py-0.5 rounded font-bold"
                                >
                                    Copy
                                </button>
                            </div>
                            <code className="text-[10px] text-green-400 bg-black/50 p-2 rounded block break-all">
                                {`{ top: ${devCompanionTop}, right: ${devCompanionRight}, scale: ${devCompanionScale.toFixed(2)}, rot: ${devCompanionRotation} }`}
                            </code>
                        </div>

                        {/* Avatar Config Output */}
                        <div className="pt-2 border-t border-slate-700">
                            <div className="flex items-center justify-between mb-1">
                                <p className="text-[10px] text-amber-400 font-bold uppercase">Avatar Config</p>
                                <button
                                    onClick={() => navigator.clipboard.writeText(`{ height: ${devAvatarScale}, offsetX: ${devAvatarOffsetX}, offsetY: ${devAvatarOffsetY} }`)}
                                    className="text-[10px] bg-amber-600 hover:bg-amber-500 text-white px-2 py-0.5 rounded font-bold"
                                >
                                    Copy
                                </button>
                            </div>
                            <code className="text-[10px] text-green-400 bg-black/50 p-2 rounded block break-all">
                                {`{ height: ${devAvatarScale}, offsetX: ${devAvatarOffsetX}, offsetY: ${devAvatarOffsetY} }`}
                            </code>
                        </div>

                        <h4 className={`font-bold text-sm uppercase tracking-wider border-b pb-2 pt-2 ${devEditMode === 'backdrop' ? 'text-emerald-400 border-emerald-700' : 'text-slate-600 border-slate-800'}`}>Backdrop Controls</h4>

                        <div className="space-y-2">
                            <label className="text-slate-400 text-xs flex justify-between">
                                Zoom: <span className="text-white">{devBackdropScale}%</span>
                            </label>
                            <input
                                type="range"
                                min="50"
                                max="200"
                                step="1"
                                value={devBackdropScale}
                                onChange={(e) => setDevBackdropScale(parseFloat(e.target.value))}
                                className="w-full accent-emerald-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-slate-400 text-xs flex justify-between">
                                X Offset: <span className="text-white">{devBackdropOffsetX}px</span>
                            </label>
                            <input
                                type="range"
                                min="-200"
                                max="200"
                                step="1"
                                value={devBackdropOffsetX}
                                onChange={(e) => setDevBackdropOffsetX(parseFloat(e.target.value))}
                                className="w-full accent-emerald-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-slate-400 text-xs flex justify-between">
                                Y Offset: <span className="text-white">{devBackdropOffsetY}px</span>
                            </label>
                            <input
                                type="range"
                                min="-200"
                                max="200"
                                step="1"
                                value={devBackdropOffsetY}
                                onChange={(e) => setDevBackdropOffsetY(parseFloat(e.target.value))}
                                className="w-full accent-emerald-500"
                            />
                        </div>

                        {/* Backdrop Config Output */}
                        <div className="pt-2 border-t border-slate-700">
                            <div className="flex items-center justify-between mb-1">
                                <p className="text-[10px] text-emerald-400 font-bold uppercase">Backdrop Config</p>
                                <button
                                    onClick={() => navigator.clipboard.writeText(`'${activeBackdropItem?.id || 'none'}': { scale: ${devBackdropScale}, offsetX: ${devBackdropOffsetX}, offsetY: ${devBackdropOffsetY} }`)}
                                    className="text-[10px] bg-emerald-600 hover:bg-emerald-500 text-white px-2 py-0.5 rounded font-bold"
                                >
                                    Copy
                                </button>
                            </div>
                            <code className="text-[10px] text-green-400 bg-black/50 p-2 rounded block break-all">
                                {`'${activeBackdropItem?.id || 'none'}': { scale: ${devBackdropScale}, offsetX: ${devBackdropOffsetX}, offsetY: ${devBackdropOffsetY} }`}
                            </code>
                        </div>
                    </div>
                )}
            </div>
        </div >
    );
};
