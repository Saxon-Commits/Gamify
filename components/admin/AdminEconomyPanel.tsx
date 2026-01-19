import React from 'react';
import { Coins, Gem, Gift } from 'lucide-react';

interface AdminEconomyPanelProps {
    selectedUser: any;
    customAmount: number;
    selectedItemId: string;
    grantableItems: any[];
    onCustomAmountChange: (amount: number) => void;
    onSelectedItemChange: (itemId: string) => void;
    onGrantGold: (amount: number) => void;
    onGrantGems: (amount: number) => void;
    onGrantItem: () => void;
}

export const AdminEconomyPanel: React.FC<AdminEconomyPanelProps> = ({
    selectedUser,
    customAmount,
    selectedItemId,
    grantableItems,
    onCustomAmountChange,
    onSelectedItemChange,
    onGrantGold,
    onGrantGems,
    onGrantItem,
}) => {
    if (!selectedUser) return null;

    return (
        <>
            <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase text-emerald-500">Economy Injection</h4>

                {/* GOLD SECTION */}
                <div className="space-y-2">
                    <h5 className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1"><Coins size={10} /> Grant Gold</h5>
                    <div className="grid grid-cols-3 gap-2">
                        <button onClick={() => onGrantGold(1000)} className="bg-emerald-900/30 hover:bg-emerald-900/50 border border-emerald-900 text-emerald-400 py-2 rounded text-xs font-bold transition-colors">+1k</button>
                        <button onClick={() => onGrantGold(10000)} className="bg-emerald-900/30 hover:bg-emerald-900/50 border border-emerald-900 text-emerald-400 py-2 rounded text-xs font-bold transition-colors">+10k</button>
                        <button onClick={() => onGrantGold(100000)} className="bg-emerald-900/30 hover:bg-emerald-900/50 border border-emerald-900 text-emerald-400 py-2 rounded text-xs font-bold transition-colors">+100k</button>
                    </div>
                </div>

                {/* GEMS SECTION */}
                <div className="space-y-2">
                    <h5 className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1"><Gem size={10} /> Grant Gems</h5>
                    <div className="grid grid-cols-3 gap-2">
                        <button onClick={() => onGrantGems(10)} className="bg-purple-900/30 hover:bg-purple-900/50 border border-purple-900 text-purple-400 py-2 rounded text-xs font-bold transition-colors">+10</button>
                        <button onClick={() => onGrantGems(100)} className="bg-purple-900/30 hover:bg-purple-900/50 border border-purple-900 text-purple-400 py-2 rounded text-xs font-bold transition-colors">+100</button>
                        <button onClick={() => onGrantGems(500)} className="bg-purple-900/30 hover:bg-purple-900/50 border border-purple-900 text-purple-400 py-2 rounded text-xs font-bold transition-colors">+500</button>
                    </div>
                </div>

                {/* CUSTOM AMOUNT SECTION */}
                <div className="pt-2 border-t border-slate-800 space-y-2">
                    <h5 className="text-[10px] font-bold text-slate-500 uppercase">Custom Amount</h5>
                    <div className="flex gap-2">
                        <input
                            type="number"
                            placeholder="Amount"
                            className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1 text-xs focus:border-red-500 outline-none"
                            value={customAmount}
                            onChange={(e) => onCustomAmountChange(Number(e.target.value))}
                        />
                        <button onClick={() => onGrantGold(customAmount)} className="bg-emerald-600 hover:bg-emerald-500 text-white rounded px-3 text-xs font-bold">Gold</button>
                        <button onClick={() => onGrantGems(customAmount)} className="bg-purple-600 hover:bg-purple-500 text-white rounded px-3 text-xs font-bold">Gems</button>
                    </div>
                </div>
            </div>

            {/* ITEM INJECTION SECTION */}
            <div className="space-y-2 pt-4 border-t border-slate-800">
                <h5 className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                    <Gift size={10} /> Grant Item (Santa Clause)
                </h5>
                <div className="flex gap-2">
                    <select
                        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                        value={selectedItemId}
                        onChange={(e) => onSelectedItemChange(e.target.value)}
                    >
                        <option value="">Select an Item...</option>
                        <optgroup label="Items">
                            {grantableItems.filter(i => i.type === 'IN_GAME' || i.type === 'BLACK_MARKET').map(i => (
                                <option key={i.id} value={i.id}>{i.name} ({i.rarity})</option>
                            ))}
                        </optgroup>
                        <optgroup label="Avatars & Cosmetics">
                            {grantableItems.filter(i => i.type === 'AVATAR' || i.type === 'THEME').map(i => (
                                <option key={i.id} value={i.id}>{i.name} ({i.rarity})</option>
                            ))}
                        </optgroup>
                        <optgroup label="Companions">
                            {grantableItems.filter(i => i.type === 'COMPANION' || (i as any).type === 'ACCESSORY').map(i => (
                                <option key={i.id} value={i.id}>{i.name} ({i.rarity})</option>
                            ))}
                        </optgroup>
                    </select>
                    <button
                        onClick={onGrantItem}
                        disabled={!selectedItemId}
                        className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 rounded text-xs font-bold whitespace-nowrap"
                    >
                        GRANT
                    </button>
                </div>
            </div>
        </>
    );
};
