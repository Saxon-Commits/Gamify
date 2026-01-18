import React from 'react';
import { Sparkles, Coins, Diamond, CheckCircle2, Plus, Sword } from 'lucide-react';

interface ShopItemCardProps {
    item: any;
    isOwned: boolean;
    onPreview: (item: any) => void;
    onBuy: (item: any) => void;
    variant?: 'default' | 'list' | 'backdrop';
}

// Reusing the granular Rarity Styles from the Monolith for consistency
// Note: These differ slightly between usage in Monolith but I am standardizing them here.
const RARITY_STYLES: Record<string, { border: string, bg: string, text: string, glow: string }> = {
    COMMON: { border: 'border-slate-200 dark:border-slate-700', bg: 'bg-white dark:bg-slate-900', text: 'text-slate-600 dark:text-slate-400', glow: 'from-slate-500/10' },
    UNCOMMON: { border: 'border-slate-300 dark:border-slate-600', bg: 'bg-slate-50 dark:bg-slate-800', text: 'text-slate-700 dark:text-slate-300', glow: 'from-slate-400/10' },
    RARE: { border: 'border-blue-400/50 dark:border-blue-500/50', bg: 'bg-blue-50/50 dark:bg-slate-900', text: 'text-blue-600 dark:text-blue-400', glow: 'from-blue-500/20' },
    EPIC: { border: 'border-purple-400/60 dark:border-purple-500/60', bg: 'bg-purple-50/50 dark:bg-[#1a0b2e]', text: 'text-purple-600 dark:text-purple-400', glow: 'from-purple-500/20' },
    MYSTIC: { border: 'border-indigo-400/60 dark:border-indigo-500/60', bg: 'bg-indigo-50/50 dark:bg-[#0b1a2e]', text: 'text-indigo-600 dark:text-indigo-400', glow: 'from-indigo-500/20' },
    LEGENDARY: { border: 'border-amber-400/80 dark:border-amber-500/80', bg: 'bg-amber-50/50 dark:bg-[#2e1a0b]', text: 'text-amber-600 dark:text-amber-400', glow: 'from-amber-500/20' }
};

export const ShopItemCard: React.FC<ShopItemCardProps> = ({ item, isOwned, onPreview, onBuy, variant = 'default' }) => {
    // 1. BACKDROP VARIANT (Video/Image Banner)
    if (variant === 'backdrop') {
        return (
            <div
                onClick={() => onPreview(item)}
                className={`relative aspect-video bg-slate-100 dark:bg-slate-900 rounded-xl overflow-hidden border transition-all cursor-pointer group ${isOwned ? 'border-emerald-500/50 opacity-80' : 'border-slate-200 dark:border-slate-800 hover:border-emerald-500/50'}`}
            >
                {item.imageUrl && item.imageUrl.endsWith('.mp4') ? (
                    <video
                        src={item.imageUrl}
                        className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                        autoPlay
                        loop
                        muted
                        playsInline
                    />
                ) : (
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
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
                                onBuy(item);
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
        );
    }

    // 2. LIST VARIANT (Equipment)
    if (variant === 'list') {
        return (
            <div
                onClick={() => onPreview(item)}
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
                                onBuy(item);
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
    }

    // 3. DEFAULT VARIANT (Avatars / Companions)
    const rarity = item.rarity || 'COMMON';
    const style = RARITY_STYLES[rarity] || RARITY_STYLES.COMMON;
    const isVoidPrice = item.currency === 'VOID_SHARD';
    const isPremium = !!item.premiumPrice;

    return (
        <div
            onClick={() => onPreview(item)}
            className={`relative group overflow-hidden rounded-xl border-2 ${style.border} ${style.bg} transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl cursor-pointer`}
        >
            {/* Rarity Glow Background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${style.glow} to-transparent opacity-50 group-hover:opacity-100 transition-opacity`} />

            {/* Content Container */}
            <div className="relative z-10 p-3 space-y-3">

                {/* Header: Name & Rarity */}
                <div className="flex justify-between items-start">
                    <div>
                        <h4 className={`font-black uppercase tracking-wider text-[10px] ${style.text}`}>{item.name}</h4>
                        <span className="text-[8px] font-mono opacity-70 tracking-widest">{rarity}</span>
                    </div>
                    {(rarity === 'LEGENDARY' || rarity === 'MYSTIC' || rarity === 'EPIC') && <Sparkles size={14} className="text-amber-400 animate-pulse" />}
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
                        onBuy(item);
                    }}
                    disabled={isOwned}
                    className={`w-full py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-2 transition-all group-hover:bg-slate-900/5 dark:group-hover:bg-white/10 ${style.border} border ${isOwned ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {isOwned ? (
                        <>
                            <CheckCircle2 size={10} className="text-green-500" />
                            <span className="text-green-500">Owned</span>
                        </>
                    ) : (
                        <>
                            {isPremium ? <Diamond size={10} className="text-cyan-400" /> : isVoidPrice ? <Sparkles size={10} className="text-purple-400" /> : <Coins size={10} className="text-amber-400" />}
                            <span className={isPremium ? 'text-cyan-600 dark:text-cyan-400' : isVoidPrice ? 'text-purple-300' : 'text-amber-300'}>
                                {isPremium ? item.premiumPrice : item.cost} {isPremium ? 'Gems' : isVoidPrice ? 'Shards' : 'Gold'}
                            </span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};
