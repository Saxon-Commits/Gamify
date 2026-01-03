
import React from 'react';
import { useGameStore } from '../store/useGameStore';
import { Circle, Clock, ArrowRight, Sword } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const { tasks, projects, completeTask } = useGameStore();

  const activeProjects = projects.filter(p => !p.completed).slice(0, 3);
  const dailyTasks = tasks.filter(t => !t.completed).slice(0, 6);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Tasks Widget */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="px-5 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
            <div className="flex items-center space-x-2">
              <Clock size={18} className="text-indigo-400" />
              <h2 className="text-sm font-bold uppercase tracking-wider">Active Side Quests</h2>
            </div>
            <Link to="/app" className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors uppercase flex items-center">
              View All <ArrowRight size={10} className="ml-1" />
            </Link>
          </div>
          <div className="divide-y divide-slate-800">
            {dailyTasks.length > 0 ? dailyTasks.map(task => (
              <div key={task.id} className="p-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors group">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => completeTask(task.id)}
                    className="text-slate-600 hover:text-indigo-400 transition-colors"
                  >
                    <Circle size={18} />
                  </button>
                  <div>
                    <p className="text-sm font-medium text-slate-200">{task.name}</p>
                    <div className="flex space-x-2 text-[10px] text-slate-500 uppercase font-bold">
                      <span className="text-indigo-500/80">{task.xpReward} XP</span>
                      <span className="text-yellow-500/80">{task.goldReward}G</span>
                    </div>
                  </div>
                </div>
              </div>
            )) : (
              <div className="p-12 text-center">
                <p className="text-slate-500 text-sm italic">All current side quests cleared.</p>
              </div>
            )}
          </div>
        </section>

        {/* Active Quests Widget */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="px-5 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
            <div className="flex items-center space-x-2">
              <Sword size={18} className="text-purple-400" />
              <h2 className="text-sm font-bold uppercase tracking-wider">Main Quest Progress</h2>
            </div>
          </div>
          <div className="p-5 space-y-6">
            {activeProjects.map(project => {
              const projectTasks = tasks.filter(t => t.projectId === project.id);
              const completedCount = projectTasks.filter(t => t.completed).length;
              const totalCount = projectTasks.length;
              const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

              return (
                <div key={project.id} className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-bold text-slate-100">{project.name}</h3>
                      <p className="text-[10px] text-slate-500 line-clamp-1">{project.description}</p>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      {completedCount}/{totalCount}
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-purple-600 to-indigo-500 h-full transition-all duration-700 shadow-[0_0_10px_rgba(168,85,247,0.3)]"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {activeProjects.length === 0 && (
              <div className="text-center py-12">
                <p className="text-slate-500 text-sm italic">No active main quests.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
