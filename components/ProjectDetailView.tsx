import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeft, LayoutDashboard, Archive, Settings } from 'lucide-react';
import { Project, Task } from '../types';
import { VitalityFlowChart } from './VitalityFlowChart';
import { ProjectOverview } from './project/ProjectOverview';
import { ProjectArchive } from './project/ProjectArchive';
import { ProjectEditor } from './project/ProjectEditor';
import { ProjectKanban } from './project/ProjectKanban';
import { useGameStore } from '../store/useGameStore';

interface ProjectDetailViewProps {
    project: Project;
    tasks: Task[];
    onClose: () => void;
    background?: string | null;
}

type Tab = 'overview' | 'archive' | 'settings';

export const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({ project, tasks, onClose, background }) => {
    const isVitalityPeak = project.id === 'col-todo';
    const [activeTab, setActiveTab] = useState<Tab>('overview');

    // Tools State
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editingDoc, setEditingDoc] = useState<any>(null); // For editing existing
    const [isKanbanOpen, setIsKanbanOpen] = useState(false);

    const { reorderTasks } = useGameStore();

    // If Vitality Peak, specific view (unchanged)
    if (isVitalityPeak) {
        return (
            <motion.div
                layoutId={`project-card-${project.id}`}
                className="fixed inset-0 z-[100] bg-slate-950 flex flex-col overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                {/* Navigation Bar */}
                <div className={`fixed top-24 left-6 right-6 flex justify-between items-start z-[110] pointer-events-none bg-transparent`}>
                    <button
                        onClick={onClose}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-950/90 border border-slate-700/50 hover:bg-slate-900 hover:border-indigo-500 text-slate-200 transition-all group shadow-xl pointer-events-auto"
                    >
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform text-indigo-400" />
                        <span className="font-bold text-sm">Back to Quests</span>
                    </button>

                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg bg-slate-950/50 hover:bg-slate-900 border border-transparent hover:border-slate-700 text-slate-400 hover:text-white transition-all backdrop-blur-md pointer-events-auto"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-hidden relative bg-slate-950 pt-28 pb-32">
                    <VitalityFlowChart />
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            layoutId={`project-card-${project.id}`}
            className="fixed inset-0 z-[100] bg-slate-950 flex flex-col overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            {/* Header Section */}
            <div className="relative h-64 w-full flex-shrink-0">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: background ? `url('${background}')` : undefined }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-slate-950/40 to-slate-950" />

                <div className="absolute bottom-4 left-8 z-20">
                    <h1 className="text-4xl font-black text-white drop-shadow-lg tracking-tight mb-2">{project.name}</h1>
                    <p className="text-slate-300 text-lg max-w-2xl font-light">{project.description}</p>
                </div>
            </div>

            {/* Navigation & Controls */}
            <div className="fixed top-8 left-6 right-6 flex justify-between items-center z-[110] pointer-events-none">
                <button
                    onClick={onClose}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-950/50 border border-slate-700/30 hover:bg-slate-900 hover:border-indigo-500 text-slate-200 transition-all group shadow-xl backdrop-blur-md pointer-events-auto"
                >
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform text-indigo-400" />
                    <span className="font-bold text-sm">Back</span>
                </button>

                <button
                    onClick={onClose}
                    className="p-2 rounded-lg bg-slate-950/50 hover:bg-slate-900 border border-transparent hover:border-slate-700 text-slate-400 hover:text-white transition-all backdrop-blur-md pointer-events-auto"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Tabs Navigation */}
            <div className="flex items-center gap-6 px-8 border-b border-slate-800 bg-slate-950 relative z-30">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`flex items-center gap-2 py-4 text-sm font-bold uppercase tracking-wider border-b-2 transition-all ${activeTab === 'overview' ? 'border-indigo-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                >
                    <LayoutDashboard size={16} />
                    Overview
                </button>
                <button
                    onClick={() => setActiveTab('archive')}
                    className={`flex items-center gap-2 py-4 text-sm font-bold uppercase tracking-wider border-b-2 transition-all ${activeTab === 'archive' ? 'border-indigo-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                >
                    <Archive size={16} />
                    Archive
                </button>
                {/* Placeholder Settings Tab */}
                <button
                    onClick={() => setActiveTab('settings')}
                    className={`flex items-center gap-2 py-4 text-sm font-bold uppercase tracking-wider border-b-2 transition-all ${activeTab === 'settings' ? 'border-indigo-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                >
                    <Settings size={16} />
                    Settings
                </button>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto bg-slate-950 p-8">
                <div className="max-w-6xl mx-auto">
                    {activeTab === 'overview' && (
                        <ProjectOverview
                            project={project}
                            tasks={tasks}
                            onOpenEditor={() => { setEditingDoc(null); setIsEditorOpen(true); }}
                            onOpenKanban={() => setIsKanbanOpen(true)}
                        />
                    )}
                    {activeTab === 'archive' && (
                        <ProjectArchive
                            projectId={project.id}
                            onEditDocument={(doc) => { setEditingDoc(doc); setIsEditorOpen(true); }}
                        />
                    )}
                    {activeTab === 'settings' && (
                        <div className="text-center py-20 text-slate-600">
                            Settings coming soon...
                        </div>
                    )}
                </div>
            </div>

            {/* MODALS */}
            <AnimatePresence>
                {isEditorOpen && (
                    <ProjectEditor
                        projectId={project.id}
                        initialDoc={editingDoc}
                        onClose={() => setIsEditorOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* KANBAN MODAL */}
            {isKanbanOpen && (
                <div className="fixed inset-0 z-[150] bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-8">
                    <div className="w-full max-w-7xl h-[85vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
                        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <LayoutDashboard className="text-purple-400" />
                                {project.name} <span className="text-slate-500">Task Board</span>
                            </h2>
                            <button onClick={() => setIsKanbanOpen(false)} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="flex-1 p-6 overflow-hidden bg-slate-950">
                            <ProjectKanban
                                project={project}
                                tasks={tasks}
                                onUpdateTasks={(newTasks) => reorderTasks(newTasks)}
                            />
                        </div>
                    </div>
                </div>
            )}

        </motion.div>
    );
};
