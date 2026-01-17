import { Node, Edge } from '@xyflow/react';

export interface SkillNodeData {
    label: string;
    icon: string;
    cost: number;
    isUnlocked: boolean;
    path: string;
    type: 'minor' | 'major' | 'apex';
    description: string;
    flavor?: string;
    branchColor?: string;
    image?: string;
}

export interface BranchConfig {
    id: string;
    name: string;
    angle: number; // Degrees for radial layout
    color: string;
}

// 3 Branches
export const BRANCH_CONFIGS: BranchConfig[] = [
    { id: 'branch_1', name: 'The Scribe', angle: -90, color: 'indigo' },   // Top (12 o'clock)
    { id: 'branch_2', name: 'The Blacksmith', angle: 30, color: 'emerald' },    // Bottom Right (4 o'clock)
    { id: 'branch_3', name: 'The Bounty Hunter', angle: 150, color: 'amber' },    // Bottom Left (8 o'clock)
];

const getPos = (angleDeg: number, radius: number) => {
    const angleRad = (angleDeg - 90) * (Math.PI / 180); // Adjust to start from top
    return {
        x: Math.round(radius * Math.cos(angleRad)),
        y: Math.round(radius * Math.sin(angleRad)),
    };
};

// Node Definitions for specific branches
export const NODE_DEFINITIONS: Record<string, Record<number, { label: string; description: string; icon?: string; flavor?: string; image?: string }>> = {
    'branch_1': {
        1: { label: 'Clarity', description: '+5% XP from Journal Entries', icon: 'BookOpen', flavor: '"A sharp mind cuts through the fog of chaos."' },
        2: { label: 'Memory', description: '+10% Chance to find a "Lost Item" (Gold) when saving a journal entry.', icon: 'Search', flavor: '"The past holds treasures for those who bother to look."' },
        3: { label: 'Inkwell', description: 'Unlock Quick-Log Journal Widget (Mood/Energy Logger).', icon: 'PenTool', flavor: '"Capture the thought before it returns to the void."' },
        4: { label: 'Clarity II', description: '+10% XP from Journal Entries.', icon: 'BookOpen', flavor: '"True focus is not seeing everything, but seeing what matters."' },
        5: { label: 'Memory II', description: '+15% Chance to find a "Lost Item" (Gold).', icon: 'Search', flavor: '"Nothing is ever truly lost, only misplaced in time."' },
        6: { label: 'The Grimoire', description: 'Unlock One-Click Journal Templates.', icon: 'Book', flavor: '"Do not reinvent the spell every time you cast it. Ancient frames for modern chaos."' },
        7: { label: 'Golden Ink', description: '5% Chance to find Realm Shards when submitting a journal entry.', icon: 'Diamond', flavor: '"Sometimes, the words themselves vary in weight in gold."' },
        8: { label: 'Royalties', description: 'Earn 2% Interest on Gold (Max 500g) upon first daily journal entry.', icon: 'Landmark', flavor: '"Wealth grows in the quiet moments between words."' },
        9: { label: 'Legacy', description: '+1% XP gain per 10,000 words written (Max +20%).', icon: 'Feather', flavor: '"We are defined by the history we write. Let your volume be heavy."' },
        10: { label: 'Scribe Master', description: 'Unlocks the "Scribe Master" Avatar.', icon: 'Crown', flavor: '"The pen is not a tool. It is a weapon against oblivion."', image: '/avatars/mastery/scribe_master.png' },
    },
    'branch_2': {
        1: { label: 'Heat I', description: '+5% XP for sessions longer than 25 minutes.', icon: 'Flame', flavor: '"The metal is cold. It resists. Apply the fire."' },
        2: { label: 'Golden Forge', description: '+5% Gold earned for sessions longer than 30 minutes.', icon: 'Coins', flavor: '"Time is the only currency that cannot be refunded. Spend it well."' },
        3: { label: 'Chain-Forging', description: 'Unlocks chained focused timers with structured breaks.', icon: 'Link', flavor: '"One strike follows another. Do not let the hammer cool."' },
        4: { label: 'Heat II', description: '+10% XP for sessions longer than 25 minutes.', icon: 'Flame', flavor: '"The sparks begin to fly. The impurities burn away."' },
        5: { label: 'Iron Will', description: 'Streak Shield: First missed day of month doesn\'t reset streak.', icon: 'Shield', flavor: '"The hardened steel does not shatter at the first mistake."' },
        6: { label: 'Blacksmith\'s Schematic', description: 'Pin a permanent Goal Text to the top of screen during session.', icon: 'Pin', flavor: '"The drift is the enemy. The blueprint is absolute."' },
        7: { label: 'The Heat III', description: 'Double XP for minutes beyond 45m in a session.', icon: 'Zap', flavor: '"Ignore the safety warning. Push past the red line."' },
        8: { label: 'Slag Sifting', description: '+1% XP per Account Level.', icon: 'Filter', flavor: '"Strength grows with the weight of the tool. Experience hardens the strike."' },
        9: { label: 'Residual Heat', description: 'Recover 50% XP / 25% Gold on cancelled timer.', icon: 'RefreshCw', flavor: '"Explosions are wasted energy. Even in failure, we recover the fuel."' },
        10: { label: 'Master Blacksmith', description: 'Unlocks the "Master Blacksmith" Avatar.', icon: 'Hammer', flavor: '"I do not wait for the iron to be hot. I make it hot."', image: '/avatars/mastery/master_blacksmith.png' },
    },
    'branch_3': {
        1: { label: 'Greed I', description: '+5% Gold from all Tasks.', icon: 'CircleDollarSign', flavor: '"A coin in the hand is worth two in the corpse."' },
        2: { label: 'Haste', description: 'Combo Meter: 3 Tasks in 1 hour grants +20 XP.', icon: 'FastForward', flavor: '"Momentum is a weapon. Do not stop swinging."' },
        3: { label: 'Most Wanted', description: 'Designate 1 Daily Task as "Most Wanted". +10% XP for 24h on completion.', icon: 'Target', flavor: '"One target above all others. Bring me their head."' },
        4: { label: 'Momentum', description: 'First Task completed each day grants +50% XP.', icon: 'TrendingUp', flavor: '"The early blade drinks deepest."' },
        5: { label: 'Speed Run', description: 'Tasks completed within 30m of creation yield Double Gold.', icon: 'Timer', flavor: '"Hesitation is death. Strike while the contract is fresh."' },
        6: { label: 'Kanban Warrior', description: 'Unlock the Kanban Board View for Quest Log.', icon: 'Columns', flavor: '"Order from chaos. Strategy from improved visualization."' },
        7: { label: 'Streak Economy', description: '+1% Gold Gen per streak day (Max 20%).', icon: 'BarChart', flavor: '"Success breeds wealth. Consistency compounds the reward."' },
        8: { label: 'Greed II', description: '+10% Gold from all Tasks.', icon: 'DollarSign', flavor: '"The heavier the purse, the sharper the aim."' },
        9: { label: 'Dealer\'s Choice', description: '10% Chance to receive a Full Refund when purchasing Shop items.', icon: 'Dices', flavor: '"The house always wins... but sometimes, you are the house."' },
        10: { label: 'Master Bounty Hunter', description: 'Unlocks the "Master Bounty Hunter" Avatar.', icon: 'Skull', flavor: '"The prey is infinite. The hunt is forever."', image: '/avatars/mastery/master_bounty_hunter.png' },
    }
};

export const generateSkillTree = (unlockedNodeIds: string[] = []): { nodes: Node[]; edges: Edge[] } => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // CENTRAL CORE
    nodes.push({
        id: 'core',
        type: 'skillNode',
        position: { x: 0, y: 0 },
        data: {
            label: 'CORE',
            icon: 'Hexagon', // Generic core icon
            cost: 0,
            isUnlocked: true,
            path: 'core',
            type: 'apex',
            description: 'The Source.',
        },
    });

    BRANCH_CONFIGS.forEach((branch) => {
        let nodeCount = 0;
        let previousNodeId = 'core';

        const addNode = (
            index: number,
            type: 'minor' | 'major' | 'apex',
            cost: number,
            dist: number,
            genericLabel: string,
            angleOffset: number = 0
        ) => {
            nodeCount++;
            const nodeId = `${branch.id}-${nodeCount}`;

            // Check for specific definition
            const def = NODE_DEFINITIONS[branch.id]?.[nodeCount];

            const label = def?.label || genericLabel;
            const description = def?.description || `${type.charAt(0).toUpperCase() + type.slice(1)} Node`;
            const icon = def?.icon || (type === 'apex' ? 'Crown' : (type === 'major' ? 'Star' : 'Circle'));

            nodes.push({
                id: nodeId,
                type: 'skillNode',
                position: getPos(branch.angle + angleOffset, dist), // Apply offset for spread layout
                data: {
                    label: label,
                    icon: icon,
                    cost: cost,
                    isUnlocked: unlockedNodeIds.includes(nodeId),
                    path: branch.id,
                    type: type,
                    description: description,
                    branchColor: branch.color,
                    flavor: def?.flavor,
                    image: def?.image
                },
            });

            // Connect to previous node
            edges.push({
                id: `e-${previousNodeId}-${nodeId}`,
                source: previousNodeId,
                target: nodeId,
                animated: type === 'apex', // Animate connection to mastery
            });

            previousNodeId = nodeId;
            return nodeId;
        };

        // SCHEME: 2 Minor -> 1 Major -> 2 Minor -> 1 Major -> 3 Minor -> 1 Mastery
        // TOTAL: 10 Nodes

        const SPREAD_SMALL = 12;
        const SPREAD_MEDIUM = 16;
        const SPREAD_LARGE = 18;

        // 1. Minor (Left)
        addNode(1, 'minor', 1, 180, 'Basic I', -SPREAD_SMALL);
        // 2. Minor (Right)
        addNode(2, 'minor', 1, 180, 'Basic II', SPREAD_SMALL);

        // 3. Major (Center)
        addNode(3, 'major', 3, 300, 'Major I', 0);

        // 4. Minor (Left)
        addNode(4, 'minor', 2, 420, 'Adv I', -SPREAD_MEDIUM);
        // 5. Minor (Right)
        addNode(5, 'minor', 2, 420, 'Adv II', SPREAD_MEDIUM);

        // 6. Major (Center)
        addNode(6, 'major', 5, 540, 'Major II', 0);

        // 7. Minor (Left)
        addNode(7, 'minor', 3, 660, 'Exp I', -SPREAD_LARGE);
        // 8. Minor (Right)
        addNode(8, 'minor', 3, 660, 'Exp II', SPREAD_LARGE);
        // 9. Minor (Center)
        addNode(9, 'minor', 3, 760, 'Exp III', 0);

        // 10. Mastery
        addNode(10, 'apex', 10, 950, 'Mastery', 0);
    });

    return { nodes, edges };
};
