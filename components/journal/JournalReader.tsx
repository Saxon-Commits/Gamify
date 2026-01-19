import React from 'react';
import { Calendar, Folder, Trash2, FileText, ChevronLeft } from 'lucide-react';
import { JournalEntry } from '../../types';
import { RichTextEditor } from '../RichTextEditor';

interface JournalReaderProps {
    entry: JournalEntry;
    onEdit: () => void;
    onDelete: (e: React.MouseEvent) => void;
    onBack: () => void;
}

export const JournalReader: React.FC<JournalReaderProps> = ({
    entry,
    onEdit,
    onDelete,
    onBack,
}) => {
    return (
        <div className="relative z-10 flex flex-col h-full text-stone-900 dark:text-stone-300 font-serif">
            {/* Header */}
            <div className="p-8 border-b-2 border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-black/20 flex justify-between items-start">
                <button
                    onClick={onBack}
                    className="lg:hidden absolute top-4 left-4 p-2 hover:bg-stone-200 dark:hover:bg-stone-800 rounded-lg text-stone-500 z-20"
                >
                    <ChevronLeft size={24} />
                </button>
                <div className="pt-8 lg:pt-0">
                    <div className="flex items-center gap-4 mb-4 text-stone-500 dark:text-stone-500 text-sm font-sans uppercase tracking-widest">
                        <span className="flex items-center gap-1.5">
                            <Calendar size={14} />
                            {new Date(entry.date).toLocaleString()}
                        </span>
                        <span className="w-1 h-1 bg-stone-400 rounded-full" />
                        <span className="flex items-center gap-1.5">
                            <Folder size={14} />
                            {entry.folder}
                        </span>
                    </div>
                    <h1 className="text-4xl font-bold text-stone-900 dark:text-stone-100 leading-tight">
                        {entry.title}
                    </h1>
                    {entry.tags.length > 0 && (
                        <div className="flex gap-2 mt-4">
                            {entry.tags.map(tag => (
                                <span key={tag} className="px-2 py-1 bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400 rounded text-xs font-sans font-bold uppercase tracking-wider">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={onDelete}
                        className="px-4 py-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 rounded-lg text-sm font-bold font-sans transition-colors flex items-center gap-2"
                    >
                        <Trash2 size={16} />
                        <span>Delete</span>
                    </button>
                    <button
                        onClick={onEdit}
                        className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-lg text-sm font-bold font-sans transition-colors flex items-center gap-2"
                    >
                        <FileText size={16} />
                        <span>Edit</span>
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden p-4">
                <RichTextEditor
                    value={entry.content}
                    readOnly={true}
                />
            </div>
        </div>
    );
};
