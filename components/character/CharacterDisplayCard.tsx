import React, { useMemo } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { useDevStore } from '../../store/useDevStore';
import { COSMETIC_SHOP_ITEMS, ALL_COSMETIC_ITEMS } from '../../src/utils/CosmeticsData';
import { SHOP_ITEMS } from '../../src/utils/GameEconomy';
import { EQUIPMENT_CONFIGS } from '../../src/utils/EquipmentConfig';

import { AVAILABLE_AVATARS, MASTERY_AVATARS } from './CharacterData';

// Local Alias for compatibility
const AVAILABLE_AVATARS_LOCAL = AVAILABLE_AVATARS;
const MASTERY_AVATARS_LOCAL = MASTERY_AVATARS;

interface CharacterDisplayCardProps {
    selectedAvatarPath: string;
}

export const CharacterDisplayCard: React.FC<CharacterDisplayCardProps> = (props) => {
    const { stats } = useGameStore();

    // --- Connect to Dev Store ---
    const {
        devPanelOpen,
        devEditMode,
        devBackdropScale, devBackdropOffsetX, devBackdropOffsetY,
        devAvatarScale, devAvatarOffsetX, devAvatarOffsetY,
        devCompanionTop, devCompanionRight, devCompanionScale, devCompanionRotation,
        isDevMode, devActiveItem, devOffset
    } = useDevStore();


    const getAvatarIdFromPath = (path: string) => {
        const found = AVAILABLE_AVATARS_LOCAL.find(a => a.path === path);
        if (found) return found.requiredItemId;
        const mastery = MASTERY_AVATARS_LOCAL.find(m => m.path === path);
        if (mastery) return mastery.id;
        return 'grand_wizard'; // Default
    };

    const currentAvatarId = getAvatarIdFromPath(props.selectedAvatarPath);
    const equippedArmorId = stats.activeArmorId;
    const equippedWeaponId = stats.activeMainHandId;
    const equippedAccessoryId = stats.activeAccessoryId;

    // Selection Logic for Rarity/Name
    const selectedShopItem = useMemo(() => {
        const avatarDef = AVAILABLE_AVATARS_LOCAL.find(a => a.path === props.selectedAvatarPath);
        if (!avatarDef || avatarDef.id === 'base') {
            return {
                name: 'Ben - The Pathfinder',
                rarity: 'COMMON',
                lore: 'A persistent developer starting their journey.',
            };
        }
        return [...SHOP_ITEMS, ...ALL_COSMETIC_ITEMS].find(i => i.id === avatarDef.requiredItemId);
    }, [props.selectedAvatarPath]);

    const currentRarity = (selectedShopItem as any)?.rarity || 'COMMON';

    const getRarityStyles = (rarity: string) => {
        switch (rarity) {
            case 'LEGENDARY': return { border: 'border-amber-500', bg: 'bg-amber-100 dark:bg-[#2e1a0b]', text: 'text-amber-600 dark:text-amber-400', glow: 'from-amber-500/20', badge: 'bg-amber-500 text-black' };
            case 'MYSTIC': return { border: 'border-purple-500', bg: 'bg-purple-100 dark:bg-[#1a0b2e]', text: 'text-purple-600 dark:text-purple-400', glow: 'from-purple-500/20', badge: 'bg-purple-500 text-white' };
            case 'RARE': return { border: 'border-blue-500', bg: 'bg-blue-50 dark:bg-slate-900', text: 'text-blue-600 dark:text-blue-400', glow: 'from-blue-500/20', badge: 'bg-blue-500 text-white' };
            default: return { border: 'border-slate-200 dark:border-slate-700', bg: 'bg-white dark:bg-slate-900', text: 'text-slate-500 dark:text-slate-400', glow: 'from-slate-500/10', badge: 'bg-slate-500 text-white' };
        }
    };
    const rarityStyle = getRarityStyles(currentRarity);

    // Active Backdrop
    const activeBackdropItem = useMemo(() => {
        if (!stats.activeBackdropId) return null;
        return COSMETIC_SHOP_ITEMS.find(i => i.id === stats.activeBackdropId);
    }, [stats.activeBackdropId]);

    // Helper for Normalized ID
    const availableAvatarId = (path: string) => {
        if (path.includes('grand_wizard')) return 'grand_wizard';
        if (path.includes('cyber_knight')) return 'hero_cyber_knight';
        const found = AVAILABLE_AVATARS_LOCAL.find(a => a.path === path);
        if (found) return found.id;
        const mastery = MASTERY_AVATARS_LOCAL.find(a => a.path === path);
        return mastery ? mastery.id : 'grand_wizard';
    };

    const getCompositePath = () => {
        const avatar = availableAvatarId(props.selectedAvatarPath);

        // --- ADAPTIVE CLOAK ---
        if (equippedArmorId === 'a_adapt_cloak') {
            const cloakMap: Record<string, string> = {
                'grand_wizard': 'grand_wizard.png',
                'hero_cyber_knight': 'hero_cyber_knight.png',
                'dark_wizard': 'dark_wizard.png',
                'warlord': 'warlord.png',
                'avatar_master_blacksmith': 'avatar_master_blacksmith.png',
                'avatar_master_bounty_hunter': 'avatar_master_bounty_hunter.png',
                'avatar_scribe_master': 'avatar_scribe_master.png',
                'seraph_knight': 'seraph_knight.png',
                'toxic_alchemist': 'toxic_alchemist.png',
                'xv_android': 'xv_android.png',
                'geisha_android': 'geisha_android.png',
                'benevolent_wizard': 'benevolent_wizard.png',
            };
            if (cloakMap[avatar] || cloakMap[currentAvatarId as string]) {
                const filename = cloakMap[avatar] || cloakMap[currentAvatarId as string];
                return `/avatars/composites/adaptive_cloak/${filename}`;
            }
        }

        // --- MASTERY ---
        if (avatar === 'avatar_scribe_master') return '/avatars/mastery/scribe_master.png';
        if (avatar === 'avatar_master_blacksmith') return '/avatars/mastery/master_blacksmith.png';
        if (avatar === 'avatar_master_bounty_hunter') return '/avatars/mastery/master_bounty_hunter.png';

        // --- BASE ---
        if (avatar === 'hero_cyber_knight' && equippedArmorId !== 'a_adapt_cloak') {
            return '/avatars/cyber_knight/base.png';
        }
        const found = AVAILABLE_AVATARS_LOCAL.find(a => a.requiredItemId === currentAvatarId);
        if (found) return found.path;

        return AVAILABLE_AVATARS_LOCAL[0].path;
    }

    const activeAccessoryItem = useMemo(() => {
        const ALL_ITEMS = [...SHOP_ITEMS, ...ALL_COSMETIC_ITEMS];
        return ALL_ITEMS.find(i => i.id === equippedAccessoryId);
    }, [equippedAccessoryId]);


    return (
        <div className={`w-full max-w-[440px] bg-white dark:bg-slate-900 border-4 ${rarityStyle.border} rounded-3xl relative shadow-2xl transition-all duration-500 group overflow-hidden`}>
            {/* Card Content Wrapper */}
            <div className="flex flex-col h-full relative z-10">

                {/* Main Image Area */}
                <div className="relative w-full aspect-square h-auto bg-white dark:bg-slate-900 overflow-hidden">




                    {/* BACKDROP */}
                    {(() => {
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
                        const savedConfig = activeBackdropItem ? BACKDROP_CONFIGS[activeBackdropItem.id] : null;
                        const useDev = devPanelOpen && devEditMode === 'backdrop';
                        const scale = useDev ? devBackdropScale : (savedConfig?.scale ?? 100);
                        const offsetX = useDev ? devBackdropOffsetX : (savedConfig?.offsetX ?? 0);
                        const offsetY = useDev ? devBackdropOffsetY : (savedConfig?.offsetY ?? 0);

                        const style = (scale !== 100 || offsetX !== 0 || offsetY !== 0) ? { transform: `scale(${scale / 100}) translate(${(offsetX / 440) * 100}%, ${(offsetY / 440) * 100}%)`, transformOrigin: 'center center' } : undefined;

                        if (!activeBackdropItem) return <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-indigo-950 via-slate-900 to-black" />;

                        if (activeBackdropItem.imageUrl.endsWith('.mp4')) {
                            return <video src={activeBackdropItem.imageUrl} autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-80" style={style} />;
                        }
                        return <img src={activeBackdropItem.imageUrl} className="absolute inset-0 w-full h-full object-cover pixelated" style={style} />;
                    })()}

                    {/* Grounding Gradient */}
                    {(() => {
                        if (activeBackdropItem?.id === 'theme-pixel-dungeon') return null;
                        if (activeBackdropItem?.id === 'theme-code-rain') return <div className="absolute bottom-0 inset-x-0 h-64 bg-gradient-to-t from-black via-black/80 to-transparent z-0 pointer-events-none" />;
                        return <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent z-0 pointer-events-none" />;
                    })()}

                    {/* AVATAR + EQUIPMENT */}
                    {(() => {
                        // AVATAR CONFIGURATIONS
                        const AVATAR_CONFIGS: Record<string, { height: number, offsetX: number, offsetY: number }> = {
                            'starter_elf_male': { height: 77, offsetX: -4, offsetY: -2 },
                            'starter_elf_female': { height: 77, offsetX: -4, offsetY: -2 },
                            'starter_villager_male': { height: 77, offsetX: -4, offsetY: -2 },
                            'starter_villager_female': { height: 77, offsetX: -4, offsetY: -2 },
                            'grand_wizard': { height: 77, offsetX: 1, offsetY: -16 },
                            'hero_cyber_knight': { height: 77, offsetX: 5, offsetY: -2 },
                            'dark_wizard': { height: 77, offsetX: 1, offsetY: -16 },
                            'benevolent_wizard': { height: 77, offsetX: 1, offsetY: -16 },
                            'seraph_knight': { height: 77, offsetX: 1, offsetY: -16 },
                            'warlord': { height: 77, offsetX: 1, offsetY: -2 },
                            'geisha_android': { height: 77, offsetX: 1, offsetY: -16 },
                            'xv_android': { height: 77, offsetX: 1, offsetY: -30 },
                            'toxic_alchemist': { height: 77, offsetX: 1, offsetY: -16 },
                            'avatar_scribe_master': { height: 77, offsetX: 1, offsetY: -16 },
                            'avatar_master_blacksmith': { height: 77, offsetX: 1, offsetY: -31 },
                            'avatar_master_bounty_hunter': { height: 77, offsetX: 11, offsetY: -11 },
                        };
                        const config = AVATAR_CONFIGS[currentAvatarId as string];
                        const useDev = devPanelOpen && devEditMode === 'avatar';
                        const height = useDev ? devAvatarScale : (config?.height ?? 95);
                        const offsetX = useDev ? devAvatarOffsetX : (config?.offsetX ?? 0);
                        const offsetY = useDev ? devAvatarOffsetY : (config?.offsetY ?? 0);

                        return (
                            <>
                                <img
                                    src={getCompositePath() || props.selectedAvatarPath}
                                    className="absolute left-1/2 w-auto object-contain pixelated z-10"
                                    alt="Avatar"
                                    style={{
                                        imageRendering: 'pixelated',
                                        backfaceVisibility: 'hidden',
                                        transform: `translateX(-50%) translateZ(0)`,
                                        left: `calc(50% + ${(offsetX / 440) * 100}%)`,
                                        bottom: `${(-offsetY / 440) * 100}%`,
                                        WebkitFontSmoothing: 'none',
                                        height: `${height}%`,
                                    }}
                                />
                                {/* DYNAMIC EQUIPMENT */}
                                {isDevMode ? (
                                    devActiveItem === 'a_seraph_wings' && (
                                        <img
                                            src="/items/seraph_wings.png"
                                            className="absolute pointer-events-none pixelated"
                                            style={{
                                                top: `${devOffset.top}%`,
                                                left: `${devOffset.left}%`,
                                                transform: `scale(${devOffset.scale}) rotate(${devOffset.rotation}deg)`,
                                                zIndex: devOffset.zIndex,
                                                width: 'auto', height: 'auto', maxWidth: 'none'
                                            }}
                                        />
                                    )
                                ) : (
                                    [equippedArmorId, equippedWeaponId].map(itemId => {
                                        if (!itemId) return null;
                                        const avatarId = availableAvatarId(props.selectedAvatarPath);
                                        const config = EQUIPMENT_CONFIGS[itemId]?.[avatarId];
                                        if (!config) return null;

                                        let src = '';
                                        if (itemId === 'a_seraph_wings') src = '/items/seraph_wings.png';
                                        else {
                                            const item = [...SHOP_ITEMS, ...ALL_COSMETIC_ITEMS].find(i => i.id === itemId);
                                            if (item) src = item.imageUrl;
                                        }
                                        if (!src) return null;
                                        return (
                                            <img
                                                key={itemId}
                                                src={src}
                                                className="absolute pointer-events-none pixelated"
                                                style={{
                                                    top: `${config.top}%`,
                                                    left: `${config.left}%`,
                                                    transform: `scale(${config.scale}) rotate(${config.rotation}deg)`,
                                                    zIndex: config.zIndex,
                                                    width: 'auto', height: 'auto', maxWidth: 'none'
                                                }}
                                            />
                                        )
                                    })
                                )}
                            </>
                        )
                    })()}

                    {/* COMPANION OVERLAY */}
                    {activeAccessoryItem && (() => {
                        const COMPANION_CONFIGS: Record<string, { top: number, right: number, scale: number, rot: number }> = {
                            'companion-data-serpent': { top: 68.5, right: 67, scale: 1.05, rot: 1 },
                            'companion-digital-ghost': { top: 41, right: 63, scale: 1.25, rot: -1 },
                            'companion-floating-grimoire': { top: 52.5, right: 64.5, scale: 1.05, rot: 20 },
                            'companion-medic-drone': { top: 38.5, right: 63, scale: 1.40, rot: -1 },
                            'companion-pebble-golem': { top: 64.5, right: 63.5, scale: 1.30, rot: 1 },
                            'companion-phoenix-hatchling': { top: 66.5, right: 66, scale: 1.20, rot: 1 },
                            'companion-holo-drone': { top: 41, right: 63, scale: 1.10, rot: -1 },
                            'acc_holo_drone': { top: 41, right: 63, scale: 1.10, rot: -1 },
                            'companion-void-whisp': { top: 38.5, right: 63, scale: 1.00, rot: 7 },
                            'active-protocol-droid': { top: 26, right: 53, scale: 1.2, rot: 0 }
                        };
                        const config = COMPANION_CONFIGS[activeAccessoryItem.id];
                        const useDev = props.devPanelOpen && props.devEditMode === 'companion';

                        const top = useDev ? props.devCompanionTop : (config?.top ?? 0);
                        const right = useDev ? props.devCompanionRight : (config?.right ?? 0);
                        const scale = useDev ? props.devCompanionScale : (config?.scale ?? 1);
                        const rot = useDev ? props.devCompanionRotation : (config?.rot ?? 0);

                        if (!useDev && !config) return null;

                        return (
                            <div className="absolute transition-all duration-500 hover:scale-110 group/pet w-[25%] aspect-square flex items-center justify-center"
                                style={{
                                    top: `${top}%`,
                                    right: `${right}%`,
                                    transform: `scale(${scale}) rotate(${rot}deg)`,
                                    position: 'absolute', zIndex: 20
                                }}
                            >
                                <div className="relative animate-bounce-slow w-full h-full">
                                    <img src={activeAccessoryItem.imageUrl} className="relative w-full h-full object-contain pixelated z-10" />
                                </div>
                            </div>
                        );

                    })()}
                </div>

                {/* Header Text (Now Below Image) */}
                <div className="p-4 flex flex-col items-center justify-center text-center bg-slate-50 dark:bg-slate-950/50">
                    <h2 className={`text-[10px] md:text-xl font-black uppercase tracking-wider ${rarityStyle.text} mb-1.5`}>
                        {selectedShopItem?.name}
                    </h2>
                    <div className={`inline-block px-3 py-0.5 text-[7px] md:text-[9px] font-bold tracking-[0.15em] rounded-full uppercase ${rarityStyle.badge}`}>
                        {currentRarity} Avatar
                    </div>
                </div>

            </div>
        </div>
    );
}
