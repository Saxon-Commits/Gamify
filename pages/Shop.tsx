import React, { useState, useRef, useEffect } from 'react';
import { QuestDifficulty, Task } from '../types';
import { useGameStore } from '../store/useGameStore';
import { SHOP_ITEMS } from '../src/utils/GameEconomy';
import { COSMETIC_SHOP_ITEMS, NEW_WEAPONS, NEW_COMPANIONS, ALL_COSMETIC_ITEMS } from '../src/utils/CosmeticsData';
import { Coins, ShoppingBag, Tv, Coffee, Sparkles, Zap, Gift, Dna, ShoppingCart, X, Plus, Minus, Trash2, Monitor, Shield, User, Sword, CreditCard, Palette, Ghost, Diamond, CheckCircle2, Bot } from 'lucide-react';

// ... (existing code omitted, I need to match the replacement chunks correctly)

// I will do this in chunks.

// Chunk 1: Imports
// Chunk 2: Update Equipment Column
// Chunk 3: Add Companion Column


import { MerchantCard, MerchantModal } from '../components/MerchantCard';
import { CharacterSidebar } from '../components/character/CharacterSidebar'; // Updated import

import { useAction } from 'convex/react';
import { api } from '../convex/_generated/api';

export const Shop: React.FC = () => {
    const { stats, buyItem, cart, addToCart, removeFromCart, purchaseCart, setAvatar } = useGameStore();
    const [showCart, setShowCart] = useState(false);
    const [isMerchantModalOpen, setIsMerchantModalOpen] = useState(false);
    const [purchasedAvatar, setPurchasedAvatar] = useState<any>(null);
    const [previewItem, setPreviewItem] = useState<any>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
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

    // Rarity Styling Helper
    const RARITY_STYLES: Record<string, {
        border: string;
        bg: string;
        text: string;
        shadow: string;
        glow: string;
        gradient: string;
        button: string;
    }> = {
        COMMON: {
            border: 'border-slate-300 dark:border-slate-400',
            bg: 'bg-slate-100 dark:bg-slate-400',
            text: 'text-slate-700 dark:text-slate-200',
            shadow: 'shadow-slate-400/30',
            glow: 'shadow-[0_0_100px_rgba(148,163,184,0.3)]',
            gradient: 'from-slate-500 to-slate-400',
            button: 'hover:from-slate-400 hover:to-slate-300'
        },
        RARE: {
            border: 'border-blue-400 dark:border-blue-500',
            bg: 'bg-blue-100 dark:bg-blue-500',
            text: 'text-blue-700 dark:text-blue-200',
            shadow: 'shadow-blue-500/30',
            glow: 'shadow-[0_0_100px_rgba(59,130,246,0.3)]',
            gradient: 'from-blue-600 to-blue-500',
            button: 'hover:from-blue-500 hover:to-blue-400'
        },
        MYSTIC: {
            border: 'border-purple-400 dark:border-purple-500',
            bg: 'bg-purple-100 dark:bg-purple-500',
            text: 'text-purple-700 dark:text-purple-200',
            shadow: 'shadow-purple-500/30',
            glow: 'shadow-[0_0_100px_rgba(168,85,247,0.3)]',
            gradient: 'from-purple-600 to-purple-500',
            button: 'hover:from-purple-500 hover:to-purple-400'
        },
        LEGENDARY: {
            border: 'border-amber-400 dark:border-amber-500',
            bg: 'bg-amber-100 dark:bg-amber-500',
            text: 'text-amber-700 dark:text-amber-200',
            shadow: 'shadow-amber-500/30',
            glow: 'shadow-[0_0_100px_rgba(245,158,11,0.3)]',
            gradient: 'from-amber-600 to-amber-500',
            button: 'hover:from-amber-500 hover:to-amber-400'
        }
    };

    const rarityConfig = purchasedAvatar ? (RARITY_STYLES[purchasedAvatar.rarity] || RARITY_STYLES.COMMON) : RARITY_STYLES.COMMON;

    // Set default volume for video
    useEffect(() => {
        if (purchasedAvatar && videoRef.current) {
            videoRef.current.volume = 0.15;
        }
    }, [purchasedAvatar]);

    const handleAddItem = (item: typeof SHOP_ITEMS[0]) => {
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

    const handleCheckout = () => {
        // Check for avatar in cart BEFORE purchase clears it
        const avatarInCart = cart.find(i => i.type === 'AVATAR');

        if (purchaseCart()) {
            setShowCart(false);
            if (avatarInCart) {
                // Look up the FULL item definition to ensure we have videoUrl/imageUrl/perks
                const fullItemDef = SHOP_ITEMS.find(i => i.id === avatarInCart.id);
                if (fullItemDef) {
                    setPurchasedAvatar(fullItemDef);
                }
            }
        } else {
            alert("Not enough gold (or shards) to complete purchase!");
        }
    };

    // Icons map
    const icons: Record<string, any> = {
        netflix: Tv,
        cheat_meal: Coffee,
        new_book: Gift,
        potion_freeze: Zap,
        shard_fragment: Dna
    };

    const realWorldItems = SHOP_ITEMS.filter(i => i.type === 'REAL_LIFE');
    const systemItems = SHOP_ITEMS.filter(i => i.type === 'SYSTEM');
    const blackMarketItems = SHOP_ITEMS.filter(i => i.type === 'BLACK_MARKET');

    // Unified Item List
    const ALL_ITEMS = React.useMemo(() => {
        const map = new Map();
        [...SHOP_ITEMS, ...ALL_COSMETIC_ITEMS].forEach(i => map.set(i.id, i));
        return Array.from(map.values());
    }, []);

    const cartTotal = cart.reduce((sum, i) => sum + ((i.cost || 0) * i.quantity), 0);
    const cartItemCount = cart.reduce((sum, i) => sum + i.quantity, 0);

    return (
        <div className="max-w-[95%] mx-auto pb-32 space-y-8 relative">



            {/* 2. GENERAL ITEMS & COSMETICS MERGED */}
            <div className="flex flex-col lg:flex-row gap-8 mt-8">

                {/* LEFT SIDEBAR - MERCHANT CARD (Moved here) */}
                <div className="w-full lg:w-48 flex-shrink-0 space-y-6 sticky top-4 h-fit self-start">
                    <CharacterSidebar className="hidden lg:block w-full lg:w-48 flex-shrink-0 animate-in slide-in-from-left-4 duration-500" />
                    <MerchantCard onNewQuestClick={() => setIsMerchantModalOpen(true)} isModalOpen={isMerchantModalOpen} />

                    <MerchantModal
                        isOpen={isMerchantModalOpen}
                        onClose={() => setIsMerchantModalOpen(false)}
                        inventory={SHOP_ITEMS}
                        onAddItem={handleAddItem}
                    />

                    {/* Preview Modal */}
                    {previewItem && (
                        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setPreviewItem(null)} />
                            <div className="relative z-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden max-w-lg w-full shadow-2xl animate-in fade-in zoom-in duration-200">
                                {/* Header / Image */}
                                <div className="aspect-video bg-black relative flex items-center justify-center overflow-hidden">
                                    {(previewItem.imageUrl?.endsWith('.mp4')) ? (
                                        <video
                                            src={previewItem.imageUrl}
                                            autoPlay
                                            loop
                                            muted
                                            playsInline
                                            className="w-full h-full object-cover opacity-90"
                                        />
                                    ) : (
                                        <img
                                            src={previewItem.imageUrl || '/images/ui/unknown.png'}
                                            alt={previewItem.name}
                                            className="w-full h-full object-contain p-8 pixelated"
                                        />
                                    )}
                                    <div className="absolute top-2 right-2">
                                        <button onClick={() => setPreviewItem(null)} className="p-2 bg-black/50 hover:bg-black/80 text-white rounded-full transition-colors">
                                            <X size={20} />
                                        </button>
                                    </div>
                                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-900 to-transparent p-6 pt-12">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">{previewItem.rarity || 'Common'} • {previewItem.type}</div>
                                                <h2 className="text-2xl font-black text-white uppercase tracking-tight">{previewItem.name}</h2>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6 space-y-6">
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-500 dark:text-slate-300 uppercase tracking-widest mb-2">Description</h4>
                                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">{previewItem.description}</p>
                                        {previewItem.flavor && <p className="text-slate-500 dark:text-slate-500 italic mt-2 text-xs">"{previewItem.flavor}"</p>}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                                        <div className="flex-1">
                                            <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">Cost</div>
                                            <div className="text-xl font-black text-amber-500 flex items-center gap-1">
                                                {previewItem.premiumPrice ? (
                                                    <><Diamond size={18} /> {previewItem.premiumPrice}</>
                                                ) : previewItem.currency === 'VOID_SHARD' ? (
                                                    <><Sparkles size={18} className="text-purple-500" /> {previewItem.cost}</>
                                                ) : (
                                                    <><Coins size={18} /> {previewItem.cost}</>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                if (previewItem.premiumPrice) {
                                                    const isOwned = useGameStore.getState().inventory.some(owned => owned.id === previewItem.id);
                                                    if (isOwned) return;
                                                    if (confirm(`Purchase ${previewItem.name} for ${previewItem.premiumPrice} Gems?`)) {
                                                        const success = buyItem(previewItem);
                                                        if (!success) alert("Not enough Gems!");
                                                        else setPreviewItem(null);
                                                    }
                                                } else {
                                                    handleAddItem(previewItem);
                                                    setPreviewItem(null);
                                                }
                                            }}
                                            className="flex-[2] py-3 bg-amber-500 hover:bg-amber-600 text-black font-black uppercase tracking-wider rounded-xl transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                                        >
                                            Purchase
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>


                {/* RIGHT CONTENT */}
                <div className="flex-1 space-y-12">









                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

                        {/* 1. AVATARS */}
                        <div className="bg-white/40 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden flex flex-col h-[500px] lg:h-[75vh]">
                            <div className="bg-white/80 dark:bg-slate-900/80 p-4 border-b border-slate-200 dark:border-slate-800 backdrop-blur-sm shrink-0">
                                <h3 className="text-sm font-bold text-pink-500 uppercase tracking-widest flex items-center gap-2">
                                    <User size={16} /> Avatars
                                </h3>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-2 leading-relaxed opacity-80">
                                    Reward yourself with a unique avatar that represents your character in social guilds.
                                </p>
                            </div>
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
                                <div className="grid grid-cols-2 gap-2">
                                    {ALL_COSMETIC_ITEMS.filter(i => i.type === 'AVATAR').map(item => {
                                        const isVoidPrice = item.currency === 'VOID_SHARD';
                                        const rarity = item.rarity || 'COMMON';

                                        // Rarity Styles
                                        const rarityStyles = {
                                            COMMON: { border: 'border-slate-200 dark:border-slate-700', bg: 'bg-white dark:bg-slate-900', text: 'text-slate-600 dark:text-slate-400', glow: 'from-slate-500/10' },
                                            RARE: { border: 'border-blue-400/50 dark:border-blue-500/50', bg: 'bg-blue-50/50 dark:bg-slate-900', text: 'text-blue-600 dark:text-blue-400', glow: 'from-blue-500/20' },
                                            MYSTIC: { border: 'border-purple-400/60 dark:border-purple-500/60', bg: 'bg-purple-50/50 dark:bg-[#1a0b2e]', text: 'text-purple-600 dark:text-purple-400', glow: 'from-purple-500/20' },
                                            LEGENDARY: { border: 'border-amber-400/80 dark:border-amber-500/80', bg: 'bg-amber-50/50 dark:bg-[#2e1a0b]', text: 'text-amber-600 dark:text-amber-400', glow: 'from-amber-500/20' }
                                        };
                                        const style = rarityStyles[rarity];

                                        return (
                                            <div
                                                key={item.id}
                                                onClick={() => setPreviewItem(item)}
                                                className={`relative group overflow-hidden rounded-xl border-2 ${style.border} ${style.bg} transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl cursor-pointer`}
                                            >
                                                {/* Rarity Glow Background */}
                                                <div className={`absolute inset-0 bg-gradient-to-br ${style.glow} to-transparent opacity-50 group-hover:opacity-100 transition-opacity`} />

                                                {/* Content Container */}
                                                <div className="relative z-10 p-3 space-y-3">

                                                    {/* Header: Name & Rarity */}
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h4 className={`font-black uppercase tracking-wider text-xs ${style.text}`}>{item.name}</h4>
                                                            <span className="text-[9px] font-mono opacity-70 tracking-widest">{rarity}</span>
                                                        </div>
                                                        {rarity === 'LEGENDARY' && <Sparkles size={14} className="text-amber-400 animate-pulse" />}
                                                    </div>

                                                    {/* Image Display - Compact */}
                                                    <div className={`w-full aspect-square rounded-lg overflow-hidden border ${style.border} bg-black/5 dark:bg-black/50 relative group-hover:shadow-[0_0_20px_rgba(0,0,0,0.5)] transition-all`}>
                                                        <img
                                                            src={item.imageUrl}
                                                            alt={item.name}
                                                            className="w-full h-full object-cover object-top pixelated hover:scale-110 transition-transform duration-700"
                                                            style={{ imageRendering: 'pixelated' }}
                                                        />
                                                    </div>

                                                    {/* Divider */}
                                                    <div className={`h-px w-full bg-gradient-to-r from-transparent via-${style.text.split('-')[1]}-500/30 to-transparent`} />

                                                    {/* Buy Button */}
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleAddItem(item);
                                                        }}
                                                        className={`w-full py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-2 transition-all group-hover:bg-slate-900/5 dark:group-hover:bg-white/10 ${style.border} border`}
                                                    >
                                                        {isVoidPrice ? <Sparkles size={10} className="text-purple-400" /> : <Coins size={10} className="text-amber-400" />}
                                                        <span className={isVoidPrice ? 'text-purple-300' : 'text-amber-300'}>{item.cost} {isVoidPrice ? 'Shards' : 'Gold'}</span>
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}

                                </div>
                            </div>
                        </div>

                        {/* 2. COMPANIONS (Swapped with Equipment) */}
                        <div className="bg-white/40 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden flex flex-col h-[500px] lg:h-[75vh]">
                            <div className="bg-white/80 dark:bg-slate-900/80 p-4 border-b border-slate-200 dark:border-slate-800 backdrop-blur-sm shrink-0">
                                <h3 className="text-sm font-bold text-sky-500 uppercase tracking-widest flex items-center gap-2">
                                    <Bot size={16} /> Companions
                                </h3>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-2 leading-relaxed opacity-80">
                                    Loyal allies to accompany you on your journey and provide unique bonuses.
                                </p>
                            </div>
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
                                <div className="grid grid-cols-2 gap-2">
                                    {/* Unified Companion List */}
                                    {ALL_ITEMS.filter(i => (i.type === 'COMPANION' || i.slots?.includes('ACCESSORY')) && i.type !== 'AVATAR').map(item => {
                                        const isOwned = useGameStore.getState().inventory.some(owned => owned.id === item.id);
                                        const rarity = item.rarity || 'COMMON';

                                        // Rarity Styles (Reused)
                                        const rarityStyles = {
                                            COMMON: { border: 'border-slate-200 dark:border-slate-700', bg: 'bg-white dark:bg-slate-900', text: 'text-slate-600 dark:text-slate-400', glow: 'from-slate-500/10' },
                                            UNCOMMON: { border: 'border-slate-300 dark:border-slate-600', bg: 'bg-slate-50 dark:bg-slate-800', text: 'text-slate-700 dark:text-slate-300', glow: 'from-slate-400/10' },
                                            RARE: { border: 'border-blue-400/50 dark:border-blue-500/50', bg: 'bg-blue-50/50 dark:bg-slate-900', text: 'text-blue-600 dark:text-blue-400', glow: 'from-blue-500/20' },
                                            EPIC: { border: 'border-purple-400/60 dark:border-purple-500/60', bg: 'bg-purple-50/50 dark:bg-[#1a0b2e]', text: 'text-purple-600 dark:text-purple-400', glow: 'from-purple-500/20' },
                                            MYSTIC: { border: 'border-indigo-400/60 dark:border-indigo-500/60', bg: 'bg-indigo-50/50 dark:bg-[#0b1a2e]', text: 'text-indigo-600 dark:text-indigo-400', glow: 'from-indigo-500/20' },
                                            LEGENDARY: { border: 'border-amber-400/80 dark:border-amber-500/80', bg: 'bg-amber-50/50 dark:bg-[#2e1a0b]', text: 'text-amber-600 dark:text-amber-400', glow: 'from-amber-500/20' }
                                        };
                                        // Fallback for types not in rarityStyles
                                        const style = rarityStyles[rarity as keyof typeof rarityStyles] || rarityStyles.COMMON;

                                        return (
                                            <div
                                                key={item.id}
                                                onClick={() => setPreviewItem(item)}
                                                className={`relative group overflow-hidden rounded-xl border-2 ${style.border} ${style.bg} transition-all duration-300 hover:scale-[1.02] hover:shadow-xl cursor-pointer`}
                                            >
                                                <div className={`absolute inset-0 bg-gradient-to-br ${style.glow} to-transparent opacity-50 group-hover:opacity-100 transition-opacity`} />
                                                <div className="relative z-10 p-3 space-y-3">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h4 className={`font-black uppercase tracking-wider text-[10px] ${style.text}`}>{item.name}</h4>
                                                            <span className="text-[8px] font-mono opacity-70 tracking-widest">{rarity}</span>
                                                        </div>
                                                        {(rarity === 'LEGENDARY' || rarity === 'EPIC') && <Sparkles size={12} className="text-amber-400 animate-pulse" />}
                                                    </div>

                                                    <div className={`w-full aspect-square rounded-lg overflow-hidden border ${style.border} bg-black/5 dark:bg-black/50 relative`}>
                                                        <img
                                                            src={item.imageUrl}
                                                            alt={item.name}
                                                            className="w-full h-full object-contain p-1 pixelated hover:scale-110 transition-transform duration-500"
                                                        />
                                                    </div>

                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleAddItem(item);
                                                        }}
                                                        disabled={isOwned}
                                                        className={`w-full py-1.5 rounded-lg font-bold text-[9px] uppercase tracking-wider flex items-center justify-center gap-2 transition-all group-hover:bg-slate-900/5 dark:group-hover:bg-white/10 ${style.border} border ${isOwned ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    >
                                                        {isOwned ? (
                                                            <>
                                                                <CheckCircle2 size={10} className="text-green-500" />
                                                                <span className="text-green-500">Owned</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                {item.premiumPrice ? <Diamond size={10} className="text-cyan-400" /> : <Coins size={10} className="text-amber-400" />}
                                                                <span className={item.premiumPrice ? 'text-cyan-600 dark:text-cyan-400' : 'text-amber-600 dark:text-amber-400'}>
                                                                    {item.premiumPrice || item.cost} {item.premiumPrice ? 'Gems' : 'Gold'}
                                                                </span>
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* 3. EQUIPMENT (Swapped with Companions) */}
                        <div className="bg-white/40 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden flex flex-col h-[500px] lg:h-[75vh]">
                            <div className="bg-white/80 dark:bg-slate-900/80 p-4 border-b border-slate-200 dark:border-slate-800 backdrop-blur-sm shrink-0">
                                <h3 className="text-sm font-bold text-indigo-500 uppercase tracking-widest flex items-center gap-2">
                                    <Sword size={16} /> Equipment
                                </h3>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-2 leading-relaxed opacity-80">
                                    Powerful gear to enhance your abilities and prepare you for any challenge.
                                </p>
                            </div>
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
                                <div className="grid grid-cols-1 gap-3">
                                    {/* Unified Equipment List */}
                                    {ALL_ITEMS.filter(i =>
                                        // IN_GAME or BLACK_MARKET that isn't a theme or avatar
                                        (i.type === 'IN_GAME' || i.type === 'BLACK_MARKET') &&
                                        i.type !== 'AVATAR' &&
                                        i.type !== 'THEME'
                                    ).map(item => {
                                        const isOwned = useGameStore.getState().inventory.some(owned => owned.id === item.id);
                                        return (
                                            <div
                                                key={item.id}
                                                onClick={() => setPreviewItem(item)}
                                                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex gap-3 group hover:border-indigo-500/50 transition-all relative overflow-hidden cursor-pointer"
                                            >
                                                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-950 rounded-lg flex items-center justify-center border border-slate-200 dark:border-slate-800 shrink-0">
                                                    {item.imageUrl ? (
                                                        <img src={item.imageUrl} alt={item.name} className="w-10 h-10 object-contain pixelated" />
                                                    ) : (
                                                        <Sword size={24} className="text-slate-600" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0 flex flex-col justify-between">
                                                    <div>
                                                        <div className="text-xs font-bold text-slate-200 truncate">{item.name}</div>
                                                        <div className="text-[9px] text-slate-500 line-clamp-1">{item.description}</div>
                                                    </div>
                                                    <div className="flex items-center justify-between mt-2">
                                                        <span className="text-[10px] font-mono text-amber-500">{item.cost}g</span>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleAddItem(item);
                                                            }}
                                                            className={`p-1.5 rounded-lg text-[10px] font-bold uppercase transition-colors flex items-center gap-1 ${isOwned ? 'bg-emerald-500/10 text-emerald-500 cursor-default' : 'bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500 hover:text-white'}`}
                                                            disabled={isOwned}
                                                        >
                                                            {isOwned ? <CheckCircle2 size={12} /> : <Plus size={12} />}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* 3. GEM CURRENCY STORE */}
                        <div className="bg-white/40 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden flex flex-col h-[500px] lg:h-[75vh]">
                            <div className="bg-white/80 dark:bg-slate-900/80 p-4 border-b border-slate-200 dark:border-slate-800 backdrop-blur-sm shrink-0">
                                <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                                    <Diamond size={16} /> Currency Store
                                </h3>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-2 leading-relaxed opacity-80">
                                    Stock up on precious gems to unlock premium items and exclusive content.
                                </p>
                            </div>
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
                                <div className="grid gap-3">
                                    {[
                                        { amount: 100, name: 'Pile of Gems', price: '$1.49', id: 'price_100_gems', color: 'cyan', popular: false, image: '/images/currency/pile of gems (100).png' },
                                        { amount: 500, name: 'Pouch of Gems', price: '$6.99', id: 'price_500_gems', color: 'blue', popular: true, image: '/images/currency/pouch of gems (500).png' },
                                        { amount: 1000, name: 'Chest of Gems', price: '$12.99', id: 'price_1000_gems', color: 'purple', popular: false, image: '/images/currency/chest of gems (1000).png' },
                                        { amount: 10000, name: 'Mountain of Gems', price: '$99.99', id: 'price_10000_gems', color: 'amber', popular: false, image: '/images/currency/mountain of gems (10000).png' },
                                    ].map((pack) => (
                                        <div key={pack.amount} className={`relative bg-gradient-to-br from-white to-slate-100 dark:from-slate-900 dark:to-slate-950 border ${pack.popular ? 'border-cyan-500/50 shadow-cyan-500/20 shadow-lg' : 'border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600'} rounded-2xl p-3 flex items-center justify-between gap-3 group overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02]`}>

                                            {/* Background Flair Effects */}
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite] pointer-events-none" />
                                            <div className={`absolute -right-12 -top-12 w-32 h-32 bg-${pack.color}-500/10 blur-3xl rounded-full group-hover:bg-${pack.color}-500/20 transition-colors pointer-events-none`} />

                                            {pack.popular && (
                                                <div className="absolute top-0 right-0 bg-gradient-to-bl from-cyan-600 to-blue-600 text-white text-[9px] font-black uppercase px-3 py-1 rounded-bl-xl shadow-lg z-10">
                                                    Best Value
                                                </div>
                                            )}

                                            <div className="flex items-center gap-3 relative z-10 flex-1 min-w-0">
                                                {/* Image Container - Slightly Reduced for Space */}
                                                <div className="relative shrink-0">
                                                    <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity" />
                                                    <div className="w-16 h-16 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center shadow-inner relative z-10 group-hover:border-cyan-500/30 transition-colors">
                                                        <img src={pack.image} alt={`${pack.amount} Gems`} className="w-12 h-12 object-contain pixelated drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] group-hover:scale-110 transition-transform duration-300" />
                                                    </div>
                                                </div>

                                                <div className="flex flex-col gap-0.5 min-w-0">
                                                    <div className="font-black text-slate-900 dark:text-white text-xl tracking-tight drop-shadow-sm">{pack.amount}</div>
                                                    <div className="text-[9px] text-cyan-600 dark:text-cyan-400 font-bold uppercase tracking-wide bg-cyan-100/50 dark:bg-cyan-950/30 px-1.5 py-0.5 rounded border border-cyan-200 dark:border-cyan-900/50 w-fit whitespace-nowrap overflow-hidden text-ellipsis">
                                                        {pack.name.replace(' Gems', '')} <span className="text-cyan-600 ml-0.5">GEMS</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => handleGemPurchase(pack.id)}
                                                className={`
                                                    shrink-0 px-4 py-2.5 rounded-lg font-black text-xs uppercase tracking-wider transition-all relative overflow-hidden group/btn
                                                    bg-slate-900 text-slate-300 border border-slate-700
                                                    hover:bg-cyan-500 hover:text-black hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]
                                                `}
                                            >
                                                <span className="relative z-10 whitespace-nowrap">{pack.price}</span>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* 5. AVATAR BACKDROPS (Moved to here, pos 5) */}
                        <div className="bg-white/40 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden flex flex-col h-[500px] lg:h-[75vh]">
                            <div className="bg-white/80 dark:bg-slate-900/80 p-4 border-b border-slate-200 dark:border-slate-800 backdrop-blur-sm shrink-0">
                                <h3 className="text-sm font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                                    <Monitor size={16} /> Avatar Backdrop
                                </h3>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-2 leading-relaxed opacity-80">
                                    Set the scene for your hero with stunning thematic backgrounds.
                                </p>
                            </div>
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
                                <div className="grid grid-cols-1 gap-4">
                                    {COSMETIC_SHOP_ITEMS.filter(i => i.id.startsWith('theme-')).map(item => {
                                        const isOwned = useGameStore.getState().inventory.some(owned => owned.id === item.id);

                                        const handleBuy = () => {
                                            if (isOwned) return;
                                            if (confirm(`Purchase ${item.name} for ${item.premiumPrice} Gems?`)) {
                                                const success = buyItem(item);
                                                if (!success) alert("Not enough Gems!");
                                            }
                                        };

                                        return (
                                            <div
                                                key={item.id}
                                                onClick={() => setPreviewItem(item)}
                                                className={`relative aspect-video bg-slate-100 dark:bg-slate-900 rounded-xl overflow-hidden border transition-all cursor-pointer group ${isOwned ? 'border-emerald-500/50 opacity-80' : 'border-slate-200 dark:border-slate-800 hover:border-emerald-500/50'}`}
                                            >
                                                {item.imageUrl.endsWith('.mp4') ? (
                                                    <video
                                                        src={item.imageUrl}
                                                        className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                                                        autoPlay
                                                        loop
                                                        muted
                                                        playsInline
                                                    />
                                                ) : (
                                                    <img src={item.imageUrl} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                                                )}

                                                {/* OWNED BADGE */}
                                                {isOwned && (
                                                    <div className="absolute top-2 right-2 bg-emerald-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider z-10 box-border">
                                                        Owned
                                                    </div>
                                                )}

                                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent flex flex-col justify-end p-4">
                                                    <div className="flex justify-between items-end">
                                                        <div>
                                                            <h4 className="font-bold text-white text-sm">{item.name}</h4>
                                                            <p className="text-[10px] text-slate-400">{item.description}</p>
                                                        </div>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleBuy();
                                                            }}
                                                            className={`font-bold px-2 py-1 rounded-lg text-[10px] flex items-center gap-1 transition-colors ${isOwned ? 'bg-emerald-900/50 text-emerald-500 border border-emerald-500/30' : 'bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-cyan-500/30'}`}
                                                        >
                                                            {isOwned ? (
                                                                <>
                                                                    <CheckCircle2 size={10} /> Owned
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Diamond size={10} /> {item.premiumPrice}
                                                                </>
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>

                    </div>
                    {/* End of Section */}



                </div>

            </div>



            {/* CART DRAWER / SUMMARY */}
            {
                cartItemCount > 0 && (
                    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-40">
                        <div
                            onClick={() => setShowCart(true)}
                            className="bg-indigo-600 hover:bg-indigo-500 cursor-pointer text-white p-4 rounded-2xl shadow-2xl shadow-indigo-900/50 border border-indigo-400/50 flex items-center justify-between transition-all active:scale-95"
                        >
                            <div className="flex items-center gap-3">
                                <div className="bg-white/20 p-2 rounded-lg">
                                    <ShoppingCart size={20} className="text-white" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold opacity-80 uppercase tracking-wider">Shopping Cart</span>
                                    <span className="font-black text-lg leading-none">{cartItemCount} Items</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <span className="text-xs font-medium opacity-70 block">Total</span>
                                    <span className="font-bold font-mono">{cartTotal}g</span>
                                </div>
                                <div className="bg-white/20 px-3 py-1.5 rounded-lg text-xs font-bold uppercase">
                                    Review
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* CART MODAL */}
            {
                showCart && (
                    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/90 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
                            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 sticky top-0">
                                <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                                    <ShoppingCart className="text-indigo-400" />
                                    Review Order
                                </h3>
                                <button onClick={() => setShowCart(false)} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 transition-colors"><X size={20} /></button>
                            </div>

                            <div className="p-4 overflow-y-auto space-y-3 flex-1">
                                {cart.length === 0 ? (
                                    <p className="text-center text-slate-500 py-8">Your cart is empty.</p>
                                ) : cart.map(item => (
                                    <div key={item.id} className="flex items-center justify-between bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-slate-100 dark:bg-slate-900 rounded-lg flex items-center justify-center text-slate-500 dark:text-slate-400">
                                                {icons[item.id] ? React.createElement(icons[item.id], { size: 18 }) : <ShoppingBag size={18} />}
                                            </div>
                                            <div>
                                                <div className="font-bold text-sm text-slate-800 dark:text-slate-200">{item.name}</div>
                                                <div className="text-xs text-amber-500 font-mono">{item.cost}g</div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 bg-slate-900 rounded-lg p-1">
                                            <button onClick={() => removeFromCart(item.id)} className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-red-400"><Minus size={14} /></button>
                                            <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                                            <button onClick={() => addToCart(item)} className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-green-400"><Plus size={14} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>



                            <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-slate-400 text-sm">Total Cost</span>
                                    <span className={`text-xl font-black font-mono ${stats.gold < cartTotal ? 'text-red-500' : 'text-amber-400'}`}>
                                        {cartTotal}g
                                    </span>
                                </div>

                                <button
                                    onClick={handleCheckout}
                                    disabled={cart.length === 0 || stats.gold < cartTotal}
                                    className={`w-full py-4 rounded-xl font-black uppercase tracking-wider text-sm flex items-center justify-center gap-2 transition-all
                                    ${cart.length === 0 || stats.gold < cartTotal
                                            ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                                            : 'bg-green-500 hover:bg-green-400 text-white shadow-lg shadow-green-500/25 active:scale-[0.98]'}
                                `}
                                >
                                    {stats.gold < cartTotal ? 'Insufficient Funds' : 'Confirm Purchase'}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
            {/* AVATAR UNLOCK MODAL */}
            {
                purchasedAvatar && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setPurchasedAvatar(null)} />

                        {/* Card Container - Dynamic Rarity Styling */}
                        <div className={`relative bg-[#0f0518] border-2 ${rarityConfig.border} rounded-[2rem] overflow-hidden max-w-md w-full ${rarityConfig.glow} animate-in fade-in zoom-in duration-300 flex flex-col`}>

                            {/* 1. TOP VIDEO SECTION (Aspect Ratio 16:9 for Full Visibility) */}
                            <div className={`relative w-full aspect-video border-b-2 ${rarityConfig.border} overflow-hidden bg-black`}>
                                {/* Main Character Layer - Full Fill */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    {purchasedAvatar.videoUrl ? (
                                        <video
                                            ref={videoRef}
                                            src={purchasedAvatar.videoUrl}
                                            autoPlay
                                            loop
                                            className="w-full h-full object-cover"
                                            onError={(e) => console.error("Video Error:", e)}
                                        />
                                    ) : (
                                        <img src={purchasedAvatar.imageUrl} className="w-full h-full object-cover pixelated" />
                                    )}
                                </div>

                                {/* Inner Shadow Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                            </div>

                            {/* 2. BOTTOM CONTENT SECTION */}
                            <div className="p-6 flex flex-col gap-4 bg-gradient-to-b from-[#130720] to-[#0f0518]">
                                <div className="space-y-3">
                                    <div className="flex justify-center">
                                        <span className={`${rarityConfig.bg} text-black text-[10px] font-black uppercase px-3 py-1 rounded-full animate-pulse shadow-[0_0_15px_rgba(255,255,255,0.2)] tracking-widest`}>
                                            {purchasedAvatar.rarity} Unlocked
                                        </span>
                                    </div>
                                    <div className="text-center">
                                        <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-1 drop-shadow-md">
                                            {purchasedAvatar.name}
                                        </h2>
                                        <p className="text-xs text-slate-400 italic leading-relaxed line-clamp-2 px-2">
                                            "{purchasedAvatar.lore}"
                                        </p>
                                    </div>

                                    {/* Innate Perks Grid */}
                                    <div className="grid grid-cols-2 gap-2 pt-2">
                                        {Object.entries(purchasedAvatar.perks || {}).slice(0, 4).map(([key, val]) => (
                                            <div key={key} className={`bg-black/40 border ${rarityConfig.border}/20 p-2 rounded-lg flex flex-col items-center justify-center relative overflow-hidden group hover:${rarityConfig.border}/40 transition-colors`}>
                                                <div className={`absolute inset-0 ${rarityConfig.bg}/5 opacity-0 group-hover:opacity-100 transition-opacity`} />
                                                <span className={`text-[9px] ${rarityConfig.text} uppercase tracking-widest mb-0.5 opacity-80`}>{key.replace(/([A-Z])/g, ' $1').replace('Modifier', '').trim()}</span>
                                                <span className={`text-sm font-mono font-bold ${rarityConfig.text.replace('200', '400')}`}>+{Number(val) < 1 ? `${Number(val) * 100}%` : val}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={() => setPurchasedAvatar(null)}
                                        className="flex-1 py-3 rounded-xl border border-slate-700 hover:border-slate-500 text-slate-400 font-bold uppercase text-xs transition-colors hover:bg-slate-800"
                                    >
                                        Store
                                    </button>
                                    <button
                                        onClick={() => {
                                            setAvatar(purchasedAvatar.imageUrl);
                                            setPurchasedAvatar(null);
                                        }}
                                        className={`flex-[2] py-3 rounded-xl bg-gradient-to-r ${rarityConfig.gradient} ${rarityConfig.button} text-black font-black uppercase text-xs transition-all shadow-lg transform hover:-translate-y-0.5`}
                                    >
                                        Equip Now
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

        </div >

    );
};
