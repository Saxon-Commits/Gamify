import React from 'react';
import { Task } from '../../types';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { AnimatePresence, motion } from 'framer-motion';
import { Layout, Plus } from 'lucide-react';
import { SortableQuestCard } from './QuestCard';

export const BountyColumn: React.FC<{
    pid: string;
    title: string;
    bounties: Task[];
    completeTask: (id: string) => void;
    deleteTask: (id: string) => void;
    updateTask: (task: Task) => void;
    onEdit: (task: Task) => void;
    onCreate: (task: any) => void;
    isKanban?: boolean;
    mostWantedTaskId?: string;
    setMostWantedTask?: (id: string) => void;
    mostWantedUnlocked?: boolean;
}> = ({
    pid,
    title,
    bounties,
    completeTask,
    deleteTask,
    updateTask,
    onEdit,
    onCreate,
    isKanban = false,
    mostWantedTaskId,
    setMostWantedTask,
    mostWantedUnlocked
}) => {

        const { setNodeRef, isOver } = useDroppable({
            id: pid,
            data: { type: 'Column' }
        });

        return (
            <div
                ref={setNodeRef}
                className={`w-full h-full min-h-[150px] flex flex-col transition-colors duration-200 rounded-xl ${isOver ? 'bg-indigo-50/50 dark:bg-indigo-900/20 ring-2 ring-indigo-400/30' : ''}`}
            >
                <div className="flex items-center gap-2 mb-2">
                    <AnimatePresence mode="wait">
                        {isKanban ? (
                            <motion.div
                                key="kanban-title"
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 5 }}
                                transition={{ duration: 0.2 }}
                                className="flex items-center gap-2"
                            >
                                <div className={`p-1 rounded bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400`}>
                                    <Layout size={12} />
                                </div>
                                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">{title}</span>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="standard-title"
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 5 }}
                                transition={{ duration: 0.2 }}
                                className="flex items-center gap-2"
                            >
                                <div className="p-1 rounded opacity-0">
                                    <Layout size={12} />
                                </div>
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{title}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="h-[1px] flex-1 bg-slate-200 dark:bg-slate-800" />
                    <button className="text-slate-400 dark:text-slate-500 hover:text-indigo-500 dark:hover:text-indigo-400">
                        <Plus size={14} />
                    </button>
                </div>



                <SortableContext id={pid} items={bounties.map(t => t.id)} strategy={verticalListSortingStrategy}>
                    <div className="flex-1 min-h-[300px] flex flex-col gap-3">
                        <AnimatePresence mode="popLayout">
                            {bounties.map((quest) => (
                                <SortableQuestCard
                                    key={quest.id}
                                    task={quest}
                                    completeTask={completeTask}
                                    deleteTask={deleteTask}
                                    updateTask={updateTask}
                                    onEdit={onEdit}
                                    mostWantedTaskId={mostWantedTaskId}
                                    setMostWantedTask={setMostWantedTask}
                                    mostWantedUnlocked={mostWantedUnlocked}
                                />
                            ))}
                        </AnimatePresence>
                        {bounties.length === 0 && (
                            <div className="flex-1 min-h-[100px] flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900/10 opacity-50">
                                <p className="text-xs font-medium text-slate-400 dark:text-slate-500">Drag items here</p>
                            </div>
                        )}
                    </div>
                </SortableContext>
            </div>
        );
    };
