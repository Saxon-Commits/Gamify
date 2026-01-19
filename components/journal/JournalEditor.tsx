import React from 'react';
import { Save, X, ChevronLeft } from 'lucide-react';
import { RichTextEditor } from '../RichTextEditor';

interface JournalEditorProps {
    title: string;
    content: string;
    onTitleChange: (title: string) => void;
    onContentChange: (content: string) => void;
    onSave: () => void;
    onCancel: () => void;
}

export const JournalEditor: React.FC<JournalEditorProps> = ({
    title,
    content,
    onTitleChange,
    onContentChange,
    onSave,
    onCancel,
}) => {
    return (
        <div className="relative z-10 flex flex-col h-full text-stone-900 dark:text-stone-300 font-serif">
            {/* Editing Header */}
            <div className="p-4 border-b-2 border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-black/20 flex justify-between items-center gap-2 lg:gap-4">
                <button
                    onClick={onCancel}
                    className="lg:hidden p-2 hover:bg-stone-200 dark:hover:bg-stone-800 rounded-lg text-stone-500"
                >
                    <ChevronLeft size={20} />
                </button>
                <input
                    type="text"
                    placeholder="Entry Title"
                    value={title}
                    onChange={(e) => onTitleChange(e.target.value)}
                    className="flex-1 bg-transparent text-3xl font-bold text-stone-900 dark:text-stone-100 outline-none placeholder:text-stone-400 dark:placeholder:text-stone-600"
                    autoFocus
                />
                <div className="flex items-center gap-2">
                    <button
                        onClick={onCancel}
                        className="p-2 hover:bg-stone-200 dark:hover:bg-stone-800 rounded-lg text-stone-500 transition-colors"
                    >
                        <X size={20} />
                    </button>
                    <button
                        onClick={onSave}
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
                    value={content}
                    onChange={onContentChange}
                />
            </div>
        </div>
    );
};
