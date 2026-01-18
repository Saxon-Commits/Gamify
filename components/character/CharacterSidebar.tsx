import React from 'react';
import { MiniCharacterCard } from '../MiniCharacterCard';
import { HealthDisplay } from '../ui/HealthDisplay';
import { Award, Hammer, Book, Flame, Crown, Users, Zap, Moon, Coins } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';

interface CharacterSidebarProps {
    className?: string;
}

export const CharacterSidebar: React.FC<CharacterSidebarProps> = ({ className = '' }) => {
    const { stats } = useGameStore();

    const achievements = [
        { id: 'grindstone_guru', label: 'Grindstone Guru', desc: 'Log 100 hours in Grindstone', icon: Hammer, unlocked: false },
        { id: 'scribe', label: 'Scribe of Ages', desc: 'Write 20,000 words', icon: Book, unlocked: false },
        { id: 'iron_will', label: 'Iron Will', desc: '100 Day Streak', icon: Flame, unlocked: false },
        { id: 'grandmaster', label: 'Grandmaster', desc: 'Unlock all skills', icon: Crown, unlocked: false },
        { id: 'guild_leader', label: 'Guild Leader', desc: 'Guild with 10+ members', icon: Users, unlocked: false },
        { id: 'early_bird', label: 'Early Bird', desc: 'Complete task before 8am', icon: Zap, unlocked: true },
        { id: 'night_owl', label: 'Night Owl', desc: 'Complete task after 10pm', icon: Moon, unlocked: true },
        { id: 'big_spender', label: 'Big Spender', desc: 'Spend 10,000 Gold', icon: Coins, unlocked: false },
    ];

    return (
        <div className={`space-y-4 ${className}`}>
            <MiniCharacterCard
                avatarId={stats.activeAvatarId || 'starter_villager_male'}
                backdropId={stats.activeBackdropId}
                companionId={stats.activeCompanionId || stats.activeAccessoryId}
                armorId={stats.activeArmorId}
                className="w-full shadow-2xl border border-slate-700/50"
            />

            {/* ATTRIBUTES PANEL (Mini) */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-4 shadow-sm">

                {/* Hitpoints */}
                <div className="w-full">
                    <HealthDisplay current={stats.hp} max={stats.maxHp} heartSize={12} />
                </div>

                {/* Achievements */}
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="text-[9px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold flex items-center gap-1.5">
                        <Award size={12} /> Achievements
                    </div>
                    <div className="grid grid-cols-4 gap-1.5">
                        {achievements.map(ach => (
                            <div key={ach.id} className={`aspect-square rounded-lg border flex items-center justify-center relative group ${ach.unlocked ? 'bg-amber-100 dark:bg-amber-900/20 border-amber-500/50 text-amber-600 dark:text-amber-400' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 text-slate-300 dark:text-slate-600 grayscale opacity-50'}`}>
                                <ach.icon size={14} />
                                {/* Tooltip */}
                                <div className="absolute bottom-full mb-2 w-28 bg-white dark:bg-slate-950/90 text-center p-2 rounded-lg text-[9px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-slate-200 dark:border-slate-700 shadow-xl z-50 left-1/2 -translate-x-1/2">
                                    <div className="font-bold text-slate-900 dark:text-white mb-0.5">{ach.label}</div>
                                    <div className="text-slate-500 dark:text-slate-400 leading-tight">{ach.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
