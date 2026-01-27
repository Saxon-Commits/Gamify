import React, { useState, useRef, useEffect } from 'react';
import { useGameStore } from '../store/useGameStore';
import { SHOP_ITEMS } from '../src/utils/GameEconomy';
import { COSMETIC_SHOP_ITEMS, ALL_COSMETIC_ITEMS } from '../src/utils/CosmeticsData';
import { User, Bot, Sword, Diamond, Monitor, Construction, Coins } from 'lucide-react';

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

    // Audio refs
    const spaceshipSoundRef = useRef<HTMLAudioElement | null>(null);
    const reactorSoundRef = useRef<HTMLAudioElement | null>(null);

    // Play sounds on component mount
    useEffect(() => {
        // Spaceship entrance sound (plays once)
        spaceshipSoundRef.current = new Audio('/mixkit-alien-spaceship-landing-slowly-2740.wav');
        spaceshipSoundRef.current.volume = 0.3;
        spaceshipSoundRef.current.play().catch(err => console.log('Spaceship audio play failed:', err));

        // Electricity reactor ambient loop (plays continuously at low volume)
        reactorSoundRef.current = new Audio('/mixkit-electricity-reactor-buzz-904.wav');
        reactorSoundRef.current.volume = 0.15;
        reactorSoundRef.current.loop = true;
        reactorSoundRef.current.play().catch(err => console.log('Reactor audio play failed:', err));

        // Cleanup on unmount
        return () => {
            if (spaceshipSoundRef.current) {
                spaceshipSoundRef.current.pause();
                spaceshipSoundRef.current = null;
            }
            if (reactorSoundRef.current) {
                reactorSoundRef.current.pause();
                reactorSoundRef.current = null;
            }
        };
    }, []);

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

    // Filter items by currency
    const goldItems = ALL_ITEMS.filter(item =>
        !item.premiumPrice && // No gem price
        item.cost && // Has gold cost
        item.type !== 'REAL_LIFE' &&
        item.type !== 'SYSTEM'
    );

    const gemItems = ALL_ITEMS.filter(item =>
        item.premiumPrice || // Has gem price
        item.currency === 'GEMS'
    );

    // Group items by type
    const groupItemsByType = (items: any[]) => {
        const groups: { [key: string]: any[] } = {};
        items.forEach(item => {
            const type = item.type;
            if (!groups[type]) groups[type] = [];
            groups[type].push(item);
        });
        return groups;
    };

    const goldGroups = groupItemsByType(goldItems);
    const gemGroups = groupItemsByType(gemItems);

    // Type display names
    const typeNames: { [key: string]: string } = {
        'AVATAR': 'Avatars',
        'COMPANION': 'Companions',
        'IN_GAME': 'Equipment',
        'BLACK_MARKET': 'Black Market',
        'THEME': 'Backdrops'
    };

    // Currency Packs Data
    const currencyPacks = [
        { amount: 100, name: 'Pile of Gems', price: '$1.49', id: 'price_100_gems', color: 'cyan', popular: false, image: '/images/currency/pile of gems (100).png' },
        { amount: 500, name: 'Pouch of Gems', price: '$6.99', id: 'price_500_gems', color: 'blue', popular: true, image: '/images/currency/pouch of gems (500).png' },
        { amount: 1000, name: 'Chest of Gems', price: '$12.99', id: 'price_1000_gems', color: 'purple', popular: false, image: '/images/currency/chest of gems (1000).png' },
        { amount: 10000, name: 'Mountain of Gems', price: '$99.99', id: 'price_10000_gems', color: 'amber', popular: false, image: '/images/currency/mountain of gems (10000).png' },
    ];

    return (
        <div className="max-w-[95%] mx-auto pb-32 space-y-8 relative">
            {/* Shop Background Video */}
            <video
                autoPlay
                loop
                muted
                playsInline
                className="fixed inset-0 z-[-2] w-full h-full object-cover"
                style={{
                    objectPosition: 'center 30px',
                }}
            >
                <source src="/shop background video.mp4" type="video/mp4" />
            </video>
            {/* Dark Overlay */}
            <div className="fixed inset-0 z-[-1] bg-black/45" />

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

                    {/* GOLD OFFERINGS SECTION */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 border-b border-amber-600/30 pb-3">
                            <div className="p-2 rounded-lg bg-amber-600/20 border border-amber-600/40">
                                <Coins size={20} className="text-amber-400" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-amber-400">Gold Offerings</h2>
                                <p className="text-sm text-slate-400">Premium items available for gold</p>
                            </div>
                        </div>

                        {/* Gold Items - Grouped by Type */}
                        <div className="space-y-8">
                            {Object.entries(goldGroups).map(([type, items]) => (
                                <div key={type} className="space-y-3">
                                    <h3 className="text-sm font-bold text-amber-300 uppercase tracking-wider">{typeNames[type] || type}</h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-12 gap-3">
                                        {items.map(item => (
                                            <ShopItemCard
                                                key={item.id}
                                                item={item}
                                                isOwned={inventory.some(i => i.id === item.id)}
                                                onPreview={setPreviewItem}
                                                onBuy={handleItemAction}
                                                variant="compact"
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* GEM OFFERINGS SECTION */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 border-b border-cyan-600/30 pb-3">
                            <div className="p-2 rounded-lg bg-cyan-600/20 border border-cyan-600/40">
                                <Diamond size={20} className="text-cyan-400" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-cyan-400">Gem Offerings</h2>
                                <p className="text-sm text-slate-400">Exclusive items and currency packs</p>
                            </div>
                        </div>

                        {/* Gem Items - Grouped by Type */}
                        <div className="space-y-8">
                            {Object.entries(gemGroups).map(([type, items]) => (
                                <div key={type} className="space-y-3">
                                    <h3 className="text-sm font-bold text-cyan-300 uppercase tracking-wider">{typeNames[type] || type}</h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-12 gap-3">
                                        {items.map(item => (
                                            <ShopItemCard
                                                key={item.id}
                                                item={item}
                                                isOwned={inventory.some(i => i.id === item.id)}
                                                onPreview={setPreviewItem}
                                                onBuy={handleItemAction}
                                                variant="compact"
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))}

                            {/* Currency Packs */}
                            <div className="space-y-3">
                                <h3 className="text-sm font-bold text-cyan-300 uppercase tracking-wider">Currency Packs</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {currencyPacks.map(pack => (
                                        <CurrencyPackCard
                                            key={pack.amount}
                                            pack={pack}
                                            onPurchase={handleGemPurchase}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
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
