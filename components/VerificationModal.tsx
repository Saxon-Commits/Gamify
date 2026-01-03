import React, { useState } from 'react';
import { Shield, ExternalLink, CheckCircle2, AlertCircle, X, Lock } from 'lucide-react';
import { SkillNodeData } from '../types';

interface VerificationModalProps {
    node: { id: string; data: SkillNodeData };
    onClose: () => void;
    onVerify: (evidence: string | number) => void;
    canAfford: boolean;
}

export const VerificationModal: React.FC<VerificationModalProps> = ({ node, onClose, onVerify, canAfford }) => {
    const [inputValue, setInputValue] = useState('');
    const [error, setError] = useState<string | null>(null);

    const { verificationType = 'HONOR_SYSTEM', verificationPrompt, verificationCriteria } = node.data;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (verificationType === 'INPUT_VALUE') {
            const numVal = parseFloat(inputValue);
            if (isNaN(numVal)) {
                setError('Please enter a valid number.');
                return;
            }
            if (verificationCriteria?.min && numVal < verificationCriteria.min) {
                setError(`Value must be at least ${verificationCriteria.min}.`);
                return;
            }
            if (verificationCriteria?.max && numVal > verificationCriteria.max) {
                setError(`Value must be under ${verificationCriteria.max}.`);
                return;
            }
            onVerify(numVal);
        }
        else if (verificationType === 'LINK_SUBMISSION') {
            // Basic URL regex
            const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
            if (!urlPattern.test(inputValue)) {
                setError('Please enter a valid URL (e.g., https://github.com/...)');
                return;
            }
            if (verificationCriteria?.regex && !new RegExp(verificationCriteria.regex).test(inputValue)) {
                setError('Link does not match the required format.');
                return;
            }
            onVerify(inputValue);
        }
        else {
            // Honor System
            onVerify('Honor System Verified');
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden">

                {/* Header */}
                <div className="p-6 pb-4 border-b border-slate-800 flex justify-between items-start bg-slate-950/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20 text-indigo-400">
                            <Shield size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white leading-tight">Proof of Mastery</h3>
                            <p className="text-xs text-slate-500 font-mono mt-1">PROTOCOL: {verificationType.replace('_', ' ')}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Prompt */}
                    <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
                        <p className="text-slate-300 font-medium text-sm">
                            {verificationPrompt || "Confirm that you have satisfied the prerequisites for this skill."}
                        </p>
                    </div>

                    {/* Input Forms */}
                    <form onSubmit={handleSubmit} className="space-y-4">

                        {verificationType === 'HONOR_SYSTEM' && (
                            <label className="flex items-start gap-3 p-4 border border-slate-700 rounded-xl cursor-pointer hover:bg-slate-800/50 transition-colors group">
                                <input type="checkbox" required className="mt-1 w-4 h-4 rounded border-slate-600 bg-slate-800 text-indigo-600 focus:ring-indigo-500" />
                                <div className="text-sm">
                                    <span className="font-bold text-slate-200 block mb-1">I solemnly swear...</span>
                                    <span className="text-slate-500 group-hover:text-slate-400 transition-colors">I have completed the requirements in the real world.</span>
                                </div>
                            </label>
                        )}

                        {verificationType === 'INPUT_VALUE' && (
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                    Enter Value {verificationCriteria?.min ? `(Min: ${verificationCriteria.min})` : ''} {verificationCriteria?.max ? `(Max: ${verificationCriteria.max})` : ''}
                                </label>
                                <input
                                    type="number"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-mono text-lg"
                                    autoFocus
                                />
                            </div>
                        )}

                        {verificationType === 'LINK_SUBMISSION' && (
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                    Evidence URL
                                </label>
                                <div className="relative">
                                    <ExternalLink size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                    <input
                                        type="text"
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        placeholder="https://"
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
                                        autoFocus
                                    />
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="flex items-center gap-2 text-red-400 text-xs bg-red-950/30 p-3 rounded-lg border border-red-900/50 animate-pulse">
                                <AlertCircle size={14} />
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-bold text-xs uppercase tracking-wider transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={!canAfford}
                                className={`
                        flex-[2] px-4 py-3 rounded-lg font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all
                        ${canAfford ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25' : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50'}
                    `}
                            >
                                {!canAfford ? (
                                    <>
                                        <Lock size={14} />
                                        <span>Insufficient Funds</span>
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 size={14} />
                                        <span>Verify & Unlock</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

            </div>
        </div>
    );
};
