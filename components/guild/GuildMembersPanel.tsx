import React, { useState } from 'react';
import { Users, Share, Copy, Plus, LogOut } from 'lucide-react';
import { useMutation } from "convex/react";
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { GuildMemberCard } from './GuildMemberCard';

interface GuildMember {
    _id: string;
    userName: string;
    level: number;
    role: 'leader' | 'officer' | 'member';
    avatarId?: string;
    armorId?: string;
    companionId?: string;
    backdropId?: string;
    userId: string; // Add explicit userId for identification
}

interface MyGuild {
    guild: {
        _id: Id<"guilds">;
        name: string;
        level: number;
    };
    membership: {
        role: string;
    };
}

interface GuildMembersPanelProps {
    guildId: Id<"guilds">;
    members: GuildMember[] | undefined;
    memberCount: number;
    myGuilds: MyGuild[] | undefined;
    activeGuildId: Id<"guilds">;
    membershipRole: string;
    onSelectGuild: (guildId: Id<"guilds">) => void;
    onBrowseGuilds: () => void;
    onLeaveGuild: () => void;
    isLeaving: boolean;
    currentUserId?: string;
}

export const GuildMembersPanel: React.FC<GuildMembersPanelProps> = ({
    guildId,
    members,
    memberCount,
    myGuilds,
    activeGuildId,
    membershipRole,
    onSelectGuild,
    onBrowseGuilds,
    onLeaveGuild,
    isLeaving,
    currentUserId
}) => {
    const createInvite = useMutation(api.guilds.invites.create);
    const [inviteCode, setInviteCode] = useState<string | null>(null);
    const [isGeneratingInvite, setIsGeneratingInvite] = useState(false);

    const handleInvite = async () => {
        setIsGeneratingInvite(true);
        try {
            const code = await createInvite({ guildId });
            setInviteCode(code);
        } catch (error) {
            console.error("Failed to create invite:", error);
            alert("Failed to create invite link. You may not have permission.");
        } finally {
            setIsGeneratingInvite(false);
        }
    };

    const sortedMembers = React.useMemo(() => {
        if (!members) return null;

        const me = members.find(m => m.userName === currentUserId || (m as any).userId === currentUserId);
        const leader = members.find(m => m.role === 'leader');

        // Filter out me and leader from the 'rest'
        const rest = members.filter(m => m !== me && m !== leader);

        const result = [];
        if (me) result.push(me);
        if (leader && leader !== me) result.push(leader);

        return [...result, ...rest];
    }, [members, currentUserId]);

    return (
        <div className="w-full lg:w-80 shrink-0">
            <div className="sticky top-4 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <Users size={14} />
                        Guild Members ({memberCount} / 50)
                    </h3>
                </div>

                {/* Member Grid */}
                <div className="grid grid-cols-2 gap-3">
                    {!sortedMembers ? (
                        <div className="col-span-2 text-center py-8 text-slate-500">Loading members...</div>
                    ) : (
                        sortedMembers.map((member) => (
                            <GuildMemberCard
                                key={member._id}
                                member={{
                                    id: member._id,
                                    name: member.userName,
                                    level: member.level,
                                    role: member.role === 'leader' ? 'Leader' : member.role === 'officer' ? 'Officer' : 'Member',
                                    avatarId: member.avatarId,
                                    armorId: member.armorId,
                                    companionId: member.companionId,
                                    backdropId: member.backdropId
                                }}
                                isUser={currentUserId === member.userId}
                            />
                        ))
                    )}
                </div>

                {/* Invite Button */}
                <button
                    onClick={handleInvite}
                    disabled={isGeneratingInvite}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-xl text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
                >
                    <Share size={16} />
                    {isGeneratingInvite ? 'Generating...' : 'Invite Friends'}
                </button>

                {/* Invite Code Modal */}
                {inviteCode && (
                    <div className="bg-slate-800 border-2 border-indigo-500/50 rounded-xl p-4 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-start mb-2">
                            <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Share Code</h4>
                            <button onClick={() => setInviteCode(null)} className="text-slate-500 hover:text-white">&times;</button>
                        </div>
                        <div className="flex items-center gap-2 bg-slate-950 rounded-lg p-2 border border-slate-700">
                            <code className="flex-1 text-center font-mono text-lg font-bold text-white tracking-widest">{inviteCode}</code>
                            <button
                                onClick={() => navigator.clipboard.writeText(inviteCode)}
                                className="p-2 hover:bg-slate-800 rounded-md text-slate-400 hover:text-white transition-colors"
                                title="Copy to clipboard"
                            >
                                <Copy size={16} />
                            </button>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-2 text-center">Expires in 24 hours</p>
                    </div>
                )}

                {/* My Guilds List */}
                <div className="pt-6 border-t border-slate-700/50">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Your Guilds</h4>
                    <div className="space-y-2 mb-4">
                        {myGuilds?.map((g) => (
                            <button
                                key={g.guild._id}
                                onClick={() => onSelectGuild(g.guild._id)}
                                className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${activeGuildId === g.guild._id
                                    ? 'bg-indigo-600/20 border border-indigo-500/50'
                                    : 'hover:bg-slate-800 border border-transparent hover:border-slate-700'
                                    }`}
                            >
                                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-white shrink-0">
                                    {g.guild.name.substring(0, 1)}
                                </div>
                                <div className="text-left min-w-0">
                                    <p className={`text-sm font-bold truncate ${activeGuildId === g.guild._id ? 'text-indigo-400' : 'text-slate-300'
                                        }`}>
                                        {g.guild.name}
                                    </p>
                                    <p className="text-[10px] text-slate-600 flex items-center gap-1">
                                        Lvl {g.guild.level} • {g.membership.role}
                                    </p>
                                </div>
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={onBrowseGuilds}
                        className="w-full flex items-center justify-center gap-2 p-2 text-xs font-bold text-slate-500 hover:text-indigo-400 transition-colors border border-dashed border-slate-700 hover:border-indigo-500/50 rounded-lg"
                    >
                        <Plus size={14} />
                        Join Another Guild
                    </button>
                </div>

                {/* Leave Guild Button */}
                <div className="pt-4 border-t border-slate-700/50">
                    <button
                        onClick={onLeaveGuild}
                        disabled={isLeaving || membershipRole === 'leader'}
                        className="w-full flex items-center justify-center gap-2 text-slate-500 hover:text-red-400 text-xs font-bold uppercase tracking-wider py-2 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        title={membershipRole === 'leader' ? "Leaders must disband or transfer leadership" : "Leave this Guild"}
                    >
                        <LogOut size={14} />
                        {isLeaving ? 'Leaving...' : 'Leave Guild'}
                    </button>
                </div>
            </div>
        </div>
    );
};
