import React from 'react';
import { Sparkles } from 'lucide-react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { canEvolveCompanion } from '../../src/utils/CompanionEvolutions';
import { useGameStore } from '../../store/useGameStore';

export const UpgradeCompanionButton: React.FC = () => {
    const { stats } = useGameStore();
    const activeCompanionId = stats.activeAccessoryId || stats.activeCompanionId;

    const evolveCompanion = useMutation(api.companions.evolveCompanion);
    const isEvolved = useQuery(api.companions.isCompanionEvolved,
        activeCompanionId ? { companionId: activeCompanionId } : "skip"
    );

    // Don't show button if no companion equipped or companion can't evolve
    if (!activeCompanionId || !canEvolveCompanion(activeCompanionId)) {
        return null;
    }

    const handleEvolve = async () => {
        if (!activeCompanionId) return;

        try {
            const result = await evolveCompanion({ companionId: activeCompanionId });
            if (result.success) {
                // Force a page refresh to update the companion image
                window.location.reload();
            }
        } catch (error) {
            console.error('Failed to evolve companion:', error);
        }
    };

    return (
        <button
            onClick={handleEvolve}
            disabled={isEvolved}
            className={`
                w-full max-w-[440px] mx-auto mt-4 px-6 py-3 rounded-xl font-bold text-sm
                transition-all duration-300 flex items-center justify-center gap-2
                ${isEvolved
                    ? 'bg-emerald-600 text-white cursor-default'
                    : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500 hover:scale-105 shadow-lg hover:shadow-xl'
                }
            `}
        >
            {isEvolved ? (
                <>
                    <Sparkles size={18} className="text-yellow-300" />
                    Evolved
                </>
            ) : (
                <>
                    <Sparkles size={18} />
                    Upgrade Companion
                </>
            )}
        </button>
    );
};
