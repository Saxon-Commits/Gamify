import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Brain, Utensils, Users, Moon, Footprints, Flame, Timer, TrendingUp, X, Check, Package } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { useToastStore } from '../store/useToastStore';

// === INTERNAL COMPONENT: Log Steps Modal ===
const LogStepsModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (steps: number, date: string) => void;
    initialDate?: string;
    initialSteps?: number;
}> = ({ isOpen, onClose, onSave, initialDate, initialSteps }) => {
    // Default to local date YYYY-MM-DD
    const getLocalDateStr = () => {
        const d = new Date();
        const offset = d.getTimezoneOffset() * 60000;
        return new Date(d.getTime() - offset).toISOString().split('T')[0];
    };

    const [steps, setSteps] = useState<string>(initialSteps ? initialSteps.toString() : '');
    const [date, setDate] = useState<string>(initialDate || getLocalDateStr());

    // Reset state when modal opens with new props
    React.useEffect(() => {
        if (isOpen) {
            setDate(initialDate || getLocalDateStr());
            setSteps(initialSteps ? initialSteps.toString() : '');
        }
    }, [isOpen, initialDate, initialSteps]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 relative overflow-hidden"
            >
                {/* Background Noise/Effect */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors">
                    <X size={20} />
                </button>

                <div className="mb-6">
                    <h3 className="text-xl font-black text-white uppercase tracking-wider mb-1 flex items-center gap-2">
                        <Footprints size={20} className="text-indigo-400" /> {initialSteps ? 'Update Activity' : 'Log Activity'}
                    </h3>
                    <p className="text-xs text-slate-400">Record your steps for a specific day.</p>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Step Count</label>
                        <input
                            type="number"
                            value={steps}
                            onChange={(e) => setSteps(e.target.value)}
                            placeholder="e.g. 8432"
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white font-mono text-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-700"
                            autoFocus
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Date</label>
                        <input
                            type="date"
                            onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
                            value={date}
                            max={getLocalDateStr()}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all [color-scheme:dark]"
                        />
                    </div>

                    <button
                        onClick={() => {
                            const val = parseInt(steps);
                            if (!isNaN(val) && val >= 0 && date) {
                                onSave(val, date);
                                onClose();
                                setSteps('');
                            }
                        }}
                        className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold uppercase tracking-widest shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <Check size={18} />
                        <span>Save Entry</span>
                    </button>
                </div>
            </motion.div>
        </div>
    );
};


// === INTERNAL COMPONENT: Physical Dashboard ===
const PhysicalDashboard: React.FC = () => {
    // State
    const [viewMode, setViewMode] = useState<'week' | 'month'>('week');

    // Queries & Mutations
    // Get local date string for filtering
    const localDate = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0];

    // Determine limit based on view mode
    const limit = viewMode === 'week' ? 7 : 30; // 7 days or 30 days

    // Fetch stats with new query
    // @ts-ignore
    const stats = useQuery(api.vitality.getVitalityStats, { endDate: localDate, limit });
    const logSteps = useMutation(api.vitality.logSteps);

    const [isLogModalOpen, setIsLogModalOpen] = useState(false);
    const [selectedLogDate, setSelectedLogDate] = useState<string | undefined>(undefined);
    const [selectedLogSteps, setSelectedLogSteps] = useState<number | undefined>(undefined);

    // Default / Loading State
    const todaySteps = stats?.today?.steps || 0;
    const stepGoal = 10000;
    const caloriesBurned = stats?.today?.calories || 0;
    const activeMinutes = stats?.today?.activeMinutes || 0;
    const isGoalMet = stats?.today?.goalMet || todaySteps >= stepGoal;

    // --- GAP FILLING LOGIC ---
    // Generate full list of dates for the view period
    const generateDateRange = (days: number) => {
        const dates = [];
        const anchor = new Date(localDate);

        for (let i = 0; i < days; i++) {
            const d = new Date(anchor);
            d.setDate(d.getDate() - i);
            dates.push(d.toISOString().split('T')[0]);
        }
        return dates.reverse(); // Oldest to newest
    };

    const rangeDates = generateDateRange(limit);
    const rawHistory = stats?.history || [];

    // Merge API data with date range (filling 0s)
    const chartData = rangeDates.map(date => {
        const entry = rawHistory.find((h: any) => h.date === date);
        return entry || { date, steps: 0, goalMet: false };
    });

    // --- STATISTICS CALCULATION ---
    const totalSteps = chartData.reduce((acc, curr) => acc + curr.steps, 0);
    const averageSteps = Math.round(totalSteps / limit);

    // Trend Logic
    const calculateTrend = () => {
        if (!rawHistory.length) return 0;

        const currentStartDate = rangeDates[0];
        const prevAnchor = new Date(rangeDates[0]);
        prevAnchor.setDate(prevAnchor.getDate() - 1); // Day before start of current

        let currentSum = 0;
        let prevSum = 0;

        const startCurrent = rangeDates[0];
        const endCurrent = rangeDates[rangeDates.length - 1];

        const pStart = new Date(currentStartDate);
        pStart.setDate(pStart.getDate() - limit);
        const prevStartStr = pStart.toISOString().split('T')[0];
        const prevEndStr = new Date(currentStartDate);
        prevEndStr.setDate(prevEndStr.getDate() - 1);
        const prevEndStrVal = prevEndStr.toISOString().split('T')[0];

        rawHistory.forEach((d: any) => {
            if (d.date >= startCurrent && d.date <= endCurrent) {
                currentSum += d.steps;
            } else if (d.date >= prevStartStr && d.date <= prevEndStrVal) {
                prevSum += d.steps;
            }
        });

        if (prevSum === 0) return currentSum > 0 ? 100 : 0;
        return Math.round(((currentSum - prevSum) / prevSum) * 100);
    };

    const trendPercentage = calculateTrend();
    const isTrendPositive = trendPercentage >= 0;

    const maxSteps = Math.max(...chartData.map(d => d.steps), stepGoal, 1);
    const addToast = useToastStore((state) => state.addToast);

    const handleSaveSteps = (steps: number, date: string) => {
        const isCurrentlyMet = stats?.today?.goalMet || false;
        // Only trigger goal toast if editing today's steps and it crosses the threshold
        const isToday = date === localDate;
        if (isToday && steps >= stepGoal && !isCurrentlyMet) {
            addToast({ type: 'xp', amount: '+500', message: 'Daily Goal Reached' });
            setTimeout(() => {
                addToast({ type: 'gold', amount: '+100', message: 'Gold Earned' });
            }, 500);
        }
        logSteps({ steps: steps, date: date });
    };

    const openLogModal = (date?: string, steps?: number) => {
        setSelectedLogDate(date);
        setSelectedLogSteps(steps);
        setIsLogModalOpen(true);
    };

    return (
        <div className="w-full h-full p-6 flex flex-col gap-4 overflow-hidden">
            <AnimatePresence>
                {isLogModalOpen && (
                    <LogStepsModal
                        isOpen={isLogModalOpen}
                        onClose={() => setIsLogModalOpen(false)}
                        onSave={handleSaveSteps}
                        initialDate={selectedLogDate}
                        initialSteps={selectedLogSteps}
                    />
                )}
            </AnimatePresence>

            {/* TOP ROW: Restored Original Layout (slightly tighter) */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 shrink-0">
                {/* 1. Main Step Counter */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="col-span-1 lg:col-span-2 p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 relative overflow-hidden group shadow-lg"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Footprints size={120} className="text-white" />
                    </div>

                    <div className="relative z-10 flex flex-col gap-1">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Activity size={14} className="text-rose-500" /> Today's Activity
                        </h3>
                        <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-5xl font-black text-white tracking-tight">{todaySteps.toLocaleString()}</span>
                            <span className="text-lg font-bold text-slate-500">/ {stepGoal.toLocaleString()}</span>
                        </div>
                        <div className="w-full h-3 bg-slate-800 rounded-full mt-3 overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min((todaySteps / stepGoal) * 100, 100)}%` }}
                                transition={{ duration: 1, delay: 0.2 }}
                                className={`h-full rounded-full ${todaySteps >= stepGoal ? 'bg-gradient-to-r from-emerald-500 to-green-500' : 'bg-gradient-to-r from-rose-500 to-orange-500'}`}
                            />
                        </div>
                        <p className="text-xs text-slate-500 mt-2 font-mono">
                            {todaySteps >= stepGoal ? "Goal Crushin' it! 🚀" : `${(stepGoal - todaySteps).toLocaleString()} steps to go!`}
                        </p>
                    </div>
                </motion.div>

                {/* 2. Mini Stats & Actions (Middle Column) */}
                <div className="flex flex-col gap-3">
                    {/* Log Steps Action */}
                    <motion.button
                        onClick={() => openLogModal()}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full flex-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold uppercase tracking-widest shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 transition-colors group p-3"
                    >
                        <Footprints size={18} />
                        <span>Log Steps</span>
                    </motion.button>

                    <div className="flex gap-3 flex-1">
                        <motion.div className="flex-1 p-3 rounded-xl bg-slate-900/50 border border-slate-800 flex flex-col items-center justify-center gap-1">
                            <div className="text-orange-500"><Flame size={18} /></div>
                            <p className="text-sm font-black text-white">{caloriesBurned}</p>
                            <span className="text-[9px] font-bold text-slate-500 uppercase">Kcal</span>
                        </motion.div>

                        <motion.div className="flex-1 p-3 rounded-xl bg-slate-900/50 border border-slate-800 flex flex-col items-center justify-center gap-1">
                            <div className="text-cyan-500"><Timer size={18} /></div>
                            <p className="text-sm font-black text-white">{activeMinutes}m</p>
                            <span className="text-[9px] font-bold text-slate-500 uppercase">Active</span>
                        </motion.div>
                    </div>
                </div>

                {/* 3. Daily Reward Chest (Right Column) */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="relative p-5 rounded-2xl bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-slate-800 flex flex-col items-center justify-between group overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                    <div className="relative z-10 flex flex-col items-center gap-1">
                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Daily Reward</span>
                        <div className="p-3 rounded-full bg-slate-900 border border-slate-800 shadow-xl relative mt-2">
                            {isGoalMet && (
                                <div className="absolute inset-0 rounded-full bg-yellow-500/20 blur-xl animate-pulse" />
                            )}
                            <motion.div
                                animate={isGoalMet ? { rotate: [0, -10, 10, -5, 5, 0], scale: 1.1 } : {}}
                                transition={{ duration: 0.5, delay: 0.2 }}
                            >
                                {isGoalMet ? (
                                    <Package size={28} className="text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]" />
                                ) : (
                                    <Package size={28} className="text-slate-600" />
                                )}
                            </motion.div>
                        </div>
                    </div>

                    <div className="relative z-10 mt-3 text-center">
                        {isGoalMet ? (
                            <span className="text-xs font-bold text-yellow-400 animate-pulse">UNLOCKED!</span>
                        ) : (
                            <span className="text-xs font-mono text-slate-500">{(Math.min((todaySteps / stepGoal) * 100, 100)).toFixed(0)}%</span>
                        )}
                    </div>

                    <div className="absolute bottom-0 left-0 w-full bg-indigo-600/20 transition-all duration-1000" style={{ height: `${Math.min((todaySteps / stepGoal) * 100, 100)}%` }} />
                </motion.div>
            </div>

            {/* BOTTOM SECTION: Chart (Takes remaining height) */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex-1 p-5 rounded-2xl bg-slate-900/30 border border-slate-800/50 flex flex-col gap-4 relative min-h-0"
            >
                {/* Chart Header */}
                <div className="flex justify-between items-start shrink-0">
                    <div className="flex flex-col gap-1">
                        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <TrendingUp size={12} className="text-indigo-400" /> Activity History
                        </h3>
                        <div className="flex items-center gap-6 mt-1">
                            <div>
                                <span className="text-2xl font-black text-white">{averageSteps.toLocaleString()}</span>
                                <span className="text-[10px] text-slate-500 font-bold uppercase ml-1">Avg / Day</span>
                            </div>
                            <div className={`flex items-center gap-1 ${isTrendPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {isTrendPositive ? <TrendingUp size={16} /> : <TrendingUp size={16} className="rotate-180" />}
                                <span className="text-lg font-bold">{Math.abs(trendPercentage)}%</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800">
                        {['week', 'month'].map((v) => (
                            <button
                                key={v}
                                onClick={() => setViewMode(v as any)}
                                className={`px-3 py-1 text-[10px] font-bold uppercase rounded-md transition-all ${viewMode === v ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                {v === 'week' ? 'Weekly' : 'Monthly'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Chart Content - Flexible Height */}
                <div className="flex-1 w-full flex gap-4 min-h-0">
                    {/* Y-Axis */}
                    <div className="flex flex-col justify-between items-end text-[9px] font-mono text-slate-500 py-1">
                        <span>{maxSteps >= 1000 ? `${(maxSteps / 1000).toFixed(1)}k` : maxSteps}</span>
                        <span>{(maxSteps * 0.75 / 1000).toFixed(1)}k</span>
                        <span>{(maxSteps * 0.5 / 1000).toFixed(1)}k</span>
                        <span>{(maxSteps * 0.25 / 1000).toFixed(1)}k</span>
                        <span>0</span>
                    </div>

                    <div className="flex-1 flex flex-col h-full min-h-0">
                        {/* Plot Area */}
                        <div className="relative flex-1 border-l border-slate-800/50 w-full pl-2">
                            {/* Grid Lines */}
                            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none z-0">
                                {[0, 1, 2, 3, 4].map(i => (
                                    <div key={i} className="w-full h-px bg-slate-800/10 dashed transform translate-y-[0.5px]" />
                                ))}
                            </div>

                            {/* Bars */}
                            <div className="absolute inset-0 flex items-end justify-between px-2 z-10 gap-[1px] lg:gap-1">
                                {chartData.map((day, index) => {
                                    const heightPercentage = Math.min((day.steps / maxSteps) * 100, 100);
                                    const isToday = day.date === new Date().toISOString().split('T')[0];
                                    const isGoalMet = day.steps >= stepGoal;

                                    return (
                                        <div
                                            key={index}
                                            onClick={() => openLogModal(day.date, day.steps)}
                                            className="flex-1 h-full flex flex-col items-center justify-end group relative cursor-pointer hover:bg-white/5 rounded-t-lg transition-colors"
                                        >
                                            {/* Tooltip */}
                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-[100%] left-1/2 -translate-x-1/2 mb-1 z-50 pointer-events-none">
                                                <div className="bg-slate-800 text-white text-[10px] font-bold py-1 px-2 rounded border border-slate-700 shadow-xl whitespace-nowrap z-50">
                                                    {day.steps.toLocaleString()} steps
                                                    <div className="text-[9px] font-normal text-slate-400">{day.date} (Click to Edit)</div>
                                                </div>
                                            </div>

                                            <motion.div
                                                initial={{ height: 0 }}
                                                animate={{ height: `${heightPercentage}%` }}
                                                transition={{ type: 'spring', stiffness: 100, damping: 20, delay: index * 0.01 }}
                                                className={`
                                                    w-full rounded-t-[1px] relative transition-all duration-300 group-hover:brightness-125 group-hover:scale-y-[1.02] origin-bottom
                                                    ${viewMode === 'week' ? 'max-w-[32px] rounded-t-sm' : 'max-w-full'}
                                                    ${isGoalMet ? 'bg-emerald-500' : isToday ? 'bg-rose-500' : 'bg-slate-700/50'}
                                                `}
                                            />
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* X-Axis */}
                        <div className="flex justify-between pl-2 mt-2 h-4 items-start w-full gap-[2px]">
                            {chartData.map((day, index) => {
                                const dateObj = new Date(day.date);

                                // INTELLIGENT LABELING
                                let label = '';

                                if (viewMode === 'week') {
                                    // Week: Show Weekday Name
                                    label = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                                } else {
                                    // Month: Show Day Number (e.g. 15)
                                    // Show all dates in small font
                                    label = dateObj.getDate().toString();
                                }

                                return (
                                    <div key={index} className="flex-1 text-center flex justify-center overflow-visible">
                                        <span className={`text-[8px] font-bold uppercase text-slate-500 block whitespace-nowrap ${viewMode === 'month' ? 'text-[7px]' : ''}`}>
                                            {label}
                                        </span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};


export const VitalityFlowChart: React.FC = () => {
    const { vitality } = useGameStore();
    const [activePillar, setActivePillar] = React.useState<string>('physical');

    const pillars = [
        { id: 'physical', label: 'Physical Health', icon: Activity, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
        { id: 'mental', label: 'Mental Health', icon: Brain, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
        { id: 'nutrition', label: 'Nutrition', icon: Utensils, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' },
        { id: 'sleep', label: 'Sleep', icon: Moon, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
    ];

    return (
        <div className="w-full h-full overflow-hidden p-6 relative flex items-center justify-center bg-slate-950">
            <div className="flex w-full max-w-7xl h-full gap-8 z-10 relative">

                {/* LEFT COLUMN: Navigation / Selection */}
                <div className="flex-none w-80 flex flex-col justify-center h-full gap-4 z-20">
                    <div className="mb-4 pl-4">
                        <h2 className="text-xl font-black text-white uppercase tracking-widest">Vitality</h2>
                        <p className="text-slate-400 text-xs">Select Optimization Protocol</p>
                    </div>

                    <div className="flex flex-col gap-3">
                        {pillars.map((pillar) => {
                            const isActive = activePillar === pillar.id;

                            return (
                                <motion.div
                                    layout
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    key={pillar.id}
                                    onClick={() => setActivePillar(pillar.id)}
                                    className={`flex items-center gap-4 group cursor-pointer relative transition-all duration-300 ${isActive ? 'translate-x-4' : 'opacity-60 hover:opacity-100 hover:translate-x-2'}`}
                                >
                                    <motion.div
                                        layout
                                        className={`
                                            rounded-xl border backdrop-blur-sm flex items-center gap-4 relative z-10 shadow-lg transition-all duration-300
                                            ${pillar.border} ${pillar.bg}
                                            ${isActive ? 'w-full p-4 shadow-xl ring-1 ring-white/10' : 'w-64 p-3'}
                                        `}
                                    >
                                        <div className={`p-2 rounded-lg bg-slate-900/40 ${pillar.color}`}>
                                            <pillar.icon size={isActive ? 20 : 18} />
                                        </div>
                                        <h3 className={`font-bold transition-all ${isActive ? `text-sm ${pillar.color}` : 'text-xs text-slate-400'}`}>
                                            {pillar.label}
                                        </h3>

                                        {isActive && (
                                            <motion.div layoutId="active-dot" className="absolute right-4 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_10px_white]" />
                                        )}
                                    </motion.div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* RIGHT COLUMN: Dynamic Dashboard Content */}
                <div className="flex-1 h-full py-8 pr-8 relative z-10">
                    <div className="w-full h-full rounded-2xl bg-slate-900/20 border border-slate-800/50 backdrop-blur-md shadow-2xl overflow-hidden relative">
                        {/* Scanline / Noise Overlay (Local) */}
                        <div className="absolute inset-0 bg-[url('/assets/noise.svg')] opacity-[0.02] pointer-events-none z-0" />

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activePillar}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                                className="w-full h-full relative z-10"
                            >
                                {activePillar === 'physical' ? (
                                    <PhysicalDashboard />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-slate-500">
                                        <div className="p-4 rounded-full bg-slate-900 border border-slate-800">
                                            {React.createElement(pillars.find(p => p.id === activePillar)?.icon || Activity, { size: 32 })}
                                        </div>
                                        <p className="font-mono text-sm uppercase tracking-widest">Dashboard construction in progress...</p>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Global Background Elements */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-slate-900/50 rounded-full blur-3xl opacity-30" />
                <div className="absolute top-0 left-0 w-full h-full bg-[url('/assets/noise.svg')] opacity-[0.03]" />
            </div>
        </div>
    );
};
