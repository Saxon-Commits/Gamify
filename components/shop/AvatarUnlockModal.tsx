import React, { useRef, useEffect } from 'react';

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

interface AvatarUnlockModalProps {
    avatar: any;
    onClose: () => void;
}

export const AvatarUnlockModal: React.FC<AvatarUnlockModalProps> = ({ avatar, onClose }) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    // Set default volume for video
    useEffect(() => {
        if (avatar && videoRef.current) {
            videoRef.current.volume = 0.15;
        }
    }, [avatar]);

    if (!avatar) return null;

    const rarityConfig = RARITY_STYLES[avatar.rarity] || RARITY_STYLES.COMMON;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={onClose} />

            {/* Card Container - Dynamic Rarity Styling */}
            <div className={`relative bg-[#0f0518] border-2 ${rarityConfig.border} rounded-[2rem] overflow-hidden max-w-md w-full ${rarityConfig.glow} animate-in fade-in zoom-in duration-300 flex flex-col`}>

                {/* 1. TOP VIDEO SECTION (Aspect Ratio 16:9 for Full Visibility) */}
                <div className={`relative w-full aspect-video border-b-2 ${rarityConfig.border} overflow-hidden bg-black`}>
                    {/* Main Character Layer - Full Fill */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        {avatar.videoUrl ? (
                            <video
                                ref={videoRef}
                                src={avatar.videoUrl}
                                autoPlay
                                loop
                                className="w-full h-full object-cover"
                                onError={(e) => console.error("Video Error:", e)}
                            />
                        ) : (
                            <img src={avatar.imageUrl} className="w-full h-full object-cover pixelated" alt={avatar.name} />
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
                                {avatar.rarity} Unlocked
                            </span>
                        </div>
                        <div className="text-center">
                            <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-1 drop-shadow-md">
                                {avatar.name}
                            </h2>
                            <p className="text-xs text-slate-400 italic leading-relaxed line-clamp-2 px-2">
                                "{avatar.lore}"
                            </p>
                        </div>

                        {/* Innate Perks Grid */}
                        <div className="grid grid-cols-2 gap-2 pt-2">
                            {Object.entries(avatar.perks || {}).slice(0, 4).map(([key, val]) => (
                                <div key={key} className={`bg-black/40 border ${rarityConfig.border}/20 p-2 rounded-lg flex flex-col items-center justify-center relative overflow-hidden group hover:${rarityConfig.border}/40 transition-colors`}>
                                    <div className={`absolute inset-0 ${rarityConfig.bg}/5 opacity-0 group-hover:opacity-100 transition-opacity`} />
                                    <span className={`text-[9px] ${rarityConfig.text} uppercase tracking-widest mb-0.5 opacity-80`}>{key.replace(/([A-Z])/g, ' $1').replace('Modifier', '').trim()}</span>
                                    <span className={`text-sm font-mono font-bold ${rarityConfig.text.replace('200', '400')}`}>+{Number(val) < 1 ? `${Number(val) * 100}%` : val}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-sm transition-all shadow-lg hover:scale-[1.02] active:scale-[0.98] bg-gradient-to-r ${rarityConfig.gradient} text-white shadow-${rarityConfig.text.split('-')[1]}-500/30`}
                    >
                        Equip Later
                    </button>
                </div>
            </div>
        </div>
    );
};
