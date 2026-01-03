import React, { useState, useEffect } from 'react';
import { Eraser, Save, ArrowLeft, Book, Info } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { RichTextEditor } from '../../components/RichTextEditor';
import { useGameStore } from '../../store/useGameStore';
import { JournalEntry } from '../../types';

export const MindWipe: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    // Use type assertion for location state
    const editEntry = (location.state as { entry?: JournalEntry })?.entry;

    const { addJournalEntry, updateJournalEntry } = useGameStore();

    // Initialize state with existing entry if available
    const [content, setContent] = useState(editEntry?.content || '');
    const [title, setTitle] = useState(editEntry?.title || '');

    // Reset state if location changes (e.g. creating new after editing)
    useEffect(() => {
        if (editEntry) {
            setContent(editEntry.content);
            setTitle(editEntry.title);
        } else {
            // New Entry mode
            setContent('');
            setTitle('');
        }
    }, [editEntry]);


    const handleSave = () => {
        // Strip HTML tags to check if there is actual content
        const plainText = content.replace(/<[^>]*>/g, '').trim();
        if (!plainText && !content.includes('<img')) return;

        if (editEntry) {
            // UPDATE existing entry
            updateJournalEntry({
                ...editEntry,
                title: title || editEntry.title,
                content: content,
                // Make sure to preserve other fields like id, date, folder etc.
                // We update date to now? Or keep original? Usually update date modified.
                // For now let's keep original acquired date but maybe we want a modified date? 
                // The interface only has date. Let's keep original date for history.
            });
        } else {
            // CREATE new entry
            addJournalEntry({
                title: title || `Mind Wipe - ${new Date().toLocaleDateString()}`,
                content,
                tags: ['Mind Wipe', 'Brain Dump'],
                folder: 'Mind Wipes'
            });
        }

        // Navigate back to journal immediately
        navigate('/journal');
    };

    return (
        <div className="h-screen bg-slate-950 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm z-10">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                            <Book size={20} />
                        </div>
                        <div>
                            <div>
                                <h1 className="font-bold text-slate-200">{editEntry ? 'Edit Entry' : 'Journal Entry'}</h1>
                                <p className="text-xs text-slate-500">Document your journey.</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/journal')}
                            className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold transition-colors border border-slate-700"
                        >
                            <Book size={14} />
                            <span>View Log</span>
                        </button>
                        <input
                            type="text"
                            placeholder="Title (Optional)"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-300 focus:border-purple-500 outline-none w-48 md:w-64"
                        />
                        <button
                            onClick={handleSave}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold text-sm transition-colors"
                        >
                            <Save size={16} />
                            <span>{editEntry ? 'Update Entry' : 'Save to Journal'}</span>
                        </button>
                    </div>
                </div>

                {/* Editor Container */}
                {/* Editor Container */}
                <div className="flex-1 flex flex-col min-h-0 p-4 md:p-8 max-w-5xl mx-auto w-full">
                    <div className="flex-1 h-full overflow-hidden">
                        <RichTextEditor
                            value={content}
                            onChange={setContent}
                        />
                    </div>
                </div>
                {/* Journal Guide */}
                <div className="mt-4 p-4 rounded-xl bg-slate-900/50 border border-slate-800 flex items-start gap-3">
                    <Info size={16} className="text-slate-500 mt-0.5 flex-shrink-0" />
                    <div className="space-y-1">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Journal Guide</h4>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            Use this journal to track your daily progress, reflect on your quests, or simply clear your mind ("Mind Wipe"). Consistent journaling rewards you with Mental XP and clarity.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
