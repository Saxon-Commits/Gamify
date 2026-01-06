import React, { useState } from 'react';
import { Book, Folder, FileText, Trash2, Calendar, Search, Tag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/useGameStore';
import { JournalEntry } from '../types';

export const Journal: React.FC = () => {
    const navigate = useNavigate();
    const { journalEntries, deleteJournalEntry } = useGameStore();
    const [selectedFolder, setSelectedFolder] = useState<string | 'All'>('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);

    const folders = ['All', 'Journal', 'Mind Wipes', 'Grindstone Log'];

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
            if (selectedEntry?.id === id) setSelectedEntry(null);
        }
    };

    const handleEdit = (entry: JournalEntry) => {
        navigate('/tools/mind-wipe', { state: { entry } });
    };

    const handleNewEntry = () => {
        navigate('/tools/mind-wipe');
    };

    return (
        <div className="flex h-[calc(100vh-6rem)] gap-6 mt-6 max-w-7xl mx-auto px-6 pb-6">

            {/* Sidebar / List */}
            <div className="w-80 flex flex-col gap-4 flex-shrink-0">

                {/* New Entry Button */}
                <button
                    onClick={handleNewEntry}
                    className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-purple-900/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                    <Book size={18} />
                    <span>New Entry</span>
                </button>

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

                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                        {filteredEntries.length === 0 ? (
                            <div className="text-center p-8 text-slate-400 dark:text-slate-600 text-sm italic">
                                No entries found.
                            </div>
                        ) : (
                            filteredEntries.map(entry => (
                                <button
                                    key={entry.id}
                                    onClick={() => setSelectedEntry(entry)}
                                    className={`w-full text-left p-3 rounded-xl border transition-all group relative ${selectedEntry?.id === entry.id
                                        ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/50'
                                        : 'bg-white dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                                        }`}
                                >
                                    <h3 className={`font-bold text-sm truncate pr-6 ${selectedEntry?.id === entry.id ? 'text-amber-700 dark:text-amber-200' : 'text-slate-700 dark:text-slate-300'}`}>
                                        {entry.title}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                                        <Calendar size={12} />
                                        <span>{new Date(entry.date).toLocaleDateString()}</span>
                                    </div>

                                    <button
                                        onClick={(e) => handleDelete(entry.id, e)}
                                        className="absolute right-2 top-2 p-1.5 rounded hover:bg-red-500/20 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 bg-amber-50 dark:bg-[#1a1614] rounded-lg shadow-2xl relative overflow-hidden flex flex-col border border-stone-200 dark:border-stone-800 transition-colors duration-500">
                {/* Paper Texture Overlay */}
                <div className="absolute inset-0 pointer-events-none opacity-30 dark:opacity-10 bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')] mix-blend-multiply dark:mix-blend-overlay"></div>

                {selectedEntry ? (
                    <div className="relative z-10 flex flex-col h-full text-stone-900 dark:text-stone-300 font-serif">
                        {/* Header */}
                        <div className="p-8 border-b-2 border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-black/20 flex justify-between items-start">
                            <div>
                                <div className="flex items-center gap-4 mb-4 text-stone-500 dark:text-stone-500 text-sm font-sans uppercase tracking-widest">
                                    <span className="flex items-center gap-1.5">
                                        <Calendar size={14} />
                                        {new Date(selectedEntry.date).toLocaleString()}
                                    </span>
                                    <span className="w-1 h-1 bg-stone-400 rounded-full" />
                                    <span className="flex items-center gap-1.5">
                                        <Folder size={14} />
                                        {selectedEntry.folder}
                                    </span>
                                </div>
                                <h1 className="text-4xl font-bold text-stone-900 dark:text-stone-100 leading-tight">
                                    {selectedEntry.title}
                                </h1>
                                {selectedEntry.tags.length > 0 && (
                                    <div className="flex gap-2 mt-4">
                                        {selectedEntry.tags.map(tag => (
                                            <span key={tag} className="px-2 py-1 bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400 rounded text-xs font-sans font-bold uppercase tracking-wider">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={() => handleEdit(selectedEntry)}
                                className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-lg text-sm font-bold font-sans transition-colors flex items-center gap-2"
                            >
                                <FileText size={16} />
                                <span>Edit</span>
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-8 prose prose-stone dark:prose-invert max-w-none prose-lg [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_h1]:text-4xl [&_h2]:text-3xl [&_a]:text-blue-600 [&_a]:underline [&_input[type='checkbox']]:mr-2 [&_input[type='checkbox']]:scale-125">
                            <div dangerouslySetInnerHTML={{ __html: selectedEntry.content }} />
                        </div>
                    </div>
                ) : (
                    <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-stone-400 p-8 text-center">
                        <Book size={64} className="mb-4 opacity-20" />
                        <h2 className="text-2xl font-bold opacity-50 font-sans uppercase tracking-widest">Select an Entry</h2>
                        <p className="max-w-md mt-2 opacity-60">
                            Choose a chronicle from the archives on the left to read its contents.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
