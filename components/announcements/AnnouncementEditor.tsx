import React from 'react';
import { Megaphone, X } from 'lucide-react';
import { RichTextEditor } from '../RichTextEditor';

interface AnnouncementEditorProps {
    isEditing: boolean;
    content: string;
    onContentChange: (content: string) => void;
    onSubmit: (e: React.FormEvent) => void;
    onDiscard: () => void;
    onClose: () => void;
}

export const AnnouncementEditor: React.FC<AnnouncementEditorProps> = ({
    isEditing,
    content,
    onContentChange,
    onSubmit,
    onDiscard,
    onClose,
}) => {
    const isContentEmpty = !content.trim() || content === "<p><br></p>";

    return (
        <div className="fixed inset-0 top-16 z-[100] flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="w-full max-w-xl bg-slate-900 border-l border-slate-700 h-[calc(100vh-64px)] flex flex-col shadow-2xl animate-in slide-in-from-right duration-500">
                {/* Header */}
                <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center">
                            <Megaphone className="text-indigo-400" size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">
                                {isEditing ? "Edit Announcement" : "Create Announcement"}
                            </h2>
                            <p className="text-xs text-slate-500">
                                {isEditing ? "Update your message for the guild" : "Draft a rich-text message for the guild"}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Editor */}
                <div className="flex-1 overflow-hidden p-6">
                    <RichTextEditor
                        value={content}
                        onChange={onContentChange}
                    />
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-800 bg-slate-900/50 flex gap-4">
                    <button
                        onClick={onDiscard}
                        className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-colors"
                    >
                        Discard
                    </button>
                    <button
                        onClick={onSubmit}
                        disabled={isContentEmpty}
                        className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-50"
                    >
                        {isEditing ? "Save Changes" : "Post Announcement"}
                    </button>
                </div>
            </div>
        </div>
    );
};
