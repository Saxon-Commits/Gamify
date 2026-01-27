import React, { useState } from 'react';
import { Task } from '../../types';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Sparkles, Repeat, Clock, Coins, Target, Trash2, PenSquare } from 'lucide-react';
import { HabitPill } from './HabitPill';

interface QuestCardProps {
    task: Task;
    completeTask: (id: string) => void;
    deleteTask: (id: string) => void;
    updateTask: (task: Task) => void;
    onEdit?: (task: Task) => void;
    layoutId?: string;
    mostWantedTaskId?: string;
    setMostWantedTask?: (id: string) => void;
    mostWantedUnlocked?: boolean;
}

export const QuestCard: React.FC<QuestCardProps> = ({
    task,
    completeTask,
    deleteTask,
    updateTask,
    onEdit,
    layoutId,
    mostWantedTaskId,
    setMostWantedTask,
    mostWantedUnlocked
}) => {
    const [isExpanded, setIsExpanded] = useState(false);

    if (!task) return null;

    return (
        <motion.div
            layout={!!layoutId}
            layoutId={layoutId}
            onClick={() => setIsExpanded(!isExpanded)}
            className={`
      relative p-3 rounded-xl border transition-all duration-300 group cursor-pointer overflow-hidden
      ${task.completed ? 'bg-slate-50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800 opacity-50' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/10'}
      ${mostWantedTaskId === task.id ? 'ring-2 ring-red-500 border-red-500 dark:border-red-500 bg-red-50 dark:bg-red-900/10' : ''}
    `}
            style={{
                backgroundImage: task.backgroundImage ? `url('${task.backgroundImage}')` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
            }}
        >
            {/* Background Image Overlay for text readability */}
            {task.backgroundImage && (
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60 rounded-xl" />
            )}

            {/* Content wrapper with relative positioning */}
            <div className="relative z-10">
                {/* Most Wanted Badge */}
                {mostWantedTaskId === task.id && (
                    <div className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded shadow-sm z-10 animate-bounce flex items-center gap-1">
                        <Target size={10} /> WANTED
                    </div>
                )}

                <div className="flex items-start gap-3">
                    {/* Checkbox - Hidden for habits (they use counter pill instead) */}
                    {task.projectId !== 'col-habit' && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (task.completed) {
                                    updateTask({ ...task, completed: false });
                                } else {
                                    completeTask(task.id);
                                }
                            }}
                            className={`
                  mt-0.5 h-6 w-6 flex-shrink-0 flex items-center justify-center rounded-md border-2 transition-all duration-300
                  ${task.completed
                                    ? 'bg-green-500/10 border-green-500/30 text-green-500'
                                    : 'border-slate-300 dark:border-slate-600 text-transparent hover:border-indigo-500 hover:text-indigo-500 dark:hover:text-indigo-400 group-hover:scale-110'}
                `}
                        >
                            {task.completed && <CheckCircle2 size={14} />}
                        </button>
                    )}

                    <div className="flex-1 min-w-0">
                        {/* Title and Icons Header */}
                        <div className="flex items-center gap-2">
                            <h4 className={`font-bold text-sm break-words leading-tight ${task.completed ? 'text-slate-400 dark:text-slate-500 line-through' : 'text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-white'}`}>
                                {task.name}
                            </h4>

                            {/* Habit Counter Pill - Only shown for habits */}
                            {task.projectId === 'col-habit' && (
                                <HabitPill
                                    count={task.habitCount ?? 0}
                                    onIncrement={() => {
                                        updateTask({ ...task, habitCount: (task.habitCount ?? 0) + 1 });
                                    }}
                                    onDecrement={() => {
                                        const currentCount = task.habitCount ?? 0;
                                        if (currentCount > 0) {
                                            updateTask({ ...task, habitCount: currentCount - 1 });
                                        }
                                    }}
                                />
                            )}

                            {/* Quick Indicators (Visible even when collapsed) */}
                            <div className="flex items-center gap-1 opacity-60">
                                {task.type === 'daily' && !task.frequency && <Sparkles size={10} className="text-sky-400" />}
                                {task.frequency && <Repeat size={10} className="text-slate-400" />}
                                {task.deadline && <Clock size={10} className="text-red-400" />}

                                {/* Collapsed Source Labels */}
                                {task.projectId === 'col-todo' && <span className="text-[9px] font-bold text-slate-700 dark:text-slate-200 bg-slate-200 dark:bg-slate-700 border border-slate-400 dark:border-slate-600 px-1.5 py-0.5 rounded ml-1 shadow-sm">TO-DO</span>}
                                {task.projectId === 'col-habit' && <span className="text-[9px] font-bold text-white dark:text-white bg-emerald-600 dark:bg-emerald-700 border border-emerald-500 dark:border-emerald-600 px-1.5 py-0.5 rounded ml-1 shadow-sm">HABIT</span>}
                                {task.projectId === 'col-guild' && <span className="text-[9px] font-bold text-white dark:text-white bg-violet-600 dark:bg-violet-700 border border-violet-500 dark:border-violet-600 px-1.5 py-0.5 rounded ml-1 shadow-sm">GUILD</span>}
                            </div>
                        </div>

                        {/* Subtasks (Always Visible if present) */}
                        {task.subtasks && task.subtasks.length > 0 && (
                            <div className="mt-2 space-y-1">
                                {task.subtasks.map((subtask, index) => (
                                    <div key={subtask.id || index} className="flex items-start gap-2 group/sub" onClick={(e) => e.stopPropagation()}>
                                        <button
                                            onClick={() => {
                                                const newSubtasks = [...task.subtasks!];
                                                newSubtasks[index] = { ...subtask, completed: !subtask.completed };
                                                updateTask({ ...task, subtasks: newSubtasks });
                                            }}
                                            className={`mt-0.5 w-3 h-3 rounded-sm border flex items-center justify-center transition-colors ${subtask.completed ? 'bg-indigo-500 border-indigo-500' : 'border-slate-300 dark:border-slate-600 hover:border-indigo-400'}`}
                                        >
                                            {subtask.completed && <CheckCircle2 size={8} className="text-white" />}
                                        </button>
                                        <span className={`text-[10px] leading-tight ${subtask.completed ? 'text-slate-400 line-through' : 'text-slate-600 dark:text-slate-400'}`}>{subtask.text}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Expanded Content */}
                        <AnimatePresence>
                            {isExpanded && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="pt-3 mt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">

                                        {/* Description */}
                                        {task.description && <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{task.description}</p>}

                                        {/* Metadata Tags */}
                                        <div className="flex flex-wrap gap-2">
                                            {task.type === 'daily' && !task.frequency && <span className="text-[9px] font-bold text-sky-500 bg-sky-50 dark:bg-sky-900/20 px-1.5 py-0.5 rounded border border-sky-200 dark:border-sky-800">DAILY</span>}
                                            {task.frequency && <span className="text-[9px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">{task.frequency.toUpperCase()}</span>}
                                            {task.deadline && <span className="text-[9px] font-bold text-red-500 bg-red-50 dark:bg-red-900/20 px-1.5 py-0.5 rounded border border-red-200 dark:border-red-800">{new Date(task.deadline).toLocaleDateString()}</span>}

                                            {/* Source Column Labels */}
                                            {task.projectId === 'col-todo' && <span className="text-[9px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">TO-DO</span>}
                                            {task.projectId === 'col-habit' && <span className="text-[9px] font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">HABIT</span>}
                                            {task.projectId === 'col-guild' && <span className="text-[9px] font-bold text-violet-500 bg-violet-50 dark:bg-violet-900/20 px-1.5 py-0.5 rounded border border-violet-200 dark:border-violet-800">GUILD</span>}
                                        </div>

                                        {/* Footer: Rewards & Edit */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                {/* Most Wanted Toggle */}
                                                {mostWantedUnlocked && !task.completed && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (mostWantedTaskId === task.id) {
                                                                setMostWantedTask && setMostWantedTask(mostWantedTaskId === task.id ? '' : task.id);
                                                            } else {
                                                                setMostWantedTask && setMostWantedTask(task.id);
                                                            }
                                                        }}
                                                        className={`flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded border transition-colors
                            ${mostWantedTaskId === task.id
                                                                ? 'bg-red-600 text-white border-red-600 hover:bg-red-700'
                                                                : 'text-slate-400 hover:text-red-500 bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/20 border-slate-200 dark:border-slate-700 hover:border-red-200 dark:hover:border-red-800'
                                                            }`}
                                                        title={mostWantedTaskId === task.id ? "Unset Most Wanted" : "Set as Most Wanted"}
                                                    >
                                                        <Target size={10} />
                                                        <span>{mostWantedTaskId === task.id ? 'ACTIVE' : 'WANTED'}</span>
                                                    </button>
                                                )}

                                                <div className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 px-1.5 py-0.5 rounded border border-indigo-200 dark:border-indigo-900/50">
                                                    <span>+{task.xpReward} XP</span>
                                                </div>
                                                {task.goldReward > 0 && (
                                                    <div className="flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-900/50">
                                                        <Coins size={10} />
                                                        <span>+{task.goldReward}</span>
                                                    </div>
                                                )}
                                            </div>

                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onEdit && onEdit(task);
                                                }}
                                                className="text-xs text-slate-400 hover:text-indigo-500 flex items-center gap-1 font-medium transition-colors"
                                            >
                                                <PenSquare size={12} /> Edit
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Action Buttons: Delete (Absolute, Hover Only) */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            deleteTask(task.id);
                        }}
                        className="absolute top-2 right-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 z-20"
                        title="Delete Task"
                    >
                        <Trash2 size={14} />
                    </button>
                </div> {/* End content wrapper */}
            </div>
        </motion.div>
    );
};

interface SortableQuestCardProps extends QuestCardProps { }

export const SortableQuestCard: React.FC<SortableQuestCardProps> = ({
    task,
    completeTask,
    deleteTask,
    updateTask,
    onEdit,
    mostWantedTaskId,
    setMostWantedTask,
    mostWantedUnlocked
}) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 999 : 1,
        position: 'relative' as 'relative',
        touchAction: 'none'
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <QuestCard
                task={task}
                completeTask={completeTask}
                deleteTask={deleteTask}
                updateTask={updateTask}
                onEdit={onEdit}
                layoutId={task.id}
                mostWantedTaskId={mostWantedTaskId}
                setMostWantedTask={setMostWantedTask}
                mostWantedUnlocked={mostWantedUnlocked}
            />
        </div>
    );
};
