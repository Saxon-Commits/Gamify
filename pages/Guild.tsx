import React, { useState, useEffect } from 'react';
import { Users, Shield, Trophy, Target, Crown, Sparkles, Sliders, ChevronDown, ChevronUp, Search, Plus, Lock, Globe, MessageCircle, Share, Copy, LogOut, Megaphone, Trash2, CheckCircle, ListChecks, Scroll, ArrowLeft, Pencil, Heart } from 'lucide-react';
import { useQuery, useMutation } from "convex/react";

import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";

import { AnnouncementsCard } from '../components/announcements/AnnouncementsCard';
import { GuildMembersPanel } from '../components/guild/GuildMembersPanel';
import { ProjectsCard } from '../components/projects/ProjectsCard';
import { DonationModal } from '../components/guild/DonationModal';
import { CreateGuildForm } from '../components/guild/CreateGuildForm';
import { GuildBrowser } from '../components/guild/GuildBrowser';
import { GuildProjectsView } from '../components/guild/GuildProjectsView';
import { GuildSettings } from '../components/guild/GuildSettings';
import { BountyBoardCard } from '../components/guild/BountyBoardCard';
import { GuildBountyBoard } from '../components/guild/GuildBountyBoard';
import { CreateBountyModal } from '../components/guild/CreateBountyModal'; // Import needed if we want to show it from Overview
// Actually better to handle it inside GuildBountyBoard, or lift state.
// Let's use GuildBountyBoard as the main view.
import { GuildHeader } from '../components/guild/GuildHeader';
import { GuildChat } from '../components/guild/GuildChat';
// import { GuildActivityFeed } from '../components/guild/GuildActivityFeed';
import { useGameStore } from '../store/useGameStore';
import { STARTER_AVATARS, ALL_COSMETIC_ITEMS, COSMETIC_SHOP_ITEMS } from '../src/utils/CosmeticsData';
import { SHOP_ITEMS } from '../src/utils/GameEconomy';



// Types for member loadout (Mock for compatibility with MemberEditPanel until we fully wire it up)
interface MemberLoadout {
    id: string;
    name: string;
    level: number;
    role: 'Leader' | 'Officer' | 'Member';
    avatarId: string;
    armorId: string | null;
    companionId: string | null;
    backdropId: string | null;
}

// Get all available options for dropdowns
const ALL_AVATARS = [...STARTER_AVATARS, ...ALL_COSMETIC_ITEMS.filter(i => i.type === 'AVATAR')];
const ALL_ARMORS = [...SHOP_ITEMS.filter(i => i.slots?.includes('ARMOR')), ...ALL_COSMETIC_ITEMS.filter(i => i.slots?.includes('ARMOR'))];
const ALL_COMPANIONS = ALL_COSMETIC_ITEMS.filter(i => i.type === 'COMPANION' || i.slots?.includes('ACCESSORY'));
const ALL_BACKDROPS = COSMETIC_SHOP_ITEMS.filter(i => i.type === 'THEME');

// --- COMPONENTS ---













export const Guild: React.FC = () => {
    const { stats } = useGameStore();
    const myGuilds = useQuery(api.guilds.general.getMyGuilds);
    const [activeGuildId, setActiveGuildId] = useState<string | null>(null);
    const [view, setView] = useState<'dashboard' | 'browse' | 'create'>('dashboard');
    const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'bounties' | 'chat' | 'settings' | 'members'>('overview');
    const [selectedGuildProjectId, setSelectedGuildProjectId] = useState<Id<"guildProjects"> | null>(null);
    const [draftProject, setDraftProject] = useState<any>(null);

    useEffect(() => {
        if (!myGuilds) return;

        // 1. No guilds exist -> Go to Browse
        if (myGuilds.length === 0) {
            setView('browse');
            if (activeGuildId) setActiveGuildId(null);
            return;
        }



        // 3. No Active ID set -> Auto-select first
        if (!activeGuildId) {
            setActiveGuildId(myGuilds[0].guild._id);
            setView('dashboard');
        }
    }, [myGuilds, activeGuildId]);

    const activeGuildConfig = myGuilds?.find(g => g.guild._id === activeGuildId);

    // Fetch members and activity only if we have an active guild
    const guildId = activeGuildConfig?.guild?._id;
    const guildMembers = useQuery(api.guilds.members.getByGuild, guildId ? { guildId } : "skip");



    // Leave Guild System
    const leaveGuild = useMutation(api.guilds.general.leave);
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

    // Treasury Donation
    const donate = useMutation(api.guilds.general.donate);
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



    // Quick Action States
    const [triggerProjectCreation, setTriggerProjectCreation] = useState(false);
    const [triggerBountyCreation, setTriggerBountyCreation] = useState(false);

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

                    {selectedGuildProjectId ? (
                        // Full Page Project Detail View
                        <GuildProjectsView
                            guildId={guild._id}
                            isOfficer={isOfficer}
                            forceCreate={triggerProjectCreation}
                            onResetForceCreate={() => setTriggerProjectCreation(false)}
                            viewProjectId={selectedGuildProjectId}
                            onSelectProject={setSelectedGuildProjectId}
                            members={guildMembers}
                            draftProject={draftProject}
                            setDraftProject={setDraftProject}
                        />
                    ) : (
                        // Standard Layout with Header & Tabs
                        <>
                            {/* Header Section */}
                            <GuildHeader guild={guild} onDonateClick={() => setIsDonating(true)} />
                            {/* Navigation Tabs */}
                            <div className="flex overflow-x-auto no-scrollbar pb-4 gap-2 border-b border-slate-800">
                                <button
                                    onClick={() => setActiveTab('overview')}
                                    className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${activeTab === 'overview' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'}`}
                                >
                                    Overview
                                </button>
                                <button
                                    onClick={() => {
                                        setActiveTab('projects');
                                        setSelectedGuildProjectId(null); // Reset selection when clicking tab
                                    }}
                                    className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${activeTab === 'projects' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'}`}
                                >
                                    Projects
                                </button>
                                <button
                                    onClick={() => setActiveTab('bounties')}
                                    className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${activeTab === 'bounties' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'}`}
                                >
                                    Bounties
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
                                <button
                                    onClick={() => setActiveTab('members')}
                                    className={`lg:hidden px-4 py-2 rounded-lg font-bold text-sm transition-colors flex items-center gap-2 flex-shrink-0 ${activeTab === 'members' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'}`}
                                >
                                    <Users size={16} />
                                    Members
                                </button>
                            </div>

                            {activeTab === 'chat' ? (
                                <GuildChat guildId={guild._id} currentUserId={membership.userId} />
                            ) : activeTab === 'members' ? (
                                <GuildMembersPanel
                                    guildId={guild._id}
                                    members={guildMembers}
                                    memberCount={memberCount}
                                    myGuilds={myGuilds}
                                    activeGuildId={activeGuildId as Id<"guilds">}
                                    membershipRole={membership.role}
                                    onSelectGuild={setActiveGuildId}
                                    onBrowseGuilds={() => setView('browse')}
                                    onLeaveGuild={handleLeave}
                                    isLeaving={isLeaving}
                                    currentUserId={membership.userId}
                                />
                            ) : activeTab === 'projects' ? (
                                <GuildProjectsView
                                    guildId={guild._id}
                                    isOfficer={isOfficer}
                                    forceCreate={triggerProjectCreation}
                                    onResetForceCreate={() => setTriggerProjectCreation(false)}
                                    viewProjectId={selectedGuildProjectId}
                                    onSelectProject={setSelectedGuildProjectId}
                                    members={guildMembers}
                                    draftProject={draftProject}
                                    setDraftProject={setDraftProject}
                                />
                            ) : activeTab === 'bounties' ? (
                                <>
                                    <GuildBountyBoard
                                        guildId={guild._id}
                                        role={membership.role as any}
                                        userId={membership.userId}
                                        treasury={guild.treasury}
                                    />
                                    {triggerBountyCreation && (
                                        <CreateBountyModal
                                            guildId={guild._id}
                                            treasury={guild.treasury}
                                            onClose={() => setTriggerBountyCreation(false)}
                                        />
                                    )}
                                </>
                            ) : activeTab === 'settings' && isOfficer ? (
                                <GuildSettings
                                    guild={guild}
                                    membership={membership}
                                    members={guildMembers || []}
                                    onDisband={() => setActiveGuildId(null)}
                                />
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {/* Announcements Section */}
                                    <AnnouncementsCard guildId={guild._id} isOfficer={isOfficer} />

                                    {/* Projects Card */}
                                    <ProjectsCard
                                        guildId={guild._id}
                                        isOfficer={isOfficer}
                                        onViewAll={() => {
                                            setActiveTab('projects');
                                            setSelectedGuildProjectId(null);
                                        }}
                                        onCreate={() => {
                                            setActiveTab('projects');
                                            setTriggerProjectCreation(true);
                                        }}
                                        onProjectClick={(projectId) => {
                                            setSelectedGuildProjectId(projectId);
                                            // setActiveTab('projects'); // No longer needed as we render based on selectedGuildProjectId
                                        }}
                                    />

                                    {/* Bounty Board */}
                                    <BountyBoardCard
                                        guildId={guild._id}
                                        isOfficer={isOfficer}
                                        onViewAll={() => setActiveTab('bounties')}
                                        onCreate={() => {
                                            setActiveTab('bounties');
                                            setTriggerBountyCreation(true);
                                        }}
                                    />
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Sidebar - Right (Desktop) */}
                <div className="hidden lg:block w-80 flex-shrink-0">
                    <GuildMembersPanel
                        guildId={guild._id}
                        members={guildMembers}
                        memberCount={memberCount}
                        myGuilds={myGuilds}
                        activeGuildId={activeGuildId as Id<"guilds">}
                        membershipRole={membership.role}
                        onSelectGuild={setActiveGuildId}
                        onBrowseGuilds={() => setView('browse')}
                        onLeaveGuild={handleLeave}
                        isLeaving={isLeaving}
                        currentUserId={membership.userId}
                    />
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

export default Guild;
