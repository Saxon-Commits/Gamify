import React from 'react';
import { Shield } from 'lucide-react';

interface AdminGuildInspectorProps {
    guilds: any[];
    onDisbandGuild: (guildId: any, name: string) => void;
}

export const AdminGuildInspector: React.FC<AdminGuildInspectorProps> = ({
    guilds,
    onDisbandGuild,
}) => {
    return (
        <div className="mt-12">
            <h2 className="text-lg font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2 mb-6 flex items-center gap-2">
                <Shield size={18} /> Guild Inspector
            </h2>

            <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-400">
                        <thead className="bg-slate-950 text-xs uppercase font-bold text-slate-500">
                            <tr>
                                <th className="px-6 py-4">Guild Name & ID</th>
                                <th className="px-6 py-4">Leader</th>
                                <th className="px-6 py-4 text-center">Members</th>
                                <th className="px-6 py-4 text-center">Level</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {guilds.map((guild: any) => (
                                <tr key={guild._id} className="hover:bg-slate-800/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-white text-base">{guild.name}</div>
                                        <div className="text-[10px] font-mono opacity-50">{guild._id}</div>
                                        {guild.description && <div className="text-xs mt-1 text-slate-500 truncate max-w-xs">{guild.description}</div>}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-white">{guild.leaderName}</div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="bg-slate-800 text-slate-300 px-2 py-1 rounded text-xs font-bold">{guild.memberCount}</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="font-mono text-purple-400 font-bold">{guild.level}</div>
                                        <div className="text-[10px] text-slate-600">{guild.xp || 0} XP</div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => onDisbandGuild(guild._id, guild.name)}
                                            className="bg-red-900/20 hover:bg-red-900/40 border border-red-900/50 text-red-500 px-3 py-1.5 rounded text-xs font-bold transition-all hover:scale-105"
                                        >
                                            DISBAND
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {guilds.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-600 italic">No guilds found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
