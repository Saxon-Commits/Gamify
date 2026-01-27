import React from 'react';
import { Megaphone } from 'lucide-react';
import { OfferingCard } from './OfferingCard';
import type { Offering } from './OfferingCard';
import { OFFERINGS } from '../../src/utils/OfferingsData';

interface NoticeBoardProps {
    onOfferingClick?: (offering: Offering) => void;
}

export const NoticeBoard: React.FC<NoticeBoardProps> = ({ onOfferingClick }) => {
    return (
        <div className="w-full h-full min-h-[150px] flex flex-col rounded-xl">
            {/* Header */}
            <div className="flex items-center gap-2 mb-2">
                <div className="p-1 rounded bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                    <Megaphone size={12} />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                    Notice Board
                </span>
                <div className="h-[1px] flex-1 bg-slate-200 dark:bg-slate-800" />
            </div>

            {/* Two-column grid of offerings */}
            <div className="flex-1 grid grid-cols-2 gap-3 auto-rows-min">
                {OFFERINGS.map((offering) => (
                    <OfferingCard
                        key={offering.id}
                        offering={offering}
                        onClick={(off) => {
                            console.log('Offering clicked:', off);
                            onOfferingClick?.(off);
                        }}
                    />
                ))}
            </div>
        </div>
    );
};
