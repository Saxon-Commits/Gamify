import React, { useMemo } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { Activity, Award, Book, Coins, Crown, Flame, Hammer, Heart, Moon, Shield, Skull, Sparkles, TrendingUp, Users, Zap, Cpu } from 'lucide-react';

const ProgressBar = ({ current, max, color, height = "h-4" }: { current: number, max: number, color: string, height?: string }) => {
    const percentage = Math.min(100, Math.max(0, (current / max) * 100));
    return (
        <div className={`w-full ${height} bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden`}>
            <div
                className={`h-full ${color} transition-all duration-500 relative`}
                style={{ width: `${percentage}%` }}
            >
                {percentage > 0 && (
                    <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]" />
                )}
            </div>
        </div>
    );
};

export const MobileStatsPanel: React.FC = () => {
    const { stats } = useGameStore();

    return (
        <div className="flex flex-col h-full justify-between py-1">
            {/* Hitpoints */}
            {/* Hitpoints */}
            <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Hitpoints</span>
                <div className="flex gap-1 justify-start flex-wrap">
                    {Array.from({ length: 7 }).map((_, i) => (
                        <Heart key={i} size={14} className="text-red-500 fill-red-500/20" strokeWidth={2.5} />
                    ))}
                </div>
            </div>

            {/* Level & XP */}
            {/* Level & XP */}
            <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Experience</span>
                <div className="relative bg-gradient-to-br from-slate-100 via-white to-amber-50 dark:from-slate-900 dark:via-slate-900 dark:to-amber-950/20 rounded-xl p-2 border border-amber-500/20 shadow-sm space-y-1.5 overflow-hidden">
                    <div className="flex justify-between items-end">
                        <div className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold px-1.5 py-0.5 rounded">LVL {stats.level}</div>
                        <div className="text-[9px] text-slate-500 font-mono">
                            <span className="text-slate-900 dark:text-white font-bold">{stats.xp}</span> / {stats.xpToNext}
                        </div>
                    </div>
                    <ProgressBar current={stats.xp} max={stats.xpToNext} color="bg-gradient-to-r from-amber-700 via-amber-500 to-yellow-400" height="h-1.5" />
                </div>
            </div>

            {/* Currency Compact */}
            {/* Currency Compact */}
            <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Wallet</span>
                <div className="grid grid-cols-2 gap-2">
                    {/* Gold */}
                    <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg p-1.5 flex flex-col items-center justify-center text-center">
                        <span className="text-[8px] uppercase font-bold text-slate-400 mb-0.5">Gold</span>
                        <div className="flex items-center gap-1">
                            <img src="/images/currency/gold_coin.png" className="w-3.5 h-3.5 object-contain" />
                            <span className="text-[10px] font-bold text-slate-700 dark:text-slate-200">{stats.gold}</span>
                        </div>
                    </div>
                    {/* Shards */}
                    <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg p-1.5 flex flex-col items-center justify-center text-center">
                        <span className="text-[8px] uppercase font-bold text-slate-400 mb-0.5">Shards</span>
                        <div className="flex items-center gap-1">
                            <img src="/images/currency/skill_point.png" className="w-3.5 h-3.5 object-contain" />
                            <span className="text-[10px] font-bold text-slate-700 dark:text-slate-200">{stats.skillPoints}</span>
                        </div>
                    </div>
                    {/* Gems */}
                    <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg p-1.5 flex flex-col items-center justify-center text-center col-span-2">
                        <span className="text-[8px] uppercase font-bold text-slate-400 mb-0.5">Gems</span>
                        <div className="flex items-center gap-1">
                            <img src="/images/currency/gem icon.png" className="w-4 h-4 object-contain" />
                            <span className="text-[10px] font-bold text-slate-700 dark:text-slate-200">{stats.gems}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
