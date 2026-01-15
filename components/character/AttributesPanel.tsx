import React, { useMemo } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { Activity, Award, Book, Coins, Crown, Flame, Hammer, Heart, Moon, Shield, Skull, Sparkles, TrendingUp, Users, Zap, Cpu } from 'lucide-react';
import { SHOP_ITEMS } from '../../src/utils/GameEconomy';
import { HealthDisplay } from '../ui/HealthDisplay';

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

export const AttributesPanel: React.FC = () => {
    const { stats, inventory } = useGameStore();

    // --- PERK AGGREGATION ---
    const aggregatedPerks = useMemo(() => {
        let xp = 0;
        let gold = 0;
        let luck = 0;
        let energy = 0;
        let discount = 0;

        const processItem = (itemId: string | undefined | null) => {
            if (!itemId) return;
            // Handle 'base' avatar logic if needed, referencing SHOP_ITEMS
            const item = SHOP_ITEMS.find(i => i.id === itemId || (itemId === 'base' && i.id === 'base_hero'));

            if (item && item.perks) {
                if (item.perks.xpModifier) xp += item.perks.xpModifier;
                if (item.perks.goldModifier) gold += item.perks.goldModifier;
                if (item.perks.luckModifier) luck += item.perks.luckModifier;
                if ((item.perks as any).energyMaxBonus) energy += (item.perks as any).energyMaxBonus;
                if (item.perks.shopDiscount) discount += item.perks.shopDiscount;
            }
        };

        // Active Avatar
        processItem(stats.activeAvatarId);
        // Active Gear
        processItem(stats.activeMainHandId);
        processItem(stats.activeArmorId);
        processItem(stats.activeAccessoryId);

        return { xp, gold, luck, energy, discount };
    }, [stats.activeAvatarId, stats.activeMainHandId, stats.activeArmorId, stats.activeAccessoryId]);

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
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-4">
                <Activity size={20} className="text-slate-400" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wider">Attributes</h3>
            </div>

            {/* Level & XP */}
            <div className="relative bg-gradient-to-br from-slate-100 via-white to-amber-50 dark:from-slate-900 dark:via-slate-900 dark:to-amber-950/20 rounded-xl p-4 border border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.05)] space-y-2 overflow-hidden">
                {/* Corner Glow Accent */}
                <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/10 blur-xl rounded-full -mr-8 -mt-8 pointer-events-none" />
                <div className="flex justify-between items-end">
                    <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">XP</div>
                    <div className="text-xs text-slate-500 font-mono">
                        <span className="text-slate-900 dark:text-white font-bold">{stats.xp}</span> / {stats.xpToNext} XP
                    </div>
                </div>
                <ProgressBar current={stats.xp} max={stats.xpToNext} color="bg-gradient-to-r from-amber-700 via-amber-500 to-yellow-400" height="h-3" />
                <div className="flex justify-between items-center pt-2">
                    <div className="flex items-center gap-2">
                        <div className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded">LVL {stats.level}</div>
                    </div>
                    <div className="text-[10px] text-slate-500">{(((stats.xp / stats.xpToNext) * 100) || 0).toFixed(0)}%</div>
                </div>
            </div>

            {/* Hitpoints */}
            <div className="w-full">
                <HealthDisplay current={stats.hp} max={stats.maxHp} heartSize={24} />
            </div>


            {/* Aggregated Perks */}
            <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg p-3 flex flex-col gap-1 items-start">
                        <div className="text-[10px] text-slate-500 uppercase">XP Gain</div>
                        <div className="text-lg font-bold text-green-600 dark:text-green-400 flex items-center gap-1">
                            <TrendingUp size={16} /> +{(aggregatedPerks.xp * 100).toFixed(0)}%
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg p-3 flex flex-col gap-1 items-start">
                        <div className="text-[10px] text-slate-500 uppercase">Gold Found</div>
                        <div className="text-lg font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                            <Coins size={16} /> +{(aggregatedPerks.gold * 100).toFixed(0)}%
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg p-3 flex flex-col gap-1 items-start">
                        <div className="text-[10px] text-slate-500 uppercase">Luck</div>
                        <div className="text-lg font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1">
                            <Sparkles size={16} /> +{(aggregatedPerks.luck * 100).toFixed(0)}%
                        </div>
                    </div>
                    {(aggregatedPerks.energy > 0) && (
                        <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg p-3 flex flex-col gap-1 items-start">
                            <div className="text-[10px] text-slate-500 uppercase">Max Energy</div>
                            <div className="text-lg font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                                <Zap size={16} /> +{aggregatedPerks.energy}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Achievements */}
            <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold flex items-center gap-2">
                    <Award size={14} /> Achievements
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                    {achievements.map(ach => (
                        <div key={ach.id} className={`aspect-square rounded-lg border-2 flex items-center justify-center relative group ${ach.unlocked ? 'bg-amber-100 dark:bg-amber-900/20 border-amber-500/50 text-amber-600 dark:text-amber-400' : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600 grayscale opacity-50'}`}>
                            <ach.icon size={16} />

                            {/* Tooltip */}
                            <div className="absolute bottom-full mb-2 w-32 bg-white dark:bg-slate-950/90 text-center p-2 rounded-lg text-[10px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-slate-200 dark:border-slate-700 shadow-xl z-50 left-1/2 -translate-x-1/2">
                                <div className="font-bold text-slate-900 dark:text-white mb-0.5">{ach.label}</div>
                                <div className="text-slate-500 dark:text-slate-400">{ach.desc}</div>
                                <div className={`mt-1 font-bold ${ach.unlocked ? 'text-emerald-500' : 'text-slate-500'}`}>{ach.unlocked ? 'Unlocked' : 'Locked'}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
};
