import React from 'react';
import { Shield, Sparkles, Crown, Plus } from 'lucide-react';
import { Doc } from '../../convex/_generated/dataModel';

interface GuildHeaderProps {
    guild: Doc<"guilds">;
    onDonateClick: () => void;
}

export const GuildHeader: React.FC<GuildHeaderProps> = ({ guild, onDonateClick }) => {
    return (
        <div className="w-full bg-slate-800/50 border border-slate-700/50 p-6 rounded-2xl">
            <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
                    <Shield size={48} className="text-white" />
                </div>
                <div className="flex-1">
                    <h1 className="text-3xl font-black text-white uppercase tracking-wider mb-2">
                        {guild.name}
                    </h1>
                    <p className="text-slate-400 max-w-2xl mx-auto md:mx-0 mb-4">
                        {guild.description || "No description provided."}
                    </p>

                    {/* Guild XP Bar */}
                    <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4 max-w-xl">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                <Sparkles className="text-amber-400" size={14} />
                                Guild XP
                            </h3>
                            <span className="text-xs font-mono text-indigo-400">Level {guild.level}</span>
                        </div>
                        <div className="h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700 relative">
                            <div
                                className="h-full bg-gradient-to-r from-amber-500 to-orange-600"
                                style={{ width: `${Math.min(100, (guild.xp / (guild.level * 1000)) * 100)}%` }}
                            />
                        </div>
                        <div className="flex justify-between mt-1 text-[10px] uppercase font-bold text-slate-500">
                            <span>{Math.floor(guild.xp)} XP</span>
                            <span>{guild.level * 1000} XP</span>
                        </div>
                    </div>
                </div>

                {/* Treasury Section in Header */}
                <div className="flex flex-col gap-3 min-w-[200px] border-l border-slate-700/50 pl-6 md:ml-6 mt-6 md:mt-0">
                    <div className="flex items-center gap-2 mb-1">
                        <Crown className="text-yellow-400" size={16} />
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Treasury</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-900/50 p-2 rounded-lg border border-slate-700/50 text-center">
                            <span className="block text-lg font-black text-amber-400">{guild.treasury?.gold || 0}</span>
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Gold</span>
                        </div>
                        <div className="bg-slate-900/50 p-2 rounded-lg border border-slate-700/50 text-center">
                            <span className="block text-lg font-black text-cyan-400">{guild.treasury?.gems || 0}</span>
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Gems</span>
                        </div>
                    </div>
                    <button
                        onClick={onDonateClick}
                        className="w-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 hover:text-amber-300 border border-amber-500/20 hover:border-amber-500/50 rounded-lg py-2 text-xs font-bold transition-colors flex items-center justify-center gap-2"
                    >
                        <Plus size={14} />
                        Donate
                    </button>
                </div>
            </div>
        </div>
    );
};
