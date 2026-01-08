import React, { useState } from 'react';
import { Plus, Globe, Lock } from 'lucide-react';
import { useMutation } from "convex/react";
import { api } from '../../convex/_generated/api';

interface CreateGuildFormProps {
    onCancel: () => void;
    onSuccess?: (newGuildId: string) => void;
}

export const CreateGuildForm: React.FC<CreateGuildFormProps> = ({ onCancel, onSuccess }) => {
    const createGuild = useMutation(api.guilds.createGuild);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isPublic, setIsPublic] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);

        try {
            const newGuildId = await createGuild({ name, description, isPublic });
            onSuccess?.(newGuildId); // Navigate to the new guild
        } catch (err: any) {
            setError(err.message || 'Failed to create guild');
            setSubmitting(false);
        }
    };

    return (
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 max-w-lg mx-auto">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Plus className="text-indigo-400" />
                Create a Guild
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-slate-400 text-sm font-bold mb-2">Guild Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
                        placeholder="e.g. The Night's Watch"
                        required
                        minLength={3}
                        maxLength={32}
                    />
                </div>

                <div>
                    <label className="block text-slate-400 text-sm font-bold mb-2">Description</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 h-24 resize-none"
                        placeholder="What is your guild about?"
                        maxLength={140}
                    />
                </div>

                <div>
                    <label className="block text-slate-400 text-sm font-bold mb-2">Privacy Settings</label>
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            type="button"
                            onClick={() => setIsPublic(true)}
                            className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-colors ${isPublic ? 'bg-indigo-600/20 border-indigo-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'}`}
                        >
                            <Globe size={24} className={isPublic ? 'text-indigo-400' : 'text-slate-500'} />
                            <span className="font-bold text-sm">Public</span>
                            <span className="text-xs text-center opacity-70">Anyone can join instantly</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsPublic(false)}
                            className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-colors ${!isPublic ? 'bg-indigo-600/20 border-indigo-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'}`}
                        >
                            <Lock size={24} className={!isPublic ? 'text-indigo-400' : 'text-slate-500'} />
                            <span className="font-bold text-sm">Private</span>
                            <span className="text-xs text-center opacity-70">Invite only / Approval required</span>
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl text-sm">
                        {error}
                    </div>
                )}

                <div className="flex gap-4 pt-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-xl transition-colors"
                        disabled={submitting}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
                        disabled={submitting}
                    >
                        {submitting ? 'Creating...' : 'Create Guild'}
                    </button>
                </div>
            </form>
        </div>
    );
};
