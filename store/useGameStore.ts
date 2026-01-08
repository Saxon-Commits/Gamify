import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { get, set, del } from 'idb-keyval';
import { GameState, Stats, Project, Task, GameSettings, VitalityData, JournalEntry } from '../types';
import { calculateXpToNextLevel, calculateTotalXpForLevel } from '../src/utils/gameLogic';
import { calculateRewards, calculateGambitChance, SHOP_ITEMS } from '../src/utils/GameEconomy';
import { ALL_COSMETIC_ITEMS } from '../src/utils/CosmeticsData';
import { ITEM_EFFECTS } from '../src/utils/itemEffects';

const INITIAL_STATS: Stats = {
  name: "Adventurer",
  title: "Aspirant",
  level: 1,
  xp: 0,
  xpToNext: calculateXpToNextLevel(1),
  gold: 5000,
  hp: 100,
  maxHp: 100,
  energy: 100,
  maxEnergy: 100,
  skillPoints: 1000,

  gems: 100000,
  streak: 0,
  intellect: 1,
  strength: 1,
  vigor: 1,
  discipline: 1,
  spirit: 1,
};

// ... existing code ...

const INITIAL_VITALITY: VitalityData = {
  activityLevel: '',
  fitnessGoal: '',
  customFitnessGoal: '',
  stepGoal: '',
  stretchCommitment: false,
};

const INITIAL_SETTINGS: GameSettings = {
  musicVolume: 0.4,
  isMusicMuted: false,
  honorSystemAgreed: false,
  hasSeenTutorial: false,
  theme: 'dark'
};

import { generateSkillTree } from '../src/utils/SkillTreeUtils';

const { nodes: INITIAL_NODES, edges: INITIAL_EDGES } = generateSkillTree();

export const INITIAL_PROJECTS: Project[] = [
  { id: 'p-titan-1', name: 'Vitality Peak', description: 'Focus on five pillars: Physical, Nutrition, Sleep, Mental & Social.', completed: false, difficulty: 'HARD', hp: 500, maxHp: 500, icon: '/assets/heart icon.png' },
  { id: 'p-tycoon-1', name: 'Financial Vault', description: 'Audit Net Worth.', completed: false, difficulty: 'EASY', hp: 100, maxHp: 100 },
  { id: 'p-tech-1', name: "Scholar's Library", description: 'Foundation of Technomancer branch.', completed: false, difficulty: 'HARD', hp: 500, maxHp: 500 },

  // --- TYCOON PATHWAY PROJECTS ---
  { id: 'p-tycoon-2', name: "Steward's Castle", description: 'Cash Flow Control.', completed: false, difficulty: 'EASY', hp: 100, maxHp: 100 },
  { id: 'p-tycoon-3', name: 'Iron Reserve', description: 'Safety Net.', completed: false, difficulty: 'MEDIUM', hp: 300, maxHp: 300 },
  { id: 'p-tycoon-s1', name: 'Credit Hacker', description: 'Leveraging Score.', completed: false, difficulty: 'EASY', hp: 100, maxHp: 100 },
  { id: 'p-tycoon-s2', name: 'Psych Eval', description: 'Negotiation Psychology.', completed: false, difficulty: 'EASY', hp: 100, maxHp: 100 },
  // Active Branch
  { id: 'p-tycoon-4a', name: 'Skill Minting', description: 'Value Definition.', completed: false, difficulty: 'MEDIUM', hp: 200, maxHp: 200 },
  { id: 'p-tycoon-5a', name: 'The Grand Offer', description: 'Offer Creation.', completed: false, difficulty: 'HARD', hp: 500, maxHp: 500 },
  { id: 'p-tycoon-6a', name: 'Signal Amplify', description: 'Distribution.', completed: false, difficulty: 'HARD', hp: 500, maxHp: 500 },
  { id: 'p-tycoon-7a', name: 'Archimedes Lever', description: 'Leverage.', completed: false, difficulty: 'HARD', hp: 500, maxHp: 500 },
  // Passive Branch
  { id: 'p-tycoon-4b', name: 'Ticker Tape', description: 'Market Literacy.', completed: false, difficulty: 'MEDIUM', hp: 200, maxHp: 200 },
  { id: 'p-tycoon-5b', name: 'Compound Engine', description: 'Index Investing.', completed: false, difficulty: 'HARD', hp: 500, maxHp: 500 },
  { id: 'p-tycoon-6b', name: 'Loophole Logic', description: 'Tax Efficiency.', completed: false, difficulty: 'HARD', hp: 500, maxHp: 500 },
  { id: 'p-tycoon-7b', name: 'Exotic Vault', description: 'Alternative Assets.', completed: false, difficulty: 'HARD', hp: 500, maxHp: 500 },
  // Apex
  { id: 'p-tycoon-8', name: 'Midas Throne', description: 'Capital Sovereign.', completed: false, difficulty: 'EPIC', hp: 1000, maxHp: 1000 },
];

export const INITIAL_TASKS: Task[] = [
  { id: 't-1', projectId: 'p-titan-1', name: 'Track calories for 7 days', completed: false, xpReward: 200, goldReward: 50, energyCost: 10, type: 'main', difficulty: 'MEDIUM' },
  { id: 't-2', projectId: 'p-titan-1', name: 'Drink 3L water daily (streak 1/3)', completed: false, xpReward: 100, goldReward: 20, energyCost: 5, type: 'main', difficulty: 'EASY' },
  { id: 't-3', projectId: 'p-tycoon-1', name: 'Setup budget in Notion/Excel', completed: false, xpReward: 150, goldReward: 30, energyCost: 15, type: 'main', difficulty: 'MEDIUM' },
  { id: 't-4', projectId: 'p-tycoon-1', name: 'Identify 3 unnecessary subscriptions', completed: false, xpReward: 50, goldReward: 100, energyCost: 5, type: 'main', difficulty: 'EASY' },
  { id: 't-5', projectId: 'p-tech-1', name: 'Build a basic static site (index.html)', completed: false, xpReward: 300, goldReward: 75, energyCost: 25, type: 'main', difficulty: 'HARD' },
  { id: 't-6', projectId: 'p-tech-1', name: 'Configure VS Code shortcuts', completed: false, xpReward: 50, goldReward: 10, energyCost: 5, type: 'main', difficulty: 'TRIVIAL' },

  // --- HEALTH / TITAN PATHWAY (User Added) ---
  // Stabilization & Assessment
  { id: 't-ti-1a', projectId: 'p-titan-1', name: '[Health] Get medical baseline (BP, BMI, Mobility)', completed: false, xpReward: 300, goldReward: 50, energyCost: 20, type: 'main', difficulty: 'HARD' },
  { id: 't-ti-1b', projectId: 'p-titan-1', name: '[Health] Establish 7,000-step daily floor', completed: false, xpReward: 150, goldReward: 25, energyCost: 15, type: 'main', difficulty: 'MEDIUM' },
  { id: 't-ti-1c', projectId: 'p-titan-1', name: '[Health] Daily 10-min "Desk Worker" mobility routine', completed: false, xpReward: 100, goldReward: 10, energyCost: 10, type: 'main', difficulty: 'EASY' },

  // Form & Foundation
  { id: 't-ti-2a', projectId: 'p-titan-1', name: '[Health] Learn "Big 4" bodyweight movements', completed: false, xpReward: 200, goldReward: 50, energyCost: 20, type: 'main', difficulty: 'MEDIUM' },
  { id: 't-ti-2b', projectId: 'p-titan-1', name: '[Health] 20 mins Zone 2 cardio (3x/week)', completed: false, xpReward: 250, goldReward: 50, energyCost: 25, type: 'main', difficulty: 'MEDIUM' },
  { id: 't-ti-2c', projectId: 'p-titan-1', name: '[Health] Fix ergonomic setup', completed: false, xpReward: 100, goldReward: 100, energyCost: 10, type: 'main', difficulty: 'EASY' },

  // Progressive Strength & Capacity
  { id: 't-ti-3a', projectId: 'p-titan-1', name: '[Health] Begin weighted resistance training (3x/week)', completed: false, xpReward: 400, goldReward: 100, energyCost: 40, type: 'main', difficulty: 'HARD' },
  { id: 't-ti-3b', projectId: 'p-titan-1', name: '[Health] Increase cardio to 150 mins/week', completed: false, xpReward: 350, goldReward: 75, energyCost: 30, type: 'main', difficulty: 'HARD' },
  { id: 't-ti-3c', projectId: 'p-titan-1', name: '[Health] Track workouts (Progressive Overload)', completed: false, xpReward: 150, goldReward: 25, energyCost: 10, type: 'main', difficulty: 'MEDIUM' },

  // High-Intensity & Recovery Mastery
  { id: 't-ti-4a', projectId: 'p-titan-1', name: '[Health] 1 weekly HIIT/VO2 Max session', completed: false, xpReward: 300, goldReward: 50, energyCost: 35, type: 'main', difficulty: 'HARD' },
  { id: 't-ti-4b', projectId: 'p-titan-1', name: '[Health] Establish dedicated "Active Recovery" day', completed: false, xpReward: 200, goldReward: 25, energyCost: 15, type: 'main', difficulty: 'MEDIUM' },
  { id: 't-ti-4c', projectId: 'p-titan-1', name: '[Health] Invest in coaching/program', completed: false, xpReward: 250, goldReward: 200, energyCost: 10, type: 'main', difficulty: 'MEDIUM' },

  // The Lifestyle Athlete
  { id: 't-ti-5a', projectId: 'p-titan-1', name: '[Health] Integrate movement (rucking/sport)', completed: false, xpReward: 300, goldReward: 50, energyCost: 30, type: 'main', difficulty: 'HARD' },
  { id: 't-ti-5b', projectId: 'p-titan-1', name: '[Health] Zero chronic pain (Mobility maintenance)', completed: false, xpReward: 500, goldReward: 100, energyCost: 20, type: 'main', difficulty: 'EPIC' },
  { id: 't-ti-5c', projectId: 'p-titan-1', name: '[Health] Verify physical/mental energy alignment', completed: false, xpReward: 400, goldReward: 50, energyCost: 0, type: 'main', difficulty: 'EPIC' },

  // --- DAILY BOUNTIES (Physical Protocol) ---
  { id: 'b-steps', projectId: 'p-titan-1', name: 'Daily Steps Target', completed: false, xpReward: 100, goldReward: 25, energyCost: 15, type: 'daily', difficulty: 'MEDIUM' },
  { id: 'b-stretch', projectId: 'p-titan-1', name: 'Daily Stretch Routine', completed: false, xpReward: 50, goldReward: 10, energyCost: 5, type: 'daily', difficulty: 'EASY' },


  // --- TYCOON PATHWAY QUESTS ---
  // p-tycoon-1: Vault Inspection (Existing modified)
  // { id: 't-3', ... } // Already exists above (Account Audit)
  { id: 't-ty-1a', projectId: 'p-tycoon-1', name: '[Audit] Calculate Net Worth', completed: false, xpReward: 100, goldReward: 50, energyCost: 10, type: 'main', difficulty: 'EASY' },

  // p-tycoon-2: Burn Rate (1 Quest)
  { id: 't-ty-2a', projectId: 'p-tycoon-2', name: '[Budget] Calculate Monthly Fixed Costs', completed: false, xpReward: 100, goldReward: 50, energyCost: 10, type: 'main', difficulty: 'EASY' },

  // p-tycoon-3: Iron Reserve (3 Quests)
  { id: 't-ty-3a', projectId: 'p-tycoon-3', name: '[Safety] Save $1,000 Emergency Fund', completed: false, xpReward: 200, goldReward: 100, energyCost: 20, type: 'main', difficulty: 'HARD' },
  { id: 't-ty-3b', projectId: 'p-tycoon-3', name: '[Safety] Open HYSA', completed: false, xpReward: 150, goldReward: 50, energyCost: 15, type: 'main', difficulty: 'MEDIUM' },
  { id: 't-ty-3c', projectId: 'p-tycoon-3', name: '[Safety] Automate Savings Transfer', completed: false, xpReward: 150, goldReward: 50, energyCost: 10, type: 'main', difficulty: 'EASY' },

  // Sprouts (1 Quest each)
  { id: 't-ty-s1', projectId: 'p-tycoon-s1', name: '[Credit] Review Credit Report', completed: false, xpReward: 100, goldReward: 50, energyCost: 10, type: 'main', difficulty: 'EASY' },
  { id: 't-ty-s2', projectId: 'p-tycoon-s2', name: '[Mindset] Read Negotiation Tactics Chapter', completed: false, xpReward: 100, goldReward: 50, energyCost: 15, type: 'main', difficulty: 'MEDIUM' },

  // Branch A: Active (4a - 7a)
  // 4a: Skill Minting (1 Quest)
  { id: 't-ty-4a', projectId: 'p-tycoon-4a', name: '[Income] List Top 3 High-Value Skills', completed: false, xpReward: 150, goldReward: 50, energyCost: 15, type: 'main', difficulty: 'MEDIUM' },

  // 5a: The Grand Offer (3 Quests)
  { id: 't-ty-5a1', projectId: 'p-tycoon-5a', name: '[Offer] Draft Product/Service Offer', completed: false, xpReward: 250, goldReward: 100, energyCost: 25, type: 'main', difficulty: 'HARD' },
  { id: 't-ty-5a2', projectId: 'p-tycoon-5a', name: '[Offer] Define Pricing Model', completed: false, xpReward: 200, goldReward: 75, energyCost: 20, type: 'main', difficulty: 'MEDIUM' },
  { id: 't-ty-5a3', projectId: 'p-tycoon-5a', name: '[Offer] Write Sales Headline', completed: false, xpReward: 150, goldReward: 50, energyCost: 15, type: 'main', difficulty: 'MEDIUM' },

  // 6a: Signal Amplify (3 Quests)
  { id: 't-ty-6a1', projectId: 'p-tycoon-6a', name: '[Marketing] Post Content', completed: false, xpReward: 200, goldReward: 100, energyCost: 20, type: 'main', difficulty: 'MEDIUM' },
  { id: 't-ty-6a2', projectId: 'p-tycoon-6a', name: '[Marketing] Draft Outreach Emails (5)', completed: false, xpReward: 250, goldReward: 100, energyCost: 30, type: 'main', difficulty: 'HARD' },
  { id: 't-ty-6a3', projectId: 'p-tycoon-6a', name: '[Marketing] Identify Distribution Channels', completed: false, xpReward: 150, goldReward: 50, energyCost: 15, type: 'main', difficulty: 'MEDIUM' },

  // 7a: Archimedes Lever (3 Quests)
  { id: 't-ty-7a1', projectId: 'p-tycoon-7a', name: '[Leverage] Hire Freelancer / Delegate', completed: false, xpReward: 300, goldReward: 0, energyCost: 10, type: 'main', difficulty: 'HARD' },
  { id: 't-ty-7a2', projectId: 'p-tycoon-7a', name: '[Leverage] Automate 1 Process', completed: false, xpReward: 250, goldReward: 100, energyCost: 25, type: 'main', difficulty: 'HARD' },
  { id: 't-ty-7a3', projectId: 'p-tycoon-7a', name: '[Leverage] Create SOP', completed: false, xpReward: 200, goldReward: 75, energyCost: 20, type: 'main', difficulty: 'MEDIUM' },

  // Branch B: Passive (4b - 7b)
  // 4b: Ticker Tape (1 Quest)
  { id: 't-ty-4b', projectId: 'p-tycoon-4b', name: '[Market] Read Financial News', completed: false, xpReward: 100, goldReward: 25, energyCost: 10, type: 'main', difficulty: 'EASY' },

  // 5b: Compound Engine (3 Quests)
  { id: 't-ty-5b1', projectId: 'p-tycoon-5b', name: '[Investing] Open Brokerage Account', completed: false, xpReward: 200, goldReward: 50, energyCost: 20, type: 'main', difficulty: 'MEDIUM' },
  { id: 't-ty-5b2', projectId: 'p-tycoon-5b', name: '[Investing] Research S&P 500', completed: false, xpReward: 150, goldReward: 50, energyCost: 15, type: 'main', difficulty: 'MEDIUM' },
  { id: 't-ty-5b3', projectId: 'p-tycoon-5b', name: '[Investing] Setup Auto-Invest', completed: false, xpReward: 250, goldReward: 100, energyCost: 15, type: 'main', difficulty: 'HARD' },

  // 6b: Loophole Logic (3 Quests)
  { id: 't-ty-6b1', projectId: 'p-tycoon-6b', name: '[Tax] Categorize Deductions', completed: false, xpReward: 200, goldReward: 100, energyCost: 25, type: 'main', difficulty: 'MEDIUM' },
  { id: 't-ty-6b2', projectId: 'p-tycoon-6b', name: '[Tax] Review IRA/401k Limits', completed: false, xpReward: 150, goldReward: 50, energyCost: 10, type: 'main', difficulty: 'EASY' },
  { id: 't-ty-6b3', projectId: 'p-tycoon-6b', name: '[Tax] Consult CPA/Tax Software', completed: false, xpReward: 300, goldReward: 100, energyCost: 20, type: 'main', difficulty: 'HARD' },

  // 7b: Exotic Vault (3 Quests)
  { id: 't-ty-7b1', projectId: 'p-tycoon-7b', name: '[Alt] Research Crypto/Real Estate', completed: false, xpReward: 150, goldReward: 50, energyCost: 15, type: 'main', difficulty: 'MEDIUM' },
  { id: 't-ty-7b2', projectId: 'p-tycoon-7b', name: '[Alt] Evaluate Risk Tolerance', completed: false, xpReward: 100, goldReward: 25, energyCost: 10, type: 'main', difficulty: 'EASY' },
  { id: 't-ty-7b3', projectId: 'p-tycoon-7b', name: '[Alt] Read Whitepaper/Listing', completed: false, xpReward: 200, goldReward: 50, energyCost: 20, type: 'main', difficulty: 'MEDIUM' },

  // APEX: Midas Throne (5 Quests)
  { id: 't-ty-8a', projectId: 'p-tycoon-8', name: '[Apex] Review Asset Allocation', completed: false, xpReward: 300, goldReward: 100, energyCost: 20, type: 'main', difficulty: 'HARD' },
  { id: 't-ty-8b', projectId: 'p-tycoon-8', name: '[Apex] Update Net Worth Target', completed: false, xpReward: 300, goldReward: 100, energyCost: 15, type: 'main', difficulty: 'MEDIUM' },
  { id: 't-ty-8c', projectId: 'p-tycoon-8', name: '[Apex] Rebalance Portfolio', completed: false, xpReward: 500, goldReward: 200, energyCost: 30, type: 'main', difficulty: 'EPIC' },
  { id: 't-ty-8d', projectId: 'p-tycoon-8', name: '[Apex] 5-Year Vision Draft', completed: false, xpReward: 400, goldReward: 100, energyCost: 40, type: 'main', difficulty: 'HARD' },
  { id: 't-ty-8e', projectId: 'p-tycoon-8', name: '[Apex] Celebrate Milestone', completed: false, xpReward: 1000, goldReward: 500, energyCost: 50, type: 'main', difficulty: 'EPIC' },
];

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      stats: INITIAL_STATS,
      settings: INITIAL_SETTINGS,
      projects: INITIAL_PROJECTS,
      tasks: INITIAL_TASKS,
      skillNodes: INITIAL_NODES,
      skillEdges: INITIAL_EDGES,
      vitality: INITIAL_VITALITY,
      isTutorialActive: false,
      isSidePanelOpen: false,
      journalEntries: [],

      addJournalEntry: (entry) => {
        const newEntry: JournalEntry = {
          ...entry,
          id: Math.random().toString(36).substring(2, 9),
          date: new Date().toISOString()
        };
        set((state) => ({ journalEntries: [newEntry, ...state.journalEntries] }));
      },

      setSidePanelOpen: (isOpen) => set({ isSidePanelOpen: isOpen }),

      deleteJournalEntry: (id) => {
        set((state) => ({
          journalEntries: state.journalEntries.filter(e => e.id !== id)
        }));
      },

      updateJournalEntry: (entry) => {
        set((state) => ({
          journalEntries: state.journalEntries.map(e => e.id === entry.id ? { ...e, ...entry } : e)
        }));
      },


      inventory: [],
      cart: [],
      purchaseHistory: [],
      activityLog: [],
      activeBuffs: [],
      hoveredNode: null,

      // NEW: Set Active Avatar
      setAvatar: (avatarId: string) => {
        set(state => ({
          stats: { ...state.stats, activeAvatarId: avatarId }
        }));
      },

      equipItem: (slot, itemId) => {
        set(state => {
          const newStats = { ...state.stats };
          switch (slot) {
            case 'mainHand': newStats.activeMainHandId = itemId || undefined; break;
            case 'armor': newStats.activeArmorId = itemId || undefined; break;
            case 'head': newStats.activeHeadId = itemId || undefined; break;
            case 'accessory': newStats.activeAccessoryId = itemId || undefined; break;
          }
          return { stats: newStats };
        });
      },

      useItem: (itemId) => {
        const { inventory, stats, activeBuffs } = get();
        const itemIndex = inventory.findIndex(i => i.id === itemId);

        if (itemIndex === -1) return { success: false, message: "Item not found" };

        const item = inventory[itemIndex];
        // If not loaded yet, require
        // We need to dynamic import or just assume available. 
        // We will move imports to top of file

        const effectFn = ITEM_EFFECTS[itemId];
        if (!effectFn) {
          // Default behavior for consumables without specific logic: Just consume
          const newInventory = [...inventory];
          if (item.quantity > 1) {
            newInventory[itemIndex] = { ...item, quantity: item.quantity - 1 };
          } else {
            newInventory.splice(itemIndex, 1);
          }
          set({ inventory: newInventory });
          return { success: true, message: `${item.name} used.` };
        }

        // Execute Effect
        // Pass complete state proxy
        const result = effectFn(get());

        if (result.success) {
          const newInventory = [...inventory];
          if (item.quantity > 1) {
            newInventory[itemIndex] = { ...item, quantity: item.quantity - 1 };
          } else {
            newInventory.splice(itemIndex, 1);
          }

          // Merge updates
          set((state) => ({
            inventory: newInventory,
            ...result.updates,
            stats: { ...state.stats, ...(result.statsUpdates || {}) }
          }));
          return { success: true, message: result.message };
        } else {
          return { success: false, message: result.message };
        }
      },

      completeTask: (taskId) => {
        const { tasks, stats, activityLog, inventory } = get();
        const task = tasks.find(t => t.id === taskId);
        if (!task || task.completed || stats.energy < task.energyCost) return;

        // --- PERK INTEGRATION ---
        let activePerks = undefined;
        if (stats.activeAvatarId) {
          // Find avatar in inventory (it should be there if equiped, or use base/default logic)
          // SHOP_ITEMS has the definition. We can lookup directly.
          const allItems = [...SHOP_ITEMS, ...ALL_COSMETIC_ITEMS];
          const avatarDef = allItems.find(i => i.id === stats.activeAvatarId || (stats.activeAvatarId === 'base' && i.id === 'base_hero')); // Assuming base exists or undefined
          if (avatarDef && (avatarDef as any).perks) {
            activePerks = (avatarDef as any).perks;
          }
        }
        // ------------------------

        // Economy Integration
        const { gold, sp } = calculateRewards(task.difficulty, false, activePerks);

        let updatedLevel = stats.level;

        // XP Calculation with Perks
        let xpGained = task.xpReward;
        if (activePerks?.xpModifier) {
          xpGained = Math.round(xpGained * (1 + activePerks.xpModifier));
        }

        let updatedXp = stats.xp + xpGained;
        let updatedXpToNext = stats.xpToNext;
        let skillPointsGained = sp;

        // Handle Level Up (recursive)
        while (updatedXp >= updatedXpToNext) {
          updatedXp -= updatedXpToNext;
          updatedLevel++;
          updatedXpToNext = calculateXpToNextLevel(updatedLevel);
          skillPointsGained++;
        }

        // Log Activity (Heatmap)
        const today = new Date().toISOString().split('T')[0];
        let newActivityLog = [...(activityLog || [])];
        const existingLogIndex = newActivityLog.findIndex(l => l.date === today);
        if (existingLogIndex >= 0) {
          newActivityLog = newActivityLog.map((l, i) => i === existingLogIndex ? { ...l, xp: l.xp + xpGained } : l);
        } else {
          newActivityLog.push({ date: today, xp: xpGained });
        }

        set({
          stats: {
            ...stats,
            xp: updatedXp,
            gold: stats.gold + gold,
            energy: Math.max(0, stats.energy - task.energyCost),
            level: updatedLevel,
            xpToNext: updatedXpToNext,
            skillPoints: stats.skillPoints + skillPointsGained,
            // voidShards removed
            streak: stats.streak + 1
          },
          tasks: tasks.map(t => t.id === taskId ? { ...t, completed: true } : t),
          activityLog: newActivityLog
        });
      },

      completeProject: (projectId) => {
        const { projects, stats, activityLog } = get();

        // Log Activity (Heatmap)
        const today = new Date().toISOString().split('T')[0];
        let newActivityLog = [...(activityLog || [])];
        const existingLogIndex = newActivityLog.findIndex(l => l.date === today);
        if (existingLogIndex >= 0) {
          newActivityLog = newActivityLog.map((l, i) => i === existingLogIndex ? { ...l, xp: l.xp + 50 } : l);
        } else {
          newActivityLog.push({ date: today, xp: 50 });
        }

        // Projects fixed reward: 2 SP, 500 Gold
        set({
          projects: projects.map(p => p.id === projectId ? { ...p, completed: true } : p),
          stats: {
            ...stats,
            skillPoints: stats.skillPoints + 2,
            gold: stats.gold + 500
          },
          activityLog: newActivityLog
        });
      },

      buyItem: (item) => {
        const { stats, inventory } = get();

        // Check if item uses Gems
        const isPremium = item.currency === 'GEMS' || !!(item as any).premiumPrice;
        const cost = isPremium ? ((item as any).premiumPrice || 0) : item.cost;

        // --- GOLD DISCOUNT PERKS (Only applies to Gold) ---
        let finalCost = cost;
        if (!isPremium && stats.activeAvatarId) {
          const allItems = [...SHOP_ITEMS, ...ALL_COSMETIC_ITEMS];
          const avatarDef = allItems.find(i => i.id === stats.activeAvatarId);
          if (avatarDef && (avatarDef as any).perks?.shopDiscount) {
            finalCost = Math.round(cost * (1 - (avatarDef as any).perks.shopDiscount));
          }
        }
        // -----------------------------------

        const canAfford = isPremium ? stats.gems >= finalCost : stats.gold >= finalCost;

        if (canAfford) {
          const existingItem = inventory.find(i => i.id === item.id);
          let newInventory;

          if (existingItem) {
            newInventory = inventory.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
          } else {
            // Include ALL properties (imageUrl, etc.)
            newInventory = [...inventory, {
              ...item,
              type: item.type as any,
              acquiredAt: new Date().toISOString(),
              quantity: 1
            } as any]; // formatting or casting as needed
          }

          set({
            stats: {
              ...stats,
              gold: !isPremium ? stats.gold - finalCost : stats.gold,
              gems: isPremium ? stats.gems - finalCost : stats.gems
            },
            inventory: newInventory
          });
          return true;
        }
        return false;
      },

      addToCart: (item) => {
        const { cart } = get();
        const existing = cart.find(i => i.id === item.id);
        if (existing) {
          set({ cart: cart.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i) });
        } else {
          set({ cart: [...cart, { ...item, quantity: 1, acquiredAt: new Date().toISOString() }] });
        }
      },

      removeFromCart: (itemId) => {
        const { cart } = get();
        const existing = cart.find(i => i.id === itemId);
        if (existing && existing.quantity > 1) {
          set({ cart: cart.map(i => i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i) });
        } else {
          set({ cart: cart.filter(i => i.id !== itemId) });
        }
      },

      purchaseCart: () => {
        const { stats, cart, inventory, purchaseHistory } = get();

        // Recalculate Totals with Discounts
        let activePerks = undefined;
        if (stats.activeAvatarId) {
          const allItems = [...SHOP_ITEMS, ...ALL_COSMETIC_ITEMS];
          const avatarDef = allItems.find(i => i.id === stats.activeAvatarId);
          activePerks = (avatarDef as any)?.perks;
        }

        const totalGold = cart
          .filter(i => !i.currency || i.currency === 'GOLD')
          .reduce((sum, item) => {
            let cost = item.cost || 0;
            if (activePerks?.shopDiscount) {
              cost = Math.round(cost * (1 - activePerks.shopDiscount));
            }
            return sum + (cost * item.quantity);
          }, 0);



        if (stats.gold >= totalGold) {
          let newInventory = [...inventory];
          const newHistory = [...(purchaseHistory || [])];

          cart.forEach(cartItem => {
            // Inventory Logic
            const existing = newInventory.find(i => i.id === cartItem.id);
            if (existing) {
              newInventory = newInventory.map(i => i.id === cartItem.id ? { ...i, quantity: i.quantity + cartItem.quantity } : i);
            } else {
              newInventory.push(cartItem);
            }

            for (let k = 0; k < cartItem.quantity; k++) {
              newHistory.push({ itemId: cartItem.id, timestamp: new Date().toISOString() });
            }
          });

          set({
            stats: {
              ...stats,
              gold: stats.gold - totalGold,
              // voidShards removed
            },
            inventory: newInventory,
            purchaseHistory: newHistory,
            cart: []
          });
          return true;
        }
        return false;
      },

      addItem: (itemId, quantity = 1) => {
        const { inventory } = get();
        const allItems = [...SHOP_ITEMS, ...ALL_COSMETIC_ITEMS];
        const itemDef = allItems.find(i => i.id === itemId);
        if (!itemDef) return;

        const existingItem = inventory.find(i => i.id === itemId);
        let newInventory;

        if (existingItem) {
          newInventory = inventory.map(i => i.id === itemId ? { ...i, quantity: i.quantity + quantity } : i);
        } else {
          const newItem = {
            id: itemDef.id,
            name: itemDef.name,
            cost: itemDef.cost,
            type: itemDef.type,
            description: itemDef.description,
            quantity: quantity,
            effects: (itemDef as any).effects,
            rarity: (itemDef as any).rarity,
            imageUrl: itemDef.imageUrl,
            flavor: (itemDef as any).flavor
          };
          newInventory = [...inventory, newItem];
        }

        set({ inventory: newInventory });
      },

      // --- CUSTOM TASKS & DND ---
      createTask: (task) => {
        set((state) => ({
          tasks: [...state.tasks, { ...task, id: `t-custom-${Date.now()}`, completed: false }]
        }));
      },

      deleteTask: (taskId) => {
        set((state) => ({
          tasks: state.tasks.filter(t => t.id !== taskId)
        }));
      },

      moveTask: (taskId, targetProjectId) => {
        set((state) => ({
          tasks: state.tasks.map(t =>
            t.id === taskId ? { ...t, projectId: targetProjectId } : t
          )
        }));
      },

      reorderTasks: (newTasks) => {
        set({ tasks: newTasks });
      },

      unlockNode: (nodeId) => {
        const { skillNodes, skillEdges, stats } = get();
        const node = skillNodes.find(n => n.id === nodeId);
        if (!node || node.data.isUnlocked) return;

        // 1. Check Standard Unlock
        const parentEdges = skillEdges.filter(e => e.target === nodeId);
        let isStandardUnlockable = false;
        if (parentEdges.length === 0) isStandardUnlockable = true;
        else isStandardUnlockable = parentEdges.some(e => skillNodes.find(n => n.id === e.source)?.data.isUnlocked);

        // 2. Check Jump Unlock
        let isJumpUnlock = false;
        if (!isStandardUnlockable) {
          const parentIds = parentEdges.map(e => e.source);
          const grandParentEdges = skillEdges.filter(e => parentIds.includes(e.target));
          const isGrandParentUnlocked = grandParentEdges.some(e => skillNodes.find(n => n.id === e.source)?.data.isUnlocked);
          if (isGrandParentUnlocked) isJumpUnlock = true;
        }

        if (!isStandardUnlockable && !isJumpUnlock) return;

        // 3. Costs
        let costSP = node.data.cost;
        let costGems = 0;
        if (isJumpUnlock) {
          costSP += 1;
          costGems += 100; // Jump cost in Gems
        }

        if (stats.skillPoints < costSP || stats.gems < costGems) return;

        // 4. Unlock
        const newNodes = skillNodes.map(n => n.id === nodeId ? { ...n, data: { ...n.data, isUnlocked: true, unlockedAt: new Date().toISOString() } } : n);

        // --- MASTERY REWARD LOGIC ---
        // Map Node ID -> Avatar ID
        const REWARD_MAP: Record<string, string> = {
          'branch_1-10': 'avatar_scribe_master',
          'branch_2-10': 'avatar_master_blacksmith',
          'branch_3-10': 'avatar_master_bounty_hunter'
        };

        const rewardAvatarId = REWARD_MAP[nodeId];
        let newInventory = [...get().inventory];

        if (rewardAvatarId) {
          // Check if already owned (shouldn't be, but safety first)
          const alreadyOwned = newInventory.some(i => i.id === rewardAvatarId);
          if (!alreadyOwned) {
            const allItems = [...SHOP_ITEMS, ...ALL_COSMETIC_ITEMS];
            const rewardItem = allItems.find(i => i.id === rewardAvatarId);
            if (rewardItem) {
              newInventory.push({
                ...rewardItem,
                type: rewardItem.type as any,
                acquiredAt: new Date().toISOString(),
                quantity: 1
              } as any);
            }
          }
        }
        // -----------------------------

        set({
          skillNodes: newNodes,
          inventory: newInventory, // Save updated inventory
          stats: {
            ...stats,
            skillPoints: stats.skillPoints - costSP,
            gems: stats.gems - costGems
          },
          verificationNode: null // Cleanup just in case
        });
      },

      // Removed duplicate setAvatar
      setBackdrop: (backdropId) => set((state) => ({ stats: { ...state.stats, activeBackdropId: backdropId || undefined } })),

      confirmHonorPledge: () => {
        const { settings } = get();
        // If first time agreeing, trigger tutorial
        const shouldShowTutorial = !settings.hasSeenTutorial;

        set({
          settings: { ...settings, honorSystemAgreed: true },
          isTutorialActive: shouldShowTutorial
        });
      },

      setTutorialActive: (active: boolean) => {
        set({ isTutorialActive: active });
      },

      completeTutorial: () => {
        set((state) => ({
          isTutorialActive: false,
          settings: { ...state.settings, hasSeenTutorial: true }
        }));
      },




      setVitalityData: (data) => {
        set((state) => ({
          vitality: { ...state.vitality, ...data }
        }));
      },

      setHoveredNode: (node) => set({ hoveredNode: node }),



      resetEnergy: () => {
        const { stats } = get();
        let maxEnergy = stats.maxEnergy;

        // --- PERK INTEGRATION (Energy Max) ---
        if (stats.activeAvatarId) {
          const allItems = [...SHOP_ITEMS, ...ALL_COSMETIC_ITEMS];
          const avatarDef = allItems.find(i => i.id === stats.activeAvatarId);
          if (avatarDef && (avatarDef as any).perks?.energyMaxBonus) {
            maxEnergy += (avatarDef as any).perks.energyMaxBonus;
          }
        }
        // -------------------------------------

        set(state => ({
          stats: { ...state.stats, energy: maxEnergy }
        }));
      },

      updateSettings: (newSettings) => {
        set(state => ({
          settings: { ...state.settings, ...newSettings }
        }));
      },

      setMusicVolume: (volume: number) => {
        set(state => ({
          settings: { ...state.settings, musicVolume: volume }
        }));
      },

      toggleMusicMute: () => {
        set(state => ({
          settings: { ...state.settings, isMusicMuted: !state.settings.isMusicMuted }
        }));
      },

      toggleTheme: () => {
        set(state => {
          const newTheme = state.settings.theme === 'light' ? 'dark' : 'light';
          // Apply directly to DOM for instant feedback
          if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
          return { settings: { ...state.settings, theme: newTheme } };
        });
      },

      addTasks: (newTasks: Task[]) => {
        set((state) => {
          // Filter out duplicates based on ID
          const uniqueTasks = newTasks.filter(nt => !state.tasks.some(et => et.id === nt.id));
          if (uniqueTasks.length === 0) return {}; // No changes needed
          return { tasks: [...state.tasks, ...uniqueTasks] };
        });
      },

      addProjects: (newProjects) => {
        set((state) => {
          const uniqueProjects = newProjects.filter(np => !state.projects.some(ep => ep.id === np.id));
          if (uniqueProjects.length === 0) return {};
          return { projects: [...state.projects, ...uniqueProjects] };
        });
      },

      resetGame: () => {
        set({
          stats: INITIAL_STATS,
          settings: INITIAL_SETTINGS,
          projects: INITIAL_PROJECTS,
          tasks: INITIAL_TASKS,
          skillNodes: INITIAL_NODES,
          skillEdges: INITIAL_EDGES,
          hoveredNode: null,
        });
      },
      addRewards: (xpAmount, goldAmount) => {
        set((state) => {
          const { stats, activityLog } = state;

          let updatedLevel = stats.level;
          let updatedXp = stats.xp + xpAmount;
          let updatedXpToNext = stats.xpToNext;
          let skillPointsGained = 0;

          // Handle Level Up (recursive)
          while (updatedXp >= updatedXpToNext) {
            updatedXp -= updatedXpToNext;
            updatedLevel++;
            updatedXpToNext = calculateXpToNextLevel(updatedLevel);
            skillPointsGained++;
          }

          // Log Activity
          const today = new Date().toISOString().split('T')[0];
          let newActivityLog = [...(activityLog || [])];
          const existingLogIndex = newActivityLog.findIndex(l => l.date === today);
          if (existingLogIndex >= 0) {
            newActivityLog = newActivityLog.map((l, i) => i === existingLogIndex ? { ...l, xp: l.xp + xpAmount } : l);
          } else {
            newActivityLog.push({ date: today, xp: xpAmount });
          }

          return {
            stats: {
              ...stats,
              xp: updatedXp,
              gold: stats.gold + goldAmount,
              level: updatedLevel,
              xpToNext: updatedXpToNext,
              skillPoints: stats.skillPoints + skillPointsGained
            },
            activityLog: newActivityLog
          };
        });
      },

      deductCurrency: (amount, currency) => {
        set((state) => ({
          stats: {
            ...state.stats,
            gold: currency === 'gold' ? Math.max(0, state.stats.gold - amount) : state.stats.gold,
            gems: currency === 'gems' ? Math.max(0, state.stats.gems - amount) : state.stats.gems
          }
        }));
      },

    }),
    { name: 'life-rpg-storage', partialize: (state) => ({ ...state, hoveredNode: null }) }
  )
);
