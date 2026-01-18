
import React from 'react';
import { Save, Sliders, RefreshCw, Trash2, Coins, Unlock, Clock, FastForward } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import { useDevStore } from '../../store/useDevStore';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { SHOP_ITEMS } from '../../src/utils/GameEconomy';
import { ALL_COSMETIC_ITEMS } from '../../src/utils/CosmeticsData';

// No props needed now, fully global
export const DevControls: React.FC = () => {
    // --- game store for actions / reading current active backdrop ---
    const { stats } = useGameStore();
    const activeBackdropId = stats.activeBackdropId;

    // --- dev store for UI state (MUST BE CALLED BEFORE CONDITIONAL RETURN) ---
    const {
        devPanelOpen, setDevPanelOpen,
        devEditMode, setDevEditMode,
        devCompanionTop, setDevCompanionTop,
        devCompanionRight, setDevCompanionRight,
        devCompanionScale, setDevCompanionScale,
        devCompanionRotation, setDevCompanionRotation,
        devAvatarScale, setDevAvatarScale,
        devAvatarOffsetX, setDevAvatarOffsetX,
        devAvatarOffsetY, setDevAvatarOffsetY,
        devBackdropScale, setDevBackdropScale,
        devBackdropOffsetX, setDevBackdropOffsetX,
        devBackdropOffsetY, setDevBackdropOffsetY,
        devActiveItem, setDevActiveItem,
        devOffset, setDevOffset,
        isDevMode, setIsDevMode,
    } = useDevStore();

    // Admin Check
    const user = useQuery(api.users.getMe);
    if (!user || user.role !== 'admin') return null;

    const copyConfig = () => {
        const configString = `'ITEM_ID': { top: ${devOffset.top}, left: ${devOffset.left}, scale: ${devOffset.scale}, rotation: ${devOffset.rotation}, zIndex: ${devOffset.zIndex} },`;
        navigator.clipboard.writeText(configString);
        alert("Config copied to clipboard!");
    };

    return (
        <div className="fixed bottom-20 right-4 md:bottom-4 md:left-4 z-[9999]">
            <button
                onClick={() => setDevPanelOpen(!devPanelOpen)}
                className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg shadow-lg font-bold text-sm flex items-center gap-2"
            >
                <Sliders size={16} />
                <span className="hidden md:inline">{devPanelOpen ? 'Close Dev Panel' : 'Dev Controls'}</span>
                <span className="md:hidden">Dev</span>
            </button>

            {devPanelOpen && (
                <div className="absolute bottom-12 right-0 md:left-0 md:bottom-12 bg-slate-900 border border-slate-700 rounded-xl p-4 w-80 shadow-2xl space-y-4 max-h-[70vh] overflow-y-auto">

                    {/* --- GLOBAL ACTIONS --- */}
                    <div className="space-y-4 pb-4 border-b border-slate-700">
                        <h4 className="font-bold text-sm uppercase tracking-wider text-indigo-400">Game Actions</h4>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={() => {
                                    const currentState = useGameStore.getState();
                                    useGameStore.setState({ stats: { ...currentState.stats, gold: currentState.stats.gold + 100000 } });
                                    alert('Rich!');
                                }}
                                className="bg-emerald-900/40 border border-emerald-800 text-emerald-300 p-2 rounded text-[10px] font-bold uppercase flex flex-col items-center gap-1 hover:bg-emerald-900/60"
                            >
                                <Coins size={14} /> +100k Gold
                            </button>
                            <button
                                onClick={() => useGameStore.getState().dev_gainLevel()}
                                className="bg-amber-900/40 border border-amber-800 text-amber-300 p-2 rounded text-[10px] font-bold uppercase flex flex-col items-center gap-1 hover:bg-amber-900/60"
                            >
                                <RefreshCw size={14} /> Force Level Up
                            </button>
                            <button
                                onClick={() => {
                                    const { inventory } = useGameStore.getState();
                                    const combinedItems = [...SHOP_ITEMS, ...ALL_COSMETIC_ITEMS];
                                    const allItems = combinedItems.filter(i => i.type !== 'REAL_LIFE' && i.type !== 'SYSTEM');
                                    const currentInventory = useGameStore.getState().inventory;
                                    const finalInventory = [...currentInventory];

                                    allItems.forEach(item => {
                                        if (!finalInventory.some(i => i.id === item.id)) {
                                            finalInventory.push({
                                                id: item.id,
                                                name: item.name,
                                                type: item.type as any,
                                                acquiredAt: new Date().toISOString(),
                                                quantity: 1,
                                                imageUrl: item.imageUrl,
                                                perks: (item as any).perks,
                                                slots: (item as any).slots
                                            });
                                        }
                                    });
                                    useGameStore.setState({ inventory: finalInventory });
                                    alert('Unlocked All Items!');
                                }}
                                className="col-span-2 bg-purple-900/40 border border-purple-800 text-purple-300 p-2 rounded text-[10px] font-bold uppercase flex flex-col items-center gap-1 hover:bg-purple-900/60"
                            >
                                <Unlock size={14} /> Unlock All Items
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={() => { if (confirm("Reset Level?")) useGameStore.getState().resetLevel(); }}
                                className="bg-indigo-900/40 border border-indigo-800 text-indigo-300 p-2 rounded text-[10px] font-bold uppercase flex flex-col items-center gap-1 hover:bg-indigo-900/60"
                            >
                                <RefreshCw size={14} /> Reset Level
                            </button>
                            <button
                                onClick={() => { if (confirm("Wipe Resources?")) useGameStore.getState().resetResources(); }}
                                className="bg-red-900/40 border border-red-800 text-red-300 p-2 rounded text-[10px] font-bold uppercase flex flex-col items-center gap-1 hover:bg-red-900/60"
                            >
                                <Trash2 size={14} /> Wipe Res.
                            </button>
                        </div>
                    </div>

                    {/* TIME GOD PANEL */}
                    <div className="space-y-2 pb-4 border-b border-slate-700">
                        <h4 className="font-bold text-sm uppercase tracking-wider text-pink-400 flex items-center gap-2">
                            <Clock size={14} /> Time God
                        </h4>
                        <div className="grid grid-cols-1 gap-2">
                            <button
                                onClick={() => useGameStore.getState().dev_forceDailyReset()}
                                className="flex items-center justify-center gap-2 bg-indigo-900/40 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-800 p-3 rounded text-[10px] font-bold uppercase transition-colors"
                            >
                                <RefreshCw size={14} />
                                Force Day Reset (Midnight)
                            </button>
                            <button
                                onClick={() => useGameStore.getState().dev_timeTravel()}
                                className="flex items-center justify-center gap-2 bg-pink-900/40 hover:bg-pink-900/60 text-pink-300 border border-pink-800 p-3 rounded text-[10px] font-bold uppercase transition-colors"
                            >
                                <FastForward size={14} />
                                Time Travel (+1 Day)
                            </button>
                        </div>
                        <p className="text-[10px] text-slate-500 italic leading-tight">
                            "Day Reset" simulates checking in on a new day. "Time Travel" pushes your last login back 24h so the NEXT check counts as a streak.
                        </p>
                    </div>


                    {/* --- VISUAL EDITORS --- */}
                    <div className="space-y-2">
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Visual Editor Mode</p>
                        <div className="flex gap-2">
                            <button onClick={() => setDevEditMode('backdrop')} className={`flex-1 px-2 py-1.5 rounded text-[10px] font-bold uppercase transition-colors ${devEditMode === 'backdrop' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>BG</button>
                            <button onClick={() => setDevEditMode('avatar')} className={`flex-1 px-2 py-1.5 rounded text-[10px] font-bold uppercase transition-colors ${devEditMode === 'avatar' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>Avi</button>
                            <button onClick={() => setDevEditMode('companion')} className={`flex-1 px-2 py-1.5 rounded text-[10px] font-bold uppercase transition-colors ${devEditMode === 'companion' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>Pet</button>
                            <button onClick={() => setDevEditMode('equipment')} className={`flex-1 px-2 py-1.5 rounded text-[10px] font-bold uppercase transition-colors ${devEditMode === 'equipment' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>Equip</button>
                        </div>
                    </div>

                    {/* Companion Controls */}
                    {devEditMode === 'companion' && (
                        <div className="space-y-4 border-t border-purple-700 pt-2">
                            <h4 className="font-bold text-sm uppercase tracking-wider text-purple-400">Companion Controls</h4>
                            <div className="space-y-2">
                                <label className="text-slate-400 text-xs flex justify-between">Top: <span className="text-white">{devCompanionTop}%</span></label>
                                <input type="range" min="0" max="100" step="0.5" value={devCompanionTop} onChange={(e) => setDevCompanionTop(parseFloat(e.target.value))} className="w-full accent-purple-500" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-slate-400 text-xs flex justify-between">Right: <span className="text-white">{devCompanionRight}%</span></label>
                                <input type="range" min="0" max="100" step="0.5" value={devCompanionRight} onChange={(e) => setDevCompanionRight(parseFloat(e.target.value))} className="w-full accent-purple-500" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-slate-400 text-xs flex justify-between">Scale: <span className="text-white">{devCompanionScale.toFixed(2)}</span></label>
                                <input type="range" min="0.1" max="3" step="0.05" value={devCompanionScale} onChange={(e) => setDevCompanionScale(parseFloat(e.target.value))} className="w-full accent-purple-500" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-slate-400 text-xs flex justify-between">Rotation: <span className="text-white">{devCompanionRotation}°</span></label>
                                <input type="range" min="-180" max="180" step="1" value={devCompanionRotation} onChange={(e) => setDevCompanionRotation(parseFloat(e.target.value))} className="w-full accent-purple-500" />
                            </div>
                            <div className="pt-2 border-t border-slate-700">
                                <button onClick={() => navigator.clipboard.writeText(`{ top: ${devCompanionTop}, right: ${devCompanionRight}, scale: ${devCompanionScale.toFixed(2)}, rot: ${devCompanionRotation} }`)} className="mb-1 text-[10px] bg-purple-600 text-white px-2 py-0.5 rounded font-bold">Copy</button>
                                <code className="text-[10px] text-green-400 bg-black/50 p-2 rounded block break-all">{`{ top: ${devCompanionTop}, right: ${devCompanionRight}, scale: ${devCompanionScale.toFixed(2)}, rot: ${devCompanionRotation} }`}</code>
                            </div>
                        </div>
                    )}


                    {/* Avatar Controls */}
                    {devEditMode === 'avatar' && (
                        <div className="space-y-4 border-t border-amber-700 pt-2">
                            <h4 className="font-bold text-sm uppercase tracking-wider text-amber-400">Avatar Controls</h4>
                            <div className="space-y-2">
                                <label className="text-slate-400 text-xs flex justify-between">Height: <span className="text-white">{devAvatarScale}%</span></label>
                                <input type="range" min="50" max="150" step="1" value={devAvatarScale} onChange={(e) => setDevAvatarScale(parseFloat(e.target.value))} className="w-full accent-amber-500" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-slate-400 text-xs flex justify-between">X Offset: <span className="text-white">{devAvatarOffsetX}px</span></label>
                                <input type="range" min="-100" max="100" step="1" value={devAvatarOffsetX} onChange={(e) => setDevAvatarOffsetX(parseFloat(e.target.value))} className="w-full accent-amber-500" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-slate-400 text-xs flex justify-between">Y Offset: <span className="text-white">{devAvatarOffsetY}px</span></label>
                                <input type="range" min="-100" max="100" step="1" value={devAvatarOffsetY} onChange={(e) => setDevAvatarOffsetY(parseFloat(e.target.value))} className="w-full accent-amber-500" />
                            </div>
                            <div className="pt-2 border-t border-slate-700">
                                <button onClick={() => navigator.clipboard.writeText(`{ height: ${devAvatarScale}, offsetX: ${devAvatarOffsetX}, offsetY: ${devAvatarOffsetY} }`)} className="mb-1 text-[10px] bg-amber-600 text-white px-2 py-0.5 rounded font-bold">Copy</button>
                                <code className="text-[10px] text-green-400 bg-black/50 p-2 rounded block break-all">{`{ height: ${devAvatarScale}, offsetX: ${devAvatarOffsetX}, offsetY: ${devAvatarOffsetY} }`}</code>
                            </div>
                        </div>
                    )}

                    {/* Backdrop Controls */}
                    {devEditMode === 'backdrop' && (
                        <div className="space-y-4 border-t border-emerald-700 pt-2">
                            <h4 className="font-bold text-sm uppercase tracking-wider text-emerald-400">Backdrop Controls</h4>
                            <div className="space-y-2">
                                <label className="text-slate-400 text-xs flex justify-between">Zoom: <span className="text-white">{devBackdropScale}%</span></label>
                                <input type="range" min="50" max="200" step="1" value={devBackdropScale} onChange={(e) => setDevBackdropScale(parseFloat(e.target.value))} className="w-full accent-emerald-500" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-slate-400 text-xs flex justify-between">X Offset: <span className="text-white">{devBackdropOffsetX}px</span></label>
                                <input type="range" min="-200" max="200" step="1" value={devBackdropOffsetX} onChange={(e) => setDevBackdropOffsetX(parseFloat(e.target.value))} className="w-full accent-emerald-500" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-slate-400 text-xs flex justify-between">Y Offset: <span className="text-white">{devBackdropOffsetY}px</span></label>
                                <input type="range" min="-200" max="200" step="1" value={devBackdropOffsetY} onChange={(e) => setDevBackdropOffsetY(parseFloat(e.target.value))} className="w-full accent-emerald-500" />
                            </div>
                            <div className="pt-2 border-t border-slate-700">
                                <button onClick={() => navigator.clipboard.writeText(`'${activeBackdropId || 'none'}': { scale: ${devBackdropScale}, offsetX: ${devBackdropOffsetX}, offsetY: ${devBackdropOffsetY} }`)} className="mb-1 text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded font-bold">Copy</button>
                                <code className="text-[10px] text-green-400 bg-black/50 p-2 rounded block break-all">{`'${activeBackdropId || 'none'}': { scale: ${devBackdropScale}, offsetX: ${devBackdropOffsetX}, offsetY: ${devBackdropOffsetY} }`}</code>
                            </div>
                        </div>
                    )}

                    {/* Equipment Controls */}
                    {devEditMode === 'equipment' && (
                        <div className="space-y-4 pt-4 border-t border-slate-700">
                            <h4 className="font-bold text-sm uppercase tracking-wider border-b pb-2 text-blue-400 border-blue-700">Equipment Controls</h4>

                            <div className="space-y-2">
                                <label className="text-slate-400 text-xs flex justify-between">Item: <span className="text-white">{devActiveItem}</span></label>
                                <select value={devActiveItem} onChange={(e) => setDevActiveItem(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded p-1 text-xs text-white">
                                    <option value="a_seraph_wings">Seraph Wings</option>
                                    <option value="a_adapt_cloak">Adaptive Cloak</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                    <label className="text-slate-400 text-[10px]">Top (%)</label>
                                    <input type="number" value={devOffset.top} onChange={(e) => setDevOffset({ ...devOffset, top: Number(e.target.value) })} className="w-full bg-slate-800 border border-slate-700 rounded p-1 text-xs text-white" step="0.5" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-slate-400 text-[10px]">Left (%)</label>
                                    <input type="number" value={devOffset.left} onChange={(e) => setDevOffset({ ...devOffset, left: Number(e.target.value) })} className="w-full bg-slate-800 border border-slate-700 rounded p-1 text-xs text-white" step="0.5" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-slate-400 text-[10px]">Scale</label>
                                    <input type="number" value={devOffset.scale} onChange={(e) => setDevOffset({ ...devOffset, scale: Number(e.target.value) })} className="w-full bg-slate-800 border border-slate-700 rounded p-1 text-xs text-white" step="0.05" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-slate-400 text-[10px]">Rot</label>
                                    <input type="number" value={devOffset.rotation} onChange={(e) => setDevOffset({ ...devOffset, rotation: Number(e.target.value) })} className="w-full bg-slate-800 border border-slate-700 rounded p-1 text-xs text-white" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-slate-400 text-[10px]">Z-Index</label>
                                    <input type="number" value={devOffset.zIndex} onChange={(e) => setDevOffset({ ...devOffset, zIndex: Number(e.target.value) })} className="w-full bg-slate-800 border border-slate-700 rounded p-1 text-xs text-white" />
                                </div>
                            </div>

                            <div className="space-y-2 pt-2 border-t border-slate-800">
                                <button onClick={() => setIsDevMode(!isDevMode)} className={`w-full py-1.5 rounded text-[10px] font-bold uppercase transition-colors ${isDevMode ? 'bg-green-600 text-white' : 'bg-red-900/50 text-red-400 border border-red-900'}`}>{isDevMode ? 'Preview ON' : 'Preview OFF'}</button>
                                <button onClick={copyConfig} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-1.5 rounded text-[10px] font-bold uppercase flex items-center justify-center gap-1"><Save size={12} /> Copy Config</button>
                            </div>
                        </div>
                    )}
                    {/* Debug Actions: Legacy */}
                    <div className="space-y-2 pt-4 border-t border-slate-700">
                        <h4 className="font-bold text-sm uppercase tracking-wider text-red-400">Other Debug</h4>
                        <button
                            onClick={() => useGameStore.getState().resetTaskHistory()}
                            className="w-full bg-red-900/50 hover:bg-red-900 text-red-200 border border-red-800 py-1.5 rounded text-[10px] font-bold uppercase transition-colors"
                        >
                            Reset Daily Task History
                        </button>
                        <button
                            onClick={() => useGameStore.getState().resetStreak()}
                            className="w-full bg-red-900/50 hover:bg-red-900 text-red-200 border border-red-800 py-1.5 rounded text-[10px] font-bold uppercase transition-colors"
                        >
                            Reset Streak
                        </button>
                        <button
                            onClick={() => useGameStore.getState().resetSkills()}
                            className="w-full bg-red-900/50 hover:bg-red-900 text-red-200 border border-red-800 py-1.5 rounded text-[10px] font-bold uppercase transition-colors"
                        >
                            Reset Skill Tree
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
