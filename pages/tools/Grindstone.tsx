import React, { useState, useEffect } from 'react';
import { Hammer, Clock, Trophy, Play, Square, CheckCircle, Gift, Sparkles } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import { useNavigate } from 'react-router-dom';
import { SHOP_ITEMS } from '../../src/utils/GameEconomy';

const FOCUS_OPTIONS = [
    { label: '15 Mins', duration: 15, xp: 50, gold: 10 },
    { label: '30 Mins', duration: 30, xp: 100, gold: 25 },
    { label: '60 Mins', duration: 60, xp: 250, gold: 60 },
    { label: '90 Mins', duration: 90, xp: 400, gold: 100 },
];

export const Grindstone: React.FC = () => {
    const navigate = useNavigate();
    const { addRewards, addJournalEntry, completeTask } = useGameStore();
    const [earnedLoot, setEarnedLoot] = useState<{ type: 'VOID_SHARD' | 'ITEM' | null, item?: any } | null>(null);

    const [selectedOption, setSelectedOption] = useState(FOCUS_OPTIONS[1]);
    const [isActive, setIsActive] = useState(false);
    const [timeLeft, setTimeLeft] = useState(selectedOption.duration * 60);
    const [isCompleted, setIsCompleted] = useState(false);

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && isActive) {
            handleComplete();
        }

        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    // Reset timer when option changes
    useEffect(() => {
        if (!isActive) {
            setTimeLeft(selectedOption.duration * 60);
        }
    }, [selectedOption]);

    const handleStart = () => {
        setIsActive(true);
        setIsCompleted(false);
    };

    const handleGiveUp = () => {
        if (confirm('Are you sure you want to break focus? No rewards will be given.')) {
            setIsActive(false);
            setTimeLeft(selectedOption.duration * 60);
        }
    };

    const handleComplete = () => {
        setIsActive(false);
        setIsCompleted(true);
        setEarnedLoot(null);

        // 1. Give Rewards
        addRewards(selectedOption.xp, selectedOption.gold);

        // 2. Roll for Loot
        const multiplier = selectedOption.duration / 15;
        const itemChance = 0.05 * multiplier;
        const voidShardChance = 0.01 * multiplier;
        const roll = Math.random();

        if (roll < voidShardChance) {
            const rareItems = SHOP_ITEMS.filter(i => (i as any).rarity === 'RARE' || (i as any).rarity === 'MYSTIC');
            const wonItem = rareItems[Math.floor(Math.random() * rareItems.length)];
            if (wonItem) {
                useGameStore.getState().addItem(wonItem.id, 1);
                setEarnedLoot({ type: 'ITEM', item: wonItem });
            }
        } else if (roll < itemChance + voidShardChance) {
            const commonItems = SHOP_ITEMS.filter(i => !['AVATAR', 'BLACK_MARKET'].includes(i.type));
            const wonItem = commonItems[Math.floor(Math.random() * commonItems.length)];
            if (wonItem) {
                useGameStore.getState().addItem(wonItem.id, 1);
                setEarnedLoot({ type: 'ITEM', item: wonItem });
            }
        }

        // 3. Log to Journal
        addJournalEntry({
            title: `Commonplace Book: Focus Session (${selectedOption.duration}m)`,
            content: `<p>Completed a <strong>${selectedOption.duration} minute</strong> focus session.</p><p>Focus: General Productivity / Vitality Peak</p>`,
            tags: ['Grindstone', 'Focus', 'Vitality'],
            folder: 'Grindstone Log'
        });
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const calculateProgress = () => {
        const totalSeconds = selectedOption.duration * 60;
        return ((totalSeconds - timeLeft) / totalSeconds) * 100;
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">

            {/* Background Ambience */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-900/20 via-slate-950 to-slate-950 pointer-events-none" />

            {/* Header */}
            {!isActive && !isCompleted && (
                <div className="text-center mb-12 relative z-10">
                    <div className="inline-flex p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 mb-6 animate-pulse">
                        <Hammer size={48} className="text-amber-500" />
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-4">
                        The Grindstone
                    </h1>
                    <p className="text-slate-400 text-lg max-w-md mx-auto">
                        Sharpen your mind against the wheel of time. Choose your duration and eliminate all distractions.
                    </p>
                </div>
            )}

            {/* Selection Mode */}
            {!isActive && !isCompleted && (
                <div className="w-full max-w-4xl grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
                    {FOCUS_OPTIONS.map((opt) => (
                        <button
                            key={opt.label}
                            onClick={() => setSelectedOption(opt)}
                            className={`group relative p-6 rounded-2xl border transition-all duration-300 ${selectedOption.label === opt.label
                                ? 'bg-amber-500/10 border-amber-500 ring-1 ring-amber-500/50'
                                : 'bg-slate-900/50 border-slate-800 hover:border-slate-600 hover:bg-slate-800'
                                }`}
                        >
                            <div className="text-center space-y-2">
                                <span className={`text-2xl font-black ${selectedOption.label === opt.label ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`}>
                                    {opt.duration}m
                                </span>
                                <div className="flex flex-col gap-1 text-xs font-mono">
                                    <span className="text-purple-400">+{opt.xp} XP</span>
                                    <span className="text-amber-400">+{opt.gold} Gold</span>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {/* Start Button */}
            {!isActive && !isCompleted && (
                <button
                    onClick={handleStart}
                    className="mt-12 group relative px-8 py-4 bg-slate-100 hover:bg-white text-slate-900 rounded-xl font-bold uppercase tracking-wider transition-all hover:scale-105 active:scale-95 flex items-center gap-3 z-10"
                >
                    <Play size={20} className="fill-current" />
                    <span>Begin Focus</span>
                </button>
            )}

            {/* Active Timer Mode */}
            {isActive && (
                <div className="relative z-10 flex flex-col items-center">
                    {/* Circle Progress */}
                    <div className="relative mb-12">
                        <svg className="w-80 h-80 transform -rotate-90">
                            <circle
                                cx="160"
                                cy="160"
                                r="150"
                                stroke="currentColor"
                                strokeWidth="8"
                                fill="transparent"
                                className="text-slate-800"
                            />
                            <circle
                                cx="160"
                                cy="160"
                                r="150"
                                stroke="currentColor"
                                strokeWidth="8"
                                fill="transparent"
                                strokeDasharray={2 * Math.PI * 150}
                                strokeDashoffset={2 * Math.PI * 150 * (1 - calculateProgress() / 100)}
                                className="text-amber-500 transition-all duration-1000 ease-linear"
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-6xl font-black text-white font-mono tabular-nums">
                                {formatTime(timeLeft)}
                            </span>
                        </div>
                    </div>

                    <p className="text-amber-500/80 animate-pulse uppercase tracking-widest text-sm font-bold mb-8">
                        Focus in Progress
                    </p>

                    {/* Reward Accumulation */}
                    <div className="grid grid-cols-2 gap-6 w-full max-w-sm mb-12">
                        {/* XP Bar */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
                                <span>XP</span>
                                <span className="text-purple-400">
                                    {Math.floor(selectedOption.xp * (calculateProgress() / 100))} / {selectedOption.xp}
                                </span>
                            </div>
                            <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-purple-500 transition-all duration-1000 ease-linear"
                                    style={{ width: `${calculateProgress()}%` }}
                                />
                            </div>
                        </div>

                        {/* Gold Bar */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
                                <span>Gold</span>
                                <span className="text-amber-400">
                                    {Math.floor(selectedOption.gold * (calculateProgress() / 100))} / {selectedOption.gold}
                                </span>
                            </div>
                            <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-amber-500 transition-all duration-1000 ease-linear"
                                    style={{ width: `${calculateProgress()}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleGiveUp}
                        className="px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg border border-red-500/20 transition-colors flex items-center gap-2"
                    >
                        <Square size={16} className="fill-current" />
                        <span>Give Up</span>
                    </button>
                </div>
            )}

            {/* Completion Screen */}
            {isCompleted && (
                <div className="relative z-10 text-center space-y-8 animate-in fade-in zoom-in duration-500">
                    <div className="inline-flex p-6 bg-green-500/20 rounded-full border border-green-500/50 text-green-400 mb-4">
                        <CheckCircle size={64} />
                    </div>

                    <div>
                        <h2 className="text-4xl font-black text-white uppercase mb-2">Session Complete</h2>
                        <p className="text-slate-400">Your mind is sharper. The grind continues.</p>
                    </div>

                    <div className="flex justify-center gap-8">
                        <div className="text-center">
                            <div className="text-3xl font-black text-purple-400">+{selectedOption.xp}</div>
                            <div className="text-xs text-slate-500 uppercase font-bold">XP Gained</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-black text-amber-400">+{selectedOption.gold}</div>
                            <div className="text-xs text-slate-500 uppercase font-bold">Gold Gained</div>
                        </div>
                    </div>

                    {earnedLoot && earnedLoot.item && (
                        <div className="animate-in slide-in-from-bottom-5 fade-in duration-700 delay-300 mx-auto max-w-sm mt-6">
                            <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-900/50 to-slate-900 border border-indigo-500/50 flex items-center gap-4 shadow-xl shadow-indigo-500/10">
                                <div className="p-3 bg-slate-950 rounded-lg border border-slate-700">
                                    {earnedLoot.item.imageUrl ? (
                                        <img src={earnedLoot.item.imageUrl} alt={earnedLoot.item.name} className="w-10 h-10 object-contain" />
                                    ) : (
                                        <Gift className="text-indigo-400" size={24} />
                                    )}
                                </div>
                                <div className="text-left">
                                    <div className="text-xs text-indigo-300 font-bold uppercase tracking-wider flex items-center gap-1">
                                        <Sparkles size={10} />
                                        Bonus Loot!
                                    </div>
                                    <div className="font-bold text-white">{earnedLoot.item.name}</div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex gap-4 justify-center mt-8">
                        <button
                            onClick={() => { setIsCompleted(false); setTimeLeft(selectedOption.duration * 60); }}
                            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-colors"
                        >
                            Again
                        </button>
                        <button
                            onClick={() => navigate('/journal')}
                            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-colors"
                        >
                            View Journal
                        </button>
                        <button
                            onClick={() => navigate('/')}
                            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-colors"
                        >
                            Return Home
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
