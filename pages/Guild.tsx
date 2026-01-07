import React, { useState } from 'react';
import { Users, Shield, Trophy, Target, Crown, Sparkles, Sliders, ChevronDown, ChevronUp, Search, Plus, Lock, Globe, MessageCircle, Share, Copy, LogOut, Megaphone, Trash2 } from 'lucide-react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useGameStore } from '../store/useGameStore';
import { ALL_COSMETIC_ITEMS, STARTER_AVATARS, COSMETIC_SHOP_ITEMS } from '../src/utils/CosmeticsData';
import { SHOP_ITEMS } from '../src/utils/GameEconomy';
import { MiniCharacterCard } from '../components/MiniCharacterCard';
import { GuildChat } from '../components/GuildChat';


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
    const joinByCode = useMutation(api.guilds.joinGuildByCode);

    const [joiningId, setJoiningId] = useState<string | null>(null);
    const [inviteCode, setInviteCode] = useState('');
    const [joiningCode, setJoiningCode] = useState(false);
    const [codeError, setCodeError] = useState<string | null>(null);

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

    const handleJoinByCode = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inviteCode.trim()) return;

        setJoiningCode(true);
        setCodeError(null);
        try {
            await joinByCode({ inviteCode: inviteCode.trim().toUpperCase() });
        } catch (err: any) {
            console.error("Failed to join by code", err);
            setCodeError(err.message || "Invalid invite code");
        } finally {
            setJoiningCode(false);
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

            <div className="bg-white/5 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden p-6 mb-8">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                    <Lock size={16} className="text-indigo-400" />
                    Have an Invite Code?
                </h3>
                <form onSubmit={handleJoinByCode} className="flex gap-2">
                    <input
                        type="text"
                        value={inviteCode}
                        onChange={(e) => setInviteCode(e.target.value)}
                        placeholder="ENTER-CODE"
                        className="bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white font-mono uppercase placeholder:normal-case placeholder:font-sans focus:outline-none focus:border-indigo-500 w-full max-w-xs"
                        maxLength={6}
                    />
                    <button
                        type="submit"
                        disabled={!inviteCode || joiningCode}
                        className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-bold transition-colors"
                    >
                        {joiningCode ? 'Joining...' : 'Join Private Guild'}
                    </button>
                </form>
                {codeError && <p className="text-red-400 text-sm mt-2">{codeError}</p>}
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
                                        <p className="text-white font-mono">{guild.memberCount} / 50</p>
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
    const guildData = useQuery(api.guilds.getGuild, { guildId });
    const createProject = useMutation(api.guilds.createProject);
    const contribute = useMutation(api.guilds.contributeToProject);

    const [isCreating, setIsCreating] = useState(false);
    const [contributionAmount, setContributionAmount] = useState<Record<string, number>>({});
    const [rewardGold, setRewardGold] = useState(100);
    const [rewardGems, setRewardGems] = useState(0);

    const treasury = guildData?.treasury || { gold: 0, gems: 0 };
    const canAfford = (treasury.gold || 0) >= rewardGold && (treasury.gems || 0) >= rewardGems;

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const title = (form.elements.namedItem('title') as HTMLInputElement).value;
        const description = (form.elements.namedItem('description') as HTMLTextAreaElement).value;
        const targetTasks = parseInt((form.elements.namedItem('target') as HTMLInputElement).value);

        if (!canAfford) {
            alert("Insufficient funds in Guild Treasury!");
            return;
        }

        await createProject({
            guildId,
            title,
            description,
            targetTasks,
            rewards: { xp: targetTasks * 10, gold: rewardGold, gems: rewardGems }
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
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-slate-400 text-xs font-bold mb-1">Target Tasks</label>
                            <input name="target" type="number" defaultValue={100} min={10} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white" required />
                        </div>
                        <div>
                            <label className="block text-slate-400 text-xs font-bold mb-1">XP Reward (Auto)</label>
                            <input type="text" disabled value="10 XP per Task" className="w-full bg-slate-900/50 border border-slate-800 rounded-lg px-3 py-2 text-slate-500" />
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
    const myGuildConfig = useQuery(api.guilds.getMyGuild);
    const [view, setView] = useState<'browse' | 'create'>('browse');
    const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'chat' | 'settings'>('overview');

    // Fetch members and activity only if we have a guild
    const guildId = myGuildConfig?.guild?._id;
    const guildMembers = useQuery(api.guilds.getGuildMembers, guildId ? { guildId } : "skip");
    const guildActivity = useQuery(api.guilds.getGuildActivity, guildId ? { guildId } : "skip");

    // Invite System
    const createInvite = useMutation(api.guilds.createInvite);
    const [inviteCode, setInviteCode] = useState<string | null>(null);
    const [isGeneratingInvite, setIsGeneratingInvite] = useState(false);

    // Leave Guild System
    const leaveGuild = useMutation(api.guilds.leaveGuild);
    const [isLeaving, setIsLeaving] = useState(false);

    const handleLeave = async () => {
        if (!confirm("Are you sure you want to leave this guild? You will lose your contributions.")) return;
        setIsLeaving(true);
        try {
            await leaveGuild({});
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
    const [isPostingAnnouncement, setIsPostingAnnouncement] = useState(false);
    const [announcementText, setAnnouncementText] = useState("");

    const handlePostAnnouncement = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!announcementText.trim()) return;

        try {
            await postAnnouncement({ guildId: myGuildConfig?.guild?._id, content: announcementText });
            setAnnouncementText("");
            setIsPostingAnnouncement(false);
        } catch (error) {
            console.error("Failed to post announcement", error);
        }
    }

    const handleDeleteAnnouncement = async (messageId: any) => {
        if (!confirm("Delete this announcement?")) return;
        try {
            await deleteAnnouncement({ messageId, guildId: myGuildConfig?.guild?._id });
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
        setIsGeneratingInvite(true);
        try {
            // Check if we already have a valid code? For now just generate new one
            const code = await createInvite({ guildId: myGuildConfig?.guild?._id });
            setInviteCode(code);
        } catch (error) {
            console.error("Failed to generate invite:", error);
        } finally {
            setIsGeneratingInvite(false);
        }
    };

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

                        {/* Guild Level & XP */}
                        <div className="max-w-md mx-auto mt-6 mb-8">
                            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                                <span>Level {guild.level}</span>
                                <span className="text-white">{Math.floor(guild.xp)} / {guild.level * 1000} XP</span>
                            </div>
                            <div className="h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700 relative group">
                                <div
                                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                                    style={{ width: `${Math.min(100, (guild.xp / (guild.level * 1000)) * 100)}%` }}
                                />
                                {/* Tooltip on hover */}
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 flex items-center justify-center text-[10px] font-mono text-white pointer-events-none">
                                    {(guild.level * 1000) - Math.floor(guild.xp)} XP to Level {guild.level + 1}
                                </div>
                            </div>
                        </div>

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
                            <button
                                onClick={() => setActiveTab('chat')}
                                className={`px-4 py-2 rounded-full font-bold text-sm transition-colors flex items-center gap-2 ${activeTab === 'chat' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                            >
                                <MessageCircle size={16} />
                                Chat
                            </button>
                            {isOfficer && (
                                <button
                                    onClick={() => setActiveTab('settings')}
                                    className={`px-4 py-2 rounded-full font-bold text-sm transition-colors flex items-center gap-2 ${activeTab === 'settings' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                                >
                                    <Sliders size={16} />
                                    Settings
                                </button>
                            )}
                        </div>
                    </div>

                    {activeTab === 'chat' ? (
                        <GuildChat guildId={guild._id} currentUserId={membership.userId} />
                    ) : activeTab === 'projects' ? (
                        <GuildProjects guildId={guild._id} isOfficer={isOfficer} />
                    ) : activeTab === 'settings' && isOfficer ? (
                        <GuildSettings guild={guild} membership={membership} members={guildMembers || []} />
                    ) : (
                        <>
                            {/* Announcements Section */}
                            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                        <Megaphone className="text-amber-400" size={20} />
                                        Announcements
                                    </h3>
                                    {isOfficer && !isPostingAnnouncement && (
                                        <button
                                            onClick={() => setIsPostingAnnouncement(true)}
                                            className="text-xs font-bold text-indigo-400 hover:text-indigo-300"
                                        >
                                            + Post Update
                                        </button>
                                    )}
                                </div>

                                {isPostingAnnouncement && (
                                    <form onSubmit={handlePostAnnouncement} className="mb-6 bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                                        <textarea
                                            value={announcementText}
                                            onChange={(e) => setAnnouncementText(e.target.value)}
                                            placeholder="Write an announcement..."
                                            className="w-full bg-slate-800 border-none rounded-lg p-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 mb-2 resize-none"
                                            rows={3}
                                            autoFocus
                                        />
                                        <div className="flex justify-end gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setIsPostingAnnouncement(false)}
                                                className="px-3 py-1 text-xs font-bold text-slate-400 hover:text-white"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={!announcementText.trim()}
                                                className="px-3 py-1 text-xs font-bold bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 disabled:opacity-50"
                                            >
                                                Post
                                            </button>
                                        </div>
                                    </form>
                                )}

                                <div className="space-y-4">
                                    {!announcements ? (
                                        <div className="text-center text-slate-500 text-xs">Loading updates...</div>
                                    ) : announcements.length === 0 ? (
                                        <div className="text-center text-slate-500 text-sm py-4 italic">
                                            No announcements yet.
                                        </div>
                                    ) : (
                                        announcements.map((msg) => (
                                            <div key={msg._id} className="relative bg-amber-500/5 border border-amber-500/20 rounded-lg p-4">
                                                <div className="flex items-start gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                                                        <Megaphone size={14} className="text-amber-400" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex justify-between items-start">
                                                            <span className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-1 block">
                                                                {msg.userName} • {new Date(msg._creationTime).toLocaleDateString()}
                                                            </span>
                                                            {isOfficer && (
                                                                <button
                                                                    onClick={() => handleDeleteAnnouncement(msg._id)}
                                                                    className="text-slate-600 hover:text-red-400 transition-colors"
                                                                >
                                                                    <Trash2 size={12} />
                                                                </button>
                                                            )}
                                                        </div>
                                                        <p className="text-white text-sm whitespace-pre-wrap">{msg.content}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Dashboard Cards (Treasury & Projects Summary) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                {/* Treasury Card */}
                                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <Crown className="text-yellow-400" size={24} />
                                        <h3 className="text-lg font-bold text-white">Treasury</h3>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50 text-center">
                                            <span className="block text-2xl font-black text-amber-400">{guild.treasury?.gold || 0}</span>
                                            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Gold</span>
                                        </div>
                                        <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50 text-center">
                                            <span className="block text-2xl font-black text-cyan-400">{guild.treasury?.gems || 0}</span>
                                            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Gems</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setIsDonating(true)}
                                        className="w-full mt-4 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 hover:text-amber-300 border border-amber-500/20 hover:border-amber-500/50 rounded-lg py-2 text-sm font-bold transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Plus size={16} />
                                        Donate to Treasury
                                    </button>
                                </div>

                                {/* Active Projects Summary */}
                                <div
                                    onClick={() => setActiveTab('projects')}
                                    className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 cursor-pointer hover:border-indigo-500 transition-colors group"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <Target className="text-indigo-400 group-hover:text-indigo-300" size={24} />
                                            <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">Projects</h3>
                                        </div>
                                        <ChevronDown className="-rotate-90 text-slate-500 group-hover:text-white" />
                                    </div>
                                    <p className="text-slate-400 text-sm mb-4">
                                        Work together on guild goals to earn XP and rewards.
                                    </p>
                                    <div className="w-full bg-indigo-600/10 border border-indigo-600/20 text-indigo-400 text-center py-2 rounded-lg text-sm font-bold group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                        View Projects
                                    </div>
                                </div>
                            </div>

                            {/* Activity Feed */}
                            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <Sparkles className="text-amber-400" size={20} />
                                    <h3 className="text-lg font-bold text-white">Activity Feed</h3>
                                </div>

                                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
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


                        </>
                    )}
                </div>

                {/* Guild Members Column - Right edge */}
                <div className="w-full lg:w-auto lg:min-w-[420px] ml-auto">
                    <div className="sticky top-20 space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
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

                        <button
                            onClick={handleInvite}
                            disabled={isGeneratingInvite}
                            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-xl text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
                        >
                            <Share size={16} />
                            {isGeneratingInvite ? 'Generating...' : 'Invite Friends'}
                        </button>

                        {/* Invite Code Modal / Popover (Inline for now) */}
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

                        {/* Leave Guild Button */}
                        <div className="mt-4 pt-4 border-t border-slate-700/50">
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
        </div>
    );
};
