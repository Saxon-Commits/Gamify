import React from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.bubble.css';
import { Megaphone, X, Heart } from 'lucide-react';
import { Id } from '../../convex/_generated/dataModel';

interface AnnouncementModalProps {
    announcement: {
        _id: Id<"guildMessages">;
        _creationTime: number;
        userName: string;
        content: string;
        isLiked: boolean;
        likeCount: number;
    };
    onClose: () => void;
    onToggleLike: () => void;
}

export const AnnouncementModal: React.FC<AnnouncementModalProps> = ({
    announcement,
    onClose,
    onToggleLike,
}) => {
    return (
        <div
            className="fixed inset-0 z-[999] flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={onClose}
        >
            <div
                className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-amber-600/20 to-amber-900/20 p-6 border-b border-amber-500/20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
                            <Megaphone className="text-amber-400" size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white uppercase tracking-wider">Announcement</h3>
                            <p className="text-slate-400 text-sm">
                                Posted by {announcement.userName} • {new Date(announcement._creationTime).toLocaleDateString()}
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

                {/* Content */}
                <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar announcement-modal-reader">
                    <ReactQuill
                        value={announcement.content}
                        readOnly={true}
                        theme="bubble"
                        modules={{ toolbar: false }}
                        className="h-full"
                    />
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-800 bg-slate-900/50 flex justify-between items-center">
                    <button
                        onClick={onToggleLike}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${announcement.isLiked ? 'text-red-500 bg-red-500/10' : 'text-slate-400 hover:text-red-400 hover:bg-slate-800'}`}
                    >
                        <Heart className={announcement.isLiked ? 'fill-current' : ''} />
                        <span className="font-bold">{announcement.likeCount || 0} Likes</span>
                    </button>

                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};
