import React from 'react';
import { Project, Task } from '../../types';
import { Scroll, Trello, Plus, Edit3, X, Save, Pencil } from 'lucide-react';
import { RichTextEditor } from '../RichTextEditor';

interface ProjectOverviewProps {
    project: Project & { creatorId?: string; createdAt?: number };
    tasks: Task[];
    onOpenEditor: () => void;
    onOpenKanban: () => void;
    members?: any[];
    canEdit?: boolean;
    onUpdate?: (data: {
        description?: string;
        allowSubmissions?: boolean;
        submissionDeadline?: number;
        consolidateRewards?: boolean;
        rankedRewards?: any;
    }) => void;
    defaultEditing?: boolean;
}

import { GuildMemberCard } from '../guild/GuildMemberCard';

export const ProjectOverview: React.FC<ProjectOverviewProps> = ({ project, tasks, onOpenEditor, onOpenKanban, members, canEdit, onUpdate, defaultEditing }) => {

    // Edit State
    const [isEditing, setIsEditing] = React.useState(defaultEditing || false);
    const [editDescription, setEditDescription] = React.useState(project.description || '');
    const [allowSubmissions, setAllowSubmissions] = React.useState(project.allowSubmissions || false);
    const [submissionDeadline, setSubmissionDeadline] = React.useState(project.submissionDeadline);
    const [consolidateRewards, setConsolidateRewards] = React.useState(project.consolidateRewards || false);
    const [rankedRewards, setRankedRewards] = React.useState(project.rankedRewards || {
        firstPlace: { xp: 0, gold: 0, gems: 0 },
        secondPlace: { xp: 0, gold: 0, gems: 0 },
        thirdPlace: { xp: 0, gold: 0, gems: 0 },
    });

    // Sync state when project changes (unless editing)
    React.useEffect(() => {
        if (!isEditing) {
            setEditDescription(project.description || '');
            setAllowSubmissions(project.allowSubmissions || false);
            setSubmissionDeadline(project.submissionDeadline);
            setConsolidateRewards(project.consolidateRewards || false);
            setRankedRewards(project.rankedRewards || {
                firstPlace: { xp: 0, gold: 0, gems: 0 },
                secondPlace: { xp: 0, gold: 0, gems: 0 },
                thirdPlace: { xp: 0, gold: 0, gems: 0 },
            });
        }
    }, [project, isEditing]);

    const handleSave = () => {
        if (onUpdate) {
            onUpdate({
                description: editDescription,
                allowSubmissions,
                submissionDeadline,
                consolidateRewards,
                rankedRewards
            });
            setIsEditing(false);
        }
    };

    const handleCancel = () => {
        setEditDescription(project.description || '');
        setAllowSubmissions(project.allowSubmissions || false);
        setSubmissionDeadline(project.submissionDeadline);
        setConsolidateRewards(project.consolidateRewards || false);
        setRankedRewards(project.rankedRewards || {
            firstPlace: { xp: 0, gold: 0, gems: 0 },
            secondPlace: { xp: 0, gold: 0, gems: 0 },
            thirdPlace: { xp: 0, gold: 0, gems: 0 },
        });
        setIsEditing(false);
    };

    const updateRankedReward = (place: 'firstPlace' | 'secondPlace' | 'thirdPlace', currency: 'xp' | 'gold' | 'gems', value: number) => {
        setRankedRewards(prev => ({
            ...prev,
            [place]: {
                ...prev[place],
                [currency]: value
            }
        }));
    };

    // Find Creator
    const creator = members?.find(m => m._id === project.creatorId || m.userId === project.creatorId);

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* LEFT COLUMN: Details & Creator (4/12) */}
                <div className="lg:col-span-4 space-y-8">
                    {/* Description Card */}
                    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 flex flex-col">

                        {/* Header: Title/Date */}
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <div className="flex items-center gap-3">
                                    <h3 className="text-white font-bold text-lg">About this Project</h3>
                                    {canEdit && (
                                        isEditing ? (
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={handleCancel}
                                                    className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                                                    title="Cancel"
                                                >
                                                    <X size={16} />
                                                </button>
                                                <button
                                                    onClick={handleSave}
                                                    className="p-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white transition-colors flex items-center gap-1 px-2"
                                                    title="Save"
                                                >
                                                    <Save size={14} />
                                                    <span className="text-xs font-bold">Save</span>
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setIsEditing(true)}
                                                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-white transition-colors"
                                            >
                                                <Pencil size={14} />
                                            </button>
                                        )
                                    )}
                                </div>
                                {project.createdAt && (
                                    <p className="text-xs text-slate-500 mt-1">
                                        Created on {new Date(project.createdAt).toLocaleDateString()}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Description Content */}
                        {isEditing ? (
                            <div className="animate-in fade-in zoom-in-95 duration-200">
                                <div className="mb-4">
                                    <RichTextEditor
                                        value={editDescription}
                                        onChange={setEditDescription}
                                        placeholder="Describe the project..."
                                    />
                                </div>

                                {/* Contest Settings UI */}
                                <div className="mt-6 pt-6 border-t border-slate-700/50 space-y-6">
                                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Contest Settings</h4>

                                    {/* Submissions Toggle */}
                                    <div className="flex items-center justify-between bg-slate-800 p-3 rounded-lg">
                                        <div>
                                            <p className="text-white font-bold text-sm">Allow Submissions</p>
                                            <p className="text-xs text-slate-500">Members can submit documents/work for review.</p>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={allowSubmissions}
                                            onChange={(e) => setAllowSubmissions(e.target.checked)}
                                            className="toggle toggle-primary"
                                        />
                                    </div>

                                    {/* Deadline Picker */}
                                    <div>
                                        <label className="block text-slate-400 text-xs font-bold mb-1">Submission Deadline</label>
                                        <input
                                            type="date"
                                            value={submissionDeadline ? new Date(submissionDeadline).toISOString().split('T')[0] : ''}
                                            onChange={(e) => setSubmissionDeadline(e.target.value ? new Date(e.target.value).getTime() : undefined)}
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
                                        />
                                    </div>

                                    {/* Ranked Rewards Configuration */}
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="block text-slate-400 text-xs font-bold">Ranked Rewards</label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    checked={consolidateRewards}
                                                    onChange={(e) => setConsolidateRewards(e.target.checked)}
                                                    className="w-3 h-3 rounded bg-slate-700 border-slate-600"
                                                />
                                                <span className="text-xs text-slate-500">Consolidate unawarded to 1st Place</span>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            {/* 1st Place */}
                                            <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg">
                                                <p className="text-amber-500 text-xs font-bold mb-2">1st Place Reward</p>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div>
                                                        <label className="text-[10px] text-amber-500/70 font-bold uppercase mb-1 block ml-1">Gold</label>
                                                        <input
                                                            placeholder="0"
                                                            type="number"
                                                            value={rankedRewards?.firstPlace?.gold || 0}
                                                            onChange={(e) => updateRankedReward('firstPlace', 'gold', parseInt(e.target.value) || 0)}
                                                            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white focus:border-amber-500/50 outline-none transition-colors"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] text-cyan-500/70 font-bold uppercase mb-1 block ml-1">Gems</label>
                                                        <input
                                                            placeholder="0"
                                                            type="number"
                                                            value={rankedRewards?.firstPlace?.gems || 0}
                                                            onChange={(e) => updateRankedReward('firstPlace', 'gems', parseInt(e.target.value) || 0)}
                                                            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white focus:border-cyan-500/50 outline-none transition-colors"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* 2nd Place */}
                                            <div className="bg-slate-800 border border-slate-700 p-3 rounded-lg">
                                                <p className="text-slate-400 text-xs font-bold mb-2">2nd Place Reward</p>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div>
                                                        <label className="text-[10px] text-slate-500 font-bold uppercase mb-1 block ml-1">Gold</label>
                                                        <input
                                                            placeholder="0"
                                                            type="number"
                                                            value={rankedRewards?.secondPlace?.gold || 0}
                                                            onChange={(e) => updateRankedReward('secondPlace', 'gold', parseInt(e.target.value) || 0)}
                                                            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white focus:border-amber-500/50 outline-none transition-colors"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] text-slate-500 font-bold uppercase mb-1 block ml-1">Gems</label>
                                                        <input
                                                            placeholder="0"
                                                            type="number"
                                                            value={rankedRewards?.secondPlace?.gems || 0}
                                                            onChange={(e) => updateRankedReward('secondPlace', 'gems', parseInt(e.target.value) || 0)}
                                                            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white focus:border-cyan-500/50 outline-none transition-colors"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* 3rd Place */}
                                            <div className="bg-slate-800 border border-slate-700 p-3 rounded-lg">
                                                <p className="text-slate-400 text-xs font-bold mb-2">3rd Place Reward</p>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div>
                                                        <label className="text-[10px] text-slate-500 font-bold uppercase mb-1 block ml-1">Gold</label>
                                                        <input
                                                            placeholder="0"
                                                            type="number"
                                                            value={rankedRewards?.thirdPlace?.gold || 0}
                                                            onChange={(e) => updateRankedReward('thirdPlace', 'gold', parseInt(e.target.value) || 0)}
                                                            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white focus:border-amber-500/50 outline-none transition-colors"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] text-slate-500 font-bold uppercase mb-1 block ml-1">Gems</label>
                                                        <input
                                                            placeholder="0"
                                                            type="number"
                                                            value={rankedRewards?.thirdPlace?.gems || 0}
                                                            onChange={(e) => updateRankedReward('thirdPlace', 'gems', parseInt(e.target.value) || 0)}
                                                            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white focus:border-cyan-500/50 outline-none transition-colors"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div
                                className="overflow-y-auto pr-2 custom-scrollbar"
                                style={{ maxHeight: '600px', minHeight: '300px' }} // Increased height
                            >
                                <RichTextEditor
                                    value={project.description || '<p>No description provided.</p>'}
                                    readOnly={true}
                                />

                                {/* Read Only View for Contest Settings */}
                                {(project.allowSubmissions || project.submissionDeadline || project.rankedRewards) && (
                                    <div className="mt-6 pt-6 border-t border-slate-700/50">
                                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Contest Details</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            {project.submissionDeadline && (
                                                <div className="bg-slate-800 p-3 rounded-lg">
                                                    <p className="text-xs text-slate-500 mb-1">Deadline</p>
                                                    <p className="text-white font-mono text-sm">{new Date(project.submissionDeadline).toLocaleDateString()}</p>
                                                </div>
                                            )}
                                            {project.allowSubmissions && (
                                                <div className="bg-slate-800 p-3 rounded-lg flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                                    <p className="text-white text-sm font-bold">Submissions Open</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT COLUMN: Tools (8/12) */}
                <div className="lg:col-span-8">
                    <div className="mb-6 flex items-center justify-between">
                        <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest">Command Center Tools</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Document Editor Card */}
                        <button
                            onClick={onOpenEditor}
                            className="group relative p-6 bg-slate-900/50 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/50 rounded-xl transition-all text-left flex items-start gap-4 h-full"
                        >
                            <div className="p-3 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                                <Edit3 size={24} />
                            </div>
                            <div>
                                <h4 className="text-white font-bold mb-1 group-hover:text-indigo-400 transition-colors">New Document</h4>
                                <p className="text-slate-400 text-sm leading-relaxed">
                                    create a document and submit it to the archive for review by the project lead. Or save privately.
                                </p>
                            </div>
                        </button>

                        {/* Kanban Board Card */}
                        <button
                            onClick={onOpenKanban}
                            className="group relative p-6 bg-slate-900/50 hover:bg-slate-800 border border-slate-800 hover:border-purple-500/50 rounded-xl transition-all text-left flex items-start gap-4 h-full"
                        >
                            <div className="p-3 rounded-lg bg-purple-500/10 text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                                <Trello size={24} />
                            </div>
                            <div>
                                <h4 className="text-white font-bold mb-1 group-hover:text-purple-400 transition-colors">Task Board</h4>
                                <p className="text-slate-400 text-sm leading-relaxed">
                                    Manage project tasks in a dedicated Kanban view. Plan your workflow.
                                </p>
                            </div>
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};
