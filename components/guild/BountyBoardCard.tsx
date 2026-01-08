import React from 'react';
import { Scroll } from 'lucide-react';

interface BountyBoardCardProps {
    isOfficer: boolean;
}

export const BountyBoardCard: React.FC<BountyBoardCardProps> = ({ isOfficer }) => {
    return (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 max-h-[600px] h-fit flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Scroll className="text-amber-400" size={20} />
                    Bounty Board
                </h3>
                {isOfficer && (
                    <button
                        onClick={() => alert("Bounty System Coming Soon!")}
                        className="text-xs font-bold text-amber-400 hover:text-amber-300"
                    >
                        + New
                    </button>
                )}
            </div>
            <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-1">
                {/* Placeholder - replace with actual bounty data later */}
                <div className="flex flex-col items-center justify-center text-center p-6 bg-slate-900/30 rounded-lg border border-slate-700/30 border-dashed">
                    <Scroll className="text-slate-600 mb-2" size={32} />
                    <p className="text-slate-500 text-sm font-medium">No active bounties</p>
                    <p className="text-slate-600 text-xs mt-1">Check back later for new guild tasks</p>
                </div>
            </div>
            <button className="w-full mt-4 bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 hover:text-amber-300 py-2 rounded-lg text-xs font-bold transition-colors">
                View All Bounties
            </button>
        </div>
    );
};
