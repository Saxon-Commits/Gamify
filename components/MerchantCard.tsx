import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { Plus, ShoppingCart, X, Coins, Target, ChevronRight } from 'lucide-react';

interface MerchantCardProps {
    title?: string;
    description?: string;
    className?: string;
    onNewQuestClick?: () => void;
    isModalOpen?: boolean;
}

export const MerchantCard: React.FC<MerchantCardProps> = ({
    title,
    description = "A mysterious traveler who has seen realms beyond your imagination. He offers rare artifacts to those with the coin.",
    className = "",
    onNewQuestClick,
    isModalOpen = false
}) => {
    const [isHovered, setIsHovered] = useState(false);

    return (

        <div
            className={`relative group rounded-xl ${isModalOpen ? 'max-w-2xl' : 'w-full'} ${className}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Gold Aura Glow - Behind the card */}
            <div className={`absolute -inset-0.5 bg-gradient-to-r from-amber-600/50 via-yellow-500/50 to-amber-600/50 rounded-xl blur opacity-0 transition duration-500 pointer-events-none ${isHovered ? 'opacity-75' : ''}`} />

            <div
                className={`relative w-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm shadow-2xl transition-all duration-500 hover:border-amber-500/50 hover:shadow-amber-500/10`}
            >
                {/* Decorative Top Border */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-slate-800 via-amber-900 to-slate-800 opacity-50"></div>

                {/* Optional Page Title Header (e.g. MARKETPLACE) */}
                {title && (
                    <div className="p-3 pb-0">
                        <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2 mb-1">
                            {title}
                        </h2>
                    </div>
                )}

                {/* Card Header */}
                <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center group">
                    <div>
                        <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 tracking-tight group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">MERCHANT</h3>
                        <p className="text-[9px] uppercase font-bold text-slate-500 tracking-widest">Rare Artifacts</p>
                    </div>
                    <div className={`h-1.5 w-1.5 rounded-full ${isHovered ? 'bg-amber-500 animate-pulse shadow-[0_0_10px_#f59e0b]' : 'bg-slate-700'} transition-all duration-300`}></div>
                </div>

                {/* Video Container - Card Style */}
                <div className={`relative w-full bg-black/50 overflow-hidden group ${isModalOpen ? 'aspect-video' : 'aspect-square'}`}>
                    {/* Background Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-t from-amber-900/10 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-700"></div>

                    <div className="w-full h-full transform scale-x-[-1]">
                        <video
                            src="/avatars/merchant/idle.mp4"
                            autoPlay
                            loop
                            muted
                            playsInline
                            className={`w-full h-full object-cover pointer-events-none transform transition-transform duration-700 group-hover:scale-[1.6] ${isModalOpen ? 'scale-125' : 'scale-150'}`}
                            style={{
                                filter: 'contrast(1.1) brightness(0.9)',
                            }}
                        />
                    </div>

                    {/* Scanlines Overlay for "Digital/Retro" feel */}
                    <div className="absolute inset-0 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
                    <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent"></div>
                </div>

                {/* Description / Content Area */}
                <div className="p-3 relative">
                    <div className="absolute -top-6 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent"></div>

                    <p className="text-[10px] text-slate-400 font-medium leading-relaxed mb-4 italic line-clamp-3">
                        <span className="text-amber-500 mr-1">"</span>
                        {description}
                    </p>

                    {/* Special Items On Sale */}
                    <div className="mb-4 space-y-2">
                        {/* NEW QUEST BUTTON - Prominent with Ancient Scroll Icon */}
                        <button
                            onClick={onNewQuestClick}
                            className="w-full flex items-center justify-between p-2 rounded-lg bg-gradient-to-r from-amber-900/30 to-amber-800/20 border-2 border-amber-500/50 group/item hover:border-amber-400 hover:from-amber-900/50 hover:to-amber-800/40 transition-all duration-300 cursor-pointer shadow-lg shadow-amber-900/20 hover:shadow-amber-500/30"
                        >
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-lg group-hover/item:bg-amber-500/30 group-hover/item:scale-110 transition-all">
                                    📜
                                </div>
                                <div className="text-left">
                                    <div className="text-xs font-bold text-amber-200 group-hover/item:text-amber-100 flex items-center gap-1">
                                        Open Shop
                                    </div>
                                </div>
                            </div>
                            <ChevronRight size={14} className="text-amber-400 group-hover/item:translate-x-1 transition-transform" />
                        </button>
                    </div>


                </div>

                {/* Bottom accent */}
                <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-green-900/30 to-transparent"></div>
            </div>
        </div>
    );
};

// Merchant Video Component (for use in modal)
export const MerchantVideo: React.FC<{ className?: string }> = ({ className = "" }) => {
    return (
        <div className={`relative bg-black/50 overflow-hidden rounded-xl border border-slate-800 ${className}`}>
            {/* Background Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-t from-amber-900/10 to-transparent opacity-50"></div>

            <video
                src="/avatars/merchant/idle.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover pointer-events-none scale-[1.7]"
                style={{
                    filter: 'contrast(1.1) brightness(0.9)',
                }}
            />

            {/* Scanlines Overlay */}
            <div className="absolute inset-0 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent"></div>

            {/* Merchant Title Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-lg font-black text-amber-400 tracking-tight">WANDERING MERCHANT</h3>
            </div>
        </div>
    );
};

// Unified Merchant Shop Modal
interface MerchantModalProps {
    isOpen: boolean;
    onClose: () => void;
    inventory: any[];
    onAddItem: (item: any) => void;
}

export const MerchantModal: React.FC<MerchantModalProps> = ({
    isOpen,
    onClose,
    inventory,
    onAddItem
}) => {
    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center pt-24 px-4 pb-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative z-10 w-full max-w-6xl animate-in fade-in zoom-in duration-300 max-h-[90vh] flex flex-col">
                <div className="flex flex-col lg:flex-row gap-8 h-full overflow-hidden">

                    {/* LEFT COLUMN: Merchant & Quests */}
                    <div className="lg:w-80 flex-shrink-0 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
                        <MerchantVideo className="h-[300px]" />

                        {/* Quote/Flavor Text Block could go here instead of Quest Services if needed */}
                        <div className="bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-4 italic text-sm text-slate-500 text-center">
                            "More wares coming soon..."
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Shop Inventory */}
                    <div className="flex-1 relative border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden flex flex-col group">

                        {/* Background Image */}
                        <div className="absolute inset-0 z-0">
                            <img
                                src="/images/quest_cards/vitality_peak_quest_card.jpg"
                                alt="Shop Background"
                                className="w-full h-full object-cover opacity-40 dark:opacity-20 blur-sm group-hover:blur-none transition-all duration-700 scale-105 group-hover:scale-100"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/50 to-white/80 dark:from-slate-950/90 dark:via-slate-950/50 dark:to-slate-950/80" />
                        </div>

                        <div className="relative z-10 flex flex-col h-full">
                            <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20 shadow-lg shadow-amber-500/5">
                                        <Coins className="text-amber-600 dark:text-amber-500" size={20} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight drop-shadow-sm">Merchant's Inventory</h2>
                                        <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">Rare goods and seasonal items</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full backdrop-blur-sm">
                                        <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Seasonal Shop</span>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="p-2 hover:bg-slate-800/20 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors border border-transparent hover:border-slate-400/30"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">

                                {/* SEASONAL SHOP */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-black text-amber-600 dark:text-amber-500 uppercase tracking-widest border-b border-amber-500/20 pb-2 flex items-center gap-2">
                                        <span>⚔️</span> Seasonal Shop
                                    </h3>
                                    {inventory.length === 0 ? (
                                        <div className="p-12 text-center border-2 border-dashed border-amber-500/20 bg-amber-50/50 dark:bg-amber-900/10 rounded-xl backdrop-blur-sm">
                                            <div className="mb-4 text-4xl">⏳</div>
                                            <p className="text-slate-700 dark:text-slate-200 font-bold text-lg mb-2">Season 1 starts March 1st</p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">Check back later for new exclusive items.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {inventory.map(item => (
                                                <div key={item.id} className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-slate-200 dark:border-slate-700 hover:border-amber-500/50 hover:bg-white/80 dark:hover:bg-slate-800/80 rounded-xl p-3 flex items-center gap-4 transition-all group shadow-sm hover:shadow-lg hover:shadow-amber-500/10">
                                                    <div className="w-16 h-16 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center shrink-0 overflow-hidden">
                                                        {item.imageUrl ? (
                                                            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover pixelated" />
                                                        ) : <span className="text-2xl">🎁</span>}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-bold text-slate-900 dark:text-slate-200 truncate">{item.name}</div>
                                                        <div className="text-[10px] text-slate-500 line-clamp-2 leading-tight mb-1.5">{item.description}</div>
                                                        <div className="font-mono text-xs text-amber-600 dark:text-amber-500 font-bold">
                                                            {item.premiumPrice ? <span className="flex items-center gap-1"><span className="text-cyan-400">♦</span> {item.premiumPrice}</span> : `${item.cost}g`}
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => onAddItem(item)}
                                                        className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500 hover:text-white flex items-center justify-center transition-colors border border-amber-500/20"
                                                    >
                                                        <Plus size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};
