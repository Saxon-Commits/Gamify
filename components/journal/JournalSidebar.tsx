import React, { useState } from 'react';
import { Plus, Book, ChevronDown, Sun, Moon, Lightbulb, Folder, Search, CheckSquare, Square, Trash2, Calendar } from 'lucide-react';
import { JournalEntry } from '../../types';

const QuickLogWidget = ({ onQuickLog }: { onQuickLog: (mood: string, energy: number) => void }) => {
    const [mood, setMood] = useState('🙂');
    const [energy, setEnergy] = useState(5);

    const handleQuickLog = () => {
        onQuickLog(mood, energy);
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 mb-4 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Inkwell: Quick Log</h3>
            <div className="flex justify-between mb-4">
                {['🔥', '🙂', '😐', '🌧️'].map(m => (
                    <button
                        key={m}
                        onClick={() => setMood(m)}
                        className={`text-2xl p-2 rounded-lg transition-colors ${mood === m ? 'bg-amber-100 dark:bg-amber-900/30' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                    >
                        {m}
                    </button>
                ))}
            </div>
            <div className="flex items-center gap-2 mb-4">
                <span className="text-xs font-bold text-slate-500">ENG</span>
                <input
                    type="range"
                    min="1"
                    max="10"
                    value={energy}
                    onChange={(e) => setEnergy(parseInt(e.target.value))}
                    className="flex-1 h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <span className="text-xs font-bold text-amber-500 w-4 text-right">{energy}</span>
            </div>
            <button
                onClick={handleQuickLog}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition-colors"
            >
                Log Entry
            </button>
        </div>
    );
};

interface JournalSidebarProps {
    folders: string[];
    selectedFolder: string | 'All';
    entries: JournalEntry[];
    selectedEntry: JournalEntry | null;
    selectedIds: string[];
    searchQuery: string;
    isEditing: boolean;
    inkwellUnlocked: boolean;
    grimoireUnlocked: boolean;
    totalEntries: number;
    templates: Array<{ label: string; icon: string; title: string; content: string }>;
    onSelectFolder: (folder: string) => void;
    onSelectEntry: (entry: JournalEntry) => void;
    onSearchChange: (query: string) => void;
    onNewEntry: () => void;
    onToggleSelect: (id: string, e: React.MouseEvent) => void;
    onSelectAll: () => void;
    onBulkDelete: () => void;
    onDelete: (id: string, e: React.MouseEvent) => void;
    onApplyTemplate: (template: any) => void;
    onQuickLog: (mood: string, energy: number) => void;
}

export const JournalSidebar: React.FC<JournalSidebarProps> = ({
    folders,
    selectedFolder,
    entries,
    selectedEntry,
    selectedIds,
    searchQuery,
    isEditing,
    inkwellUnlocked,
    grimoireUnlocked,
    totalEntries,
    templates,
    onSelectFolder,
    onSelectEntry,
    onSearchChange,
    onNewEntry,
    onToggleSelect,
    onSelectAll,
    onBulkDelete,
    onDelete,
    onApplyTemplate,
    onQuickLog,
}) => {
    const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);

    const handleApplyTemplate = (template: any) => {
        setIsTemplatesOpen(false);
        onApplyTemplate(template);
    };

    return (
        <div className={`w-full lg:w-80 flex-col gap-4 flex-shrink-0 ${selectedEntry || isEditing ? 'hidden lg:flex' : 'flex'}`}>
            <button
                onClick={onNewEntry}
                className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-purple-900/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
                <Plus size={18} />
                <span>New Entry</span>
            </button>

            {/* The Grimoire (Templates) */}
            {grimoireUnlocked && (
                <div className="relative">
                    <button
                        onClick={() => setIsTemplatesOpen(!isTemplatesOpen)}
                        className="w-full py-2 bg-indigo-900/30 hover:bg-indigo-900/50 text-indigo-300 border border-indigo-800/50 rounded-xl font-bold flex items-center justify-center gap-2 transition-all uppercase text-xs tracking-wider"
                    >
                        <Book size={14} />
                        <span>The Grimoire</span>
                        {isTemplatesOpen ? <ChevronDown size={14} className="rotate-180 transition-transform" /> : <ChevronDown size={14} className="transition-transform" />}
                    </button>

                    {isTemplatesOpen && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden z-20 animate-in slide-in-from-top-2 duration-200">
                            {templates.map(template => (
                                <button
                                    key={template.label}
                                    onClick={() => handleApplyTemplate(template)}
                                    className="w-full text-left px-4 py-3 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-3 border-b border-slate-700/50 last:border-0"
                                >
                                    <span className="text-indigo-400">
                                        {template.icon === 'Sun' && <Sun size={14} />}
                                        {template.icon === 'Moon' && <Moon size={14} />}
                                        {template.icon === 'Lightbulb' && <Lightbulb size={14} />}
                                    </span>
                                    <span className="text-xs font-bold uppercase">{template.label}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Quick Log Widget */}
            {inkwellUnlocked && <QuickLogWidget onQuickLog={onQuickLog} />}

            {/* Folders */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
                <h2 className="text-xs font-bold text-slate-500 dark:text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Folder size={12} />
                    <span>Archives</span>
                </h2>
                <div className="space-y-1">
                    {folders.map(folder => (
                        <button
                            key={folder}
                            onClick={() => onSelectFolder(folder)}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-between ${selectedFolder === folder
                                ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                        >
                            <span>{folder}</span>
                            {folder === 'All' && <span className="text-xs opacity-50">{totalEntries}</span>}
                        </button>
                    ))}
                </div>
            </div>

            {/* Entry List */}
            <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col overflow-hidden">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-slate-400 dark:text-slate-600" size={16} />
                        <input
                            type="text"
                            placeholder="Search chronicles..."
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-900 dark:text-slate-300 focus:border-indigo-500 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-700"
                        />
                    </div>
                </div>

                {/* Bulk Actions Header */}
                {entries.length > 0 && (
                    <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
                        <button
                            onClick={onSelectAll}
                            className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-indigo-500 transition-colors"
                        >
                            {selectedIds.length === entries.length && entries.length > 0 ? (
                                <CheckSquare size={16} className="text-indigo-500" />
                            ) : (
                                <Square size={16} />
                            )}
                            <span>Select All</span>
                        </button>

                        {selectedIds.length > 0 && (
                            <button
                                onClick={onBulkDelete}
                                className="flex items-center gap-1 text-xs font-bold text-red-500 hover:text-red-400 bg-red-500/10 hover:bg-red-500/20 px-2 py-1 rounded transition-colors"
                            >
                                <Trash2 size={14} />
                                <span>Delete ({selectedIds.length})</span>
                            </button>
                        )}
                    </div>
                )}

                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {entries.length === 0 ? (
                        <div className="text-center p-8 text-slate-400 dark:text-slate-600 text-sm italic">
                            No entries found.
                        </div>
                    ) : (
                        entries.map(entry => (
                            <div
                                key={entry.id}
                                onClick={() => onSelectEntry(entry)}
                                className={`w-full text-left p-3 rounded-xl border transition-all group relative cursor-pointer flex gap-3 ${selectedEntry?.id === entry.id
                                    ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/50'
                                    : 'bg-white dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                                    }`}
                            >
                                {/* Checkbox */}
                                <div
                                    onClick={(e) => onToggleSelect(entry.id, e)}
                                    className="pt-1 text-slate-400 hover:text-indigo-500 transition-colors"
                                >
                                    {selectedIds.includes(entry.id) ? (
                                        <CheckSquare size={16} className="text-indigo-500" />
                                    ) : (
                                        <Square size={16} />
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h3 className={`font-bold text-sm truncate pr-6 ${selectedEntry?.id === entry.id ? 'text-amber-700 dark:text-amber-200' : 'text-slate-700 dark:text-slate-300'}`}>
                                        {entry.title}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                                        <Calendar size={12} />
                                        <span>{new Date(entry.date).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={(e) => onDelete(entry.id, e)}
                                    className="absolute right-2 top-2 p-1.5 rounded hover:bg-red-500/20 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
