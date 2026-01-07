import React from 'react';
import { Megaphone, Pencil, Trash2, Heart } from 'lucide-react';
import { Id } from '../../convex/_generated/dataModel';

interface AnnouncementListItemProps {
    announcement: {
        _id: Id<"guildMessages">;
        _creationTime: number;
        userName: string;
        content: string;
        isLiked: boolean;
        likeCount: number;
    };
    guildId: Id<"guilds">;
    isOfficer: boolean;
    onView: () => void;
    onEdit: () => void;
    onDelete: () => void;
    onToggleLike: () => void;
}

export const AnnouncementListItem: React.FC<AnnouncementListItemProps> = ({
    announcement,
    isOfficer,
    onView,
    onEdit,
    onDelete,
    onToggleLike,
}) => {
    return (
        <div
            onClick={onView}
            className="relative bg-amber-500/5 border border-amber-500/20 rounded-lg p-3 cursor-pointer hover:bg-amber-500/10 transition-colors group"
        >
            <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Megaphone size={12} className="text-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                        <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider mb-1 block truncate">
                            {announcement.userName}
                        </span>
                        {isOfficer && (
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onEdit();
                                    }}
                                    className="text-slate-600 hover:text-indigo-400 transition-colors"
                                >
                                    <Pencil size={10} />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDelete();
                                    }}
                                    className="text-slate-600 hover:text-red-400 transition-colors"
                                >
                                    <Trash2 size={10} />
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="ql-snow announcement-reader compact">
                        <div
                            className="ql-editor max-h-full overflow-hidden line-clamp-3"
                            dangerouslySetInnerHTML={{ __html: announcement.content }}
                        />
                    </div>
                    <div className="flex items-center justify-between mt-1 text-[9px] text-slate-600">
                        <span>{new Date(announcement._creationTime).toLocaleDateString()}</span>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggleLike();
                            }}
                            className={`flex items-center gap-1 hover:text-red-400 transition-colors ${announcement.isLiked ? 'text-red-500' : ''}`}
                        >
                            <Heart size={10} className={announcement.isLiked ? 'fill-current' : ''} />
                            <span>{announcement.likeCount || 0}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
