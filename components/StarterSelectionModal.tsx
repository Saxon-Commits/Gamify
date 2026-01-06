import React from 'react';
import { STARTER_AVATARS } from '../src/utils/CosmeticsData';
import { useGameStore } from '../store/useGameStore';
import { Sparkles, CheckCircle2 } from 'lucide-react';

interface StarterSelectionModalProps {
    onComplete: () => void;
}

export const StarterSelectionModal: React.FC<StarterSelectionModalProps> = ({ onComplete }) => {
    const { setAvatar, unlockNode } = useGameStore();
    const [selectedId, setSelectedId] = React.useState<string | null>(null);

    const handleConfirm = () => {
        if (!selectedId) return;
        setAvatar(selectedId);
        onComplete();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
            <div className="w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden shadow-2xl relative">

                {/* Header */}
                <div className="p-8 text-center border-b border-slate-800 bg-slate-950/50">
                    <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-wider flex items-center justify-center gap-3">
                        <Sparkles className="w-8 h-8 text-amber-400" />
                        Choose Your Hero
                        <Sparkles className="w-8 h-8 text-amber-400" />
                    </h2>
                    <p className="text-slate-400">Select an avatar to begin your journey. You can change this later.</p>
                </div>

                {/* Grid */}
                <div className="p-8 grid grid-cols-2 md:grid-cols-5 gap-6 max-h-[60vh] overflow-y-auto">
                    {STARTER_AVATARS.map((avatar) => {
                        const isSelected = selectedId === avatar.id;
                        return (
                            <button
                                key={avatar.id}
                                onClick={() => setSelectedId(avatar.id)}
                                className={`group relative aspect-square rounded-2xl overflow-hidden transition-all duration-300 ${isSelected
                                        ? 'ring-4 ring-amber-500 scale-105 shadow-[0_0_20px_rgba(245,158,11,0.5)]'
                                        : 'ring-1 ring-slate-700 hover:ring-slate-500 hover:scale-105'
                                    }`}
                            >
                                <img
                                    src={avatar.imageUrl}
                                    alt={avatar.name}
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/80 to-transparent p-4 pt-12 text-center">
                                    <span className={`text-sm font-bold uppercase tracking-wide ${isSelected ? 'text-amber-400' : 'text-white'}`}>
                                        {avatar.name}
                                    </span>
                                </div>
                                {isSelected && (
                                    <div className="absolute top-2 right-2 bg-amber-500 text-black rounded-full p-1 shadow-lg">
                                        <CheckCircle2 className="w-4 h-4" />
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-800 bg-slate-950/50 flex justify-center">
                    <button
                        onClick={handleConfirm}
                        disabled={!selectedId}
                        className={`px-12 py-4 rounded-xl font-bold uppercase tracking-widest text-lg transition-all duration-300 ${selectedId
                                ? 'bg-amber-500 text-black hover:bg-amber-400 hover:scale-105 shadow-lg shadow-amber-500/20'
                                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            }`}
                    >
                        Begin Adventure
                    </button>
                </div>
            </div>
        </div>
    );
};
