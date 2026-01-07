import React, { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, CheckCircle, X } from 'lucide-react';

export const TutorialOverlay: React.FC = () => {
    const { isTutorialActive, completeTutorial } = useGameStore();
    const navigate = useNavigate();
    const [step, setStep] = useState(0);

    // Username State
    const checkUsername = useQuery(api.users.checkUsername, { username: "" }); // Hook needs stable args, handle dynamic below or skipping?
    // Actually, simple query invalidation or just onChange handling.
    // Better to use a mutation or action? No, query is fine but we need dynamic arg.
    // We'll use a local fetch or just wait for the step logic.
    // Simplest: useConvex to fetch imperatively or just useQuery with state.
    const [desiredUsername, setDesiredUsername] = useState("");
    const [usernameError, setUsernameError] = useState("");
    const [isCheckingUser, setIsCheckingUser] = useState(false);

    const setUsernameMutation = useMutation(api.users.setUsername);
    const checkUsernameQuery = useQuery(api.users.checkUsername, { username: desiredUsername });

    if (!isTutorialActive) return null;

    const steps = [
        {
            title: "Identity Initialization",
            content: "Before we begin, establish your unique identity in the system.",
            target: null,
            isIdentityStep: true
        },
        {
            title: "Welcome, Traversal",
            content: "You have just initialized the Game of Life. This system is designed to visualize your potential and track your growth.",
            target: "/" // Dashboard
        },
        {
            title: "The Dashboard",
            content: "Your command center. Here you can see your active stats, recent activity, and vital metrics at a glance.",
            target: "/"
        },
        {
            title: "Quest Log",
            content: "The core of your progress. Manage your daily habits (Bounties) and long-term goals (Foundations) here.",
            target: "/quests"
        },
        {
            title: "Skill Tree",
            content: "Visualize your growth. Spend XP and Skill Points to unlock new nodes and abilities as you level up.",
            target: "/skills"
        },
        {
            title: "Resources",
            content: "Track your primary resources: Gold for items, XP for leveling, and Energy for completing tasks.",
            target: "/" // Back to Dashboard or stay
        }
    ];

    const currentStep = steps[step];

    const handleNext = async () => {
        // Special Logic for Identity Step
        if (currentStep.isIdentityStep) {
            if (!desiredUsername || desiredUsername.length < 3) {
                setUsernameError("Username must be at least 3 characters.");
                return;
            }
            if (checkUsernameQuery?.available === false) {
                setUsernameError(checkUsernameQuery.reason || "Username unavailable");
                return;
            }

            try {
                await setUsernameMutation({ username: desiredUsername });
            } catch (e: any) {
                setUsernameError(e.message || "Failed to set username");
                return;
            }
        }

        if (step < steps.length - 1) {
            const nextStep = steps[step + 1];
            if (nextStep.target) {
                navigate(nextStep.target);
            }
            setStep(step + 1);
        } else {
            completeTutorial();
        }
    };

    const handleSkip = () => {
        completeTutorial();
    };

    return (
        <div className="fixed inset-0 z-[200] pointer-events-none flex items-center justify-center">
            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm pointer-events-auto" />

            {/* Content Container */}
            <motion.div
                key={step}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="relative z-[210] max-w-lg w-full bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-8 pointer-events-auto"
            >
                {/* Progress Bar */}
                <div className="flex gap-2 mb-6">
                    {steps.map((_, i) => (
                        <div
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${i <= step ? 'bg-indigo-500' : 'bg-slate-800'}`}
                        />
                    ))}
                </div>

                <div className="space-y-4 mb-8">
                    <h2 className="text-2xl font-black text-white">{currentStep.title}</h2>
                    <p className="text-slate-300 leading-relaxed text-lg">
                        {currentStep.content}
                    </p>

                    {/* IDENTITY INPUT */}
                    {currentStep.isIdentityStep && (
                        <div className="mt-6 space-y-2">
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">@</span>
                                <input
                                    type="text"
                                    value={desiredUsername}
                                    onChange={(e) => {
                                        setDesiredUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''));
                                        setUsernameError("");
                                    }}
                                    placeholder="username"
                                    className={`w-full bg-slate-950 border ${usernameError ? 'border-red-500 focus:border-red-500' : (checkUsernameQuery?.available && desiredUsername.length >= 3) ? 'border-green-500 focus:border-green-500' : 'border-slate-700 focus:border-indigo-500'} rounded-xl py-3 pl-10 pr-4 text-white font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all`}
                                />
                                {(checkUsernameQuery?.available && desiredUsername.length >= 3) && (
                                    <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500" size={18} />
                                )}
                            </div>
                            {usernameError && (
                                <p className="text-red-400 text-xs pl-2">{usernameError}</p>
                            )}
                            {!usernameError && desiredUsername.length >= 3 && checkUsernameQuery?.available === false && (
                                <p className="text-red-400 text-xs pl-2">Username taken</p>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-between">
                    <button
                        onClick={handleSkip}
                        className="text-slate-500 hover:text-slate-300 text-sm font-bold uppercase tracking-wider px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
                    >
                        Skip
                    </button>

                    <button
                        onClick={handleNext}
                        disabled={currentStep.isIdentityStep && (!!usernameError || !desiredUsername || desiredUsername.length < 3 || checkUsernameQuery?.available === false)}
                        className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-500/25 transition-all hover:scale-105 active:scale-95 disabled:scale-100 disabled:shadow-none"
                    >
                        {step === steps.length - 1 ? (
                            <>
                                <span>Complete</span>
                                <CheckCircle size={18} />
                            </>
                        ) : (
                            <>
                                <span>{currentStep.isIdentityStep ? "Confirm Identity" : "Next"}</span>
                                <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};
