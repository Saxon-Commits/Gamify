import React from 'react';

export interface CurrencyPack {
    amount: number;
    name: string;
    price: string;
    id: string;
    color: string;
    popular: boolean;
    image: string;
}

interface CurrencyPackCardProps {
    pack: CurrencyPack;
    onPurchase: (priceId: string) => void;
}

const COLOR_MAPS: Record<string, { blur: string, hoverBlur: string, hoverBorder: string, hoverShadow: string }> = {
    cyan: { blur: 'bg-cyan-500/10', hoverBlur: 'group-hover:bg-cyan-500/20', hoverBorder: 'hover:border-slate-400 dark:hover:border-slate-600', hoverShadow: '' },
    blue: { blur: 'bg-blue-500/10', hoverBlur: 'group-hover:bg-blue-500/20', hoverBorder: '', hoverShadow: '' },
    purple: { blur: 'bg-purple-500/10', hoverBlur: 'group-hover:bg-purple-500/20', hoverBorder: '', hoverShadow: '' },
    amber: { blur: 'bg-amber-500/10', hoverBlur: 'group-hover:bg-amber-500/20', hoverBorder: '', hoverShadow: '' },
};

export const CurrencyPackCard: React.FC<CurrencyPackCardProps> = ({ pack, onPurchase }) => {
    // Determine dynamic classes safely
    // Defaulting to cyan if not found to prevent crashes
    const colorClasses = COLOR_MAPS[pack.color] || COLOR_MAPS['cyan'];

    return (
        <div className={`relative bg-gradient-to-br from-white to-slate-100 dark:from-slate-900 dark:to-slate-950 border ${pack.popular ? 'border-cyan-500/50 shadow-cyan-500/20 shadow-lg' : 'border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600'} rounded-2xl p-3 flex items-center justify-between gap-3 group overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02]`}>

            {/* Background Flair Effects */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite] pointer-events-none" />
            <div className={`absolute -right-12 -top-12 w-32 h-32 blur-3xl rounded-full transition-colors pointer-events-none ${colorClasses.blur} ${colorClasses.hoverBlur}`} />

            {pack.popular && (
                <div className="absolute top-0 right-0 bg-gradient-to-bl from-cyan-600 to-blue-600 text-white text-[9px] font-black uppercase px-3 py-1 rounded-bl-xl shadow-lg z-10">
                    Best Value
                </div>
            )}

            <div className="flex items-center gap-3 relative z-10 flex-1 min-w-0">
                {/* Image Container - Slightly Reduced forSpace */}
                <div className="relative shrink-0">
                    <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity" />
                    <div className="w-16 h-16 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center shadow-inner relative z-10 group-hover:border-cyan-500/30 transition-colors">
                        <img src={pack.image} alt={`${pack.amount} Gems`} className="w-12 h-12 object-contain pixelated drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] group-hover:scale-110 transition-transform duration-300" />
                    </div>
                </div>

                <div className="flex flex-col gap-0.5 min-w-0">
                    <div className="font-black text-slate-900 dark:text-white text-xl tracking-tight drop-shadow-sm">{pack.amount}</div>
                    <div className="text-[9px] text-cyan-600 dark:text-cyan-400 font-bold uppercase tracking-wide bg-cyan-100/50 dark:bg-cyan-950/30 px-1.5 py-0.5 rounded border border-cyan-200 dark:border-cyan-900/50 w-fit whitespace-nowrap overflow-hidden text-ellipsis">
                        {pack.name.replace(' Gems', '')} <span className="text-cyan-600 ml-0.5">GEMS</span>
                    </div>
                </div>
            </div>

            <button
                onClick={() => onPurchase(pack.id)}
                className={`
                    shrink-0 px-4 py-2.5 rounded-lg font-black text-xs uppercase tracking-wider transition-all relative overflow-hidden group/btn
                    bg-slate-900 text-slate-300 border border-slate-700
                    hover:bg-cyan-500 hover:text-black hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]
                `}
            >
                <span className="relative z-10 whitespace-nowrap">{pack.price}</span>
            </button>
        </div>
    );
};
