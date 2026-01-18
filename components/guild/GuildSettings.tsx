import React, { useState } from 'react';
import { Sliders, Users, Shield, Link as LinkIcon, Copy, Trash2, Plus } from 'lucide-react';
import { useMutation, useQuery } from "convex/react";
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';

interface GuildSettingsProps {
    guild: any;
    membership: any;
    members: any[];
    onDisband?: () => void;
}

const InviteManagement = ({ guildId }: { guildId: Id<"guilds"> }) => {
    const invites = useQuery(api.guilds.invites.getByGuild, { guildId }) || [];
    const createInvite = useMutation(api.guilds.invites.create);
    const revokeInvite = useMutation(api.guilds.invites.revoke);
    const [isCreating, setIsCreating] = useState(false);

    const handleCreate = async () => {
        setIsCreating(true);
        try {
            await createInvite({ guildId });
        } catch (error) {
            console.error("Failed to create invite:", error);
            alert("Failed to create invite.");
        } finally {
            setIsCreating(false);
        }
    };

    const handleCopy = (code: string) => {
        const url = `${window.location.origin}/#/invite/${code}`;
        navigator.clipboard.writeText(url);
        alert("Invite link copied to clipboard!");
    };

    return (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <LinkIcon className="text-slate-400" />
                    Invite Links
                </h3>
                <button
                    onClick={handleCreate}
                    disabled={isCreating}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2"
                >
                    <Plus size={16} />
                    Create Link
                </button>
            </div>

            <div className="space-y-3">
                {invites.length === 0 ? (
                    <p className="text-slate-500 text-sm italic">No active invite links.</p>
                ) : (
                    invites.map((invite) => (
                        <div key={invite._id} className="flex items-center justify-between bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                            <div className="flex flex-col">
                                <span className="font-mono text-indigo-400 font-bold tracking-wider">{invite.inviteCode}</span>
                                <span className="text-[10px] text-slate-500">Expires: {new Date(invite.expiresAt!).toLocaleDateString()}</span>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleCopy(invite.inviteCode!)}
                                    className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                                    title="Copy Link"
                                >
                                    <Copy size={16} />
                                </button>
                                <button
                                    onClick={() => {
                                        if (confirm("Revoke this invite link?")) {
                                            revokeInvite({ inviteId: invite._id });
                                        }
                                    }}
                                    className="p-2 hover:bg-red-900/20 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
                                    title="Revoke Link"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export const GuildSettings: React.FC<GuildSettingsProps> = ({ guild, membership, members, onDisband }) => {
    const updateGuild = useMutation(api.guilds.general.update);
    const kickMember = useMutation(api.guilds.members.kick);
    const promoteMember = useMutation(api.guilds.members.promote);
    const demoteMember = useMutation(api.guilds.members.demote);
    const disbandGuild = useMutation(api.guilds.general.disband);

    const [name, setName] = useState(guild.name);
    const [description, setDescription] = useState(guild.description || "");
    const [isPublic, setIsPublic] = useState(guild.settings.isPublic);
    const [isSaving, setIsSaving] = useState(false);

    // Sync state when guild prop changes (e.g. switching guilds)
    React.useEffect(() => {
        setName(guild.name);
        setDescription(guild.description || "");
        setIsPublic(guild.settings.isPublic);
    }, [guild]);

    const isLeader = membership.role === 'leader';

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await updateGuild({
                guildId: guild._id,
                name,
                description,
                isPublic
            });
            alert("Settings saved!");
        } catch (error) {
            console.error("Failed to update guild:", error);
            alert("Failed to save settings.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleKick = async (memberId: any, memberName: string) => {
        if (!confirm(`Are you sure you want to kick ${memberName}?`)) return;
        try {
            await kickMember({ memberId });
        } catch (error) {
            console.error("Failed to kick member:", error);
            alert("Failed to kick member.");
        }
    };

    const handlePromote = async (memberId: any, memberName: string) => {
        if (!confirm(`Promote ${memberName} to Officer?`)) return;
        try {
            await promoteMember({ memberId });
        } catch (error) {
            console.error("Failed to promote member:", error);
        }
    };

    const handleDemote = async (memberId: any, memberName: string) => {
        if (!confirm(`Demote ${memberName} to regular Member?`)) return;
        try {
            await demoteMember({ memberId });
        } catch (error) {
            console.error("Failed to demote member:", error);
        }
    };

    const handleDisband = async () => {
        const confirmText = prompt(`WARNING: This cannot be undone. All data will be lost.\n\nType "${guild.name}" to confirm disbanding:`);
        if (confirmText !== guild.name) return;

        try {
            await disbandGuild({ guildId: guild._id });
            onDisband?.();
        } catch (error) {
            console.error("Failed to disband guild:", error);
            alert("Failed to disband guild.");
        }
    };

    return (
        <div className="space-y-8">
            {/* General Settings */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Sliders className="text-slate-400" />
                    General Settings
                </h3>
                <form onSubmit={handleSave} className="space-y-4">
                    <div>
                        <label className="block text-slate-400 text-xs font-bold mb-1 uppercase">Guild Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-slate-400 text-xs font-bold mb-1 uppercase">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white h-24 resize-none"
                        />
                    </div>
                    <div>
                        <label className="block text-slate-400 text-xs font-bold mb-1 uppercase">Visibility</label>
                        <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 cursor-pointer text-white">
                                <input
                                    type="radio"
                                    checked={isPublic}
                                    onChange={() => setIsPublic(true)}
                                    className="accent-indigo-500"
                                />
                                Public
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer text-white">
                                <input
                                    type="radio"
                                    checked={!isPublic}
                                    onChange={() => setIsPublic(false)}
                                    className="accent-indigo-500"
                                />
                                Private (Invite Only)
                            </label>
                        </div>
                    </div>
                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg font-bold disabled:opacity-50"
                        >
                            {isSaving ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>

            {/* Member Management */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Users className="text-slate-400" />
                    Member Management
                </h3>
                <div className="space-y-2">
                    {members.map((member) => (
                        <div key={member._id} className="flex items-center justify-between bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs text-white">
                                    {member.userName.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <span className="font-bold text-white text-sm block">{member.userName}</span>
                                    <span className="text-[10px] uppercase font-bold text-slate-500">
                                        {member.role} • Lvl {member.level}
                                    </span>
                                </div>
                            </div>

                            {/* Actions - Don't show actions for self or if lacking perms */}
                            {member.userId !== membership.userId && (
                                <div className="flex gap-2">
                                    {isLeader && member.role === 'member' && (
                                        <button
                                            onClick={() => handlePromote(member._id, member.userName)}
                                            className="text-xs font-bold text-green-400 hover:text-green-300 px-2 py-1 rounded bg-green-400/10 hover:bg-green-400/20"
                                        >
                                            Promote
                                        </button>
                                    )}
                                    {isLeader && member.role === 'officer' && (
                                        <button
                                            onClick={() => handleDemote(member._id, member.userName)}
                                            className="text-xs font-bold text-amber-400 hover:text-amber-300 px-2 py-1 rounded bg-amber-400/10 hover:bg-amber-400/20"
                                        >
                                            Demote
                                        </button>
                                    )}
                                    {(isLeader || (membership.role === 'officer' && member.role === 'member')) && (
                                        <button
                                            onClick={() => handleKick(member._id, member.userName)}
                                            className="text-xs font-bold text-red-400 hover:text-red-300 px-2 py-1 rounded bg-red-400/10 hover:bg-red-400/20"
                                        >
                                            Kick
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Invite Management */}
            {(isLeader || membership.role === 'officer') && (
                <InviteManagement guildId={guild._id} />
            )}

            {/* Danger Zone */}
            {isLeader && (
                <div className="border border-red-900/50 bg-red-900/10 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-red-400 mb-2 flex items-center gap-2">
                        <Shield className="text-red-500" />
                        Danger Zone
                    </h3>
                    <p className="text-red-300/70 text-sm mb-4">
                        Disbanding the guild will permanently delete all records, projects, and chat history. This action cannot be undone.
                    </p>
                    <button
                        onClick={handleDisband}
                        className="bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded-lg font-bold text-sm"
                    >
                        Disband Guild
                    </button>
                </div>
            )}
        </div>
    );
};
