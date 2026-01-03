import React, { useState } from 'react';
import { Package, Smartphone, Coffee, Monitor, ShoppingBag, Calendar, Zap, Sparkles, Play } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { InventoryItem } from '../types';

export const Inventory: React.FC = () => {
    const { inventory, useItem } = useGameStore();
    const [toast, setToast] = useState<{ msg: string, type: 'success' | 'error' } | null>(null);

    const handleUse = (e: React.MouseEvent, itemId: string) => {
        e.stopPropagation();
        const result = useItem(itemId);
        setToast({ msg: result.message, type: result.success ? 'success' : 'error' });
        setTimeout(() => setToast(null), 3000);
    };

    const getItemIcon = (type: string) => {
        switch (type) {
            case 'REAL_LIFE': return <Coffee className="text-amber-400" size={24} />;
            case 'SYSTEM': return <Zap className="text-blue-400" size={24} />;
            case 'BLACK_MARKET': return <Sparkles className="text-purple-400" size={24} />;
            default: return <ShoppingBag className="text-slate-400" size={24} />;
        }
    };

    return (
        <div className="space-y-8 p-6 pb-24 max-w-7xl mx-auto min-h-screen relative">
            {toast && (
                <div className={`fixed top-8 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-full font-bold shadow-2xl animate-in slide-in-from-top-4 fade-in duration-300 ${toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                    {toast.msg}
                </div>
            )}

            <header className="flex items-center justify-between border-b border-slate-800 pb-6">
                <div>
                    <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                        <Package className="text-indigo-400" size={32} />
                        INVENTORY
                    </h2>
                    <p className="text-slate-400 mt-1 text-sm">Your accumulated assets. Click to Use.</p>
                </div>
                <div className="text-slate-500 font-mono text-xs">
                    {inventory.length} Items
                </div>
            </header>

            {inventory.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-slate-800 rounded-3xl bg-slate-900/30">
                    <ShoppingBag size={64} className="text-slate-700 mb-4" />
                    <h3 className="text-xl font-bold text-slate-500">Inventory Empty</h3>
                    <p className="text-slate-600 mt-2">Visit the Shop to acquire items!</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                    {inventory.map((item) => (
                        <div key={item.id} className="relative group">
                            {/* Item Card */}
                            <div className="aspect-square bg-slate-900 border border-slate-800 rounded-xl flex flex-col items-center justify-center p-3 gap-2 hover:border-indigo-500/50 hover:bg-slate-800 transition-all cursor-default relative overflow-hidden">
                                <div className="p-3 bg-slate-950 rounded-lg shadow-inner flex items-center justify-center overflow-hidden">
                                    {item.imageUrl ? (
                                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover pixelated" />
                                    ) : (
                                        getItemIcon(item.type)
                                    )}
                                </div>
                                <div className="text-xs font-bold text-slate-300 text-center leading-tight line-clamp-2 w-full">
                                    {item.name}
                                </div>
                                {item.quantity > 1 && (
                                    <div className="absolute top-2 right-2 bg-slate-800 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded text-white border border-slate-700 shadow-sm z-10">
                                        x{item.quantity}
                                    </div>
                                )}

                                <button
                                    onClick={(e) => handleUse(e, item.id)}
                                    className="scale-0 group-hover:scale-100 absolute bottom-2 left-2 right-2 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold py-1.5 rounded shadow-lg transition-all flex items-center justify-center gap-1 active:scale-95 z-20"
                                >
                                    <Play size={10} fill="currentColor" /> USE
                                </button>
                            </div>

                            {/* Hover Tooltip (Info only now since we have a button on card) */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-56 bg-slate-900 border border-slate-700 p-4 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none scale-95 group-hover:scale-100 origin-bottom">
                                <div className="flex items-start gap-3 mb-3 border-b border-slate-800 pb-3">
                                    <div className="p-2 bg-slate-950 rounded-lg shrink-0">
                                        {React.cloneElement(getItemIcon(item.type) as React.ReactElement, { size: 16 })}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white text-sm leading-tight">{item.name}</h4>
                                        <span className="text-[10px] text-indigo-400 font-mono uppercase tracking-wide">
                                            {item.type.replace('_', ' ')}
                                        </span>
                                    </div>
                                </div>

                                <p className="text-slate-400 text-xs mb-3 leading-relaxed">
                                    {item.description || "No description available."}
                                </p>
                                {item.flavor && <p className="text-[10px] text-slate-600 italic border-l-2 border-slate-800 pl-2 mb-2">"{item.flavor}"</p>}

                                <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-900 border-r border-b border-slate-700 rotate-45"></div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
