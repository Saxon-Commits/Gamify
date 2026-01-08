import React, { useState } from 'react';
import { ArrowLeft, Target, Users, Clock, CheckCircle, ListChecks, Lock, MessageSquare, Layout, Trash2, Pencil, Save, X } from 'lucide-react';

interface GuildProjectDetailProps {
    project: any;
    onBack: () => void;
    isOfficer: boolean;
    onJoin?: () => void;
    isJoined?: boolean;
    onDelete: (projectId: any) => void;
    onUpdate: (projectId: any, data: { title?: string, description?: string }) => void;
}

export const GuildProjectDetail: React.FC<GuildProjectDetailProps> = ({ project, onBack, isOfficer, onJoin, isJoined, onDelete, onUpdate }) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'contributors' | 'discussion'>('overview');
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(project?.title || '');
    const [editDescription, setEditDescription] = useState(project?.description || '');

    if (!project) return null;

    const handleSave = () => {
        onUpdate(project._id, { title: editTitle, description: editDescription });
        setIsEditing(false);
    };

    const handleDelete = () => {
        if (confirm("Are you sure you want to delete this project? This action cannot be undone and will refund the treasury.")) {
            onDelete(project._id);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Header / Navigation */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                        <button
                            onClick={onBack}
                            className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div className="flex-1">
                            {isEditing ? (
                                <input
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    className="text-2xl font-bold text-white bg-slate-800 border border-slate-700 rounded px-2 w-full mb-1"
                                />
                            ) : (
                                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                    {project.title}
                                    {isJoined && <span className="text-xs bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-0.5 rounded-full">Joined</span>}
                                </h2>
                            )}
                            <p className="text-slate-400 text-sm">Project Details</p>
                        </div>
                    </div>
                    {isOfficer && (
                        <div className="flex items-center gap-2">
                            {isEditing ? (
                                <>
                                    <button onClick={handleSave} className="p-2 bg-green-600/20 text-green-400 hover:bg-green-600/40 rounded-lg transition-colors" title="Save Changes">
                                        <Save size={18} />
                                    </button>
                                    <button onClick={() => setIsEditing(false)} className="p-2 bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-white rounded-lg transition-colors" title="Cancel">
                                        <X size={18} />
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button onClick={() => setIsEditing(true)} className="p-2 bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors" title="Edit Project">
                                        <Pencil size={18} />
                                    </button>
                                    <button onClick={handleDelete} className="p-2 bg-slate-800 text-slate-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors" title="Delete Project">
                                        <Trash2 size={18} />
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Project Navigation Tabs */}
                <div className="flex gap-2 border-b border-slate-700/50 pb-1">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`px-4 py-2 rounded-t-lg font-bold text-sm transition-colors flex items-center gap-2 ${activeTab === 'overview' ? 'bg-slate-800 text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        <Layout size={16} /> Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('tasks')}
                        className={`px-4 py-2 rounded-t-lg font-bold text-sm transition-colors flex items-center gap-2 ${activeTab === 'tasks' ? 'bg-slate-800 text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        <ListChecks size={16} /> Tasks ({project.storedTasks?.length || 0})
                    </button>
                    <button
                        onClick={() => setActiveTab('contributors')}
                        className={`px-4 py-2 rounded-t-lg font-bold text-sm transition-colors flex items-center gap-2 ${activeTab === 'contributors' ? 'bg-slate-800 text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        <Users size={16} /> Contributors
                    </button>
                    <button
                        onClick={() => setActiveTab('discussion')}
                        className={`px-4 py-2 rounded-t-lg font-bold text-sm transition-colors flex items-center gap-2 ${activeTab === 'discussion' ? 'bg-slate-800 text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        <MessageSquare size={16} /> Discussion
                    </button>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column: Dynamic Content based on Tab */}
                <div className="lg:col-span-2 space-y-6">

                    {activeTab === 'overview' && (
                        <>
                            {/* Description Card */}
                            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                                <h3 className="text-lg font-bold text-white mb-2">About this Project</h3>
                                {isEditing ? (
                                    <textarea
                                        value={editDescription}
                                        onChange={(e) => setEditDescription(e.target.value)}
                                        className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-300 min-h-[100px]"
                                    />
                                ) : (
                                    <p className="text-slate-300 leading-relaxed">{project.description}</p>
                                )}

                                <div className="flex flex-wrap gap-4 mt-6">
                                    <div className="bg-slate-900/50 px-4 py-2 rounded-lg border border-slate-700/50">
                                        <span className="block text-xs text-slate-500 uppercase font-bold">Rewards</span>
                                        <div className="flex gap-3 mt-1">
                                            <span className="text-amber-400 font-bold text-sm">{project.rewards.gold} Gold</span>
                                            {project.rewards.gems > 0 && <span className="text-cyan-400 font-bold text-sm">{project.rewards.gems} Gems</span>}
                                            <span className="text-purple-400 font-bold text-sm">{(project.targetTasks || 0) * 10} XP</span>
                                        </div>
                                    </div>
                                    <div className="bg-slate-900/50 px-4 py-2 rounded-lg border border-slate-700/50">
                                        <span className="block text-xs text-slate-500 uppercase font-bold">Deadline</span>
                                        <span className="text-slate-300 font-bold text-sm flex items-center gap-2 mt-1">
                                            <Clock size={14} /> Only {project.targetTasks} tasks left
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Progress Card */}
                            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                                <div className="flex justify-between items-end mb-4">
                                    <h3 className="text-lg font-bold text-white">Project Progress</h3>
                                    <span className="text-2xl font-black text-indigo-400">
                                        {Math.round((project.completedTasks / project.targetTasks) * 100)}%
                                    </span>
                                </div>
                                <div className="h-6 bg-slate-900 rounded-full overflow-hidden mb-2">
                                    <div
                                        className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-1000"
                                        style={{ width: `${Math.min(100, (project.completedTasks / project.targetTasks) * 100)}%` }}
                                    />
                                </div>
                                <p className="text-xs text-slate-400 text-right">
                                    {project.completedTasks} / {project.targetTasks} tasks completed
                                </p>
                            </div>
                        </>
                    )}

                    {activeTab === 'tasks' && (
                        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <ListChecks size={20} className="text-slate-400" />
                                Available Tasks
                            </h3>

                            <div className="space-y-3">
                                {project.storedTasks?.map((task: any, i: number) => (
                                    <div key={i} className="flex items-center justify-between bg-slate-900/50 p-4 rounded-lg border border-slate-700/50 hover:border-slate-600 transition-colors">
                                        <div>
                                            <p className="font-bold text-slate-200">{task.name}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded border ${task.difficulty === 'HARD' ? 'bg-red-900/20 text-red-400 border-red-500/20' :
                                                    task.difficulty === 'MEDIUM' ? 'bg-amber-900/20 text-amber-400 border-amber-500/20' :
                                                        'bg-green-900/20 text-green-400 border-green-500/20'
                                                    }`}>
                                                    {task.difficulty}
                                                </span>
                                                <span className="text-xs text-slate-500">+{task.xpReward} XP</span>
                                            </div>
                                        </div>
                                        <button className="text-xs bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg border border-slate-600 transition-colors">
                                            Start Task
                                        </button>
                                    </div>
                                ))}
                                {(!project.storedTasks || project.storedTasks.length === 0) && (
                                    <p className="text-slate-500 italic text-center py-4">No specific tasks listed. Contribute by completing general Guild Quests.</p>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'contributors' && (
                        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                            <h3 className="text-lg font-bold text-white mb-4">Top Contributors</h3>
                            <div className="space-y-4">
                                {project.contributors?.map((c: any, i: number) => (
                                    <div key={i} className="flex items-center justify-between bg-slate-900/30 p-4 rounded-lg border border-slate-700/30">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-sm text-white font-bold border-2 border-slate-600">
                                                {c.userId ? c.userId.substring(0, 2).toUpperCase() : '??'}
                                            </div>
                                            <div>
                                                <p className="text-sm text-white font-bold">User {c.userId ? c.userId.substring(0, 4) : 'Unknown'}</p>
                                                <p className="text-xs text-slate-500">Member</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="block text-xl font-bold text-indigo-400">{c.amount}</span>
                                            <span className="text-xs text-slate-500 uppercase">Points</span>
                                        </div>
                                    </div>
                                ))}
                                {(!project.contributors || project.contributors.length === 0) && (
                                    <p className="text-slate-500 italic text-center py-4">No contributors yet. Be the first!</p>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'discussion' && (
                        <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 text-center">
                            <MessageSquare className="mx-auto text-slate-600 mb-4" size={32} />
                            <h3 className="text-lg font-bold text-white mb-2">Project Discussion</h3>
                            <p className="text-slate-500 mb-6">Coordinate with your team, share updates, and strategize.</p>
                            <button className="bg-slate-700 text-slate-400 cursor-not-allowed px-4 py-2 rounded-lg font-bold text-sm">
                                Coming Soon
                            </button>
                        </div>
                    )}

                </div>

                {/* Right Column: Actions & Contributors (Keep visible on all tabs as sidebar) */}
                <div className="space-y-6">

                    {/* Action Card */}
                    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 sticky top-6">
                        {!isJoined ? (
                            <button
                                onClick={onJoin}
                                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-bold text-lg shadow-lg shadow-indigo-600/20 transition-all transform hover:-translate-y-1 mb-4"
                            >
                                Join This Project
                            </button>
                        ) : (
                            <div className="w-full bg-green-600/20 border border-green-500/30 text-green-400 py-3 rounded-xl font-bold text-center mb-4 flex items-center justify-center gap-2">
                                <CheckCircle size={20} />
                                Active Participant
                            </div>
                        )}

                        <p className="text-xs text-slate-400 text-center mb-6">
                            Join to track progress and earn rewards upon completion.
                        </p>

                        <div className="border-t border-slate-700 pt-6">
                            <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                                <Users size={16} className="text-slate-400" />
                                Contributors ({project.contributors?.length || 0})
                            </h4>
                            <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                {project.contributors?.map((c: any, i: number) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs text-white font-bold">
                                            {/* Placeholder for avatar */}
                                            {c.userId ? c.userId.substring(0, 2).toUpperCase() : '??'}
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-300 font-medium">User {c.userId ? c.userId.substring(0, 4) : 'Unknown'}</p>
                                            <p className="text-[10px] text-slate-500">Contributed {c.amount} pts</p>
                                        </div>
                                    </div>
                                ))}
                                {(!project.contributors || project.contributors.length === 0) && (
                                    <p className="text-xs text-slate-500 italic">No contributors yet. Be the first!</p>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};
