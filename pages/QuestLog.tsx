import React, { useState, useEffect } from 'react';
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from 'react-router-dom';
import { useGameStore, INITIAL_PROJECTS, INITIAL_TASKS } from '../store/useGameStore';

import { ChevronDown, CheckCircle2, Circle, Trophy, PlusCircle, AlertCircle, Sword, Sparkles, Zap, Scroll, Map, Calendar, Coins, Gift, Activity, Brain, Utensils, Users, Moon, Hammer, Eraser, Plus, Book, Trash2, Clock, Repeat, Flame, X, AlertTriangle, Heart, Award, Crown, Target } from 'lucide-react';
import { Task } from '../types';
import { DndContext, DragEndEvent, DragOverlay, useSensor, useSensors, PointerSensor, closestCorners, useDroppable, pointerWithin, rectIntersection, CollisionDetection, getFirstCollision } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MerchantCard, MerchantModal } from '../components/MerchantCard';
import { SHOP_ITEMS } from '../src/utils/GameEconomy';
import { ProjectDetailView } from '../components/ProjectDetailView';
import { MiniCharacterCard } from '../components/MiniCharacterCard';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQuery } from "convex/react";
import { PenSquare, ChevronLeft, ChevronRight, Layout } from 'lucide-react';
import { api } from "../convex/_generated/api";
import { HealthDisplay } from '../components/ui/HealthDisplay';
import { CharacterSidebar } from '../components/character/CharacterSidebar';
import { CreateBountyCard } from '../components/questlog/CreateBountyCard';


export const QuestCard: React.FC<{
  task: Task;
  completeTask: (id: string) => void;
  deleteTask: (id: string) => void;
  updateTask: (task: Task) => void;
  onEdit?: (task: Task) => void;
  layoutId?: string;
  mostWantedTaskId?: string;
  setMostWantedTask?: (id: string) => void;
  mostWantedUnlocked?: boolean;
}> = ({ task, completeTask, deleteTask, updateTask, onEdit, layoutId, mostWantedTaskId, setMostWantedTask, mostWantedUnlocked }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!task) return null;

  return (
    <motion.div
      layout={!!layoutId}
      layoutId={layoutId}
      onClick={() => setIsExpanded(!isExpanded)}
      className={`
      relative p-3 rounded-xl border transition-all duration-300 group cursor-pointer
      ${task.completed ? 'bg-slate-50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800 opacity-50' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/10'}
      ${mostWantedTaskId === task.id ? 'ring-2 ring-red-500 border-red-500 dark:border-red-500 bg-red-50 dark:bg-red-900/10' : ''}
    `}>
      {/* Most Wanted Badge */}
      {mostWantedTaskId === task.id && (
        <div className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded shadow-sm z-10 animate-bounce flex items-center gap-1">
          <Target size={10} /> WANTED
        </div>
      )}

      <div className="flex items-start gap-3">
        {/* Checkbox */}
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
              mt-0.5 h-5 w-5 flex-shrink-0 flex items-center justify-center rounded-full border-2 transition-all duration-300
              ${task.completed
              ? 'bg-green-500/10 border-green-500/30 text-green-500'
              : 'border-slate-300 dark:border-slate-600 text-transparent hover:border-indigo-500 hover:text-indigo-500 dark:hover:text-indigo-400 group-hover:scale-110'}
            `}
        >
          {task.completed && <CheckCircle2 size={12} />}
        </button>

        <div className="flex-1 min-w-0">
          {/* Title and Icons Header */}
          <div className="flex items-center gap-2">
            <h4 className={`font-bold text-sm break-words leading-tight ${task.completed ? 'text-slate-400 dark:text-slate-500 line-through' : 'text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-white'}`}>
              {task.name}
            </h4>
            {/* Quick Indicators (Visible even when collapsed) */}
            <div className="flex items-center gap-1 opacity-60">
              {task.type === 'daily' && !task.frequency && <Sparkles size={10} className="text-sky-400" />}
              {task.frequency && <Repeat size={10} className="text-slate-400" />}
              {task.deadline && <Clock size={10} className="text-red-400" />}

              {/* Collapsed Source Labels */}
              {task.projectId === 'col-todo' && <span className="text-[8px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded ml-1">TO-DO</span>}
              {task.projectId === 'col-habit' && <span className="text-[8px] font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-1 py-0.5 rounded ml-1">HABIT</span>}
              {task.projectId === 'col-guild' && <span className="text-[8px] font-bold text-violet-500 bg-violet-50 dark:bg-violet-900/20 px-1 py-0.5 rounded ml-1">GUILD</span>}
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
                              // Toggle Off - pass empty string or handled by store?
                              // Store likely expects a string. Let's pass empty string or check store.
                              // Actually, let's update store to handle it or pass undefined/null if possible.
                              // As setMostWantedTask takes string, I might need to cast or rely on store logic.
                              // But wait, I can just use a specific value or empty string to clear.
                              // Let's try passing empty string, or updating store to accept undefined.
                              // But for now, lets assume I can pass task.id again to toggle? No that sets it.
                              // I'll assume passing the SAME id should be handled by logic, OR I need to handle it here.
                              // Simplest: If logic here says "if current == task, unset", then call setMostWantedTask('')
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
          className="absolute top-2 right-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
          title="Delete Task"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </motion.div>
  );
};

export const SortableQuestCard: React.FC<{
  task: Task;
  completeTask: (id: string) => void;
  deleteTask: (id: string) => void;
  updateTask: (task: Task) => void;
  onEdit?: (task: Task) => void;
  mostWantedTaskId?: string;
  setMostWantedTask?: (id: string) => void;
  mostWantedUnlocked?: boolean;
}> = ({ task, completeTask, deleteTask, updateTask, onEdit, mostWantedTaskId, setMostWantedTask, mostWantedUnlocked }) => {
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

export const QuestLog: React.FC = () => {
  const navigate = useNavigate();
  /* LEFT SIDEBAR - Character & Merchant */
  const { projects, tasks, completeTask, completeProject, stats, addTasks, addProjects, createTask, moveTask, reorderTasks, addToCart, updateTask, mostWantedTaskId, setMostWantedTask, skillNodes } = useGameStore();
  const { user } = useUser();
  const firstName = user?.firstName || stats.name;

  // Check for Most Wanted Skill
  const mostWantedUnlocked = skillNodes.find(n => n.id === 'branch_3-3')?.data.isUnlocked;
  // Check for Kanban Warrior Skill (branch_3-6)
  const kanbanUnlocked = skillNodes.find(n => n.id === 'branch_3-6')?.data.isUnlocked;

  const [isBountyModalOpen, setIsBountyModalOpen] = useState(false);
  const [isKanbanView, setIsKanbanView] = useState(false);

  // Robust wrapper to ensure delete functionality
  const handleDeleteTask = (taskId: string) => {
    useGameStore.getState().deleteTask(taskId);
  };

  // Guild Contribution Hook
  const contributeToProject = useMutation(api.guilds.projects.contribute);

  const handleCompleteTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // Local completion first for UI responsiveness
    completeTask(taskId);

    // If it's a guild task, sync contribution to backend
    if (task.type === 'guild' && task.projectId) {
      try {
        await contributeToProject({
          projectId: task.projectId as any, // ID type assertion
          amount: 1
        });
        console.log("Contributed to project via task completion");
      } catch (e) {
        console.error("Failed to contribute to guild project:", e);
        // Ideally revert local state if crucial, but for now we Log.
      }
    }
  };

  console.log('QuestLog Render:', { hasDeleteTask: !!useGameStore.getState().deleteTask });

  const [isGenerating, setIsGenerating] = useState(false);
  const [isQuestModalOpen, setIsQuestModalOpen] = useState(false);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [expandedQuestId, setExpandedQuestId] = useState<string | null>(null);
  const [activeProtocolPillar, setActiveProtocolPillar] = useState<'physical' | 'mental' | 'nutrition' | 'social' | 'sleep'>('physical');

  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  // Edit Mode State
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsEditModalOpen(true);
  };

  const handleSaveEditedTask = (updatedTask: any) => {
    updateTask(updatedTask);
    setIsEditModalOpen(false);
    setEditingTask(null);
  };

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Use standard rectIntersection for Kanban-style container dropping
  // (We removed the complex customCollisionDetection to simplify behavior)

  const handleDragStart = (event: DragEndEvent) => {
    setActiveDragId(event.active.id as string);
  };

  const handleDragOver = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find the containers
    const activeTask = tasks.find(t => t.id === activeId);
    const overTask = tasks.find(t => t.id === overId);

    if (!activeTask) return;

    let activeContainer = activeTask.projectId;

    if (isKanbanView) {
      // Determine visual column based on Kanban Logic
      if (activeTask.completed) {
        activeContainer = 'col-guild';
      } else if (activeTask.kanbanStatus === 'DONE') {
        activeContainer = 'col-guild';
      } else if (activeTask.kanbanStatus === 'IN_PROGRESS') {
        activeContainer = 'col-habit';
      } else if (activeTask.kanbanStatus === 'TODO') {
        activeContainer = 'col-todo';
      } else if (activeTask.subtasks?.some(s => s.completed)) {
        activeContainer = 'col-habit';
      } else {
        activeContainer = 'col-todo';
      }
    }
    // Improved Container Detection using dnd-kit data
    const overContainer = over.data.current?.sortable?.containerId || (['col-todo', 'col-habit', 'col-guild'].includes(overId) ? overId : null);

    if (!overContainer || activeContainer === overContainer) {
      return;
    }

    const activeIndex = tasks.findIndex(t => t.id === activeId);
    const overIndex = tasks.findIndex(t => t.id === overId);

    let newTasks = [...tasks];

    // Handle Status Updates based on Column (Only in Kanban View)
    if (isKanbanView) {
      const isMovingToDone = overContainer === 'col-guild';
      const isMovingToInProgress = overContainer === 'col-habit';
      const isMovingToTodo = overContainer === 'col-todo';

      const updates: Partial<Task> = {};

      // Note: We DO NOT update projectId in Kanban View anymore.
      // Separate Concern: Category vs Status.

      if (isMovingToDone) {
        // Enforce DONE state
        if (!activeTask.completed) {
          updates.completed = true;
          updates.kanbanStatus = 'DONE';
        } else if (activeTask.kanbanStatus !== 'DONE') {
          updates.kanbanStatus = 'DONE';
        }
      } else if (isMovingToInProgress) {
        // Enforce NOT DONE but IN PROGRESS
        if (activeTask.completed) updates.completed = false; // "move out of done column this should uncheck it"
        if (activeTask.kanbanStatus !== 'IN_PROGRESS') updates.kanbanStatus = 'IN_PROGRESS';
      } else if (isMovingToTodo) { // "Not Started"
        // Enforce NOT DONE and TODO
        if (activeTask.completed) updates.completed = false;
        if (activeTask.kanbanStatus !== 'TODO') updates.kanbanStatus = 'TODO';
      }

      if (Object.keys(updates).length > 0) {
        updateTask({ ...activeTask, ...updates });
      }

    } else {
      // Standard behavior: just update container/project ID
      // This is the Bounty Board View - Strictly Categorical
      if (activeTask.projectId !== overContainer) {
        updateTask({ ...activeTask, projectId: overContainer });
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId !== overId) {
      const oldIndex = tasks.findIndex((t) => t.id === activeId);
      const newIndex = tasks.findIndex((t) => t.id === overId);

      if (oldIndex !== -1 && newIndex !== -1) {
        reorderTasks(arrayMove(tasks, oldIndex, newIndex));
      }
    }

    setActiveDragId(null);
  };

  const handleCreateBounty = (taskData: any) => {
    createTask(taskData);
  };

  // Disable old expansion logic
  const expandedProjects: string[] = [];

  const handleProjectClick = (id: string) => {
    setActiveProjectId(id);
  };

  const handleCloseDetail = () => {
    setActiveProjectId(null);
  };



  const handleAddItem = (item: any) => {
    addToCart({
      id: item.id,
      name: item.name,
      description: item.description,
      type: item.type,
      cost: item.cost,
      acquiredAt: new Date().toISOString(),
      quantity: 1
    });
  };



  useEffect(() => {
    // Migration: Check for Column Refactor (Titan -> To-Do)
    const store = useGameStore.getState();
    const hasNewColumns = store.projects.some(p => p.id === 'col-todo');

    if (!hasNewColumns) {
      console.log('Migrating to new Column IDs...');
      // 1. Add new projects (columns)
      store.addProjects(INITIAL_PROJECTS);

      // 2. Migrate existing tasks to new IDs
      const migratedTasks = store.tasks.map(t => {
        if (t.projectId === 'p-titan-1') return { ...t, projectId: 'col-todo' };
        if (t.projectId === 'p-tycoon-1') return { ...t, projectId: 'col-habit' };
        if (t.projectId === 'p-tycoon-2') return { ...t, projectId: 'col-guild' }; // assuming guild column
        if (t.projectId === 'p-tech-1') return { ...t, projectId: 'col-todo' }; // Tech orphaned -> To-Do
        return t;
      });

      // Update tasks in store (need a bulk update or just replace all?)
      // We don't have replaceTasks, but addTasks appends? 
      // Actually we should define a way to bulk update. 
      // For now, let's just addTasks? No that duplicates.
      // We can use updateTask multiple times or just rely on 'reorderTasks' which sets tasks?
      store.reorderTasks(migratedTasks);
    }
  }, []);

  // Renamed to handleProjectClick usage in JSX below
  const toggleProject = (id: string) => {
    handleProjectClick(id);
  };



  // Helper to get bounties for a specific foundation
  const getBountiesForFoundation = (projectId: string) => {
    // STRICT CATEGORY LOGIC for Bounty Board
    // Just return tasks that match the projectId from the DB
    return tasks.filter(t => t.projectId === projectId);
  };

  const getVisibleBountiesMap = () => {
    if (expandedQuestId) {
      return { [expandedQuestId]: getBountiesForFoundation(expandedQuestId) };
    }
    return {
      'col-todo': getBountiesForFoundation('col-todo'),
      'col-habit': getBountiesForFoundation('col-habit'),
      'col-guild': getBountiesForFoundation('col-guild')
    };
  };

  const getKanbanBountiesMap = () => {
    // Flatten all tasks relevant to the Quest Log (excluding those completed long ago if needed, but here taking all active/recent)
    // Actually, we should look at allTasks from the store or just visible ones.
    // The previous getBountiesForFoundation filtered by projectId.
    // Here we want ALL tasks that would normally appear in the Quest Log (daily + foundations).

    // Simpler approach: Iterate through all tasks in store.

    const todoTasks: Task[] = [];
    const inProgressTasks: Task[] = [];
    const doneTasks: Task[] = [];

    // Filter tasks that belong to the main categories we track
    const relevantTasks = tasks.filter(t =>
      ['col-todo', 'col-habit', 'col-guild'].includes(t.projectId) ||
      // Also include tasks that might be daily quests generated
      (t as any).type === 'DAILY'
    );

    relevantTasks.forEach(task => {
      // 1. Completed Tasks -> Always DONE in Kanban (unless we decide to allow "Completed but In Progress"?? User said: "Done; this bounty is checked off... move out of done -> uncheck")
      if (task.completed) {
        doneTasks.push(task);
        return;
      }

      // 2. Manual Override (If explicitly set and NOT completed)
      if (task.kanbanStatus === 'IN_PROGRESS') {
        inProgressTasks.push(task);
        return;
      }
      if (task.kanbanStatus === 'TODO') {
        todoTasks.push(task);
        return;
      }
      if (task.kanbanStatus === 'DONE') {
        // Should verify consistency? If status says DONE but task.completed is false.
        // We can treat it as done or auto-fix? Let's just push to done tasks for view consistency.
        doneTasks.push(task);
        return;
      }

      // 3. Derived State (Only if no manual override)
      const hasCheckedSubtasks = task.subtasks?.some(st => st.completed);
      if (hasCheckedSubtasks) {
        inProgressTasks.push(task);
      } else {
        todoTasks.push(task);
      }
    });

    return {
      'col-todo': todoTasks,      // Maps to "To-Do" column
      'col-habit': inProgressTasks, // Maps to "In Progress" column
      'col-guild': doneTasks        // Maps to "Done" column
    };
  };

  const visibleBountiesMap = isKanbanView ? getKanbanBountiesMap() : getVisibleBountiesMap();


  const now = new Date();
  const resetTime = new Date();
  resetTime.setHours(24, 0, 0, 0);
  const hoursLeft = Math.floor((resetTime.getTime() - now.getTime()) / (1000 * 60 * 60));

  return (
    <div className="max-w-[95%] mx-auto pb-20">
      {/* Page Background */}
      {/* Page Background - Removed missing image, relying on CSS pattern in Layout */}
      {/* Overlay to ensure text readability */}
      <div className="fixed inset-0 z-[-1] bg-slate-950/70 pointer-events-none" />

      {/* Quest Modal */}
      <MerchantModal
        isOpen={isQuestModalOpen}
        onClose={() => setIsQuestModalOpen(false)}
        inventory={SHOP_ITEMS}
        onAddItem={handleAddItem}
      />

      {/* Edit Modal Overlay */}
      {isEditModalOpen && editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md">
            <CreateBountyCard
              projectId={editingTask.projectId}
              onCreate={handleSaveEditedTask}
              initialData={editingTask}
              onCancel={() => setIsEditModalOpen(false)}
            />
          </div>
        </div>
      )}

      <div className={`flex flex-col lg:flex-row gap-8 mt-8 transition-opacity duration-300 ${isQuestModalOpen ? 'opacity-20 pointer-events-none' : ''}`}>

        {/* LEFT SIDEBAR - Character & Merchant */}
        <div className="w-full lg:w-48 flex-shrink-0 space-y-6 sticky top-4 h-fit self-start">
          <CharacterSidebar className="hidden lg:block w-full lg:w-48 flex-shrink-0 animate-in slide-in-from-left-4 duration-500" />
          <MerchantCard
            description="The stars have shifted. I have opportunities for one with your talents."
            onNewQuestClick={() => setIsQuestModalOpen(true)}
            isModalOpen={isQuestModalOpen}
          />
        </div>

        {/* RIGHT CONTENT (Main Column) */}
        <div className="flex-1 space-y-8">



          {/* Create Bounty Modal */}
          {isBountyModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
              <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                  <h3 className="font-bold text-slate-700 dark:text-slate-200">Create New Bounty</h3>
                  <button onClick={() => setIsBountyModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X size={20} /></button>
                </div>
                <div className="p-4">
                  <CreateBountyCard
                    projectId="col-todo"
                    onCreate={(task) => {
                      handleCreateBounty(task);
                      setIsBountyModalOpen(false);
                    }}
                    onCancel={() => setIsBountyModalOpen(false)}
                    defaultExpanded={true}
                  />
                </div>
              </div>
            </div>
          )}

          {/* New Header for Bounties & Tools */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <h2 className="text-xl md:text-2xl font-black text-slate-700 dark:text-slate-200 uppercase tracking-widest drop-shadow-sm">Hello <span className="text-amber-500">{firstName}</span>, welcome back.</h2>
            </div>

            <div className="flex items-center gap-2">
              {/* Kanban View Toggle */}
              {kanbanUnlocked && (
                <button
                  onClick={() => setIsKanbanView(!isKanbanView)}
                  className={`flex items-center gap-2 px-3 py-2 border rounded-lg transition-all group ${isKanbanView ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'}`}
                >
                  <Layout size={16} className={`${isKanbanView ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'} transition-colors`} />
                  <span className={`text-xs font-bold ${isKanbanView ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-600 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200'} uppercase tracking-wider`}>Kanban</span>
                </button>
              )}

              {/* Journal Tool */}
              <button
                onClick={() => navigate('/app/journal')}
                className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:border-purple-500/50 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-all group"
              >
                <Book size={16} className="text-slate-400 group-hover:text-purple-500 transition-colors" />
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400 group-hover:text-purple-600 dark:group-hover:text-purple-300 uppercase tracking-wider">Journal</span>
              </button>

              {/* Grindstone Tool */}
              <button
                onClick={() => navigate('/app/tools/grindstone')}
                className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:border-amber-500/50 hover:bg-amber-50 dark:hover:bg-amber-900/10 transition-all group"
              >
                <Hammer size={16} className="text-slate-400 group-hover:text-amber-500 transition-colors" />
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400 group-hover:text-amber-600 dark:group-hover:text-amber-300 uppercase tracking-wider">Grindstone</span>
              </button>

              {/* Create Bounty Button */}
              <button
                onClick={() => setIsBountyModalOpen(true)}
                className="flex items-center justify-center w-9 h-9 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-lg shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95"
                title="Create New Bounty"
              >
                <Plus size={20} className="stroke-[3]" />
              </button>
            </div>
          </div>



          <div className="flex flex-col h-full min-h-[500px] mt-6">
            <DndContext
              sensors={sensors}
              collisionDetection={rectIntersection}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 h-full">
                {['col-todo', 'col-habit', 'col-guild'].map((pid) => {
                  /* 
                     We are effectively using these IDs as "Generic Containers" now, 
                     orphaned from the actual Foundation Projects conceptually in the UI.
                  */
                  const columnBounties = visibleBountiesMap[pid as any] || [];

                  // Explicit titles, ignoring Project Names if we want to "orphan" them
                  let title = {
                    'col-todo': 'To-Do',
                    'col-habit': 'Habits',
                    'col-guild': 'Guild'
                  }[pid] || 'Tasks';

                  if (isKanbanView) {
                    title = {
                      'col-todo': 'Not Started',
                      'col-habit': 'In Progress',
                      'col-guild': 'Done'
                    }[pid] || 'Tasks';
                  }

                  return (
                    <BountyColumn
                      key={pid}
                      pid={pid}
                      title={title}
                      bounties={columnBounties}
                      completeTask={handleCompleteTask}
                      deleteTask={handleDeleteTask}
                      updateTask={updateTask}
                      onEdit={handleEditTask}
                      onCreate={handleCreateBounty}
                      isKanban={isKanbanView}
                      mostWantedTaskId={mostWantedTaskId}
                      setMostWantedTask={setMostWantedTask}
                      mostWantedUnlocked={mostWantedUnlocked}
                    />
                  );
                })}
              </div>
              <DragOverlay dropAnimation={null}>
                {activeDragId ? (
                  <div className="cursor-grabbing pointer-events-none">
                    <QuestCard
                      task={tasks.find(t => t.id === activeDragId)!}
                      completeTask={() => { }}
                      deleteTask={() => { }}
                      updateTask={() => { }}
                    />
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          </div>
        </div>

        {/* RIGHT SIDEBAR - Sticky */}


        {/* DETAIL VIEW OVERLAY */}
        {/* DETAIL VIEW OVERLAY */}
        <AnimatePresence>
          {
            activeProjectId && (() => {
              /*
              const activeProject = projects.find(p => p.id === activeProjectId);
              if (!activeProject) return null;
   
              const activeTasks = tasks.filter(t => t.projectId === activeProjectId);
   
              // Background Logic
              const index = projects.findIndex(p => p.id === activeProjectId);
              const getColumnBackground = (columnName: string) => {
  switch (columnName) {
    case 'To-Do': return "url('/images/quest_cards/vitality_peak.jpg')";
    case 'Habits': return "url('/images/quest_cards/scholars_cache.jpg')";
    case 'Guild': return "url('/images/quest_cards/stewards_castle.jpg')"; // Assuming closest match
    default: return "url('/images/quest_cards/quest_card_background_4.jpg')";
  }
  };
              const bg = getColumnBackground(activeProject.name);
   
              return (
                <ProjectDetailView
                  key={activeProjectId}
                  project={activeProject}
                  tasks={activeTasks}
                  onClose={handleCloseDetail}
                  background={bg}
                />
              );
              */
              return null;
            })()
          }
        </AnimatePresence>
      </div>
    </div>
  );
};
