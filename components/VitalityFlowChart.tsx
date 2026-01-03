import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Brain, Utensils, Users, Moon, Trophy, Droplet, CheckCircle2, Circle, ArrowLeft, Lock, Dumbbell, Flag, Gift, Award } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';


export const VitalityFlowChart: React.FC = () => {
    const { addProjects, addRewards, vitality, setVitalityData } = useGameStore();
    const [activePillar, setActivePillar] = React.useState<string>('physical');

    const [activeBranch, setActiveBranch] = React.useState<string | null>('phys-1'); // Default to first branch

    React.useEffect(() => {
        // Automatically select the first branch when the active pillar changes
        const branches = getSubBranches(activePillar);
        if (branches.length > 0) {
            setActiveBranch(branches[0].id);
            setAssessmentStep(1); // Reset assessment step
        }
    }, [activePillar]);
    const [assessmentStep, setAssessmentStep] = React.useState(1);
    // Local formData replaced by global vitality state
    const [showGoalDetail, setShowGoalDetail] = React.useState(false);
    const [showNutritionCard, setShowNutritionCard] = React.useState(false);

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

    // Activity Levels Data for Stabilise & Assess (phys-1)
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

    // Helper to render Detail Panel (Middle Column)
    const renderDetailPanel = () => {
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
                </motion.div >
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
        } else if (activeBranch === 'nutrition-1') {
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
                            <div className="p-1.5 rounded bg-green-500/20 text-green-400">
                                <Utensils size={18} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-100 leading-none">Triage & Hydration</h3>
                                <p className="text-[10px] text-green-400 uppercase tracking-widest font-bold mt-0.5">Nutrition • Phase I</p>
                            </div>
                            <button onClick={() => setActiveBranch(null)} className="ml-auto text-slate-500 hover:text-white"><Circle size={16} className="rotate-45" /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
                            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                                <h4 className="text-sm font-bold text-slate-200 mb-3">Core Objectives</h4>
                                <ul className="space-y-3">
                                    <li className="flex gap-3">
                                        <div className="mt-1 min-w-[6px] h-1.5 rounded-full bg-green-500" />
                                        <p className="text-xs text-slate-300 leading-relaxed">
                                            Eliminate <span className="text-green-400 font-bold">liquid calories</span> (soda/juice) and drink 2–3L of water.
                                        </p>
                                    </li>
                                    <li className="flex gap-3">
                                        <div className="mt-1 min-w-[6px] h-1.5 rounded-full bg-green-500" />
                                        <p className="text-xs text-slate-300 leading-relaxed">
                                            Eat <span className="text-green-400 font-bold">3 distinct meals</span> without grazing.
                                        </p>
                                    </li>
                                    <li className="flex gap-3">
                                        <div className="mt-1 min-w-[6px] h-1.5 rounded-full bg-green-500" />
                                        <p className="text-xs text-slate-300 leading-relaxed">
                                            Ensure <span className="text-green-400 font-bold">protein</span> (palm-sized portion) at every meal.
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
                            <div className="p-1.5 rounded bg-green-500/20 text-green-400">
                                <Utensils size={18} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-100 leading-none">Whole Food Foundations</h3>
                                <p className="text-[10px] text-green-400 uppercase tracking-widest font-bold mt-0.5">Nutrition • Phase II</p>
                            </div>
                            <button onClick={() => setActiveBranch(null)} className="ml-auto text-slate-500 hover:text-white"><Circle size={16} className="rotate-45" /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
                            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                                <h4 className="text-sm font-bold text-slate-200 mb-3">Core Objectives</h4>
                                <ul className="space-y-3">
                                    <li className="flex gap-3">
                                        <div className="mt-1 min-w-[6px] h-1.5 rounded-full bg-green-500" />
                                        <p className="text-xs text-slate-300 leading-relaxed">
                                            The <span className="text-green-400 font-bold">80/20 Rule:</span> 80% of food comes from single-ingredient whole foods.
                                        </p>
                                    </li>
                                    <li className="flex gap-3">
                                        <div className="mt-1 min-w-[6px] h-1.5 rounded-full bg-green-500" />
                                        <p className="text-xs text-slate-300 leading-relaxed">
                                            Reduce <span className="text-green-400 font-bold">ultra-processed "convenience" foods</span> provided.
                                        </p>
                                    </li>
                                    <li className="flex gap-3">
                                        <div className="mt-1 min-w-[6px] h-1.5 rounded-full bg-green-500" />
                                        <p className="text-xs text-slate-300 leading-relaxed">
                                            Increase <span className="text-green-400 font-bold">fiber intake</span> (target 30g+ daily).
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
                            <div className="p-1.5 rounded bg-green-500/20 text-green-400">
                                <Utensils size={18} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-100 leading-none">Structure & Planning</h3>
                                <p className="text-[10px] text-green-400 uppercase tracking-widest font-bold mt-0.5">Nutrition • Phase III</p>
                            </div>
                            <button onClick={() => setActiveBranch(null)} className="ml-auto text-slate-500 hover:text-white"><Circle size={16} className="rotate-45" /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
                            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                                <h4 className="text-sm font-bold text-slate-200 mb-3">Core Objectives</h4>
                                <ul className="space-y-3">
                                    <li className="flex gap-3">
                                        <div className="mt-1 min-w-[6px] h-1.5 rounded-full bg-green-500" />
                                        <p className="text-xs text-slate-300 leading-relaxed">
                                            Meal prep/grocery plan to eliminate <span className="text-green-400 font-bold">"decision fatigue."</span>
                                        </p>
                                    </li>
                                    <li className="flex gap-3">
                                        <div className="mt-1 min-w-[6px] h-1.5 rounded-full bg-green-500" />
                                        <p className="text-xs text-slate-300 leading-relaxed">
                                            <span className="text-green-400 font-bold">Track macros</span> for 30 days to understand what your body actually needs.
                                        </p>
                                    </li>
                                    <li className="flex gap-3">
                                        <div className="mt-1 min-w-[6px] h-1.5 rounded-full bg-green-500" />
                                        <p className="text-xs text-slate-300 leading-relaxed">
                                            Learn the basics of <span className="text-green-400 font-bold">gut health</span> (probiotics/fermented foods).
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
                            <div className="p-1.5 rounded bg-green-500/20 text-green-400">
                                <Utensils size={18} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-100 leading-none">Metabolic Flexibility</h3>
                                <p className="text-[10px] text-green-400 uppercase tracking-widest font-bold mt-0.5">Nutrition • Phase IV</p>
                            </div>
                            <button onClick={() => setActiveBranch(null)} className="ml-auto text-slate-500 hover:text-white"><Circle size={16} className="rotate-45" /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
                            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                                <h4 className="text-sm font-bold text-slate-200 mb-3">Core Objectives</h4>
                                <ul className="space-y-3">
                                    <li className="flex gap-3">
                                        <div className="mt-1 min-w-[6px] h-1.5 rounded-full bg-green-500" />
                                        <p className="text-xs text-slate-300 leading-relaxed">
                                            Implement <span className="text-green-400 font-bold">time-restricted feeding</span> (e.g., 12:12 or 16:8).
                                        </p>
                                    </li>
                                    <li className="flex gap-3">
                                        <div className="mt-1 min-w-[6px] h-1.5 rounded-full bg-green-500" />
                                        <p className="text-xs text-slate-300 leading-relaxed">
                                            Optimize <span className="text-green-400 font-bold">micronutrients</span> based on annual blood work.
                                        </p>
                                    </li>
                                    <li className="flex gap-3">
                                        <div className="mt-1 min-w-[6px] h-1.5 rounded-full bg-green-500" />
                                        <p className="text-xs text-slate-300 leading-relaxed">
                                            <span className="text-green-400 font-bold">Match fuel to activity</span> (higher carbs on training days, lower on rest days).
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
                            <div className="p-1.5 rounded bg-amber-500/20 text-amber-400">
                                <Users size={18} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-100 leading-none">Re-engagement</h3>
                                <p className="text-[10px] text-amber-400 uppercase tracking-widest font-bold mt-0.5">Social • Phase I</p>
                            </div>
                            <button onClick={() => setActiveBranch(null)} className="ml-auto text-slate-500 hover:text-white"><Circle size={16} className="rotate-45" /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
                            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                                <h4 className="text-sm font-bold text-slate-200 mb-3">Core Objectives</h4>
                                <ul className="space-y-3">
                                    <li className="flex gap-3">
                                        <div className="mt-1 min-w-[6px] h-1.5 rounded-full bg-amber-500" />
                                        <p className="text-xs text-slate-300 leading-relaxed">
                                            Message <span className="text-amber-400 font-bold">one friend/family member weekly</span> just to check in.
                                        </p>
                                    </li>
                                    <li className="flex gap-3">
                                        <div className="mt-1 min-w-[6px] h-1.5 rounded-full bg-amber-500" />
                                        <p className="text-xs text-slate-300 leading-relaxed">
                                            Practice <span className="text-amber-400 font-bold">"Active Listening" (Level 3):</span> listening without preparing a reply.
                                        </p>
                                    </li>
                                    <li className="flex gap-3">
                                        <div className="mt-1 min-w-[6px] h-1.5 rounded-full bg-amber-500" />
                                        <p className="text-xs text-slate-300 leading-relaxed">
                                            Practice <span className="text-amber-400 font-bold">"Micro-connections"</span> (small talk with neighbors/baristas).
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
                            <div className="p-1.5 rounded bg-amber-500/20 text-amber-400">
                                <Users size={18} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-100 leading-none">Consistent Community</h3>
                                <p className="text-[10px] text-amber-400 uppercase tracking-widest font-bold mt-0.5">Social • Phase II</p>
                            </div>
                            <button onClick={() => setActiveBranch(null)} className="ml-auto text-slate-500 hover:text-white"><Circle size={16} className="rotate-45" /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
                            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                                <h4 className="text-sm font-bold text-slate-200 mb-3">Core Objectives</h4>
                                <ul className="space-y-3">
                                    <li className="flex gap-3">
                                        <div className="mt-1 min-w-[6px] h-1.5 rounded-full bg-amber-500" />
                                        <p className="text-xs text-slate-300 leading-relaxed">
                                            Join <span className="text-amber-400 font-bold">one recurring group</span> (gym, hobby club, or volunteer organization).
                                        </p>
                                    </li>
                                    <li className="flex gap-3">
                                        <div className="mt-1 min-w-[6px] h-1.5 rounded-full bg-amber-500" />
                                        <p className="text-xs text-slate-300 leading-relaxed">
                                            Schedule <span className="text-amber-400 font-bold">one "recurring" social event</span> (e.g., Tuesday night gaming/coffee).
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
                            <div className="p-1.5 rounded bg-amber-500/20 text-amber-400">
                                <Users size={18} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-100 leading-none">Depth & Vulnerability</h3>
                                <p className="text-[10px] text-amber-400 uppercase tracking-widest font-bold mt-0.5">Social • Phase III</p>
                            </div>
                            <button onClick={() => setActiveBranch(null)} className="ml-auto text-slate-500 hover:text-white"><Circle size={16} className="rotate-45" /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
                            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                                <h4 className="text-sm font-bold text-slate-200 mb-3">Core Objectives</h4>
                                <ul className="space-y-3">
                                    <li className="flex gap-3">
                                        <div className="mt-1 min-w-[6px] h-1.5 rounded-full bg-amber-500" />
                                        <p className="text-xs text-slate-300 leading-relaxed">
                                            Move past small talk: <span className="text-amber-400 font-bold">share a personal challenge</span> with a trusted friend.
                                        </p>
                                    </li>
                                    <li className="flex gap-3">
                                        <div className="mt-1 min-w-[6px] h-1.5 rounded-full bg-amber-500" />
                                        <p className="text-xs text-slate-300 leading-relaxed">
                                            Learn <span className="text-amber-400 font-bold">healthy conflict resolution;</span> address issues instead of ghosting.
                                        </p>
                                    </li>
                                    <li className="flex gap-3">
                                        <div className="mt-1 min-w-[6px] h-1.5 rounded-full bg-amber-500" />
                                        <p className="text-xs text-slate-300 leading-relaxed">
                                            Audit your circle: <span className="text-amber-400 font-bold">Distance yourself</span> from "draining" relationships.
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
                            <div className="p-1.5 rounded bg-amber-500/20 text-amber-400">
                                <Users size={18} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-100 leading-none">Mentorship & Contribution</h3>
                                <p className="text-[10px] text-amber-400 uppercase tracking-widest font-bold mt-0.5">Social • Phase IV</p>
                            </div>
                            <button onClick={() => setActiveBranch(null)} className="ml-auto text-slate-500 hover:text-white"><Circle size={16} className="rotate-45" /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
                            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                                <h4 className="text-sm font-bold text-slate-200 mb-3">Core Objectives</h4>
                                <ul className="space-y-3">
                                    <li className="flex gap-3">
                                        <div className="mt-1 min-w-[6px] h-1.5 rounded-full bg-amber-500" />
                                        <p className="text-xs text-slate-300 leading-relaxed">
                                            Find a <span className="text-amber-400 font-bold">mentor</span> for your career or personal growth.
                                        </p>
                                    </li>
                                    <li className="flex gap-3">
                                        <div className="mt-1 min-w-[6px] h-1.5 rounded-full bg-amber-500" />
                                        <p className="text-xs text-slate-300 leading-relaxed">
                                            Begin <span className="text-amber-400 font-bold">mentoring someone else</span> or taking a leadership role in a group.
                                        </p>
                                    </li>
                                    <li className="flex gap-3">
                                        <div className="mt-1 min-w-[6px] h-1.5 rounded-full bg-amber-500" />
                                        <p className="text-xs text-slate-300 leading-relaxed">
                                            Host a <span className="text-amber-400 font-bold">small gathering</span> at your home (moving from "guest" to "host").
                                        </p>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </motion.div>
            );
        } else if (activeBranch) {
            // GENERIC PLACEHOLDER FOR OTHER BRANCHES
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

    // Rotate pillars so the active one is in the center
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
                        const isVisualActive = showNutritionCard && pillar.id === 'nutrition';
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
                            {renderDetailPanel()}
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
