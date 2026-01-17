import React, { useCallback } from 'react';
import { ReactFlow, Background, Controls, MiniMap } from '@xyflow/react';
import { useGameStore } from '../store/useGameStore';
import { CustomSkillNode } from '../components/CustomSkillNode';
import { BRANCH_CONFIGS } from '../src/utils/SkillTreeUtils';
import { Info, Lock, Unlock, AlertCircle } from 'lucide-react';
import * as Icons from 'lucide-react';
import { CharacterSidebar } from '../components/character/CharacterSidebar';

import { MasteryUnlockModal } from '../components/MasteryUnlockModal';

const nodeTypes = {
  skillNode: CustomSkillNode,
};

export const SkillTree: React.FC = () => {
  const { skillNodes, skillEdges, hoveredNode, setVerificationNode, stats, settings, syncSkillTree } = useGameStore();
  const isDark = settings.theme === 'dark';

  // Sync latest node definitions on load (fixes stale cache)
  React.useEffect(() => {
    syncSkillTree();
  }, []);

  const onNodesChange = useCallback(() => { }, []);

  const NodeInfoPanel = () => {
    if (!hoveredNode) return null;

    const Icon = (Icons as any)[hoveredNode.icon] || Icons.HelpCircle;

    const branchName = BRANCH_CONFIGS.find(b => b.id === hoveredNode.path)?.name || hoveredNode.path;

    return (
      <div className="fixed bottom-4 left-4 right-4 z-[60] md:absolute md:top-4 md:right-4 md:left-auto md:bottom-auto w-auto md:w-72 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 p-5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-in fade-in slide-in-from-bottom-4 md:slide-in-from-right-4 duration-200 max-h-[60vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-3">
          <span className="font-black text-[10px] uppercase tracking-[0.2em] text-indigo-400">{branchName}</span>
          {hoveredNode.isUnlocked ? (
            <span className="text-[9px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full border border-green-500/30 uppercase font-black">Mastered</span>
          ) : (
            <span className={`text-[9px] px-2 py-0.5 rounded-full border uppercase font-black ${hoveredNode.canAfford ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-slate-800 text-slate-500 border-slate-700'}`}>
              {hoveredNode.cost} Realm Shards Required
            </span>
          )}
        </div>

        <div className="flex items-center space-x-3 mb-3">
          <div className={`p-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-indigo-500 dark:text-indigo-400 overflow-hidden relative shrink-0`}>
            {hoveredNode.image ? (
              <img
                src={hoveredNode.image}
                alt={hoveredNode.label}
                className="w-32 h-32 object-cover"
                style={{ imageRendering: 'pixelated' }}
              />
            ) : (
              <Icon size={20} />
            )}
          </div>
          <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 leading-tight">{hoveredNode.label}</h3>
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">{hoveredNode.description}</p>

        {hoveredNode.flavor && (
          <p className="text-xs text-slate-500 italic mb-4 border-l-2 border-slate-800 pl-3 leading-relaxed">
            {hoveredNode.flavor}
          </p>
        )}

        {!hoveredNode.isUnlocked && (
          <div className="pt-4 border-t border-slate-800/50">
            {!hoveredNode.isParentUnlocked ? (
              <div className="flex items-center space-x-2 text-red-400 font-bold text-[10px] uppercase tracking-wider">
                <Lock size={12} />
                <span>Locked: Ancestor nodes required</span>
              </div>
            ) : !hoveredNode.canAfford ? (
              <div className="flex items-center space-x-2 text-amber-500 font-bold text-[10px] uppercase tracking-wider">
                <AlertCircle size={12} />
                <span>Insufficient points to unlock</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-green-400 font-bold text-[10px] uppercase tracking-wider animate-pulse">
                <Unlock size={12} />
                <span>Ready to unlock - Click node</span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col -m-4 md:-m-6">
      <div className="flex-1 bg-slate-50 dark:bg-slate-950 overflow-hidden relative">
        {/* CHARACTER SIDEBAR OVERLAY - Matches QuestLog position */}
        <div className="absolute inset-0 pointer-events-none z-50 px-4 md:px-6">
          <div className="max-w-[95%] mx-auto h-full pt-14 flex gap-8">
            <CharacterSidebar className="hidden lg:block w-full lg:w-48 flex-shrink-0 pointer-events-auto h-fit" />
          </div>
        </div>

        <div className="absolute top-4 right-4 z-10 hidden md:block">
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 p-2 px-3 rounded-lg shadow-xl text-[10px] text-slate-500 dark:text-slate-400 flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <Info size={12} className="text-indigo-500 dark:text-indigo-400" />
              <span className="font-bold text-slate-700 dark:text-slate-300">Controls:</span>
            </div>
            <span>• Two fingers to pan</span>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span>• Hover for details</span>
          </div>
        </div>

        <NodeInfoPanel />
        <MasteryUnlockModal />

        <ReactFlow
          nodes={skillNodes}
          edges={skillEdges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          fitView
          minZoom={0.15}
          maxZoom={2}
          colorMode={isDark ? 'dark' : 'light'}
          panOnScroll={true}
          selectionOnDrag={true}
          proOptions={{ hideAttribution: true }}
          defaultViewport={{ x: 0, y: 0, zoom: 0.5 }}
        >
          <Background color={isDark ? "#1e293b" : "#cbd5e1"} variant="dots" gap={30} size={1} />
          <Controls position="bottom-right" showInteractive={false} className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100" />
          <MiniMap
            style={{
              height: 100,
              width: 140,
              backgroundColor: isDark ? '#0f172a' : '#f8fafc',
              border: `1px solid ${isDark ? '#1e293b' : '#cbd5e1'}`,
              borderRadius: '8px'
            }}
            nodeColor={(n: any) => {
              if (n.data.isUnlocked) return '#6366f1';
              return isDark ? '#334155' : '#cbd5e1';
            }}
            maskColor={isDark ? "rgba(0, 0, 0, 0.8)" : "rgba(255, 255, 255, 0.8)"}
          />
        </ReactFlow>
      </div>
    </div>
  );
};
