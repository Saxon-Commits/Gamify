import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { Plus, Coins, Gem, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
import { CreateBountyModal } from './CreateBountyModal';
import { useGameStore } from '../../store/useGameStore';
import { useToastStore } from '../../store/useToastStore';

interface GuildBountyBoardProps {
    guildId: Id<"guilds">;
    role: 'leader' | 'officer' | 'member';
    userId: string; // The Convex ID or User ID needed for checks
    treasury: { gold: number; gems: number };
}

export const GuildBountyBoard: React.FC<GuildBountyBoardProps> = ({ guildId, role, userId, treasury }) => {
    const bounties = useQuery(api.guilds.bounties.getByGuild, { guildId });
    const claimBounty = useMutation(api.guilds.bounties.claim);
    const submitBounty = useMutation(api.guilds.bounties.submit);
    const approveBounty = useMutation(api.guilds.bounties.approve);
    const denyBounty = useMutation(api.guilds.bounties.deny);
    const cancelBounty = useMutation(api.guilds.bounties.cancel);
    const dropBounty = useMutation(api.guilds.bounties.drop);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [submitProofId, setSubmitProofId] = useState<Id<"guildBounties"> | null>(null);
    const [proofText, setProofText] = useState('');

    const addToast = useToastStore(state => state.addToast);
    // Use getState inside the handler to ensure fresh state if accessed, though here strict state access isn't critical for dispatching actions
    // But we need to call the actions.

    const isOfficer = role === 'leader' || role === 'officer';

    const handleClaim = async (bountyId: Id<"guildBounties">) => {
        try { await claimBounty({ bountyId }); } catch (e) { console.error(e); }
    };

    const handleSubmit = async (bountyId: Id<"guildBounties">) => {
        try {
            await submitBounty({ bountyId, proof: proofText });
            setSubmitProofId(null);
            setProofText('');
        } catch (e) { console.error(e); }
    };

    const handleApprove = async (bountyId: Id<"guildBounties">) => {
        const bounty = bounties?.find(b => b._id === bountyId);
        if (!bounty) return;

        if (confirm("Approve this bounty and transfer rewards?")) {
            try {
                await approveBounty({ bountyId });

                // If I approved my own bounty (or generally want to notify)
                // Note: user.id might be different than userId passed here?
                // The `userId` prop is passed from Guild.tsx as `membership.userId` which IS the convex ID.
                if (bounty.claimedBy === userId) {
                    // Update Local State immediately
                    useGameStore.getState().addGold(bounty.reward.gold);
                    if (bounty.reward.gems) useGameStore.getState().addGems(bounty.reward.gems);

                    addToast({
                        type: 'reward',
                        message: `Bounty Completed! +${bounty.reward.gold} Gold${bounty.reward.gems ? ` +${bounty.reward.gems} Gems` : ''}`,
                        amount: bounty.reward.gold
                    });
                } else {
                    addToast({
                        type: 'success',
                        message: `Bounty Approved`,
                        amount: 0
                    });
                }
            } catch (e: any) {
                console.error(e);
                addToast({ type: 'error', message: e.message || 'Failed to approve', amount: 0 });
            }
        }
    };

    const handleDeny = async (bountyId: Id<"guildBounties">) => {
        if (confirm("Deny this submission? It will be set back to Claimed status.")) {
            try { await denyBounty({ bountyId }); } catch (e) { console.error(e); }
        }
    };

    const handleCancel = async (bountyId: Id<"guildBounties">) => {
        if (confirm("Cancel this bounty and refund the treasury?")) {
            try { await cancelBounty({ bountyId }); } catch (e) { console.error(e); }
        }
    };

    const handleDrop = async (bountyId: Id<"guildBounties">) => {
        if (confirm("Drop this claim?")) {
            try { await dropBounty({ bountyId }); } catch (e) { console.error(e); }
        }
    };

    if (!bounties) return <div className="text-slate-400 p-8 text-center">Loading Board...</div>;

    const sections = {
        OPEN: bounties.filter(b => b.status === 'OPEN'),
        MY_CLAIMS: bounties.filter(b => b.status === 'CLAIMED' && b.claimedBy === userId),
        REVIEW: bounties.filter(b => b.status === 'SUBMITTED'),
        COMPLETED: bounties.filter(b => b.status === 'COMPLETED').slice(0, 5) // Recent
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold font-serif text-amber-500">Bounty Board</h2>
                {isOfficer && (
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex items-center space-x-2 bg-amber-500/20 text-amber-500 px-4 py-2 rounded-lg hover:bg-amber-500/30 transition-colors"
                    >
                        <Plus size={18} />
                        <span>Create Bounty</span>
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* OPEN BOUNTIES */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-2">
                        <AlertCircle size={16} /> <span>Available</span>
                    </h3>
                    {sections.OPEN.length === 0 && <p className="text-slate-500 italic">No available bounties.</p>}
                    {sections.OPEN.map(b => (
                        <div key={b._id} className="bg-slate-900 border border-slate-700 rounded-xl p-4 relative group hover:border-amber-500/50 transition-colors">
                            {isOfficer && (
                                <button
                                    onClick={() => handleCancel(b._id)}
                                    className="absolute top-2 right-2 text-slate-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="Cancel Bounty"
                                >
                                    <XCircle size={16} />
                                </button>
                            )}
                            <h4 className="font-bold text-white mb-1">{b.title}</h4>
                            <p className="text-slate-400 text-sm mb-3 line-clamp-2">{b.description}</p>

                            <div className="flex items-center justify-between mt-4">
                                <div className="flex items-center space-x-3 text-sm">
                                    {b.reward.gold > 0 && (
                                        <div className="flex items-center space-x-1 text-amber-400">
                                            <Coins size={14} /> <span>{b.reward.gold}</span>
                                        </div>
                                    )}
                                    {(b.reward.gems || 0) > 0 && (
                                        <div className="flex items-center space-x-1 text-purple-400">
                                            <Gem size={14} /> <span>{b.reward.gems}</span>
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={() => handleClaim(b._id)}
                                    className="bg-slate-800 text-slate-300 text-xs px-3 py-1.5 rounded-lg hover:bg-amber-500 hover:text-slate-900 transition-colors"
                                >
                                    Claim
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* MY ACTIVE CLAIMS */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-2">
                        <Clock size={16} /> <span>In Progress</span>
                    </h3>
                    {sections.MY_CLAIMS.length === 0 && <p className="text-slate-500 italic">You have no active claims.</p>}
                    {sections.MY_CLAIMS.map(b => (
                        <div key={b._id} className="bg-slate-800/50 border border-slate-600 rounded-xl p-4">
                            <h4 className="font-bold text-white mb-1">{b.title}</h4>
                            <p className="text-slate-400 text-sm mb-4">{b.description}</p>

                            {submitProofId === b._id ? (
                                <div className="space-y-2 animate-in fade-in">
                                    <textarea
                                        value={proofText}
                                        onChange={e => setProofText(e.target.value)}
                                        placeholder="Proof of completion (Link or note)..."
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                                        autoFocus
                                    />
                                    <div className="flex justify-end space-x-2">
                                        <button
                                            onClick={() => setSubmitProofId(null)}
                                            className="text-xs text-slate-400 hover:text-white"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={() => handleSubmit(b._id)}
                                            className="bg-green-600 text-white text-xs px-3 py-1 rounded hover:bg-green-500"
                                        >
                                            Submit
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex justify-between items-center">
                                    <button
                                        onClick={() => handleDrop(b._id)}
                                        className="text-red-400 text-xs hover:text-red-300"
                                    >
                                        Drop
                                    </button>
                                    <button
                                        onClick={() => setSubmitProofId(b._id)}
                                        className="bg-amber-500 text-slate-900 text-xs px-3 py-1.5 rounded-lg font-bold hover:bg-amber-400"
                                    >
                                        Complete
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* REVIEW QUEUE (OFFICER VIEW or Status View) */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-2">
                        <CheckCircle size={16} /> <span>Review Queue</span>
                    </h3>
                    {sections.REVIEW.length === 0 && <p className="text-slate-500 italic">No submissions pending.</p>}
                    {sections.REVIEW.map(b => (
                        <div key={b._id} className="bg-slate-900 border border-purple-500/30 rounded-xl p-4">
                            <h4 className="font-bold text-white mb-1">{b.title}</h4>
                            <div className="flex items-center space-x-2 mb-2 text-xs text-slate-400">
                                <span className="text-purple-400">By {b.claimantName}</span>
                                <span>•</span>
                                <span>{new Date(b.submittedAt || 0).toLocaleDateString()}</span>
                            </div>
                            <div className="bg-slate-950 p-2 rounded border border-slate-800 text-sm text-slate-300 mb-3 italic">
                                "{b.proof}"
                            </div>

                            {isOfficer ? (
                                <div className="flex justify-end space-x-2">
                                    <button
                                        onClick={() => handleDeny(b._id)}
                                        className="text-red-400 text-xs px-3 py-1.5 hover:bg-slate-800 rounded"
                                    >
                                        Deny
                                    </button>
                                    <button
                                        onClick={() => handleApprove(b._id)}
                                        className="bg-green-600 text-white text-xs px-3 py-1.5 rounded hover:bg-green-500"
                                    >
                                        Approve & Pay
                                    </button>
                                </div>
                            ) : (
                                <div className="text-xs text-slate-500 text-right">Pending Officer Approval</div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {isCreateModalOpen && (
                <CreateBountyModal
                    guildId={guildId}
                    treasury={treasury}
                    onClose={() => setIsCreateModalOpen(false)}
                />
            )}
        </div>
    );
};
