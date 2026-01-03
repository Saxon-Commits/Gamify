import React, { useState, useRef, useEffect } from 'react';
import { QuestDifficulty, Task } from '../types';
import { useGameStore } from '../store/useGameStore';
import { SHOP_ITEMS } from '../src/utils/GameEconomy';
import { COSMETIC_SHOP_ITEMS } from '../src/utils/CosmeticsData';
import { Coins, ShoppingBag, Tv, Coffee, Sparkles, Zap, Gift, Dna, ShoppingCart, X, Plus, Minus, Trash2, Monitor, Shield, User, Sword, CreditCard, Palette, Ghost, Diamond, CheckCircle2 } from 'lucide-react';

import { MerchantCard } from '../components/MerchantCard'; // Updated import

export const Shop: React.FC = () => {
    const { stats, buyItem, cart, addToCart, removeFromCart, purchaseCart, setAvatar } = useGameStore();
    const [showCart, setShowCart] = useState(false);
    const [activeTab, setActiveTab] = useState<'general' | 'cosmetics'>('general');
    const [purchasedAvatar, setPurchasedAvatar] = useState<any>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

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
            border: 'border-slate-400',
            bg: 'bg-slate-400',
            text: 'text-slate-200',
            shadow: 'shadow-slate-400/30',
            glow: 'shadow-[0_0_100px_rgba(148,163,184,0.3)]',
            gradient: 'from-slate-500 to-slate-400',
            button: 'hover:from-slate-400 hover:to-slate-300'
        },
        RARE: {
            border: 'border-blue-500',
            bg: 'bg-blue-500',
            text: 'text-blue-200',
            shadow: 'shadow-blue-500/30',
            glow: 'shadow-[0_0_100px_rgba(59,130,246,0.3)]',
            gradient: 'from-blue-600 to-blue-500',
            button: 'hover:from-blue-500 hover:to-blue-400'
        },
        MYSTIC: {
            border: 'border-purple-500',
            bg: 'bg-purple-500',
            text: 'text-purple-200',
            shadow: 'shadow-purple-500/30',
            glow: 'shadow-[0_0_100px_rgba(168,85,247,0.3)]',
            gradient: 'from-purple-600 to-purple-500',
            button: 'hover:from-purple-500 hover:to-purple-400'
        },
        LEGENDARY: {
            border: 'border-amber-500',
            bg: 'bg-amber-500',
            text: 'text-amber-200',
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

    const cartTotal = cart.reduce((sum, i) => sum + ((i.cost || 0) * i.quantity), 0);
    const cartItemCount = cart.reduce((sum, i) => sum + i.quantity, 0);

    return (
        <div className="max-w-[95%] mx-auto pb-32 space-y-8 relative">
            {/* Header / Wallet */}
            <div className="flex items-center justify-between">
                <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
                    <button
                        onClick={() => setActiveTab('general')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'general' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        General Store
                    </button>
                    <button
                        onClick={() => setActiveTab('cosmetics')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'cosmetics' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:text-indigo-400'}`}
                    >
                        <Sparkles size={14} />
                        Cosmetics
                    </button>
                </div>
            </div>

            {/* GEM WALLET (Visible on Cosmetics Tab) */}
            {activeTab === 'cosmetics' && (
                <div className="flex items-center gap-4 bg-slate-900 p-2 pr-6 rounded-xl border border-slate-800 animate-in fade-in slide-in-from-right-10">
                    <div className="bg-cyan-500/20 p-2 rounded-lg">
                        <Diamond size={16} className="text-cyan-400" />
                    </div>
                    <div>
                        <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Gems</div>
                        <div className="text-lg font-black text-cyan-500 leading-none">{stats.gems}</div>
                    </div>
                    <button className="ml-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors shadow-lg shadow-cyan-500/20">
                        + Buy
                    </button>
                </div>
            )}





            {/* ITEMS INVENTORY */}
            {/* MAIN LAYOUT: Sidebar + Content */}
            <div className="flex flex-col lg:flex-row gap-8">

                {/* LEFT SIDEBAR - MERCHANT CARD */}
                <div className="w-full lg:w-80 flex-shrink-0 space-y-6">
                    <MerchantCard />

                    {/* Could add other sidebar widgets here later (e.g. Special Offers) */}
                </div>

                {/* RIGHT CONTENT - ITEMS GRID */}
                <div className="flex-1 space-y-6">
                    {activeTab === 'general' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

                            {/* 5. AVATARS (Moved to start or end? Index 5) */}
                            <div className="bg-slate-900/40 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-[75vh]">
                                <div className="bg-slate-900/80 p-4 border-b border-slate-800 backdrop-blur-sm shrink-0">
                                    <h3 className="text-sm font-bold text-pink-500 uppercase tracking-widest flex items-center gap-2">
                                        <User size={16} /> Avatars
                                    </h3>
                                </div>
                                <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
                                    <div className="grid grid-cols-2 gap-2">
                                        {SHOP_ITEMS.filter(i => i.type === 'AVATAR').map(item => {
                                            const isVoidPrice = item.currency === 'VOID_SHARD';
                                            const rarity = item.rarity || 'COMMON';

                                            // Rarity Styles
                                            const rarityStyles = {
                                                COMMON: { border: 'border-slate-700', bg: 'bg-slate-900', text: 'text-slate-400', glow: 'from-slate-500/10' },
                                                RARE: { border: 'border-blue-500/50', bg: 'bg-slate-900', text: 'text-blue-400', glow: 'from-blue-500/20' },
                                                MYSTIC: { border: 'border-purple-500/60', bg: 'bg-[#1a0b2e]', text: 'text-purple-400', glow: 'from-purple-500/20' },
                                                LEGENDARY: { border: 'border-amber-500/80', bg: 'bg-[#2e1a0b]', text: 'text-amber-400', glow: 'from-amber-500/20' }
                                            };
                                            const style = rarityStyles[rarity];

                                            return (
                                                <div key={item.id} className={`relative group overflow-hidden rounded-xl border-2 ${style.border} ${style.bg} transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl`}>
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
                                                        <div className={`w-full aspect-square rounded-lg overflow-hidden border ${style.border} bg-black/50 relative group-hover:shadow-[0_0_20px_rgba(0,0,0,0.5)] transition-all`}>
                                                            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover pixelated hover:scale-110 transition-transform duration-700" />
                                                        </div>

                                                        {/* Divider */}
                                                        <div className={`h-px w-full bg-gradient-to-r from-transparent via-${style.text.split('-')[1]}-500/30 to-transparent`} />

                                                        {/* Stats & Slots Grid */}
                                                        <div className="grid grid-cols-2 gap-2 text-[9px]">
                                                            {/* Perks */}
                                                            <div className="space-y-1">
                                                                <span className="text-slate-500 font-bold uppercase tracking-wider text-[8px]">Perks</span>
                                                                {item.perks?.xpModifier && <div className="text-green-400">+{(item.perks.xpModifier * 100).toFixed(0)}% XP</div>}
                                                                {item.perks?.goldModifier && <div className="text-amber-400">+{(item.perks.goldModifier * 100).toFixed(0)}% Gold</div>}
                                                                {item.perks?.luckModifier && <div className="text-purple-400">+{(item.perks.luckModifier * 100).toFixed(0)}% Luck</div>}
                                                                {(item.perks as any)?.energyMaxBonus && <div className="text-blue-400">+{(item.perks as any).energyMaxBonus} Max NRG</div>}
                                                                {item.perks?.shopDiscount && <div className="text-emerald-400">-{(item.perks.shopDiscount * 100).toFixed(0)}% Shop</div>}
                                                            </div>

                                                            {/* Slots */}
                                                            <div className="space-y-1 text-right">
                                                                <span className="text-slate-500 font-bold uppercase tracking-wider text-[8px]">Slots</span>
                                                                <div className="flex flex-wrap justify-end gap-1">
                                                                    {item.slots && item.slots.length > 0 ? (
                                                                        item.slots.map(slot => (
                                                                            <div key={slot} title={slot} className={`w-4 h-4 rounded border ${style.border} bg-black/30 flex items-center justify-center text-slate-300`}>
                                                                                {slot === 'WEAPON' && <Sword size={8} />}
                                                                                {slot === 'ARMOR' && <Shield size={8} />}
                                                                                {slot === 'ACCESSORY' && <Sparkles size={8} />}
                                                                            </div>
                                                                        ))
                                                                    ) : (
                                                                        <span className="text-slate-600 italic">None</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Buy Button */}
                                                        <button
                                                            onClick={() => handleAddItem(item)}
                                                            className={`w-full py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-2 transition-all group-hover:bg-white/10 ${style.border} border`}
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

                            {/* 1. Real World Rewards */}
                            <div className="bg-slate-900/40 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-[75vh]">
                                <div className="bg-slate-900/80 p-4 border-b border-slate-800 backdrop-blur-sm shrink-0">
                                    <h3 className="text-sm font-bold text-amber-500 uppercase tracking-widest flex items-center gap-2">
                                        <Gift size={16} /> Real Life Rewards
                                    </h3>
                                </div>
                                <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
                                    <div className="grid gap-3">
                                        {realWorldItems.map(item => {
                                            const Icon = icons[item.id] || Gift;
                                            return (
                                                <div key={item.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between group hover:border-amber-500/30 transition-all">
                                                    <div className="flex items-center gap-4">
                                                        <div className="p-3 bg-slate-800 rounded-lg text-slate-400 group-hover:text-amber-400 transition-colors shrink-0 w-20 h-20 flex items-center justify-center overflow-hidden">
                                                            {(item as any).imageUrl ? (
                                                                <img src={(item as any).imageUrl} alt={item.name} className="w-full h-full object-cover pixelated" />
                                                            ) : (
                                                                <Icon size={20} />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-slate-200">{item.name}</h4>
                                                            <div className="text-xs text-amber-500 font-mono flex items-center gap-1">
                                                                <Coins size={10} />
                                                                {item.cost}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleAddItem(item)}
                                                        className="w-10 h-10 flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-700"
                                                    >
                                                        <Plus size={18} />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* 2. System Upgrades */}
                            <div className="bg-slate-900/40 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-[75vh]">
                                <div className="bg-slate-900/80 p-4 border-b border-slate-800 backdrop-blur-sm shrink-0">
                                    <h3 className="text-sm font-bold text-blue-400 uppercase tracking-widest flex items-center gap-2">
                                        <Zap size={16} /> System Upgrades
                                    </h3>
                                </div>
                                <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
                                    <div className="grid gap-3">
                                        {systemItems.map(item => {
                                            const Icon = icons[item.id] || Zap;
                                            return (
                                                <div key={item.id} className="bg-slate-900/50 border border-blue-900/30 p-4 rounded-xl flex items-center justify-between group hover:bg-slate-900/80 transition-all">
                                                    <div className="flex items-center gap-4">
                                                        <div className="p-3 bg-blue-900/20 rounded-lg text-blue-400 group-hover:text-blue-300 transition-colors shrink-0 w-20 h-20 flex items-center justify-center overflow-hidden">
                                                            {(item as any).imageUrl ? (
                                                                <img src={(item as any).imageUrl} alt={item.name} className="w-full h-full object-cover pixelated" />
                                                            ) : (
                                                                <Icon size={20} />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-slate-200">{item.name}</h4>
                                                            <p className="text-[10px] text-slate-500 max-w-[150px] leading-tight">{item.description}</p>
                                                            <div className="text-xs text-amber-500 font-mono flex items-center gap-1 mt-1">
                                                                <Coins size={10} />
                                                                {item.cost}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleAddItem(item)}
                                                        className="w-10 h-10 flex items-center justify-center bg-blue-900/30 hover:bg-blue-900/50 text-blue-300 rounded-lg transition-colors border border-blue-500/30"
                                                    >
                                                        <Plus size={18} />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* 3. Black Market */}
                            <div className="bg-slate-900/40 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-[75vh]">
                                <div className="bg-slate-900/80 p-4 border-b border-slate-800 backdrop-blur-sm shrink-0">
                                    <h3 className="text-sm font-bold text-purple-500 uppercase tracking-widest flex items-center gap-2">
                                        <Sparkles size={16} /> Black Market
                                    </h3>
                                </div>
                                <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
                                    <div className="grid gap-3">
                                        {blackMarketItems.map(item => {
                                            const Icon = icons[item.id] || Sparkles;
                                            return (
                                                <div key={item.id} className="bg-slate-950 border border-purple-900/30 p-4 rounded-xl flex items-center justify-between group hover:border-purple-500/50 transition-all relative overflow-hidden">
                                                    <div className="absolute inset-0 bg-purple-900/5 pointer-events-none"></div>
                                                    <div className="flex items-center gap-4 relative z-10">
                                                        <div className="p-3 bg-purple-900/20 rounded-lg text-purple-400 group-hover:text-purple-300 transition-colors shrink-0 w-20 h-20 flex items-center justify-center overflow-hidden">
                                                            {(item as any).imageUrl ? (
                                                                <img src={(item as any).imageUrl} alt={item.name} className="w-full h-full object-cover pixelated" />
                                                            ) : (
                                                                <Icon size={20} />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-purple-200">{item.name}</h4>
                                                            <p className="text-[10px] text-purple-400/60 max-w-[150px] leading-tight">{item.description}</p>
                                                            <div className="text-xs text-purple-400 font-mono flex items-center gap-1 mt-1">
                                                                <Sparkles size={10} />
                                                                {item.cost} Shards
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleAddItem(item)}
                                                        className="w-10 h-10 flex items-center justify-center bg-purple-900/30 hover:bg-purple-900/50 text-purple-300 rounded-lg transition-colors border border-purple-500/30 relative z-10"
                                                    >
                                                        <Plus size={18} />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>


                        </div>
                    ) : (
                        <div className="space-y-8 animate-in fade-in duration-300">
                            {/* COSMETICS TAB CONTENT */}

                            {/* 1. PREMIUM AVATARS */}
                            <div className="space-y-4">
                                <h3 className="text-xl font-black text-white italic uppercase tracking-tighter flex items-center gap-2">
                                    <User className="text-pink-500" /> Premium Skins
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {COSMETIC_SHOP_ITEMS.filter(i => i.type === 'AVATAR').map((item) => (
                                        <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden group hover:border-pink-500/50 transition-all hover:shadow-[0_0_30px_rgba(236,72,153,0.15)] flex flex-col">
                                            <div className="relative aspect-[4/5] overflow-hidden bg-black">
                                                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                                                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-[10px] font-bold text-white uppercase tracking-wider">
                                                    {item.rarity}
                                                </div>
                                            </div>
                                            <div className="p-4 flex flex-col flex-1">
                                                <h4 className="font-black text-lg text-white uppercase tracking-tight">{item.name}</h4>
                                                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{item.description}</p>

                                                <div className="mt-auto pt-4 flex items-center gap-3">
                                                    <button className="flex-1 bg-slate-800 text-white font-black py-3 rounded-xl uppercase text-xs hover:bg-slate-700 transition-colors flex items-center justify-center gap-2 border border-slate-700">
                                                        <Diamond size={12} className="text-cyan-400" />
                                                        <span>{item.premiumPrice}</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* 2. THEMES & UI */}
                            <div className="space-y-4">
                                <h3 className="text-xl font-black text-white italic uppercase tracking-tighter flex items-center gap-2">
                                    <Monitor className="text-emerald-500" /> Avatar Backdrop
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                                                onClick={handleBuy}
                                                className={`relative aspect-video bg-slate-900 rounded-2xl overflow-hidden border transition-all cursor-pointer group ${isOwned ? 'border-emerald-500/50 opacity-80' : 'border-slate-800 hover:border-emerald-500/50'}`}
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
                                                            <h4 className="font-bold text-white">{item.name}</h4>
                                                            <p className="text-xs text-slate-400">{item.description}</p>
                                                        </div>
                                                        <button
                                                            className={`font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors ${isOwned ? 'bg-emerald-900/50 text-emerald-500 border border-emerald-500/30' : 'bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-cyan-500/30'}`}
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

                            {/* 3. COMPANIONS */}
                            <div className="space-y-4">
                                <h3 className="text-xl font-black text-white italic uppercase tracking-tighter flex items-center gap-2">
                                    <Ghost className="text-purple-500" /> Digital Companions
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                    {COSMETIC_SHOP_ITEMS.filter(i => i.id.startsWith('pet-')).map(item => (
                                        <div key={item.id} className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 flex flex-col items-center gap-3 hover:bg-slate-800 transition-colors group">
                                            <img src={item.imageUrl} className="w-16 h-16 drop-shadow-lg group-hover:-translate-y-1 transition-transform" />
                                            <div className="text-center">
                                                <div className="font-bold text-xs text-slate-200">{item.name}</div>
                                                <div className="text-[10px] text-cyan-400 font-mono mt-1 flex items-center gap-1 justify-center">
                                                    <Diamond size={8} /> {item.premiumPrice}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>
                    )}
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
                        <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
                            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900 sticky top-0">
                                <h3 className="text-xl font-black text-white flex items-center gap-2">
                                    <ShoppingCart className="text-indigo-400" />
                                    Review Order
                                </h3>
                                <button onClick={() => setShowCart(false)} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 transition-colors"><X size={20} /></button>
                            </div>

                            <div className="p-4 overflow-y-auto space-y-3 flex-1">
                                {cart.length === 0 ? (
                                    <p className="text-center text-slate-500 py-8">Your cart is empty.</p>
                                ) : cart.map(item => (
                                    <div key={item.id} className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center text-slate-400">
                                                {icons[item.id] ? React.createElement(icons[item.id], { size: 18 }) : <ShoppingBag size={18} />}
                                            </div>
                                            <div>
                                                <div className="font-bold text-sm text-slate-200">{item.name}</div>
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



                            <div className="p-5 border-t border-slate-800 bg-slate-900">
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
                                            ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
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
