import React, { useState, useEffect } from 'react';
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from 'react-router-dom';
import { useGameStore, INITIAL_PROJECTS, INITIAL_TASKS } from '../store/useGameStore';

import { ChevronDown, CheckCircle2, Circle, Trophy, PlusCircle, AlertCircle, Sword, Sparkles, Zap, Scroll, Map, Calendar, Coins, Gift, Activity, Brain, Utensils, Users, Moon, Hammer, Eraser, Plus, Book, Trash2, Clock, Repeat, Flame, X, AlertTriangle, Heart, Award, Crown, Target } from 'lucide-react';
import { Task } from '../types';
import { DndContext, DragEndEvent, DragOverlay, useSensor, useSensors, PointerSensor, rectIntersection } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
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
import { QuestCard, SortableQuestCard } from '../components/questlog/QuestCard';
import { BountyColumn } from '../components/questlog/BountyColumn';
import { NoticeBoard } from '../components/questlog/NoticeBoard';
import { PurchaseModal } from '../components/questlog/PurchaseModal';
import type { Offering } from '../components/questlog/OfferingCard';








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
  const [selectedOffering, setSelectedOffering] = useState<Offering | null>(null);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);

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
        const updates: Partial<Task> = { projectId: overContainer };

        // Initialize habit count when moving TO habits column
        if (overContainer === 'col-habit' && activeTask.habitCount === undefined) {
          updates.habitCount = 0;
        }

        // Clear habit count when moving OUT of habits column
        if (activeTask.projectId === 'col-habit' && overContainer !== 'col-habit') {
          updates.habitCount = undefined;
        }

        updateTask({ ...activeTask, ...updates });
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

  const handleOfferingClick = (offering: Offering) => {
    setSelectedOffering(offering);
    setIsPurchaseModalOpen(true);
  };

  const handlePurchaseConfirm = (offering: Offering) => {
    // Check if user has enough gold
    if (stats.gold < offering.price) {
      console.error('Insufficient gold');
      return;
    }

    // Deduct gold
    useGameStore.getState().addGold(-offering.price);

    // Create bounty in appropriate column based on offering category
    const projectId = offering.category === 'habit' ? 'col-habit' : 'col-todo';

    const newBounty = {
      name: offering.title,
      description: offering.description,
      type: 'main' as const,
      projectId: projectId,
      xpReward: offering.rewards.xp,
      goldReward: offering.rewards.gold,
      // Initialize habit counter for habits
      ...(offering.category === 'habit' && { habitCount: 0 }),
      // Add background image
      backgroundImage: offering.imageUrl
    };

    createTask(newBounty);

    // Close modal
    setIsPurchaseModalOpen(false);
    setSelectedOffering(null);

    // Optional: Show success feedback
    console.log('Bounty acquired:', offering.title);
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

      {/* Purchase Modal */}
      <PurchaseModal
        offering={selectedOffering}
        isOpen={isPurchaseModalOpen}
        onClose={() => {
          setIsPurchaseModalOpen(false);
          setSelectedOffering(null);
        }}
        onConfirm={handlePurchaseConfirm}
        currentGold={stats.gold}
      />

      <div className={`flex flex-col lg:flex-row gap-8 mt-8 transition-opacity duration-300 ${isQuestModalOpen ? 'opacity-20 pointer-events-none' : ''}`}>


        {/* LEFT SIDEBAR - Character */}
        <div className="w-full lg:w-48 flex-shrink-0 space-y-6 sticky top-4 h-fit self-start">
          <CharacterSidebar className="hidden lg:block w-full lg:w-48 flex-shrink-0 animate-in slide-in-from-left-4 duration-500" />
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
                  const columnBounties = visibleBountiesMap[pid as any] || [];

                  // Explicit titles
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

                  // Notice Board replaces Guild column in standard view only
                  if (pid === 'col-guild' && !isKanbanView) {
                    return (
                      <NoticeBoard
                        key={pid}
                        onOfferingClick={handleOfferingClick}
                      />
                    );
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
