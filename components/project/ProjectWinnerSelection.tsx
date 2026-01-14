import React, { useState } from 'react';
import { Trophy, Medal, User, CheckCircle } from 'lucide-react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';

interface ProjectWinnerSelectionProps {
    project: any;
    contributors: any[]; // List of potential winners (joined users)
    onClose: () => void;
    onAward: () => void;
}

export const ProjectWinnerSelection: React.FC<ProjectWinnerSelectionProps> = ({ project, contributors, onClose, onAward }) => {
    const [firstPlace, setFirstPlace] = useState<string>('');
    const [secondPlace, setSecondPlace] = useState<string>('');
    const [thirdPlace, setThirdPlace] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const awardWinners = useMutation(api.guilds.awardContestWinners);

    const handleAward = async () => {
        if (!firstPlace) return; // At least 1st place required?
        setIsSubmitting(true);
        try {
            await awardWinners({
                projectId: project._id,
                firstPlaceUserId: firstPlace as Id<"users">,
                secondPlaceUserId: secondPlace ? secondPlace as Id<"users"> : undefined,
                thirdPlaceUserId: thirdPlace ? thirdPlace as Id<"users"> : undefined,
            });
            onAward();
            onClose();
        } catch (e) {
            console.error("Failed to award winners:", e);
            alert("Failed to award winners. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const eligibleUsers = contributors.filter(c => c.userId !== project.creatorId || true); // Allow creator to win? Maybe.

    return (
        <div className="fixed inset-0 z-[200] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-slate-800 bg-slate-900">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Trophy className="text-amber-400" />
                        Select Winners
                    </h3>
                    <p className="text-sm text-slate-400 mt-1">
                        Choose the top contributors to receive the ranked rewards.
                        Escrowed funds will be transferred immediately.
                    </p>
                </div>

                <div className="p-6 space-y-6">
                    {/* 1st Place */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-amber-500 uppercase flex items-center gap-2">
                            <Trophy size={14} /> 1st Place
                            <span className="text-slate-500 font-normal normal-case ml-auto">
                                Pays: {project.rankedRewards?.firstPlace?.gold || 0}g, {project.rankedRewards?.firstPlace?.gems || 0} gems
                            </span>
                        </label>
                        <select
                            value={firstPlace}
                            onChange={(e) => setFirstPlace(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-amber-500"
                        >
                            <option value="">Select Winner...</option>
                            {eligibleUsers.map(u => (
                                <option key={u.userId} value={u.userId}>{u.userName || u.name || "Unknown User"}</option>
                            ))}
                        </select>
                    </div>

                    {/* 2nd Place */}
                    {project.rankedRewards?.secondPlace && (
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                                <Medal size={14} /> 2nd Place
                                <span className="text-slate-500 font-normal normal-case ml-auto">
                                    Pays: {project.rankedRewards.secondPlace.gold || 0}g, {project.rankedRewards.secondPlace.gems || 0} gems
                                </span>
                            </label>
                            <select
                                value={secondPlace}
                                onChange={(e) => setSecondPlace(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-slate-500"
                            >
                                <option value="">Select Runner-up (Optional)...</option>
                                {eligibleUsers.filter(u => u.userId !== firstPlace).map(u => (
                                    <option key={u.userId} value={u.userId}>{u.userName || u.name || "Unknown User"}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* 3rd Place */}
                    {project.rankedRewards?.thirdPlace && (
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-amber-700 uppercase flex items-center gap-2">
                                <Medal size={14} /> 3rd Place
                                <span className="text-slate-500 font-normal normal-case ml-auto">
                                    Pays: {project.rankedRewards.thirdPlace.gold || 0}g, {project.rankedRewards.thirdPlace.gems || 0} gems
                                </span>
                            </label>
                            <select
                                value={thirdPlace}
                                onChange={(e) => setThirdPlace(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-amber-800"
                            >
                                <option value="">Select 3rd Place (Optional)...</option>
                                {eligibleUsers.filter(u => u.userId !== firstPlace && u.userId !== secondPlace).map(u => (
                                    <option key={u.userId} value={u.userId}>{u.userName || u.name || "Unknown User"}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-slate-800 bg-slate-900/50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleAward}
                        disabled={!firstPlace || isSubmitting}
                        className="px-6 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold rounded-lg shadow-lg shadow-orange-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isSubmitting ? 'Awarding...' : (
                            <>
                                <CheckCircle size={18} />
                                Award Prizes
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
