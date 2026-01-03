import React from 'react';
import { motion } from 'framer-motion';
import { X, ArrowLeft, MoreHorizontal } from 'lucide-react';
import { Project, Task } from '../types';
import { VitalityFlowChart } from './VitalityFlowChart';

interface ProjectDetailViewProps {
    project: Project;
    tasks: Task[];
    onClose: () => void;
    background?: string | null;
}

export const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({ project, tasks, onClose, background }) => {
    const isVitalityPeak = project.id === 'p-titan-1';

    return (
        <motion.div
            layoutId={`project-card-${project.id}`}
            className="fixed inset-0 z-[100] bg-slate-950 flex flex-col overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            {/* BACKGROUND IMAGE HEADER - Hidden for Vitality Peak */}
            {!isVitalityPeak && (
                <div className="relative h-64 w-full flex-shrink-0">
                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: background ? `url('${background}')` : undefined }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-slate-950/40 to-slate-950" />

                    {/* Title Area */}
                    <div className="absolute bottom-6 left-8 z-20">
                        <h1 className="text-4xl font-black text-white drop-shadow-lg tracking-tight mb-2">{project.name}</h1>
                        <p className="text-slate-300 text-lg max-w-2xl font-light">{project.description}</p>
                    </div>
                </div>
            )}

            {/* Navigation Bar - Always Visible */}
            <div className={`fixed top-6 left-6 right-6 flex justify-between items-start z-[110] pointer-events-none ${isVitalityPeak ? 'bg-transparent' : ''}`}>
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

            {/* CONTENT AREA */}
            <div className={`flex-1 overflow-hidden relative bg-slate-950 ${isVitalityPeak ? 'pt-28 pb-32' : ''}`}>
                {isVitalityPeak ? (
                    <VitalityFlowChart />
                ) : (
                    /* Generic Task View for other projects */
                    <div className="p-8 max-w-4xl mx-auto">
                        <div className="text-center py-20 text-slate-600">
                            <p>Standard Task View coming soon...</p>
                            <p className="text-xs mt-2">ID: {project.id}</p>
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
};
