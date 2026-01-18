import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, ChevronLeft, ChevronRight } from 'lucide-react';

const FoundationsCarousel: React.FC<{ projects: any[], activeProjectId: string | null, onProjectClick: (id: string) => void }> = ({ projects, activeProjectId, onProjectClick }) => {
    const [index, setIndex] = useState(0);

    // Filter only foundation projects
    const foundations = projects.filter(p => ['col-todo', 'col-habit', 'col-guild'].includes(p.id));

    const nextSlide = () => {
        setIndex((prev) => (prev + 1) % foundations.length);
    };

    const prevSlide = () => {
        setIndex((prev) => (prev - 1 + foundations.length) % foundations.length);
    };

    const currentProject = foundations[index];

    if (!currentProject) return null;

    // Calculate Level
    const level = Math.floor(currentProject.hp / 100) + 1; // Simplified level logic
    const progress = (currentProject.hp % 100);

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-lg select-none">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Trophy size={12} />
                    <span>Foundations</span>
                </h3>
                {/* Dots */}
                <div className="flex gap-1">
                    {foundations.map((_, i) => (
                        <div
                            key={i}
                            className={`w-1.5 h-1.5 rounded-full transition-colors ${i === index ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-slate-700'}`}
                        />
                    ))}
                </div>
            </div>

            <div className="relative h-48 group">
                <AnimatePresence mode='wait'>
                    <motion.div
                        key={currentProject.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="absolute inset-0 cursor-pointer"
                        onClick={() => onProjectClick(currentProject.id)}
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={0.2}
                        onDragEnd={(e, { offset, velocity }) => {
                            const swipe = offset.x; // Drag distance
                            if (swipe < -50) nextSlide();
                            else if (swipe > 50) prevSlide();
                        }}
                    >
                        {/* Background Image */}
                        {currentProject.backgroundImage ? (
                            <img
                                src={currentProject.backgroundImage}
                                alt={currentProject.name}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900" />
                        )}

                        {/* Overlay Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                        {/* Content */}
                        <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                            <div className="flex items-center gap-2 mb-1">
                                {currentProject.icon && <img src={currentProject.icon} className="w-5 h-5 object-contain" />}
                                <span className="text-[10px] font-bold uppercase tracking-widest text-white/70">Level {level}</span>
                            </div>
                            <h4 className="text-xl font-black leading-tight mb-2 tracking-wide font-sans">{currentProject.name}</h4>

                            {/* Progress Bar */}
                            <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
                                <div
                                    className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <div className="flex justify-between mt-1.5">
                                <span className="text-[10px] text-white/60 font-medium">{progress} / 100 XP</span>
                                <span className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider">Active</span>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Navigation Arrows (Visible on Hover / Mobile?) */}
                <button
                    onClick={(e) => { e.stopPropagation(); prevSlide(); }}
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/30 text-white/70 hover:bg-black/50 hover:text-white backdrop-blur-md transition-all opacity-0 group-hover:opacity-100"
                >
                    <ChevronLeft size={20} />
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); nextSlide(); }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/30 text-white/70 hover:bg-black/50 hover:text-white backdrop-blur-md transition-all opacity-0 group-hover:opacity-100"
                >
                    <ChevronRight size={20} />
                </button>
            </div>
        </div>
    );
};

export default FoundationsCarousel;
