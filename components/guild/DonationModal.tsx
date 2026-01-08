import React, { useState } from 'react';
import { Trophy } from 'lucide-react';

interface DonationModalProps {
    isOpen: boolean;
    onClose: () => void;
    userGold: number;
    userGems: number;
    onDonate: (amount: number, currency: 'gold' | 'gems') => Promise<void>;
}

export const DonationModal: React.FC<DonationModalProps> = ({ isOpen, onClose, userGold, userGems, onDonate }) => {
    const [amount, setAmount] = useState<string>('');
    const [currency, setCurrency] = useState<'gold' | 'gems'>('gold');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const val = parseInt(amount);
        if (isNaN(val) || val <= 0) return;

        setIsSubmitting(true);
        try {
            await onDonate(val, currency);
            onClose();
            setAmount('');
        } catch (err) {
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const maxAmount = currency === 'gold' ? userGold : userGems;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="bg-gradient-to-r from-amber-600/20 to-amber-900/20 p-6 border-b border-amber-500/20">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Trophy className="text-amber-400" />
                        Donate to Treasury
                    </h3>
                    <p className="text-slate-400 text-sm mt-1">Support your guild to unlock future perks!</p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="flex gap-2 bg-slate-900 p-1 rounded-lg">
                        <button
                            type="button"
                            onClick={() => setCurrency('gold')}
                            className={`flex-1 py-2 rounded-md font-bold text-sm transition-colors ${currency === 'gold' ? 'bg-amber-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                        >
                            Gold
                        </button>
                        <button
                            type="button"
                            onClick={() => setCurrency('gems')}
                            className={`flex-1 py-2 rounded-md font-bold text-sm transition-colors ${currency === 'gems' ? 'bg-cyan-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                        >
                            Gems
                        </button>
                    </div>

                    <div>
                        <div className="flex justify-between text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">
                            <span>Amount</span>
                            <span>Max: {maxAmount}</span>
                        </div>
                        <div className="relative">
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                min={1}
                                max={maxAmount}
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white font-mono text-lg focus:outline-none focus:border-indigo-500"
                                placeholder="0"
                                autoFocus
                            />
                            <button
                                type="button"
                                onClick={() => setAmount(maxAmount.toString())}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-indigo-400 hover:text-white bg-indigo-500/10 px-2 py-1 rounded"
                            >
                                MAX
                            </button>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!amount || parseInt(amount) <= 0 || parseInt(amount) > maxAmount || isSubmitting}
                            className={`flex-1 font-bold py-3 rounded-xl text-white transition-all shadow-lg ${currency === 'gold' ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500' : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500'} disabled:opacity-50 disabled:shadow-none`}
                        >
                            {isSubmitting ? 'Donating...' : 'Donate'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
