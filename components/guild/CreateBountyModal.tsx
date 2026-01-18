import React, { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { X, Coins, Gem } from 'lucide-react';

interface CreateBountyModalProps {
    guildId: Id<"guilds">;
    treasury: { gold: number; gems: number };
    onClose: () => void;
}

export const CreateBountyModal: React.FC<CreateBountyModalProps> = ({ guildId, treasury, onClose }) => {
    const createBounty = useMutation(api.guilds.bounties.create);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [goldReward, setGoldReward] = useState(0);
    const [gemsReward, setGemsReward] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        if (goldReward > treasury.gold) {
            setError("Insufficient Gold in Treasury");
            setIsSubmitting(false);
            return;
        }
        if (gemsReward > treasury.gems) {
            setError("Insufficient Gems in Treasury");
            setIsSubmitting(false);
            return;
        }
        if (goldReward === 0 && gemsReward === 0) {
            setError("Must provide at least one reward");
            setIsSubmitting(false);
            return;
        }

        try {
            await createBounty({
                guildId,
                title,
                description,
                reward: {
                    gold: goldReward,
                    gems: gemsReward > 0 ? gemsReward : undefined
                }
            });
            onClose();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
                <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800/50">
                    <h3 className="text-lg font-bold text-white">Post New Bounty</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                placeholder="e.g. Recruit 5 New Members"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Description</label>
                            <textarea
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white h-24 focus:ring-2 focus:ring-amber-500 focus:outline-none resize-none"
                                placeholder="Describe the task requirements..."
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Gold Reward</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        min="0"
                                        value={goldReward}
                                        onChange={e => setGoldReward(parseInt(e.target.value) || 0)}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                    />
                                    <Coins className="absolute left-3 top-2.5 text-amber-500" size={16} />
                                </div>
                                <div className="text-xs text-slate-500 mt-1">
                                    Treasury: {treasury.gold}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Gems Reward</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        min="0"
                                        value={gemsReward}
                                        onChange={e => setGemsReward(parseInt(e.target.value) || 0)}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                                    />
                                    <Gem className="absolute left-3 top-2.5 text-purple-500" size={16} />
                                </div>
                                <div className="text-xs text-slate-500 mt-1">
                                    Treasury: {treasury.gems}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-2 bg-amber-500 text-slate-900 font-bold rounded-lg hover:bg-amber-400 disabled:opacity-50 transition-colors"
                        >
                            {isSubmitting ? 'Posting...' : 'Post Bounty'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
