import React from 'react';
import { Minus, Plus } from 'lucide-react';

interface HabitPillProps {
    count: number;
    onIncrement: () => void;
    onDecrement: () => void;
}

export const HabitPill: React.FC<HabitPillProps> = ({ count, onIncrement, onDecrement }) => {
    const playIncrementSound = () => {
        const audio = new Audio('/audio/unlock_node.wav');
        audio.volume = 0.5;
        audio.play().catch(err => console.log('Audio play failed:', err));
    };

    const playDecrementSound = () => {
        const audio = new Audio('/mixkit-negative-tone-interface-tap-2569.wav');
        audio.volume = 0.5;
        audio.play().catch(err => console.log('Audio play failed:', err));
    };

    return (
        <div
            className="flex items-center gap-1 bg-emerald-600/80 dark:bg-emerald-700/80 border border-emerald-500/90 dark:border-emerald-600/90 rounded-full px-2 py-1 shadow-md backdrop-blur-sm"
            onClick={(e) => e.stopPropagation()}
        >
            {/* Decrement Button */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    playDecrementSound();
                    onDecrement();
                }}
                disabled={count <= 0}
                className="w-3.5 h-3.5 flex items-center justify-center rounded-full bg-white/85 dark:bg-slate-900/85 text-emerald-700 dark:text-emerald-400 hover:bg-white dark:hover:bg-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                title="Decrement"
            >
                <Minus size={8} className="stroke-[3]" />
            </button>

            {/* Count Display */}
            <span className="text-xs font-bold text-white dark:text-white min-w-[16px] text-center px-0.5">
                {count}
            </span>

            {/* Increment Button */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    playIncrementSound();
                    onIncrement();
                }}
                className="w-3.5 h-3.5 flex items-center justify-center rounded-full bg-white/85 dark:bg-slate-900/85 text-emerald-700 dark:text-emerald-400 hover:bg-white dark:hover:bg-slate-900 transition-all"
                title="Increment"
            >
                <Plus size={8} className="stroke-[3]" />
            </button>
        </div>
    );
};
