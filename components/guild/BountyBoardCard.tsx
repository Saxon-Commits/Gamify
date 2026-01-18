import React from 'react';
import { Scroll, Coins, Gem } from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';

interface BountyBoardCardProps {
    guildId: Id<"guilds">;
    isOfficer: boolean;
    onViewAll: () => void;
    onCreate: () => void;
}

export const BountyBoardCard: React.FC<BountyBoardCardProps> = ({ guildId, isOfficer, onViewAll, onCreate }) => {
    const bounties = useQuery(api.guilds.bounties.getByGuild, { guildId });

    const openBounties = bounties?.filter(b => b.status === "OPEN") || [];

    return (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 max-h-[400px] h-fit flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Scroll className="text-amber-400" size={20} />
                    Bounty Board
                </h3>
                {isOfficer && (
                    <button
                        onClick={onCreate}
                        className="text-xs font-bold text-amber-400 hover:text-amber-300"
                    >
                        + New
                    </button>
                )}
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-1 min-h-[100px]">
                {((!bounties) || openBounties.length === 0) ? (
                    <div className="flex flex-col items-center justify-center text-center p-6 bg-slate-900/30 rounded-lg border border-slate-700/30 border-dashed h-full">
                        <Scroll className="text-slate-600 mb-2" size={32} />
                        <p className="text-slate-500 text-sm font-medium">No Open Bounties</p>
                        <p className="text-slate-600 text-xs mt-1">Check back later for new tasks</p>
                    </div>
                ) : (
                    openBounties.map(b => (
                        <div key={b._id} className="bg-slate-900 border border-slate-700 rounded-lg p-3 hover:border-amber-500/30 transition-colors cursor-pointer" onClick={onViewAll}>
                            <h4 className="font-bold text-white text-sm mb-1 truncate">{b.title}</h4>
                            <div className="flex items-center space-x-3 text-xs">
                                {b.reward.gold > 0 && (
                                    <div className="flex items-center space-x-1 text-amber-400">
                                        <Coins size={12} /> <span>{b.reward.gold}</span>
                                    </div>
                                )}
                                {(b.reward.gems || 0) > 0 && (
                                    <div className="flex items-center space-x-1 text-purple-400">
                                        <Gem size={12} /> <span>{b.reward.gems}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            <button
                onClick={onViewAll}
                className="w-full mt-4 bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 hover:text-amber-300 py-2 rounded-lg text-xs font-bold transition-colors"
            >
                View All Bounties ({openBounties.length})
            </button>
        </div>
    );
};
