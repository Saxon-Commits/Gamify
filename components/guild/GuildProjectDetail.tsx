import React, { useState } from 'react';
import { ArrowLeft, Trash2, Pencil, Save, X, RefreshCw, CheckCircle } from 'lucide-react';
import { RichTextEditor } from '../RichTextEditor';

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
    const [editTitle, setEditTitle] = useState(project?.title || '');
    const [editDescription, setEditDescription] = useState(project?.description || '');
    const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');

    // Ref to track if we serve the initial load
    const isFirstLoad = React.useRef(true);

    if (!project) return null;

    // Auto-Save Logic
    React.useEffect(() => {
        if (isFirstLoad.current) {
            isFirstLoad.current = false;
            return;
        }

        setSaveStatus('saving');
        const timer = setTimeout(async () => {
            // Perform save - SMART UPDATE (Field Level Merging)
            // Only send fields that have actually changed from the server version
            const updates: { title?: string, description?: string } = {};

            if (editTitle !== project.title) {
                updates.title = editTitle;
            }
            if (editDescription !== project.description) {
                updates.description = editDescription;
            }

            // If nothing changed (e.g. reverted to original), don't spam network
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
        }, 1500); // 1.5s debounce

        return () => clearTimeout(timer);
    }, [editTitle, editDescription, project.title, project.description]);

    // Silent Sync (Server -> Client)
    React.useEffect(() => {
        if (saveStatus === 'saved') {
            // If we are 'saved', we are not typing. Safe to pull updates if they exist.
            if (project.title !== editTitle || project.description !== editDescription) {
                setEditTitle(project.title);
                setEditDescription(project.description || '');
            }
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
            <div className="flex flex-col gap-4 shrink-0">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                        <button
                            onClick={onBack}
                            className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div className="flex-1">
                            <input
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                className="text-2xl font-bold text-white bg-transparent border border-transparent hover:border-slate-700 focus:border-indigo-500 rounded px-2 w-full mb-1 transition-colors outline-none"
                                placeholder="Project Title"
                            />
                            <div className="flex items-center gap-2">
                                <p className="text-slate-400 text-sm px-2">Collaborative Workspace</p>

                                {/* Status Indicator */}
                                <div className="text-xs font-mono transition-colors duration-500 ml-4 flex items-center">
                                    {saveStatus === 'saving' && <span className="text-amber-400 flex items-center gap-1"><RefreshCw size={10} className="animate-spin" /> Saving...</span>}
                                    {saveStatus === 'saved' && <span className="text-slate-500 flex items-center gap-1"><CheckCircle size={10} /> Saved</span>}
                                    {saveStatus === 'error' && <span className="text-red-400">Save Failed</span>}

                                    {/* Last Value Metadata */}
                                    {project.lastEditedByName && (
                                        <span className="text-slate-600 flex items-center gap-1 border-l border-slate-800 pl-4">
                                            {project.lastEditedAt && Date.now() - project.lastEditedAt < 10000 ? (
                                                // Active Editing State
                                                <span className="flex items-center gap-2 text-indigo-400 animate-pulse font-medium border-indigo-500/20 bg-indigo-500/10 px-2 py-0.5 rounded-full">
                                                    <Pencil size={10} className="animate-bounce" />
                                                    <span className="text-[10px]">{project.lastEditedByName} is editing...</span>
                                                </span>
                                            ) : (
                                                // Static History State
                                                <>
                                                    <Pencil size={8} />
                                                    <span className="text-[10px]">Last edited by <span className="text-slate-400">{project.lastEditedByName}</span></span>
                                                    {project.lastEditedAt && <span className="opacity-50 text-[10px]"> {new Date(project.lastEditedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
                                                </>
                                            )}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {isOfficer && (
                            <button
                                onClick={handleDelete}
                                className="text-red-400 hover:text-red-300 p-2 hover:bg-red-400/10 rounded-lg transition-colors"
                                title="Delete Project"
                            >
                                <Trash2 size={18} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 bg-slate-900 border border-slate-700 rounded-xl overflow-hidden flex flex-col">
                <div className="flex-1 flex flex-col p-4 bg-slate-900">
                    <RichTextEditor
                        value={editDescription}
                        onChange={setEditDescription}
                        readOnly={false}
                    />
                </div>
            </div>
        </div>
    );
};
