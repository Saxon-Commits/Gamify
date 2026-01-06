import React, { useState } from 'react';
import { Users, Shield, Trophy, Target, Crown, Sparkles, Sliders, ChevronDown, ChevronUp, Search, Plus, Lock, Globe } from 'lucide-react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useGameStore } from '../store/useGameStore';
import { ALL_COSMETIC_ITEMS, STARTER_AVATARS, COSMETIC_SHOP_ITEMS } from '../src/utils/CosmeticsData';
import { SHOP_ITEMS } from '../src/utils/GameEconomy';
import { MiniCharacterCard } from '../components/MiniCharacterCard';

// Types for member loadout (Mock for compatibility with MemberEditPanel until we fully wire it up)
interface MemberLoadout {
    id: string;
    name: string;
    level: number;
    role: 'Leader' | 'Officer' | 'Member';
    avatarId: string;
    weaponId: string | null;
    armorId: string | null;
    companionId: string | null;
    backdropId: string | null;
}

// Get all available options for dropdowns
const ALL_AVATARS = [...STARTER_AVATARS, ...ALL_COSMETIC_ITEMS.filter(i => i.type === 'AVATAR')];
const ALL_WEAPONS = [...SHOP_ITEMS.filter(i => i.slots?.includes('WEAPON')), ...ALL_COSMETIC_ITEMS.filter(i => i.slots?.includes('WEAPON'))];
const ALL_ARMORS = [...SHOP_ITEMS.filter(i => i.slots?.includes('ARMOR')), ...ALL_COSMETIC_ITEMS.filter(i => i.slots?.includes('ARMOR'))];
const ALL_COMPANIONS = ALL_COSMETIC_ITEMS.filter(i => i.type === 'COMPANION' || i.slots?.includes('ACCESSORY'));
const ALL_BACKDROPS = COSMETIC_SHOP_ITEMS.filter(i => i.type === 'THEME');

// --- COMPONENTS ---

const GuildMemberCard: React.FC<{
    member: MemberLoadout;
    isUser?: boolean;
    onEdit?: () => void;
}> = ({ member, isUser = false, onEdit }) => {
    const borderClass = isUser
        ? 'border-2 border-amber-500/50 bg-gradient-to-br from-amber-500/20 to-orange-600/20'
        : 'border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-indigo-500/50';

    return (
        <div className={`${borderClass} rounded-xl p-2 relative overflow-hidden transition-colors`}>
            {isUser && (
                <div className="absolute top-2 right-2 z-20">
                    <Crown size={14} className="text-amber-400" />
                </div>
            )}

            <MiniCharacterCard
                avatarId={member.avatarId}
                companionId={member.companionId}
                backdropId={member.backdropId}
                weaponId={member.weaponId}
                armorId={member.armorId}
                className="w-full mb-3"
            />

            <div className="flex items-center justify-between">
                <div className="min-w-0">
                    <p className={`font-bold text-sm truncate ${isUser ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                        {member.name}
                    </p>
                    <p className="text-xs">
                        <span className={
                            isUser ? 'text-amber-400' :
                                member.role === 'Leader' ? 'text-amber-400' :
                                    member.role === 'Officer' ? 'text-indigo-400' :
                                        'text-slate-400'
                        }>
                            {isUser ? 'You' : member.role}
                        </span>
                        <span className="text-slate-500"> • Lvl {member.level}</span>
                    </p>
                </div>
                {onEdit && (
                    <button
                        onClick={onEdit}
                        className="p-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300 transition-colors"
                    >
                        <Sliders size={12} />
                    </button>
                )}
            </div>
        </div>
    );
};

const CreateGuildForm: React.FC<{ onCancel: () => void }> = ({ onCancel }) => {
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
            await createGuild({ name, description, isPublic });
        } catch (err: any) {
            setError(err.message || 'Failed to create guild');
        } finally {
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

const GuildBrowser: React.FC<{ onCreateClick: () => void }> = ({ onCreateClick }) => {
    const publicGuilds = useQuery(api.guilds.getPublicGuilds);
    const joinGuild = useMutation(api.guilds.joinGuild);
    const [joiningId, setJoiningId] = useState<string | null>(null);

    const handleJoin = async (guildId: any) => {
        setJoiningId(guildId);
        try {
            await joinGuild({ guildId });
        } catch (err) {
            console.error("Failed to join guild", err);
        } finally {
            setJoiningId(null);
        }
    };

    return (
        <div className="space-y-8">
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-black text-white uppercase tracking-wider">Join a Guild</h1>
                <p className="text-slate-400 max-w-lg mx-auto">
                    Find a community of like-minded adventurers. Collaborate, compete, and earn rewards together.
                </p>
                <button
                    onClick={onCreateClick}
                    className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-xl font-bold transition-colors border border-slate-700"
                >
                    <Plus size={18} />
                    Create New Guild
                </button>
            </div>

            <div className="bg-white/5 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex items-center gap-3">
                    <Search className="text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search guilds..."
                        className="bg-transparent border-none focus:outline-none text-slate-900 dark:text-white w-full placeholder-slate-500"
                    />
                </div>

                <div className="divide-y divide-slate-200 dark:divide-slate-700">
                    {!publicGuilds ? (
                        <div className="p-8 text-center text-slate-500">Loading guilds...</div>
                    ) : publicGuilds.length === 0 ? (
                        <div className="p-12 text-center">
                            <Shield className="mx-auto h-12 w-12 text-slate-600 mb-4" />
                            <h3 className="text-xl font-bold text-white mb-2">No Guilds Found</h3>
                            <p className="text-slate-400 mb-6">Be the first to start a guild!</p>
                            <button
                                onClick={onCreateClick}
                                className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg font-bold"
                            >
                                Create Guild
                            </button>
                        </div>
                    ) : (
                        publicGuilds.map((guild) => (
                            <div key={guild._id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                        {guild.name.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 dark:text-white text-lg">{guild.name}</h3>
                                        <p className="text-slate-500 text-sm line-clamp-1">{guild.description || "No description provided."}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-right hidden sm:block">
                                        <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">Members</p>
                                        <p className="text-white font-mono">{guild.memberCount}</p>
                                    </div>
                                    <div className="text-right hidden sm:block">
                                        <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">Level</p>
                                        <p className="text-amber-400 font-mono">{guild.level}</p>
                                    </div>
                                    <button
                                        onClick={() => handleJoin(guild._id)}
                                        disabled={joiningId === guild._id}
                                        className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors border border-white/10"
                                    >
                                        {joiningId === guild._id ? 'Joining...' : 'Join'}
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

const GuildProjects: React.FC<{ guildId: any, isOfficer: boolean }> = ({ guildId, isOfficer }) => {
    const projects = useQuery(api.guilds.getGuildProjects, { guildId });
    const createProject = useMutation(api.guilds.createProject);
    const contribute = useMutation(api.guilds.contributeToProject);

    const [isCreating, setIsCreating] = useState(false);
    const [contributionAmount, setContributionAmount] = useState<Record<string, number>>({});

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const title = (form.elements.namedItem('title') as HTMLInputElement).value;
        const description = (form.elements.namedItem('description') as HTMLTextAreaElement).value;
        const targetTasks = parseInt((form.elements.namedItem('target') as HTMLInputElement).value);

        await createProject({
            guildId,
            title,
            description,
            targetTasks,
            rewards: { xp: targetTasks * 10, gold: targetTasks * 5 } // Simple auto-calc for now
        });
        setIsCreating(false);
    };

    const handleContribute = async (projectId: any) => {
        const amount = contributionAmount[projectId] || 0;
        if (amount <= 0) return;

        await contribute({ projectId, amount });
        setContributionAmount({ ...contributionAmount, [projectId]: 0 });
    };

    if (isCreating) {
        return (
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">Start New Project</h3>
                <form onSubmit={handleCreate} className="space-y-4">
                    <div>
                        <label className="block text-slate-400 text-xs font-bold mb-1">Project Title</label>
                        <input name="title" type="text" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white" required />
                    </div>
                    <div>
                        <label className="block text-slate-400 text-xs font-bold mb-1">Description</label>
                        <textarea name="description" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white h-20 resize-none" />
                    </div>
                    <div>
                        <label className="block text-slate-400 text-xs font-bold mb-1">Target Tasks</label>
                        <input name="target" type="number" defaultValue={100} min={10} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white" required />
                    </div>
                    <div className="flex gap-2 pt-2">
                        <button type="button" onClick={() => setIsCreating(false)} className="flex-1 bg-slate-700 text-white py-2 rounded-lg font-bold">Cancel</button>
                        <button type="submit" className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-bold">Start Project</button>
                    </div>
                </form>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Target className="text-purple-400" />
                    Active Projects
                </h2>
                {isOfficer && (
                    <button
                        onClick={() => setIsCreating(true)}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2"
                    >
                        <Plus size={16} /> New Project
                    </button>
                )}
            </div>

            {!projects ? (
                <div className="text-center py-8 text-slate-500">Loading projects...</div>
            ) : projects.length === 0 ? (
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 text-center">
                    <Target className="mx-auto text-slate-600 mb-4" size={32} />
                    <h3 className="text-xl font-bold text-white mb-2">No Active Projects</h3>
                    <p className="text-slate-500 mb-4">Start a collaborative project to earn guild rewards!</p>
                    {isOfficer && (
                        <button onClick={() => setIsCreating(true)} className="text-indigo-400 hover:text-indigo-300 font-bold">
                            + Start First Project
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid gap-4">
                    {projects.map(project => (
                        <div key={project._id} className="bg-slate-800 border border-slate-700 rounded-xl p-5">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-white">{project.title}</h3>
                                    <p className="text-slate-400 text-sm">{project.description}</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Rewards</div>
                                    <div className="flex gap-2 text-xs font-mono">
                                        <span className="text-purple-400">{project.rewards.xp} XP</span>
                                        <span className="text-amber-400">{project.rewards.gold} Gold</span>
                                    </div>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="mb-4">
                                <div className="flex justify-between text-xs text-slate-400 mb-1">
                                    <span>Progress</span>
                                    <span>{project.completedTasks} / {project.targetTasks}</span>
                                </div>
                                <div className="h-4 bg-slate-900 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-500"
                                        style={{ width: `${Math.min(100, (project.completedTasks / project.targetTasks) * 100)}%` }}
                                    />
                                </div>
                            </div>

                            {/* Contributors */}
                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-700">
                                <div className="flex -space-x-2">
                                    {project.contributors.map((c, i) => (
                                        <div key={i} className="w-8 h-8 rounded-full bg-slate-700 border-2 border-slate-800 flex items-center justify-center text-xs text-white" title="Contributor">
                                            {/* We don't have avatar URLs here yet without another fetch, simple initials/icon for now */}
                                            <Users size={12} />
                                        </div>
                                    ))}
                                    {project.contributors.length === 0 && <span className="text-xs text-slate-500 italic">No contributors yet</span>}
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        min={1}
                                        max={10}
                                        value={contributionAmount[project._id] || ''}
                                        onChange={(e) => setContributionAmount({ ...contributionAmount, [project._id]: parseInt(e.target.value) })}
                                        className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white text-sm"
                                        placeholder="Qty"
                                    />
                                    <button
                                        onClick={() => handleContribute(project._id)}
                                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1 rounded-lg text-sm font-bold"
                                    >
                                        Contribute
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export const Guild: React.FC = () => {
    const { stats } = useGameStore();
    const myGuildConfig = useQuery(api.guilds.getMyGuild);
    const [view, setView] = useState<'browse' | 'create'>('browse');
    const [activeTab, setActiveTab] = useState<'overview' | 'projects'>('overview');

    // Fetch members and activity only if we have a guild
    const guildId = myGuildConfig?.guild?._id;
    const guildMembers = useQuery(api.guilds.getGuildMembers, guildId ? { guildId } : "skip");
    const guildActivity = useQuery(api.guilds.getGuildActivity, guildId ? { guildId } : "skip");

    // Loading State
    if (myGuildConfig === undefined) {
        return (
            <div className="w-full h-[60vh] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    // NO GUILD STATE -> Show Browser or Creator
    if (myGuildConfig === null) {
        return (
            <div className="w-full pb-32 pl-4 pr-4">
                {view === 'create' ? (
                    <CreateGuildForm onCancel={() => setView('browse')} />
                ) : (
                    <GuildBrowser onCreateClick={() => setView('create')} />
                )}
            </div>
        );
    }

    // HAS GUILD STATE -> Show Dashboard
    const { guild, memberCount, membership } = myGuildConfig;
    const isOfficer = membership.role === 'leader' || membership.role === 'officer';

    // Build user member object for the UI
    const userMember: MemberLoadout = {
        id: 'user',
        name: 'You', // In a real app we'd fetch the user profile
        level: stats.level || 1,
        role: membership.role === 'leader' ? 'Leader' : membership.role === 'officer' ? 'Officer' : 'Member',
        avatarId: stats.activeAvatarId || 'starter_villager_male',
        weaponId: stats.activeMainHandId || null,
        armorId: stats.activeArmorId || null,
        companionId: stats.activeAccessoryId || null,
        backdropId: stats.activeBackdropId || null,
    };

    return (
        <div className="w-full pb-32 pl-4 pr-4">
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Main Content - Left/Center */}
                <div className="flex-1 max-w-[900px] space-y-8">
                    {/* Header */}
                    <div className="text-center py-12">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-4 shadow-lg shadow-indigo-500/30">
                            <Shield size={40} className="text-white" />
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                            {guild.name}
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
                            {guild.description || "No description provided."}
                        </p>

                        {/* Navigation Tabs */}
                        <div className="flex justify-center gap-4 mt-6">
                            <button
                                onClick={() => setActiveTab('overview')}
                                className={`px-4 py-2 rounded-full font-bold text-sm transition-colors ${activeTab === 'overview' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                            >
                                Overview
                            </button>
                            <button
                                onClick={() => setActiveTab('projects')}
                                className={`px-4 py-2 rounded-full font-bold text-sm transition-colors ${activeTab === 'projects' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                            >
                                Projects
                            </button>
                        </div>
                    </div>

                    {activeTab === 'projects' ? (
                        <GuildProjects guildId={guild._id} isOfficer={isOfficer} />
                    ) : (
                        <>
                            {/* Activity Feed */}
                            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <Sparkles className="text-amber-400" size={20} />
                                    <h3 className="text-lg font-bold text-white">Activity Feed</h3>
                                </div>

                                <div className="space-y-4">
                                    {!guildActivity ? (
                                        <div className="text-center text-slate-500 text-sm py-4">Loading activity...</div>
                                    ) : guildActivity.length === 0 ? (
                                        <div className="text-center text-slate-500 text-sm py-4">No recent activity.</div>
                                    ) : (
                                        guildActivity.map((activity) => (
                                            <div key={activity._id} className="flex items-start gap-3 text-sm">
                                                <div className="w-8 h-8 bg-slate-700 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden">
                                                    {activity.userPictureUrl ? (
                                                        <img src={activity.userPictureUrl} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="font-bold text-xs text-white uppercase">{activity.userName.substring(0, 2)}</span>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-slate-300">
                                                        <span className="font-bold text-white">{activity.userName}</span>
                                                        {' '}
                                                        {activity.type === 'joined' && 'joined the guild'}
                                                        {activity.type === 'guild_created' && 'created the guild'}
                                                        {activity.type === 'left' && 'left the guild'}
                                                        {activity.type === 'kicked' && 'was kicked from the guild'}
                                                        {activity.type === 'promoted' && `was promoted to ${activity.data.newRole}`}
                                                        {activity.type === 'project_started' && `started project "${activity.data.projectTitle}"`}
                                                        {activity.type === 'project_completed' && `completed project "${activity.data.projectTitle}"`}
                                                    </p>
                                                    <p className="text-xs text-slate-600 mt-0.5">
                                                        {new Date(activity.timestamp).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Feature Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div
                                    onClick={() => setActiveTab('projects')}
                                    className="bg-slate-800/30 border border-slate-700 rounded-xl p-6 hover:bg-slate-800/50 transition-colors cursor-pointer group"
                                >
                                    <Target className="text-purple-400 mb-3 group-hover:scale-110 transition-transform" size={28} />
                                    <h3 className="text-white font-bold mb-1">Projects</h3>
                                    <p className="text-slate-500 text-sm">Collaborate & Earn Rewards</p>
                                </div>
                                <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-6 hover:bg-slate-800/50 transition-colors cursor-pointer group">
                                    <Trophy className="text-amber-400 mb-3 group-hover:scale-110 transition-transform" size={28} />
                                    <h3 className="text-white font-bold mb-1">Treasury</h3>
                                    <p className="text-slate-500 text-sm">{guild.treasury.gold} Gold • {guild.treasury.gems} Gems</p>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Guild Members Column - Right edge */}
                <div className="w-full lg:w-auto lg:min-w-[420px] ml-auto">
                    <div className="sticky top-20 space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Users size={14} />
                                Guild Members ({memberCount})
                            </h3>
                        </div>

                        {/* Member Grid */}
                        <div className="grid grid-cols-2 gap-3">
                            {!guildMembers ? (
                                <div className="col-span-2 text-center py-8 text-slate-500">Loading members...</div>
                            ) : (
                                guildMembers.map((member) => (
                                    <GuildMemberCard
                                        key={member._id}
                                        member={{
                                            id: member._id, // use membership ID as generic ID
                                            name: member.userName,
                                            level: member.level,
                                            role: member.role === 'leader' ? 'Leader' : member.role === 'officer' ? 'Officer' : 'Member',
                                            avatarId: member.avatarId,
                                            weaponId: member.weaponId,
                                            armorId: member.armorId,
                                            companionId: member.companionId,
                                            backdropId: member.backdropId
                                        }}
                                        isUser={false} // TODO: Check if this is current user
                                    />
                                ))
                            )}
                        </div>

                        <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-xl text-sm transition-colors flex items-center justify-center gap-2 opacity-50 cursor-not-allowed">
                            <Users size={16} />
                            Invite Friends
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
