
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import * as Icons from 'lucide-react';
import { useGameStore } from '../store/useGameStore';

export const CustomSkillNode = ({ id, data }: { id: string, data: any }) => {
  const { stats, skillEdges, skillNodes, setHoveredNode, unlockNode, setAvatar } = useGameStore();

  const Icon = (Icons as any)[data.icon] || Icons.HelpCircle;

  // ... (existing dependency logic) ... 
  // Omitted for brevity, but I just need to update the onClick handler below.
  // Wait, I can't emit "Omitted" in replace_file_content if I'm replacing lines.
  // I need to be precise.
  // But wait, the previous tool call showed line 1-100.
  // I will target the specific blocks.

  // No, I need to recalculate `activeColors` etc if I replace everything.
  // I will just replace the top destructuring and the onClick.


  // ... (existing dependency logic) ... 

  // Inside onClick:
  // onClick={(e) => {
  //   e.stopPropagation();
  //   if (isUnlockable) setVerificationNode({ id, data });
  // }}

  // Dependency Logic
  const parentEdges = skillEdges.filter(e => e.target === id);
  let isParentUnlocked = false;
  if (parentEdges.length === 0) {
    isParentUnlocked = true;
  } else if (data.requireAllParents) {
    isParentUnlocked = parentEdges.every(e => skillNodes.find(n => n.id === e.source)?.data.isUnlocked);
  } else {
    isParentUnlocked = parentEdges.some(e => skillNodes.find(n => n.id === e.source)?.data.isUnlocked);
  }

  // Jump Logic (Grandparent Check)
  let isJumpUnlockable = false;
  let canAffordJump = false;
  if (!isParentUnlocked && !data.isUnlocked) {
    const parentIds = parentEdges.map(e => e.source);
    const grandParentEdges = skillEdges.filter(e => parentIds.includes(e.target));
    const hasGrandParentUnlocked = grandParentEdges.some(e => skillNodes.find(n => n.id === e.source)?.data.isUnlocked);

    // Core nodes or L1 nodes don't really jump (parents are core), but logic holds if grandparent exists
    if (hasGrandParentUnlocked) {
      isJumpUnlockable = true;
      canAffordJump = stats.skillPoints >= data.cost && stats.gems >= 100;
    }
  }

  const canAfford = stats.skillPoints >= data.cost;
  const isUnlockable = !data.isUnlocked && ((isParentUnlocked && canAfford) || (isJumpUnlockable && canAffordJump));

  // Visual Styles based on Type
  const typeStyles = {
    minor: 'w-12 h-12 rounded-full border-2 overflow-hidden',
    major: 'w-20 h-20 rounded-2xl border-4 shadow-xl overflow-hidden', // Removed shadow color to be dynamic
    hybrid: 'w-16 h-16 rotate-45 border-4 overflow-hidden',
    apex: 'w-24 h-24 rotate-45 border-4 z-20 overflow-hidden'
  };

  // Dynamic Color Logic
  const branchColor = data.branchColor || 'indigo'; // Default fallback
  const colorMap: Record<string, { border: string, bg: string, text: string, glow: string }> = {
    indigo: { border: 'border-indigo-500', bg: 'bg-indigo-600', text: 'text-indigo-400', glow: 'shadow-indigo-500/50' },
    emerald: { border: 'border-emerald-500', bg: 'bg-emerald-600', text: 'text-emerald-400', glow: 'shadow-emerald-500/50' },
    amber: { border: 'border-amber-500', bg: 'bg-amber-500', text: 'text-amber-400', glow: 'shadow-amber-500/50' },
    rose: { border: 'border-rose-500', bg: 'bg-rose-600', text: 'text-rose-400', glow: 'shadow-rose-500/50' },
    cyan: { border: 'border-cyan-500', bg: 'bg-cyan-600', text: 'text-cyan-400', glow: 'shadow-cyan-500/50' },
    slate: { border: 'border-slate-700', bg: 'bg-slate-800', text: 'text-slate-500', glow: 'shadow-none' } // Locked
  };

  const theme = colorMap[branchColor] || colorMap.indigo;
  const lockedTheme = colorMap.slate;

  // Determine State
  let containerClasses = '';
  let iconColorClass = '';

  if (data.isUnlocked) {
    // UNLOCKED: Full Color, Glow, White Text
    containerClasses = `${theme.bg} ${theme.border} text-white shadow-[0_0_20px_rgba(0,0,0,0.5)] ${theme.glow}`;
    iconColorClass = 'text-white';
  } else if (isUnlockable) {
    // AVAILABLE: Outline Only, Branch Color Text, Pulsing
    containerClasses = `bg-slate-900 ${theme.border} ${theme.text} animate-pulse ring-4 ring-white/5`;
    iconColorClass = theme.text;
  } else {
    // LOCKED: Grey
    containerClasses = `${lockedTheme.bg} ${lockedTheme.border} ${lockedTheme.text} opacity-40 grayscale`;
    iconColorClass = lockedTheme.text;
  }

  return (
    <div
      className="relative p-1 group"
      style={{ zIndex: isUnlockable ? 10 : 1 }}
      onClick={(e) => {
        e.stopPropagation();
        if (isUnlockable) {
          unlockNode(id);
        } else if (data.isUnlocked) {
          // EQUIP LOGIC FOR MASTERY NODES
          const MASTERY_MAP: Record<string, string> = {
            'branch_1-10': 'avatar_scribe_master',
            'branch_2-10': 'avatar_master_blacksmith',
            'branch_3-10': 'avatar_master_bounty_hunter'
          };
          const avatarId = MASTERY_MAP[id];
          if (avatarId) {
            setAvatar(avatarId);
          }
        }
      }}
      onMouseEnter={() => setHoveredNode({ ...data, isUnlockable, canAfford, isParentUnlocked, isJumpUnlockable })}
      onMouseLeave={() => setHoveredNode(null)}
    >
      <Handle type="target" position={Position.Top} className="opacity-0 w-0 h-0 top-1/2 left-1/2" style={{ transform: 'translate(-50%, -50%)' }} />
      <Handle type="source" position={Position.Bottom} className="opacity-0 w-0 h-0 top-1/2 left-1/2" style={{ transform: 'translate(-50%, -50%)' }} />

      <div
        className={`
          flex flex-col items-center justify-center cursor-pointer select-none relative
          transition-all duration-300 ease-out
          ${typeStyles[data.type as keyof typeof typeStyles]}
          ${containerClasses}
          ${data.type === 'apex' ? 'hover:scale-150' : 'hover:scale-125'} hover:shadow-2xl hover:z-50 hover:opacity-100 hover:grayscale-0
        `}
      >
        <div className={data.type === 'hybrid' || data.type === 'apex' ? '-rotate-45' : ''}>
          {data.image ? (
            <img
              src={data.image}
              alt={data.label}
              className={`w-full h-full object-cover ${data.type === 'apex' ? 'scale-150' : ''} ${iconColorClass /* Apply text color to alt text or fallback, though img won't use it directly */}`}
              style={{ imageRendering: 'pixelated' }}
            />
          ) : (
            <Icon size={data.type === 'minor' ? 20 : data.type === 'apex' ? 40 : 32} className={iconColorClass} />
          )}
        </div>

        {!data.isUnlocked && (
          <div className={`absolute -bottom-3 px-2 py-0.5 bg-slate-900 rounded-full text-[9px] font-black border border-slate-700 shadow-xl whitespace-nowrap ${canAfford ? 'text-amber-400' : 'text-slate-500'}`}>
            {isJumpUnlockable ? (
              <span className="flex items-center gap-1 text-amber-300">
                {data.cost} <span className="text-[8px] text-purple-400">+1★</span>
              </span>
            ) : (
              `${data.cost} SP`
            )}
          </div>
        )}
      </div>
    </div>
  );
};
