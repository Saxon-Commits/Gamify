import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, StickyNote } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { RichTextEditor } from './RichTextEditor';

export const NotesPanel: React.FC = () => {
    const { isNotesOpen, toggleNotes, notesContent, setNotesContent } = useGameStore();

    return (
        <AnimatePresence>
            {isNotesOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => toggleNotes(false)}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[90]"
                    />

                    {/* Panel */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 bottom-0 w-full max-w-lg bg-slate-950 border-l border-slate-800 shadow-2xl z-[100] flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/50">
                            <div className="flex items-center gap-2 text-amber-400 font-bold uppercase tracking-wider">
                                <StickyNote size={20} />
                                <span>Adventurer's Log</span>
                            </div>
                            <button
                                onClick={() => toggleNotes(false)}
                                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 p-4 overflow-hidden flex flex-col">
                            <RichTextEditor
                                initialContent={notesContent}
                                onChange={setNotesContent}
                            />
                        </div>

                        {/* Footer / Status */}
                        <div className="p-2 bg-slate-900 text-[10px] text-slate-500 text-center border-t border-slate-800">
                            Auto-saving to neural link...
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
