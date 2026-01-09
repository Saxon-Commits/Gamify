import React, { useState, useEffect } from 'react';
import { Target, Plus, ListChecks, CheckCircle, Lock, Users } from 'lucide-react';
import { useQuery, useMutation } from "convex/react";
import { api } from '../../convex/_generated/api';
import { useGameStore } from '../../store/useGameStore';
import { Id } from '../../convex/_generated/dataModel';

interface GuildProjectsViewProps {
    guildId: Id<"guilds">;
    isOfficer: boolean;
    forceCreate?: boolean;
    onResetForceCreate?: () => void;
    viewProjectId?: Id<"guildProjects"> | null;
    onSelectProject: (projectId: Id<"guildProjects"> | null) => void;
}

import { GuildProjectDetail } from './GuildProjectDetail';

export const GuildProjectsView: React.FC<GuildProjectsViewProps> = ({ guildId, isOfficer, forceCreate, onResetForceCreate, viewProjectId, onSelectProject }) => {
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

    const joinProject = useMutation(api.guilds.joinProject);
    const addTasks = useGameStore(state => state.addTasks);
    const tasks = useGameStore(state => state.tasks);
    const completeTask = useGameStore(state => state.completeTask);

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
            goldReward: 0,
            difficulty: newTaskDiff
        }]);
        setNewTaskName('');
    }

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const title = (form.elements.namedItem('title') as HTMLInputElement).value;
        const description = (form.elements.namedItem('description') as HTMLTextAreaElement).value;

        if (!canAfford) {
            alert("Insufficient funds in Guild Treasury!");
            return;
        }

        await createProject({
            guildId,
            title,
            description,
            targetTasks: projectTasks.length,
            rewards: { xp: projectTasks.length * 10, gold: rewardGold, gems: rewardGems },
            tasks: projectTasks
        });
        setIsCreating(false);
        setProjectTasks([]);
    };

    const handleJoin = async (projectId: any) => {
        try {
            const newTasks = await joinProject({ guildId, projectId });

            const mappedTasks = newTasks.map((t: any) => ({
                ...t,
                projectId: projectId,
                completed: false,
                type: 'guild',
                energyCost: 10
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

    const deleteProject = useMutation(api.guilds.deleteProject);
    const updateProject = useMutation(api.guilds.updateProject);

    const handleDeleteProject = async (projectId: Id<"guildProjects">) => {
        try {
            await deleteProject({ projectId });
            onSelectProject(null); // Return to list view
        } catch (e: any) {
            alert("Failed to delete project: " + e.message);
        }
    };

    const handleUpdateProject = async (projectId: Id<"guildProjects">, data: { title?: string, description?: string }) => {
        try {
            await updateProject({ projectId, ...data });
        } catch (e: any) {
            alert("Failed to update project: " + e.message);
        }
    };

    // Helper to strip HTML for preview
    const stripHtml = (html: string) => {
        if (!html) return "";
        const tmp = document.createElement("DIV");
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || "";
    };

    // --- RENDER DETAIL VIEW IF SELECTED ---
    if (viewProjectId) {
        const selectedProject = projects?.find(p => p._id === viewProjectId);
        if (selectedProject) {
            const isJoined = me && selectedProject.joinedUserIds?.includes(me._id);
            return (
                <GuildProjectDetail
                    project={selectedProject}
                    onBack={() => onSelectProject(null)}
                    isOfficer={isOfficer}
                    isJoined={!!isJoined}
                    onJoin={() => handleJoin(selectedProject._id)}
                    onDelete={handleDeleteProject}
                    onUpdate={handleUpdateProject}
                />
            );
        }
    }

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
            <div className="flex items-center justify-end">
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
                    {projects.map(project => {
                        const isJoined = me && project.joinedUserIds?.includes(me._id);

                        return (
                            <div
                                key={project._id}
                                onClick={() => onSelectProject(project._id as Id<"guildProjects">)}
                                className="bg-slate-800 border border-slate-700 rounded-xl p-5 hover:border-slate-600 hover:bg-slate-800/80 transition-all cursor-pointer group"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors mb-1">{project.title}</h3>
                                                <p className="text-xs text-slate-500 mb-2">Created: {new Date(project.createdAt).toLocaleDateString()}</p>

                                                <div className="flex gap-2">
                                                    <span className="text-xs bg-amber-900/30 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20 font-mono">
                                                        {project.rewards.gold} Gold
                                                    </span>
                                                    {project.rewards.gems ? (
                                                        <span className="text-xs bg-cyan-900/30 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/20 font-mono">
                                                            {project.rewards.gems} Gems
                                                        </span>
                                                    ) : null}
                                                </div>
                                            </div>

                                            {isJoined ? (
                                                <span className="bg-green-600/20 text-green-400 px-3 py-1 rounded-full text-xs font-bold border border-green-600/30 flex items-center gap-1">
                                                    <CheckCircle size={12} /> Joined
                                                </span>
                                            ) : (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleJoin(project._id);
                                                    }}
                                                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1 rounded-lg font-bold text-xs shadow-lg shadow-indigo-600/20"
                                                >
                                                    Join
                                                </button>
                                            )}
                                        </div>

                                        {/* Joined Members */}
                                        <div className="mt-4 pt-3 border-t border-slate-700/50 flex items-center gap-2 text-xs text-slate-400">
                                            <Users size={14} className="text-slate-500" />
                                            {project.joinedMemberCount > 0 ? (
                                                <span>
                                                    {project.previewMembers?.map((m: any) => m.name).join(", ")}
                                                    {project.joinedMemberCount > (project.previewMembers?.length || 0) && (
                                                        <span className="text-slate-500 ml-1"> + {project.joinedMemberCount - (project.previewMembers?.length || 0)} more</span>
                                                    )}
                                                </span>
                                            ) : (
                                                <span className="italic text-slate-600">No members joined yet</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
