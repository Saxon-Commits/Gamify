import React, { useState } from 'react';
import { Shield, CheckCircle } from 'lucide-react';
import { useSettingsStore } from '../store/useSettingsStore';

export const HonorPledgeModal: React.FC = () => {
    const { honorSystemAgreed, confirmHonorPledge } = useSettingsStore();
    const [step, setStep] = useState(1);

    if (honorSystemAgreed) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-6">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-8 shadow-2xl relative overflow-hidden">
                {/* Background FX */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                <div className="relative z-10 text-center space-y-6">
                    <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto border border-slate-700 shadow-inner">
                        {step === 1 ? <Shield size={32} className="text-amber-400" /> : <CheckCircle size={32} className="text-green-400" />}
                    </div>

                    <div>
                        <h2 className="text-2xl font-black text-white tracking-tight">
                            {step === 1 ? 'SYSTEM INITIALIZATION' : 'ACCESS GRANTED'}
                        </h2>
                        <p className="text-slate-400 text-sm mt-2 leading-relaxed">
                            {step === 1
                                ? "You are about to interface with the Life RPG system. This network relies on absolute data integrity from its operator (You)."
                                : "Protocol initialized. Your journey is recorded on the blockchain of your own conscience."}
                        </p>
                    </div>

                    {step === 1 && (
                        <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 text-left space-y-3">
                            <div className="flex gap-3">
                                <div className="w-1 h-full bg-amber-500 rounded-full" />
                                <p className="text-xs text-slate-300 italic">"I pledge to only mark tasks as complete when I have truly done the work."</p>
                            </div>
                            <div className="flex gap-3">
                                <div className="w-1 h-full bg-indigo-500 rounded-full" />
                                <p className="text-xs text-slate-300 italic">"I understand that cheating the system is only cheating my own potential."</p>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={() => {
                            if (step === 1) setStep(2);
                            else confirmHonorPledge();
                        }}
                        className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl uppercase tracking-widest shadow-lg shadow-indigo-500/25 transition-all active:scale-95"
                    >
                        {step === 1 ? 'I Accept the Creed' : 'Enter System'}
                    </button>
                </div>
            </div>
        </div>
    );
};
