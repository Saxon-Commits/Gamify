
export type QuestDifficulty = 'TRIVIAL' | 'EASY' | 'MEDIUM' | 'HARD' | 'EPIC';
export type TaskType = 'main' | 'side' | 'daily' | 'guild';

export interface Task {
  id: string;
  projectId?: string; // Optional for side/daily quests
  name: string;
  description?: string; // Added description
  type: TaskType;
  difficulty: QuestDifficulty;
  completed: boolean;
  xpReward: number;
  goldReward: number;
  energyCost: number;
  gems?: number; // Added Gems reward
  createdAt?: number; // Timestamp for Speed Run skill
  speedRunBonusClaimed?: boolean; // Prevent farming



  // Enhanced Bounty Fields
  frequency?: 'daily' | 'weekly' | 'monthly' | 'custom';
  kanbanStatus?: 'TODO' | 'IN_PROGRESS' | 'DONE'; // Separates view status from category (projectId)

  dueDate?: string;
  deadline?: string; // ISO String for hard cutoff

  subtasks?: {
    id: string;
    text: string;
    completed: boolean;
  }[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  difficulty: QuestDifficulty;
  completed: boolean;
  hp?: number;
  maxHp?: number;
  icon?: string; // Custom icon image path
  backgroundImage?: string; // For Foundations Carousel
  allowSubmissions?: boolean;
  submissionDeadline?: number;
  consolidateRewards?: boolean;
  rankedRewards?: {
    firstPlace: { xp: number, gold: number, gems?: number };
    secondPlace?: { xp: number, gold: number, gems?: number };
    thirdPlace?: { xp: number, gold: number, gems?: number };
  };
}

export type VerificationType = 'HONOR_SYSTEM' | 'INPUT_VALUE' | 'LINK_SUBMISSION';

export interface VerificationCriteria {
  min?: number;
  max?: number;
  regex?: string; // For linking specific domains
  required?: boolean;
}

export interface SkillNodeData {
  label: string;
  icon: string;
  cost: number;
  isUnlocked: boolean;
  path: 'body' | 'mind' | 'spirit' | 'core' | 'titan' | 'tycoon' | 'commander' | 'scholar' | 'technomancer' | 'hybrid';
  description: string;
  flavor?: string; // Added flavor text
  image?: string; // Added avatar image path
  branchColor?: string; // Added branch color
  type: 'minor' | 'major' | 'hybrid' | 'apex';
  requireAllParents?: boolean;
  // Verification Fields
  verificationType?: VerificationType; // Defaults to HONOR_SYSTEM if undefined
  verificationPrompt?: string;
  verificationCriteria?: VerificationCriteria;
  unlockEvidence?: string | number; // Store the proof provided
  unlockedAt?: string; // Date ISO string
}

export interface ActiveBuff {
  id: string;
  type: 'XP_BOOST' | 'ENERGY_REGEN';
  value: number;
  expiresAt: string; // ISO Date
}

export interface AvatarPerks {
  xpModifier?: number; // e.g. 0.1 for +10%
  goldModifier?: number;
  luckModifier?: number; // Flat add to % chance (e.g. 0.05 for +5%)
  shopDiscount?: number; // e.g. 0.05 for 5% off
  energyMaxBonus?: number;
}

export interface Stats {
  name: string;
  title: string;
  level: number;
  xp: number;
  xpToNext: number;
  gold: number;
  hp: number;
  maxHp: number;
  energy: number;
  maxEnergy: number;
  skillPoints: number;

  gems: number; // Premium Currency
  streak: number;
  totalWordsWritten?: number; // Legacy Skill Tracker
  dailyTaskCount?: number; // Track tasks committed today for Momentum
  lastDailyCheck?: string; // ISO Date for detecting new days
  monthlyStreakShieldUsed?: boolean; // Iron Will skill tracking
  lastStreakIncrement?: string; // ISO Date for daily streak increments
  lastRoyaltiesClaimed?: string; // For Royalties skill (Branch 1-5)

  intellect: number;
  strength: number;
  vigor: number;
  discipline: number;
  spirit: number;
  imageUrl?: string;
  activeAvatarId?: string; // New field

  activeArmorId?: string;    // Chestpiece/Armor
  activeHeadId?: string;     // Helmet/Mask
  activeAccessoryId?: string; // Wings/Boots/etc
  activeBackdropId?: string; // Background Theme/Video
  activeCompanionId?: string; // Companion
}

export interface GameSettings {
  musicVolume?: number;
  sfxVolume?: number; // Effect Volume
  isMusicMuted?: boolean;
  honorSystemAgreed?: boolean;
  hasSeenTutorial?: boolean;
  theme?: 'light' | 'dark';
}


export type AvatarRarity = 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'MYSTIC' | 'LEGENDARY';
export type EquipmentSlot = 'ARMOR' | 'ACCESSORY';

export interface InventoryItem {
  id: string;
  name: string;
  description?: string;
  lore?: string; // Added lore for detailed descriptions
  flavor?: string; // Added flavour text
  imageUrl?: string;
  type: 'REAL_LIFE' | 'IN_GAME' | 'SYSTEM' | 'BLACK_MARKET' | 'QUEST_ITEM' | 'AVATAR' | 'THEME' | 'COMPANION';
  cost?: number;
  currency?: 'GOLD' | 'GEMS' | 'VOID_SHARD'; // Default GOLD
  acquiredAt: string;
  quantity: number;
  perks?: AvatarPerks; // Added perks
  rarity?: AvatarRarity; // Added rarity
  slots?: EquipmentSlot[]; // Added slots
  realMoneyPrice?: number; // Removed in favor of Gems
  premiumPrice?: number; // Cost in Gems
  videoUrl?: string; // For animated backdrops
}

export interface GameState {
  stats: Stats;
  settings: GameSettings;
  projects: Project[];
  tasks: Task[];
  skillNodes: any[];
  skillEdges: any[];
  inventory: InventoryItem[];
  cart: InventoryItem[];
  activeBuffs: ActiveBuff[];
  hoveredNode: any | null;
  verificationNode?: any | null;
  isTutorialActive: boolean;

  mostWantedTaskId?: string; // ID of the task designated as Most Wanted (reset daily)
  setMostWantedTask: (taskId: string) => void;
  checkDailyReset: () => void;
  incrementStreak: () => void;
  resetStreak: () => void;

  completeTask: (taskId: string) => void;
  completeProject: (projectId: string) => void;
  unlockNode: (nodeId: string) => void;
  addRewards: (xp: number, gold: number) => void;
  addResources: (resources: { gold?: number; gems?: number; xp?: number; skillPoints?: number }) => void;
  addGold: (amount: number) => void;
  addGems: (amount: number) => void;
  deductCurrency: (amount: number, currency: 'gold' | 'gems') => void;
  setAvatar: (avatarId: string) => void;
  setBackdrop: (backdropId: string | null) => void;
  equipItem: (slot: 'mainHand' | 'armor' | 'head' | 'accessory', itemId: string | null) => void;

  setHoveredNode: (node: any | null) => void;
  setVerificationNode?: (node: any | null) => void;

  resetEnergy: () => void;
  updateSettings: (settings: Partial<GameSettings>) => void;
  setName: (name: string) => void;
  setMusicVolume: (volume: number) => void;
  toggleMusicMute: () => void;
  setSfxVolume: (volume: number) => void;
  toggleTheme: () => void;
  addTasks: (newTasks: Task[]) => void;
  createTask: (task: Omit<Task, 'id' | 'completed'>) => void;
  deleteTask: (taskId: string) => void;
  moveTask: (taskId: string, targetProjectId: string) => void;
  reorderTasks: (newTasks: Task[]) => void;
  updateTask: (task: Task) => void;
  addProjects: (newProjects: Project[]) => void;

  buyItem: (item: any) => boolean;
  addToCart: (item: InventoryItem) => void;
  removeFromCart: (itemId: string) => void;
  purchaseCart: () => boolean;
  addItem: (itemId: string, quantity?: number) => void;
  // removeItem: (itemId: string) => void; // Potential future need


  purchaseHistory: { itemId: string; timestamp: string }[];
  taskCompletionHistory?: number[]; // Timestamps of accumulated task completions (for Haste skill)


  confirmHonorPledge: () => void;
  resetGame: () => void;
  resetTaskHistory: () => void; // New Dev Tool
  resetLevel: () => void;
  resetResources: () => void;
  dev_forceDailyReset: () => void;
  dev_timeTravel: () => void;
  dev_gainLevel: () => void;


  // Tutorial System
  setTutorialActive: (active: boolean) => void;
  completeTutorial: () => void;

  // Journal
  journalEntries: JournalEntry[];
  addJournalEntry: (entry: Omit<JournalEntry, 'id' | 'date'>) => void;
  deleteJournalEntry: (id: string) => void;
  deleteJournalEntries: (ids: string[]) => void;
  updateJournalEntry: (entry: JournalEntry) => void;

  // UI State
  isSidePanelOpen: boolean;
  setSidePanelOpen: (isOpen: boolean) => void;
  syncSkillTree: () => void;
  resetSkills: () => void;

  // Mastery Unlock
  masteryUnlock: { avatarId: string; title: string; flavor: string } | null;
  closeMasteryUnlock: () => void;
}

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  date: string;
  tags: string[];
  folder: 'Journal' | 'Grindstone Log';
}
