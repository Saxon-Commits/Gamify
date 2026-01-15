import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToastStore, ToastMessage, RewardType } from '../../store/useToastStore';
import { Sparkles, Coins, Zap, Diamond, Package, Crown, CheckCircle2 } from 'lucide-react';

const icons: Record<RewardType, any> = {
    xp: Zap,
    gold: Coins,
    gems: Diamond,
    item: Package,
    success: CheckCircle2,
};

const colors: Record<RewardType, string> = {
    xp: 'from-cyan-500 to-blue-600 shadow-cyan-500/50',
    gold: 'from-yellow-400 to-amber-600 shadow-amber-500/50',
    gems: 'from-fuchsia-500 to-pink-600 shadow-pink-500/50',
    item: 'from-emerald-400 to-green-600 shadow-green-500/50',
    success: 'from-indigo-400 to-violet-600 shadow-indigo-500/50',
};

const RewardToast: React.FC<{ toast: ToastMessage }> = ({ toast }) => {
    const Icon = icons[toast.type] || Sparkles;
    const gradient = colors[toast.type] || colors.xp;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: -50, scale: 0.3, rotateX: -90 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className={`
                pointer-events-auto
                relative flex items-center gap-4 pl-4 pr-6 py-3
                rounded-2xl border border-white/10
                bg-slate-900/80 backdrop-blur-xl
                shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)]
                group
                overflow-hidden
            `}
        >
            {/* Glow Background */}
            <div className={`absolute inset-0 opacity-20 bg-gradient-to-r ${gradient} blur-xl group-hover:opacity-30 transition-opacity`} />

            {/* Icon Circle */}
            <div className={`relative z-10 w-10 h-10 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
                <Icon size={20} className="text-white drop-shadow-md" />
                {/* Ping Effect */}
                <div className="absolute inset-0 rounded-full bg-white opacity-50 animate-ping" />
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col">
                <span className={`text-[10px] font-black uppercase tracking-widest bg-clip-text text-transparent bg-gradient-to-r ${gradient}`}>
                    {toast.type === 'item' ? 'Item Received' : toast.type === 'success' ? 'System Notification' : 'Reward Claimed'}
                </span>
                <div className="flex items-baseline gap-1.5 text-white">
                    {Number(toast.amount) > 0 && <span className="text-xl font-black">{toast.amount}</span>}
                    <span className="text-xs font-bold text-slate-300 uppercase">{toast.message}</span>
                </div>
            </div>

            {/* Shine Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
        </motion.div>
    );
};

export const RewardToastContainer = () => {
    const toasts = useToastStore((state) => state.toasts);

    return (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 pointer-events-none w-auto items-center">
            <AnimatePresence mode="popLayout">
                {toasts.map((toast) => (
                    <RewardToast key={toast.id} toast={toast} />
                ))}
            </AnimatePresence>
        </div>
    );
};
