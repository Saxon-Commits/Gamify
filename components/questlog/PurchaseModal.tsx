import React from 'react';
import { X, Coins, Sparkles, TrendingUp } from 'lucide-react';
import type { Offering } from './OfferingCard';
import { motion, AnimatePresence } from 'framer-motion';

interface PurchaseModalProps {
    offering: Offering | null;
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (offering: Offering) => void;
    currentGold: number;
}

export const PurchaseModal: React.FC<PurchaseModalProps> = ({
    offering,
    isOpen,
    onClose,
    onConfirm,
    currentGold
}) => {
    if (!offering) return null;

    const canAfford = currentGold >= offering.price;
    const isHabit = offering.category === 'habit';

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
                            <h3 className="font-bold text-lg text-slate-700 dark:text-slate-200">Bounty Acquisition</h3>
                            <button
                                onClick={onClose}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Merchant and Speech Bubble Section */}
                            <div className="flex gap-4 items-start">
                                {/* Merchant Character */}
                                <div className="flex-shrink-0">
                                    <div className="w-32 h-32 rounded-lg overflow-hidden bg-gradient-to-br from-purple-400 to-indigo-500 shadow-lg">
                                        <video
                                            src="/avatars/merchant/idle.mp4"
                                            autoPlay
                                            loop
                                            muted
                                            playsInline
                                            className="w-full h-full object-cover"
                                            style={{ transform: 'scale(1.5)' }}
                                        />
                                    </div>
                                    <p className="text-center text-xs font-bold text-slate-600 dark:text-slate-400 mt-2">
                                        Wandering Merchant
                                    </p>
                                </div>

                                {/* Speech Bubble */}
                                <div className="flex-1 relative">
                                    <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-4 relative before:content-[''] before:absolute before:left-[-10px] before:top-6 before:w-0 before:h-0 before:border-t-[10px] before:border-t-transparent before:border-r-[10px] before:border-r-slate-100 dark:before:border-r-slate-800 before:border-b-[10px] before:border-b-transparent">
                                        <p className="text-sm text-slate-700 dark:text-slate-300 italic leading-relaxed">
                                            "{offering.benefits}"
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Offering Details */}
                            <div className="space-y-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h4 className={`text-xl font-bold mb-2 ${isHabit
                                            ? 'text-emerald-700 dark:text-emerald-300'
                                            : 'text-slate-700 dark:text-slate-300'
                                            }`}>
                                            {offering.title}
                                        </h4>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                            {offering.description}
                                        </p>
                                    </div>
                                    <span className={`ml-4 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border ${isHabit
                                        ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700'
                                        : 'bg-slate-100 dark:bg-slate-900/40 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700'
                                        }`}>
                                        {offering.category}
                                    </span>
                                </div>

                                {/* Cost and Rewards */}
                                <div className="grid grid-cols-2 gap-4">
                                    {/* Cost */}
                                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                                        <p className="text-xs font-bold text-amber-700 dark:text-amber-400 mb-2">COST</p>
                                        <div className="flex items-center gap-2">
                                            <Coins size={20} className="text-amber-600 dark:text-amber-400" />
                                            <span className="text-lg font-bold text-amber-700 dark:text-amber-300">
                                                {offering.price} Gold
                                            </span>
                                        </div>
                                    </div>

                                    {/* Rewards */}
                                    <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-3">
                                        <p className="text-xs font-bold text-indigo-700 dark:text-indigo-400 mb-2">REWARDS</p>
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-1">
                                                <Sparkles size={16} className="text-indigo-600 dark:text-indigo-400" />
                                                <span className="text-sm font-bold text-indigo-700 dark:text-indigo-300">
                                                    {offering.rewards.xp} XP
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Coins size={16} className="text-amber-600 dark:text-amber-400" />
                                                <span className="text-sm font-bold text-amber-700 dark:text-amber-300">
                                                    {offering.rewards.gold}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Gold Balance Warning */}
                                {!canAfford && (
                                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-center gap-2">
                                        <TrendingUp size={16} className="text-red-600 dark:text-red-400" />
                                        <p className="text-sm font-medium text-red-700 dark:text-red-300">
                                            Insufficient gold! You need {offering.price - currentGold} more gold.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={onClose}
                                    className="flex-1 px-4 py-3 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        if (canAfford) {
                                            onConfirm(offering);
                                        }
                                    }}
                                    disabled={!canAfford}
                                    className={`flex-1 px-4 py-3 rounded-lg font-bold transition-all ${canAfford
                                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/30'
                                        : 'bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed opacity-50'
                                        }`}
                                >
                                    Confirm Bounty Acquisition
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
