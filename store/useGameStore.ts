import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { get, set, del } from 'idb-keyval';
import { GameState, JournalEntry, Stats, GameSettings, Project, QuestDifficulty, Task, InventoryItem, ActiveBuff } from '../types';
import { calculateXpToNextLevel, calculateTotalXpForLevel } from '../src/utils/gameLogic';
import { calculateRewards, calculateGambitChance, SHOP_ITEMS } from '../src/utils/GameEconomy';
import { ALL_COSMETIC_ITEMS } from '../src/utils/CosmeticsData';
import { useToastStore } from './useToastStore';

const INITIAL_STATS: Stats = {
  name: "Adventurer",
  title: "Aspirant",
  level: 1,
  xp: 0,
  xpToNext: calculateXpToNextLevel(1),
  gold: 0,
  hp: 100,
  maxHp: 100,
  energy: 100,
  maxEnergy: 100,
  skillPoints: 0,

  gems: 0,
  streak: 0,
  intellect: 1,
  strength: 1,
  vigor: 1,
  discipline: 1,
  spirit: 1,
};

// ... existing code ...


const INITIAL_SETTINGS: GameSettings = {
  musicVolume: 0.4,
  sfxVolume: 0.4,
  isMusicMuted: false,
  honorSystemAgreed: false,
  hasSeenTutorial: false,
  theme: 'dark'
};

import { generateSkillTree } from '../src/utils/SkillTreeUtils';

const { nodes: INITIAL_NODES, edges: INITIAL_EDGES } = generateSkillTree();

export const INITIAL_PROJECTS: Project[] = [
  { id: 'col-todo', name: 'To-Do', description: 'General Tasks.', completed: false, difficulty: 'EASY', hp: 500, maxHp: 500, icon: '/images/ui/heart_icon.png', backgroundImage: '/backgrounds/vitality_bg.png' },
  { id: 'col-habit', name: 'Habits', description: 'Daily Routines.', completed: false, difficulty: 'EASY', hp: 100, maxHp: 100, backgroundImage: '/backgrounds/vault_bg.png' },

  // Guild Column (Pseudo-Project)
  { id: 'col-guild', name: "Guild", description: 'Community Tasks.', completed: false, difficulty: 'EASY', hp: 100, maxHp: 100, backgroundImage: '/backgrounds/castle_bg.png' },

  // --- TYCOON PATHWAY PROJECTS (Legacy/Active) ---
  { id: 'p-tycoon-3', name: 'Iron Reserve', description: 'Safety Net.', completed: false, difficulty: 'MEDIUM', hp: 300, maxHp: 300 },
  { id: 'p-tycoon-s1', name: 'Credit Hacker', description: 'Leveraging Score.', completed: false, difficulty: 'EASY', hp: 100, maxHp: 100 },
  // 3: Most Wanted (Bounty Hunter)
  // Designate 1 Task as "Most Wanted". +10% XP for 24h on completion.
  { id: 'p-most-wanted', name: 'Most Wanted', description: 'Designate 1 Task as "Most Wanted". +10% XP for 24h on completion.', completed: false, difficulty: 'EASY', hp: 100, maxHp: 100 },
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
  { id: 't-1', projectId: 'col-todo', name: 'Track calories for 7 days', completed: false, xpReward: 200, goldReward: 50, energyCost: 10, type: 'main', difficulty: 'MEDIUM' },
  { id: 't-2', projectId: 'col-todo', name: 'Drink 3L water daily (streak 1/3)', completed: false, xpReward: 100, goldReward: 20, energyCost: 5, type: 'main', difficulty: 'EASY' },
  { id: 't-3', projectId: 'col-habit', name: 'Setup budget in Notion/Excel', completed: false, xpReward: 150, goldReward: 30, energyCost: 15, type: 'main', difficulty: 'MEDIUM' },
  { id: 't-4', projectId: 'col-habit', name: 'Identify 3 unnecessary subscriptions', completed: false, xpReward: 50, goldReward: 100, energyCost: 5, type: 'main', difficulty: 'EASY' },
  // Removed static tech tasks


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
      masteryUnlock: null,
      settings: INITIAL_SETTINGS,
      projects: INITIAL_PROJECTS,
      tasks: INITIAL_TASKS,
      skillNodes: INITIAL_NODES,
      skillEdges: INITIAL_EDGES,
      isTutorialActive: false,
      isSidePanelOpen: false,
      journalEntries: [],
      taskCompletionHistory: [],
      mostWantedTaskId: undefined,

      setMostWantedTask: (taskId) => set({ mostWantedTaskId: taskId }),

      addJournalEntry: (entry) => {
        const state = get();
        const newEntry: JournalEntry = {
          ...entry,
          id: Math.random().toString(36).substring(2, 9),
          date: new Date().toISOString()
        };

        // Count Words for Legacy Skill
        const wordCount = entry.content ? entry.content.trim().split(/\s+/).length : 0;
        const currentTotalWords = state.stats.totalWordsWritten || 0;
        const newTotalWords = currentTotalWords + wordCount;

        set((s) => ({
          journalEntries: [newEntry, ...s.journalEntries],
          stats: { ...s.stats, totalWordsWritten: newTotalWords }
        }));

        // Check for exclusions (No rewards for auto-logs)
        const isExcluded = entry.folder === 'Grindstone Log' || (entry.tags && entry.tags.includes('Quick Log'));
        if (isExcluded) return;

        // --- CLARITY SKILL NODE (branch_1-1 & branch_1-4) ---
        // Clarity I: +5% XP
        // Clarity II: +10% XP (Overrides Clarity I)
        let xpReward = 50;

        const clarityNode = state.skillNodes.find(n => n.id === 'branch_1-1');
        const clarityIINode = state.skillNodes.find(n => n.id === 'branch_1-4');

        if (clarityIINode?.data.isUnlocked) {
          xpReward = Math.round(xpReward * 1.10); // +10%
        } else if (clarityNode?.data.isUnlocked) {
          xpReward = Math.round(xpReward * 1.05); // +5%
        }

        // --- MEMORY SKILL NODE (branch_1-2 & branch_1-5) ---
        // Memory I: +10% Chance (20-50 Gold)
        // Memory II: +15% Chance (Overrides Memory I)
        const memoryNode = state.skillNodes.find(n => n.id === 'branch_1-2');
        const memoryIINode = state.skillNodes.find(n => n.id === 'branch_1-5');
        let goldReward = 0;

        let chance = 0;
        if (memoryIINode?.data.isUnlocked) chance = 0.15;
        else if (memoryNode?.data.isUnlocked) chance = 0.10;

        if (chance > 0 && Math.random() < chance) {
          const foundGold = Math.floor(Math.random() * (200 - 90 + 1)) + 90; // 90-200 Gold
          goldReward += foundGold;
          useToastStore.getState().addToast({ type: 'gold', amount: foundGold, message: 'Memory: Recalled a hidden stash!' });
        }

        // --- ROYALTIES SKILL NODE (branch_1-8) ---
        // Earn 2% Interest on Gold (Max 500g) upon first daily journal entry.
        const royaltiesNode = state.skillNodes.find(n => n.id === 'branch_1-8');
        const today = new Date().toISOString().split('T')[0];

        if (royaltiesNode?.data.isUnlocked && state.stats.lastRoyaltiesClaimed !== today) {
          const interest = Math.min(Math.floor(state.stats.gold * 0.02), 500);
          if (interest > 0) {
            goldReward += interest;
            useToastStore.getState().addToast({ type: 'gold', amount: interest, message: 'Royalties: Daily Interest Paid' });
            // Update Claimed Date
            set(s => ({ stats: { ...s.stats, lastRoyaltiesClaimed: today } }));
          }
        }

        // --- GOLDEN INK SKILL NODE (branch_1-7) ---
        // 5% Chance to find Realm Shards (1-3)
        const goldenNode = state.skillNodes.find(n => n.id === 'branch_1-7');
        let skillPointsGained = 0;
        if (goldenNode?.data.isUnlocked) {
          if (Math.random() < 0.05) { // 5% Chance
            skillPointsGained = Math.floor(Math.random() * 3) + 1; // 1-3 SP
            setTimeout(() => {
              useToastStore.getState().addToast({ type: 'skillPoints', amount: skillPointsGained, message: `Golden Ink: Realm Shards Found!` });
            }, 1800); // 1.8s Delay (After XP & Gold)
          }
        }

        // Award XP & SP
        state.addRewards(xpReward, goldReward);
        if (skillPointsGained > 0) {
          set((s) => ({ stats: { ...s.stats, skillPoints: s.stats.skillPoints + skillPointsGained } }));
        }
      },

      setSidePanelOpen: (isOpen) => set({ isSidePanelOpen: isOpen }),

      closeMasteryUnlock: () => set({ masteryUnlock: null }),

      syncSkillTree: () => {
        const { nodes: freshNodes } = generateSkillTree();
        const storedNodes = get().skillNodes;

        const mergedNodes = freshNodes.map(freshNode => {
          const storedNode = storedNodes.find(n => n.id === freshNode.id);
          if (storedNode) {
            return {
              ...freshNode,
              data: {
                ...freshNode.data,
                isUnlocked: storedNode.data.isUnlocked,
              }
            };
          }
          return freshNode;
        });

        set({ skillNodes: mergedNodes });
      },

      resetSkills: () => {
        const { nodes, edges } = generateSkillTree();
        set({ skillNodes: nodes, skillEdges: edges });
        useToastStore.getState().addToast({ type: 'success', amount: 0, message: 'Skill Tree Reset!' });
      },

      incrementStreak: () => {
        const { stats } = get();
        const today = new Date().toISOString().split('T')[0];

        if (stats.lastStreakIncrement !== today) {
          set({
            stats: {
              ...stats,
              streak: stats.streak + 1,
              lastStreakIncrement: today
            }
          });
          useToastStore.getState().addToast({ type: 'success', amount: 0, message: 'Daily Streak Increased!', icon: 'Flame' });
        }
      },

      resetStreak: () => {
        set((state) => ({
          stats: {
            ...state.stats,
            streak: 0,
            lastStreakIncrement: undefined
          }
        }));
        useToastStore.getState().addToast({ type: 'success', amount: 0, message: 'Streak Reset to 0' });
      },

      resetLevel: () => {
        set((state) => ({
          stats: {
            ...state.stats,
            level: 1,
            xp: 0,
            xpToNext: calculateXpToNextLevel(1)
          }
        }));
        useToastStore.getState().addToast({ type: 'success', amount: 0, message: 'Level Reset to 1' });
      },

      resetResources: () => {
        set((state) => ({
          stats: {
            ...state.stats,
            gold: 0,
            gems: 0,
            skillPoints: 0
          }
        }));
        useToastStore.getState().addToast({ type: 'success', amount: 0, message: 'Resources Wiped' });
      },

      dev_forceDailyReset: () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        set((state) => ({
          stats: {
            ...state.stats,
            lastDailyCheck: yesterdayStr, // "Tricks" the engine
            // lastStreakIncrement: yesterdayStr, // User requested checking for breaks, so maybe don't reset this?
            // Actually, if we set this to yesterday, incrementStreak() will allow a new increment today.
            lastStreakIncrement: yesterdayStr,
            lastRoyaltiesClaimed: undefined,
            dailyTaskCount: 0
          },
          mostWantedTaskId: undefined, // Reset Most Wanted
          tasks: state.tasks.map(t => t.type === 'daily' ? { ...t, completed: false } : t)
        }));

        // Trigger the check immediately to simulate "Clock Striking Midnight"
        get().checkDailyReset();
        useToastStore.getState().addToast({ type: 'system', amount: 0, message: 'Time God: Day Reset!', icon: 'Clock' });
      },

      dev_timeTravel: () => {
        // Move Last Daily Check back 1 day
        // Move Last Streak Increment back 1 day
        // This makes "Today" feel like "Tomorrow" relative to those dates.
        const { stats } = get();
        const moveDateBack = (dateStr?: string) => {
          if (!dateStr) return undefined;
          const d = new Date(dateStr);
          d.setDate(d.getDate() - 1);
          return d.toISOString().split('T')[0];
        };

        set({
          stats: {
            ...stats,
            lastDailyCheck: moveDateBack(stats.lastDailyCheck),
            lastStreakIncrement: moveDateBack(stats.lastStreakIncrement),
            lastRoyaltiesClaimed: moveDateBack(stats.lastRoyaltiesClaimed)
          }
        });
        useToastStore.getState().addToast({ type: 'system', amount: 0, message: 'Time Travel: +1 Day', icon: 'FastForward' });
      },

      dev_gainLevel: () => {
        const { stats, addRewards } = get();
        const xpNeeded = stats.xpToNext - stats.xp;
        // Add exact amount to reach next level
        addRewards(xpNeeded, 0);
        useToastStore.getState().addToast({ type: 'xp', amount: xpNeeded, message: 'Dev: Level Up Triggered!' });
      },

      checkDailyReset: () => {
        const { stats, skillNodes } = get();
        const today = new Date().toISOString().split('T')[0];
        const lastCheck = stats.lastDailyCheck;

        // If never checked, just set it
        if (!lastCheck) {
          set((state) => ({ stats: { ...state.stats, lastDailyCheck: today, dailyTaskCount: 0 } }));
          return;
        }

        if (today === lastCheck) return; // Already checked today

        // Calculate days difference
        const oneDay = 24 * 60 * 60 * 1000;
        const diffDays = Math.round(Math.abs((new Date(today).getTime() - new Date(lastCheck).getTime()) / oneDay));

        let newStreak = stats.streak;
        let shieldUsed = stats.monthlyStreakShieldUsed;

        // Reset Shield if new month
        if (new Date(today).getMonth() !== new Date(lastCheck).getMonth()) {
          shieldUsed = false;
        }

        // --- IRON WILL SKILL NODE (branch_2-5) ---
        // Streak Shield: First missed day of month doesn't reset streak.
        if (diffDays > 1) { // Missed at least one day
          const ironWillNode = skillNodes.find(n => n.id === 'branch_2-5');

          if (ironWillNode?.data.isUnlocked && !shieldUsed) {
            // SAVE STREAK
            shieldUsed = true;
            useToastStore.getState().addToast({ type: 'success', amount: 0, message: 'Iron Will: Streak Saved!', icon: 'Shield' });
          } else {
            // RESET STREAK
            newStreak = 0;
            if (stats.streak > 0) {
              useToastStore.getState().addToast({ type: 'success', amount: 0, message: 'Streak Lost!', icon: 'Frown' });
            }
          }
        }

        // Check Momentum (if not checked today, we assume checks are done on events, but this is just reset)
        // Resetting daily trackers? useGameStore doesn't track daily trackers explicitly besides quests status.
        // We might want to reset daily quests here too? Or do they reset elsewhere?
        // Assuming Task.type === 'daily' logic is handled elsewhere or manual reset?
        // Let's stick to streak logic 

        set((state) => ({
          stats: {
            ...state.stats,
            lastDailyCheck: today,
            streak: newStreak,
            monthlyStreakShieldUsed: shieldUsed,
            dailyTaskCount: 0 // Reset daily task count
          },
          // Should we reset daily quests here?
          tasks: state.tasks.map(t => t.type === 'daily' ? { ...t, completed: false } : t)
        }));
      },

      deleteJournalEntry: (id) => {
        set((state) => ({
          journalEntries: state.journalEntries.filter(e => e.id !== id)
        }));
      },

      deleteJournalEntries: (ids) => {
        set((state) => ({
          journalEntries: state.journalEntries.filter(e => !ids.includes(e.id))
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

            case 'armor': newStats.activeArmorId = itemId || undefined; break;
            case 'head': newStats.activeHeadId = itemId || undefined; break;
            case 'accessory': newStats.activeAccessoryId = itemId || undefined; break;
          }
          return { stats: newStats };
        });
      },


      completeTask: (taskId) => {
        const { tasks, stats, inventory } = get();
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
        let { gold, sp } = calculateRewards(task.difficulty, false, activePerks);

        // --- GREED I SKILL NODE (branch_3-1) ---
        // +5% Gold from all Tasks
        // --- GREED I & II SKILL NODES (branch_3-1, branch_3-8) ---
        // I: +5% Gold, II: +10% Gold (Stacking? Or Override? Description says "+10%". Usually tiers stack or replace. Let's make II add +10% effectively making it +15% total if both? Or 10% total?
        // Let's assume Stacking for "RPG feel" or Replacement for "Upgrade feel".
        // Let's do Replacement/Upgrade logic: If II is unlocked, use 10%. If I, use 5%.
        const greedNode = get().skillNodes.find(n => n.id === 'branch_3-1');
        const greedIINode = get().skillNodes.find(n => n.id === 'branch_3-8');

        if (greedIINode?.data.isUnlocked) {
          gold = Math.round(gold * 1.10);
        } else if (greedNode?.data.isUnlocked) {
          gold = Math.round(gold * 1.05);
        }

        // --- STREAK ECONOMY SKILL NODE (branch_3-7) ---
        // +1% Gold Gen per streak day (Max 20%)
        const streakNode = get().skillNodes.find(n => n.id === 'branch_3-7');
        if (streakNode?.data.isUnlocked && stats.streak > 0) {
          const bonusPercent = Math.min(stats.streak * 0.01, 0.20); // Cap at 20%
          gold = Math.round(gold * (1 + bonusPercent));
        }

        // --- SPEED RUN SKILL NODE (branch_3-5) ---
        // Double Gold if completed within 30m of creation
        let speedRunBonusApplied = false;
        const speedRunNode = get().skillNodes.find(n => n.id === 'branch_3-5');
        if (speedRunNode?.data.isUnlocked && task.createdAt && !task.speedRunBonusClaimed) {
          const timeDiff = Date.now() - task.createdAt;
          const THIRTY_MINUTES = 30 * 60 * 1000;
          if (timeDiff <= THIRTY_MINUTES) {
            gold *= 2;
            speedRunBonusApplied = true;
            useToastStore.getState().addToast({ type: 'gold', amount: 0, message: 'Speed Run: Double Gold!' });
          }
        }

        let updatedLevel = stats.level;

        // XP Calculation with Perks
        let xpGained = task.xpReward;
        if (activePerks?.xpModifier) {
          xpGained = Math.round(xpGained * (1 + activePerks.xpModifier));
        }

        // --- SLAG SIFTING SKILL NODE (branch_2-8) ---
        // +1% XP per Account Level
        const slagNode = get().skillNodes.find(n => n.id === 'branch_2-8');
        if (slagNode?.data.isUnlocked) {
          const levelBonus = stats.level * 0.01;
          xpGained = Math.round(xpGained * (1 + levelBonus));
        }

        // --- LEGACY SKILL NODE (branch_1-9) ---
        // +1% XP per 10,000 words written (Max +20%)
        const legacyNode = get().skillNodes.find(n => n.id === 'branch_1-9');
        if (legacyNode?.data.isUnlocked && stats.totalWordsWritten) {
          const chunks = Math.floor(stats.totalWordsWritten / 10000);
          const legacyBonus = Math.min(chunks * 0.01, 0.20); // Max 20%
          if (legacyBonus > 0) {
            xpGained = Math.round(xpGained * (1 + legacyBonus));
          }
        }

        // --- HASTE SKILL NODE (branch_3-2) ---
        // Combo Meter: 3 Tasks in 1 hour grants +20 XP
        // Logic: Add current timestamp, filter list for last 1h, check count
        const hasteNode = get().skillNodes.find(n => n.id === 'branch_3-2');
        let newTaskHistory = [...(get().taskCompletionHistory || [])];
        const now = Date.now();
        newTaskHistory.push(now);

        // Filter: Keep only timestamps within last 60 minutes
        const ONE_HOUR = 60 * 60 * 1000;
        newTaskHistory = newTaskHistory.filter(t => now - t <= ONE_HOUR);

        if (hasteNode?.data.isUnlocked && newTaskHistory.length >= 3) {
          xpGained += 20;
          useToastStore.getState().addToast({ type: 'xp', amount: 20, message: 'Haste Bonus: 3x Combo!' });
          // Consume the 3 timestamps to prevent spam (Combo Reset)
          // We keep the most recent ones MINUS 3? No, we just emptied the "meter".
          // Actually, if we have 4, and consume 3, we have 1 left.
          // But strict "3 in 1 hour" usually matches sets of 3.
          // Let's remove the OLDEST 3 that form the combo? Or the NEWEST?
          // If we remove the ones that triggered it, we should remove the 3 that are in the window.
          // Since we just filtered `newTaskHistory` to be in the window, we can just splice.
          // Removing the OLDEST 3 makes sense for a "sliding window" consumption?
          // Actually, let's just clear the history for simplicity and impactful "Combo Reset".
          newTaskHistory = [];
        }

        // --- MOST WANTED SKILL NODE (branch_3-3) ---
        // Designate 1 Task as "Most Wanted". +10% XP for 24h on completion.
        if (get().mostWantedTaskId === taskId) {
          const buff: ActiveBuff = {
            id: `buff - wanted - ${Date.now()} `,
            type: 'XP_BOOST',
            value: 0.1, // +10%
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
          };

          set((s) => ({ activeBuffs: [...s.activeBuffs, buff], mostWantedTaskId: undefined }));
          useToastStore.getState().addToast({ type: 'xp', amount: 0, message: 'Bounty Collected! +10% XP Buff (24h)' });
        }

        // --- MOMENTUM SKILL NODE (branch_3-4) ---
        // First Task completed each day grants +50% XP.
        const momentumNode = get().skillNodes.find(n => n.id === 'branch_3-4');
        if (momentumNode?.data.isUnlocked) {
          // Check if dailyTaskCount is 0 or undefined
          if (!stats.dailyTaskCount || stats.dailyTaskCount === 0) {
            const momentumBonus = Math.round(task.xpReward * 0.5);
            xpGained += momentumBonus;
            useToastStore.getState().addToast({ type: 'xp', amount: momentumBonus, message: 'Momentum: First Blood! (+50% XP)' });
          }
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


        // Trigger Toasts (Staggered)
        const { addToast } = useToastStore.getState();
        if (xpGained > 0) addToast({ type: 'xp', amount: xpGained, message: 'XP Gained' });

        if (gold > 0) {
          setTimeout(() => {
            addToast({ type: 'gold', amount: gold, message: 'Gold Earned' });
          }, 900); // 900ms Delay
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
            // Streak handled via incrementStreak call below
            dailyTaskCount: (stats.dailyTaskCount || 0) + 1
          },
          tasks: tasks.map(t => t.id === taskId ? { ...t, completed: true, speedRunBonusClaimed: t.speedRunBonusClaimed || speedRunBonusApplied } : t),
          taskCompletionHistory: newTaskHistory
        });

        // Trigger Streak Increment (Daily Check)
        get().incrementStreak();
      },

      completeProject: (projectId) => {
        const { projects, stats } = get();

        // Toast
        const { addToast } = useToastStore.getState();
        addToast({ type: 'gold', amount: 500, message: 'Project Complete' });
        addToast({ type: 'gems', amount: 2, message: 'Realm Shards' });


        // Projects fixed reward: 2 SP, 500 Gold
        set({
          projects: projects.map(p => p.id === projectId ? { ...p, completed: true } : p),
          stats: {
            ...stats,
            skillPoints: stats.skillPoints + 2,
            gold: stats.gold + 500
          }
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

        // --- CASHBACK (Dealer's Choice, Branch 3-9) ---
        // 10% Chance for Full Refund on Gold Purchases
        const dealerNode = get().skillNodes.find(n => n.id === 'branch_3-9');
        if (!isPremium && dealerNode?.data.isUnlocked && Math.random() < 0.10) {
          finalCost = 0;
          useToastStore.getState().addToast({ type: 'gold', amount: cost, message: 'Dealer\'s Choice: Full Refund!' });
        }

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
            return sum + (cost * item.quantity);
          }, 0);

        // --- CASHBACK (Dealer's Choice, Branch 3-9) ---
        // 10% Chance for Full Cart Refund
        const dealerNode = get().skillNodes.find(n => n.id === 'branch_3-9');
        let finalTotalGold = totalGold;
        if (totalGold > 0 && dealerNode?.data.isUnlocked && Math.random() < 0.10) {
          finalTotalGold = 0;
          useToastStore.getState().addToast({ type: 'gold', amount: totalGold, message: 'Dealer\'s Choice: Cart Refunded!' });
        }



        if (stats.gold >= finalTotalGold) {
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
              gold: stats.gold - finalTotalGold,
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

        // Toast
        const { addToast } = useToastStore.getState();
        addToast({ type: 'item', amount: quantity, message: itemDef.name, icon: itemDef.imageUrl });

        set({ inventory: newInventory });
      },

      // --- CUSTOM TASKS & DND ---
      createTask: (task) => {
        set((state) => ({
          tasks: [...state.tasks, { ...task, id: `t-custom-${crypto.randomUUID()}`, completed: false, createdAt: Date.now() }]
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

      updateTask: (updatedTask) => {
        set((state) => ({
          tasks: state.tasks.map(t => t.id === updatedTask.id ? updatedTask : t)
        }));
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
        // Grant Avatars upon unlocking Level 10 nodes
        if (nodeId === 'branch_1-10') {
          setTimeout(() => get().addItem('avatar_scribe_master', 1), 500);
          set({ masteryUnlock: { avatarId: 'avatar_scribe_master', title: 'Scribe Master', flavor: 'The pen is mightier than the sword, and you wield it with absolute dominion.' } });
        } else if (nodeId === 'branch_2-10') {
          setTimeout(() => get().addItem('master_blacksmith', 1), 500);
          set({ masteryUnlock: { avatarId: 'avatar_master_blacksmith', title: 'Master Blacksmith', flavor: 'You have forged yourself in the fires of discipline. You are unbreakable.' } });
        } else if (nodeId === 'branch_3-10') {
          setTimeout(() => get().addItem('master_bounty_hunter', 1), 500);
          set({ masteryUnlock: { avatarId: 'avatar_master_bounty_hunter', title: 'Master Bounty Hunter', flavor: 'No target escapes your sight. The world is your hunting ground.' } });
        }

        set((state) => ({
          skillNodes: newNodes,
          stats: {
            ...state.stats,
            skillPoints: state.stats.skillPoints - costSP,
            gems: state.stats.gems - costGems
          }
        }));
        // -----------------------------

        set({
          skillNodes: newNodes,
          // inventory: newInventory, // Save updated inventory (Handled by addItem via setTimeout)
          stats: {
            ...stats,
            skillPoints: stats.skillPoints - costSP,
            gems: stats.gems - costGems
          },
          verificationNode: null // Cleanup just in case
        });

        // Play Unlock Sound (Non-Mastery)
        if (!['branch_1-10', 'branch_2-10', 'branch_3-10'].includes(nodeId)) {
          const audio = new Audio('/audio/unlock_node.wav');
          audio.volume = get().settings.sfxVolume ?? 0.5;
          audio.play().catch(e => console.error("Audio play failed", e));
        }
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

      setName: (name: string) => {
        set(state => ({
          stats: { ...state.stats, name }
        }))
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

      setSfxVolume: (volume: number) => {
        set(state => ({
          settings: { ...state.settings, sfxVolume: volume }
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

      resetTaskHistory: () => {
        set({ taskCompletionHistory: [] });
        useToastStore.getState().addToast({ type: 'system', amount: 0, message: 'Daily Task History Reset' });
      },

      addRewards: (xpAmount, goldAmount) => {
        // Trigger Toasts
        const { addToast } = useToastStore.getState();
        if (xpAmount > 0) addToast({ type: 'xp', amount: xpAmount, message: 'XP Gained' });
        if (goldAmount > 0) {
          setTimeout(() => {
            addToast({ type: 'gold', amount: goldAmount, message: 'Gold Earned' });
          }, 900);
        }

        set((state) => {
          const { stats } = state;

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


          return {
            stats: {
              ...stats,
              xp: updatedXp,
              gold: stats.gold + goldAmount,
              level: updatedLevel,
              xpToNext: updatedXpToNext,
              skillPoints: stats.skillPoints + skillPointsGained
            }
          };
        });
      },

      addResources: ({ gold = 0, gems = 0, xp = 0, skillPoints = 0 }) => {
        if (xp > 0 || gold > 0) {
          get().addRewards(xp, gold);
        }

        if (gems > 0) {
          get().addGems(gems);
          useToastStore.getState().addToast({ type: 'gems', amount: gems, message: 'Gems Received' });
        }

        if (skillPoints > 0) {
          set(state => ({ stats: { ...state.stats, skillPoints: state.stats.skillPoints + skillPoints } }));
          useToastStore.getState().addToast({ type: 'skillPoints', amount: skillPoints, message: 'Skill Points Received' });
        }
      },

      addGold: (amount) => {
        set(state => ({ stats: { ...state.stats, gold: state.stats.gold + amount } }));
      },

      addGems: (amount) => {
        set(state => ({ stats: { ...state.stats, gems: state.stats.gems + amount } }));
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
