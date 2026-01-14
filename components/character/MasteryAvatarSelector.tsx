import React from 'react';
import { useGameStore } from '../../store/useGameStore';
import { Crown, Hammer, Skull, Lock } from 'lucide-react';

export const MasteryAvatarSelector: React.FC = () => {
    const { stats, inventory, setAvatar } = useGameStore();

    const avatars = [
        { id: 'avatar_scribe_master', label: 'Scribe', icon: <Crown size={16} />, img: '/avatars/mastery/scribe_master.png' },
        { id: 'avatar_master_blacksmith', label: 'Smith', icon: <Hammer size={16} />, img: '/avatars/mastery/master_blacksmith.png' },
        { id: 'avatar_master_bounty_hunter', label: 'Hunter', icon: <Skull size={16} />, img: '/avatars/mastery/master_bounty_hunter.png' }
    ];

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                <Crown size={20} className="text-amber-500" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wider">Mastery Avatars</h3>
            </div>

            <div className="grid grid-cols-3 gap-2">
                {avatars.map((avatar) => {
                    const isUnlocked = inventory.some(i => i.id === avatar.id);
                    const isActive = stats.activeAvatarId === avatar.id;

                    return (
                        <button
                            key={avatar.id}
                            disabled={!isUnlocked}
                            onClick={() => setAvatar(avatar.id)}
                            className={`relative group flex flex-col items-center p-2 rounded-xl border-2 transition-all ${isActive
                                ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                                : isUnlocked
                                    ? 'border-slate-200 dark:border-slate-700 hover:border-indigo-400 hover:scale-105 bg-slate-50 dark:bg-slate-800'
                                    : 'border-slate-100 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 opacity-50 cursor-not-allowed grayscale'
                                }`}
                        >
                            {/* Image / Icon */}
                            <div className="w-12 h-12 mb-2 relative flex items-center justify-center">
                                {isUnlocked ? (
                                    <img src={avatar.img} alt={avatar.label} className="w-full h-full object-contain pixelated" />
                                ) : (
                                    <div className="text-slate-300 dark:text-slate-600">
                                        {avatar.icon}
                                    </div>
                                )}

                                {/* Lock Icon Overlay */}
                                {!isUnlocked && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Lock size={12} className="text-slate-400" />
                                    </div>
                                )}
                            </div>

                            <div className="text-[10px] font-bold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                                {avatar.label}
                            </div>

                            {isActive && (
                                <div className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full shadow-lg ring-2 ring-white dark:ring-slate-900" />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
