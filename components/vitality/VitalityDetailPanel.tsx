import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Brain, Utensils, Users, Moon, Circle, ArrowLeft, Lock, Dumbbell, Flag, CheckCircle2, Droplet, Award } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';

interface VitalityDetailPanelProps {
    activeBranch: string | null;
    setActiveBranch: (branchId: string | null) => void;
}

export const VitalityDetailPanel: React.FC<VitalityDetailPanelProps> = ({ activeBranch, setActiveBranch }) => {
    const { addProjects, addRewards, vitality, setVitalityData } = useGameStore();

    // Internal State moved from parent
    const [assessmentStep, setAssessmentStep] = useState(1);
    const [showGoalDetail, setShowGoalDetail] = useState(false);
    const [showNutritionCard, setShowNutritionCard] = useState(false);

    // Constants
    const activityLevels = [
        { id: 'inactive', label: 'Inactive', desc: 'Spend a lot of time indoors, sitting down or sleeping' },
        { id: 'somewhat', label: 'Somewhat Active', desc: 'Spend most time indoors, occasional short walks or light activity a few times a week' },
        { id: 'active', label: 'Active', desc: 'Light to moderate activity most days of the week' },
        { id: 'very_active', label: 'Very Active', desc: 'Moderate exercise every day and going to the gym or participating in sports a few days a week' },
        { id: 'athlete', label: 'Athlete', desc: 'Consistent gym sessions or other training and sports 4+ days a week' },
    ];

    const fitnessGoals = [
        { id: 'lose_weight', label: 'Lose Weight' },
        { id: 'strength_cardio', label: 'Increase Cardiovascular Health & Performance' },
        { id: 'muscle', label: 'Increase Strength & Build Muscle' },
        { id: 'custom', label: 'Define your own goal' },
    ];

    const stepGoals = ['3,000', '5,000', '7,500', '10,000', '12,000+'];

    const handleConfirm = () => {
        // 1. Grant Rewards (Initial Boost)
        addRewards(500, 100);

        // 2. Unlock Bounties (Projects)
        addProjects([
            {
                id: 'b-steps',
                name: 'Daily Steps',
                description: 'Hit your daily step target.',
                difficulty: 'EASY',
                completed: false,
                hp: 100, maxHp: 100
            },
            {
                id: 'b-stretch',
                name: 'Daily Stretch',
                description: 'Complete 10 min mobility routine.',
                difficulty: 'EASY',
                completed: false,
                hp: 50, maxHp: 50
            }
        ]);

        // 3. Advance to Success View
        setAssessmentStep(5);
    };

    // Main Render Logic
    if (activeBranch === 'phys-1') {
        return (
            <motion.div
                key="branch-detail"
                initial={{ opacity: 0, width: 0, x: -20 }}
                animate={{ opacity: 1, width: 400, x: 0 }}
                exit={{ opacity: 0, width: 0, x: -20 }}
                className="h-full py-4 pr-6 pl-4 flex items-start"
            >
                <div className="w-full max-h-full p-6 rounded-2xl bg-slate-900/80 border border-slate-700/50 flex flex-col relative shadow-2xl backdrop-blur-xl">

                    {/* Compact Header */}
                    <div className="flex items-center gap-3 mb-4 flex-shrink-0">
                        <div className="p-1.5 rounded bg-rose-500/20 text-rose-400">
                            <Activity size={18} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-100 leading-none">Stabilise & Assess</h3>
                            <p className="text-[10px] text-rose-400 uppercase tracking-widest font-bold mt-0.5">Physical Health • Phase I</p>
                        </div>
                        <button onClick={() => setActiveBranch(null)} className="ml-auto text-slate-500 hover:text-white"><Circle size={16} className="rotate-45" /></button>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">

                        {/* STEP 1: ACTIVITY LEVEL */}
                        {assessmentStep === 1 && (
                            <motion.div
                                key="step-1"
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="space-y-4"
                            >
                                <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                                    <p className="text-xs text-slate-300 leading-relaxed">
                                        What is your activity level?
                                    </p>
                                </div>

                                <div className="space-y-1.5">
                                    {activityLevels.map((level) => (
                                        <button
                                            key={level.id}
                                            onClick={() => {
                                                setVitalityData({ activityLevel: level.id });
                                                setAssessmentStep(2);
                                            }}
                                            className={`w-full text-left p-2 min-h-[50px] rounded-xl border transition-all flex items-center gap-3 ${vitality.activityLevel === level.id ? 'bg-rose-500/20 border-rose-500' : 'bg-slate-800/20 border-slate-700/50 hover:bg-slate-800/60'}`}
                                        >
                                            <div className={`w-3.5 h-3.5 rounded-full border flex-shrink-0 flex items-center justify-center ${vitality.activityLevel === level.id ? 'border-rose-500 bg-rose-500' : 'border-slate-600'}`}>
                                                {vitality.activityLevel === level.id && <div className="w-1 h-1 rounded-full bg-white" />}
                                            </div>
                                            <div className="py-0.5">
                                                <span className={`block font-bold text-xs mb-0.5 ${vitality.activityLevel === level.id ? 'text-rose-400' : 'text-slate-200'}`}>{level.label}</span>
                                                <span className="block text-[10px] text-slate-500 leading-tight">{level.desc}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 2: COMMITMENT PLEDGE */}
                        {assessmentStep === 2 && (
                            <motion.div
                                key="step-2"
                                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                className="space-y-4"
                            >
                                <button onClick={() => setAssessmentStep(1)} className="text-[10px] text-slate-500 hover:text-slate-300 flex items-center gap-1">
                                    <ArrowLeft size={10} /> Back
                                </button>

                                <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 space-y-3">
                                    <h4 className="text-indigo-400 font-bold text-xs uppercase tracking-wider flex items-center gap-2">
                                        <Award size={14} /> Small Goal Pledge
                                    </h4>
                                    <p className="text-xs text-slate-300 leading-relaxed italic">
                                        "Do one small exercise right now, even if its one push up or a short walk. What's important is you start and if you can do more, great! Once you get moving you'll feel better so make a promise to yourself:"
                                    </p>
                                    <div className="pl-3 border-l-2 border-indigo-500/30 my-2">
                                        <p className="text-xs text-indigo-200 font-medium italic leading-relaxed">
                                            "I will commit to doing this one small exercise daily and I will increase the reps, distance, etc, every day. I will not be hard on myself or give up if I fail and i will try again."
                                        </p>
                                    </div>
                                    <p className="text-[10px] text-slate-400">
                                        Say it out loud or write it down, and thats step one complete! Just imagine how far you will come in just one week or even a year. Remember, its okay to fail, just focus on bouncing back and start from square one. You'll feel stronger than last time around.
                                    </p>
                                </div>

                                <button
                                    onClick={() => setAssessmentStep(3)}
                                    className="w-full py-3 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-500/25 text-xs uppercase tracking-wide transition-all"
                                >
                                    I Promise
                                </button>
                            </motion.div>
                        )}

                        {/* STEP 3: FITNESS GOAL */}
                        {assessmentStep === 3 && (
                            <AnimatePresence mode="wait">
                                {!showGoalDetail ? (
                                    <motion.div
                                        key="goal-list"
                                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                        className="space-y-4"
                                    >
                                        <button onClick={() => setAssessmentStep(2)} className="text-[10px] text-slate-500 hover:text-slate-300 flex items-center gap-1">
                                            <ArrowLeft size={10} /> Back
                                        </button>

                                        <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 space-y-2">
                                            <p className="text-xs text-slate-300 leading-relaxed font-bold">
                                                Set a main fitness goal
                                            </p>
                                            <p className="text-[10px] text-slate-400 leading-relaxed">
                                                If you're just a beginner or even a pro lifter this is where you set your medium to long term goal. We'll provide the tools and information to assist you on your journey.
                                            </p>
                                        </div>

                                        <div className="space-y-1.5">
                                            {fitnessGoals.map((goal) => (
                                                <div key={goal.id} className="space-y-2">
                                                    <button
                                                        onClick={() => {
                                                            setVitalityData({ fitnessGoal: goal.id });
                                                            setShowGoalDetail(true);
                                                        }}
                                                        className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${vitality.fitnessGoal === goal.id ? 'bg-rose-500/20 border-rose-500' : 'bg-slate-800/20 border-slate-700/50 hover:bg-slate-800/60'}`}
                                                    >
                                                        <span className={`text-xs font-bold ${vitality.fitnessGoal === goal.id ? 'text-rose-400' : 'text-slate-200'}`}>
                                                            {goal.label}
                                                        </span>
                                                        {vitality.fitnessGoal === goal.id && (
                                                            <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
                                                        )}
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="goal-detail"
                                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                        className="space-y-4"
                                    >
                                        <button onClick={() => setShowGoalDetail(false)} className="text-[10px] text-slate-500 hover:text-slate-300 flex items-center gap-1">
                                            <ArrowLeft size={10} /> Back to Goals
                                        </button>

                                        <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-3">
                                            <h4 className="text-rose-400 font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                                                <Flag size={16} /> {fitnessGoals.find(g => g.id === vitality.fitnessGoal)?.label}
                                            </h4>

                                            <div className="space-y-3 text-xs text-slate-300 leading-relaxed custom-scrollbar max-h-[250px] overflow-y-auto pr-2">
                                                {vitality.fitnessGoal === 'lose_weight' ? (
                                                    <>
                                                        <p>
                                                            Weight loss is primarily driven by a caloric deficit combined with consistent exercise. Research indicates that consistent daily movement (walking) is one of the most effective tools for fat loss because it burns calories without spiking hunger or fatigue like more intense HIIT training protocol.
                                                        </p>
                                                        <p className="text-blue-200">
                                                            <span className="font-bold text-blue-400">Hydration:</span> Additionally drinking 2-3L of water daily aids metabolism and reduces false hunger signals, so drink up!
                                                        </p>
                                                    </>
                                                ) : vitality.fitnessGoal === 'strength_cardio' ? (
                                                    <p>
                                                        Improving cardiovascular health and performance is about expanding your engine. Focus on a mix of steady-state endurance work (Zone 2) to build efficiency and high-intensity intervals to boost your VO2 max. Consistency is key to adapting your heart and lungs.
                                                    </p>
                                                ) : vitality.fitnessGoal === 'muscle' ? (
                                                    <p>
                                                        Building muscle and increasing strength requires a combination of progressive overload and sufficient fuel. Aim for a caloric surplus and high protein intake (~1.6-2.2g/kg). Prioritize compound lifts (Squat, Bench, Deadlift) and meaningful rest to allow your nervous system and fibers to repair stronger.
                                                    </p>
                                                ) : (
                                                    <div className="space-y-4">
                                                        {/* Custom Goal Input */}
                                                        {vitality.fitnessGoal === 'custom' && showGoalDetail && (
                                                            <div className="mt-3 pl-2" onClick={(e) => e.stopPropagation()}>
                                                                <input
                                                                    type="text"
                                                                    placeholder="Enter your specific goal..."
                                                                    value={vitality.customFitnessGoal}
                                                                    onChange={(e) => setVitalityData({ customFitnessGoal: e.target.value })}
                                                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-rose-500 transition-colors"
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex justify-end gap-2 pt-2">
                                            {/* Specific Buttons for Custom Goal */}
                                            {vitality.fitnessGoal === 'custom' ? (
                                                <>
                                                    <button
                                                        onClick={() => setAssessmentStep(4)}
                                                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 hover:text-white text-slate-300 text-xs font-bold rounded-lg border border-slate-700 transition-all flex items-center gap-2"
                                                    >
                                                        <Dumbbell size={14} /> Set Training Plan
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            // Logic to show nutrition card
                                                            setShowNutritionCard(true);
                                                            // setShowGoalDetail(false); // Maybe keep detail open? Or close it.
                                                            // Let's close detail to focus on nutrition
                                                            // Actually, user said "show Nutrition card", the nutrition card is an overlay/state in the main view?
                                                            // Looking at previous turn: "The specific actionable buttons... 'Set Nutrition Plan' opens the Nutrition Strategy card"
                                                            // And the nutrition card logic: "The 'Lose Weight' detail card's 'Next Step' button now triggers showNutritionCard"
                                                            setShowGoalDetail(false);
                                                        }}
                                                        className="px-4 py-2 bg-emerald-900/40 hover:bg-emerald-800/60 text-emerald-400 text-xs font-bold rounded-lg border border-emerald-800/50 transition-all flex items-center gap-2"
                                                    >
                                                        <Utensils size={14} /> Set Nutrition Plan
                                                    </button>
                                                    <button
                                                        onClick={() => setAssessmentStep(4)}
                                                        className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-rose-900/20 transition-all flex items-center gap-2"
                                                    >
                                                        Set Daily Steps Target <ArrowLeft className="rotate-180" size={14} />
                                                    </button>
                                                </>
                                            ) : (
                                                <button
                                                    onClick={() => {
                                                        // "Lose Weight" Logic connects to nutrition card
                                                        if (vitality.fitnessGoal === 'lose_weight') {
                                                            setShowGoalDetail(false);
                                                            setShowNutritionCard(true);
                                                        } else {
                                                            setAssessmentStep(4);
                                                        }
                                                    }}
                                                    disabled={!vitality.fitnessGoal}
                                                    className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-rose-900/20 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    Next Step <ArrowLeft className="rotate-180" size={14} />
                                                </button>
                                            )}
                                        </div>    </motion.div>
                                )}

                                {/* NUTRITION CARD OVERLAY */}
                                {showNutritionCard && (
                                    <motion.div
                                        key="nutrition-card"
                                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                        className="space-y-4 absolute inset-0 bg-slate-900 z-20 flex flex-col"
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="p-1.5 rounded bg-green-500/20 text-green-400">
                                                <Utensils size={16} />
                                            </div>
                                            <h4 className="text-green-400 font-bold text-sm uppercase tracking-wider">
                                                Nutrition Strategy
                                            </h4>
                                        </div>

                                        <div className="p-4 rounded-xl bg-slate-800/80 border border-emerald-500/30 space-y-3 flex-1 overflow-y-auto custom-scrollbar">
                                            <p className="text-xs text-slate-300 leading-relaxed">
                                                To lose weight, what you eat is just as important as how you move. You can't out-train a bad diet.
                                            </p>
                                            <div className="space-y-2">
                                                <div className="p-2 rounded bg-slate-950/50 border border-slate-700/50">
                                                    <span className="block text-[10px] font-bold text-emerald-400 uppercase mb-1"> caloric deficit</span>
                                                    <p className="text-[10px] text-slate-400">
                                                        Consuming fewer calories than you burn is specific to weight loss. Focus on nutrient-dense foods (vegetables, lean meats) to stay full while eating less.
                                                    </p>
                                                </div>
                                                <div className="p-2 rounded bg-slate-950/50 border border-slate-700/50">
                                                    <span className="block text-[10px] font-bold text-emerald-400 uppercase mb-1">Protein intake</span>
                                                    <p className="text-[10px] text-slate-400">
                                                        Aim for high protein to preserve muscle mass while losing fat. It also has the highest thermic effect of food (burns more calories to digest).
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => {
                                                setAssessmentStep(4);
                                                setShowNutritionCard(false);
                                            }}
                                            className="w-full py-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-500/25 text-xs uppercase tracking-wide transition-all mt-auto"
                                        >
                                            Continue
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        )}

                        {/* STEP 4: STEPS & COMMITMENT */}
                        {assessmentStep === 4 && (
                            <motion.div
                                key="step-4"
                                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                className="space-y-5"
                            >
                                <button onClick={() => setAssessmentStep(3)} className="text-[10px] text-slate-500 hover:text-slate-300 flex items-center gap-1">
                                    <ArrowLeft size={10} /> Back
                                </button>

                                {/* Steps Selection */}
                                <div>
                                    <h4 className="font-bold text-[10px] uppercase text-slate-500 tracking-wider mb-2">Daily Steps Target</h4>
                                    <p className="text-[10px] text-slate-400 leading-relaxed mb-3">
                                        its recomended to start low and build your steps up especially if you're not very active already. Start around the 3000 to 7,500 range for the first week and see how you feel, you can always change it later
                                    </p>
                                    <div className="grid grid-cols-2 gap-2">
                                        {stepGoals.map((steps) => (
                                            <button
                                                key={steps}
                                                onClick={() => setVitalityData({ stepGoal: steps })}
                                                className={`p-2 rounded border text-center text-xs transition-all ${vitality.stepGoal === steps ? 'bg-rose-500/20 border-rose-500 text-rose-400 font-bold' : 'bg-slate-800/30 border-slate-700/50 text-slate-400 hover:border-slate-500'}`}
                                            >
                                                {steps}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Stretch Commitment */}
                                <button
                                    onClick={() => setVitalityData({ stretchCommitment: !vitality.stretchCommitment })}
                                    className={`w-full p-3 rounded-xl border flex items-center gap-3 transition-all ${vitality.stretchCommitment ? 'bg-emerald-500/20 border-emerald-500/50' : 'bg-slate-800/20 border-slate-700/50'}`}
                                >
                                    <div className={`p-1.5 rounded-full ${vitality.stretchCommitment ? 'bg-emerald-500 text-emerald-950' : 'bg-slate-700 text-slate-400'}`}>
                                        <CheckCircle2 size={14} />
                                    </div>
                                    <div className="text-left flex-1 flex items-center justify-between">
                                        <span className={`block font-bold text-xs ${vitality.stretchCommitment ? 'text-emerald-400' : 'text-slate-200'}`}>
                                            Daily 10-Minute Stretch <span className="text-[10px] text-slate-500 font-normal ml-1">(Optional)</span>
                                        </span>
                                        <div className="px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/30 flex items-center gap-1">
                                            <span className="text-[9px] font-bold text-amber-400">+250 XP</span>
                                        </div>
                                    </div>
                                </button>

                                {/* Hydration Reminder */}
                                <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-start gap-3">
                                    <Droplet size={14} className="text-blue-400 mt-0.5" />
                                    <div>
                                        <h5 className="font-bold text-blue-400 text-xs">Hydration Check</h5>
                                        <p className="text-[10px] text-blue-300/80">Aim for 2-3L daily.</p>
                                    </div>
                                </div>

                                {/* Confirm Button */}
                                <button
                                    onClick={handleConfirm}
                                    disabled={!vitality.stepGoal}
                                    className="w-full py-3 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-bold shadow-lg shadow-rose-500/25 disabled:opacity-50 text-xs uppercase tracking-wide transition-all"
                                >
                                    Confirm Baseline Plan
                                </button>

                            </motion.div>
                        )}

                        {/* STEP 5: SUCCESS (Using heavy frame animations) */}
                        {assessmentStep === 5 && (
                            <motion.div
                                key="step-5"
                                initial="hidden"
                                animate="visible"
                                onAnimationStart={() => {
                                    const audio = new Audio('/assets/protocol active level up sound.mp3');
                                    audio.volume = 0.5;
                                    audio.play().catch(e => console.error("Audio play failed", e));
                                }}
                                variants={{
                                    hidden: { opacity: 0 },
                                    visible: {
                                        opacity: 1,
                                        transition: {
                                            staggerChildren: 0.2,
                                            delayChildren: 0.1
                                        }
                                    }
                                }}
                                className="flex flex-col items-center text-center py-3 space-y-3 relative"
                            >
                                {/* Burst Background Effect */}
                                <motion.div
                                    className="absolute top-4 left-1/2 -translate-x-1/2 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl"
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1.5, opacity: 0.6 }}
                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                />

                                <motion.div
                                    variants={{
                                        hidden: { scale: 0, rotate: -180 },
                                        visible: { scale: 1, rotate: 0, transition: { type: "spring", stiffness: 200, damping: 15 } }
                                    }}
                                    className="relative z-10 w-16 h-16 rounded-full bg-slate-900 border-2 border-emerald-500 flex items-center justify-center text-emerald-500 shadow-xl mb-2"
                                >
                                    <CheckCircle2 size={28} strokeWidth={3} />
                                </motion.div>

                                <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}>
                                    <h2 className="text-xl font-black text-white uppercase tracking-wide drop-shadow-md">Protocol Active</h2>
                                    <p className="text-[10px] text-slate-400 my-1 px-4 leading-relaxed">
                                        Complete these bounties daily to earn more rewards. Be honest; cheating is cheating yourself!
                                    </p>

                                    {/* SUMMARY OF SELECTIONS */}
                                    <div className="mt-3 space-y-1.5 text-left bg-slate-950/50 p-3 rounded-xl border border-slate-800/50">

                                        {/* Activity Level */}
                                        <div className="flex items-center gap-2.5">
                                            <div className="p-1 rounded bg-rose-500/10 text-rose-400">
                                                <Activity size={10} />
                                            </div>
                                            <div>
                                                <span className="text-[9px] text-slate-500 uppercase tracking-wider font-bold block">Activity Level</span>
                                                <span className="text-[11px] text-slate-200 font-medium">
                                                    {activityLevels.find(l => l.id === vitality.activityLevel)?.label || 'Not Selected'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Fitness Goal */}
                                        <div className="flex items-center gap-2.5">
                                            <div className="p-1 rounded bg-orange-500/10 text-orange-400">
                                                <Flag size={10} />
                                            </div>
                                            <div>
                                                <span className="text-[9px] text-slate-500 uppercase tracking-wider font-bold block">Goal</span>
                                                <span className="text-[11px] text-slate-200 font-medium">
                                                    {vitality.fitnessGoal === 'custom'
                                                        ? vitality.customFitnessGoal
                                                        : fitnessGoals.find(g => g.id === vitality.fitnessGoal)?.label}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Steps */}
                                        <div className="flex items-center gap-2.5">
                                            <div className="p-1 rounded bg-blue-500/10 text-blue-400">
                                                <Circle size={10} />
                                            </div>
                                            <div>
                                                <span className="text-[9px] text-slate-500 uppercase tracking-wider font-bold block">Daily Target</span>
                                                <span className="text-[11px] text-slate-200 font-medium">{vitality.stepGoal} Steps</span>
                                            </div>
                                        </div>

                                        {/* Stretch */}
                                        {vitality.stretchCommitment && (
                                            <div className="flex items-center gap-2.5">
                                                <div className="p-1 rounded bg-emerald-500/10 text-emerald-400">
                                                    <CheckCircle2 size={10} />
                                                </div>
                                                <div>
                                                    <span className="text-[9px] text-slate-500 uppercase tracking-wider font-bold block">Commitment</span>
                                                    <span className="text-[11px] text-slate-200 font-medium">Daily Stretch Routine</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>

                                <motion.div
                                    variants={{ hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1 } }}
                                    className="relative p-1 rounded-xl bg-gradient-to-br from-amber-500/20 to-transparent border border-amber-500/30 w-full overflow-hidden shadow-lg"
                                >
                                    {/* Shimmer Effect */}
                                    <motion.div
                                        className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/10 to-transparent -skew-x-12"
                                        initial={{ x: '-100%' }}
                                        animate={{ x: '200%' }}
                                        transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2, ease: "linear" }}
                                    />

                                    <div className="bg-slate-950/50 p-3 rounded-lg relative z-10 backdrop-blur-sm">
                                        <h4 className="font-bold text-amber-400 text-[10px] uppercase tracking-wider mb-2 text-center">Rewards Earned</h4>
                                        <div className="flex items-center justify-center gap-6">
                                            <div className="flex flex-col items-center">
                                                <span className="text-2xl font-black text-amber-300 drop-shadow-lg">+500</span>
                                                <span className="text-[9px] text-amber-500 font-bold tracking-widest mt-1">XP</span>
                                            </div>
                                            <div className="w-px h-8 bg-amber-500/20" />
                                            <div className="flex flex-col items-center">
                                                <span className="text-2xl font-black text-amber-300 drop-shadow-lg">+100</span>
                                                <span className="text-[9px] text-amber-500 font-bold tracking-widest mt-1">GOLD</span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>

                                <motion.div
                                    variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                                    className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 w-full"
                                >
                                    <p className="text-[10px] text-indigo-300 leading-relaxed font-medium">
                                        Daily Bounties added to Quest Log.
                                    </p>
                                </motion.div>
                            </motion.div>
                        )}

                    </div>
                </div>
            </motion.div>
        );
    } else if (activeBranch === 'phys-2') {
        return (
            <motion.div
                key="branch-detail-phys-2"
                initial={{ opacity: 0, width: 0, x: -20 }}
                animate={{ opacity: 1, width: 400, x: 0 }}
                exit={{ opacity: 0, width: 0, x: -20 }}
                className="h-full py-4 pr-6 pl-4 flex items-start"
            >
                <div className="w-full max-h-full p-6 rounded-2xl bg-slate-900/80 border border-slate-700/50 flex flex-col relative shadow-2xl backdrop-blur-xl">
                    <div className="flex items-center gap-3 mb-4 flex-shrink-0">
                        <div className="p-1.5 rounded bg-rose-500/20 text-rose-400">
                            <Activity size={18} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-100 leading-none">Form & Foundation</h3>
                            <p className="text-[10px] text-rose-400 uppercase tracking-widest font-bold mt-0.5">Physical Health • Phase II</p>
                        </div>
                        <button onClick={() => setActiveBranch(null)} className="ml-auto text-slate-500 hover:text-white"><Circle size={16} className="rotate-45" /></button>
                    </div>
                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
                        <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                            <h4 className="text-sm font-bold text-slate-200 mb-3">Core Objectives</h4>
                            <ul className="space-y-3">
                                <li className="flex gap-3">
                                    <div className="mt-1 min-w-[6px] h-1.5 rounded-full bg-rose-500" />
                                    <p className="text-xs text-slate-300 leading-relaxed">
                                        Learn the <span className="text-rose-400 font-bold">"Big 4" movements</span> (Squat, Hinge, Push, Pull) with bodyweight.
                                    </p>
                                </li>
                                <li className="flex gap-3">
                                    <div className="mt-1 min-w-[6px] h-1.5 rounded-full bg-rose-500" />
                                    <p className="text-xs text-slate-300 leading-relaxed">
                                        20 minutes of <span className="text-rose-400 font-bold">moderate cardio (Zone 2)</span> 3x per week.
                                    </p>
                                </li>
                                <li className="flex gap-3">
                                    <div className="mt-1 min-w-[6px] h-1.5 rounded-full bg-rose-500" />
                                    <p className="text-xs text-slate-300 leading-relaxed">
                                        Fix ergonomic setup for work/gaming to prevent <span className="text-rose-400 font-bold">"tech neck."</span>
                                    </p>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    } else if (activeBranch === 'phys-3') {
        return (
            <motion.div
                key="branch-detail-phys-3"
                initial={{ opacity: 0, width: 0, x: -20 }}
                animate={{ opacity: 1, width: 400, x: 0 }}
                exit={{ opacity: 0, width: 0, x: -20 }}
                className="h-full py-4 pr-6 pl-4 flex items-start"
            >
                <div className="w-full max-h-full p-6 rounded-2xl bg-slate-900/80 border border-slate-700/50 flex flex-col relative shadow-2xl backdrop-blur-xl">
                    <div className="flex items-center gap-3 mb-4 flex-shrink-0">
                        <div className="p-1.5 rounded bg-rose-500/20 text-rose-400">
                            <Dumbbell size={18} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-100 leading-none">Strength & Capacity</h3>
                            <p className="text-[10px] text-rose-400 uppercase tracking-widest font-bold mt-0.5">Physical Health • Phase III</p>
                        </div>
                        <button onClick={() => setActiveBranch(null)} className="ml-auto text-slate-500 hover:text-white"><Circle size={16} className="rotate-45" /></button>
                    </div>
                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
                        <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                            <h4 className="text-sm font-bold text-slate-200 mb-3">Core Objectives</h4>
                            <ul className="space-y-3">
                                <li className="flex gap-3">
                                    <div className="mt-1 min-w-[6px] h-1.5 rounded-full bg-rose-500" />
                                    <p className="text-xs text-slate-300 leading-relaxed">
                                        Begin <span className="text-rose-400 font-bold">weighted resistance training</span> 3x weekly (Progressive Overload).
                                    </p>
                                </li>
                                <li className="flex gap-3">
                                    <div className="mt-1 min-w-[6px] h-1.5 rounded-full bg-rose-500" />
                                    <p className="text-xs text-slate-300 leading-relaxed">
                                        Increase cardio to <span className="text-rose-400 font-bold">150 minutes/week</span> (WHO standard).
                                    </p>
                                </li>
                                <li className="flex gap-3">
                                    <div className="mt-1 min-w-[6px] h-1.5 rounded-full bg-rose-500" />
                                    <p className="text-xs text-slate-300 leading-relaxed">
                                        <span className="text-rose-400 font-bold">Track workouts</span> to ensure measurable improvement in reps/weight.
                                    </p>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    } else if (activeBranch === 'phys-4') {
        return (
            <motion.div
                key="branch-detail-phys-4"
                initial={{ opacity: 0, width: 0, x: -20 }}
                animate={{ opacity: 1, width: 400, x: 0 }}
                exit={{ opacity: 0, width: 0, x: -20 }}
                className="h-full py-4 pr-6 pl-4 flex items-start"
            >
                <div className="w-full max-h-full p-6 rounded-2xl bg-slate-900/80 border border-slate-700/50 flex flex-col relative shadow-2xl backdrop-blur-xl">
                    <div className="flex items-center gap-3 mb-4 flex-shrink-0">
                        <div className="p-1.5 rounded bg-rose-500/20 text-rose-400">
                            <Activity size={18} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-100 leading-none">High Intensity & Recovery</h3>
                            <p className="text-[10px] text-rose-400 uppercase tracking-widest font-bold mt-0.5">Physical Health • Phase IV</p>
                        </div>
                        <button onClick={() => setActiveBranch(null)} className="ml-auto text-slate-500 hover:text-white"><Circle size={16} className="rotate-45" /></button>
                    </div>
                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
                        <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                            <h4 className="text-sm font-bold text-slate-200 mb-3">Core Objectives</h4>
                            <ul className="space-y-3">
                                <li className="flex gap-3">
                                    <div className="mt-1 min-w-[6px] h-1.5 rounded-full bg-rose-500" />
                                    <p className="text-xs text-slate-300 leading-relaxed">
                                        Incorporate 1 session of <span className="text-rose-400 font-bold">HIIT or VO2 Max training</span> weekly.
                                    </p>
                                </li>
                                <li className="flex gap-3">
                                    <div className="mt-1 min-w-[6px] h-1.5 rounded-full bg-rose-500" />
                                    <p className="text-xs text-slate-300 leading-relaxed">
                                        Establish a dedicated <span className="text-rose-400 font-bold">"Active Recovery"</span> day (swimming or long walk).
                                    </p>
                                </li>
                                <li className="flex gap-3">
                                    <div className="mt-1 min-w-[6px] h-1.5 rounded-full bg-rose-500" />
                                    <p className="text-xs text-slate-300 leading-relaxed">
                                        Invest in <span className="text-rose-400 font-bold">professional coaching</span> or advanced programs (PPL or Full Body).
                                    </p>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    } else if (activeBranch === 'sleep-1') {
        return (
            <motion.div
                key="branch-detail-sleep-1"
                initial={{ opacity: 0, width: 0, x: -20 }}
                animate={{ opacity: 1, width: 400, x: 0 }}
                exit={{ opacity: 0, width: 0, x: -20 }}
                className="h-full py-4 pr-6 pl-4 flex items-start"
            >
                <div className="w-full max-h-full p-6 rounded-2xl bg-slate-900/80 border border-slate-700/50 flex flex-col relative shadow-2xl backdrop-blur-xl">
                    <div className="flex items-center gap-3 mb-4 flex-shrink-0">
                        <div className="p-1.5 rounded bg-indigo-500/20 text-indigo-400">
                            <Moon size={18} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-100 leading-none">Environmental Control</h3>
                            <p className="text-[10px] text-indigo-400 uppercase tracking-widest font-bold mt-0.5">Sleep • Phase I</p>
                        </div>
                        <button onClick={() => setActiveBranch(null)} className="ml-auto text-slate-500 hover:text-white"><Circle size={16} className="rotate-45" /></button>
                    </div>
                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
                        <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                            <h4 className="text-sm font-bold text-slate-200 mb-3">Core Objectives</h4>
                            <ul className="space-y-3">
                                <li className="flex gap-3">
                                    <div className="mt-1 min-w-[6px] h-1.5 rounded-full bg-indigo-500" />
                                    <p className="text-xs text-slate-300 leading-relaxed">
                                        Fix the <span className="text-indigo-400 font-bold">"Cave"</span>: Blackout curtains, 18°C (65°F) temp, and silence.
                                    </p>
                                </li>
                                <li className="flex gap-3">
                                    <div className="mt-1 min-w-[6px] h-1.5 rounded-full bg-indigo-500" />
                                    <p className="text-xs text-slate-300 leading-relaxed">
                                        Establish a <span className="text-indigo-400 font-bold">consistent wake-up time</span> (even on weekends).
                                    </p>
                                </li>
                                <li className="flex gap-3">
                                    <div className="mt-1 min-w-[6px] h-1.5 rounded-full bg-indigo-500" />
                                    <p className="text-xs text-slate-300 leading-relaxed">
                                        The <span className="text-indigo-400 font-bold">2 PM Rule</span>: No caffeine after 2:00 PM.
                                    </p>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    } else if (activeBranch === 'sleep-2') {
        return (
            <motion.div
                key="branch-detail-sleep-2"
                initial={{ opacity: 0, width: 0, x: -20 }}
                animate={{ opacity: 1, width: 400, x: 0 }}
                exit={{ opacity: 0, width: 0, x: -20 }}
                className="h-full py-4 pr-6 pl-4 flex items-start"
            >
                <div className="w-full max-h-full p-6 rounded-2xl bg-slate-900/80 border border-slate-700/50 flex flex-col relative shadow-2xl backdrop-blur-xl">
                    <div className="flex items-center gap-3 mb-4 flex-shrink-0">
                        <div className="p-1.5 rounded bg-indigo-500/20 text-indigo-400">
                            <Moon size={18} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-100 leading-none">Circadian Anchoring</h3>
                            <p className="text-[10px] text-indigo-400 uppercase tracking-widest font-bold mt-0.5">Sleep • Phase II</p>
                        </div>
                        <button onClick={() => setActiveBranch(null)} className="ml-auto text-slate-500 hover:text-white"><Circle size={16} className="rotate-45" /></button>
                    </div>
                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
                        <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                            <h4 className="text-sm font-bold text-slate-200 mb-3">Core Objectives</h4>
                            <ul className="space-y-3">
                                <li className="flex gap-3">
                                    <div className="mt-1 min-w-[6px] h-1.5 rounded-full bg-indigo-500" />
                                    <p className="text-xs text-slate-300 leading-relaxed">
                                        10 minutes of <span className="text-indigo-400 font-bold">morning sunlight</span> within 30 minutes of waking.
                                    </p>
                                </li>
                                <li className="flex gap-3">
                                    <div className="mt-1 min-w-[6px] h-1.5 rounded-full bg-indigo-500" />
                                    <p className="text-xs text-slate-300 leading-relaxed">
                                        Eliminate <span className="text-indigo-400 font-bold">screens/blue light</span> 60 minutes before bed.
                                    </p>
                                </li>
                                <li className="flex gap-3">
                                    <div className="mt-1 min-w-[6px] h-1.5 rounded-full bg-indigo-500" />
                                    <p className="text-xs text-slate-300 leading-relaxed">
                                        Daily movement (exercise) to build <span className="text-indigo-400 font-bold">"sleep pressure."</span>
                                    </p>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    } else if (activeBranch === 'sleep-3') {
        return (
            <motion.div
                key="branch-detail-sleep-3"
                initial={{ opacity: 0, width: 0, x: -20 }}
                animate={{ opacity: 1, width: 400, x: 0 }}
                exit={{ opacity: 0, width: 0, x: -20 }}
                className="h-full py-4 pr-6 pl-4 flex items-start"
            >
                <div className="w-full max-h-full p-6 rounded-2xl bg-slate-900/80 border border-slate-700/50 flex flex-col relative shadow-2xl backdrop-blur-xl">
                    <div className="flex items-center gap-3 mb-4 flex-shrink-0">
                        <div className="p-1.5 rounded bg-indigo-500/20 text-indigo-400">
                            <Moon size={18} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-100 leading-none">The Wind-Down Ritual</h3>
                            <p className="text-[10px] text-indigo-400 uppercase tracking-widest font-bold mt-0.5">Sleep • Phase III</p>
                        </div>
                        <button onClick={() => setActiveBranch(null)} className="ml-auto text-slate-500 hover:text-white"><Circle size={16} className="rotate-45" /></button>
                    </div>
                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
                        <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                            <h4 className="text-sm font-bold text-slate-200 mb-3">Core Objectives</h4>
                            <ul className="space-y-3">
                                <li className="flex gap-3">
                                    <div className="mt-1 min-w-[6px] h-1.5 rounded-full bg-indigo-500" />
                                    <p className="text-xs text-slate-300 leading-relaxed">
                                        Create a <span className="text-indigo-400 font-bold">"Power Down Hour"</span> (Reading, stretching, or warm shower).
                                    </p>
                                </li>
                                <li className="flex gap-3">
                                    <div className="mt-1 min-w-[6px] h-1.5 rounded-full bg-indigo-500" />
                                    <p className="text-xs text-slate-300 leading-relaxed">
                                        Use <span className="text-indigo-400 font-bold">magnesium or tart cherry juice</span> if needed (after medical advice).
                                    </p>
                                </li>
                                <li className="flex gap-3">
                                    <div className="mt-1 min-w-[6px] h-1.5 rounded-full bg-indigo-500" />
                                    <p className="text-xs text-slate-300 leading-relaxed">
                                        <span className="text-indigo-400 font-bold">Stop eating 2–3 hours before bed</span> to allow for digestion.
                                    </p>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    } else if (activeBranch === 'mental-1') {
        return (
            <motion.div
                key="branch-detail-mental-1"
                initial={{ opacity: 0, width: 0, x: -20 }}
                animate={{ opacity: 1, width: 400, x: 0 }}
                exit={{ opacity: 0, width: 0, x: -20 }}
                className="h-full py-4 pr-6 pl-4 flex items-start"
            >
                <div className="w-full max-h-full p-6 rounded-2xl bg-slate-900/80 border border-slate-700/50 flex flex-col relative shadow-2xl backdrop-blur-xl">
                    <div className="flex items-center gap-3 mb-4 flex-shrink-0">
                        <div className="p-1.5 rounded bg-pink-500/20 text-pink-400">
                            <Brain size={18} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-100 leading-none">Digital Hygiene & Awareness</h3>
                            <p className="text-[10px] text-pink-400 uppercase tracking-widest font-bold mt-0.5">Mental • Phase I</p>
                        </div>
                        <button onClick={() => setActiveBranch(null)} className="ml-auto text-slate-500 hover:text-white"><Circle size={16} className="rotate-45" /></button>
                    </div>
                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
                        <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                            <h4 className="text-sm font-bold text-slate-200 mb-3">Core Objectives</h4>
                            <ul className="space-y-3">
                                <li className="flex gap-3">
                                    <div className="mt-1 min-w-[6px] h-1.5 rounded-full bg-pink-500" />
                                    <p className="text-xs text-slate-300 leading-relaxed">
                                        <span className="text-pink-400 font-bold">"No screens"</span> for the first/last 30 minutes of the day.
                                    </p>
                                </li>
                                <li className="flex gap-3">
                                    <div className="mt-1 min-w-[6px] h-1.5 rounded-full bg-pink-500" />
                                    <p className="text-xs text-slate-300 leading-relaxed">
                                        Daily 5-minute <span className="text-pink-400 font-bold">"Brain Dump" journaling</span> to clear mental clutter.
                                    </p>
                                </li>
                                <li className="flex gap-3">
                                    <div className="mt-1 min-w-[6px] h-1.5 rounded-full bg-pink-500" />
                                    <p className="text-xs text-slate-300 leading-relaxed">
                                        Identify primary <span className="text-pink-400 font-bold">stress triggers</span> (work, social media, finances).
                                    </p>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    } else if (activeBranch === 'mental-2') {
        return (
            <motion.div
                key="branch-detail-mental-2"
                initial={{ opacity: 0, width: 0, x: -20 }}
                animate={{ opacity: 1, width: 400, x: 0 }}
                exit={{ opacity: 0, width: 0, x: -20 }}
                className="h-full py-4 pr-6 pl-4 flex items-start"
            >
                <div className="w-full max-h-full p-6 rounded-2xl bg-slate-900/80 border border-slate-700/50 flex flex-col relative shadow-2xl backdrop-blur-xl">
                    <div className="flex items-center gap-3 mb-4 flex-shrink-0">
                        <div className="p-1.5 rounded bg-pink-500/20 text-pink-400">
                            <Brain size={18} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-100 leading-none">Regulation Basics</h3>
                            <p className="text-[10px] text-pink-400 uppercase tracking-widest font-bold mt-0.5">Mental • Phase II</p>
                        </div>
                        <button onClick={() => setActiveBranch(null)} className="ml-auto text-slate-500 hover:text-white"><Circle size={16} className="rotate-45" /></button>
                    </div>
                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
                        <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                            <h4 className="text-sm font-bold text-slate-200 mb-3">Core Objectives</h4>
                            <ul className="space-y-3">
                                <li className="flex gap-3">
                                    <div className="mt-1 min-w-[6px] h-1.5 rounded-full bg-pink-500" />
                                    <p className="text-xs text-slate-300 leading-relaxed">
                                        Daily 10-minute <span className="text-pink-400 font-bold">meditation or Box Breathing</span>.
                                    </p>
                                </li>
                                <li className="flex gap-3">
                                    <div className="mt-1 min-w-[6px] h-1.5 rounded-full bg-pink-500" />
                                    <p className="text-xs text-slate-300 leading-relaxed">
                                        Establish a <span className="text-pink-400 font-bold">"Gratitude Practice"</span> to rewire the brain’s negativity bias.
                                    </p>
                                </li>
                                <li className="flex gap-3">
                                    <div className="mt-1 min-w-[6px] h-1.5 rounded-full bg-pink-500" />
                                    <p className="text-xs text-slate-300 leading-relaxed">
                                        <span className="text-pink-400 font-bold">Monotasking:</span> Practice 1 hour of work/play without switching tabs/notifications.
                                    </p>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    } else if (activeBranch === 'mental-3') {
        return (
            <motion.div
                key="branch-detail-mental-3"
                initial={{ opacity: 0, width: 0, x: -20 }}
                animate={{ opacity: 1, width: 400, x: 0 }}
                exit={{ opacity: 0, width: 0, x: -20 }}
                className="h-full py-4 pr-6 pl-4 flex items-start"
            >
                <div className="w-full max-h-full p-6 rounded-2xl bg-slate-900/80 border border-slate-700/50 flex flex-col relative shadow-2xl backdrop-blur-xl">
                    <div className="flex items-center gap-3 mb-4 flex-shrink-0">
                        <div className="p-1.5 rounded bg-pink-500/20 text-pink-400">
                            <Brain size={18} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-100 leading-none">Emotional Intelligence & Tools</h3>
                            <p className="text-[10px] text-pink-400 uppercase tracking-widest font-bold mt-0.5">Mental • Phase III</p>
                        </div>
                        <button onClick={() => setActiveBranch(null)} className="ml-auto text-slate-500 hover:text-white"><Circle size={16} className="rotate-45" /></button>
                    </div>
                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
                        <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                            <h4 className="text-sm font-bold text-slate-200 mb-3">Core Objectives</h4>
                            <ul className="space-y-3">
                                <li className="flex gap-3">
                                    <div className="mt-1 min-w-[6px] h-1.5 rounded-full bg-pink-500" />
                                    <p className="text-xs text-slate-300 leading-relaxed">
                                        Learn <span className="text-pink-400 font-bold">CBT basics:</span> reframing negative thoughts.
                                    </p>
                                </li>
                                <li className="flex gap-3">
                                    <div className="mt-1 min-w-[6px] h-1.5 rounded-full bg-pink-500" />
                                    <p className="text-xs text-slate-300 leading-relaxed">
                                        Set <span className="text-pink-400 font-bold">firm boundaries</span> for work hours and social obligations.
                                    </p>
                                </li>
                                <li className="flex gap-3">
                                    <div className="mt-1 min-w-[6px] h-1.5 rounded-full bg-pink-500" />
                                    <p className="text-xs text-slate-300 leading-relaxed">
                                        Seek <span className="text-pink-400 font-bold">professional therapy</span> if deep-seated patterns need uncoupling.
                                    </p>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    } else if (activeBranch === 'mental-4') {
        return (
            <motion.div
                key="branch-detail-mental-4"
                initial={{ opacity: 0, width: 0, x: -20 }}
                animate={{ opacity: 1, width: 400, x: 0 }}
                exit={{ opacity: 0, width: 0, x: -20 }}
                className="h-full py-4 pr-6 pl-4 flex items-start"
            >
                <div className="w-full max-h-full p-6 rounded-2xl bg-slate-900/80 border border-slate-700/50 flex flex-col relative shadow-2xl backdrop-blur-xl">
                    <div className="flex items-center gap-3 mb-4 flex-shrink-0">
                        <div className="p-1.5 rounded bg-pink-500/20 text-pink-400">
                            <Brain size={18} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-100 leading-none">Resilience & Flow</h3>
                            <p className="text-[10px] text-pink-400 uppercase tracking-widest font-bold mt-0.5">Mental • Phase IV</p>
                        </div>
                        <button onClick={() => setActiveBranch(null)} className="ml-auto text-slate-500 hover:text-white"><Circle size={16} className="rotate-45" /></button>
                    </div>
                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
                        <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                            <h4 className="text-sm font-bold text-slate-200 mb-3">Core Objectives</h4>
                            <ul className="space-y-3">
                                <li className="flex gap-3">
                                    <div className="mt-1 min-w-[6px] h-1.5 rounded-full bg-pink-500" />
                                    <p className="text-xs text-slate-300 leading-relaxed">
                                        Cultivate <span className="text-pink-400 font-bold">"Deep Work" sessions</span> (90 mins of uninterrupted focus).
                                    </p>
                                </li>
                                <li className="flex gap-3">
                                    <div className="mt-1 min-w-[6px] h-1.5 rounded-full bg-pink-500" />
                                    <p className="text-xs text-slate-300 leading-relaxed">
                                        Build a <span className="text-pink-400 font-bold">"Crisis Plan"</span> (knowing exactly what to do when burnout hits).
                                    </p>
                                </li>
                                <li className="flex gap-3">
                                    <div className="mt-1 min-w-[6px] h-1.5 rounded-full bg-pink-500" />
                                    <p className="text-xs text-slate-300 leading-relaxed">
                                        Practice <span className="text-pink-400 font-bold">"Stoic Discomfort"</span> (voluntarily doing hard things to build grit).
                                    </p>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    }

    else if (activeBranch === 'nutrition-1') {
        return (
            <motion.div
                key="branch-detail-nutrition-1"
                initial={{ opacity: 0, width: 0, x: -20 }}
                animate={{ opacity: 1, width: 400, x: 0 }}
                exit={{ opacity: 0, width: 0, x: -20 }}
                className="h-full py-4 pr-6 pl-4 flex items-start"
            >
                <div className="w-full max-h-full p-6 rounded-2xl bg-slate-900/80 border border-slate-700/50 flex flex-col relative shadow-2xl backdrop-blur-xl">
                    <div className="flex items-center gap-3 mb-4 flex-shrink-0">
                        <div className="p-1.5 rounded bg-emerald-500/20 text-emerald-400">
                            <Utensils size={18} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-100 leading-none">Elimination & Awareness</h3>
                            <p className="text-[10px] text-emerald-400 uppercase tracking-widest font-bold mt-0.5">Nutrition • Phase I</p>
                        </div>
                        <button onClick={() => setActiveBranch(null)} className="ml-auto text-slate-500 hover:text-white"><Circle size={16} className="rotate-45" /></button>
                    </div>
                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
                        <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                            <h4 className="text-sm font-bold text-slate-200 mb-3">Core Objectives</h4>
                            <ul className="space-y-3">
                                <li className="flex gap-3">
                                    <div className="mt-1 min-w-[6px] h-1.5 rounded-full bg-emerald-500" />
                                    <p className="text-xs text-slate-300 leading-relaxed">
                                        Eliminate <span className="text-emerald-400 font-bold">"Liquid Calories"</span> (soda, juice, sugary coffees).
                                    </p>
                                </li>
                                <li className="flex gap-3">
                                    <div className="mt-1 min-w-[6px] h-1.5 rounded-full bg-emerald-500" />
                                    <p className="text-xs text-slate-300 leading-relaxed">
                                        Remove <span className="text-emerald-400 font-bold">Ultra-Processed Foods (UPF)</span> from the house.
                                    </p>
                                </li>
                                <li className="flex gap-3">
                                    <div className="mt-1 min-w-[6px] h-1.5 rounded-full bg-emerald-500" />
                                    <p className="text-xs text-slate-300 leading-relaxed">
                                        Start a <span className="text-emerald-400 font-bold">Photo Food Diary</span> (just snap a pic of everything you eat).
                                    </p>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    } else if (activeBranch === 'nutrition-2') {
        return (
            <motion.div
                key="branch-detail-nutrition-2"
                initial={{ opacity: 0, width: 0, x: -20 }}
                animate={{ opacity: 1, width: 400, x: 0 }}
                exit={{ opacity: 0, width: 0, x: -20 }}
                className="h-full py-4 pr-6 pl-4 flex items-start"
            >
                <div className="w-full max-h-full p-6 rounded-2xl bg-slate-900/80 border border-slate-700/50 flex flex-col relative shadow-2xl backdrop-blur-xl">
                    <div className="flex items-center gap-3 mb-4 flex-shrink-0">
                        <div className="p-1.5 rounded bg-emerald-500/20 text-emerald-400">
                            <Utensils size={18} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-100 leading-none">Structure & Macros</h3>
                            <p className="text-[10px] text-emerald-400 uppercase tracking-widest font-bold mt-0.5">Nutrition • Phase II</p>
                        </div>
                        <button onClick={() => setActiveBranch(null)} className="ml-auto text-slate-500 hover:text-white"><Circle size={16} className="rotate-45" /></button>
                    </div>
                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
                        <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                            <h4 className="text-sm font-bold text-slate-200 mb-3">Core Objectives</h4>
                            <ul className="space-y-3">
                                <li className="flex gap-3">
                                    <div className="mt-1 min-w-[6px] h-1.5 rounded-full bg-emerald-500" />
                                    <p className="text-xs text-slate-300 leading-relaxed">
                                        Prioritize <span className="text-emerald-400 font-bold">Protein</span> at every meal (aim for 30g per meal).
                                    </p>
                                </li>
                                <li className="flex gap-3">
                                    <div className="mt-1 min-w-[6px] h-1.5 rounded-full bg-emerald-500" />
                                    <p className="text-xs text-slate-300 leading-relaxed">
                                        Establish <span className="text-emerald-400 font-bold">Meal Windows</span> (e.g., 3 meals, no snacks).
                                    </p>
                                </li>
                                <li className="flex gap-3">
                                    <div className="mt-1 min-w-[6px] h-1.5 rounded-full bg-emerald-500" />
                                    <p className="text-xs text-slate-300 leading-relaxed">
                                        Drink <span className="text-emerald-400 font-bold">3 Liters of Water</span> daily.
                                    </p>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    } else if (activeBranch === 'nutrition-3') {
        return (
            <motion.div
                key="branch-detail-nutrition-3"
                initial={{ opacity: 0, width: 0, x: -20 }}
                animate={{ opacity: 1, width: 400, x: 0 }}
                exit={{ opacity: 0, width: 0, x: -20 }}
                className="h-full py-4 pr-6 pl-4 flex items-start"
            >
                <div className="w-full max-h-full p-6 rounded-2xl bg-slate-900/80 border border-slate-700/50 flex flex-col relative shadow-2xl backdrop-blur-xl">
                    <div className="flex items-center gap-3 mb-4 flex-shrink-0">
                        <div className="p-1.5 rounded bg-emerald-500/20 text-emerald-400">
                            <Utensils size={18} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-100 leading-none">Quality & Complexity</h3>
                            <p className="text-[10px] text-emerald-400 uppercase tracking-widest font-bold mt-0.5">Nutrition • Phase III</p>
                        </div>
                        <button onClick={() => setActiveBranch(null)} className="ml-auto text-slate-500 hover:text-white"><Circle size={16} className="rotate-45" /></button>
                    </div>
                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
                        <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                            <h4 className="text-sm font-bold text-slate-200 mb-3">Core Objectives</h4>
                            <ul className="space-y-3">
                                <li className="flex gap-3">
                                    <div className="mt-1 min-w-[6px] h-1.5 rounded-full bg-emerald-500" />
                                    <p className="text-xs text-slate-300 leading-relaxed">
                                        Switch to <span className="text-emerald-400 font-bold">Complex Carbs</span> (oats, quinoa, sweet potato) over simple sugars.
                                    </p>
                                </li>
                                <li className="flex gap-3">
                                    <div className="mt-1 min-w-[6px] h-1.5 rounded-full bg-emerald-500" />
                                    <p className="text-xs text-slate-300 leading-relaxed">
                                        Increase <span className="text-emerald-400 font-bold">Fiber intake</span> (vegetables at 2 meals/day).
                                    </p>
                                </li>
                                <li className="flex gap-3">
                                    <div className="mt-1 min-w-[6px] h-1.5 rounded-full bg-emerald-500" />
                                    <p className="text-xs text-slate-300 leading-relaxed">
                                        Learn to <span className="text-emerald-400 font-bold">Meal Prep</span> Sundays for the week ahead.
                                    </p>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    } else if (activeBranch === 'nutrition-4') {
        return (
            <motion.div
                key="branch-detail-nutrition-4"
                initial={{ opacity: 0, width: 0, x: -20 }}
                animate={{ opacity: 1, width: 400, x: 0 }}
                exit={{ opacity: 0, width: 0, x: -20 }}
                className="h-full py-4 pr-6 pl-4 flex items-start"
            >
                <div className="w-full max-h-full p-6 rounded-2xl bg-slate-900/80 border border-slate-700/50 flex flex-col relative shadow-2xl backdrop-blur-xl">
                    <div className="flex items-center gap-3 mb-4 flex-shrink-0">
                        <div className="p-1.5 rounded bg-emerald-500/20 text-emerald-400">
                            <Utensils size={18} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-100 leading-none">Optimization & Precision</h3>
                            <p className="text-[10px] text-emerald-400 uppercase tracking-widest font-bold mt-0.5">Nutrition • Phase IV</p>
                        </div>
                        <button onClick={() => setActiveBranch(null)} className="ml-auto text-slate-500 hover:text-white"><Circle size={16} className="rotate-45" /></button>
                    </div>
                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
                        <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                            <h4 className="text-sm font-bold text-slate-200 mb-3">Core Objectives</h4>
                            <ul className="space-y-3">
                                <li className="flex gap-3">
                                    <div className="mt-1 min-w-[6px] h-1.5 rounded-full bg-emerald-500" />
                                    <p className="text-xs text-slate-300 leading-relaxed">
                                        Calculate and track <span className="text-emerald-400 font-bold">Macros (Protein/Fat/Carb)</span> specifically for your goal.
                                    </p>
                                </li>
                                <li className="flex gap-3">
                                    <div className="mt-1 min-w-[6px] h-1.5 rounded-full bg-emerald-500" />
                                    <p className="text-xs text-slate-300 leading-relaxed">
                                        Experiment with <span className="text-emerald-400 font-bold">Supplements</span> (Creatine, Omega-3, Vitamin D - refer to doctor).
                                    </p>
                                </li>
                                <li className="flex gap-3">
                                    <div className="mt-1 min-w-[6px] h-1.5 rounded-full bg-emerald-500" />
                                    <p className="text-xs text-slate-300 leading-relaxed">
                                        <span className="text-emerald-400 font-bold">Metabolic Flexibility</span> (e.g., occasional fasting or carb cycling).
                                    </p>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    } else if (activeBranch === 'social-1') {
        return (
            <motion.div
                key="branch-detail-social-1"
                initial={{ opacity: 0, width: 0, x: -20 }}
                animate={{ opacity: 1, width: 400, x: 0 }}
                exit={{ opacity: 0, width: 0, x: -20 }}
                className="h-full py-4 pr-6 pl-4 flex items-start"
            >
                <div className="w-full max-h-full p-6 rounded-2xl bg-slate-900/80 border border-slate-700/50 flex flex-col relative shadow-2xl backdrop-blur-xl">
                    <div className="flex items-center gap-3 mb-4 flex-shrink-0">
                        <div className="p-1.5 rounded bg-blue-500/20 text-blue-400">
                            <Users size={18} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-100 leading-none">Reconnection</h3>
                            <p className="text-[10px] text-blue-400 uppercase tracking-widest font-bold mt-0.5">Social • Phase I</p>
                        </div>
                        <button onClick={() => setActiveBranch(null)} className="ml-auto text-slate-500 hover:text-white"><Circle size={16} className="rotate-45" /></button>
                    </div>
                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
                        <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                            <h4 className="text-sm font-bold text-slate-200 mb-3">Core Objectives</h4>
                            <ul className="space-y-3">
                                <li className="flex gap-3">
                                    <div className="mt-1 min-w-[6px] h-1.5 rounded-full bg-blue-500" />
                                    <p className="text-xs text-slate-300 leading-relaxed">
                                        <span className="text-blue-400 font-bold">Audit your circle:</span> Who drains you? Who energizes you?
                                    </p>
                                </li>
                                <li className="flex gap-3">
                                    <div className="mt-1 min-w-[6px] h-1.5 rounded-full bg-blue-500" />
                                    <p className="text-xs text-slate-300 leading-relaxed">
                                        Reach out to <span className="text-blue-400 font-bold">one old friend</span> you’ve lost touch with.
                                    </p>
                                </li>
                                <li className="flex gap-3">
                                    <div className="mt-1 min-w-[6px] h-1.5 rounded-full bg-blue-500" />
                                    <p className="text-xs text-slate-300 leading-relaxed">
                                        Schedule <span className="text-blue-400 font-bold">one social hour</span> per week (offline).
                                    </p>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    } else if (activeBranch === 'social-2') {
        return (
            <motion.div
                key="branch-detail-social-2"
                initial={{ opacity: 0, width: 0, x: -20 }}
                animate={{ opacity: 1, width: 400, x: 0 }}
                exit={{ opacity: 0, width: 0, x: -20 }}
                className="h-full py-4 pr-6 pl-4 flex items-start"
            >
                <div className="w-full max-h-full p-6 rounded-2xl bg-slate-900/80 border border-slate-700/50 flex flex-col relative shadow-2xl backdrop-blur-xl">
                    <div className="flex items-center gap-3 mb-4 flex-shrink-0">
                        <div className="p-1.5 rounded bg-blue-500/20 text-blue-400">
                            <Users size={18} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-100 leading-none">Presence & Depth</h3>
                            <p className="text-[10px] text-blue-400 uppercase tracking-widest font-bold mt-0.5">Social • Phase II</p>
                        </div>
                        <button onClick={() => setActiveBranch(null)} className="ml-auto text-slate-500 hover:text-white"><Circle size={16} className="rotate-45" /></button>
                    </div>
                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
                        <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                            <h4 className="text-sm font-bold text-slate-200 mb-3">Core Objectives</h4>
                            <ul className="space-y-3">
                                <li className="flex gap-3">
                                    <div className="mt-1 min-w-[6px] h-1.5 rounded-full bg-blue-500" />
                                    <p className="text-xs text-slate-300 leading-relaxed">
                                        Practice <span className="text-blue-400 font-bold">Active Listening</span> (listen to understand, not to reply).
                                    </p>
                                </li>
                                <li className="flex gap-3">
                                    <div className="mt-1 min-w-[6px] h-1.5 rounded-full bg-blue-500" />
                                    <p className="text-xs text-slate-300 leading-relaxed">
                                        <span className="text-blue-400 font-bold">No phones</span> during meals or face-to-face conversations.
                                    </p>
                                </li>
                                <li className="flex gap-3">
                                    <div className="mt-1 min-w-[6px] h-1.5 rounded-full bg-blue-500" />
                                    <p className="text-xs text-slate-300 leading-relaxed">
                                        Engage in <span className="text-blue-400 font-bold">Shared Activities</span> (hike, board games, sport) vs passive consumption.
                                    </p>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    } else if (activeBranch === 'social-3') {
        return (
            <motion.div
                key="branch-detail-social-3"
                initial={{ opacity: 0, width: 0, x: -20 }}
                animate={{ opacity: 1, width: 400, x: 0 }}
                exit={{ opacity: 0, width: 0, x: -20 }}
                className="h-full py-4 pr-6 pl-4 flex items-start"
            >
                <div className="w-full max-h-full p-6 rounded-2xl bg-slate-900/80 border border-slate-700/50 flex flex-col relative shadow-2xl backdrop-blur-xl">
                    <div className="flex items-center gap-3 mb-4 flex-shrink-0">
                        <div className="p-1.5 rounded bg-blue-500/20 text-blue-400">
                            <Users size={18} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-100 leading-none">Community & Contribution</h3>
                            <p className="text-[10px] text-blue-400 uppercase tracking-widest font-bold mt-0.5">Social • Phase III</p>
                        </div>
                        <button onClick={() => setActiveBranch(null)} className="ml-auto text-slate-500 hover:text-white"><Circle size={16} className="rotate-45" /></button>
                    </div>
                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
                        <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                            <h4 className="text-sm font-bold text-slate-200 mb-3">Core Objectives</h4>
                            <ul className="space-y-3">
                                <li className="flex gap-3">
                                    <div className="mt-1 min-w-[6px] h-1.5 rounded-full bg-blue-500" />
                                    <p className="text-xs text-slate-300 leading-relaxed">
                                        Join a <span className="text-blue-400 font-bold">Club or Group</span> aligned with your interests (Run club, book club).
                                    </p>
                                </li>
                                <li className="flex gap-3">
                                    <div className="mt-1 min-w-[6px] h-1.5 rounded-full bg-blue-500" />
                                    <p className="text-xs text-slate-300 leading-relaxed">
                                        <span className="text-blue-400 font-bold">Volunteer</span> or help someone else without expecting return.
                                    </p>
                                </li>
                                <li className="flex gap-3">
                                    <div className="mt-1 min-w-[6px] h-1.5 rounded-full bg-blue-500" />
                                    <p className="text-xs text-slate-300 leading-relaxed">
                                        Host a <span className="text-blue-400 font-bold">Social Gathering</span> (dinner, game night).
                                    </p>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    } else if (activeBranch === 'social-4') {
        return (
            <motion.div
                key="branch-detail-social-4"
                initial={{ opacity: 0, width: 0, x: -20 }}
                animate={{ opacity: 1, width: 400, x: 0 }}
                exit={{ opacity: 0, width: 0, x: -20 }}
                className="h-full py-4 pr-6 pl-4 flex items-start"
            >
                <div className="w-full max-h-full p-6 rounded-2xl bg-slate-900/80 border border-slate-700/50 flex flex-col relative shadow-2xl backdrop-blur-xl">
                    <div className="flex items-center gap-3 mb-4 flex-shrink-0">
                        <div className="p-1.5 rounded bg-blue-500/20 text-blue-400">
                            <Users size={18} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-100 leading-none">Leadership & Legacy</h3>
                            <p className="text-[10px] text-blue-400 uppercase tracking-widest font-bold mt-0.5">Social • Phase IV</p>
                        </div>
                        <button onClick={() => setActiveBranch(null)} className="ml-auto text-slate-500 hover:text-white"><Circle size={16} className="rotate-45" /></button>
                    </div>
                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
                        <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                            <h4 className="text-sm font-bold text-slate-200 mb-3">Core Objectives</h4>
                            <ul className="space-y-3">
                                <li className="flex gap-3">
                                    <div className="mt-1 min-w-[6px] h-1.5 rounded-full bg-blue-500" />
                                    <p className="text-xs text-slate-300 leading-relaxed">
                                        <span className="text-blue-400 font-bold">Mentor</span> someone younger or less experienced.
                                    </p>
                                </li>
                                <li className="flex gap-3">
                                    <div className="mt-1 min-w-[6px] h-1.5 rounded-full bg-blue-500" />
                                    <p className="text-xs text-slate-300 leading-relaxed">
                                        Build a <span className="text-blue-400 font-bold">"Third Place"</span> that isn't work or home where you are a regular.
                                    </p>
                                </li>
                                <li className="flex gap-3">
                                    <div className="mt-1 min-w-[6px] h-1.5 rounded-full bg-blue-500" />
                                    <p className="text-xs text-slate-300 leading-relaxed">
                                        Deepen <span className="text-blue-400 font-bold">Family Bonds</span> (Proactively strengthening relationships with kin).
                                    </p>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    }

    if (activeBranch) {
        // Default locked view
        return (
            <motion.div
                key="branch-detail-placeholder"
                initial={{ opacity: 0, width: 0, x: -20 }}
                animate={{ opacity: 1, width: 400, x: 0 }}
                exit={{ opacity: 0, width: 0, x: -20 }}
                className="h-full py-4 pr-6 pl-4"
            >
                <div className="w-full h-full p-6 rounded-2xl bg-slate-900/80 border border-slate-700/50 flex flex-col relative shadow-2xl backdrop-blur-xl items-center justify-center text-center">
                    <div className="p-4 rounded-full bg-slate-800/50 text-slate-600 mb-4">
                        <Lock size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-500">Content Locked</h3>
                    <p className="text-xs text-slate-600 mt-2 max-w-[200px]">
                        Complete prerequisite branches to unlock this module.
                    </p>
                </div>
            </motion.div>
        );
    }

    return null;
};
