import React, { useState } from 'react';
import { ShoppingCart, ShoppingBag, X, Minus, Plus, Tv, Coffee, Gift, Zap, Dna } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';

interface ShopCartProps {
    onAvatarUnlocked: (avatarId: string) => void;
}

export const ShopCart: React.FC<ShopCartProps> = ({ onAvatarUnlocked }) => {
    const { cart, stats, addToCart, removeFromCart, purchaseCart } = useGameStore();
    const [isOpen, setIsOpen] = useState(false);

    const cartTotal = cart.reduce((sum, i) => sum + ((i.cost || 0) * i.quantity), 0);
    const cartItemCount = cart.reduce((sum, i) => sum + i.quantity, 0);

    // Icons map for specific items
    const icons: Record<string, any> = {
        netflix: Tv,
        cheat_meal: Coffee,
        new_book: Gift,
        potion_freeze: Zap,
        shard_fragment: Dna
    };

    const handleCheckout = () => {
        // Check for avatar in cart BEFORE purchase clears it
        const avatarInCart = cart.find(i => i.type === 'AVATAR');

        if (purchaseCart()) {
            setIsOpen(false);
            if (avatarInCart) {
                onAvatarUnlocked(avatarInCart.id);
            }
        } else {
            alert("Not enough gold (or shards) to complete purchase!");
        }
    };

    if (cartItemCount === 0 && !isOpen) return null;

    return (
        <>
            {/* CART DRAWER BUTTON */}
            {cartItemCount > 0 && !isOpen && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-40">
                    <div
                        onClick={() => setIsOpen(true)}
                        className="bg-indigo-600 hover:bg-indigo-500 cursor-pointer text-white p-4 rounded-2xl shadow-2xl shadow-indigo-900/50 border border-indigo-400/50 flex items-center justify-between transition-all active:scale-95"
                    >
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-lg">
                                <ShoppingCart size={20} className="text-white" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-bold opacity-80 uppercase tracking-wider">Shopping Cart</span>
                                <span className="font-black text-lg leading-none">{cartItemCount} Items</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <span className="text-xs font-medium opacity-70 block">Total</span>
                                <span className="font-bold font-mono">{cartTotal}g</span>
                            </div>
                            <div className="bg-white/20 px-3 py-1.5 rounded-lg text-xs font-bold uppercase">
                                Review
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* CART MODAL */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/90 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
                        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 sticky top-0">
                            <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                                <ShoppingCart className="text-indigo-400" />
                                Review Order
                            </h3>
                            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 transition-colors"><X size={20} /></button>
                        </div>

                        <div className="p-4 overflow-y-auto space-y-3 flex-1">
                            {cart.length === 0 ? (
                                <p className="text-center text-slate-500 py-8">Your cart is empty.</p>
                            ) : cart.map(item => (
                                <div key={item.id} className="flex items-center justify-between bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-slate-100 dark:bg-slate-900 rounded-lg flex items-center justify-center text-slate-500 dark:text-slate-400">
                                            {icons[item.id] ? React.createElement(icons[item.id], { size: 18 }) : <ShoppingBag size={18} />}
                                        </div>
                                        <div>
                                            <div className="font-bold text-sm text-slate-800 dark:text-slate-200">{item.name}</div>
                                            <div className="text-xs text-amber-500 font-mono">{item.cost}g</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 bg-slate-900 rounded-lg p-1">
                                        <button onClick={() => removeFromCart(item.id)} className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-red-400"><Minus size={14} /></button>
                                        <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                                        <button onClick={() => addToCart(item)} className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-green-400"><Plus size={14} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-slate-400 text-sm">Total Cost</span>
                                <span className={`text-xl font-black font-mono ${stats.gold < cartTotal ? 'text-red-500' : 'text-amber-400'}`}>
                                    {cartTotal}g
                                </span>
                            </div>

                            <button
                                onClick={handleCheckout}
                                disabled={cart.length === 0 || stats.gold < cartTotal}
                                className={`w-full py-4 rounded-xl font-black uppercase tracking-wider text-sm flex items-center justify-center gap-2 transition-all
                                ${cart.length === 0 || stats.gold < cartTotal
                                        ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                                        : 'bg-green-500 hover:bg-green-400 text-white shadow-lg shadow-green-500/25 active:scale-[0.98]'}
                            `}
                            >
                                {stats.gold < cartTotal ? 'Insufficient Funds' : 'Confirm Purchase'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
