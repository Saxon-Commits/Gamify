import React, { useState } from 'react';
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
            className={`relative group rounded-xl ${isModalOpen ? 'max-w-2xl' : 'max-w-sm'} ${className}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Gold Aura Glow - Behind the card */}
            <div className={`absolute -inset-0.5 bg-gradient-to-r from-amber-600/50 via-yellow-500/50 to-amber-600/50 rounded-xl blur opacity-0 transition duration-500 pointer-events-none ${isHovered ? 'opacity-75' : ''}`} />

            <div
                className={`relative w-full rounded-xl overflow-hidden border border-slate-800 bg-slate-900/90 backdrop-blur-sm shadow-2xl transition-all duration-500 hover:border-amber-500/50 hover:shadow-amber-500/10`}
            >
                {/* Decorative Top Border */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-slate-800 via-amber-900 to-slate-800 opacity-50"></div>

                {/* Optional Page Title Header (e.g. MARKETPLACE) */}
                {title && (
                    <div className="p-4 pb-0">
                        <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2 mb-1">
                            {title}
                        </h2>
                    </div>
                )}

                {/* Card Header */}
                <div className="p-4 border-b border-slate-800 flex justify-between items-center group">
                    <div>
                        <h3 className="text-lg font-black text-slate-200 tracking-tight group-hover:text-amber-400 transition-colors">WANDERING MERCHANT</h3>
                        <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Rare Goods and Quests Vendor</p>
                    </div>
                    <div className={`h-2 w-2 rounded-full ${isHovered ? 'bg-amber-500 animate-pulse shadow-[0_0_10px_#f59e0b]' : 'bg-slate-700'} transition-all duration-300`}></div>
                </div>

                {/* Video Container - Card Style */}
                <div className={`relative w-full bg-black/50 overflow-hidden group ${isModalOpen ? 'aspect-video' : 'aspect-square'}`}>
                    {/* Background Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-t from-amber-900/10 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-700"></div>

                    <div className="w-full h-full transform scale-x-[-1]">
                        <video
                            src="/assets/merchant_idle.mp4"
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
                    <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent"></div>
                </div>

                {/* Description / Content Area */}
                <div className="p-5 relative">
                    <div className="absolute -top-6 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent"></div>

                    <p className="text-xs text-slate-400 font-medium leading-relaxed mb-6 italic">
                        <span className="text-amber-500 mr-2">"</span>
                        {description}
                        <span className="text-amber-500 ml-2">"</span>
                    </p>

                    {/* Special Items On Sale */}
                    <div className="mb-6 space-y-2">
                        <div className="text-[10px] uppercase font-bold text-slate-500 mb-2 flex items-center gap-2">
                            <span className="w-1 h-1 rounded-full bg-amber-500"></span>
                            Services
                        </div>

                        {/* NEW QUEST BUTTON - Prominent with Ancient Scroll Icon */}
                        <button
                            onClick={onNewQuestClick}
                            className="w-full flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-amber-900/30 to-amber-800/20 border-2 border-amber-500/50 group/item hover:border-amber-400 hover:from-amber-900/50 hover:to-amber-800/40 transition-all duration-300 cursor-pointer shadow-lg shadow-amber-900/20 hover:shadow-amber-500/30"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-2xl group-hover/item:bg-amber-500/30 group-hover/item:scale-110 transition-all">
                                    📜
                                </div>
                                <div className="text-left">
                                    <div className="text-sm font-bold text-amber-200 group-hover/item:text-amber-100 flex items-center gap-2">
                                        Open Shop
                                        <Plus size={14} className="text-amber-400" />
                                    </div>
                                    <div className="text-[10px] text-amber-500/70">Commission or Create</div>
                                </div>
                            </div>
                            <ChevronRight size={20} className="text-amber-400 group-hover/item:translate-x-1 transition-transform" />
                        </button>
                    </div>

                    {/* Interactive "Shop Status" */}
                    <div className="bg-black/30 rounded-lg p-3 border border-slate-800/50 flex items-center justify-center">
                        <div className="text-xs font-bold text-amber-400 animate-pulse">OPEN FOR BUSINESS</div>
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
                src="/assets/merchant_idle.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover pointer-events-none scale-110"
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
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Quest Commissioner</p>
            </div>
        </div>
    );
};

// Quest Modal Component - Now includes Merchant on the side
interface QuestModalProps {
    isOpen: boolean;
    onClose: () => void;
    onBuyQuest: () => void;
    onCreateQuest: () => void;
}

export const QuestModal: React.FC<QuestModalProps> = ({ isOpen, onClose, onBuyQuest, onCreateQuest }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal Content - Side by Side Layout */}
            <div className="relative z-10 w-full max-w-5xl animate-in fade-in zoom-in duration-300">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute -top-12 right-0 p-2 text-slate-400 hover:text-white transition-colors z-20"
                >
                    <X size={24} />
                </button>

                <div className="flex flex-col lg:flex-row gap-6">
                    {/* LEFT: Merchant Video */}
                    <div className="lg:w-80 flex-shrink-0">
                        <MerchantVideo className="h-full min-h-[300px] lg:min-h-[450px]" />
                    </div>

                    {/* RIGHT: Quest Options */}
                    <div className="flex-1 bg-slate-900 border-2 border-amber-500/30 rounded-2xl overflow-hidden shadow-2xl shadow-amber-900/20">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-amber-900/30 to-slate-900 p-6 border-b border-amber-500/20">
                            <h2 className="text-2xl font-black text-amber-100 tracking-tight flex items-center gap-3">
                                <span className="text-3xl">📜</span>
                                Quest Commission
                            </h2>
                            <p className="text-sm text-slate-400 mt-1">Choose how you'd like to acquire a new quest</p>
                        </div>

                        {/* Options Grid */}
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Option 1: Buy Quest */}
                            <button
                                onClick={onBuyQuest}
                                className="group p-6 bg-slate-800/50 border-2 border-slate-700 rounded-xl hover:border-blue-500/50 hover:bg-blue-900/10 transition-all duration-300 text-left"
                            >
                                <div className="w-14 h-14 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-blue-500/30 transition-all">
                                    <ShoppingCart size={28} className="text-blue-400" />
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-200 transition-colors">Buy Quest</h3>
                                <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                                    Purchase a pre-made quest from the merchant's collection. Cost and rewards vary based on difficulty.
                                </p>
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                    <Coins size={14} className="text-amber-400" />
                                    <span>Cost varies by quest</span>
                                </div>
                            </button>

                            {/* Option 2: Create Quest */}
                            <button
                                onClick={onCreateQuest}
                                className="group p-6 bg-slate-800/50 border-2 border-slate-700 rounded-xl hover:border-purple-500/50 hover:bg-purple-900/10 transition-all duration-300 text-left"
                            >
                                <div className="w-14 h-14 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-purple-500/30 transition-all">
                                    <Target size={28} className="text-purple-400" />
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-purple-200 transition-colors">Create Quest</h3>
                                <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                                    Design your own quest with custom objectives. Rewards scale with the number of goals you set.
                                </p>
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                    <Coins size={14} className="text-amber-400" />
                                    <span>50 Gold to commission</span>
                                </div>
                            </button>
                        </div>

                        {/* Footer */}
                        <div className="px-6 pb-6">
                            <div className="bg-slate-950/50 rounded-lg p-4 border border-slate-800/50 text-center">
                                <p className="text-[10px] uppercase tracking-widest text-slate-600">
                                    All quest commissions are final • Choose wisely, adventurer
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* BOTTOM ROW: Shop Items */}
                <div className="mt-6 bg-slate-900 border-2 border-slate-700 rounded-2xl overflow-hidden">
                    <div className="p-4 border-b border-slate-800 flex items-center gap-2">
                        <span className="text-lg">🏪</span>
                        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Merchant's Wares</h3>
                        <span className="text-[10px] text-slate-500 ml-auto">Limited Stock</span>
                    </div>
                    <div className="p-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                        {/* Placeholder Item 1 */}
                        <div className="group p-3 bg-slate-800/50 border border-slate-700 rounded-xl hover:border-amber-500/50 hover:bg-slate-800 transition-all cursor-pointer text-center">
                            <div className="w-12 h-12 mx-auto mb-2 rounded-lg bg-slate-700/50 border border-slate-600 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                                ⚗️
                            </div>
                            <div className="text-xs font-bold text-slate-300 mb-1">Elixir</div>
                            <div className="text-[10px] font-bold text-amber-400">150g</div>
                        </div>

                        {/* Placeholder Item 2 */}
                        <div className="group p-3 bg-slate-800/50 border border-slate-700 rounded-xl hover:border-amber-500/50 hover:bg-slate-800 transition-all cursor-pointer text-center">
                            <div className="w-12 h-12 mx-auto mb-2 rounded-lg bg-slate-700/50 border border-slate-600 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                                🗡️
                            </div>
                            <div className="text-xs font-bold text-slate-300 mb-1">Blade</div>
                            <div className="text-[10px] font-bold text-amber-400">500g</div>
                        </div>

                        {/* Placeholder Item 3 */}
                        <div className="group p-3 bg-slate-800/50 border border-slate-700 rounded-xl hover:border-amber-500/50 hover:bg-slate-800 transition-all cursor-pointer text-center">
                            <div className="w-12 h-12 mx-auto mb-2 rounded-lg bg-slate-700/50 border border-slate-600 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                                🛡️
                            </div>
                            <div className="text-xs font-bold text-slate-300 mb-1">Shield</div>
                            <div className="text-[10px] font-bold text-amber-400">350g</div>
                        </div>

                        {/* Placeholder Item 4 */}
                        <div className="group p-3 bg-slate-800/50 border border-slate-700 rounded-xl hover:border-amber-500/50 hover:bg-slate-800 transition-all cursor-pointer text-center">
                            <div className="w-12 h-12 mx-auto mb-2 rounded-lg bg-purple-900/30 border border-purple-500/30 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                                ✨
                            </div>
                            <div className="text-xs font-bold text-slate-300 mb-1">Essence</div>
                            <div className="text-[10px] font-bold text-amber-400">250g</div>
                        </div>

                        {/* Placeholder Item 5 */}
                        <div className="group p-3 bg-slate-800/50 border border-slate-700 rounded-xl hover:border-amber-500/50 hover:bg-slate-800 transition-all cursor-pointer text-center">
                            <div className="w-12 h-12 mx-auto mb-2 rounded-lg bg-blue-900/30 border border-blue-500/30 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                                💎
                            </div>
                            <div className="text-xs font-bold text-slate-300 mb-1">Gem</div>
                            <div className="text-[10px] font-bold text-amber-400">1000g</div>
                        </div>

                        {/* Placeholder Item 6 */}
                        <div className="group p-3 bg-slate-800/50 border border-slate-700 rounded-xl hover:border-amber-500/50 hover:bg-slate-800 transition-all cursor-pointer text-center">
                            <div className="w-12 h-12 mx-auto mb-2 rounded-lg bg-green-900/30 border border-green-500/30 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                                🌿
                            </div>
                            <div className="text-xs font-bold text-slate-300 mb-1">Herb</div>
                            <div className="text-[10px] font-bold text-amber-400">75g</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
