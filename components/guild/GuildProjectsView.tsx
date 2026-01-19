import React, { useState, useEffect } from 'react';
import { Target, Plus, ListChecks, CheckCircle, Lock, Users } from 'lucide-react';
import { useQuery, useMutation } from "convex/react";
import { api } from '../../convex/_generated/api';
import { useGameStore } from '../../store/useGameStore';
import { Id } from '../../convex/_generated/dataModel';
import { CreateProjectWizard } from './CreateProjectWizard';

interface GuildProjectsViewProps {
    guildId: Id<"guilds">;
    isOfficer: boolean;
    forceCreate?: boolean;
    onResetForceCreate?: () => void;
    viewProjectId?: Id<"guildProjects"> | null;
    onSelectProject: (projectId: Id<"guildProjects"> | null) => void;
    members?: any[];
    draftProject?: any;
    setDraftProject?: (draft: any) => void;
}

import { GuildProjectDetail } from './GuildProjectDetail';

export const GuildProjectsView: React.FC<GuildProjectsViewProps> = ({ guildId, isOfficer, forceCreate, onResetForceCreate, viewProjectId, onSelectProject, members, draftProject, setDraftProject }) => {
    const projects = useQuery(api.guilds.projects.getByGuild, { guildId });
    const guildData = useQuery(api.guilds.general.get, { guildId });
    const createProject = useMutation(api.guilds.projects.create);
    const contribute = useMutation(api.guilds.projects.contribute);

    const [contributionAmount, setContributionAmount] = useState<Record<string, number>>({});

    // Wizard State
    const [isWizardOpen, setIsWizardOpen] = useState(false);

    const handleAddProject = () => {
        if (!isOfficer) return;
        setIsWizardOpen(true);
    };

    const handleLaunchProject = async (data: any) => {
        try {
            await createProject({
                guildId,
                ...data
            });

            setIsWizardOpen(false);
            // No need to set active, the query will update and show it in list.
            // Or we could auto-select the latest one if we got the ID back (Convex mutation returns ID).
            // But for now, just closing the wizard is fine. 
        } catch (error: any) {
            console.error("Failed to launch project:", error);
            alert("Failed to create project: " + error.message);
            throw error; // Re-throw for Wizard to handle state
        }
    };

    // Auto-trigger if forceCreate is true
    useEffect(() => {
        if (forceCreate && isOfficer) {
            handleAddProject();
            onResetForceCreate?.();
        }
    }, [forceCreate, isOfficer, onResetForceCreate]);

    const treasury = guildData?.treasury || { gold: 0, gems: 0 };

    const joinProject = useMutation(api.guilds.projects.join);
    const addTasks = useGameStore(state => state.addTasks);
    // const tasks = useGameStore(state => state.tasks); // Unused
    // const completeTask = useGameStore(state => state.completeTask); // Unused

    const me = useQuery(api.users.getMe);

    const handleJoin = async (projectId: any) => {
        try {
            await joinProject({ guildId, projectId });

            const project = projects?.find(p => p._id === projectId);

            if (project?.storedTasks && project.storedTasks.length > 0) {
                const mappedTasks = project.storedTasks.map((t: any) => ({
                    ...t,
                    projectId: projectId,
                    completed: false,
                    type: 'guild',
                }));
                addTasks(mappedTasks);
                alert("Joined Project! Tasks added to your Quest Log.");
            } else {
                alert("Joined Project!");
            }
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

    const deleteProject = useMutation(api.guilds.projects.remove);
    const updateProject = useMutation(api.guilds.projects.update);

    const handleDeleteProject = async (projectId: Id<"guildProjects">) => {
        try {
            await deleteProject({ projectId });
            onSelectProject(null); // Return to list view
        } catch (e: any) {
            alert("Failed to delete project: " + e.message);
        }
    };

    const handleUpdateProject = async (projectId: Id<"guildProjects">, data: any) => {
        try {
            await updateProject({ projectId, ...data });
        } catch (e: any) {
            alert("Failed to update project: " + e.message);
        }
    };

    const leaveProject = useMutation(api.guilds.projects.leave);

    const handleLeaveProject = async (projectId: Id<"guildProjects">) => {
        try {
            await leaveProject({ guildId, projectId });
            alert("Left Project.");
            onSelectProject(null); // Go back to list
        } catch (e: any) {
            alert("Failed to leave: " + e.message);
        }
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
                    onLeave={() => handleLeaveProject(selectedProject._id)}
                    onDelete={handleDeleteProject}
                    onUpdate={handleUpdateProject}
                    members={members}
                />
            );
        }
    }

    return (
        <div className="space-y-6 relative">
            {/* WIZARD OVERLAY */}
            {isWizardOpen && (
                <CreateProjectWizard
                    guildId={guildId}
                    treasury={treasury}
                    onClose={() => setIsWizardOpen(false)}
                    onCreate={handleLaunchProject}
                />
            )}

            <div className="flex items-center justify-end">
                {isOfficer && (
                    <button
                        onClick={handleAddProject}
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
                        <button onClick={handleAddProject} className="text-indigo-400 hover:text-indigo-300 font-bold">
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
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">{project.title}</h3>
                                                    {project.status === 'completed' && <span className="bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase border border-green-500/30">Completed</span>}
                                                </div>
                                                <p className="text-xs text-slate-500 mb-2">Created: {new Date(project.createdAt).toLocaleDateString()}</p>

                                                <div className="flex gap-2">
                                                    {(project.totalEscrowed?.gold || project.rewards?.gold) > 0 && (
                                                        <span className="text-xs bg-amber-900/30 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20 font-mono">
                                                            {project.totalEscrowed?.gold || project.rewards.gold} Gold
                                                        </span>
                                                    )}
                                                    {(project.totalEscrowed?.gems || project.rewards?.gems) > 0 && (
                                                        <span className="text-xs bg-cyan-900/30 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/20 font-mono">
                                                            {project.totalEscrowed?.gems || project.rewards.gems} Gems
                                                        </span>
                                                    )}
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
