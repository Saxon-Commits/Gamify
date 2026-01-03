import React, { useCallback } from 'react';
import { ReactFlow, Background, Controls, MiniMap } from '@xyflow/react';
import { useGameStore } from '../store/useGameStore';
import { CustomSkillNode } from '../components/CustomSkillNode';
import { Info, Lock, Unlock, AlertCircle } from 'lucide-react';
import * as Icons from 'lucide-react';

const nodeTypes = {
  skillNode: CustomSkillNode,
};

export const SkillTree: React.FC = () => {
  const { skillNodes, skillEdges, hoveredNode, setVerificationNode, stats } = useGameStore();

  const onNodesChange = useCallback(() => { }, []);

  const NodeInfoPanel = () => {
    if (!hoveredNode) return null;

    const Icon = (Icons as any)[hoveredNode.icon] || Icons.HelpCircle;

    return (
      <div className="absolute top-4 right-4 z-[60] w-72 bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 p-5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-in fade-in slide-in-from-right-4 duration-200">
        <div className="flex justify-between items-center mb-3">
          <span className="font-black text-[10px] uppercase tracking-[0.2em] text-indigo-400">{hoveredNode.path}</span>
          {hoveredNode.isUnlocked ? (
            <span className="text-[9px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full border border-green-500/30 uppercase font-black">Mastered</span>
          ) : (
            <span className={`text-[9px] px-2 py-0.5 rounded-full border uppercase font-black ${hoveredNode.canAfford ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-slate-800 text-slate-500 border-slate-700'}`}>
              {hoveredNode.cost} SP Required
            </span>
          )}
        </div>

        <div className="flex items-center space-x-3 mb-3">
          <div className={`p-2 rounded-lg bg-slate-800 border border-slate-700 text-indigo-400 overflow-hidden relative shrink-0`}>
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
          <h3 className="font-bold text-lg text-slate-100 leading-tight">{hoveredNode.label}</h3>
        </div>

        <p className="text-sm text-slate-400 leading-relaxed mb-4">{hoveredNode.description}</p>

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
      <div className="flex-1 bg-slate-950 overflow-hidden relative">
        <div className="absolute top-4 left-4 z-10">
          <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 p-2 px-3 rounded-lg shadow-2xl text-[10px] text-slate-400 flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <Info size={12} className="text-indigo-400" />
              <span className="font-bold text-slate-300">Controls:</span>
            </div>
            <span>• Two fingers to pan</span>
            <span className="text-slate-700">|</span>
            <span>• Hover for details</span>
          </div>
        </div>

        <NodeInfoPanel />

        <ReactFlow
          nodes={skillNodes}
          edges={skillEdges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          fitView
          minZoom={0.15}
          maxZoom={2}
          colorMode="dark"
          panOnScroll={true}
          selectionOnDrag={true}
          proOptions={{ hideAttribution: true }}
          defaultViewport={{ x: 0, y: 0, zoom: 0.5 }}
        >
          <Background color="#1e293b" variant="dots" gap={30} size={1} />
          <Controls position="bottom-right" showInteractive={false} className="bg-slate-900 border-slate-800" />
          <MiniMap
            style={{ height: 100, width: 140, backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
            nodeColor={(n: any) => {
              if (n.data.isUnlocked) return '#6366f1';
              return '#334155';
            }}
            maskColor="rgba(0, 0, 0, 0.8)"
          />
        </ReactFlow>
      </div>
    </div>
  );
};
