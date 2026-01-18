import React, { useState, useRef, useEffect } from 'react';
import { useGameStore } from '../store/useGameStore';
import { SHOP_ITEMS } from '../src/utils/GameEconomy';
import { COSMETIC_SHOP_ITEMS, ALL_COSMETIC_ITEMS } from '../src/utils/CosmeticsData';
import { User, Bot, Sword, Diamond, Monitor } from 'lucide-react';

import { MerchantCard, MerchantModal } from '../components/MerchantCard';
import { CharacterSidebar } from '../components/character/CharacterSidebar';
import { ShopCart } from '../components/shop/ShopCart';
import { ShopItemCard } from '../components/shop/ShopItemCard';
import { CurrencyPackCard } from '../components/shop/CurrencyPackCard';
import { ShopSection } from '../components/shop/ShopSection';
import { AvatarUnlockModal } from '../components/shop/AvatarUnlockModal';
import { ShopItemPreviewModal } from '../components/shop/ShopItemPreviewModal';

import { useAction } from 'convex/react';
import { api } from '../convex/_generated/api';

export const Shop: React.FC = () => {
    const { addToCart, buyItem, inventory } = useGameStore();
    const [isMerchantModalOpen, setIsMerchantModalOpen] = useState(false);
    const [purchasedAvatar, setPurchasedAvatar] = useState<any>(null);
    const [previewItem, setPreviewItem] = useState<any>(null);

    // Payment Action
    const pay = useAction(api.pay.createCheckoutSession);

    const handleGemPurchase = async (priceId: string) => {
        try {
            const url = await pay({ priceId });
            if (url) window.location.href = url;
        } catch (error) {
            console.error("Payment Error:", error);
            alert("Failed to initiate checkout");
        }
    };

    const handleAddItem = (item: any) => {
        addToCart({
            id: item.id,
            name: item.name,
            description: item.description,
            type: item.type as any,
            cost: item.cost,
            acquiredAt: new Date().toISOString(),
            quantity: 1
        });
    };

    const handleItemAction = (item: any) => {
        const isOwned = inventory.some(owned => owned.id === item.id);
        if (isOwned) return;

        if (item.premiumPrice) {
            // Direct Purchase (Gems)
            if (confirm(`Purchase ${item.name} for ${item.premiumPrice} Gems?`)) {
                const success = buyItem(item);
                if (!success) alert("Not enough Gems!");
            }
        } else {
            // Cart Purchase (Gold/Shards)
            handleAddItem(item);
        }
    };

    const handleUnlockAvatar = (avatarId: string) => {
        const fullItemDef = [...SHOP_ITEMS, ...ALL_COSMETIC_ITEMS].find(i => i.id === avatarId);
        if (fullItemDef) {
            setPurchasedAvatar(fullItemDef);
        }
    };

    // Unified Item List
    const ALL_ITEMS = React.useMemo(() => {
        const map = new Map();
        [...SHOP_ITEMS, ...ALL_COSMETIC_ITEMS].forEach(i => map.set(i.id, i));
        return Array.from(map.values());
    }, []);

    // Currency Packs Data (Local to component or could be moved)
    const currencyPacks = [
        { amount: 100, name: 'Pile of Gems', price: '$1.49', id: 'price_100_gems', color: 'cyan', popular: false, image: '/images/currency/pile of gems (100).png' },
        { amount: 500, name: 'Pouch of Gems', price: '$6.99', id: 'price_500_gems', color: 'blue', popular: true, image: '/images/currency/pouch of gems (500).png' },
        { amount: 1000, name: 'Chest of Gems', price: '$12.99', id: 'price_1000_gems', color: 'purple', popular: false, image: '/images/currency/chest of gems (1000).png' },
        { amount: 10000, name: 'Mountain of Gems', price: '$99.99', id: 'price_10000_gems', color: 'amber', popular: false, image: '/images/currency/mountain of gems (10000).png' },
    ];

    return (
        <div className="max-w-[95%] mx-auto pb-32 space-y-8 relative">

            {/* Layout Container */}
            <div className="flex flex-col lg:flex-row gap-8 mt-8">

                {/* LEFT SIDEBAR - MERCHANT */}
                <div className="w-full lg:w-48 flex-shrink-0 space-y-6 sticky top-4 h-fit self-start">
                    <CharacterSidebar className="hidden lg:block w-full lg:w-48 flex-shrink-0 animate-in slide-in-from-left-4 duration-500" />
                    <MerchantCard onNewQuestClick={() => setIsMerchantModalOpen(true)} isModalOpen={isMerchantModalOpen} />
                    <MerchantModal
                        isOpen={isMerchantModalOpen}
                        onClose={() => setIsMerchantModalOpen(false)}
                        inventory={SHOP_ITEMS}
                        onAddItem={handleAddItem}
                    />
                </div>

                {/* RIGHT CONTENT - SHOP SECTIONS */}
                <div className="flex-1 space-y-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

                        {/* 1. AVATARS */}
                        <ShopSection
                            title="Avatars"
                            description="Reward yourself with a unique avatar that represents your character in social guilds."
                            icon={<User size={16} />}
                            titleColorClass="text-pink-500"
                        >
                            <div className="grid grid-cols-2 gap-2">
                                {ALL_COSMETIC_ITEMS.filter(i => i.type === 'AVATAR').map(item => (
                                    <ShopItemCard
                                        key={item.id}
                                        item={item}
                                        isOwned={inventory.some(i => i.id === item.id)}
                                        onPreview={setPreviewItem}
                                        onBuy={handleItemAction}
                                        variant="default"
                                    />
                                ))}
                            </div>
                        </ShopSection>

                        {/* 2. COMPANIONS */}
                        <ShopSection
                            title="Companions"
                            description="Loyal allies to accompany you on your journey and provide unique bonuses."
                            icon={<Bot size={16} />}
                            titleColorClass="text-sky-500"
                        >
                            <div className="grid grid-cols-2 gap-2">
                                {ALL_ITEMS.filter(i => (i.type === 'COMPANION' || i.slots?.includes('ACCESSORY')) && i.type !== 'AVATAR').map(item => (
                                    <ShopItemCard
                                        key={item.id}
                                        item={item}
                                        isOwned={inventory.some(i => i.id === item.id)}
                                        onPreview={setPreviewItem}
                                        onBuy={handleItemAction}
                                        variant="default"
                                    />
                                ))}
                            </div>
                        </ShopSection>

                        {/* 3. EQUIPMENT */}
                        <ShopSection
                            title="Equipment"
                            description="Powerful gear to enhance your abilities and prepare you for any challenge."
                            icon={<Sword size={16} />}
                            titleColorClass="text-indigo-500"
                        >
                            <div className="grid grid-cols-1 gap-3">
                                {ALL_ITEMS.filter(i => (i.type === 'IN_GAME' || i.type === 'BLACK_MARKET') && i.type !== 'AVATAR' && i.type !== 'THEME').map(item => (
                                    <ShopItemCard
                                        key={item.id}
                                        item={item}
                                        isOwned={inventory.some(i => i.id === item.id)}
                                        onPreview={setPreviewItem}
                                        onBuy={handleItemAction}
                                        variant="list"
                                    />
                                ))}
                            </div>
                        </ShopSection>

                        {/* 4. CURRENCY STORE */}
                        <ShopSection
                            title="Currency Store"
                            description="Stock up on precious gems to unlock premium items and exclusive content."
                            icon={<Diamond size={16} />}
                            titleColorClass="text-cyan-400"
                        >
                            <div className="grid gap-3">
                                {currencyPacks.map(pack => (
                                    <CurrencyPackCard
                                        key={pack.amount}
                                        pack={pack}
                                        onPurchase={handleGemPurchase}
                                    />
                                ))}
                            </div>
                        </ShopSection>

                        {/* 5. AVATAR BACKDROPS */}
                        <ShopSection
                            title="Avatar Backdrop"
                            description="Set the scene for your hero with stunning thematic backgrounds."
                            icon={<Monitor size={16} />}
                            titleColorClass="text-emerald-500"
                        >
                            <div className="grid grid-cols-1 gap-4">
                                {COSMETIC_SHOP_ITEMS.filter(i => i.id.startsWith('theme-')).map(item => (
                                    <ShopItemCard
                                        key={item.id}
                                        item={item}
                                        isOwned={inventory.some(i => i.id === item.id)}
                                        onPreview={setPreviewItem}
                                        onBuy={handleItemAction}
                                        variant="backdrop"
                                    />
                                ))}
                            </div>
                        </ShopSection>

                    </div>
                </div>
            </div>

            {/* GLOBAL MODALS */}
            <ShopCart onAvatarUnlocked={handleUnlockAvatar} />

            <AvatarUnlockModal
                avatar={purchasedAvatar}
                onClose={() => setPurchasedAvatar(null)}
            />

            <ShopItemPreviewModal
                item={previewItem}
                onClose={() => setPreviewItem(null)}
                onAddItem={handleAddItem}
            />

        </div>
    );
};
