import React, { useState, useEffect } from 'react';
import { Users, Shield, Trophy, Target, Crown, Sparkles, Sliders, ChevronDown, ChevronUp, Search, Plus, Lock, Globe, MessageCircle, Share, Copy, LogOut, Megaphone, Trash2, CheckCircle, ListChecks, Scroll, ArrowLeft, Pencil, Heart } from 'lucide-react';
import { useQuery, useMutation } from "convex/react";
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import 'react-quill-new/dist/quill.bubble.css'; // Optional, but good for read-only if we wanted
import { api } from "../convex/_generated/api";
import { useGameStore } from '../store/useGameStore';
import { ALL_COSMETIC_ITEMS, STARTER_AVATARS, COSMETIC_SHOP_ITEMS } from '../src/utils/CosmeticsData';
import { SHOP_ITEMS } from '../src/utils/GameEconomy';
import { MiniCharacterCard } from '../components/MiniCharacterCard';
import { GuildChat } from '../components/GuildChat';
import { RichTextEditor } from '../components/RichTextEditor';
import { AnnouncementListItem } from '../components/announcements/AnnouncementListItem';
import { AnnouncementModal } from '../components/announcements/AnnouncementModal';
import { X } from 'lucide-react';


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

const DonationModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    userGold: number;
    userGems: number;
    onDonate: (amount: number, currency: 'gold' | 'gems') => Promise<void>;
}> = ({ isOpen, onClose, userGold, userGems, onDonate }) => {
    const [amount, setAmount] = useState<string>('');
    const [currency, setCurrency] = useState<'gold' | 'gems'>('gold');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const val = parseInt(amount);
        if (isNaN(val) || val <= 0) return;

        setIsSubmitting(true);
        try {
            await onDonate(val, currency);
            onClose();
            setAmount('');
        } catch (err) {
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const maxAmount = currency === 'gold' ? userGold : userGems;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="bg-gradient-to-r from-amber-600/20 to-amber-900/20 p-6 border-b border-amber-500/20">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Trophy className="text-amber-400" />
                        Donate to Treasury
                    </h3>
                    <p className="text-slate-400 text-sm mt-1">Support your guild to unlock future perks!</p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="flex gap-2 bg-slate-900 p-1 rounded-lg">
                        <button
                            type="button"
                            onClick={() => setCurrency('gold')}
                            className={`flex-1 py-2 rounded-md font-bold text-sm transition-colors ${currency === 'gold' ? 'bg-amber-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                        >
                            Gold
                        </button>
                        <button
                            type="button"
                            onClick={() => setCurrency('gems')}
                            className={`flex-1 py-2 rounded-md font-bold text-sm transition-colors ${currency === 'gems' ? 'bg-cyan-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                        >
                            Gems
                        </button>
                    </div>

                    <div>
                        <div className="flex justify-between text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">
                            <span>Amount</span>
                            <span>Max: {maxAmount}</span>
                        </div>
                        <div className="relative">
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                min={1}
                                max={maxAmount}
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white font-mono text-lg focus:outline-none focus:border-indigo-500"
                                placeholder="0"
                                autoFocus
                            />
                            <button
                                type="button"
                                onClick={() => setAmount(maxAmount.toString())}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-indigo-400 hover:text-white bg-indigo-500/10 px-2 py-1 rounded"
                            >
                                MAX
                            </button>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!amount || parseInt(amount) <= 0 || parseInt(amount) > maxAmount || isSubmitting}
                            className={`flex-1 font-bold py-3 rounded-xl text-white transition-all shadow-lg ${currency === 'gold' ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500' : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500'} disabled:opacity-50 disabled:shadow-none`}
                        >
                            {isSubmitting ? 'Donating...' : 'Donate'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const CreateGuildForm: React.FC<{ onCancel: () => void, onSuccess?: (newGuildId: string) => void }> = ({ onCancel, onSuccess }) => {
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

// --- GUILD BROWSER CONFIG ---
const GuildBrowser: React.FC<{
    onCreateClick: () => void,
    onJoinClick?: (guildId: any) => void,
    myGuildIds?: string[]
}> = ({ onCreateClick, onJoinClick, myGuildIds = [] }) => {
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

const GuildProjects: React.FC<{ guildId: any, isOfficer: boolean, forceCreate?: boolean, onResetForceCreate?: () => void }> = ({ guildId, isOfficer, forceCreate, onResetForceCreate }) => {
    const projects = useQuery(api.guilds.getGuildProjects, { guildId });
    const guildData = useQuery(api.guilds.getGuild, { guildId });
    const createProject = useMutation(api.guilds.createProject);
    const contribute = useMutation(api.guilds.contributeToProject);

    const [isCreating, setIsCreating] = useState(false);
    const [contributionAmount, setContributionAmount] = useState<Record<string, number>>({});
    const [rewardGold, setRewardGold] = useState(100);
    const [rewardGems, setRewardGems] = useState(0);

    const [projectTasks, setProjectTasks] = useState<any[]>([]);
    const [newTaskName, setNewTaskName] = useState('');
    const [newTaskXp, setNewTaskXp] = useState(50);
    const [newTaskDiff, setNewTaskDiff] = useState('EASY');

    useEffect(() => {
        if (forceCreate && isOfficer) {
            setIsCreating(true);
            onResetForceCreate?.();
        }
    }, [forceCreate, isOfficer, onResetForceCreate]);

    const treasury = guildData?.treasury || { gold: 0, gems: 0 };
    const canAfford = (treasury.gold || 0) >= rewardGold && (treasury.gems || 0) >= rewardGems;

    // We need current user ID (Clerk ID) to check against joinedUserIds.
    // This component might not verify auth but parent does.
    // Ideally we pass userId prop or use store.
    // const myClerkId = useGameStore(state => state.user?.id); // REMOVED: Property user does not exist
    // Actually, `projects` from backend has `joinedUserIds`.
    const joinProject = useMutation(api.guilds.joinProject);
    const addTasks = useGameStore(state => state.addTasks);
    const tasks = useGameStore(state => state.tasks);
    const completeTask = useGameStore(state => state.completeTask);
    // We also need a way to get the current user's Convex ID if joinedUserIds stores Convex ID?
    // Schema says `v.id("users")`. So we need to match that.
    // The `projects` query returns documents with Convex IDs.
    // `gameState` uses Clerk ID.
    // `api.guilds.getGuildProjects` likely returns what we need.
    // BUT checking "isJoined" client side requires knowing MY convex ID.
    // `useQuery(api.users.getMe)` would get it.
    const me = useQuery(api.users.getMe);

    const handleQuickComplete = async (userTaskId: string, projectId: any) => {
        completeTask(userTaskId);
        try {
            await contribute({
                projectId,
                amount: 1
            });
        } catch (e) {
            console.error("Contribution failed", e);
        }
    };

    const handleAddTask = () => {
        if (!newTaskName) return;
        setProjectTasks([...projectTasks, {
            id: `t-${Date.now()}`,
            name: newTaskName,
            xpReward: newTaskXp,
            goldReward: 0, // Simplifying for now, or add input
            difficulty: newTaskDiff
        }]);
        setNewTaskName('');
    }

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const title = (form.elements.namedItem('title') as HTMLInputElement).value;
        const description = (form.elements.namedItem('description') as HTMLTextAreaElement).value;
        // targetTasks is now optional or derived
        // const targetTasks = parseInt((form.elements.namedItem('target') as HTMLInputElement).value);

        if (!canAfford) {
            alert("Insufficient funds in Guild Treasury!");
            return;
        }

        await createProject({
            guildId,
            title,
            description,
            targetTasks: projectTasks.length, // Logic: target is number of tasks defined
            rewards: { xp: projectTasks.length * 10, gold: rewardGold, gems: rewardGems }, // Base XP reward for Project Completion?
            tasks: projectTasks
        });
        setIsCreating(false);
        setProjectTasks([]);
    };

    const handleJoin = async (projectId: any) => {
        try {
            const newTasks = await joinProject({ guildId, projectId });
            // Add tasks to local store (with mapped IDs probably handled by backend or just raw?)
            // Backend returns raw objects. We need to ensure they have unique IDs for the user?
            // Or the backend storedTasks have generic IDs (t-1).
            // If multiple users join, they get same task IDs? That might conflict if global IDs?
            // `gamestate.tasks` are user-specific. So ID collision only matters within one user's list.
            // As long as Project 1 tasks don't clash with Project 2 tasks.
            // We should probably re-id them or ensure `t-guild-projId-taskId` format?
            // For now assume backend or creation ensured distinct enough IDs (Date.now() above is weak but ok for demo).

            // Map tasks to ensure they belong to this project ID in the user's quest log
            const mappedTasks = newTasks.map((t: any) => ({
                ...t,
                projectId: projectId, // This ensures they go to the right column/group
                completed: false,
                type: 'guild', // New type? Or 'main'
                energyCost: 10 // Default
            }));

            addTasks(mappedTasks);
            alert("Joined Project! Tasks added to your Quest Log.");
        } catch (e: any) {
            alert("Failed to join: " + e.message);
        }
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
                <div className="bg-amber-900/20 border border-amber-500/20 p-4 rounded-lg mb-4 flex justify-between items-center">
                    <div>
                        <p className="text-xs text-amber-400 font-bold uppercase tracking-wider">Treasury Funds Available</p>
                        <p className="text-white font-mono text-sm">Use these funds to incentivize completion.</p>
                    </div>
                    <div className="text-right">
                        <p className="text-amber-400 font-mono font-bold">{treasury.gold?.toLocaleString() ?? 0} Gold</p>
                        <p className="text-cyan-400 font-mono font-bold">{treasury.gems?.toLocaleString() ?? 0} Gems</p>
                    </div>
                </div>

                <form onSubmit={handleCreate} className="space-y-4">
                    <div>
                        <label className="block text-slate-400 text-xs font-bold mb-1">Project Title</label>
                        <input name="title" type="text" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white" required />
                    </div>
                    <div>
                        <label className="block text-slate-400 text-xs font-bold mb-1">Description</label>
                        <textarea name="description" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white h-20 resize-none" />
                    </div>

                    {/* Dynamic Task Creator */}
                    <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                        <label className="block text-slate-400 text-xs font-bold mb-2">Project Tasks ({projectTasks.length})</label>
                        <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
                            {projectTasks.map((t, i) => (
                                <div key={i} className="flex justify-between items-center bg-slate-800 p-2 rounded text-sm">
                                    <span className="text-white">{t.name}</span>
                                    <span className="text-xs text-slate-400">{t.difficulty} | {t.xpReward} XP</span>
                                </div>
                            ))}
                            {projectTasks.length === 0 && <p className="text-slate-600 text-sm italic">No tasks added yet.</p>}
                        </div>

                        <div className="flex gap-2">
                            <input
                                value={newTaskName}
                                onChange={e => setNewTaskName(e.target.value)}
                                placeholder="Task Name"
                                className="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm text-white"
                            />
                            <select
                                value={newTaskDiff}
                                onChange={e => setNewTaskDiff(e.target.value)}
                                className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm text-white"
                            >
                                <option value="EASY">Easy</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HARD">Hard</option>
                            </select>
                            <button type="button" onClick={handleAddTask} className="bg-green-600 text-white px-3 py-1 rounded text-sm font-bold">+</button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-700/50">
                        <div>
                            <label className="block text-amber-400 text-xs font-bold mb-1">Gold Reward Pool</label>
                            <input
                                type="number"
                                value={rewardGold}
                                onChange={e => setRewardGold(Math.max(0, parseInt(e.target.value) || 0))}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                            />
                            <p className="text-[10px] text-slate-500 mt-1">
                                {(treasury.gold || 0) < rewardGold ? <span className="text-red-400">Insufficient Funds</span> : "Allocated from Treasury"}
                            </p>
                        </div>
                        <div>
                            <label className="block text-cyan-400 text-xs font-bold mb-1">Gems Reward Pool</label>
                            <input
                                type="number"
                                value={rewardGems}
                                onChange={e => setRewardGems(Math.max(0, parseInt(e.target.value) || 0))}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                            />
                            <p className="text-[10px] text-slate-500 mt-1">
                                {(treasury.gems || 0) < rewardGems ? <span className="text-red-400">Insufficient Funds</span> : "Allocated from Treasury"}
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-2 pt-4">
                        <button type="button" onClick={() => setIsCreating(false)} className="flex-1 bg-slate-700 text-white py-2 rounded-lg font-bold">Cancel</button>
                        <button type="submit" disabled={!canAfford} className="flex-1 bg-indigo-600 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed hover:bg-indigo-500 text-white py-2 rounded-lg font-bold">Start Project</button>
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

            {/* NEW: Guild Bounties Section */}
            {projects && projects.length > 0 && (
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 mb-6">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <ListChecks size={16} /> Available Bounties
                    </h3>
                    <div className="grid gap-2">
                        {projects.flatMap(p => (
                            p.storedTasks?.map((t: any) => ({ ...t, projectName: p.title, projectId: p._id })) || []
                        )).map((task: any, i: number) => {
                            // Find matching user task
                            const userTask = tasks.find(t => t.type === 'guild' && t.projectId === task.projectId && t.name === task.name);
                            const isCompleted = userTask?.completed;
                            const hasJoined = !!userTask;

                            return (
                                <div key={i} className={`flex items-center justify-between bg-slate-900/50 border ${isCompleted ? 'border-green-500/30 bg-green-900/10' : 'border-slate-700/50'} p-3 rounded-xl transition-all`}>
                                    <div className="flex items-center gap-4">
                                        {/* Status Icon / Action */}
                                        {hasJoined ? (
                                            <button
                                                onClick={() => !isCompleted && handleQuickComplete(userTask.id, task.projectId)}
                                                disabled={isCompleted}
                                                className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all ${isCompleted
                                                    ? 'bg-green-500 border-green-500 text-white'
                                                    : 'border-slate-600 hover:border-indigo-500 hover:bg-indigo-500/20 text-transparent'
                                                    }`}
                                            >
                                                {isCompleted && <CheckCircle size={14} />}
                                            </button>
                                        ) : (
                                            <div className="w-6 h-6 rounded-full border-2 border-slate-700 border-dashed flex items-center justify-center" title="Join project to start">
                                                <Lock size={12} className="text-slate-600" />
                                            </div>
                                        )}

                                        <div>
                                            <p className={`font-bold ${isCompleted ? 'text-slate-500 line-through' : 'text-slate-200'}`}>{task.name}</p>
                                            <p className="text-[10px] text-slate-500 flex items-center gap-1">
                                                {task.projectName}
                                                <span className="w-1 h-1 rounded-full bg-slate-600" />
                                                <span className={`${task.difficulty === 'HARD' ? 'text-red-400' : task.difficulty === 'MEDIUM' ? 'text-amber-400' : 'text-green-400'}`}>
                                                    {task.difficulty}
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="text-right">
                                            <span className="block text-xs font-bold text-indigo-400">+{task.xpReward} XP</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        {projects.every(p => !p.storedTasks?.length) && (
                            <p className="text-xs text-slate-500 italic">No specific tasks defined for these projects.</p>
                        )}
                    </div>
                </div>
            )}

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
                    {projects.map(project => {
                        const isJoined = me && project.joinedUserIds?.includes(me._id); // Assuming me is { _id: ... }

                        return (
                            <div key={project._id} className="bg-slate-800 border border-slate-700 rounded-xl p-5">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-white">{project.title}</h3>
                                        <p className="text-slate-400 text-sm">{project.description}</p>
                                        <div className="flex gap-2 mt-2">
                                            <span className="text-xs bg-amber-900/30 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20">
                                                {project.rewards.gold} Gold
                                            </span>
                                            {project.rewards.gems ? (
                                                <span className="text-xs bg-cyan-900/30 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/20">
                                                    {project.rewards.gems} Gems
                                                </span>
                                            ) : null}
                                        </div>
                                    </div>

                                    {isJoined ? (
                                        <div className="flex flex-col items-end">
                                            <span className="bg-green-600/20 text-green-400 px-3 py-1 rounded-full text-xs font-bold border border-green-600/30 flex items-center gap-1">
                                                <CheckCircle size={12} /> Active
                                            </span>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => handleJoin(project._id)}
                                            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-lg shadow-indigo-600/20"
                                        >
                                            Join Quest
                                        </button>
                                    )}
                                </div>
                                {/* REMOVED EXTRA CLOSING DIV */}

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

                                    <span className="text-xs text-slate-500 italic">Complete tasks in Quest Log to contribute</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

const GuildSettings: React.FC<{ guild: any, membership: any, members: any[] }> = ({ guild, membership, members }) => {
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

export const Guild: React.FC = () => {
    const { stats } = useGameStore();
    const myGuilds = useQuery(api.guilds.getMyGuilds);
    const [activeGuildId, setActiveGuildId] = useState<string | null>(null);
    const [view, setView] = useState<'dashboard' | 'browse' | 'create'>('dashboard');
    const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'chat' | 'settings'>('overview');

    useEffect(() => {
        if (myGuilds && myGuilds.length > 0 && !activeGuildId) {
            setActiveGuildId(myGuilds[0].guild._id);
            setView('dashboard');
        } else if (myGuilds && myGuilds.length === 0) {
            setView('browse');
        }
    }, [myGuilds, activeGuildId]);

    const activeGuildConfig = myGuilds?.find(g => g.guild._id === activeGuildId);

    // Fetch members and activity only if we have an active guild
    const guildId = activeGuildConfig?.guild?._id;
    const guildMembers = useQuery(api.guilds.getGuildMembers, guildId ? { guildId } : "skip");
    const guildActivity = useQuery(api.guilds.getGuildActivity, guildId ? { guildId } : "skip");
    const guildProjects = useQuery(api.guilds.getGuildProjects, guildId ? { guildId } : "skip");

    // Invite System
    const createInvite = useMutation(api.guilds.createInvite);
    const [inviteCode, setInviteCode] = useState<string | null>(null);
    const [isGeneratingInvite, setIsGeneratingInvite] = useState(false);

    // Leave Guild System
    const leaveGuild = useMutation(api.guilds.leaveGuild);
    const [isLeaving, setIsLeaving] = useState(false);

    const handleLeave = async () => {
        if (!activeGuildId) return;
        if (!confirm("Are you sure you want to leave this guild? You will lose your contributions.")) return;
        setIsLeaving(true);
        try {
            await leaveGuild({ guildId: activeGuildId });
            // After leaving, if we have other guilds, switch to one of them?
            // The query update will remove this guild from list.
            // We should rely on useEffect to reset activeGuildId if current becomes invalid.
            setActiveGuildId(null); // This will trigger the useEffect to pick a new active guild or go to browse
        } catch (error) {
            console.error("Failed to leave guild:", error);
            alert("Failed to leave guild. Leaders must transfer leadership or disband the guild.");
        } finally {
            setIsLeaving(false);
        }
    };

    // Announcement System
    const announcements = useQuery(api.guildChat.getAnnouncements, guildId ? { guildId } : "skip");
    const postAnnouncement = useMutation(api.guildChat.postAnnouncement);
    const deleteAnnouncement = useMutation(api.guildChat.deleteAnnouncement);
    const updateAnnouncement = useMutation(api.guildChat.updateAnnouncement);
    const toggleLike = useMutation(api.guildChat.toggleAnnouncementLike);

    const [isPostingAnnouncement, setIsPostingAnnouncement] = useState(false);
    const [announcementText, setAnnouncementText] = useState("");
    const [isPostPanelOpen, setIsPostPanelOpen] = useState(false);
    const [editingAnnouncementId, setEditingAnnouncementId] = useState<string | null>(null);
    const [viewingAnnouncement, setViewingAnnouncement] = useState<any>(null);

    const handlePostAnnouncement = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!announcementText.trim() || !guildId || announcementText === "<p><br></p>") return;

        try {
            if (editingAnnouncementId) {
                await updateAnnouncement({
                    messageId: editingAnnouncementId as any,
                    guildId,
                    content: announcementText
                });
            } else {
                await postAnnouncement({ guildId, content: announcementText });
            }
            setAnnouncementText("");
            setEditingAnnouncementId(null);
            setIsPostingAnnouncement(false);
            setIsPostPanelOpen(false);
        } catch (error) {
            console.error("Failed to post/update announcement", error);
        }
    }

    const handleDeleteAnnouncement = async (messageId: any) => {
        if (!guildId) return;
        if (!confirm("Delete this announcement?")) return;
        try {
            await deleteAnnouncement({ messageId, guildId });
        } catch (error) {
            console.error("Failed to delete", error);
        }
    }

    // Treasury Donation
    const donate = useMutation(api.guilds.donateToTreasury);
    const [isDonating, setIsDonating] = useState(false);

    const handleDonate = async (amount: number, currency: 'gold' | 'gems') => {
        if (!guildId) return;

        try {
            await donate({ guildId, amount, currency });

            // Sync local store immediately
            useGameStore.getState().deductCurrency(amount, currency);

            // Optional: Show success feedback? Modal handles closing.
        } catch (error) {
            console.error("Donation failed:", error);
            alert("Donation failed. Please try again.");
            throw error; // Re-throw so modal knows to stay open or handle error
        }
    };

    const handleInvite = async () => {
        if (!guildId) return;
        setIsGeneratingInvite(true);
        try {
            // Check if we already have a valid code? For now just generate new one
            const code = await createInvite({ guildId });
            setInviteCode(code);
        } catch (error) {
            console.error("Failed to generate invite:", error);
        } finally {
            setIsGeneratingInvite(false);
        }
    };

    // Quick Action States
    const [triggerProjectCreation, setTriggerProjectCreation] = useState(false);

    // Loading State
    if (myGuilds === undefined) {
        return (
            <div className="w-full h-[60vh] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    // If NO guilds at all, or explicitly in browse/create view
    if (myGuilds.length === 0 || view === 'browse' || view === 'create') {
        if (view === 'create') {
            return <CreateGuildForm
                onCancel={() => setView('browse')}
                onSuccess={(newGuildId) => {
                    setActiveGuildId(newGuildId);
                    setView('dashboard');
                }}
            />;
        }
        return (
            <div className="w-full pb-32 pl-4 pr-4">
                {myGuilds.length > 0 && view === 'browse' && (
                    <div className="max-w-4xl mx-auto mb-6">
                        <button
                            onClick={() => {
                                setActiveGuildId(myGuilds[0].guild._id); // Go back to first guild if available
                                setView('dashboard');
                            }}
                            className="flex items-center gap-2 text-slate-400 hover:text-white"
                        >
                            <ArrowLeft size={16} /> Back to My Guilds
                        </button>
                    </div>
                )}
                <GuildBrowser
                    onCreateClick={() => setView('create')}
                    onJoinClick={(newGuildId) => {
                        setActiveGuildId(newGuildId);
                        setView('dashboard');
                    }}
                    myGuildIds={myGuilds.map(g => g.guild._id)}
                />
            </div>
        );
    }

    // Confirm we have an active guild config selected
    if (!activeGuildConfig) {
        return (
            <div className="w-full h-[60vh] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    // HAS GUILD STATE -> Show Dashboard for activeGuildId
    const { guild, memberCount, membership } = activeGuildConfig;
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
            {/* Header Section */}


            <div className="w-full flex flex-col lg:flex-row gap-8 items-start">
                {/* Main Content - Left/Center */}
                <div className="flex-1 min-w-0 space-y-8">
                    {/* Header Section */}
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
                                    onClick={() => setIsDonating(true)}
                                    className="w-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 hover:text-amber-300 border border-amber-500/20 hover:border-amber-500/50 rounded-lg py-2 text-xs font-bold transition-colors flex items-center justify-center gap-2"
                                >
                                    <Plus size={14} />
                                    Donate
                                </button>
                            </div>
                        </div>
                    </div>
                    {/* Navigation Tabs */}
                    <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-4">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${activeTab === 'overview' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'}`}
                        >
                            Overview
                        </button>
                        <button
                            onClick={() => setActiveTab('projects')}
                            className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${activeTab === 'projects' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'}`}
                        >
                            Projects
                        </button>
                        <button
                            onClick={() => setActiveTab('chat')}
                            className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors flex items-center gap-2 ${activeTab === 'chat' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'}`}
                        >
                            <MessageCircle size={16} />
                            Chat
                        </button>
                        {isOfficer && (
                            <button
                                onClick={() => setActiveTab('settings')}
                                className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors flex items-center gap-2 ${activeTab === 'settings' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'}`}
                            >
                                <Sliders size={16} />
                                Settings
                            </button>
                        )}
                    </div>

                    {activeTab === 'chat' ? (
                        <GuildChat guildId={guild._id} currentUserId={membership.userId} />
                    ) : activeTab === 'projects' ? (
                        <GuildProjects
                            guildId={guild._id}
                            isOfficer={isOfficer}
                            forceCreate={triggerProjectCreation}
                            onResetForceCreate={() => setTriggerProjectCreation(false)}
                        />
                    ) : activeTab === 'settings' && isOfficer ? (
                        <GuildSettings guild={guild} membership={membership} members={guildMembers || []} />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Announcements Section */}
                            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 flex flex-col overflow-hidden max-h-[600px] h-fit">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                        <Megaphone className="text-amber-400" size={20} />
                                        Announcements
                                    </h3>
                                    {isOfficer && (
                                        <button
                                            onClick={() => setIsPostPanelOpen(true)}
                                            className="text-xs font-bold text-indigo-400 hover:text-indigo-300"
                                        >
                                            + Post
                                        </button>
                                    )}
                                </div>

                                {/* SIDE PANEL FOR POSTING */}
                                {isPostPanelOpen && (
                                    <div className="fixed inset-0 top-16 z-[100] flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                                        <div className="w-full max-w-xl bg-slate-900 border-l border-slate-700 h-[calc(100vh-64px)] flex flex-col shadow-2xl animate-in slide-in-from-right duration-500">
                                            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center">
                                                        <Megaphone className="text-indigo-400" size={20} />
                                                    </div>
                                                    <div>
                                                        <h2 className="text-xl font-bold text-white">{editingAnnouncementId ? "Edit Announcement" : "Create Announcement"}</h2>
                                                        <p className="text-xs text-slate-500">{editingAnnouncementId ? "Update your message for the guild" : "Draft a rich-text message for the guild"}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => setIsPostPanelOpen(false)}
                                                    className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"
                                                >
                                                    <X size={20} />
                                                </button>
                                            </div>

                                            <div className="flex-1 overflow-hidden p-6">
                                                <RichTextEditor
                                                    value={announcementText}
                                                    onChange={setAnnouncementText}
                                                />
                                            </div>

                                            <div className="p-6 border-t border-slate-800 bg-slate-900/50 flex gap-4">
                                                <button
                                                    onClick={() => {
                                                        setIsPostPanelOpen(false);
                                                        setEditingAnnouncementId(null);
                                                        setAnnouncementText("");
                                                    }}
                                                    className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-colors"
                                                >
                                                    Discard
                                                </button>
                                                <button
                                                    onClick={handlePostAnnouncement}
                                                    disabled={!announcementText.trim() || announcementText === "<p><br></p>"}
                                                    className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-50"
                                                >
                                                    {editingAnnouncementId ? "Save Changes" : "Post Announcement"}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-4 flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar pr-2">
                                    {!announcements ? (
                                        <div className="text-center text-slate-500 text-xs">Loading...</div>
                                    ) : announcements.length === 0 ? (
                                        <div className="text-center text-slate-500 text-sm py-4 italic">
                                            No announcements.
                                        </div>
                                    ) : (
                                        announcements.map((msg) => (
                                            <AnnouncementListItem
                                                key={msg._id}
                                                announcement={msg}
                                                guildId={guild._id}
                                                isOfficer={isOfficer}
                                                onView={() => setViewingAnnouncement(msg)}
                                                onEdit={() => {
                                                    setEditingAnnouncementId(msg._id);
                                                    setAnnouncementText(msg.content);
                                                    setIsPostPanelOpen(true);
                                                }}
                                                onDelete={() => handleDeleteAnnouncement(msg._id)}
                                                onToggleLike={() => toggleLike({ guildId: guild._id, messageId: msg._id })}
                                            />
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Projects Card */}
                            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 max-h-[600px] h-fit flex flex-col">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <Target className="text-indigo-400" size={20} />
                                        <h3 className="text-lg font-bold text-white">Projects</h3>
                                    </div>
                                    {isOfficer && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveTab('projects');
                                                setTriggerProjectCreation(true);
                                            }}
                                            className="text-xs font-bold text-indigo-400 hover:text-indigo-300"
                                        >
                                            + New
                                        </button>
                                    )}
                                </div>
                                <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-1">
                                    {!guildProjects ? (
                                        <div className="text-center text-slate-500 text-xs">Loading...</div>
                                    ) : guildProjects.filter(p => p.status === 'active').length === 0 ? (
                                        <div className="text-center text-slate-500 text-sm py-4 italic">
                                            No active projects.
                                        </div>
                                    ) : (
                                        guildProjects.filter(p => p.status === 'active').map((project) => (
                                            <div
                                                key={project._id}
                                                onClick={() => setActiveTab('projects')}
                                                className="bg-indigo-500/5 border border-indigo-500/20 rounded-lg p-3 cursor-pointer hover:border-indigo-500/40 transition-colors"
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <h4 className="text-sm font-bold text-white truncate">{project.title}</h4>
                                                    <span className="text-[10px] text-indigo-400 font-mono">
                                                        {project.completedTasks}/{project.targetTasks}
                                                    </span>
                                                </div>
                                                <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-indigo-500 rounded-full transition-all"
                                                        style={{ width: `${Math.min(100, (project.completedTasks / project.targetTasks) * 100)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                                <button
                                    onClick={() => setActiveTab('projects')}
                                    className="w-full mt-4 bg-indigo-600/10 border border-indigo-600/20 text-indigo-400 hover:bg-indigo-600 hover:text-white text-center py-2 rounded-lg text-sm font-bold transition-all"
                                >
                                    View All Projects
                                </button>
                            </div>

                            {/* ORPHANED: Activity Feed - Will be added back elsewhere later
                            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 h-full flex flex-col">
                                <div className="flex items-center gap-3 mb-4">
                                    <Sparkles className="text-amber-400" size={20} />
                                    <h3 className="text-lg font-bold text-white">Activity</h3>
                                </div>
                                <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar max-h-[300px] pr-1">
                                    {!guildActivity ? (
                                        <div className="text-center text-slate-500 text-sm py-4">Loading...</div>
                                    ) : guildActivity.length === 0 ? (
                                        <div className="text-center text-slate-500 text-sm py-4">No recent activity.</div>
                                    ) : (
                                        guildActivity.map((activity) => (
                                            <div key={activity._id} className="flex items-start gap-2.5 text-xs">
                                                <div className="w-6 h-6 bg-slate-700 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden mt-0.5">
                                                    {activity.userPictureUrl ? (
                                                        <img src={activity.userPictureUrl} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="font-bold text-[10px] text-white uppercase">{activity.userName.substring(0, 2)}</span>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-slate-300 leading-snug">
                                                        <span className="font-bold text-white">{activity.userName}</span>
                                                        {' '}
                                                        {activity.type === 'joined' && 'joined'}
                                                        {activity.type === 'guild_created' && 'created guild'}
                                                        {activity.type === 'left' && 'left'}
                                                        {activity.type === 'kicked' && 'was kicked'}
                                                        {activity.type === 'promoted' && `promoted to ${activity.data.newRole}`}
                                                        {activity.type === 'project_started' && `started "${activity.data.projectTitle}"`}
                                                        {activity.type === 'project_completed' && `completed "${activity.data.projectTitle}"`}
                                                    </p>
                                                    <p className="text-[10px] text-slate-600 mt-0.5">
                                                        {new Date(activity.timestamp).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                            */}

                            {/* Bounty Board */}
                            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 max-h-[600px] h-fit flex flex-col">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                        <Scroll className="text-amber-400" size={20} />
                                        Bounty Board
                                    </h3>
                                    {isOfficer && (
                                        <button
                                            onClick={() => alert("Bounty System Coming Soon!")}
                                            className="text-xs font-bold text-amber-400 hover:text-amber-300"
                                        >
                                            + New
                                        </button>
                                    )}
                                </div>
                                <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-1">
                                    {/* Placeholder - replace with actual bounty data later */}
                                    <div className="flex flex-col items-center justify-center text-center p-6 bg-slate-900/30 rounded-lg border border-slate-700/30 border-dashed">
                                        <Scroll className="text-slate-600 mb-2" size={32} />
                                        <p className="text-slate-500 text-sm font-medium">No active bounties</p>
                                        <p className="text-slate-600 text-xs mt-1">Check back later for new guild tasks</p>
                                    </div>
                                </div>
                                <button className="w-full mt-4 bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 hover:text-amber-300 py-2 rounded-lg text-xs font-bold transition-colors">
                                    View All Bounties
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar - Right */}
                <div className="w-full lg:w-80 shrink-0">
                    <div className="sticky top-4 space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <Users size={14} />
                                Guild Members ({memberCount} / 50)
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
                                            id: member._id,
                                            name: member.userName,
                                            level: member.level,
                                            role: member.role === 'leader' ? 'Leader' : member.role === 'officer' ? 'Officer' : 'Member',
                                            avatarId: member.avatarId,
                                            weaponId: member.weaponId,
                                            armorId: member.armorId,
                                            companionId: member.companionId,
                                            backdropId: member.backdropId
                                        }}
                                        isUser={false}
                                    />
                                ))
                            )}
                        </div>

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
                                        onClick={() => setActiveGuildId(g.guild._id)}
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
                                onClick={() => setView('browse')}
                                className="w-full flex items-center justify-center gap-2 p-2 text-xs font-bold text-slate-500 hover:text-indigo-400 transition-colors border border-dashed border-slate-700 hover:border-indigo-500/50 rounded-lg"
                            >
                                <Plus size={14} />
                                Join Another Guild
                            </button>
                        </div>

                        {/* Leave Guild Button */}
                        <div className="pt-4 border-t border-slate-700/50">
                            <button
                                onClick={handleLeave}
                                disabled={isLeaving || membership.role === 'leader'}
                                className="w-full flex items-center justify-center gap-2 text-slate-500 hover:text-red-400 text-xs font-bold uppercase tracking-wider py-2 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                title={membership.role === 'leader' ? "Leaders must disband or transfer leadership" : "Leave this Guild"}
                            >
                                <LogOut size={14} />
                                {isLeaving ? 'Leaving...' : 'Leave Guild'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>



            {/* Donation Modal */}
            <DonationModal
                isOpen={isDonating}
                onClose={() => setIsDonating(false)}
                userGold={stats.gold || 0}
                userGems={stats.gems || 0}
                onDonate={handleDonate}
            />

            {/* Announcement Detail Modal */}
            {viewingAnnouncement && (
                <AnnouncementModal
                    announcement={viewingAnnouncement}
                    onClose={() => setViewingAnnouncement(null)}
                    onToggleLike={() => toggleLike({ guildId: guild._id, messageId: viewingAnnouncement._id })}
                />
            )}
        </div>
    );
};

export default Guild;
