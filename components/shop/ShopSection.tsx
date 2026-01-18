import React, { ReactNode } from 'react';

interface ShopSectionProps {
    title: string;
    description: string;
    icon: ReactNode;
    titleColorClass: string;
    children: ReactNode;
    className?: string;
}

export const ShopSection: React.FC<ShopSectionProps> = ({ title, description, icon, titleColorClass, children, className }) => {
    return (
        <div className={`bg-white/40 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden flex flex-col h-[500px] lg:h-[75vh] ${className || ''}`}>
            <div className="bg-white/80 dark:bg-slate-900/80 p-4 border-b border-slate-200 dark:border-slate-800 backdrop-blur-sm shrink-0">
                <h3 className={`text-sm font-bold ${titleColorClass} uppercase tracking-widest flex items-center gap-2`}>
                    {icon} {title}
                </h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-2 leading-relaxed opacity-80">
                    {description}
                </p>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
                {children}
            </div>
        </div>
    );
};
