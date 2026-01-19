import React, { useState, useEffect } from 'react';
import { Book, Folder, FileText, Trash2, Calendar, Search, Save, X, Plus, ChevronLeft, BookOpen, CheckSquare, Square, ChevronDown, Sun, Moon, Lightbulb } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { useToastStore } from '../store/useToastStore';
import { JournalEntry } from '../types';
import { RichTextEditor } from '../components/RichTextEditor';
import { CharacterSidebar } from '../components/character/CharacterSidebar';
import { JournalReader } from '../components/journal/JournalReader';

const QuickLogWidget = () => {
    const { addJournalEntry } = useGameStore();
    const [mood, setMood] = useState('🙂');
    const [energy, setEnergy] = useState(5);

    const handleQuickLog = () => {
        const content = `<p><strong>Quick Log</strong></p><p>Mood: ${mood}</p><p>Energy: ${energy}/10</p>`;
        addJournalEntry({
            title: `Log: ${new Date().toLocaleTimeString()}`,
            content,
            tags: ['Quick Log', mood],
            folder: 'Journal'
        });

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

export const Journal: React.FC = () => {
    const { journalEntries, deleteJournalEntry, deleteJournalEntries, addJournalEntry, updateJournalEntry } = useGameStore();
    const [selectedFolder, setSelectedFolder] = useState<string | 'All'>('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    // Edit Mode State
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState('');
    const [editContent, setEditContent] = useState('');

    const folders = ['All', 'Journal', 'Grindstone Log'];

    const skillNodes = useGameStore(state => state.skillNodes);
    const inkwellUnlocked = skillNodes.find(n => n.id === 'branch_1-3')?.data.isUnlocked;
    const grimoireUnlocked = skillNodes.find(n => n.id === 'branch_1-6')?.data.isUnlocked;

    const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);

    const TEMPLATES = [
        { label: 'Morning Protocol', icon: 'Sun', title: `Morning Protocol - ${new Date().toLocaleDateString()}`, content: `<h3>🌅 Intentions</h3><p>What is the One Thing I must achieve today?</p><h3>🧠 Mental State</h3><p>Current mood: ...</p><h3>🛡️ Gratitude</h3><p>I am grateful for...</p>` },
        { label: 'Evening Review', icon: 'Moon', title: `Evening Review - ${new Date().toLocaleDateString()}`, content: `<h3>📉 Wins</h3><p>What went well Today?</p><h3>📈 Improvements</h3><p>What could be better?</p><h3>🔋 Energy</h3><p>Ending energy level: .../10</p>` },
        { label: 'Idea Forge', icon: 'Lightbulb', title: 'Idea: [Name]', content: `<h3>💡 The Concept</h3><p>...</p><h3>🔬 Why?</h3><p>...</p><h3>🚀 Next Steps</h3><ul><li></li></ul>` }
    ];

    const handleApplyTemplate = (template: typeof TEMPLATES[0]) => {
        setIsTemplatesOpen(false);
        setSelectedEntry(null);
        setEditTitle(template.title);
        setEditContent(template.content);
        setIsEditing(true);
    };

    const filteredEntries = journalEntries.filter(entry => {
        const matchesFolder = selectedFolder === 'All' || entry.folder === selectedFolder;
        const matchesSearch = entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            entry.content.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFolder && matchesSearch;
    });

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this entry?')) {
            deleteJournalEntry(id);
            if (selectedEntry?.id === id) {
                setSelectedEntry(null);
                setIsEditing(false);
            }
        }
    };

    const handleEdit = (entry: JournalEntry) => {
        setSelectedEntry(entry);
        setEditTitle(entry.title);
        setEditContent(entry.content);
        setIsEditing(true);
    };

    const handleToggleSelect = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(sid => sid !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const handleSelectAll = () => {
        if (selectedIds.length === filteredEntries.length && filteredEntries.length > 0) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredEntries.map(e => e.id));
        }
    };

    const handleBulkDelete = () => {
        if (selectedIds.length === 0) return;
        if (confirm(`Are you sure you want to delete ${selectedIds.length} entries?`)) {
            deleteJournalEntries(selectedIds);
            setSelectedIds([]);
            if (selectedEntry && selectedIds.includes(selectedEntry.id)) {
                setSelectedEntry(null);
                setIsEditing(false);
            }
        }
    };

    const handleNewEntry = () => {
        setSelectedEntry(null);
        setEditTitle('');
        setEditContent('');
        setIsEditing(true);
    };

    const handleSave = () => {
        if (!editTitle.trim()) return;

        if (selectedEntry) {
            // Update Existing
            const updated = {
                ...selectedEntry,
                title: editTitle,
                content: editContent,
                // optimized: could update date here if desired
            };
            updateJournalEntry(updated);
            setSelectedEntry(updated); // Update local selection to show changes
        } else {
            // Create New
            addJournalEntry({
                title: editTitle || `Journal Entry - ${new Date().toLocaleDateString()}`,
                content: editContent,
                folder: 'Journal', // Default folder
                tags: []
            });
            // Auto-select the new entry? 
            // Since we don't get the ID back synchronously from addJournalEntry easily without refactor, 
            // we'll just close edit mode. The new entry will appear at the top.
            // Ideally we'd select it. For now, just reset.
            setSelectedEntry(null);
        }
        setIsEditing(false);
    };

    const handleCancel = () => {
        setIsEditing(false);
        // If we were creating new, selectedEntry is null, so we go back to empty.
        // If we were editing, we go back to read view of that entry.
    };

    return (
        <div className="max-w-[95%] mx-auto pb-6">
            <div className="flex flex-col lg:flex-row h-[calc(100vh-6rem)] gap-0 lg:gap-8 mt-8">

                {/* 1. CHARACTER SIDEBAR (Matches QuestLog) */}
                <CharacterSidebar className="hidden lg:block w-full lg:w-48 flex-shrink-0 animate-in slide-in-from-left-4 duration-500 sticky top-0 h-fit" />

                {/* Sidebar / List (Original Journal Sidebar) */}
                <div className={`w-full lg:w-80 flex-col gap-4 flex-shrink-0 ${selectedEntry || isEditing ? 'hidden lg:flex' : 'flex'}`}>

                    <button
                        onClick={handleNewEntry}
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
                                    {TEMPLATES.map(template => (
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
                    {inkwellUnlocked && <QuickLogWidget />}

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
                                    onClick={() => setSelectedFolder(folder)}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-between ${selectedFolder === folder
                                        ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                        }`}
                                >
                                    <span>{folder}</span>
                                    {folder === 'All' && <span className="text-xs opacity-50">{journalEntries.length}</span>}
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
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-900 dark:text-slate-300 focus:border-indigo-500 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-700"
                                />
                            </div>
                        </div>

                        {/* Bulk Actions Header */}
                        {filteredEntries.length > 0 && (
                            <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
                                <button
                                    onClick={handleSelectAll}
                                    className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-indigo-500 transition-colors"
                                >
                                    {selectedIds.length === filteredEntries.length && filteredEntries.length > 0 ? (
                                        <CheckSquare size={16} className="text-indigo-500" />
                                    ) : (
                                        <Square size={16} />
                                    )}
                                    <span>Select All</span>
                                </button>

                                {selectedIds.length > 0 && (
                                    <button
                                        onClick={handleBulkDelete}
                                        className="flex items-center gap-1 text-xs font-bold text-red-500 hover:text-red-400 bg-red-500/10 hover:bg-red-500/20 px-2 py-1 rounded transition-colors"
                                    >
                                        <Trash2 size={14} />
                                        <span>Delete ({selectedIds.length})</span>
                                    </button>
                                )}
                            </div>
                        )}

                        <div className="flex-1 overflow-y-auto p-2 space-y-2">
                            {filteredEntries.length === 0 ? (
                                <div className="text-center p-8 text-slate-400 dark:text-slate-600 text-sm italic">
                                    No entries found.
                                </div>
                            ) : (
                                filteredEntries.map(entry => (
                                    <div
                                        key={entry.id}
                                        onClick={() => {
                                            if (isEditing && entry.id !== selectedEntry?.id) {
                                                if (!confirm("Discard unsaved changes?")) return;
                                            }
                                            setIsEditing(false);
                                            setSelectedEntry(entry);
                                        }}
                                        className={`w-full text-left p-3 rounded-xl border transition-all group relative cursor-pointer flex gap-3 ${selectedEntry?.id === entry.id
                                            ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/50'
                                            : 'bg-white dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                                            }`}
                                    >
                                        {/* Checkbox */}
                                        <div
                                            onClick={(e) => handleToggleSelect(entry.id, e)}
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
                                            onClick={(e) => handleDelete(entry.id, e)}
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

                {/* Main Content Area */}
                <div className={`w-full lg:flex-1 bg-amber-50 dark:bg-[#1a1614] rounded-lg shadow-2xl relative overflow-hidden flex-col border border-stone-200 dark:border-stone-800 transition-colors duration-500 ${!selectedEntry && !isEditing ? 'hidden lg:flex' : 'flex'}`}>
                    {/* Paper Texture Overlay */}
                    <div className="absolute inset-0 pointer-events-none opacity-30 dark:opacity-10 bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')] mix-blend-multiply dark:mix-blend-overlay"></div>

                    {isEditing ? (
                        <div className="relative z-10 flex flex-col h-full text-stone-900 dark:text-stone-300 font-serif">
                            {/* Editing Header */}
                            <div className="p-4 border-b-2 border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-black/20 flex justify-between items-center gap-2 lg:gap-4">
                                <button
                                    onClick={() => { setIsEditing(false); setSelectedEntry(null); }}
                                    className="lg:hidden p-2 hover:bg-stone-200 dark:hover:bg-stone-800 rounded-lg text-stone-500"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <input
                                    type="text"
                                    placeholder="Entry Title"
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    className="flex-1 bg-transparent text-3xl font-bold text-stone-900 dark:text-stone-100 outline-none placeholder:text-stone-400 dark:placeholder:text-stone-600"
                                    autoFocus
                                />
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleCancel}
                                        className="p-2 hover:bg-stone-200 dark:hover:bg-stone-800 rounded-lg text-stone-500 transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold font-sans transition-colors"
                                    >
                                        <Save size={18} />
                                        <span>Save</span>
                                    </button>
                                </div>
                            </div>

                            {/* Editor */}
                            <div className="flex-1 overflow-hidden p-4">
                                <RichTextEditor
                                    value={editContent}
                                    onChange={setEditContent}
                                />
                            </div>
                        </div>
                    ) : selectedEntry ? (
                        <JournalReader
                            entry={selectedEntry}
                            onEdit={() => handleEdit(selectedEntry)}
                            onDelete={(e) => handleDelete(selectedEntry.id, e)}
                            onBack={() => setSelectedEntry(null)}
                        />
                    ) : (
                        <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-stone-400 p-8 text-center">
                            <Book size={64} className="mb-4 opacity-20" />
                            <h2 className="text-2xl font-bold opacity-50 font-sans uppercase tracking-widest">Select an Entry</h2>
                            <p className="max-w-md mt-2 opacity-60">
                                Choose a chronicle from the archives on the left to read its contents or create a new entry.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div >
    );
};
