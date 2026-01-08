import React, { useState } from 'react';
import { Sliders, Users, Shield } from 'lucide-react';
import { useMutation } from "convex/react";
import { api } from '../../convex/_generated/api';

interface GuildSettingsProps {
    guild: any;
    membership: any;
    members: any[];
}

export const GuildSettings: React.FC<GuildSettingsProps> = ({ guild, membership, members }) => {
    const updateGuild = useMutation(api.guilds.updateGuild);
    const kickMember = useMutation(api.guilds.kickMember);
    const promoteMember = useMutation(api.guilds.promoteMember);
    const demoteMember = useMutation(api.guilds.demoteMember);
    const disbandGuild = useMutation(api.guilds.disbandGuild);

    const [name, setName] = useState(guild.name);
    const [description, setDescription] = useState(guild.description || "");
    const [isPublic, setIsPublic] = useState(guild.settings.isPublic);
    const [isSaving, setIsSaving] = useState(false);

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
