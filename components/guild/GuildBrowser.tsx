import React, { useState } from 'react';
import { Users, Plus, Search, Trophy } from 'lucide-react';
import { useQuery, useMutation } from "convex/react";
import { api } from '../../convex/_generated/api';

interface GuildBrowserProps {
    onCreateClick: () => void;
    onJoinClick?: (guildId: any) => void;
    myGuildIds?: string[];
}

export const GuildBrowser: React.FC<GuildBrowserProps> = ({ onCreateClick, onJoinClick, myGuildIds = [] }) => {
    const publicGuilds = useQuery(api.guilds.getPublicGuilds);
    const joinGuild = useMutation(api.guilds.joinGuild);
    const [search, setSearch] = useState('');

    const handleJoin = async (guildId: any) => {
        if (!confirm("Join this guild?")) return;
        try {
            await joinGuild({ guildId });
            onJoinClick?.(guildId);
        } catch (error: any) {
            alert(error.message);
        }
    };

    const handleJoinByCode = async (e: React.FormEvent) => {
        e.preventDefault();
        // Implement invite code join later if needed or via URL
        alert("Invite code joining via URL is supported. Please use the full link.");
    };

    const filteredGuilds = publicGuilds?.filter(g =>
        g.name.toLowerCase().includes(search.toLowerCase()) ||
        g.description?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 text-center">
                <Users size={48} className="mx-auto text-indigo-400 mb-4" />
                <h2 className="text-3xl font-bold text-white mb-2">Find Your Community</h2>
                <p className="text-slate-400 mb-8 max-w-lg mx-auto">
                    Join an existing guild to find like-minded players, or establish your own order.
                </p>

                <div className="flex gap-4 justify-center">
                    <button
                        onClick={onCreateClick}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg font-bold transition-all shadow-lg hover:shadow-indigo-500/25 flex items-center gap-2"
                    >
                        <Plus size={18} />
                        Create New Guild
                    </button>
                    {/* Add Invite Code Input Trigger if needed */}
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white">Public Guilds</h3>
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                        <input
                            type="text"
                            placeholder="Search guilds..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                </div>

                {!filteredGuilds ? (
                    <div className="text-center py-12 text-slate-500">Loading guilds...</div>
                ) : filteredGuilds.length === 0 ? (
                    <div className="text-center py-12 bg-slate-800/50 rounded-xl border border-slate-700 border-dashed">
                        <p className="text-slate-400">No guilds found matching "{search}"</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {filteredGuilds.map((guild) => {
                            const isMember = myGuildIds.includes(guild._id);
                            return (
                                <div key={guild._id} className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex items-center justify-between hover:border-slate-600 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-slate-700 rounded-lg flex items-center justify-center shrink-0 font-bold text-xl text-slate-400">
                                            {guild.name.substring(0, 1)}
                                        </div>
                                        <div>
                                            <h4 className="text-white font-bold text-lg flex items-center gap-2">
                                                {guild.name}
                                                {isMember && <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">Member</span>}
                                            </h4>
                                            <p className="text-slate-400 text-sm line-clamp-1">{guild.description || "No description provided."}</p>
                                            <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
                                                <span className="flex items-center gap-1"><Users size={12} /> {guild.memberCount} Members</span>
                                                <span className="flex items-center gap-1"><Trophy size={12} /> Lvl {guild.level}</span>
                                            </div>
                                        </div>
                                    </div>
                                    {isMember ? (
                                        <button disabled className="px-4 py-2 bg-slate-700 text-slate-400 rounded-lg text-sm font-bold cursor-not-allowed">
                                            Joined
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleJoin(guild._id)}
                                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-bold transition-colors"
                                        >
                                            Join Guild
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};
