import React, { useState, useEffect } from 'react';
import { Hammer, Clock, Trophy, Play, Square, CheckCircle, Gift, Sparkles, ArrowLeft, RefreshCw, Flame, Shield, ShieldOff, AlertCircle } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import { useToastStore } from '../../store/useToastStore';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { SHOP_ITEMS } from '../../src/utils/GameEconomy';

const FOCUS_OPTIONS = [
    { label: '15 Mins', duration: 15, xp: 50, gold: 10 },
    { label: '30 Mins', duration: 30, xp: 100, gold: 25 },
    { label: '60 Mins', duration: 60, xp: 250, gold: 60 },
    { label: '90 Mins', duration: 90, xp: 400, gold: 100 },
];

export const Grindstone: React.FC = () => {
    const navigate = useNavigate();
    const { addRewards, addJournalEntry, completeTask, stats, skillNodes } = useGameStore();
    // Removed: earnedLoot state (loot system removed)

    const [selectedOption, setSelectedOption] = useState(FOCUS_OPTIONS[1]);

    // Dev State
    const [isActive, setIsActive] = useState(false);
    const [timeLeft, setTimeLeft] = useState(selectedOption.duration * 60);
    const [isCompleted, setIsCompleted] = useState(false);
    const [finalRewards, setFinalRewards] = useState<{ xp: number, gold: number }>({ xp: 0, gold: 0 });

    // Secure Session State
    const startSession = useMutation(api.grindstone.startSession);
    const completeSession = useMutation(api.grindstone.completeSession);
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

    // Anti-Cheat: Tab Visibility & Fullscreen Detection
    const [isFullscreenMode, setIsFullscreenMode] = useState(false);
    const [tabSwitchDetected, setTabSwitchDetected] = useState(false);

    // Schematic State (Branch 2 Node 6)
    const [sessionGoal, setSessionGoal] = useState('');

    // Chain State (Branch 2 Node 3)
    const [isChainMode, setIsChainMode] = useState(false);
    const [chainStep, setChainStep] = useState(0); // 0: Focus, 1: Short Break, 2: Focus, 3: Long Break
    // Chain Config: Focus (selected) -> Break (5m) -> Focus (selected) -> Break (15m)
    const CHAIN_STEPS = [
        { type: 'FOCUS', duration: selectedOption.duration, label: 'Focus Block I' },
        { type: 'BREAK', duration: 5, label: 'Short Rest' },
        { type: 'FOCUS', duration: selectedOption.duration, label: 'Focus Block II' },
        { type: 'BREAK', duration: 15, label: 'Long Rest' }
    ];

    const activeChainStep = CHAIN_STEPS[chainStep];

    // Timer Loop
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

    // ANTI-CHEAT: Page Visibility Detection (Tab Switching)
    useEffect(() => {
        if (!isActive) return;

        const handleVisibilityChange = () => {
            if (document.hidden) {
                console.warn('⚠️ Tab switched during focus session');
                setTabSwitchDetected(true);

                // Fail the session immediately
                setIsActive(false);
                useToastStore.getState().addToast({
                    type: 'error',
                    message: 'Focus Broken: Tab Switch Detected',
                    amount: 0
                });
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [isActive]);

    // ANTI-CHEAT: Fullscreen Mode Detection
    useEffect(() => {
        if (!isActive || !isFullscreenMode) return;

        const handleFullscreenChange = () => {
            if (!document.fullscreenElement) {
                console.warn('⚠️ Exited fullscreen during focus session');

                // Fail the session immediately
                setIsActive(false);
                useToastStore.getState().addToast({
                    type: 'error',
                    message: 'Focus Broken: Fullscreen Exited',
                    amount: 0
                });
            }
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, [isActive, isFullscreenMode]);

    const activeDuration = isChainMode ? activeChainStep.duration : selectedOption.duration;

    // Reset timer when option changes or chain step changes
    useEffect(() => {
        if (!isActive) {
            setTimeLeft(activeDuration * 60);
        }
    }, [selectedOption, chainStep, isChainMode]);

    // Reset Chain on Option Change
    // Reset Chain on Option Change -> REMOVED to allow changing duration between chain steps
    /*
    useEffect(() => {
        if (!isActive && isChainMode) {
            setChainStep(0);
        }
    }, [selectedOption]);
    */

    const handleStart = async () => {
        setTabSwitchDetected(false);

        // Request fullscreen if fullscreen mode enabled
        if (isFullscreenMode) {
            try {
                await document.documentElement.requestFullscreen();
            } catch (err) {
                console.error('Failed to enter fullscreen:', err);
                useToastStore.getState().addToast({ type: 'error', message: 'Fullscreen mode unavailable', amount: 0 });
                return; // Don't start if fullscreen failed
            }
        }

        setIsActive(true);
        setIsCompleted(false);

        // Start Secure Session on Server
        try {
            const result = await startSession({ durationMinutes: activeDuration });
            if (result.success) {
                setCurrentSessionId(result.sessionId);
                console.log("🔒 Secure Session Started:", result.sessionId);
            }
        } catch (err: any) {
            console.error("Failed to start secure session:", err);
            setIsActive(false);

            // Exit fullscreen if we entered it
            if (document.fullscreenElement) {
                document.exitFullscreen();
            }

            // Show specific error message
            const errorMessage = err.message || 'Failed to start session';
            useToastStore.getState().addToast({ type: 'error', message: errorMessage, amount: 0 });
        }
    };

    const handleGiveUp = () => {
        if (confirm('Are you sure you want to break focus? No rewards will be given.')) {
            // Check Residual Heat (Branch 2 Node 9)
            // Recover 50% XP / 25% Gold
            const state = useGameStore.getState();
            const residualNode = state.skillNodes.find(n => n.id === 'branch_2-9');
            if (residualNode?.data.isUnlocked) {
                const recoveredXP = Math.round(selectedOption.xp * 0.50);
                const recoveredGold = Math.round(selectedOption.gold * 0.25);
                addRewards(recoveredXP, recoveredGold);
                useToastStore.getState().addToast({ type: 'xp', amount: recoveredXP, message: 'Residual Heat: Energy Recovered' });
            }

            setIsActive(false);
            setTimeLeft(activeDuration * 60);
            if (isChainMode) setChainStep(0);

            // Exit fullscreen if active
            if (document.fullscreenElement) {
                document.exitFullscreen();
            }
        }
    };

    const handleComplete = () => {
        setIsActive(false);
        setIsCompleted(true);
        // Removed: setEarnedLoot(null) - loot system removed

        // 1. Give Rewards
        // Check "Heat I" (branch_2-1) & "Heat II" (branch_2-4)
        // Heat II: +10% XP for > 25m (Overrides Heat I)
        const state = useGameStore.getState();
        const heatNode = state.skillNodes.find(n => n.id === 'branch_2-1');
        const heatIINode = state.skillNodes.find(n => n.id === 'branch_2-4');
        let xpReward = selectedOption.xp;

        if (selectedOption.duration > 25) {
            if (heatIINode?.data.isUnlocked) {
                xpReward = Math.round(xpReward * 1.10); // +10%
            } else if (heatNode?.data.isUnlocked) {
                xpReward = Math.round(xpReward * 1.05); // +5%
            }
        }

        // Check "The Heat III" (branch_2-7): Double XP for minutes beyond 45m
        const heatIIINode = state.skillNodes.find(n => n.id === 'branch_2-7');
        if (selectedOption.duration > 45 && heatIIINode?.data.isUnlocked) {
            const extraMinutes = selectedOption.duration - 45;
            const xpPerMinute = selectedOption.xp / selectedOption.duration;
            const extraXp = Math.round(extraMinutes * xpPerMinute); // "Double" means add another base amount for those minutes
            xpReward += extraXp;
            useToastStore.getState().addToast({ type: 'xp', amount: extraXp, message: 'Heat III: Overclock Bonus!' });
        }

        // Check "Golden Forge" Skill (branch_2-2): +5% Gold for sessions > 30 mins
        const forgeNode = state.skillNodes.find(n => n.id === 'branch_2-2');
        let goldReward = selectedOption.gold;
        if (selectedOption.duration > 30 && forgeNode?.data.isUnlocked) {
            goldReward = Math.round(goldReward * 1.05);
        }

        setFinalRewards({ xp: xpReward, gold: goldReward });
        // Optimistic UI Update (Instant Feedback)
        addRewards(xpReward, goldReward);
        useGameStore.getState().incrementStreak();

        // Server Verification (The Receipt Check)
        if (currentSessionId) {
            completeSession({ sessionId: currentSessionId as any })
                .then(res => {
                    console.log("✅ Session Verified:", res);

                    if (!res.success) {
                        console.warn("⚠️ Server Rejected Session:", res.reason);
                        // REVERT OPTIMISTIC REWARDS
                        useGameStore.getState().addRewards(-xpReward, -goldReward);
                        useToastStore.getState().addToast({ type: 'error', message: `Verification Failed: ${res.reason}`, amount: 0 });
                    } else if (res.capped) {
                        // Daily cap reached - show warning
                        useToastStore.getState().addToast({
                            type: 'error',
                            message: `Daily Cap Reached! Remaining: ${res.remainingXP} XP, ${res.remainingGold} Gold`,
                            amount: 0
                        });
                    }
                })
                .catch(err => {
                    console.error("❌ CHEAT DETECTED / Verification Failed:", err);

                    // REVERT OPTIMISTIC REWARDS
                    useGameStore.getState().addRewards(-xpReward, -goldReward);

                    useToastStore.getState().addToast({ type: 'error', message: 'Cheat Detected: Rewards Confiscated', amount: 0 });
                });
        }

        // REMOVED: Loot rolling system (lines 186-206)
        // Users requested removal - was giving too much adaptive hood

        // 3. Log to Journal
        addJournalEntry({
            title: `Commonplace Book: Focus Session (${activeDuration}m)`,
            content: `<p>Completed a <strong>${activeDuration} minute</strong> focus session.</p><p>Focus: General Productivity / Vitality Peak</p>`,
            tags: ['Grindstone', 'Focus', 'Vitality'],
            folder: 'Grindstone Log'
        });

        setIsActive(false);
        setIsCompleted(true);

        // Handle Chain Progression
        if (isChainMode) {
            if (chainStep < CHAIN_STEPS.length - 1) {
                // Determine next step immediately? Or wait for user to click "Next"?
                // Let's hold at "Completed" screen, but change "Again" button to "Next Link"
            } else {
                // Chain Complete!
                useToastStore.getState().addToast({ type: 'xp', amount: 100, message: 'Chain Complete Bonus!' });
            }
        }

        // Exit fullscreen if active
        if (document.fullscreenElement) {
            document.exitFullscreen();
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const calculateProgress = () => {
        const totalSeconds = activeDuration * 60;
        return ((totalSeconds - timeLeft) / totalSeconds) * 100;
    };

    // Unlock Check
    const chainForgingUnlocked = skillNodes.find(n => n.id === 'branch_2-3')?.data.isUnlocked;
    const ironWillUnlocked = skillNodes.find(n => n.id === 'branch_2-5')?.data.isUnlocked;
    const schematicUnlocked = skillNodes.find(n => n.id === 'branch_2-6')?.data.isUnlocked;

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">

            {/* Background Ambience */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-900/20 via-slate-950 to-slate-950 pointer-events-none" />

            {/* UI: Streak & Iron Will Status (Top Right) */}
            <div className="absolute top-6 right-6 z-20 flex items-center gap-4">

                {/* Streak Counter */}
                <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-700 px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm">
                    <Flame className={`${stats.streak > 0 ? 'text-amber-500 fill-amber-500' : 'text-slate-600'} animate-pulse`} size={18} />
                    <span className="font-bold text-white text-sm">{stats.streak} Days</span>
                </div>

                {/* Iron Will Indicator */}
                {ironWillUnlocked && (
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm border transition-colors ${stats.monthlyStreakShieldUsed
                        ? 'bg-red-900/20 border-red-800/50 text-red-400'
                        : 'bg-emerald-900/20 border-emerald-800/50 text-emerald-400'
                        }`}>
                        {stats.monthlyStreakShieldUsed ? (
                            <>
                                <ShieldOff size={18} />
                                <span className="font-bold text-xs">Used</span>
                            </>
                        ) : (
                            <>
                                <Shield size={18} />
                                <span className="font-bold text-xs">Active</span>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Header */}
            <div className="absolute top-6 left-6 z-20">
                <button
                    onClick={() => navigate('/app')}
                    className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors"
                >
                    <ArrowLeft size={20} />
                    <span className="font-bold uppercase tracking-wider text-sm">Back to Quests</span>
                </button>
            </div>

            {/* Header Content */}
            {!isActive && !isCompleted && (
                <div className="text-center mb-12 relative z-10">
                    <div className="inline-flex p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 mb-6 animate-pulse">
                        <Hammer size={48} className="text-amber-500" />
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-4">
                        The Grindstone
                    </h1>
                    <p className="text-slate-400 text-lg max-w-md mx-auto mb-6">
                        Sharpen your mind against the wheel of time. Choose your duration and eliminate all distractions.
                    </p>

                    {/* Timer Rules Info Box */}
                    <div className="max-w-2xl mx-auto bg-slate-900/80 border border-slate-700 rounded-xl p-6 backdrop-blur-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <AlertCircle className="text-amber-500" size={20} />
                            <h3 className="text-sm font-bold uppercase tracking-wider text-amber-500">Timer Rules</h3>
                        </div>
                        <div className="space-y-3 text-sm text-slate-300 text-left">
                            <div className="flex items-start gap-3">
                                <span className="text-red-400 font-bold">✗</span>
                                <span><strong className="text-white">Tab Switching:</strong> Switching to another tab or app will instantly fail the session</span>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="text-amber-400 font-bold">⚡</span>
                                <span><strong className="text-white">Fullscreen Mode:</strong> Optional lockdown prevents exiting fullscreen during session</span>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="text-purple-400 font-bold">📊</span>
                                <span><strong className="text-white">Daily Caps:</strong> Max 3600 XP and 900 Gold per day from Grindstone</span>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="text-emerald-400 font-bold">✓</span>
                                <span><strong className="text-white">Stay Focused:</strong> Complete the full timer duration to earn rewards</span>
                            </div>
                        </div>
                    </div>
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

            {/* Chain Mode Toggle */}
            {!isActive && !isCompleted && chainForgingUnlocked && (
                <div className="mb-8 mt-6 flex justify-center">
                    <button
                        onClick={() => { setIsChainMode(!isChainMode); setChainStep(0); }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-bold transition-all ${isChainMode
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                            : 'bg-slate-900 border-slate-700 text-slate-500 hover:border-slate-500'
                            }`}
                    >
                        <div className={`w-3 h-3 rounded-full ${isChainMode ? 'bg-emerald-500' : 'bg-slate-600'}`} />
                        Chain-Forging Protocol {isChainMode ? 'ACTIVE' : 'OFFLINE'}
                    </button>
                </div>
            )}

            {/* Fullscreen Mode Toggle */}
            {!isActive && !isCompleted && (
                <div className="mb-4 flex justify-center">
                    <button
                        onClick={() => setIsFullscreenMode(!isFullscreenMode)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-bold transition-all ${isFullscreenMode
                            ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400'
                            : 'bg-slate-900 border-slate-700 text-slate-500 hover:border-slate-500'
                            }`}
                    >
                        <div className={`w-3 h-3 rounded-full ${isFullscreenMode ? 'bg-indigo-500' : 'bg-slate-600'}`} />
                        Fullscreen Lockdown {isFullscreenMode ? 'ON' : 'OFF'}
                    </button>
                </div>
            )}

            {/* Chain Status */}
            {isChainMode && (
                <div className="mb-4 flex items-center justify-center gap-2">
                    {CHAIN_STEPS.map((step, i) => (
                        <div key={i} className={`h-2 w-8 rounded-full transition-colors ${i < chainStep ? 'bg-emerald-500' :
                            i === chainStep ? 'bg-amber-500 animate-pulse' : 'bg-slate-800'
                            }`} />
                    ))}
                </div>
            )}

            {/* Schematic Input (Session Objective) */}
            {!isActive && !isCompleted && schematicUnlocked && (
                <div className="mb-8 w-full max-w-md mx-auto">
                    <input
                        type="text"
                        placeholder="Define your Session Objective..."
                        value={sessionGoal}
                        onChange={(e) => setSessionGoal(e.target.value)}
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-center text-amber-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50 transition-all font-mono text-sm uppercase tracking-wider"
                    />
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
                    {/* Schematic Display (Pinned Goal) */}
                    {sessionGoal && (
                        <div className="mb-8 px-6 py-2 bg-slate-900/80 border-l-2 border-amber-500 rounded-r-lg max-w-lg text-center backdrop-blur-sm animate-in slide-in-from-top-4 duration-700">
                            <span className="block text-[10px] text-slate-500 uppercase tracking-widest font-black mb-1">Objective</span>
                            <span className="text-amber-100 font-mono text-sm leading-tight">{sessionGoal}</span>
                        </div>
                    )}
                    {/* Circle Progress */}
                    <div className="relative mb-8">
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

                    <p className="text-amber-500/80 animate-pulse uppercase tracking-widest text-sm font-bold mb-2">
                        Focus in Progress
                    </p>

                    {/* Active Session Warning */}
                    <div className="max-w-md mx-auto mb-8 px-4 py-2 bg-red-900/20 border border-red-800/50 rounded-lg">
                        <p className="text-xs text-red-300 font-medium">
                            ⚠️ Don't switch tabs or close this window
                        </p>
                    </div>

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

                    {/* Active Control */}
                    {isActive && (
                        <div className="space-y-4 text-center z-10">
                            <div className="text-slate-400 uppercase tracking-widest text-sm font-bold animate-pulse">
                                {isChainMode ? `${activeChainStep.label} Active` : 'Focus Session Active'}
                            </div>

                            <button
                                onClick={handleGiveUp}
                                className="text-slate-600 hover:text-red-400 text-xs font-bold uppercase tracking-wider transition-colors"
                            >
                                Yield (Give Up)
                            </button>

                            {/* Dev Controls (Admin Only) */}
                            <DevControls handleComplete={handleComplete} />
                        </div>
                    )}
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
                            <div className="text-3xl font-black text-purple-400">+{finalRewards.xp}</div>
                            <div className="text-xs text-slate-500 uppercase font-bold">XP Gained</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-black text-amber-400">+{finalRewards.gold}</div>
                            <div className="text-xs text-slate-500 uppercase font-bold">Gold Gained</div>
                        </div>
                    </div>

                    {/* Removed: Loot display UI (loot system removed) */}

                    <div className="flex gap-4 justify-center mt-8">
                        {isChainMode && chainStep < CHAIN_STEPS.length - 1 ? (
                            <button
                                onClick={() => {
                                    setIsCompleted(false);
                                    const nextIndex = chainStep + 1;
                                    setChainStep(nextIndex);

                                    // Auto-start if next step is a break (Short/Long Rest)
                                    if (CHAIN_STEPS[nextIndex].type === 'BREAK') {
                                        setTimeLeft(CHAIN_STEPS[nextIndex].duration * 60);
                                        setIsActive(true);
                                    }
                                    // If next step is FOCUS, we stay in idle state (setIsCompleted(false)) 
                                    // to allow user to change duration selector above.
                                }}
                                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-colors flex items-center gap-2"
                            >
                                <RefreshCw size={18} /> Next Link: {CHAIN_STEPS[chainStep + 1].label}
                            </button>
                        ) : (
                            <button
                                onClick={() => { setIsCompleted(false); setTimeLeft(selectedOption.duration * 60); if (isChainMode) setChainStep(0); }}
                                className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-colors"
                            >
                                Again
                            </button>
                        )}

                        <button
                            onClick={() => navigate('/app/journal')}
                            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-colors"
                        >
                            View Journal
                        </button>
                        <button
                            onClick={() => navigate('/app')}
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

const DevControls: React.FC<{ handleComplete: () => void }> = ({ handleComplete }) => {
    const user = useQuery(api.users.getMe);

    // Only show if user is loaded and has admin role
    if (!user || user.role !== 'admin') return null;

    return (
        <button
            onClick={handleComplete}
            className="block mx-auto text-[10px] bg-red-900/50 text-red-200 px-2 py-1 rounded border border-red-900/50 hover:bg-red-900 transition-colors"
        >
            Dev: Complete Now (Simulate Hack)
        </button>
    );
};
