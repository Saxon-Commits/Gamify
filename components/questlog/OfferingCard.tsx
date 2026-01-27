import React from 'react';
import { Scroll, Coins } from 'lucide-react';

interface Offering {
    id: string;
    title: string;
    description: string;
    category: 'habit' | 'todo';
    price: number;
    rewards: {
        gold: number;
        xp: number;
    };
    benefits: string;
    imageUrl?: string;
}

interface OfferingCardProps {
    offering: Offering;
    onClick: (offering: Offering) => void;
}

export const OfferingCard: React.FC<OfferingCardProps> = ({ offering, onClick }) => {
    const isHabit = offering.category === 'habit';

    return (
        <button
            onClick={() => onClick(offering)}
            className={`
        aspect-square w-full rounded-xl border-2 transition-all duration-300 relative overflow-hidden
        ${isHabit
                    ? 'border-emerald-200 dark:border-emerald-800 hover:border-emerald-400 dark:hover:border-emerald-600 hover:shadow-emerald-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600 hover:shadow-slate-500/20'
                }
        hover:shadow-lg hover:scale-105 active:scale-95
        flex flex-col items-center justify-center p-3 gap-2
        group cursor-pointer
      `}
            style={{
                backgroundImage: offering.imageUrl ? `url('${offering.imageUrl}')` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
            }}
        >
            {/* Dark overlay for text readability */}
            {offering.imageUrl && (
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
            )}

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center gap-2">
                {/* Icon or Image */}
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center backdrop-blur-sm ${isHabit
                    ? 'bg-emerald-200/80 dark:bg-emerald-800/80'
                    : 'bg-slate-200/80 dark:bg-slate-800/80'
                    }`}>
                    <Scroll size={24} className={isHabit
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-slate-600 dark:text-slate-400'
                    } />
                </div>

                {/* Title */}
                <h4 className="text-xs font-bold text-center leading-tight line-clamp-2 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                    {offering.title}
                </h4>

                {/* Category Badge */}
                <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border backdrop-blur-sm ${isHabit
                    ? 'bg-emerald-100/90 dark:bg-emerald-900/80 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                    : 'bg-slate-100/90 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                    }`}>
                    {offering.category}
                </span>
            </div>

            {/* Price Badge - Repositioned to bottom-left */}
            <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-amber-600 dark:bg-amber-700 border-2 border-amber-500 dark:border-amber-600 rounded-full px-2.5 py-1 shadow-lg z-20">
                <Coins size={12} className="text-white dark:text-white" />
                <span className="text-xs font-bold text-white dark:text-white">{offering.price}</span>
            </div>

            {/* Purchase Hint on Hover */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center z-20">
                <span className="text-white text-xs font-bold drop-shadow-lg">Click to Purchase</span>
            </div>
        </button>
    );
};

export type { Offering };
