import React from 'react';
import { ALL_COSMETIC_ITEMS, STARTER_AVATARS, COSMETIC_SHOP_ITEMS } from '../src/utils/CosmeticsData';
import { SHOP_ITEMS } from '../src/utils/GameEconomy';

interface MiniCharacterCardProps {
    avatarId: string;
    companionId?: string | null;
    backdropId?: string | null;
    weaponId?: string | null;
    armorId?: string | null;
    className?: string;
}

// Get avatar image URL from ID
const getAvatarUrl = (avatarId: string): string => {
    const starter = STARTER_AVATARS.find(s => s.id === avatarId);
    if (starter) return starter.imageUrl;

    const cosmetic = ALL_COSMETIC_ITEMS.find(i => i.id === avatarId && i.type === 'AVATAR');
    if (cosmetic?.imageUrl) return cosmetic.imageUrl;

    return '/assets/avatars/starters/starter_villager_male.png';
};

// Get item image URL from ID
const getItemUrl = (itemId: string | null | undefined): string | null => {
    if (!itemId) return null;

    const cosmetic = ALL_COSMETIC_ITEMS.find(i => i.id === itemId);
    if (cosmetic?.imageUrl) return cosmetic.imageUrl;

    const shop = SHOP_ITEMS.find(i => i.id === itemId);
    if (shop?.imageUrl) return shop.imageUrl;

    const cosmeticShop = COSMETIC_SHOP_ITEMS.find(i => i.id === itemId);
    if (cosmeticShop?.imageUrl) return cosmeticShop.imageUrl;

    return null;
};

// AVATAR CONFIGURATIONS - Exact copy from Character.tsx
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

// COMPANION CONFIGURATIONS - Exact copy from Character.tsx
// These percentages are calibrated for a 440x440 container
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
    'active-protocol-droid': { top: 26, right: 53, scale: 1.2, rot: 0 },
};

export const MiniCharacterCard: React.FC<MiniCharacterCardProps> = ({
    avatarId,
    companionId,
    backdropId,
    className = '',
}) => {
    const avatarUrl = getAvatarUrl(avatarId);
    const companionUrl = getItemUrl(companionId);
    const backdropUrl = getItemUrl(backdropId);

    const avatarConfig = AVATAR_CONFIGS[avatarId];
    const avatarHeight = avatarConfig?.height ?? 77;
    const avatarOffsetX = avatarConfig?.offsetX ?? 0;
    const avatarOffsetY = avatarConfig?.offsetY ?? 0;

    const companionConfig = companionId ? COMPANION_CONFIGS[companionId] : null;

    // Character screen uses 440x440, companion is w-28 h-28 = 112px
    // 112/440 = 25.45% of container width
    const companionSizePercent = 25.45;

    return (
        <div className={`bg-slate-900 rounded-2xl overflow-hidden ${className}`}>
            {/* 
                Main Image Area - EXACT structure from Character.tsx
                Character screen uses max-w-[440px] with h-[440px] = 1:1 aspect ratio
            */}
            <div className="relative w-full aspect-square">
                {/* BACKDROP LAYER - Exact same as Character.tsx with object-cover */}
                {backdropUrl ? (
                    backdropUrl.endsWith('.mp4') ? (
                        <video
                            src={backdropUrl}
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="absolute inset-0 w-full h-full object-cover opacity-80"
                        />
                    ) : (
                        <img
                            src={backdropUrl}
                            className="absolute inset-0 w-full h-full object-cover pixelated"
                            style={{ imageRendering: 'pixelated' }}
                        />
                    )
                ) : (
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-indigo-950 via-slate-900 to-black" />
                )}

                {/* Grounding Gradient Overlay - Same as Character.tsx default (h-40 of 440 = ~9%) */}
                <div className="absolute bottom-0 inset-x-0 h-[36%] bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent z-0 pointer-events-none" />

                {/* Avatar - EXACT positioning from Character.tsx */}
                {/* Convert pixel offsets to percentages: original card is 440px, so offset/440*100 = percentage */}
                <img
                    src={avatarUrl}
                    alt="Avatar"
                    className="absolute left-1/2 w-auto object-contain pixelated z-10"
                    style={{
                        imageRendering: 'pixelated',
                        backfaceVisibility: 'hidden',
                        // Convert px to % based on 440px reference: offsetX/440*100, offsetY/440*100
                        transform: `translateX(calc(-50% + ${(avatarOffsetX / 440) * 100}%)) translateY(${(avatarOffsetY / 440) * 100}%) translateZ(0)`,
                        WebkitFontSmoothing: 'none',
                        height: `${avatarHeight}%`,
                        bottom: 0
                    }}
                />

                {/* COMPANION OVERLAY - EXACT structure from Character.tsx */}
                {companionId && companionUrl && companionConfig && (
                    <div
                        className="absolute transition-all duration-500 z-20"
                        style={{
                            top: `${companionConfig.top}%`,
                            right: `${companionConfig.right}%`,
                            transform: `scale(${companionConfig.scale}) rotate(${companionConfig.rot}deg)`,
                            // Companion size as percentage of container (same ratio as Character screen)
                            width: `${companionSizePercent}%`,
                            height: `${companionSizePercent}%`,
                        }}
                    >
                        {/* Bounce Wrapper - Same as Character.tsx */}
                        <div className="relative animate-bounce-slow w-full h-full">
                            {/* Main Companion Image - fill the container */}
                            <img
                                src={companionUrl}
                                alt="Companion"
                                className="w-full h-full object-contain pixelated"
                                style={{ imageRendering: 'pixelated' }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
