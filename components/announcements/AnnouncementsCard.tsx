import React, { useState } from 'react';
import { Megaphone } from 'lucide-react';
import { useQuery, useMutation } from "convex/react";
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { AnnouncementListItem } from './AnnouncementListItem';
import { AnnouncementModal } from './AnnouncementModal';
import { AnnouncementEditor } from './AnnouncementEditor';

interface AnnouncementsCardProps {
    guildId: Id<"guilds">;
    isOfficer: boolean;
}

export const AnnouncementsCard: React.FC<AnnouncementsCardProps> = ({
    guildId,
    isOfficer,
}) => {
    // Data fetching
    const announcements = useQuery(api.guildChat.getAnnouncements, { guildId });
    const postAnnouncement = useMutation(api.guildChat.postAnnouncement);
    const deleteAnnouncement = useMutation(api.guildChat.deleteAnnouncement);
    const updateAnnouncement = useMutation(api.guildChat.updateAnnouncement);
    const toggleLike = useMutation(api.guildChat.toggleAnnouncementLike);

    // Local state
    const [announcementText, setAnnouncementText] = useState("");
    const [isPostPanelOpen, setIsPostPanelOpen] = useState(false);
    const [editingAnnouncementId, setEditingAnnouncementId] = useState<string | null>(null);
    const [viewingAnnouncement, setViewingAnnouncement] = useState<any>(null);

    // Handlers
    const handlePostAnnouncement = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!announcementText.trim() || announcementText === "<p><br></p>") return;

        try {
            if (editingAnnouncementId) {
                await updateAnnouncement({
                    messageId: editingAnnouncementId as any,
                    guildId,
                    content: announcementText
                });
            } else {
                await postAnnouncement({ guildId, content: announcementText });
            }
            setAnnouncementText("");
            setEditingAnnouncementId(null);
            setIsPostPanelOpen(false);
        } catch (error) {
            console.error("Failed to post/update announcement", error);
        }
    };

    const handleDeleteAnnouncement = async (messageId: any) => {
        if (!confirm("Delete this announcement?")) return;
        try {
            await deleteAnnouncement({ messageId, guildId });
        } catch (error) {
            console.error("Failed to delete", error);
        }
    };

    return (
        <>
            {/* Card */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 flex flex-col overflow-hidden max-h-[600px] h-fit">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Megaphone className="text-amber-400" size={20} />
                        Announcements
                    </h3>
                    {isOfficer && (
                        <button
                            onClick={() => setIsPostPanelOpen(true)}
                            className="text-xs font-bold text-indigo-400 hover:text-indigo-300"
                        >
                            + Post
                        </button>
                    )}
                </div>

                {/* Editor Panel */}
                {isPostPanelOpen && (
                    <AnnouncementEditor
                        isEditing={!!editingAnnouncementId}
                        content={announcementText}
                        onContentChange={setAnnouncementText}
                        onSubmit={handlePostAnnouncement}
                        onDiscard={() => {
                            setIsPostPanelOpen(false);
                            setEditingAnnouncementId(null);
                            setAnnouncementText("");
                        }}
                        onClose={() => setIsPostPanelOpen(false)}
                    />
                )}

                {/* List */}
                <div className="space-y-4 flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar pr-2">
                    {!announcements ? (
                        <div className="text-center text-slate-500 text-xs">Loading...</div>
                    ) : announcements.length === 0 ? (
                        <div className="text-center text-slate-500 text-sm py-4 italic">
                            No announcements.
                        </div>
                    ) : (
                        announcements.map((msg) => (
                            <AnnouncementListItem
                                key={msg._id}
                                announcement={msg}
                                guildId={guildId}
                                isOfficer={isOfficer}
                                onView={() => setViewingAnnouncement(msg)}
                                onEdit={() => {
                                    setEditingAnnouncementId(msg._id);
                                    setAnnouncementText(msg.content);
                                    setIsPostPanelOpen(true);
                                }}
                                onDelete={() => handleDeleteAnnouncement(msg._id)}
                                onToggleLike={() => toggleLike({ guildId, messageId: msg._id })}
                            />
                        ))
                    )}
                </div>
            </div>

            {/* Modal (rendered outside card for proper z-index) */}
            {viewingAnnouncement && (
                <AnnouncementModal
                    announcement={viewingAnnouncement}
                    onClose={() => setViewingAnnouncement(null)}
                    onToggleLike={() => toggleLike({ guildId, messageId: viewingAnnouncement._id })}
                />
            )}
        </>
    );
};
