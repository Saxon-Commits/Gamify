import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Brain, Utensils, Users, Moon, Trophy, Droplet, CheckCircle2, Circle, ArrowLeft, Lock, Dumbbell, Flag, Gift, Award } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { VitalityDetailPanel } from './vitality/VitalityDetailPanel';


export const VitalityFlowChart: React.FC = () => {
    const { addProjects, addRewards, vitality, setVitalityData } = useGameStore();
    const [activePillar, setActivePillar] = React.useState<string>('physical');

    const [activeBranch, setActiveBranch] = React.useState<string | null>('phys-1'); // Default to first branch

    React.useEffect(() => {
        // Automatically select the first branch when the active pillar changes
        const branches = getSubBranches(activePillar);
        if (branches.length > 0) {
            setActiveBranch(branches[0].id);
            // Assessment step is now handled within VitalityDetailPanel
        }
    }, [activePillar]);
    // Local formData replaced by global vitality state

    const pillars = [
        { id: 'physical', label: 'Physical Health', icon: Activity, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
        { id: 'mental', label: 'Mental Health', icon: Brain, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
        { id: 'nutrition', label: 'Nutrition', icon: Utensils, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' },
        { id: 'social', label: 'Social Health', icon: Users, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
        { id: 'sleep', label: 'Sleep', icon: Moon, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
    ];

    const getSubBranches = (pillarId: string) => {
        if (pillarId === 'physical') {
            return [
                { id: 'phys-1', label: 'Stabilise & Assess', status: 'active', rewards: { xp: '500 XP', gold: '100 Gold' } },
                { id: 'phys-2', label: 'Form & Foundation', status: 'active', rewards: { xp: '800 XP', gold: '200 Gold' } },
                { id: 'phys-3', label: 'Strength & Capacity', status: 'active', rewards: { xp: '1200 XP', gold: '350 Gold' } },
                { id: 'phys-4', label: 'High Intensity & Recovery', status: 'active', rewards: { xp: '2000 XP', gold: '500 Gold' } },
            ];
        }
        if (pillarId === 'sleep') {
            return [
                { id: 'sleep-1', label: 'Environmental Control', status: 'active', rewards: { xp: '500 XP', gold: '100 Gold' } },
                { id: 'sleep-2', label: 'Circadian Anchoring', status: 'active', rewards: { xp: '800 XP', gold: '200 Gold' } },
                { id: 'sleep-3', label: 'The Wind-Down Ritual', status: 'active', rewards: { xp: '1200 XP', gold: '350 Gold' } },
                { id: 'sleep-4', label: 'Biological Optimization', status: 'active', rewards: { xp: '2000 XP', gold: '500 Gold' } },
            ];
        }
        if (pillarId === 'mental') {
            return [
                { id: 'mental-1', label: 'Digital Hygiene & Awareness', status: 'active', rewards: { xp: '500 XP', gold: '100 Gold' } },
                { id: 'mental-2', label: 'Regulation Basics', status: 'active', rewards: { xp: '800 XP', gold: '200 Gold' } },
                { id: 'mental-3', label: 'Emotional Intelligence & Tools', status: 'active', rewards: { xp: '1200 XP', gold: '350 Gold' } },
                { id: 'mental-4', label: 'Resilience & Flow', status: 'active', rewards: { xp: '2000 XP', gold: '500 Gold' } },
            ];
        }
        if (pillarId === 'nutrition') {
            return [
                { id: 'nutrition-1', label: 'Triage & Hydration', status: 'active', rewards: { xp: '500 XP', gold: '100 Gold' } },
                { id: 'nutrition-2', label: 'Whole Food Foundations', status: 'active', rewards: { xp: '800 XP', gold: '200 Gold' } },
                { id: 'nutrition-3', label: 'Structure & Planning', status: 'active', rewards: { xp: '1200 XP', gold: '350 Gold' } },
                { id: 'nutrition-4', label: 'Metabolic Flexibility', status: 'active', rewards: { xp: '2000 XP', gold: '500 Gold' } },
            ];
        }
        if (pillarId === 'social') {
            return [
                { id: 'social-1', label: 'Re-engagement', status: 'active', rewards: { xp: '500 XP', gold: '100 Gold' } },
                { id: 'social-2', label: 'Consistent Community', status: 'active', rewards: { xp: '800 XP', gold: '200 Gold' } },
                { id: 'social-3', label: 'Depth & Vulnerability', status: 'active', rewards: { xp: '1200 XP', gold: '350 Gold' } },
                { id: 'social-4', label: 'Mentorship & Contribution', status: 'active', rewards: { xp: '2000 XP', gold: '500 Gold' } },
            ];
        }
        return [
            { id: `${pillarId}-1`, label: 'Phase I', status: 'locked', rewards: { xp: '500 XP', gold: '100 Gold' } },
            { id: `${pillarId}-2`, label: 'Phase II', status: 'locked', rewards: { xp: '800 XP', gold: '200 Gold' } },
            { id: `${pillarId}-3`, label: 'Phase III', status: 'locked', rewards: { xp: '1200 XP', gold: '350 Gold' } },
            { id: `${pillarId}-4`, label: 'Phase IV', status: 'locked', rewards: { xp: '2000 XP', gold: '500 Gold' } },
        ];
    };

    // Rotate pillars so the active one is in the center
    const activeIndex = pillars.findIndex(p => p.id === activePillar);
    const centerIndex = Math.floor(pillars.length / 2); // 2 for length 5

    // Calculate rotation offset needed to bring activeIndex to centerIndex
    // We want: (activeIndex + offset) % length = centerIndex
    // offset = centerIndex - activeIndex
    // But for array slicing it's easier to just reorder active to center.
    // Let's create a new sorted array.

    let rotatingPillars = [...pillars];
    if (activeIndex !== -1) {
        // We want the element at activeIndex to be at centerIndex (2)
        // Shift array elements accordingly.
        const shift = centerIndex - activeIndex;
        // If shift is negative (e.g. index 3 needs to go to 2, shift -1), we rotate left.
        // If shift is positive (e.g. index 0 needs to go to 2, shift +2), we rotate right.

        // Circular rotation function
        const rotate = (arr: any[], count: number) => {
            const len = arr.length;
            const normalizedShift = (count % len + len) % len; // normalized positive shift (right rotation)
            return [...arr.slice(len - normalizedShift), ...arr.slice(0, len - normalizedShift)];
        };

        rotatingPillars = rotate(pillars, shift);
    }

    return (
        <div className="w-full h-full overflow-hidden p-6 pl-12 relative flex items-center justify-center">

            <div className="flex w-full max-w-[1600px] h-full gap-8">

                {/* COL 1: PILLARS & BRANCHES (Flex Col of Rows) */}
                {/* justify-center ensures the expansion pushes others out symmetrically, creating a "center focus" feel */}
                <div className="flex-none flex flex-col justify-start items-start h-full py-2 gap-2 min-w-[640px]">

                    {/* Access & Assess Headers */}
                    <div className="w-full flex items-center mb-4">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest w-48 pl-4 text-left">Choose an area</span>
                        <div className="pl-[136px]">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Assess your current level</span>
                        </div>
                    </div>

                    {rotatingPillars.map((pillar) => {
                        const isRealActive = activePillar === pillar.id;
                        const isVisualActive = false; // logic moved to detail panel
                        const isActive = isRealActive || isVisualActive;

                        return (
                            <motion.div
                                layout
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                key={pillar.id}
                                onClick={() => setActivePillar(pillar.id)}
                                className={`flex items-center gap-4 group cursor-pointer relative ${isActive ? 'py-2' : 'py-0.5 opacity-80 hover:opacity-100'}`}
                            >

                                {/* PILLAR NODE (Left) */}
                                <motion.div
                                    layout
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    whileHover={{ scale: 1.05 }}
                                    animate={{ scale: isActive ? 1.05 : 0.95 }}
                                    className={`
                                        rounded-xl border backdrop-blur-sm flex items-center gap-3 relative z-10 shadow-lg
                                        ${pillar.border} ${pillar.bg}
                                        ${isActive ? 'w-64 p-5 shadow-xl ring-1 ring-white/10' : 'w-48 p-3'}
                                    `}
                                >
                                    <div className={`p-1.5 rounded-lg bg-slate-900/40 ${pillar.color}`}>
                                        <pillar.icon size={isActive ? 24 : 16} />
                                    </div>
                                    <h3 className={`font-bold transition-all ${isActive ? `text-sm ${pillar.color}` : 'text-xs text-slate-400'}`}>
                                        {pillar.label}
                                    </h3>


                                </motion.div>

                                {/* BRANCH NODES (Compact Stack of 4) - Only visible if Active */}

                                {/* Animate expansion of branches */}
                                {/* Animate expansion of branches - ABSOLUTE POSITIONED TO PREVENT GAP EXPANSION */}
                                <motion.div
                                    initial={false}
                                    style={{ pointerEvents: isRealActive ? 'auto' : 'none' }}
                                    animate={{
                                        opacity: isRealActive ? 1 : 0,
                                        x: isRealActive ? 0 : -20,
                                        y: "-50%", // Explicitly enforce centering translation in Framer Motion
                                        scale: isRealActive ? 1 : 0.8
                                    }}
                                    className={`flex flex-col gap-2 pl-[72px] absolute left-full top-1/2 z-20 ${!isRealActive && 'hidden'}`}
                                >
                                    {getSubBranches(pillar.id).map((branch, i) => {
                                        const isSelected = activeBranch === branch.id;
                                        return (
                                            <motion.div
                                                key={i}
                                                layout
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.05 }}
                                                className="flex items-center gap-4"
                                            >
                                                {/* Line from vertical bar to node */}


                                                <motion.div
                                                    onClick={(e) => {
                                                        e.stopPropagation(); // prevent clicking pillar behind?
                                                        setActiveBranch(branch.id);
                                                    }}
                                                    whileHover={{ scale: 1.02 }}
                                                    className={`
                                                        w-60 py-2 px-5 rounded-lg border transition-all cursor-pointer flex flex-col relative
                                                        ${isSelected
                                                            ? 'border-indigo-400 bg-indigo-500/20 ring-1 ring-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.3)]'
                                                            : branch.status === 'active'
                                                                ? 'border-indigo-500/30 bg-slate-900/90 hover:border-indigo-500/50'
                                                                : 'border-slate-800 bg-slate-900/60 opacity-60 grayscale hover:grayscale-0'
                                                        }
                                                    `}
                                                >
                                                    <div className="flex w-full justify-between items-start">
                                                        <div className="flex flex-col">
                                                            <h4 className={`font-bold text-xs transition-colors ${isSelected ? 'text-indigo-200' : 'text-slate-200'}`}>{branch.label}</h4>
                                                            <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider mt-1">
                                                                {branch.status}
                                                            </span>
                                                        </div>
                                                        {branch.rewards && (
                                                            <div className="flex flex-col items-end gap-0.5">
                                                                <span className={`text-[9px] font-bold ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>{branch.rewards.xp}</span>
                                                                <span className={`text-[9px] font-bold ${isSelected ? 'text-amber-400' : 'text-amber-600/70'}`}>{branch.rewards.gold}</span>
                                                            </div>
                                                        )}
                                                    </div>


                                                </motion.div>
                                            </motion.div>
                                        );
                                    })}
                                </motion.div>

                            </motion.div>
                        );
                    })}
                </div>

                {/* COL 2: DETAIL PANEL (Animates in) */}
                <AnimatePresence>
                    {activeBranch && (
                        <div className="flex flex-col h-full pt-2">
                            <div className="mb-4">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Start small & set a goal</span>
                            </div>
                            <VitalityDetailPanel activeBranch={activeBranch} setActiveBranch={setActiveBranch} />
                        </div>
                    )}
                </AnimatePresence>

                {/* COL 3: ULTIMATE GOAL (Always Visible) */}
                <div className="flex-1 flex flex-col items-end justify-start pl-8 pr-8 pt-2 border-l border-slate-800/30 relative min-w-[320px] gap-6">

                    {/* Header for Column 4 */}
                    <div className="w-full text-left mb-[-10px]">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Achieve mastery (long term goal)</span>
                    </div>

                    {/* Background Image for Column 3 */}


                    {/* COL 3: ULTIMATE GOAL (Always Visible) */}

                    {/* Background Image for Column 3 */}


                    <div className="flex items-center gap-2 mb-[-10px] opacity-70 self-start">
                        <Lock size={16} className="text-slate-500" />
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Locked Rewards</span>
                    </div>

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.5 }}
                        className="w-full p-6 rounded-2xl bg-slate-950 border border-amber-500/30 shadow-[0_0_15px_-5px_rgba(245,158,11,0.15)] flex flex-col items-center text-center gap-4 relative overflow-hidden group hover:border-amber-500/60 hover:shadow-[0_0_30px_-5px_rgba(245,158,11,0.4)] transition-all duration-500"
                    >
                        {/* Background Image - Local to Panel */}
                        <div
                            className="absolute inset-0 bg-cover bg-center z-0 opacity-50"
                            style={{ backgroundImage: "url('/assets/vitality_peak_quest_card.jpg')" }}
                        />
                        {/* Gradient Overlay for Text Readability */}
                        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-slate-950/80 to-slate-950 z-0" />

                        <div className="absolute inset-0 bg-[url('/assets/noise.svg')] opacity-10 mix-blend-overlay" />
                        <div className="absolute -inset-10 bg-amber-500/10 blur-3xl rounded-full" />

                        <div className="relative z-10 w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500 flex items-center justify-center text-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.3)]">
                            <Trophy size={32} />
                        </div>

                        <div className="relative z-10">
                            <h2 className="text-xl font-black text-amber-100 uppercase tracking-widest mb-1">Immortal Engine</h2>
                            <p className="text-xs text-amber-500/80 font-bold uppercase tracking-wider mb-3">Mastery Achievement</p>
                            <p className="text-xs text-slate-400 leading-relaxed px-4">
                                Complete all five vitality pathways to unlock and equip the <span className="text-amber-200">Vitality Peak: Immortal Engine Achievement</span>. Wear it with pride, adventurer.
                            </p>
                        </div>
                    </motion.div>

                    {/* REWARDS PANEL */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="w-full p-6 rounded-2xl bg-slate-900/40 border border-slate-800/50 flex flex-col gap-3 relative"
                    >
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Potential Rewards</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {/* XP */}
                            <div className="p-3 rounded-lg bg-gradient-to-br from-slate-800 to-slate-950 border border-slate-600 flex flex-col items-center justify-center gap-1 shadow-[0_0_15px_rgba(255,255,255,0.05)] relative overflow-hidden group">
                                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 drop-shadow-sm">5000</span>
                                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">XP</span>
                            </div>

                            {/* Gold */}
                            <div className="p-3 rounded-lg bg-gradient-to-br from-amber-950/40 to-slate-950 border border-amber-500/30 flex flex-col items-center justify-center gap-1 shadow-[0_0_15px_rgba(245,158,11,0.1)] relative overflow-hidden group">
                                <div className="absolute inset-0 bg-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-b from-amber-300 to-amber-600 drop-shadow-sm">1000</span>
                                <span className="text-[10px] text-amber-500/80 uppercase font-bold tracking-wider">Gold</span>
                            </div>

                            {/* Skill Point */}
                            <div className="p-3 rounded-lg bg-gradient-to-br from-cyan-950/40 to-slate-950 border border-cyan-500/30 flex flex-col items-center justify-center gap-1 shadow-[0_0_15px_rgba(6,182,212,0.1)] relative overflow-hidden group">
                                <div className="absolute inset-0 bg-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-b from-cyan-300 to-cyan-600 drop-shadow-sm">+1</span>
                                <span className="text-[10px] text-cyan-500/80 uppercase font-bold tracking-wider">Skill Point</span>
                            </div>

                            {/* Mystery Loot */}
                            <div className="p-3 rounded-lg bg-gradient-to-br from-indigo-950/40 to-slate-950 border border-indigo-500/30 flex flex-col items-center justify-center gap-1 shadow-[0_0_15px_rgba(99,102,241,0.1)] relative overflow-hidden group">
                                <div className="absolute inset-0 bg-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="text-indigo-400 mb-0.5 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]">
                                    <Gift size={20} />
                                </div>
                                <span className="text-[10px] text-indigo-500/80 uppercase font-bold tracking-wider">Mystery Loot</span>
                            </div>
                        </div>
                    </motion.div>

                </div>

            </div>
        </div>
    );
};
