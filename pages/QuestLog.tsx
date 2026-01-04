import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore, INITIAL_PROJECTS, INITIAL_TASKS } from '../store/useGameStore';
import { generateDailyQuests } from '../src/utils/aiQuestGenerator';
import { ChevronDown, CheckCircle2, Circle, Trophy, PlusCircle, AlertCircle, Sword, Sparkles, Zap, Scroll, Map, Calendar, Coins, Gift, Activity, Brain, Utensils, Users, Moon, Hammer, Eraser, Plus, Book, Trash2 } from 'lucide-react';
import { QuestDifficulty, Task } from '../types';
import { DndContext, DragEndEvent, DragOverlay, useSensor, useSensors, PointerSensor, closestCorners, useDroppable, pointerWithin, rectIntersection, CollisionDetection, getFirstCollision } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MerchantCard, QuestModal } from '../components/MerchantCard';
import { ProjectDetailView } from '../components/ProjectDetailView';
import { motion, AnimatePresence } from 'framer-motion';

const DifficultyBadge: React.FC<{ difficulty: QuestDifficulty }> = ({ difficulty }) => {
  const colors = {
    TRIVIAL: 'bg-slate-800 text-slate-400 border-slate-700',
    EASY: 'bg-green-900/30 text-green-400 border-green-800/50',
    MEDIUM: 'bg-blue-900/30 text-blue-400 border-blue-800/50',
    HARD: 'bg-amber-900/30 text-amber-400 border-amber-800/50',
    EPIC: 'bg-purple-900/30 text-purple-400 border-purple-800/50'
  };

  return (
    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border ${colors[difficulty]}`}>
      {difficulty}
    </span>
  );
};

const QuestCard: React.FC<{ task: Task; completeTask: (id: string) => void; deleteTask: (id: string) => void }> = ({ task, completeTask, deleteTask }) => {
  if (!task) return null;

  return (
    <div className={`
      relative p-4 rounded-xl border transition-all duration-300 group
      ${task.completed ? 'bg-slate-900/30 border-slate-800 opacity-50' : 'bg-slate-900 border-slate-800 hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/10'}
    `}>
      <div className="flex items-start justify-between mt-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {task.type === 'daily' && <span className="text-[9px] font-bold text-sky-400 flex items-center gap-1"><Sparkles size={10} /> DAILY</span>}
          </div>
          <h4 className={`font-bold ${task.completed ? 'text-slate-500 line-through' : 'text-slate-200 group-hover:text-white'}`}>
            {task.name}
          </h4>
          {task.description && <p className="text-xs text-slate-500 mt-1 leading-relaxed">{task.description}</p>}

          <div className="flex items-center gap-3 mt-3">
            <div className="flex items-center gap-1 text-[10px] font-bold text-indigo-400 bg-indigo-950/30 px-1.5 py-0.5 rounded border border-indigo-900/50">
              <span>+{task.xpReward} XP</span>
            </div>
            {task.goldReward > 0 && (
              <div className="flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-950/30 px-1.5 py-0.5 rounded border border-amber-900/50">
                <Coins size={10} />
                <span>+{task.goldReward}</span>
              </div>
            )}
          </div>
        </div>

        <div className="ml-4 flex flex-col items-center gap-2">
          <button
            onClick={() => !task.completed && completeTask(task.id)}
            disabled={task.completed}
            className={`
              h-10 w-10 flex items-center justify-center rounded-xl border-2 transition-all duration-300
              ${task.completed
                ? 'bg-green-500/10 border-green-500/30 text-green-500'
                : 'border-slate-700 text-slate-600 hover:border-indigo-500 hover:text-indigo-400 hover:bg-slate-800'}
            `}
          >
            {task.completed ? <CheckCircle2 size={20} /> : <Circle size={20} />}
          </button>

          {/* Delete Button - Moved Here */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteTask(task.id);
            }}
            className="text-slate-700 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-2"
            title="Delete Task"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

const SortableQuestCard: React.FC<{ task: Task; completeTask: (id: string) => void; deleteTask: (id: string) => void }> = ({ task, completeTask, deleteTask }) => {
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
      <QuestCard task={task} completeTask={completeTask} deleteTask={deleteTask} />
    </div>
  );
};

const CreateBountyCard = ({ projectId, onCreate }: { projectId: string; onCreate: (task: any) => void }) => {
  const [name, setName] = useState('');
  const [difficulty, setDifficulty] = useState<QuestDifficulty>('EASY');

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const rewards = getRewards(difficulty);

    onCreate({
      projectId,
      name,
      description: '',
      type: 'main',
      difficulty,
      xpReward: rewards.xp,
      goldReward: rewards.gold,
      energyCost: 0,
      completed: false
    });
    setName('');
  };

  return (

    <div className="p-4 rounded-xl border border-dashed border-slate-700 bg-slate-900/30 hover:bg-slate-900/50 transition-colors">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <input
            type="text"
            placeholder="Create new bounty..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:border-indigo-500 outline-none placeholder:text-slate-600 pr-10"
          />
          <button
            type="submit"
            disabled={!name.trim()}
            className="absolute right-1 top-1 bottom-1 px-3 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-0 disabled:pointer-events-none transition-all duration-200 flex items-center justify-center"
          >
            <Plus size={16} />
          </button>
        </div>


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
  onCreate: (task: any) => void
}> = ({
  pid,
  title,
  bounties,
  completeTask,
  deleteTask,
  onCreate
}) => {
    const { setNodeRef } = useDroppable({ id: pid });

    return (
      <div ref={setNodeRef} className="h-full flex flex-col">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{title}</span>
          <div className="h-[1px] flex-1 bg-slate-800" />
          <button className="text-slate-500 hover:text-indigo-400">
            <Plus size={14} />
          </button>
        </div>

        {pid === 'p-tycoon-2' && (
          <div className="mb-4">
            <CreateBountyCard projectId={pid} onCreate={onCreate} />
          </div>
        )}

        <SortableContext id={pid} items={bounties.map(t => t.id)} strategy={verticalListSortingStrategy}>
          <div className="flex-1 min-h-[100px] space-y-3">
            <AnimatePresence mode="popLayout">
              {bounties.map((quest) => (
                <SortableQuestCard
                  key={quest.id}
                  task={quest}
                  completeTask={completeTask}
                  deleteTask={deleteTask}
                />
              ))}
            </AnimatePresence>
            {bounties.length === 0 && (
              <div className="py-8 text-center border-2 border-dashed border-slate-800 rounded-xl bg-slate-900/10">
                <p className="text-[10px] text-slate-600">Drag items here</p>
              </div>
            )}
          </div>
        </SortableContext>
      </div>
    );
  };

export const QuestLog: React.FC = () => {
  const navigate = useNavigate();
  const { projects, tasks, completeTask, completeProject, stats, addTasks, addProjects, vitality, createTask, moveTask, reorderTasks } = useGameStore();

  // Robust wrapper to ensure delete functionality
  const handleDeleteTask = (taskId: string) => {
    const store = useGameStore.getState();
    if (store.deleteTask) {
      store.deleteTask(taskId);
    } else {
      console.error("deleteTask is missing from store state!", store);
    }
  };

  console.log('QuestLog Render:', { hasDeleteTask: !!useGameStore.getState().deleteTask });

  const [isGenerating, setIsGenerating] = useState(false);
  const [isQuestModalOpen, setIsQuestModalOpen] = useState(false);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [expandedQuestId, setExpandedQuestId] = useState<string | null>(null);
  const [activeProtocolPillar, setActiveProtocolPillar] = useState<'physical' | 'mental' | 'nutrition' | 'social' | 'sleep'>('physical');

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const customCollisionDetection: CollisionDetection = (args) => {
    // 1. First, let's see if we are directly over a droppable using pointerWithin (precise)
    const pointerCollisions = pointerWithin(args);

    // If we have collisions, we need to decide if we want to return them or use closestCorners.
    // Generally, if we are over a container (project column) that is empty or we are in the empty space of it,
    // pointerWithin will return the container.
    // closestCorners might return a neighbor if the container is large and empty (corners far away).

    if (pointerCollisions.length > 0) {
      // If we are over something physically, that's usually the best match.
      // However, closestCorners is nice for smooth sorting between items.
      // Strategy:
      // If pointerWithin hits a container (and no tasks inside it, or we want container to win if in empty space), return it.

      return pointerCollisions;
    }

    // 2. Fallback to closestCorners for "magnetic" feel when near but not over?
    // Actually, pointerWithin handles "over". closestCorners handles "near".
    // Using closestCorners as fallback is good.
    return closestCorners(args);
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
    const overContainer = ['p-titan-1', 'p-tycoon-1', 'p-tech-1', 'p-tycoon-2'].includes(overId)
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

    const isOverContainerDirectly = ['p-titan-1', 'p-tycoon-1', 'p-tech-1', 'p-tycoon-2'].includes(overId);

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

  useEffect(() => {
    // Migration: Check for Tycoon Update
    const hasTycoonUpdate = useGameStore.getState().projects.some(p => p.id === 'p-tycoon-2');
    if (!hasTycoonUpdate) {
      console.log('Migrating Tycoon Quests...');
      useGameStore.getState().addProjects(INITIAL_PROJECTS);
      useGameStore.getState().addTasks(INITIAL_TASKS);
    }

    // Migration: Check for Physical Protocol Tasks
    const hasSteps = useGameStore.getState().tasks.some(t => t.id === 'b-steps');
    if (!hasSteps) {
      console.log('Migrating Physical Protocol Tasks...');
      useGameStore.getState().addTasks(INITIAL_TASKS.filter(t => t.id === 'b-steps' || t.id === 'b-stretch'));
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
    const tasksForProject = tasks.filter(t => t.projectId === projectId);

    // If we have tasks, return them (plus any forced defaults for Titan/Physical if missing?)
    // User wants "Bounty Columns". If I move a task to Titan, it should show up.

    if (projectId === 'p-titan-1') {
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
      'p-titan-1': getBountiesForFoundation('p-titan-1'),
      'p-tycoon-1': getBountiesForFoundation('p-tycoon-1'),
      'p-tech-1': getBountiesForFoundation('p-tech-1'),
      'p-tycoon-2': getBountiesForFoundation('p-tycoon-2')
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
      <div
        className="fixed inset-0 z-[-1] bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/assets/quests%20page%20background.png')" }}
      />
      {/* Overlay to ensure text readability if needed, or rely on existing component backgrounds */}
      <div className="fixed inset-0 z-[-1] bg-slate-950/70 pointer-events-none" />

      {/* Quest Modal */}
      <QuestModal
        isOpen={isQuestModalOpen}
        onClose={() => setIsQuestModalOpen(false)}
        onBuyQuest={handleBuyQuest}
        onCreateQuest={handleCreateQuest}
      />

      <div className={`flex flex-col lg:flex-row gap-8 mt-8 transition-opacity duration-300 ${isQuestModalOpen ? 'opacity-20 pointer-events-none' : ''}`}>



        {/* RIGHT CONTENT */}
        <div className="flex-1 space-y-8">



          {/* MAIN QUESTS - Top 4 Projects (2 Column Layout) */}
          <div className="flex items-center gap-3 mb-[-10px]">
            <img src="/assets/items/fantasy-divider.png" className="h-1 w-12 opacity-0" alt="" /> {/* Spacer/Placeholder if needed, or just text */}
            <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500 uppercase tracking-widest drop-shadow-sm">Foundations</h2>
            <div className="h-[1px] flex-1 bg-gradient-to-r from-amber-500/50 to-transparent" />
          </div>
          <div className="flex flex-col gap-4">
            <AnimatePresence mode="wait">
              {expandedQuestId ? (
                (() => {
                  const project = projects.find(p => p.id === expandedQuestId);
                  if (!project) return null;

                  const activeTasks = tasks.filter(t => t.projectId === project.id);
                  const originalIndex = projects.findIndex(p => p.id === project.id);
                  const questBackgrounds = [
                    '/assets/vitality_peak_quest_card.jpg',
                    '/assets/dwarvern_vault_quest_card.jpg',
                    '/assets/scholars_mine_quest_card.jpg',
                    '/assets/stewards_castle_quest_card.jpg'
                  ];
                  const hasBackground = originalIndex < questBackgrounds.length;
                  const backgroundImage = hasBackground ? questBackgrounds[originalIndex] : null;

                  return (
                    <motion.div
                      key="expanded-foundation"
                      initial={{ opacity: 0, height: 200 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 200 }}
                      className="w-full relative rounded-3xl overflow-hidden border border-slate-700 shadow-2xl bg-slate-900"
                    >
                      {/* Background Image Layer */}
                      <div
                        className="absolute inset-0 z-0 opacity-40"
                        style={{
                          backgroundImage: backgroundImage ? `url('${backgroundImage}')` : undefined,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }}
                      />
                      <div className="absolute inset-0 z-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-900/80" />


                      <div className="relative z-10 p-8 flex flex-col gap-8">
                        {/* Header Section */}
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-slate-800/80 backdrop-blur border border-slate-700 shadow-lg">
                              {project.icon ? <img src={project.icon} className="w-10 h-10 object-contain" /> : <Map size={32} className="text-indigo-400" />}
                            </div>
                            <div>
                              <h2 className="text-3xl font-black text-white uppercase tracking-wider">{project.name}</h2>
                              <p className="text-slate-400">{project.description}</p>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedQuestId(null);
                            }}
                            className="p-2 rounded-full bg-slate-800/50 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                          >
                            <ChevronDown className="rotate-180" size={24} />
                          </button>
                        </div>


                        {/* Content Row: Protocol | Empty | Action */}
                        {/* Content Row: Description | Action */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full items-center">

                          {/* Description / Flavor Text Area */}
                          <div className="bg-slate-900/40 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 flex flex-col justify-center h-full">

                            <div className="mt-4 flex items-center gap-4 text-sm text-slate-500">
                              <span className="flex items-center gap-2"><Map size={16} /> {activeTasks.length} Milestones</span>
                              <span className="flex items-center gap-2"><Zap size={16} /> {project.difficulty} Challenge</span>
                            </div>
                          </div>


                          {/* Action Button & Rewards */}
                          <div className="flex flex-col justify-center gap-6">

                            {/* Rewards Summary */}


                            <button
                              onClick={() => toggleProject(project.id)}
                              className="w-full py-5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98]"
                            >
                              <span>Enter Quest Log</span>
                              <Scroll size={18} />
                            </button>
                          </div>

                        </div>
                      </div>
                    </motion.div>
                  );
                })()
              ) : (
                <div className="flex flex-col lg:flex-row gap-4 items-start w-full">
                  {/* 2 Column Layout for Grid */}
                  {[0, 1].map(columnIndex => (
                    <div key={columnIndex} className="flex-1 flex flex-col gap-4 w-full">
                      {projects.slice(0, 4).filter((_, i) => i % 2 === columnIndex).map((project) => {
                        const projectTasks = tasks.filter(t => t.projectId === project.id);
                        const completedCount = projectTasks.filter(t => t.completed).length;
                        const progress = projectTasks.length > 0 ? (completedCount / projectTasks.length) * 100 : 0;
                        // Calculate Total Rewards
                        const totalXp = projectTasks.reduce((acc, t) => acc + t.xpReward, 0);
                        const totalGold = projectTasks.reduce((acc, t) => acc + t.goldReward, 0);

                        // Calculate original index to get correct background
                        const originalIndex = projects.findIndex(p => p.id === project.id);
                        const questBackgrounds = [
                          '/assets/vitality_peak_quest_card.jpg', // Vitality Peak (Was _3)
                          '/assets/dwarvern_vault_quest_card.jpg', // Dwarvern Vault
                          '/assets/scholars_mine_quest_card.jpg', // Scholar's Mine
                          '/assets/stewards_castle_quest_card.jpg' // Steward's Castle
                        ];
                        const hasBackground = originalIndex < questBackgrounds.length;
                        const backgroundImage = hasBackground ? questBackgrounds[originalIndex] : null;

                        // Lock logic: Only Vitality Peak (p-titan-1) is unlocked
                        const isLocked = project.id !== 'p-titan-1';

                        return (
                          <div
                            key={project.id}
                            className={`relative group rounded-2xl transition-all duration-300 ${isLocked ? 'cursor-not-allowed opacity-80 hover:opacity-100' : 'cursor-pointer'}`}
                            onClick={() => !isLocked && setExpandedQuestId(project.id)}
                          >
                            {/* 1. Logic Gate Aura (Blurry glow behind) - Only if unlocked */}
                            {!isLocked && (
                              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 rounded-2xl blur opacity-0 group-hover:opacity-75 transition duration-500 group-hover:duration-200" />
                            )}

                            {/* 3. Main Card Content (Inner) */}
                            <div className={`relative flex flex-col h-full rounded-2xl overflow-hidden bg-slate-900 border ${project.completed ? 'border-green-900/50' : isLocked ? 'border-slate-800' : 'border-slate-800'} transition-colors duration-300`}>

                              {/* Locked Overlay */}
                              {isLocked && (
                                <div className="absolute inset-0 z-50 bg-slate-950/80 backdrop-blur-[2px] flex flex-col items-center justify-center">
                                  {/* Under Construction Art - scaled to fit nicely */}
                                  <img
                                    src="/assets/under construction pixel art.png"
                                    alt="Under Construction"
                                    className="absolute -bottom-14 left-0 w-full object-cover object-bottom opacity-50 mix-blend-luminosity"
                                  />

                                  <div className="relative z-10 flex flex-col items-center gap-3">
                                    <div className="relative group/lock -translate-x-[22px] translate-y-[9px]">
                                      <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-full opacity-0 group-hover/lock:opacity-50 transition-opacity duration-500" />
                                      <img
                                        src="/assets/padlock pixel art.png"
                                        alt="Locked"
                                        className="w-24 h-24 object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] relative z-10 opacity-90 hover:scale-105 transition-transform duration-300"
                                      />
                                    </div>

                                    <div className="text-center px-6 max-w-sm">
                                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 border border-slate-700/80 px-3 py-1 bg-slate-950/90 shadow-xl backdrop-blur-sm inline-block rounded-full">Coming Soon</p>
                                      <p className="text-[10px] text-slate-300 font-medium leading-relaxed drop-shadow-md bg-slate-900/50 p-2 rounded-lg border border-slate-800/50 backdrop-blur-sm">
                                        {project.id === 'p-tech-1' && "The Scholar's Library is being excavated. Current Status: Writing ancient texts... Expected Unlock: Late Jan."}
                                        {project.id === 'p-tycoon-1' && "The Financial Vault is being forged. Current Status: Smelting gold bars... Expected Unlock: Late Jan."}
                                        {project.id === 'p-tycoon-2' && "The Steward's Castle is being fortified. Current Status: Drafting battle plans... Expected Unlock: Late Jan."}
                                        <span className="block mt-1 text-slate-400 font-bold">Create your own quest or start the Vitality Peak quest today.</span>
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* HEADER with FIXED Background */}
                              <div
                                className={`relative w-full overflow-hidden flex-shrink-0 ${isLocked ? 'grayscale-[0.8]' : ''}`}
                                style={{
                                  backgroundImage: backgroundImage ? `url('${backgroundImage}')` : undefined,
                                  backgroundSize: 'cover',
                                  backgroundPosition: 'center',
                                  minHeight: '200px'
                                }}
                              >
                                {/* Overlay for quests with backgrounds to ensure text readability */}
                                {hasBackground && <div className="absolute inset-0 bg-slate-950/70 pointer-events-none" />}

                                <div className="p-5 relative z-10 h-full flex flex-col justify-between">
                                  <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-3">
                                      {project.icon ? (
                                        <img
                                          src={project.icon}
                                          alt=""
                                          className="w-[58px] h-[58px] object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
                                        />
                                      ) : (
                                        <div className={`p-2 rounded-lg ${project.completed ? 'bg-green-900/20 text-green-500' : 'bg-slate-800 text-indigo-400'}`}>
                                          <Map size={20} />
                                        </div>
                                      )}
                                      <div>
                                        <h3 className="font-bold text-lg text-slate-100">{project.name}</h3>
                                        <p className="text-xs text-slate-500">{project.description}</p>
                                      </div>
                                    </div>
                                    <DifficultyBadge difficulty={project.difficulty} />
                                  </div>

                                  {/* Progress Bar */}
                                  <div className="mt-4 flex items-center gap-4">
                                    <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                                      <div
                                        className={`h-full transition-all duration-500 ${project.completed ? 'bg-green-500' : 'bg-indigo-500'}`}
                                        style={{ width: `${progress}%` }}
                                      />
                                    </div>
                                    <span className="text-[10px] font-mono font-bold text-slate-500">
                                      {completedCount}/{projectTasks.length}
                                    </span>
                                  </div>

                                  {/* REWARDS (Bottom Right) */}
                                  <div className="flex justify-end items-center gap-2 mt-3">
                                    <span className="text-[10px] font-bold text-slate-600 tracking-wider mr-1">REWARDS</span>
                                    {/* Mystery Chest */}
                                    <div className="flex items-center gap-1 bg-purple-950/40 border border-purple-500/30 px-1.5 py-0.5 rounded text-[10px] text-purple-300 font-bold shadow-sm" title="Mastery Achievement">
                                      <Sparkles size={12} className="text-purple-400" />
                                      <span>Mastery</span>
                                    </div>
                                    {/* Mystery Chest */}
                                    <div className="group/loot flex items-center gap-1.5 bg-gradient-to-r from-indigo-900/80 to-purple-900/80 border border-indigo-500/50 px-2 py-1 rounded-lg text-[10px] text-indigo-100 font-bold shadow-[0_0_10px_rgba(99,102,241,0.3)] animate-pulse hover:animate-none cursor-help relative overflow-hidden" title="A sealed cache from the void...">
                                      <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover/loot:translate-x-[100%] transition-transform duration-700" />
                                      <Gift size={12} className="text-purple-300" />
                                      <span className="tracking-wide">Mystery Loot</span>
                                    </div>
                                    {/* SP */}
                                    <div className="flex items-center gap-1 bg-cyan-950/40 border border-cyan-500/30 px-1.5 py-0.5 rounded text-[10px] text-cyan-300 font-bold shadow-sm" title="Skill Point">
                                      <Zap size={12} className="text-cyan-400" fill="currentColor" />
                                      <span>+1 SP</span>
                                    </div>
                                    {/* XP */}
                                    <div className="flex items-center gap-1 bg-slate-800/60 border border-slate-600/30 px-1.5 py-0.5 rounded text-[10px] text-slate-300 font-bold shadow-sm">
                                      <span>+{totalXp} XP</span>
                                    </div>
                                    {/* Gold */}
                                    <div className="flex items-center gap-1 bg-amber-950/40 border border-amber-500/30 px-1.5 py-0.5 rounded text-[10px] text-amber-300 font-bold shadow-sm">
                                      <Coins size={12} className="text-amber-400" />
                                      <span>{totalGold}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </div>


          {/* SIDE QUESTS - Remaining Projects (3 Column Layout) */}
          <div className="space-y-6 relative mt-8">
            <div className="flex items-center gap-3 mb-[-10px]">
              <img src="/assets/items/fantasy-divider.png" className="h-1 w-12 opacity-0" alt="" />
              <div className="flex-1">
                <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500 uppercase tracking-widest drop-shadow-sm">
                  {expandedQuestId ? 'Relevant Bounties' : 'Bounties'}
                </h2>
                <p className="text-xs text-slate-500 font-mono mt-1">do the task or habit and acquire the bounty to reap your rewards, refreshes daily</p>
              </div>
            </div>
            <div className="h-[1px] w-full bg-gradient-to-r from-amber-500/50 to-transparent" />

            <DndContext sensors={sensors} collisionDetection={customCollisionDetection} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
              <div className={`grid grid-cols-1 md:grid-cols-2 ${expandedQuestId ? 'lg:grid-cols-1' : 'lg:grid-cols-4'} gap-4`}>
                {['p-titan-1', 'p-tycoon-1', 'p-tech-1', 'p-tycoon-2'].map(pid => {
                  if (expandedQuestId && expandedQuestId !== pid) return null;

                  const columnBounties = visibleBountiesMap[pid] || [];
                  const columnName = pid === 'p-titan-1' ? "To-Do"
                    : pid === 'p-tycoon-1' ? "Habits"
                      : pid === 'p-tech-1' ? "Projects"
                        : "Create a Bounty";

                  return (
                    <BountyColumn
                      key={pid}
                      pid={pid}
                      title={columnName}
                      bounties={columnBounties}
                      completeTask={completeTask}
                      deleteTask={handleDeleteTask}
                      onCreate={handleCreateBounty}
                    />
                  );
                })}
              </div>
            </DndContext>
          </div>


        </div>

        {/* RIGHT SIDEBAR - Sticky */}
        <div className="w-full lg:w-80 flex-shrink-0 space-y-6 lg:sticky lg:top-4 lg:self-start">

          {/* Tools Panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Sword size={12} />
              <span>Tools</span>
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {/* Tool 1: Grindstone */}
              <button
                className="group relative flex flex-col items-center justify-center gap-2 p-3 rounded-xl bg-slate-950/50 border border-slate-800 hover:border-amber-500/50 hover:bg-amber-950/10 transition-all duration-300"
                onClick={() => navigate('/app/tools/grindstone')}
              >
                <div className="absolute inset-0 bg-amber-500/5 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity" />
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-700 text-amber-500 group-hover:scale-110 transition-transform">
                  <Hammer size={18} />
                </div>
                <div className="text-center">
                  <span className="block text-[10px] font-bold text-slate-300 group-hover:text-amber-200 uppercase tracking-wider">Grindstone</span>
                  <span className="block text-[9px] text-slate-600 scale-90">Focus Mode</span>
                </div>
              </button>

              {/* Tool 2: Mind Wipe */}
              <button
                className="group relative flex flex-col items-center justify-center gap-2 p-3 rounded-xl bg-slate-950/50 border border-slate-800 hover:border-purple-500/50 hover:bg-purple-950/10 transition-all duration-300"
                onClick={() => navigate('/app/tools/mind-wipe')}
              >
                <div className="absolute inset-0 bg-purple-500/5 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity" />
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-700 text-purple-400 group-hover:scale-110 transition-transform">
                  <Book size={18} />
                </div>
                <div className="text-center">
                  <span className="block text-[10px] font-bold text-slate-300 group-hover:text-purple-200 uppercase tracking-wider">Journal</span>
                  <span className="block text-[9px] text-slate-600 scale-90">Daily Log</span>
                </div>
              </button>

              {/* Tool 3: Empty */}
              <div className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl border border-slate-800/50 border-dashed opacity-50">
                <Plus size={16} className="text-slate-700" />
                <span className="text-[9px] font-bold text-slate-700 uppercase">Slot Empty</span>
              </div>

              {/* Tool 4: Empty */}
              <div className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl border border-slate-800/50 border-dashed opacity-50">
                <Plus size={16} className="text-slate-700" />
                <span className="text-[9px] font-bold text-slate-700 uppercase">Slot Empty</span>
              </div>
            </div>
          </div>

          <MerchantCard
            description="The stars have shifted. I have opportunities for one with your talents."
            onNewQuestClick={() => setIsQuestModalOpen(true)}
            isModalOpen={isQuestModalOpen}
          />
        </div>

        {/* DETAIL VIEW OVERLAY */}
        <AnimatePresence>
          {activeProjectId && (() => {
            const activeProject = projects.find(p => p.id === activeProjectId);
            if (!activeProject) return null;

            const activeTasks = tasks.filter(t => t.projectId === activeProjectId);

            // Background Logic
            const index = projects.findIndex(p => p.id === activeProjectId);
            const backgrounds = [
              '/assets/vitality_peak_quest_card.jpg',
              '/assets/dwarvern_vault_quest_card.jpg',
              '/assets/scholars_mine_quest_card.jpg',
              '/assets/stewards_castle_quest_card.jpg'
            ];
            const bg = index < backgrounds.length ? backgrounds[index] : null;

            return (
              <ProjectDetailView
                key={activeProjectId}
                project={activeProject}
                tasks={activeTasks}
                onClose={handleCloseDetail}
                background={bg}
              />
            );
          })()}
        </AnimatePresence>
      </div>
    </div>
  );
};
