import React from 'react';
import { Save, Sliders } from 'lucide-react';
import { EquipmentOffset } from '../../src/utils/EquipmentConfig';

interface DevControlsProps {
    devPanelOpen: boolean;
    setDevPanelOpen: (v: boolean) => void;
    devEditMode: 'backdrop' | 'avatar' | 'companion' | 'equipment';
    setDevEditMode: (v: 'backdrop' | 'avatar' | 'companion' | 'equipment') => void;

    // Companion
    devCompanionTop: number; setDevCompanionTop: (v: number) => void;
    devCompanionRight: number; setDevCompanionRight: (v: number) => void;
    devCompanionScale: number; setDevCompanionScale: (v: number) => void;
    devCompanionRotation: number; setDevCompanionRotation: (v: number) => void;

    // Avatar
    devAvatarScale: number; setDevAvatarScale: (v: number) => void;
    devAvatarOffsetX: number; setDevAvatarOffsetX: (v: number) => void;
    devAvatarOffsetY: number; setDevAvatarOffsetY: (v: number) => void;

    // Backdrop
    devBackdropScale: number; setDevBackdropScale: (v: number) => void;
    devBackdropOffsetX: number; setDevBackdropOffsetX: (v: number) => void;
    devBackdropOffsetY: number; setDevBackdropOffsetY: (v: number) => void;

    // Equipment
    devActiveItem: string; setDevActiveItem: (v: string) => void;
    devOffset: EquipmentOffset; setDevOffset: (v: EquipmentOffset) => void;
    isDevMode: boolean; setIsDevMode: (v: boolean) => void;

    // Helpers
    activeBackdropId: string | undefined;
}

export const DevControls: React.FC<DevControlsProps> = (props) => {
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
        activeBackdropId
    } = props;

    const copyConfig = () => {
        const configString = `'ITEM_ID': { top: ${devOffset.top}, left: ${devOffset.left}, scale: ${devOffset.scale}, rotation: ${devOffset.rotation}, zIndex: ${devOffset.zIndex} },`;
        navigator.clipboard.writeText(configString);
        alert("Config copied to clipboard!");
    };

    return (
        <div className="fixed bottom-4 left-4 z-50">
            <button
                onClick={() => setDevPanelOpen(!devPanelOpen)}
                className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg shadow-lg font-bold text-sm flex items-center gap-2"
            >
                <Sliders size={16} />
                {devPanelOpen ? 'Close Dev Panel' : 'Dev Controls'}
            </button>

            {devPanelOpen && (
                <div className="absolute bottom-12 left-0 bg-slate-900 border border-slate-700 rounded-xl p-4 w-80 shadow-2xl space-y-4 max-h-[80vh] overflow-y-auto">
                    {/* Edit Mode Selector */}
                    <div className="space-y-2">
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Edit Mode (others use saved configs)</p>
                        <div className="flex gap-2">
                            <button onClick={() => setDevEditMode('backdrop')} className={`flex-1 px-2 py-1.5 rounded text-[10px] font-bold uppercase transition-colors ${devEditMode === 'backdrop' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>Backdrop</button>
                            <button onClick={() => setDevEditMode('avatar')} className={`flex-1 px-2 py-1.5 rounded text-[10px] font-bold uppercase transition-colors ${devEditMode === 'avatar' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>Avatar</button>
                            <button onClick={() => setDevEditMode('companion')} className={`flex-1 px-2 py-1.5 rounded text-[10px] font-bold uppercase transition-colors ${devEditMode === 'companion' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>Companion</button>
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
                </div>
            )}
        </div>
    );
};
