
export type QuestDifficulty = 'TRIVIAL' | 'EASY' | 'MEDIUM' | 'HARD' | 'EPIC';
export type TaskType = 'main' | 'side' | 'daily';

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

  dueDate?: string;
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
  intellect: number;
  strength: number;
  vigor: number;
  discipline: number;
  spirit: number;
  imageUrl?: string;
  activeAvatarId?: string; // New field
  activeMainHandId?: string; // Weapon
  activeArmorId?: string;    // Chestpiece/Armor
  activeHeadId?: string;     // Helmet/Mask
  activeAccessoryId?: string; // Wings/Boots/etc
  activeBackdropId?: string; // Background Theme/Video
}

export interface GameSettings {
  musicVolume?: number;
  isMusicMuted?: boolean;
  honorSystemAgreed?: boolean;
  hasSeenTutorial?: boolean;
  theme?: 'light' | 'dark';
}

export interface VitalityData {
  activityLevel: string;
  fitnessGoal: string;
  customFitnessGoal: string;
  stepGoal: string;
  stretchCommitment: boolean;
  nutritionGoal?: string;
}

export type AvatarRarity = 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'MYSTIC' | 'LEGENDARY';
export type EquipmentSlot = 'WEAPON' | 'ARMOR' | 'ACCESSORY';

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
  vitality: VitalityData;
  isTutorialActive: boolean;

  completeTask: (taskId: string) => void;
  completeProject: (projectId: string) => void;
  unlockNode: (nodeId: string) => void;
  addRewards: (xp: number, gold: number) => void;
  setAvatar: (avatarId: string) => void;
  setBackdrop: (backdropId: string | null) => void;
  equipItem: (slot: 'mainHand' | 'armor' | 'head' | 'accessory', itemId: string | null) => void;
  useItem: (itemId: string) => { success: boolean; message: string };

  setVitalityData: (data: Partial<VitalityData>) => void;
  setHoveredNode: (node: any | null) => void;
  setVerificationNode?: (node: any | null) => void;

  resetEnergy: () => void;
  updateSettings: (settings: Partial<GameSettings>) => void;
  setMusicVolume: (volume: number) => void;
  toggleMusicMute: () => void;
  toggleTheme: () => void;
  addTasks: (newTasks: Task[]) => void;
  createTask: (task: Omit<Task, 'id' | 'completed'>) => void;
  deleteTask: (taskId: string) => void;
  moveTask: (taskId: string, targetProjectId: string) => void;
  reorderTasks: (newTasks: Task[]) => void;
  addProjects: (newProjects: Project[]) => void;

  buyItem: (item: any) => boolean;
  addToCart: (item: InventoryItem) => void;
  removeFromCart: (itemId: string) => void;
  purchaseCart: () => boolean;
  addItem: (itemId: string, quantity?: number) => void;
  // removeItem: (itemId: string) => void; // Potential future need

  purchaseHistory: { itemId: string; timestamp: string }[];
  activityLog: { date: string; xp: number }[]; // For Heatmap


  confirmHonorPledge: () => void;
  resetGame: () => void;

  // Tutorial System
  setTutorialActive: (active: boolean) => void;
  completeTutorial: () => void;

  // Journal
  journalEntries: JournalEntry[];
  addJournalEntry: (entry: Omit<JournalEntry, 'id' | 'date'>) => void;
  deleteJournalEntry: (id: string) => void;
  updateJournalEntry: (entry: JournalEntry) => void;

  // Notes System
  notesContent: string;
  isNotesOpen: boolean;
  toggleNotes: (isOpen?: boolean) => void;
  setNotesContent: (content: string) => void;
}

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  date: string;
  tags: string[];
  folder: 'Journal' | 'Mind Wipes' | 'Grindstone Log';
}
