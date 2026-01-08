import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { Send, User as UserIcon } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';

interface GuildChatProps {
    guildId: Id<"guilds">;
    currentUserId: Id<"users">;
}

export const GuildChat: React.FC<GuildChatProps> = ({ guildId, currentUserId }) => {
    const messages = useQuery(api.guildChat.getMessages, { guildId });
    const sendMessage = useMutation(api.guildChat.sendMessage);
    const [newMessage, setNewMessage] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [isSending, setIsSending] = useState(false);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Scroll on new messages
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!newMessage.trim() || isSending) return;

        setIsSending(true);
        try {
            await sendMessage({ guildId, content: newMessage });
            setNewMessage("");
            // Optimistic update? Query handles it fast enough usually.
        } catch (error) {
            console.error("Failed to send message:", error);
        } finally {
            setIsSending(false);
        }
    };

    if (messages === undefined) {
        return <div className="p-8 text-center text-slate-500 animate-pulse">Loading secure channel...</div>;
    }

    // Messages come in DESC order (newest first). We need to reverse for display (oldest top).
    // Or we can use flex-col-reverse. Let's filter and reverse.
    const displayMessages = [...messages].reverse();

    return (
        <div className="flex flex-col h-[600px] bg-slate-900/50 rounded-2xl border border-slate-800 backdrop-blur-sm overflow-hidden">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {displayMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-2 opacity-50">
                        <div className="p-4 bg-slate-800 rounded-full">
                            <Send size={24} />
                        </div>
                        <p>No communications yet.</p>
                        <p className="text-xs">Start the conversation!</p>
                    </div>
                ) : (
                    displayMessages.map((msg) => {
                        const isMe = msg.userId === currentUserId;
                        return (
                            <div key={msg._id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                {/* Avatar */}
                                <div className="flex-shrink-0">
                                    {msg.userPictureUrl ? (
                                        <img src={msg.userPictureUrl} alt={msg.userName} className="w-8 h-8 rounded-full border border-slate-700 object-cover" />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 text-slate-400">
                                            <UserIcon size={14} />
                                        </div>
                                    )}
                                </div>

                                {/* Bubble */}
                                <div className={`flex flex-col max-w-[70%] ${isMe ? 'items-end' : 'items-start'}`}>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[10px] font-bold text-slate-400 opacity-75">{msg.userName}</span>
                                        <span className="text-[10px] text-slate-600">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <div className={`px-4 py-2 rounded-2xl text-sm leading-relaxed ${isMe
                                        ? 'bg-indigo-600 text-white rounded-tr-none'
                                        : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'
                                        }`}>
                                        {msg.content}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-4 bg-slate-950/50 border-t border-slate-800 flex gap-2">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-slate-600"
                />
                <button
                    type="submit"
                    disabled={!newMessage.trim() || isSending}
                    className="p-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-colors shadow-lg shadow-indigo-500/20"
                >
                    <Send size={20} className={isSending ? 'animate-pulse' : ''} />
                </button>
            </form>
        </div>
    );
};
