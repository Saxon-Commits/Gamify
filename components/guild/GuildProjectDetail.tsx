import React, { useState } from 'react';
import { ArrowLeft, Trash2, Pencil, Save, X, RefreshCw, CheckCircle, LayoutDashboard, Archive, Settings, Trophy } from 'lucide-react';
import { RichTextEditor } from '../RichTextEditor';
import { ProjectOverview } from '../project/ProjectOverview';
import { ProjectArchive } from '../project/ProjectArchive';
import { ProjectEditor } from '../project/ProjectEditor';
import { ProjectKanban } from '../project/ProjectKanban';
import { useGameStore } from '../../store/useGameStore';
import { AnimatePresence } from 'framer-motion';
import { GuildMemberCard } from './GuildMemberCard';
import { ProjectWinnerSelection } from '../project/ProjectWinnerSelection';

interface GuildProjectDetailProps {
    project: any;
    onBack: () => void;
    isOfficer: boolean;
    onJoin?: () => void;
    onLeave?: () => void;
    isJoined?: boolean;
    onDelete: (projectId: any) => void;
    onUpdate: (projectId: any, data: any) => void;
    members?: any[];
    isDraft?: boolean;
    onCreate?: (data: any) => void;
}

type Tab = 'overview' | 'archive' | 'settings';

export const GuildProjectDetail: React.FC<GuildProjectDetailProps> = ({ project, onBack, isOfficer, onJoin, onLeave, isJoined, onDelete, onUpdate, members }) => {
    // ... State ...
    const [activeTab, setActiveTab] = useState<Tab>('overview');

    // Edit State (Settings Tab)
    const [editTitle, setEditTitle] = useState(project?.title || '');
    const [editDescription, setEditDescription] = useState(project?.description || '');
    const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error' | 'unsaved'>('saved');

    // Tools State
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editingDoc, setEditingDoc] = useState<any>(null);
    const [isKanbanOpen, setIsKanbanOpen] = useState(false);
    const [isWinnerSelectionOpen, setIsWinnerSelectionOpen] = useState(false);

    // Store Data (Personal Tasks for this Project)
    const { tasks, reorderTasks } = useGameStore();
    const projectTasks = tasks.filter(t => t.projectId === project._id);

    // Ref to track if we serve the initial load
    const isFirstLoad = React.useRef(true);

    if (!project) return null;

    // Auto-Save Logic (Settings)
    React.useEffect(() => {
        if (isFirstLoad.current) {
            isFirstLoad.current = false;
            return;
        }

        // Debounce save
        const timer = setTimeout(async () => {
            if (saveStatus !== 'unsaved') return; // Only save if marked unsaved

            setSaveStatus('saving');

            const updates: { title?: string, description?: string } = {};
            if (editTitle !== project.title) updates.title = editTitle;
            if (editDescription !== project.description) updates.description = editDescription;

            if (Object.keys(updates).length === 0) {
                setSaveStatus('saved');
                return;
            }

            try {
                await onUpdate(project._id, updates);
                setSaveStatus('saved');
            } catch (e) {
                console.error("Auto-save failed", e);
                setSaveStatus('error');
            }
        }, 1500);

        return () => clearTimeout(timer);
    }, [editTitle, editDescription, saveStatus, project.title, project.description]);

    // Handle Input Changes
    const handleTitleChange = (val: string) => {
        setEditTitle(val);
        setSaveStatus('unsaved');
    };

    const handleDescriptionChange = (val: string) => {
        setEditDescription(val);
        setSaveStatus('unsaved');
    };

    // Silent Sync (Server -> Client)
    React.useEffect(() => {
        // Only sync if we are fully saved and CLEAN
        if (saveStatus === 'saved') {
            if (project.title !== editTitle) setEditTitle(project.title);
            if (project.description !== editDescription) setEditDescription(project.description || '');
        }
    }, [project.title, project.description, saveStatus]);

    const handleDelete = () => {
        if (confirm("Are you sure you want to delete this project? This action cannot be undone and will refund the treasury.")) {
            onDelete(project._id);
        }
    };

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300 h-full flex flex-col relative">

            {/* Header / Navigation */}
            <div className="flex flex-col gap-4 shrink-0 border-b border-slate-800 pb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                        <button
                            onClick={onBack}
                            className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-2xl font-bold text-white">{project.title}</h2>
                                {project.status === 'completed' && <span className="bg-green-500/20 text-green-400 px-2 py-0.5 rounded text-xs font-bold uppercase border border-green-500/30">Completed</span>}
                                {project.status === 'archived' && <span className="bg-slate-500/20 text-slate-400 px-2 py-0.5 rounded text-xs font-bold uppercase border border-slate-500/30">Archived</span>}
                            </div>
                        </div>
                    </div>
                    {/* Join Button & Progress */}
                    {/* Join Button & Progress */}
                    <div className="flex items-center gap-6">
                        {/* Progress Bar (Compact) */}
                        <div className="flex flex-col items-end min-w-[200px]">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-medium text-slate-400">
                                    {projectTasks.filter(t => t.completed).length} / {projectTasks.length} Tasks
                                </span>
                                <span className="text-sm font-bold text-indigo-400">
                                    {Math.round(projectTasks.length > 0 ? (projectTasks.filter(t => t.completed).length / projectTasks.length) * 100 : 0)}%
                                </span>
                            </div>
                            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-indigo-600 to-purple-500 transition-all duration-500"
                                    style={{ width: `${projectTasks.length > 0 ? (projectTasks.filter(t => t.completed).length / projectTasks.length) * 100 : 0}%` }}
                                />
                            </div>
                        </div>

                        <div className="h-8 w-px bg-slate-800" />

                        {/* Status Messages for Header */}
                        <div className="text-xs font-medium flex items-center gap-2">
                            {saveStatus === 'saving' && <span className="text-indigo-400 flex items-center gap-1"><RefreshCw size={10} className="animate-spin" /> Saving...</span>}
                            {saveStatus === 'saved' && <span className="text-slate-500 flex items-center gap-1">All changes saved</span>}
                            {saveStatus === 'unsaved' && <span className="text-amber-500 flex items-center gap-1">Unsaved changes...</span>}
                        </div>
                        <div className="flex items-center gap-2 mr-4 border-r border-slate-700 pr-4">
                            <Trophy size={14} className="text-amber-500" />
                            <div className="flex flex-col items-end leading-none">
                                <span className="text-[10px] text-slate-500 uppercase font-bold">Total Rewards</span>
                                <div className="flex items-center gap-3 text-xs font-mono mt-1">
                                    <div className="flex items-center gap-1">
                                        <span className="text-amber-400 font-bold">
                                            {(project.totalEscrowed?.gold || project.rewards?.gold || 0)}
                                        </span>
                                        <img src="/images/currency/gold_coin.png" alt="Gold" className="w-6 h-6 object-contain" />
                                    </div>
                                    {(project.totalEscrowed?.gems || project.rewards?.gems) > 0 && (
                                        <div className="flex items-center gap-1">
                                            <span className="text-cyan-400 font-bold">
                                                {(project.totalEscrowed?.gems || project.rewards?.gems || 0)}
                                            </span>
                                            <img src="/images/currency/gem icon.png" alt="Gems" className="w-8 h-8 object-contain" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {isOfficer && project.status === 'active' && project.joinedUserIds?.length > 0 && (
                            <button
                                onClick={() => setIsWinnerSelectionOpen(true)}
                                className="px-3 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/30 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors"
                            >
                                <Trophy size={14} />
                                Award Winners
                            </button>
                        )}

                        {onJoin && !isJoined && (
                            <button
                                onClick={onJoin}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold transition-colors"
                            >
                                Join Project
                            </button>
                        )}

                        {onLeave && isJoined && (
                            <button
                                onClick={() => {
                                    if (confirm("Are you sure you want to leave this project?")) {
                                        onLeave();
                                    }
                                }}
                                className="px-4 py-2 bg-slate-800 hover:bg-red-900/40 text-slate-400 hover:text-red-400 border border-slate-700 hover:border-red-500/30 rounded-lg font-bold transition-all text-sm"
                            >
                                Leave
                            </button>
                        )}
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-6 mt-4">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`flex items-center gap-2 pb-2 text-sm font-bold uppercase tracking-wider border-b-2 transition-all ${activeTab === 'overview' ? 'border-indigo-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                    >
                        <LayoutDashboard size={14} />
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('archive')}
                        className={`flex items-center gap-2 pb-2 text-sm font-bold uppercase tracking-wider border-b-2 transition-all ${activeTab === 'archive' ? 'border-indigo-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                    >
                        <Archive size={14} />
                        Archive
                    </button>
                    {isOfficer && (
                        <button
                            onClick={() => setActiveTab('settings')}
                            className={`flex items-center gap-2 pb-2 text-sm font-bold uppercase tracking-wider border-b-2 transition-all ${activeTab === 'settings' ? 'border-indigo-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                        >
                            <Settings size={14} />
                            Settings
                        </button>
                    )}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto">
                {activeTab === 'overview' && (
                    <ProjectOverview
                        project={{
                            id: project._id,
                            name: project.title,
                            description: project.description,
                            creatorId: project.creatorId,
                            createdAt: project._creationTime
                        }} // Adapt project shape
                        tasks={projectTasks}
                        onOpenEditor={() => { setEditingDoc(null); setIsEditorOpen(true); }}
                        onOpenKanban={() => setIsKanbanOpen(true)}
                        members={members}
                        canEdit={isOfficer}
                        onUpdate={(data) => onUpdate(project._id, data)}
                        defaultEditing={false}
                    />
                )}

                {activeTab === 'archive' && (
                    <ProjectArchive
                        projectId={project._id}
                        onEditDocument={(doc) => { setEditingDoc(doc); setIsEditorOpen(true); }}
                    />
                )}

                {activeTab === 'settings' && isOfficer && (
                    <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-800 space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Project Title</label>
                            <input
                                value={editTitle}
                                onChange={(e) => handleTitleChange(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-indigo-500 outline-none"
                            />
                        </div>
                        {/* Description Editor Moved to Overview */}
                        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                            <div className="text-xs text-slate-500 flex items-center gap-2">
                                {saveStatus === 'saving' && <><RefreshCw className="animate-spin" size={12} /> Saving...</>}
                                {saveStatus === 'saved' && <><CheckCircle className="text-green-500" size={12} /> All changes saved</>}
                                {(saveStatus === 'unsaved' || saveStatus === 'error') && <span className="text-amber-500">Unsaved changes...</span>}
                            </div>
                            <button
                                onClick={handleDelete}
                                className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 hover:text-red-400 border border-red-500/30 rounded-lg transition-all"
                            >
                                <Trash2 size={16} />
                                Delete Project
                            </button>
                        </div>
                    </div>
                )}


            </div>

            {/* MODALS */}
            <AnimatePresence>
                {isEditorOpen && (
                    <ProjectEditor
                        projectId={project._id}
                        initialDoc={editingDoc}
                        onClose={() => setIsEditorOpen(false)}
                    />
                )}
            </AnimatePresence>

            {isWinnerSelectionOpen && (
                <ProjectWinnerSelection
                    project={project}
                    contributors={members?.filter(m => project.joinedUserIds?.includes(m.userId)) || []}
                    onClose={() => setIsWinnerSelectionOpen(false)}
                    onAward={() => {
                        setIsWinnerSelectionOpen(false);
                        // Ideally refresh project data here or trigger a refetch if needed
                    }}
                />
            )}

            {isKanbanOpen && (
                <div className="fixed inset-0 z-[150] bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-8">
                    <div className="w-full max-w-7xl h-[85vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
                        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <LayoutDashboard className="text-purple-400" />
                                {project.title} <span className="text-slate-500">Task Board</span>
                            </h2>
                            <button onClick={() => setIsKanbanOpen(false)} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="flex-1 p-6 overflow-hidden bg-slate-950">
                            <ProjectKanban
                                project={{ id: project._id, name: project.title }}
                                tasks={projectTasks}
                                onUpdateTasks={(newTasks) => reorderTasks(newTasks)}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
