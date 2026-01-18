import React from 'react';
import { X, Coins, Diamond, Sparkles } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import { SHOP_ITEMS } from '../../src/utils/GameEconomy';

interface ShopItemPreviewModalProps {
    item: any;
    onClose: () => void;
    onAddItem: (item: any) => void;
}

export const ShopItemPreviewModal: React.FC<ShopItemPreviewModalProps> = ({ item, onClose, onAddItem }) => {
    const { buyItem } = useGameStore();

    if (!item) return null;

    const handlePurchase = () => {
        if (item.premiumPrice) {
            const isOwned = useGameStore.getState().inventory.some(owned => owned.id === item.id);
            if (isOwned) return;
            if (confirm(`Purchase ${item.name} for ${item.premiumPrice} Gems?`)) {
                const success = buyItem(item);
                if (!success) alert("Not enough Gems!");
                else onClose();
            }
        } else {
            onAddItem(item);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
            <div className="relative z-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden max-w-lg w-full shadow-2xl animate-in fade-in zoom-in duration-200">
                {/* Header / Image */}
                <div className="aspect-video bg-black relative flex items-center justify-center overflow-hidden">
                    {(item.imageUrl?.endsWith('.mp4')) ? (
                        <video
                            src={item.imageUrl}
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="w-full h-full object-cover opacity-90"
                        />
                    ) : (
                        <img
                            src={item.imageUrl || '/images/ui/unknown.png'}
                            alt={item.name}
                            className="w-full h-full object-contain p-8 pixelated"
                        />
                    )}
                    <div className="absolute top-2 right-2">
                        <button onClick={onClose} className="p-2 bg-black/50 hover:bg-black/80 text-white rounded-full transition-colors">
                            <X size={20} />
                        </button>
                    </div>
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-900 to-transparent p-6 pt-12">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">{item.rarity || 'Common'} • {item.type}</div>
                                <h2 className="text-2xl font-black text-white uppercase tracking-tight">{item.name}</h2>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    <div>
                        <h4 className="text-sm font-bold text-slate-500 dark:text-slate-300 uppercase tracking-widest mb-2">Description</h4>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">{item.description}</p>
                        {item.flavor && <p className="text-slate-500 dark:text-slate-500 italic mt-2 text-xs">"{item.flavor}"</p>}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                        <div className="flex-1">
                            <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">Cost</div>
                            <div className="text-xl font-black text-amber-500 flex items-center gap-1">
                                {item.premiumPrice ? (
                                    <><Diamond size={18} /> {item.premiumPrice}</>
                                ) : item.currency === 'VOID_SHARD' ? (
                                    <><Sparkles size={18} className="text-purple-500" /> {item.cost}</>
                                ) : (
                                    <><Coins size={18} /> {item.cost}</>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={handlePurchase}
                            className="flex-[2] py-3 bg-amber-500 hover:bg-amber-600 text-black font-black uppercase tracking-wider rounded-xl transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                        >
                            Purchase
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
