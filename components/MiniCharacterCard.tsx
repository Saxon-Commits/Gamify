import React from 'react';
import { ALL_COSMETIC_ITEMS, STARTER_AVATARS, COSMETIC_SHOP_ITEMS } from '../src/utils/CosmeticsData';
import { SHOP_ITEMS } from '../src/utils/GameEconomy';
import { EQUIPMENT_CONFIGS } from '../src/utils/EquipmentConfig';
import { AVATAR_OFFSETS, BACKDROP_CONFIGS, COMPANION_CONFIGS } from '../src/utils/AvatarLayouts';

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

    return '/avatars/starters/starter_villager_male.png';
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

// --- CONFIGURATIONS FROM Character.tsx ---



export const MiniCharacterCard: React.FC<MiniCharacterCardProps> = ({
    avatarId,
    companionId,
    backdropId,
    weaponId,
    armorId,
    className = '',
}) => {
    let avatarUrl = getAvatarUrl(avatarId);

    // --- ADAPTIVE CLOAK COMPOSITE OVERRIDE ---
    if (armorId === 'a_adapt_cloak') {
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

        // Check for direct match or normalized IDs
        let key = avatarId;
        if (avatarId.includes('grand_wizard')) key = 'grand_wizard';
        if (avatarId.includes('cyber_knight')) key = 'hero_cyber_knight';

        if (cloakMap[key]) {
            avatarUrl = `/avatars/composites/adaptive_cloak/${cloakMap[key]}`;
        }
    }
    const companionUrl = getItemUrl(companionId);
    const backdropUrl = getItemUrl(backdropId);

    // Avatar Logic
    const avatarConfig = AVATAR_OFFSETS[avatarId];
    const avatarHeight = avatarConfig?.height ?? 95; // Default updated to 95 to match Character.tsx
    const avatarOffsetX = avatarConfig?.offsetX ?? 0;
    const avatarOffsetY = avatarConfig?.offsetY ?? 0;

    // Companion Logic
    const companionConfig = companionId ? COMPANION_CONFIGS[companionId] : null;
    // Character screen uses 440x440, companion is w-28 h-28 = 112px
    // 112/440 = 25.45% of container width
    const companionSizePercent = 25.45;

    // Backdrop Logic
    const backdropConfig = backdropId ? BACKDROP_CONFIGS[backdropId] : null;
    const backdropScale = backdropConfig?.scale ?? 100;
    const backdropOffsetX = (backdropConfig?.offsetX ?? 0);
    const backdropOffsetY = (backdropConfig?.offsetY ?? 0);

    // Convert pixel offsets to percentages of the 440px reference container
    const backdropXPercent = (backdropOffsetX / 440) * 100;
    const backdropYPercent = (backdropOffsetY / 440) * 100;

    const backdropStyle = (backdropScale !== 100 || backdropOffsetX !== 0 || backdropOffsetY !== 0) ? {
        transform: `scale(${backdropScale / 100}) translate(${backdropXPercent}%, ${backdropYPercent}%)`,
        transformOrigin: 'center center'
    } : undefined;

    return (
        <div className={`bg-slate-900 rounded-2xl overflow-hidden ${className}`}>
            <div className="relative w-full aspect-square overflow-hidden">
                {/* BACKDROP LAYER */}
                {backdropUrl ? (
                    backdropUrl.endsWith('.mp4') ? (
                        <video
                            src={backdropUrl}
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="absolute inset-0 w-full h-full object-cover opacity-80"
                            style={backdropStyle}
                        />
                    ) : (
                        <img
                            src={backdropUrl}
                            className="absolute inset-0 w-full h-full object-cover pixelated"
                            style={{
                                imageRendering: 'pixelated',
                                ...backdropStyle
                            }}
                        />
                    )
                ) : (
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-indigo-950 via-slate-900 to-black" />
                )}

                {/* Grounding Gradient Overlay */}
                <div className="absolute bottom-0 inset-x-0 h-[36%] bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent z-0 pointer-events-none" />

                {/* Avatar */}
                <img
                    src={avatarUrl}
                    alt="Avatar"
                    className="absolute w-auto object-contain pixelated z-10"
                    style={{
                        imageRendering: 'pixelated',
                        backfaceVisibility: 'hidden',
                        WebkitFontSmoothing: 'none',

                        // Positioning:
                        // 1. Start at absolute center (left 50%)
                        // 2. Add the config offset as a percentage of the CONTAINER width (offsetX / 440)
                        // 3. TranslateX -50% to center the image itself on that point
                        left: `calc(50% + ${(avatarOffsetX / 440) * 100}%)`,

                        // Y Positioning:
                        // Use bottom + percentage offset (negative offsetY moves UP, so minus negative = plus)
                        // This avoids translateY % being relative to image height
                        bottom: `${(-avatarOffsetY / 440) * 100}%`,

                        transform: 'translateX(-50%) translateZ(0)',
                        height: `${avatarHeight}%`,
                    }}
                />

                {/* DYNAMIC EQUIPMENT LAYER */}
                {(() => {
                    const itemsToRender: { id: string, src: string, offset: any }[] = [];
                    // Check Weapon & Armor from PROPS
                    [weaponId, armorId].forEach(itemId => {
                        if (!itemId) return;

                        let src = '';
                        if (itemId === 'a_seraph_wings') src = '/items/seraph_wings.png';

                        if (!src) {
                            const found = [...ALL_COSMETIC_ITEMS, ...STARTER_AVATARS].find(i => i.id === itemId);
                            if (found) src = found.imageUrl || '';
                            else {
                                const shopItem = SHOP_ITEMS.find(i => i.id === itemId);
                                if (shopItem) src = shopItem.imageUrl;
                            }
                        }

                        if (src) {
                            let configKey = avatarId;
                            if (avatarId.includes('grand_wizard')) configKey = 'grand_wizard';
                            if (avatarId.includes('cyber_knight')) configKey = 'hero_cyber_knight';

                            // Attempt exact match first, then fallback
                            const config = EQUIPMENT_CONFIGS[itemId]?.[configKey] || EQUIPMENT_CONFIGS[itemId]?.[avatarId];

                            if (config) {
                                itemsToRender.push({ id: itemId, src, offset: config });
                            }
                        }
                    });

                    return itemsToRender.map((item, idx) => (
                        <img
                            key={item.id + idx}
                            src={item.src}
                            alt="Equip"
                            className="absolute pointer-events-none pixelated"
                            style={{
                                imageRendering: 'pixelated',
                                top: `${item.offset.top}%`,
                                left: `${item.offset.left}%`,
                                transform: `scale(${item.offset.scale}) rotate(${item.offset.rotation}deg)`,
                                width: 'auto',
                                height: 'auto',
                                maxWidth: 'none',
                                zIndex: item.offset.zIndex ? item.offset.zIndex + 10 : 15
                            }}
                        />
                    ));
                })()}

                {/* COMPANION OVERLAY */}
                {companionId && companionUrl && companionConfig && (
                    <div
                        className="absolute transition-all duration-500 z-20"
                        style={{
                            top: `${companionConfig.top}%`,
                            right: `${companionConfig.right}%`,
                            transform: `scale(${companionConfig.scale}) rotate(${companionConfig.rot}deg)`,
                            width: `${companionSizePercent}%`,
                            height: `${companionSizePercent}%`,
                        }}
                    >
                        <div className="relative animate-bounce-slow w-full h-full">
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
