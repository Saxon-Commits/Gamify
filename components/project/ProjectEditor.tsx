import React, { useState, useEffect } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Save, X, Archive, Lock } from 'lucide-react';
import { RichTextEditor } from '../RichTextEditor';
import { useGameStore } from '../../store/useGameStore';

interface ProjectEditorProps {
    projectId: string; // The Project ID (e.g. 'col-todo')
    initialDoc?: any; // If editing existing
    onClose: () => void;
}

export const ProjectEditor: React.FC<ProjectEditorProps> = ({ projectId, initialDoc, onClose }) => {
    const [title, setTitle] = useState(initialDoc?.title || '');
    const [content, setContent] = useState(initialDoc?.content || '');
    const [isSaving, setIsSaving] = useState(false);

    const { addJournalEntry } = useGameStore();
    const createDocument = useMutation(api.documents.createDocument);
    const updateDocument = useMutation(api.documents.updateDocument);

    const handleSave = async (isPrivate: boolean) => {
        if (!title.trim()) return;
        setIsSaving(true);
        try {
            if (isPrivate) {
                // Save to Personal Journal (Client-side Store)
                addJournalEntry({
                    title: title,
                    content: content,
                    folder: 'Journal',
                    tags: ['Project Note', projectId]
                });
                // Note: We don't update existing Convex docs here if they were public and are now private.
                // If initialDoc exists and was public, we might want to delete it or warn?
                // For now, assuming "Save Privately" always creates a NEW Journal Entry or updates if we were editing a journal entry? 
                // But this editor is for Project Docs. 
                // If editing an existing Project Doc, converting to Private Journal Entry leaves the original Public Doc.
                // Let's just create a Copy in Journal for now as requested.
            } else {
                // Save to Project Archive (Convex)
                if (initialDoc) {
                    await updateDocument({
                        id: initialDoc._id,
                        title,
                        content,
                        isPrivate: false
                    });
                } else {
                    await createDocument({
                        projectId,
                        title,
                        content,
                        type: 'doc',
                        isPrivate: false
                    });
                }
            }
            onClose();
        } catch (e) {
            console.error(e);
            alert("Failed to save document. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[150] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-4xl h-[80vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900">
                    <input
                        type="text"
                        placeholder="Document Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="bg-transparent text-xl font-bold text-white placeholder:text-slate-600 outline-none w-full"
                        autoFocus
                    />
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handleSave(true)}
                            disabled={isSaving || !title.trim()}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-slate-300 rounded-lg font-bold transition-all text-xs uppercase tracking-wider"
                        >
                            <Lock size={14} />
                            Save Privately
                        </button>
                        <button
                            onClick={() => handleSave(false)}
                            disabled={isSaving || !title.trim()}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-bold transition-all text-xs uppercase tracking-wider"
                        >
                            <Archive size={14} />
                            Submit to Archive
                        </button>
                        <div className="w-px h-8 bg-slate-800 mx-2" />
                        <button
                            onClick={onClose}
                            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Editor Content */}
                <div className="flex-1 bg-slate-950 p-4 flex flex-col overflow-hidden">
                    <RichTextEditor
                        value={content}
                        onChange={setContent}
                    />
                </div>
            </div>
        </div>
    );
};
