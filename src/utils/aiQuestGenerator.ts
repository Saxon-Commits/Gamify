import { Task, QuestDifficulty } from '../../types';
import { QUEST_REWARDS } from './gameLogic';
import { useGameStore } from '../../store/useGameStore';

const TITLES = [
    "Rogue Signal", "Glitch Hunt", "System Purge", "Data Heist",
    "Neural Calibration", "Void Walk", "Echo Location", "Memory Defrag",
    "Cyber Psych", "Quantum Leap"
];

const DESCRIPTIONS = [
    "A strange signal has been detected. Investigate appropriately.",
    "Optimize your workflow by removing 3 distractions.",
    "Read 10 pages of a non-fiction book to calibrate your neural net.",
    "Meditate for 10 minutes to purge system cache.",
    "Walk 5000 steps to recharge kinetic batteries.",
    "Review your finances. The numbers are speaking.",
    "Clean your physical workspace. Disorder is latency.",
    "Write 300 words. Output is clarity.",
    "Reach out to an old contact. Networking requires pinging.",
    "Sleep 8 hours. System reboot required."
];

const DIFFICULTIES: QuestDifficulty[] = ['EASY', 'EASY', 'MEDIUM', 'MEDIUM', 'HARD'];

const generateId = () => `daily-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

export const generateDailyQuests = (count: number = 3): Task[] => {
    const quests: Task[] = [];

    for (let i = 0; i < count; i++) {
        const difficulty = DIFFICULTIES[Math.floor(Math.random() * DIFFICULTIES.length)];
        const title = TITLES[Math.floor(Math.random() * TITLES.length)];
        const desc = DESCRIPTIONS[Math.floor(Math.random() * DESCRIPTIONS.length)];

        // Rewards based on difficulty (using gameLogic constants if imported, or local map)
        // We already have QUEST_REWARDS imported
        const xp = QUEST_REWARDS[difficulty];
        const gold = xp / 2; // Simple heuristic

        // Define task explicitly to modify it
        const task: Task = {
            id: generateId(),
            name: `${title}: ${difficulty}`,
            description: desc,
            type: 'daily',
            difficulty: difficulty,
            completed: false,
            xpReward: xp,
            goldReward: gold,
            energyCost: Math.floor(xp / 10), // Heuristic
            gems: 0
        };

        // Check Dealer's Choice (Branch 3 Node 9)
        // 5% Chance to add Gems
        const state = useGameStore.getState();
        const dealerNode = state.skillNodes.find(n => n.id === 'branch_3-9');
        if (dealerNode?.data.isUnlocked && Math.random() < 0.05) {
            task.gems = Math.floor(Math.random() * 6) + 5; // 5-10 Gems
        }

        quests.push(task);
    }

    return quests;
};
