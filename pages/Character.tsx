import React, { useMemo } from 'react';
import { useGameStore } from '../store/useGameStore';
import { Zap, Coins, Award, Shield, Heart, Zap as EnergyIcon, Flame, Brain, CheckCircle2, TrendingUp, Trophy, Activity, Cpu, Sparkles, Crown, Skull, Swords, Sliders, Save, Users, Sword, Ban, Monitor } from 'lucide-react';
import { SHOP_ITEMS } from '../src/utils/GameEconomy';
import { COSMETIC_SHOP_ITEMS } from '../src/utils/CosmeticsData';


// Helper for Rarity Colors
const getRarityStyles = (rarity: string) => {
    switch (rarity) {
        case 'LEGENDARY': return { border: 'border-amber-500', bg: 'bg-[#2e1a0b]', text: 'text-amber-400', glow: 'from-amber-500/20', badge: 'bg-amber-500 text-black' };
        case 'MYSTIC': return { border: 'border-purple-500', bg: 'bg-[#1a0b2e]', text: 'text-purple-400', glow: 'from-purple-500/20', badge: 'bg-purple-500 text-white' };
        case 'RARE': return { border: 'border-blue-500', bg: 'bg-slate-900', text: 'text-blue-400', glow: 'from-blue-500/20', badge: 'bg-blue-500 text-white' };
        default: return { border: 'border-slate-700', bg: 'bg-slate-900', text: 'text-slate-400', glow: 'from-slate-500/10', badge: 'bg-slate-500 text-white' };
    }
};

const getHeatmapColor = (xp: number) => {
    if (xp === 0) return 'bg-slate-800 border-transparent';
    if (xp < 50) return 'bg-green-900/50 border-green-900';
    if (xp < 100) return 'bg-green-500/50 border-green-500';
    return 'bg-green-400 border-green-300 shadow-[0_0_5px_rgba(74,222,128,0.5)]';
};

const ProgressBar = ({ current, max, color, height = "h-4" }: { current: number, max: number, color: string, height?: string }) => {
    const percentage = Math.min((current / max) * 100, 100);
    return (
        <div className={`w-full bg-slate-950 border-2 border-slate-600 relative ${height} shadow-[0_0_10px_rgba(251,191,36,0.2)] group overflow-hidden`} style={{ imageRendering: 'pixelated' }}>
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10 bg-[linear-gradient(45deg,#000_25%,transparent_25%,transparent_75%,#000_75%,#000),linear-gradient(45deg,#000_25%,transparent_25%,transparent_75%,#000_75%,#000)] bg-[length:10px_10px] bg-[position:0_0,5px_5px]" />

            <div
                className={`h-full relative transition-all duration-1000 ease-out ${color} border-r-2 border-white/70 shadow-[0_0_15px_rgba(251,191,36,0.4)]`}
                style={{ width: `${percentage}%` }}
            >
                {/* Inner Bevels for 3D/Gem-like look */}
                <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/20 to-transparent" />

                {/* Sparkle effect */}
                <div className="absolute top-0 right-0 h-full w-px bg-white/80 shadow-[0_0_5px_rgba(255,255,255,0.8)]" />
            </div>

            {/* Tick Marks */}
            <div className="absolute inset-0 flex justify-between px-[10%] pointer-events-none opacity-30">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => <div key={i} className="w-px h-full bg-slate-900/50" />)}
            </div>
        </div>
    );
};

const AVAILABLE_AVATARS = [
    { id: 'base', path: '/assets/avatars/hero_base.png', name: 'Ben - The Pathfinder', requiredItemId: null },
    { id: 'dark', path: '/assets/avatars/hero_dark_warrior.png', name: 'Iron Viking', requiredItemId: 'hero_dark_warrior' },
    { id: 'star', path: '/assets/avatars/hero_star_general.png', name: 'Dark Warlord', requiredItemId: 'hero_star_general' },
    { id: 'grand_wizard', path: '/assets/avatars/grand_wizard/grand_wizard_base.png', name: 'Grand Wizard', requiredItemId: 'grand_wizard' },
    { id: 'cyber_knight', path: '/assets/avatars/cyber_knight/base.png', name: 'Cyber Knight', requiredItemId: 'hero_cyber_knight' },

    // ORPHANED (Hidden for now)
    // { id: 'cursed', path: '/assets/avatars/hero_cursed_void.png', name: 'Cursed Warlock', requiredItemId: 'hero_cursed_void' },
    // { id: 'void', path: '/assets/avatars/hero_voidwalker.png', name: 'Warlock', requiredItemId: 'hero_voidwalker' },
    // { id: 'cyber_future', path: '/assets/avatars/hero_cyber_future.png', name: 'Sentinel', requiredItemId: 'hero_cyber_future' },
    // { id: 'luna', path: '/assets/avatars/hero_luna_witch.png', name: 'Lunar Witch', requiredItemId: 'hero_luna_witch' },
    // { id: 'solar', path: '/assets/avatars/hero_solar_champion.png', name: 'Golden Paladin', requiredItemId: 'hero_solar_champion' },
    // { id: 'hunter', path: '/assets/avatars/hero_exo_hunter.png', name: 'Crimson Hunter', requiredItemId: 'hero_exo_hunter' },
    // { id: 'cyber', path: '/assets/avatars/hero_cyber.png', name: 'Netrunner', requiredItemId: 'hero_cyber' },
    // { id: 'mage', path: '/assets/avatars/hero_mage.png', name: 'Apprentice Sorcerer', requiredItemId: 'hero_mage' },
    // { id: 'rare', path: '/assets/avatars/hero_rare.png', name: 'Rare', requiredItemId: null },
];

export const Character: React.FC = () => {
    const { stats, tasks, activityLog, skillNodes, inventory, setAvatar, setBackdrop } = useGameStore();
    const totalCompleted = tasks.filter(t => t.completed).length;

    // State for local preview
    // Initialize based on saved activeAvatarId if available
    const initialAvatarPath = React.useMemo(() => {
        const savedId = stats.activeAvatarId;
        if (!savedId || savedId === 'base') return '/assets/avatars/hero_base.png';
        const found = AVAILABLE_AVATARS.find(a => a.requiredItemId === savedId);
        return found ? found.path : '/assets/avatars/hero_base.png';
    }, [stats.activeAvatarId]);

    const [selectedAvatar, setSelectedAvatar] = React.useState(initialAvatarPath);
    const [isHoodOff, setIsHoodOff] = React.useState(false);

    // Determines the ID based on the selected path
    const getAvatarIdFromPath = (path: string) => {
        const found = AVAILABLE_AVATARS.find(a => a.path === path);
        return found ? found.requiredItemId || 'base' : 'base';
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
        // --- CYBER KNIGHT COMBOS ---
        'hero_cyber_knight_w_cyber_sword': '/assets/avatars/cyber_knight/w_cyber_sword.png',
        'hero_cyber_knight_a_nano_vest': '/assets/avatars/cyber_knight/a_nano_vest.png',
        'hero_cyber_knight_w_cyber_sword_acc_cyber_shield': '/assets/avatars/cyber_knight/w_cyber_sword_acc_cyber_shield.png',
        'hero_cyber_knight_w_neural_dagger_acc_cyber_shield': '/assets/avatars/cyber_knight/w_neural_dagger_acc_cyber_shield.png',
    };

    // Helper to get ID from path for signature
    const availableAvatarId = (path: string) => {
        // Special case for the new folder structure
        if (path.includes('grand_wizard')) return 'grand_wizard';
        if (path.includes('cyber_knight')) return 'hero_cyber_knight';

        const found = AVAILABLE_AVATARS.find(a => a.path === path);
        return found ? found.id : 'base';
    };

    const getCompositePath = () => {
        const avatar = availableAvatarId(selectedAvatar);

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

        // 4. Avatar + Armor (New Check for Cloak Only)
        if (SPECIAL_COMBOS[`${avatar}_${equippedArmorId}${hoodSuffix}`])
            return SPECIAL_COMBOS[`${avatar}_${equippedArmorId}${hoodSuffix}`];

        // 5. Avatar + Weapon + Accessory
        if (SPECIAL_COMBOS[`${avatar}_${equippedWeaponId}_${equippedAccessoryId}`])
            return SPECIAL_COMBOS[`${avatar}_${equippedWeaponId}_${equippedAccessoryId}`];

        // 6. Avatar + Weapon
        if (SPECIAL_COMBOS[`${avatar}_${equippedWeaponId}`])
            return SPECIAL_COMBOS[`${avatar}_${equippedWeaponId}`];

        // 7. Generic Fallback
        if (equippedWeaponId) {
            const avatarObj = AVAILABLE_AVATARS.find(a => a.path === selectedAvatar);
            if (avatarObj) return `/assets/avatars/combo/${avatarObj.id}_${equippedWeaponId}.png`;
        }
        return null;
    };

    // Update local state if persistent stats change (e.g. on reload)
    React.useEffect(() => {
        if (stats.activeAvatarId) {
            const found = AVAILABLE_AVATARS.find(a => a.requiredItemId === stats.activeAvatarId);
            if (found) {
                setSelectedAvatar(found.path);
            } else if (stats.activeAvatarId === 'base') {
                setSelectedAvatar('/assets/avatars/hero_base.png');
            }
        }
    }, [stats.activeAvatarId]);

    // Reset Hood Toggle when avatar changes
    React.useEffect(() => {
        setIsHoodOff(false);
    }, [selectedAvatar]);

    // Helpers
    const isArmor = (id: string) => id.startsWith('a_');
    const isWeapon = (id: string) => id.startsWith('w_');
    const isAccessory = (id: string) => id.startsWith('acc_');

    // Avatar Logic
    const avatarConfig = useMemo(() => {
        // Default to empty array if skillNodes is undefined
        const nodes = skillNodes || [];
        const unlockedNodes = nodes.filter(n => n.data && n.data.isUnlocked);
        const titanCount = unlockedNodes.filter(n => n.data && n.data.path === 'titan').length;
        const technoCount = unlockedNodes.filter(n => n.data && n.data.path === 'technomancer').length;

        if (titanCount > technoCount && titanCount >= 1) return { icon: '🛡️', overlay: <Shield className="absolute -top-2 -right-2 text-amber-500 bg-slate-900 rounded-full p-1" size={32} fill="currentColor" />, title: 'Titan' };
        if (technoCount > titanCount && technoCount >= 1) return { icon: '🤖', overlay: <Cpu className="absolute -top-2 -right-2 text-cyan-400 bg-slate-900 rounded-full p-1" size={32} />, title: 'Technomancer' };
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
                slots: ['WEAPON', 'ACCESSORY'] // Base supports these now
            };
        }

        return SHOP_ITEMS.find(i => i.id === avatarDef.requiredItemId);
    }, [selectedAvatar]);

    const currentRarity = (selectedShopItem as any)?.rarity || 'COMMON';
    const currentSlots = (selectedShopItem as any)?.slots || [];
    const rarityStyle = getRarityStyles(currentRarity);

    // Filter selectors based on slots
    const canEquipWeapon = currentSlots.includes('WEAPON') && (currentAvatarId !== 'grand_wizard' || !!equippedArmorId);
    const canEquipArmor = currentSlots.includes('ARMOR');
    const canEquipAccessory = currentSlots.includes('ACCESSORY');


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

    return (
        <div className="max-w-[1600px] mx-auto pb-32 space-y-8 px-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* COLUMN 1: DETAILS PANEL (Left) */}
                <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
                        {/* Header */}
                        <div className="flex items-center gap-2 border-b border-slate-800 pb-4">
                            <Activity size={20} className="text-slate-400" />
                            <h3 className="text-lg font-bold text-white uppercase tracking-wider">Attributes</h3>
                        </div>

                        {/* Level & XP */}
                        <div className="relative bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/20 rounded-xl p-4 border border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.05)] space-y-2 overflow-hidden">
                            {/* Corner Glow Accent */}
                            <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/10 blur-xl rounded-full -mr-8 -mt-8 pointer-events-none" />
                            <div className="flex justify-between items-end">
                                <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">XP</div>
                                <div className="text-xs text-slate-500 font-mono">
                                    <span className="text-white font-bold">{stats.xp}</span> / {stats.xpToNext} XP
                                </div>
                            </div>
                            <ProgressBar current={stats.xp} max={stats.xpToNext} color="bg-gradient-to-r from-amber-700 via-amber-500 to-yellow-400" height="h-3" />
                            <div className="flex justify-between items-center pt-2">
                                <div className="flex items-center gap-2">
                                    <div className="bg-slate-800 text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded">LVL {stats.level}</div>
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
                                <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-3 flex flex-col gap-1 items-start">
                                    <div className="text-[10px] text-slate-500 uppercase">XP Gain</div>
                                    <div className="text-lg font-bold text-green-400 flex items-center gap-1">
                                        <TrendingUp size={16} /> +{(aggregatedPerks.xp * 100).toFixed(0)}%
                                    </div>
                                </div>
                                <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-3 flex flex-col gap-1 items-start">
                                    <div className="text-[10px] text-slate-500 uppercase">Gold Found</div>
                                    <div className="text-lg font-bold text-amber-400 flex items-center gap-1">
                                        <Coins size={16} /> +{(aggregatedPerks.gold * 100).toFixed(0)}%
                                    </div>
                                </div>
                                <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-3 flex flex-col gap-1 items-start">
                                    <div className="text-[10px] text-slate-500 uppercase">Luck</div>
                                    <div className="text-lg font-bold text-purple-400 flex items-center gap-1">
                                        <Sparkles size={16} /> +{(aggregatedPerks.luck * 100).toFixed(0)}%
                                    </div>
                                </div>
                                {(aggregatedPerks.energy > 0) && (
                                    <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-3 flex flex-col gap-1 items-start">
                                        <div className="text-[10px] text-slate-500 uppercase">Max Energy</div>
                                        <div className="text-lg font-bold text-blue-400 flex items-center gap-1">
                                            <Zap size={16} /> +{aggregatedPerks.energy}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Mastery Badges */}
                        <div className="space-y-3 pt-4 border-t border-slate-800">
                            <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold flex items-center gap-2">
                                <Award size={14} /> Mastery Badges
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {masteryBadges.map(node => (
                                    <div key={node.id} className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center relative group ${node.data.isUnlocked ? 'bg-amber-900/20 border-amber-500/50 text-amber-400' : 'bg-slate-900 border-slate-800 text-slate-600 grayscale opacity-50'}`}>
                                        {/* Icon rendering basic placeholder based on node type if needed, or just specific badge icon */}
                                        <Trophy size={20} />

                                        {/* Tooltip */}
                                        <div className="absolute bottom-full mb-2 w-32 bg-slate-950/90 text-center p-2 rounded text-[10px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-slate-700 z-50">
                                            <div className="font-bold text-white mb-0.5">{node.data.label}</div>
                                            <div className="text-slate-400">{node.data.isUnlocked ? 'Mastered' : 'Locked'}</div>
                                        </div>
                                    </div>
                                ))}
                                {masteryBadges.length === 0 && (
                                    <div className="text-xs text-slate-600 italic">No mastery nodes found.</div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>

                {/* COLUMN 2: AVATAR DISPLAY (Center) */}
                <div className="lg:col-span-4 flex flex-col items-center">

                    {/* THE CARD */}
                    <div className={`w-full max-w-md bg-slate-900 border-4 ${rarityStyle.border} rounded-3xl overflow-hidden relative shadow-2xl transition-all duration-500 group`}>

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
                                            className="bg-slate-800 border border-slate-600 hover:bg-slate-700 text-white text-[10px] uppercase font-bold px-2 py-1 rounded-full transition-colors flex items-center gap-1"
                                        >
                                            <Sliders size={10} /> Hood: {isHoodOff ? 'OFF' : 'ON'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Main Image */}
                        <div
                            className="relative w-full h-[400px] z-10 -mt-4 overflow-hidden bg-slate-900"
                        >
                            {/* BACKDROP LAYER */}
                            {activeBackdropItem ? (
                                activeBackdropItem.imageUrl.endsWith('.mp4') ? (
                                    <video
                                        src={activeBackdropItem.imageUrl}
                                        autoPlay
                                        loop
                                        muted
                                        playsInline
                                        className="absolute inset-0 w-full h-full object-cover opacity-80"
                                    />
                                ) : (
                                    <img
                                        src={activeBackdropItem.imageUrl}
                                        className="absolute inset-0 w-full h-full object-cover pixelated"
                                    />
                                )
                            ) : (
                                <div
                                    className="absolute inset-0 w-full h-full"
                                    style={{
                                        backgroundImage: "url('/assets/avatar_background.png')",
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center bottom',
                                        imageRendering: 'pixelated'
                                    }}
                                />
                            )}
                            {/* Avatar - positioned at bottom, scaled to fill nicely */}
                            <img
                                key={`${selectedAvatar}-${equippedWeaponId}-${equippedArmorId}-${equippedAccessoryId}`}
                                src={getCompositePath() || selectedAvatar}
                                className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[95%] w-auto object-contain pixelated drop-shadow-[0_5px_20px_rgba(0,0,0,0.8)] transition-transform duration-500 hover:scale-105"
                                alt="Avatar"
                                style={{ imageRendering: 'pixelated' }}
                            />

                            {/* UNIVERSAL COMPANION OVERLAY (For non-composite avatars, excluding Base Hero) */}
                            {equippedAccessoryId === 'acc_holo_drone' && !selectedAvatar.includes('hero_base') && (!getCompositePath() || !getCompositePath()?.includes('acc_holo_drone')) && (
                                <img
                                    src="/assets/items/acc_holo_drone.png"
                                    className="absolute top-10 left-4 w-24 h-24 object-contain animate-pulse z-20 opacity-90 drop-shadow-[0_0_10px_rgba(56,189,248,0.5)]"
                                    style={{ animationDuration: '3s' }}
                                />
                            )}
                        </div>

                        {/* Card Footer: Lore & Perks (Specific to Avatar for context) */}
                        <div className={`bg-slate-950/90 border-t ${rarityStyle.border} p-6 space-y-4 relative z-20 min-h-[160px] flex flex-col justify-end`}>

                            {/* Lore */}
                            {selectedShopItem && (selectedShopItem as any).lore && (
                                <div className="relative pl-4 border-l-2 border-slate-700 italic text-slate-500 text-xs leading-relaxed">
                                    "{(selectedShopItem as any).lore}"
                                </div>
                            )}

                            {/* NOTE: Moved full perk breakdown to Left Column. Keeping simple rarity/class info here or leaving empty if Lore is enough. */}
                        </div>
                    </div>

                </div>

                {/* COLUMN 3: LOADOUT (4 cols) - RIGHT */}
                <div className="lg:col-span-4 space-y-2 lg:sticky lg:top-4">

                    {/* Header */}
                    <div className="flex items-center gap-2 border-b border-slate-800 pb-1">
                        <Swords size={20} className="text-slate-400" />
                        <h3 className="text-lg font-bold text-white uppercase tracking-wider">Loadout</h3>
                    </div>

                    {/* AVATARS SELECTOR (Moved from Wardrobe) */}
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                <Users size={14} /> Avatars
                            </label>
                        </div>
                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-1.5 grid grid-cols-6 gap-1">
                            {AVAILABLE_AVATARS.map(avatar => {
                                const isUnlocked = !avatar.requiredItemId || inventory.some(i => i.id === avatar.requiredItemId);
                                const isSelected = selectedAvatar === avatar.path;
                                return (
                                    <button
                                        key={avatar.id}
                                        onClick={() => {
                                            if (isUnlocked) {
                                                setSelectedAvatar(avatar.path);
                                                setAvatar(avatar.requiredItemId || '');

                                                // Auto-unequip items if not Grand Wizard (since others don't have composite images yet)
                                                if (avatar.id !== 'grand_wizard') {
                                                    useGameStore.getState().equipItem('mainHand', null);
                                                    useGameStore.getState().equipItem('armor', null);
                                                }
                                                // Specific check for Base Hero: No companions allowed/visible
                                                if (avatar.id === 'base') {
                                                    useGameStore.getState().equipItem('accessory', null);
                                                }
                                            }
                                        }}
                                        className={`aspect-square rounded-lg border-2 relative group flex items-center justify-center bg-black/40 overflow-hidden ${isSelected ? 'border-amber-400 shadow-lg' : 'border-slate-800 hover:border-slate-600'} ${!isUnlocked && 'grayscale opacity-30'}`}
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
                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-1.5 grid grid-cols-6 gap-1">
                            {/* NONE OPTION */}
                            <button
                                onClick={() => canEquipArmor && useGameStore.getState().equipItem('armor', null)}
                                className={`aspect-square rounded-lg border-2 relative group flex items-center justify-center bg-black/40 ${!equippedArmorId ? 'border-amber-400 shadow-lg' : 'border-slate-800 hover:border-slate-600'}`}
                            >
                                <div className="text-slate-600 group-hover:text-slate-400 transition-colors">
                                    <Ban size={16} />
                                </div>
                                {!equippedArmorId && <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-amber-400 rounded-full shadow-[0_0_5px_rgba(251,191,36,0.8)]"></div>}
                            </button>

                            {SHOP_ITEMS.filter(i => isArmor(i.id) && inventory.some(inv => inv.id === i.id))
                                .sort((a, b) => (a.id === 'a_void_cloak' ? -1 : b.id === 'a_void_cloak' ? 1 : 0))
                                .map(item => (
                                    <button
                                        key={item.id}
                                        onClick={() => canEquipArmor && useGameStore.getState().equipItem('armor', item.id === equippedArmorId ? null : item.id)}
                                        className={`aspect-square rounded-lg border-2 relative group flex items-center justify-center bg-black/40 ${equippedArmorId === item.id ? 'border-amber-400 shadow-lg' : 'border-slate-800 hover:border-slate-600'}`}
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
                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-1.5 grid grid-cols-6 gap-1">
                            {/* NONE OPTION */}
                            <button
                                onClick={() => setBackdrop(null)}
                                className={`aspect-square rounded-lg border-2 relative group flex items-center justify-center bg-black/40 ${!stats.activeBackdropId ? 'border-amber-400 shadow-lg' : 'border-slate-800 hover:border-slate-600'}`}
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
                                    className={`aspect-square rounded-lg border-2 relative group flex items-center justify-center bg-black/40 overflow-hidden ${stats.activeBackdropId === item.id ? 'border-amber-400 shadow-lg' : 'border-slate-800 hover:border-slate-600'}`}
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

                                    {/* TOOLTIP FOR WIZARD */}
                                    {currentAvatarId === 'grand_wizard' && !equippedArmorId && (
                                        <div className="absolute bottom-full right-0 mb-2 w-48 bg-slate-900/95 backdrop-blur text-slate-200 text-xs p-3 rounded-lg shadow-xl border border-slate-700 z-50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none text-center">
                                            <p className="font-semibold text-amber-400 mb-1">Requirement Missing</p>
                                            You must equip a <span className="text-white">Cloak</span> (Armor) to unlock weapon slots.
                                            <div className="absolute top-full right-4 border-8 border-transparent border-t-slate-700"></div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        {/* Selector UI (Reuse existing logic but check canEquipWeapon) */}
                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-1.5 grid grid-cols-6 gap-1">
                            {/* NONE OPTION */}
                            <button
                                onClick={() => canEquipWeapon && useGameStore.getState().equipItem('mainHand', null)}
                                className={`aspect-square rounded-lg border-2 relative group flex items-center justify-center bg-black/40 ${!equippedWeaponId ? 'border-amber-400 shadow-lg' : 'border-slate-800 hover:border-slate-600'}`}
                            >
                                <div className="text-slate-600 group-hover:text-slate-400 transition-colors">
                                    <Ban size={16} />
                                </div>
                                {!equippedWeaponId && <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-amber-400 rounded-full shadow-[0_0_5px_rgba(251,191,36,0.8)]"></div>}
                            </button>

                            {SHOP_ITEMS.filter(i => isWeapon(i.id) && inventory.some(inv => inv.id === i.id)).map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => canEquipWeapon && useGameStore.getState().equipItem('mainHand', item.id === equippedWeaponId ? null : item.id)}
                                    className={`aspect-square rounded-lg border-2 relative group flex items-center justify-center bg-black/40 ${equippedWeaponId === item.id ? 'border-amber-400 shadow-lg' : 'border-slate-800 hover:border-slate-600'}`}
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
                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-1.5 grid grid-cols-6 gap-1">
                            {/* NONE OPTION */}
                            <button
                                onClick={() => canEquipAccessory && useGameStore.getState().equipItem('accessory', null)}
                                className={`aspect-square rounded-lg border-2 relative group flex items-center justify-center bg-black/40 ${!equippedAccessoryId ? 'border-amber-400 shadow-lg' : 'border-slate-800 hover:border-slate-600'}`}
                            >
                                <div className="text-slate-600 group-hover:text-slate-400 transition-colors">
                                    <Ban size={16} />
                                </div>
                                {!equippedAccessoryId && <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-amber-400 rounded-full shadow-[0_0_5px_rgba(251,191,36,0.8)]"></div>}
                            </button>

                            {SHOP_ITEMS.filter(i => isAccessory(i.id) && inventory.some(inv => inv.id === i.id)).map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => canEquipAccessory && useGameStore.getState().equipItem('accessory', item.id === equippedAccessoryId ? null : item.id)}
                                    className={`aspect-square rounded-lg border-2 relative group flex items-center justify-center bg-black/40 ${equippedAccessoryId === item.id ? 'border-amber-400 shadow-lg' : 'border-slate-800 hover:border-slate-600'}`}
                                >
                                    <img src={item.imageUrl} className="w-3/4 h-3/4 object-contain pixelated" />
                                    {equippedAccessoryId === item.id && <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-amber-400 rounded-full shadow-[0_0_5px_rgba(251,191,36,0.8)]"></div>}
                                </button>
                            ))}
                        </div>
                    </div>

                </div>

            </div>

            <section className="bg-slate-900 border border-slate-800 rounded-3xl p-8">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center">
                        <Activity size={14} className="mr-2 text-green-400" />
                        Consistency Graph
                    </h3>
                    <div className="flex items-center gap-1 text-[10px] text-slate-500">
                        <span>Less</span>
                        <div className="w-2 h-2 bg-slate-800 rounded mx-1"></div>
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
        </div >
    );
};
