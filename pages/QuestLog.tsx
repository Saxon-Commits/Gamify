import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore, INITIAL_PROJECTS, INITIAL_TASKS } from '../store/useGameStore';
import { generateDailyQuests } from '../src/utils/aiQuestGenerator';
import { ChevronDown, CheckCircle2, Circle, Trophy, PlusCircle, AlertCircle, Sword, Sparkles, Zap, Scroll, Map, Calendar, Coins, Gift, Activity, Brain, Utensils, Users, Moon, Hammer, Eraser, Plus, Book, Trash2, Clock, Repeat, Flame, X, AlertTriangle } from 'lucide-react';
import { QuestDifficulty, Task } from '../types';
import { DndContext, DragEndEvent, DragOverlay, useSensor, useSensors, PointerSensor, closestCorners, useDroppable, pointerWithin, rectIntersection, CollisionDetection, getFirstCollision } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MerchantCard, MerchantModal } from '../components/MerchantCard';
import { SHOP_ITEMS } from '../src/utils/GameEconomy';
import { ProjectDetailView } from '../components/ProjectDetailView';
import { MiniCharacterCard } from '../components/MiniCharacterCard';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation } from "convex/react";
import { PenSquare, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from "../convex/_generated/api";

const DifficultyBadge: React.FC<{ difficulty: QuestDifficulty }> = ({ difficulty }) => {
  const colors = {
    TRIVIAL: 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700',
    EASY: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800/50',
    MEDIUM: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800/50',
    HARD: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/50',
    EPIC: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800/50'
  };

  return (
    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border ${colors[difficulty]}`}>
      {difficulty}
    </span>
  );
};

export const QuestCard: React.FC<{
  task: Task;
  completeTask: (id: string) => void;
  deleteTask: (id: string) => void;
  updateTask: (task: Task) => void;
  onEdit?: (task: Task) => void;
}> = ({ task, completeTask, deleteTask, updateTask, onEdit }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!task) return null;

  return (
    <div
      onClick={() => setIsExpanded(!isExpanded)}
      className={`
      relative p-3 rounded-xl border transition-all duration-300 group cursor-pointer
      ${task.completed ? 'bg-slate-50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800 opacity-50' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/10'}
    `}>
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
                    {task.penalty && (task.penalty.gold || task.penalty.xp) ? <span className="text-[9px] font-bold text-red-600 bg-red-100 dark:bg-red-900/30 px-1.5 py-0.5 rounded border border-red-200 dark:border-red-800">PENALTY</span> : null}
                  </div>

                  {/* Footer: Rewards & Edit */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
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
    </div>
  );
};

export const SortableQuestCard: React.FC<{
  task: Task;
  completeTask: (id: string) => void;
  deleteTask: (id: string) => void;
  updateTask: (task: Task) => void;
  onEdit?: (task: Task) => void;
}> = ({ task, completeTask, deleteTask, updateTask, onEdit }) => {
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
      <QuestCard task={task} completeTask={completeTask} deleteTask={deleteTask} updateTask={updateTask} onEdit={onEdit} />
    </div>
  );
};

const FoundationsCarousel: React.FC<{ projects: any[], activeProjectId: string | null, onProjectClick: (id: string) => void }> = ({ projects, activeProjectId, onProjectClick }) => {
  const [index, setIndex] = useState(0);

  // Filter only foundation projects
  const foundations = projects.filter(p => ['col-todo', 'col-habit', 'col-guild'].includes(p.id));

  const nextSlide = () => {
    setIndex((prev) => (prev + 1) % foundations.length);
  };

  const prevSlide = () => {
    setIndex((prev) => (prev - 1 + foundations.length) % foundations.length);
  };

  const currentProject = foundations[index];

  if (!currentProject) return null;

  // Calculate Level
  const level = Math.floor(currentProject.hp / 100) + 1; // Simplified level logic
  const progress = (currentProject.hp % 100);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-lg select-none">
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
          <Trophy size={12} />
          <span>Foundations</span>
        </h3>
        {/* Dots */}
        <div className="flex gap-1">
          {foundations.map((_, i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${i === index ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-slate-700'}`}
            />
          ))}
        </div>
      </div>

      <div className="relative h-48 group">
        <AnimatePresence mode='wait'>
          <motion.div
            key={currentProject.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 cursor-pointer"
            onClick={() => onProjectClick(currentProject.id)}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(e, { offset, velocity }) => {
              const swipe = offset.x; // Drag distance
              if (swipe < -50) nextSlide();
              else if (swipe > 50) prevSlide();
            }}
          >
            {/* Background Image */}
            {currentProject.backgroundImage ? (
              <img
                src={currentProject.backgroundImage}
                alt={currentProject.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900" />
            )}

            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
              <div className="flex items-center gap-2 mb-1">
                {currentProject.icon && <img src={currentProject.icon} className="w-5 h-5 object-contain" />}
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/70">Level {level}</span>
              </div>
              <h4 className="text-xl font-black leading-tight mb-2 tracking-wide font-sans">{currentProject.name}</h4>

              {/* Progress Bar */}
              <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
                <div
                  className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between mt-1.5">
                <span className="text-[10px] text-white/60 font-medium">{progress} / 100 XP</span>
                <span className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider">Active</span>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows (Visible on Hover / Mobile?) */}
        <button
          onClick={(e) => { e.stopPropagation(); prevSlide(); }}
          className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/30 text-white/70 hover:bg-black/50 hover:text-white backdrop-blur-md transition-all opacity-0 group-hover:opacity-100"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); nextSlide(); }}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/30 text-white/70 hover:bg-black/50 hover:text-white backdrop-blur-md transition-all opacity-0 group-hover:opacity-100"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

const CreateBountyCard = ({ projectId, onCreate, initialData, onCancel }: { projectId: string; onCreate: (task: any) => void; initialData?: Task; onCancel?: () => void }) => {
  const [isExpanded, setIsExpanded] = useState(!!initialData);
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [difficulty, setDifficulty] = useState<QuestDifficulty>(initialData?.difficulty || 'EASY');
  const [category, setCategory] = useState<'col-todo' | 'col-habit' | 'col-guild'>((initialData?.projectId as any) || projectId || 'col-todo');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Enhanced Fields
  const [frequency, setFrequency] = useState<'once' | 'daily' | 'weekly' | 'monthly' | 'custom'>(initialData?.frequency || 'once');

  // Format deadline for input if it exists
  const formatDeadline = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      // datetime-local expects YYYY-MM-DDThh:mm
      return date.toISOString().slice(0, 16);
    } catch (e) { return ''; }
  };

  const [deadline, setDeadline] = useState(formatDeadline(initialData?.deadline));
  const [hasPenalty, setHasPenalty] = useState(!!initialData?.penalty);
  const [penaltyGold, setPenaltyGold] = useState(initialData?.penalty?.gold || 0);
  const [penaltyXP, setPenaltyXP] = useState(initialData?.penalty?.xp || 0);

  const [subtasks, setSubtasks] = useState<{ id: string, text: string, completed: boolean }[]>(initialData?.subtasks || []);
  const [newSubtask, setNewSubtask] = useState('');

  // Reset internal state if initialData changes (e.g. switching edit target)
  useEffect(() => {
    if (initialData) {
      setIsExpanded(true);
      setName(initialData.name);
      setDescription(initialData.description || '');
      setDifficulty(initialData.difficulty);
      setCategory(initialData.projectId as any);
      setFrequency(initialData.frequency || 'once');
      setDeadline(formatDeadline(initialData.deadline));
      setHasPenalty(!!initialData.penalty);
      setPenaltyGold(initialData.penalty?.gold || 0);
      setPenaltyXP(initialData.penalty?.xp || 0);
      setSubtasks(initialData.subtasks || []);
    }
  }, [initialData]);

  const categories = [
    { id: 'col-todo', label: 'To-Do', icon: CheckCircle2, color: 'text-emerald-500' },
    { id: 'col-habit', label: 'Habit', icon: Repeat, color: 'text-amber-500' },
    { id: 'col-guild', label: 'Guild', icon: Users, color: 'text-purple-500' }
  ];

  const frequencies = ['once', 'daily', 'weekly', 'monthly'];

  // Default rewards based on difficulty
  const getRewards = (diff: QuestDifficulty) => {
    switch (diff) {
      case 'TRIVIAL': return { xp: 50, gold: 10 };
      case 'EASY': return { xp: 100, gold: 25 };
      case 'MEDIUM': return { xp: 200, gold: 50 };
      case 'HARD': return { xp: 350, gold: 100 };
      case 'EPIC': return { xp: 500, gold: 250 };
      default: return { xp: 100, gold: 25 };
    }
  };



  const addSubtask = () => {
    if (!newSubtask.trim()) return;
    setSubtasks([...subtasks, { id: crypto.randomUUID(), text: newSubtask, completed: false }]);
    setNewSubtask('');
  };

  const removeSubtask = (id: string) => {
    setSubtasks(subtasks.filter(s => s.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isSubmitting) return;

    setIsSubmitting(true);

    const rewards = getRewards(difficulty);

    // Add subtasks bonus? Optional: increase reward based on subtasks count

    const taskData: any = {
      ...initialData, // Preserve ID if editing
      projectId: category,
      name,
      description,
      type: frequency !== 'once' ? 'daily' : (category === 'col-guild' ? 'guild' : 'main'),
      difficulty,
      xpReward: rewards.xp,
      goldReward: rewards.gold,
      energyCost: initialData?.energyCost || 0,
      completed: initialData?.completed || false,
      frequency: frequency !== 'once' ? frequency : undefined,
      deadline: deadline ? new Date(deadline).toISOString() : undefined,
      penalty: hasPenalty ? { gold: penaltyGold, xp: penaltyXP } : undefined,
      subtasks: subtasks.length > 0 ? subtasks : undefined
    };

    onCreate(taskData);

    if (onCancel) {
      onCancel(); // Close edit mode
      setIsSubmitting(false); // Reset just in case, though component likely unmounts
    } else {
      // Reset form for create mode
      setName('');
      setDescription('');
      setIsExpanded(false);
      setFrequency('once');
      setDeadline('');
      setHasPenalty(false);
      setPenaltyGold(0);
      setPenaltyXP(0);
      setSubtasks([]);
      setNewSubtask('');

      // Delay releasing the lock to prevent accidental double-clicks from creating duplicates
      setTimeout(() => setIsSubmitting(false), 500);
    }
  };

  if (!isExpanded) {
    return (
      <div
        onClick={() => setIsExpanded(true)}
        className="p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 hover:bg-slate-100 dark:hover:bg-slate-900/50 transition-colors cursor-pointer group"
      >
        <div className="flex items-center gap-3 text-slate-400 dark:text-slate-500">
          <PlusCircle size={20} className="group-hover:text-indigo-500 transition-colors" />
          <span className="text-sm font-medium">Create a Bounty...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl relative animate-in fade-in zoom-in-95 duration-200">
      <button
        onClick={() => onCancel ? onCancel() : setIsExpanded(false)}
        className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
      >
        <X size={16} />
      </button>

      <form onSubmit={handleSubmit} className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-2">{initialData ? 'Edit Bounty' : 'New Bounty'}</h3>

        {/* Name Input */}
        <div>
          <input
            type="text"
            placeholder="Bounty Title"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-transparent text-lg font-bold text-slate-800 dark:text-slate-100 placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:outline-none"
            autoFocus
          />
        </div>

        {/* Category Selection */}
        <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-950/50 rounded-lg">
          {categories.map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategory(cat.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 py-1.5 px-3 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap
                ${category === cat.id
                  ? 'bg-white dark:bg-slate-800 shadow-sm text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              <cat.icon size={12} />
              {cat.label}
            </button>
          ))}
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Difficulty */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-slate-400">Difficulty</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as QuestDifficulty)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg py-1.5 px-2 text-xs font-medium focus:border-indigo-500 outline-none"
            >
              {['TRIVIAL', 'EASY', 'MEDIUM', 'HARD', 'EPIC'].map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Recurrence */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-slate-400">Recurrence</label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as any)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg py-1.5 px-2 text-xs font-medium focus:border-indigo-500 outline-none"
            >
              {frequencies.map(f => (
                <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Deadline */}
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold text-slate-400">Deadline (Optional)</label>
          <input
            type="datetime-local"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg py-1.5 px-2 text-xs font-medium focus:border-indigo-500 outline-none block"
            style={{ colorScheme: 'dark' }}
          />
        </div>

        {/* Subtasks */}
        <div className="space-y-2">
          <label className="text-[10px] uppercase font-bold text-slate-400">Subtasks</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newSubtask}
              onChange={(e) => setNewSubtask(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSubtask())}
              placeholder="Add step..."
              className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg py-1.5 px-2 text-xs focus:border-indigo-500 outline-none"
            />
            <button
              type="button"
              onClick={addSubtask}
              className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-indigo-600 transition-colors"
            >
              <Plus size={14} />
            </button>
          </div>
          {subtasks.length > 0 && (
            <div className="space-y-1 pl-1">
              {subtasks.map(st => (
                <div key={st.id} className="flex items-center justify-between group/st text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                    <span className="text-slate-600 dark:text-slate-300">{st.text}</span>
                  </div>
                  <button type="button" onClick={() => removeSubtask(st.id)} className="opacity-0 group-hover/st:opacity-100 text-slate-400 hover:text-red-500">
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Penalty Toggle */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/50">
          <div className="flex items-center gap-2 mb-2">
            <input
              type="checkbox"
              id="penaltyCheck"
              checked={hasPenalty}
              onChange={(e) => setHasPenalty(e.target.checked)}
              className="rounded border-slate-300 dark:border-slate-700 text-red-500 focus:ring-red-500"
            />
            <label htmlFor="penaltyCheck" className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1 cursor-pointer select-none">
              <Flame size={12} className={hasPenalty ? "text-red-500" : "text-slate-400"} />
              Enable Failure Penalty
            </label>
          </div>

          {hasPenalty && (
            <div className="grid grid-cols-2 gap-3 pl-6 animate-in slide-in-from-top-2 duration-200">
              <div>
                <label className="text-[9px] uppercase font-bold text-slate-400">Gold Loss</label>
                <div className="relative">
                  <input
                    type="number"
                    value={penaltyGold}
                    onChange={(e) => setPenaltyGold(Number(e.target.value))}
                    className="w-full pl-6 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-lg py-1 text-xs text-red-600 dark:text-red-400 focus:border-red-500 outline-none"
                  />
                  <Coins size={10} className="absolute left-2 top-1.5 text-red-400" />
                </div>
              </div>
              <div>
                <label className="text-[9px] uppercase font-bold text-slate-400">XP Loss</label>
                <div className="relative">
                  <input
                    type="number"
                    value={penaltyXP}
                    onChange={(e) => setPenaltyXP(Number(e.target.value))}
                    className="w-full pl-6 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-lg py-1 text-xs text-red-600 dark:text-red-400 focus:border-red-500 outline-none"
                  />
                  <Brain size={10} className="absolute left-2 top-1.5 text-red-400" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={!name.trim()}
          className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-bold shadow-md shadow-indigo-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {initialData ? <PenSquare size={16} /> : <Plus size={16} />}
          {initialData ? 'Save Changes' : 'Create Bounty'}
        </button>

      </form>
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
  onCreate: (task: any) => void
}> = ({
  pid,
  title,
  bounties,
  completeTask,
  deleteTask,
  updateTask,
  onEdit,
  onCreate
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
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{title}</span>
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
  const { projects, tasks, completeTask, completeProject, stats, addTasks, addProjects, vitality, createTask, moveTask, reorderTasks, addToCart, updateTask } = useGameStore();

  // Robust wrapper to ensure delete functionality
  const handleDeleteTask = (taskId: string) => {
    useGameStore.getState().deleteTask(taskId);
  };

  // Guild Contribution Hook
  const contributeToProject = useMutation(api.guilds.contributeToProject);

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

    const activeContainer = activeTask.projectId;
    // If over a container directly (e.g. empty column)
    const overContainer = ['col-todo', 'col-habit', 'col-guild'].includes(overId)
      ? overId
      : overTask?.projectId;

    if (!overContainer || activeContainer === overContainer) {
      return;
    }

    // Move task to new container optimistically
    // To support precise placement, we need to find the index of the overTask and insert activeTask there?
    // But dragOver is firing continuously. Changing array order here might be expensive but dnd-kit recommends it for sortable across containers.

    // 1. Update Project ID
    // 2. Move in Array

    const activeIndex = tasks.findIndex(t => t.id === activeId);
    const overIndex = tasks.findIndex(t => t.id === overId);

    let newTasks = [...tasks];

    // Update project ID first
    newTasks[activeIndex] = { ...newTasks[activeIndex], projectId: overContainer };

    // If we are over a specific task, move to that index (relative) via arrayMove logic? 
    // Actually, simply updating the project ID puts it in the list.
    // To enable "insert between", we should also verify visual order.
    // For now, let's just update the container (Project ID). 
    // real reordering happens locally or via arrayMove if we want to simulate the sort.

    const isOverContainerDirectly = ['col-todo', 'col-habit', 'col-guild'].includes(overId);

    if (isOverContainerDirectly) {
      // Just move to container, append effectively (or keep existing relative order)
      moveTask(activeId, overContainer);
    } else {
      // We are over another task in a different container.
      // We want to move 'active' to 'overContainer' AND position it relative to 'over'.
      // dnd-kit's official example does this by updating the list.

      // Let's rely on moveTask for the container switch, separate reorder?
      // No, moveTask updates state.

      // Let's do a manual splice.
      const reordered = arrayMove(newTasks, activeIndex, overIndex);
      reorderTasks(reordered);
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

  const handleBuyQuest = () => {
    // TODO: Implement buy quest logic
    console.log('Buy quest clicked');
    setIsQuestModalOpen(false);
  };

  const handleCreateQuest = () => {
    // TODO: Implement create quest logic
    console.log('Create quest clicked');
    setIsQuestModalOpen(false);
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

  const realWorldItems = SHOP_ITEMS.filter(i => i.type === 'REAL_LIFE');
  const systemItems = SHOP_ITEMS.filter(i => i.type === 'SYSTEM');

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

  const handleGenerateDaily = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const newQuests = generateDailyQuests(3);
      addTasks(newQuests);
      setIsGenerating(false);
    }, 1500); // Fake delay for "AI processing" effect
  };

  // Helper to get bounties for a specific foundation
  const getBountiesForFoundation = (projectId: string) => {
    // Unified Logic: Always return ALL tasks for the project first, then append defaults if needed/empty?
    // Actually, distinct behaviors:
    // 1. Titan: has complex sub-logic.
    // 2. Others: simple list.

    // Fix: We must ensure that ANY task that has projectId === currently-viewed-project IS returned.
    // The previous logic for Titan was filtering narrowly.

    // NEW LOGIC:
    let tasksForProject = tasks.filter(t => t.projectId === projectId);

    // If this is the "Guild" column (col-guild), also include Guild Project tasks
    if (projectId === 'col-guild') {
      const guildTasks = tasks.filter(t => t.type === 'guild' && t.projectId !== projectId);
      tasksForProject = [...tasksForProject, ...guildTasks];
    }

    // If we have tasks, return them (plus any forced defaults for Titan/Physical if missing?)
    // User wants "Bounty Columns". If I move a task to Titan, it should show up.

    if (projectId === 'col-todo') {
      const physicalDefaults = tasksForProject.filter(t => t.id === 'b-steps' || t.id === 'b-stretch');
      // If we have "real" tasks (moved here) or specific defaults, show them.
      // We also need to handle the "Mocks" for other pillars if the user hasn't created tasks yet?
      // Actually, if I drag a task here, it's a real task.

      // Let's just return all tasks for this project.
      // And if it's 'physical' and empty/only-defaults, maybe map them?
      // But simply:
      return tasksForProject.map(t => {
        if (t.id === 'b-steps') return { ...t, name: `Daily Steps: ${vitality.stepGoal || '10,000'}` };
        return t;
      });
    }

    // For others, just return what is there.
    return tasksForProject;
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

  const visibleBountiesMap = getVisibleBountiesMap();


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
        onBuyQuest={handleBuyQuest}
        onCreateQuest={handleCreateQuest}
        realWorldItems={realWorldItems}
        systemItems={systemItems}
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

        {/* LEFT PROFILE CARD (New Feature) */}
        <div className="w-full lg:w-48 flex-shrink-0 animate-in slide-in-from-left-4 duration-500">
          <MiniCharacterCard
            avatarId={stats.activeAvatarId || 'starter_villager_male'}
            backdropId={stats.activeBackdropId}
            companionId={stats.activeCompanionId || stats.activeAccessoryId}
            weaponId={stats.activeMainHandId}
            armorId={stats.activeArmorId}
            className="w-full shadow-2xl border border-slate-700/50 sticky top-4"
          />
        </div>

        {/* RIGHT CONTENT (Main Column) */}
        <div className="flex-1 space-y-8">

          {/* New Header for Bounties? Or just let Bounties speak for themselves */}
          <div className="flex items-center gap-3 mb-[-10px]">
            {/* <h2 className="text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 to-indigo-500 uppercase tracking-widest drop-shadow-sm">Active Bounties</h2> */}
            {/* <div className="h-[1px] flex-1 bg-gradient-to-r from-indigo-500/50 to-transparent" /> */}
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
                  const title = {
                    'col-todo': 'To-Do',
                    'col-habit': 'Habits',
                    'col-guild': 'Guild'
                  }[pid] || 'Tasks';

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
        <div className="w-full lg:w-80 flex-shrink-0 space-y-6 lg:sticky lg:top-4 lg:self-start">

          {/* Tools Panel */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-lg">
            <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Sword size={12} />
              <span>Tools</span>
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {/* Tool 1: Grindstone */}
              <button
                className="group relative flex flex-col items-center justify-center gap-2 p-3 rounded-xl bg-slate-50 hover:bg-amber-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 hover:border-amber-500/50 dark:hover:bg-amber-950/10 transition-all duration-300"
                onClick={() => navigate('/app/tools/grindstone')}
              >
                <div className="absolute inset-0 bg-amber-500/5 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity" />
                <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-amber-500 group-hover:scale-110 transition-transform">
                  <Hammer size={18} />
                </div>
                <div className="text-center">
                  <span className="block text-[10px] font-bold text-slate-600 dark:text-slate-300 group-hover:text-amber-600 dark:group-hover:text-amber-200 uppercase tracking-wider">Grindstone</span>
                  <span className="block text-[9px] text-slate-500 dark:text-slate-600 scale-90">Focus Mode</span>
                </div>
              </button>

              {/* Tool 2: Journal */}
              <button
                className="group relative flex flex-col items-center justify-center gap-2 p-3 rounded-xl bg-slate-50 hover:bg-purple-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 hover:border-purple-500/50 dark:hover:bg-purple-950/10 transition-all duration-300"
                onClick={() => navigate('/app/journal')}
              >
                <div className="absolute inset-0 bg-purple-500/5 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity" />
                <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                  <Book size={18} />
                </div>
                <div className="text-center">
                  <span className="block text-[10px] font-bold text-slate-600 dark:text-slate-300 group-hover:text-purple-600 dark:group-hover:text-purple-200 uppercase tracking-wider">Journal</span>
                  <span className="block text-[9px] text-slate-500 dark:text-slate-600 scale-90">Daily Log</span>
                </div>
              </button>

              {/* Tool 3: New Bounty */}
              <div className="col-span-2">
                <CreateBountyCard projectId="col-todo" onCreate={handleCreateBounty} />
              </div>
            </div>
          </div>

          {/* <FoundationsCarousel projects={projects} activeProjectId={activeProjectId} onProjectClick={toggleProject} /> */}



          <MerchantCard
            description="The stars have shifted. I have opportunities for one with your talents."
            onNewQuestClick={() => setIsQuestModalOpen(true)}
            isModalOpen={isQuestModalOpen}
          />
        </div >

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
