import React, { useState, useEffect } from 'react';
import { Book, Folder, FileText, Trash2, Calendar, Search, Save, X, Plus, ChevronLeft, BookOpen, CheckSquare, Square, ChevronDown, Sun, Moon, Lightbulb } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { useToastStore } from '../store/useToastStore';
import { JournalEntry } from '../types';
import { RichTextEditor } from '../components/RichTextEditor';
import { CharacterSidebar } from '../components/character/CharacterSidebar';
import { JournalReader } from '../components/journal/JournalReader';
import { JournalEditor } from '../components/journal/JournalEditor';
import { JournalSidebar } from '../components/journal/JournalSidebar';


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

    const handleQuickLog = (mood: string, energy: number) => {
        const content = `<p><strong>Quick Log</strong></p><p>Mood: ${mood}</p><p>Energy: ${energy}/10</p>`;
        addJournalEntry({
            title: `Log: ${new Date().toLocaleTimeString()}`,
            content,
            tags: ['Quick Log', mood],
            folder: 'Journal'
        });
    };

    const handleSelectEntry = (entry: JournalEntry) => {
        if (isEditing && entry.id !== selectedEntry?.id) {
            if (!confirm("Discard unsaved changes?")) return;
        }
        setIsEditing(false);
        setSelectedEntry(entry);
    };

    return (
        <div className="max-w-[95%] mx-auto pb-6">
            <div className="flex flex-col lg:flex-row h-[calc(100vh-6rem)] gap-0 lg:gap-8 mt-8">

                {/* 1. CHARACTER SIDEBAR (Matches QuestLog) */}
                <CharacterSidebar className="hidden lg:block w-full lg:w-48 flex-shrink-0 animate-in slide-in-from-left-4 duration-500 sticky top-0 h-fit" />

                {/* Sidebar */}
                <JournalSidebar
                    folders={folders}
                    selectedFolder={selectedFolder}
                    entries={filteredEntries}
                    selectedEntry={selectedEntry}
                    selectedIds={selectedIds}
                    searchQuery={searchQuery}
                    isEditing={isEditing}
                    inkwellUnlocked={inkwellUnlocked}
                    grimoireUnlocked={grimoireUnlocked}
                    totalEntries={journalEntries.length}
                    templates={TEMPLATES}
                    onSelectFolder={setSelectedFolder}
                    onSelectEntry={handleSelectEntry}
                    onSearchChange={setSearchQuery}
                    onNewEntry={handleNewEntry}
                    onToggleSelect={handleToggleSelect}
                    onSelectAll={handleSelectAll}
                    onBulkDelete={handleBulkDelete}
                    onDelete={handleDelete}
                    onApplyTemplate={handleApplyTemplate}
                    onQuickLog={handleQuickLog}
                />


                {/* Main Content Area */}
                <div className={`w-full lg:flex-1 bg-amber-50 dark:bg-[#1a1614] rounded-lg shadow-2xl relative overflow-hidden flex-col border border-stone-200 dark:border-stone-800 transition-colors duration-500 ${!selectedEntry && !isEditing ? 'hidden lg:flex' : 'flex'}`}>
                    {/* Paper Texture Overlay */}
                    <div className="absolute inset-0 pointer-events-none opacity-30 dark:opacity-10 bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')] mix-blend-multiply dark:mix-blend-overlay"></div>

                    {isEditing ? (
                        <JournalEditor
                            title={editTitle}
                            content={editContent}
                            onTitleChange={setEditTitle}
                            onContentChange={setEditContent}
                            onSave={handleSave}
                            onCancel={handleCancel}
                        />
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
