import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Brain, Utensils, Users, Moon } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';

export const VitalityFlowChart: React.FC = () => {
    const { vitality } = useGameStore();
    const [activePillar, setActivePillar] = React.useState<string>('physical');

    const pillars = [
        { id: 'physical', label: 'Physical Health', icon: Activity, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
        { id: 'mental', label: 'Mental Health', icon: Brain, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
        { id: 'nutrition', label: 'Nutrition', icon: Utensils, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' },
        { id: 'social', label: 'Social Health', icon: Users, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
        { id: 'sleep', label: 'Sleep', icon: Moon, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
    ];

    // Rotate pillars so the active one is in the center
    const activeIndex = pillars.findIndex(p => p.id === activePillar);
    const centerIndex = Math.floor(pillars.length / 2); // 2 for length 5

    let rotatingPillars = [...pillars];
    if (activeIndex !== -1) {
        const shift = centerIndex - activeIndex;
        const rotate = (arr: any[], count: number) => {
            const len = arr.length;
            const normalizedShift = (count % len + len) % len;
            return [...arr.slice(len - normalizedShift), ...arr.slice(0, len - normalizedShift)];
        };
        rotatingPillars = rotate(pillars, shift);
    }

    return (
        <div className="w-full h-full overflow-hidden p-6 relative flex items-center justify-center bg-slate-950">
            <div className="flex flex-col items-center justify-center gap-8 z-10">

                {/* Header */}
                <div className="text-center mb-8 space-y-2">
                    <h2 className="text-2xl font-black text-white uppercase tracking-widest">Vitality Protocols</h2>
                    <p className="text-slate-400 text-sm">Select a domain to begin your optimization journey.</p>
                </div>

                {/* Pillars Selection */}
                <div className="flex flex-col gap-3 min-w-[300px]">
                    <div className="w-full flex items-center mb-2 justify-center">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Choose an area</span>
                    </div>

                    {rotatingPillars.map((pillar) => {
                        const isActive = activePillar === pillar.id;

                        return (
                            <motion.div
                                layout
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                key={pillar.id}
                                onClick={() => setActivePillar(pillar.id)}
                                className={`flex items-center justify-center gap-4 group cursor-pointer relative ${isActive ? 'py-2 scale-110' : 'py-0.5 opacity-60 hover:opacity-100 hover:scale-105'} transition-all duration-300`}
                            >
                                <motion.div
                                    layout
                                    className={`
                                        rounded-xl border backdrop-blur-sm flex items-center gap-4 relative z-10 shadow-lg
                                        ${pillar.border} ${pillar.bg}
                                        ${isActive ? 'w-72 p-6 shadow-xl ring-1 ring-white/10' : 'w-60 p-4'}
                                    `}
                                >
                                    <div className={`p-2 rounded-lg bg-slate-900/40 ${pillar.color}`}>
                                        <pillar.icon size={isActive ? 28 : 20} />
                                    </div>
                                    <h3 className={`font-bold transition-all ${isActive ? `text-lg ${pillar.color}` : 'text-sm text-slate-400'}`}>
                                        {pillar.label}
                                    </h3>
                                </motion.div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Visual Flair / Background Elements */}
                <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/5 rounded-full blur-3xl opacity-50" />
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('/assets/noise.svg')] opacity-[0.03]" />
                </div>

            </div>
        </div>
    );
};
