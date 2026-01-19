import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, ArrowLeft, CheckCircle, Coins, Gem, Trophy, Target, Shield, Info } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import { Id } from '../../convex/_generated/dataModel';

interface CreateProjectWizardProps {
    guildId: Id<"guilds">;
    treasury: { gold: number; gems: number };
    onClose: () => void;
    onCreate: (projectData: any) => Promise<void>;
}

type Step = 'details' | 'rewards' | 'review';

export const CreateProjectWizard: React.FC<CreateProjectWizardProps> = ({ guildId, treasury, onClose, onCreate }) => {
    const [step, setStep] = useState<Step>('details');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        targetTasks: 10,

        // Treasury / Rewards
        rewardType: 'FLAT' as 'FLAT' | 'RANKED',
        totalGold: 0,
        totalGems: 0,

        // Ranked breakdown (if RANKED)
        rankedGold: { first: 0, second: 0, third: 0 },
        rankedGems: { first: 0, second: 0, third: 0 },

        // Flat breakdown (if FLAT)
        flatGoldPerPerson: 0, // Not used directly in schema yet, usually we escrow a total. 
        // For now, let's stick to "Pot" logic: A total pot is escrowed.
        // If Flat: Everyone splits the pot or fixed amount? 
        // Existing schema has `rewards: { xp, gold, gems }` which implies flat reward PER PERSON usually?
        // OR `totalEscrowed`.
        // Let's assume "Pot" for now -> Validated against Treasury.
    });

    // Helper to switch steps
    const nextStep = () => {
        if (step === 'details') setStep('rewards');
        else if (step === 'rewards') setStep('review');
    };

    const prevStep = () => {
        if (step === 'rewards') setStep('details');
        else if (step === 'review') setStep('rewards');
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            // Construct payload matching Convex Schema
            const payload = {
                guildId,
                title: formData.title,
                description: formData.description,
                targetTasks: formData.targetTasks,

                // Rewards Configuration
                // If Ranked:
                rankedRewards: formData.rewardType === 'RANKED' ? {
                    firstPlace: { gold: formData.rankedGold.first, xp: 0, gems: formData.rankedGems.first },
                    secondPlace: { gold: formData.rankedGold.second, xp: 0, gems: formData.rankedGems.second },
                    thirdPlace: { gold: formData.rankedGold.third, xp: 0, gems: formData.rankedGems.third },
                } : undefined,

                // If Flat/Standard:
                rewards: formData.rewardType === 'FLAT' ? {
                    gold: formData.totalGold,
                    xp: 0,
                    gems: formData.totalGems
                } : { gold: 0, xp: 0, gems: 0 },
            };

            await onCreate(payload);
            onClose();
        } catch (e) {
            console.error(e);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Calculate Totals for Validation
    const calculateTotalCost = () => {
        if (formData.rewardType === 'RANKED') {
            return {
                gold: formData.rankedGold.first + formData.rankedGold.second + formData.rankedGold.third,
                gems: formData.rankedGems.first + formData.rankedGems.second + formData.rankedGems.third
            };
        } else {
            return {
                gold: formData.totalGold,
                gems: formData.totalGems
            };
        }
    };

    const totals = calculateTotalCost();
    const canAfford = totals.gold <= treasury.gold && totals.gems <= treasury.gems;

    return (
        <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
                {/* Header */}
                <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Target className="text-indigo-500" />
                            Draft Guild Project
                        </h2>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                            <span className={step === 'details' ? 'text-indigo-400 font-bold' : ''}>1. Manifesto</span>
                            <span className="text-slate-700">&rarr;</span>
                            <span className={step === 'rewards' ? 'text-indigo-400 font-bold' : ''}>2. Contract</span>
                            <span className="text-slate-700">&rarr;</span>
                            <span className={step === 'review' ? 'text-indigo-400 font-bold' : ''}>3. Review</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 p-8 overflow-y-auto">
                    {step === 'details' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-400 mb-2">Project Title</label>
                                <input
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-lg font-bold text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder="e.g. Castle Renovation"
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-400 mb-2">Detailed Briefing</label>
                                <textarea
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full h-32 bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                                    placeholder="Describe the objective, rules, and success criteria..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-400 mb-2">Target Tasks</label>
                                    <input
                                        type="number"
                                        value={formData.targetTasks}
                                        onChange={e => setFormData({ ...formData, targetTasks: parseInt(e.target.value) || 0 })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                    <p className="text-xs text-slate-500 mt-1">Total tasks required to complete.</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-400 mb-2">Difficulty</label>
                                    <select
                                        value={formData.difficulty}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                    >
                                        <option value="EASY">Easy</option>
                                        <option value="MEDIUM">Medium</option>
                                        <option value="HARD">Hard</option>
                                        <option value="EPIC">Epic</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 'rewards' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                            <div className="flex justify-between items-center bg-slate-950 p-4 rounded-xl border border-slate-800">
                                <div className="text-sm font-bold text-slate-400">Available Treasury</div>
                                <div className="flex gap-4">
                                    <div className="flex items-center gap-2 text-amber-400 font-bold">
                                        <Coins size={16} /> {treasury.gold}
                                    </div>
                                    <div className="flex items-center gap-2 text-cyan-400 font-bold">
                                        <Gem size={16} /> {treasury.gems}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="block text-sm font-bold text-white mb-2">Distribution Model</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => setFormData({ ...formData, rewardType: 'FLAT' })}
                                        className={`p-4 rounded-xl border-2 text-left transition-all ${formData.rewardType === 'FLAT' ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-800 bg-slate-950 hover:border-slate-700'}`}
                                    >
                                        <div className="font-bold text-white mb-1 flex items-center gap-2">
                                            <Shield size={16} /> Flat Pot
                                        </div>
                                        <p className="text-xs text-slate-400">Fixed reward distributed to contributors.</p>
                                    </button>
                                    <button
                                        onClick={() => setFormData({ ...formData, rewardType: 'RANKED' })}
                                        className={`p-4 rounded-xl border-2 text-left transition-all ${formData.rewardType === 'RANKED' ? 'border-purple-500 bg-purple-500/10' : 'border-slate-800 bg-slate-950 hover:border-slate-700'}`}
                                    >
                                        <div className="font-bold text-white mb-1 flex items-center gap-2">
                                            <Trophy size={16} /> Ranked
                                        </div>
                                        <p className="text-xs text-slate-400">1st, 2nd, 3rd place prizes for contests.</p>
                                    </button>
                                </div>
                            </div>

                            <hr className="border-slate-800" />

                            {formData.rewardType === 'FLAT' ? (
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-bold text-amber-400 mb-2">
                                            <Coins size={14} /> Total Gold Pot
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.totalGold}
                                            onChange={e => setFormData({ ...formData, totalGold: parseInt(e.target.value) || 0 })}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:ring-2 focus:ring-amber-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-bold text-cyan-400 mb-2">
                                            <Gem size={14} /> Total Gems Pot
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.totalGems}
                                            onChange={e => setFormData({ ...formData, totalGems: parseInt(e.target.value) || 0 })}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:ring-2 focus:ring-cyan-500 outline-none"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="bg-slate-950/50 p-4 rounded-xl border border-amber-500/20">
                                        <div className="text-xs font-bold text-amber-500 uppercase mb-3 flex items-center gap-2">
                                            <Trophy size={14} /> 1st Place
                                        </div>
                                        <div className="flex gap-4">
                                            <input
                                                type="number" placeholder="Gold"
                                                value={formData.rankedGold.first}
                                                onChange={e => setFormData({ ...formData, rankedGold: { ...formData.rankedGold, first: parseInt(e.target.value) || 0 } })}
                                                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white text-sm"
                                            />
                                            <input
                                                type="number" placeholder="Gems"
                                                value={formData.rankedGems.first}
                                                onChange={e => setFormData({ ...formData, rankedGems: { ...formData.rankedGems, first: parseInt(e.target.value) || 0 } })}
                                                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white text-sm"
                                            />
                                        </div>
                                    </div>
                                    <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                                        <div className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                                            2nd Place
                                        </div>
                                        <div className="flex gap-4">
                                            <input
                                                type="number" placeholder="Gold"
                                                value={formData.rankedGold.second}
                                                onChange={e => setFormData({ ...formData, rankedGold: { ...formData.rankedGold, second: parseInt(e.target.value) || 0 } })}
                                                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white text-sm"
                                            />
                                            <input
                                                type="number" placeholder="Gems"
                                                value={formData.rankedGems.second}
                                                onChange={e => setFormData({ ...formData, rankedGems: { ...formData.rankedGems, second: parseInt(e.target.value) || 0 } })}
                                                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white text-sm"
                                            />
                                        </div>
                                    </div>
                                    <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                                        <div className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                                            3rd Place
                                        </div>
                                        <div className="flex gap-4">
                                            <input
                                                type="number" placeholder="Gold"
                                                value={formData.rankedGold.third}
                                                onChange={e => setFormData({ ...formData, rankedGold: { ...formData.rankedGold, third: parseInt(e.target.value) || 0 } })}
                                                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white text-sm"
                                            />
                                            <input
                                                type="number" placeholder="Gems"
                                                value={formData.rankedGems.third}
                                                onChange={e => setFormData({ ...formData, rankedGems: { ...formData.rankedGems, third: parseInt(e.target.value) || 0 } })}
                                                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {!canAfford && (
                                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500 text-sm flex items-center gap-2">
                                    <Info size={16} />
                                    Insufficent Treasury Funds. Cost: {totals.gold} Gold, {totals.gems} Gems.
                                </div>
                            )}
                        </div>
                    )}

                    {step === 'review' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                            <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 space-y-4">
                                <h3 className="text-xl font-bold text-white border-b border-slate-800 pb-2">{formData.title}</h3>
                                <p className="text-slate-400 text-sm whitespace-pre-line">{formData.description || "No description provided."}</p>

                                <div className="flex gap-4 pt-2">
                                    <div className="bg-slate-900 px-3 py-1 rounded text-xs font-bold text-slate-300">
                                        {formData.targetTasks} Tasks Target
                                    </div>
                                    <div className="bg-slate-900 px-3 py-1 rounded text-xs font-bold text-slate-300">
                                        {formData.difficulty} Difficulty
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-950 p-6 rounded-xl border border-slate-800">
                                <h4 className="text-sm font-bold text-slate-500 uppercase mb-4">Contract Terms</h4>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-slate-400">Distribution</span>
                                    <span className="text-white font-bold">{formData.rewardType}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-400">Total Escrow</span>
                                    <div className="text-right">
                                        <div className="text-amber-400 font-bold">{totals.gold} Gold</div>
                                        {totals.gems > 0 && <div className="text-cyan-400 font-bold">{totals.gems} Gems</div>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-800 bg-slate-950 flex justify-between items-center">
                    {step !== 'details' ? (
                        <button onClick={prevStep} className="px-6 py-2 text-slate-400 hover:text-white font-bold transition-colors">
                            Back
                        </button>
                    ) : (
                        <div />
                    )}

                    {step === 'review' ? (
                        <button
                            onClick={handleSubmit}
                            disabled={!canAfford || isSubmitting}
                            className={`px-8 py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold transition-all flex items-center gap-2 ${(!canAfford || isSubmitting) ? 'opacity-50 cursor-not-allowed' : 'shadow-lg shadow-green-600/20'}`}
                        >
                            {isSubmitting ? 'Minting Project...' : 'Sign & Create Project'}
                            <CheckCircle size={18} />
                        </button>
                    ) : (
                        <button
                            onClick={nextStep}
                            disabled={!formData.title}
                            className={`px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-colors flex items-center gap-2 ${!formData.title ? 'opacity-50' : ''}`}
                        >
                            Next Step
                            <ArrowRight size={18} />
                        </button>
                    )}
                </div>
            </motion.div>
        </div>
    );
};
