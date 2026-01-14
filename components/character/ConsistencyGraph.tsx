import React, { useMemo } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { Activity } from 'lucide-react';

const getHeatmapColor = (xp: number) => {
    if (xp === 0) return 'bg-slate-100 dark:bg-slate-800 border-transparent transition-colors duration-300';
    if (xp < 50) return 'bg-green-200 dark:bg-green-900/50 border-green-300 dark:border-green-900';
    if (xp < 100) return 'bg-green-400 dark:bg-green-500/50 border-green-500 dark:border-green-500';
    return 'bg-green-500 dark:bg-green-400 border-green-600 dark:border-green-300 shadow-[0_0_5px_rgba(74,222,128,0.5)]';
};

export const ConsistencyGraph: React.FC = () => {
    const { activityLog } = useGameStore();

    // Heatmap Logic
    const heatmapData = useMemo(() => {
        const days = [];
        const today = new Date();
        // Generate last 12 weeks (approx 84 days)
        for (let i = 83; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const log = (activityLog || []).find(l => l.date === dateStr);
            days.push({ date: dateStr, xp: log ? log.xp : 0 });
        }
        return days;
    }, [activityLog]);

    return (
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center">
                    <Activity size={14} className="mr-2 text-green-400" />
                    Consistency Graph
                </h3>
                <div className="flex items-center gap-1 text-[10px] text-slate-500">
                    <span>Less</span>
                    <div className="w-2 h-2 bg-slate-200 dark:bg-slate-800 rounded mx-1"></div>
                    <div className="w-2 h-2 bg-green-900/50 rounded mx-1"></div>
                    <div className="w-2 h-2 bg-green-500/50 rounded mx-1"></div>
                    <div className="w-2 h-2 bg-green-400 rounded mx-1"></div>
                    <span>More</span>
                </div>
            </div>

            <div className="flex justify-center overflow-x-auto pb-2">
                <div className="grid grid-rows-7 grid-flow-col gap-1">
                    {heatmapData.map((day, i) => (
                        <div
                            key={day.date}
                            title={`${day.date}: ${day.xp} XP`}
                            className={`w-3 h-3 rounded-sm border ${getHeatmapColor(day.xp)} transition-all hover:scale-125 hover:z-10`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};
