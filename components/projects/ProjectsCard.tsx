import React from 'react';
import { Target } from 'lucide-react';
import { useQuery } from "convex/react";
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';

interface ProjectsCardProps {
    guildId: Id<"guilds">;
    isOfficer: boolean;
    onViewAll: () => void;
    onCreate: () => void;
    onProjectClick: (projectId: Id<"guildProjects">) => void;
}

export const ProjectsCard: React.FC<ProjectsCardProps> = ({
    guildId,
    isOfficer,
    onViewAll,
    onCreate,
    onProjectClick
}) => {
    const guildProjects = useQuery(api.guilds.projects.getByGuild, guildId ? { guildId } : "skip");

    return (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 max-h-[600px] h-fit flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <Target className="text-indigo-400" size={20} />
                    <h3 className="text-lg font-bold text-white">Projects</h3>
                </div>
                {isOfficer && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onCreate();
                        }}
                        className="text-xs font-bold text-indigo-400 hover:text-indigo-300"
                    >
                        + New
                    </button>
                )}
            </div>
            <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-1">
                {!guildProjects ? (
                    <div className="text-center text-slate-500 text-xs">Loading...</div>
                ) : guildProjects.filter(p => p.status === 'active').length === 0 ? (
                    <div className="text-center text-slate-500 text-sm py-4 italic">
                        No active projects.
                    </div>
                ) : (
                    guildProjects.filter(p => p.status === 'active').map((project) => (
                        <div
                            key={project._id}
                            onClick={() => onProjectClick(project._id as Id<"guildProjects">)}
                            className="bg-indigo-500/5 border border-indigo-500/20 rounded-lg p-3 cursor-pointer hover:border-indigo-500/40 transition-colors"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="text-sm font-bold text-white truncate">{project.title}</h4>
                                <span className="text-[10px] text-indigo-400 font-mono">
                                    {project.completedTasks}/{project.targetTasks}
                                </span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-indigo-500 rounded-full transition-all"
                                    style={{ width: `${Math.min(100, (project.completedTasks / project.targetTasks) * 100)}%` }}
                                />
                            </div>
                        </div>
                    ))
                )}
            </div>
            <button
                onClick={onViewAll}
                className="w-full mt-4 bg-indigo-600/10 border border-indigo-600/20 text-indigo-400 hover:bg-indigo-600 hover:text-white text-center py-2 rounded-lg text-sm font-bold transition-all"
            >
                View All Projects
            </button>
        </div>
    );
};
