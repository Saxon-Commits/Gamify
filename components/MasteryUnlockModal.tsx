
import React, { useEffect, useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { Sparkles, X, Check } from 'lucide-react';
import Confetti from 'react-confetti';
import { SHOP_ITEMS } from '../src/utils/GameEconomy';
import { ALL_COSMETIC_ITEMS } from '../src/utils/CosmeticsData';

export const MasteryUnlockModal: React.FC = () => {
    const { masteryUnlock, closeMasteryUnlock, setAvatar } = useGameStore();
    const sfxVolume = useSettingsStore((state) => state.sfxVolume);
    const [isVisible, setIsVisible] = useState(false);
    const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

    useEffect(() => {
        const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (masteryUnlock) {
            setIsVisible(true);
            const audio = new Audio('/audio/unlock_avatar.wav');
            audio.volume = sfxVolume;
            audio.play().catch(e => console.error("Audio play failed", e));
        } else {
            setIsVisible(false);
        }
    }, [masteryUnlock, sfxVolume]);

    if (!masteryUnlock) return null;

    // Resolve Image
    const allItems = [...SHOP_ITEMS, ...ALL_COSMETIC_ITEMS];
    const itemDef = allItems.find(i => i.id === masteryUnlock.avatarId);
    const imageUrl = itemDef?.imageUrl || '/placeholders/avatar.png';

    const handleEquip = () => {
        setAvatar(masteryUnlock.avatarId);
        closeMasteryUnlock();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-500"
                onClick={closeMasteryUnlock}
            />

            {/* Confetti */}
            <div className="absolute inset-0 pointer-events-none z-[110]">
                <Confetti
                    width={windowSize.width}
                    height={windowSize.height}
                    numberOfPieces={500}
                    recycle={false}
                    gravity={0.2}
                />
            </div>

            {/* Modal Content */}
            <div className="relative z-[120] w-full max-w-md bg-slate-900 border-2 border-amber-500/50 rounded-3xl shadow-[0_0_100px_rgba(251,191,36,0.2)] overflow-hidden animate-in zoom-in-95 duration-500">
                {/* Header Glow */}
                <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-amber-500/20 to-transparent pointer-events-none" />

                <button
                    onClick={closeMasteryUnlock}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors z-[130]"
                >
                    <X size={24} />
                </button>

                <div className="flex flex-col items-center pt-12 pb-8 px-6 text-center">

                    {/* Icon Container with Rays */}
                    <div className="relative mb-6 group">
                        <div className="absolute inset-0 bg-amber-500/30 rounded-full blur-3xl animate-pulse" />
                        <div className="relative w-40 h-40 rounded-full border-4 border-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.4)] overflow-hidden bg-slate-950">
                            <img
                                src={imageUrl}
                                alt={masteryUnlock.title}
                                className="w-full h-full object-cover scale-110"
                                style={{ imageRendering: 'pixelated' }}
                            />
                        </div>
                        {/* Spinning Starburst behind? */}
                    </div>

                    <div className="space-y-2 mb-8 relative">
                        <div className="flex items-center justify-center space-x-2 text-amber-400 text-sm font-black tracking-[0.2em] uppercase">
                            <Sparkles size={16} />
                            <span>Mastery Unlocked</span>
                            <Sparkles size={16} />
                        </div>
                        <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400">
                            {masteryUnlock.title}
                        </h2>
                        <p className="text-slate-400 text-sm italic border-t border-slate-800 pt-3 mt-3 max-w-sm mx-auto leading-relaxed">
                            "{masteryUnlock.flavor}"
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 w-full">
                        <button
                            onClick={closeMasteryUnlock}
                            className="py-3 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 transition-colors"
                        >
                            Collect
                        </button>
                        <button
                            onClick={handleEquip}
                            className="py-3 rounded-xl bg-amber-500 text-slate-900 font-black hover:bg-amber-400 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2 animate-pulse"
                        >
                            <Check size={18} />
                            <span>Equip Now</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
