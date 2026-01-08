import React, { useState } from 'react';
import { ArrowLeft, Trash2, Pencil, Save, X } from 'lucide-react';

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
            </div>

            {/* Blank Canvas */}
            <div className="w-full h-full border-2 border-dashed border-slate-800 rounded-xl flex items-center justify-center p-20">
                <p className="text-slate-600 italic">Project Workspace</p>
            </div>
        </div>
    );
};
