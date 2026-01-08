import React from 'react';
import { Sparkles } from 'lucide-react';
import { useQuery } from "convex/react";
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';

interface GuildActivityFeedProps {
    guildId: Id<"guilds">;
}

export const GuildActivityFeed: React.FC<GuildActivityFeedProps> = ({ guildId }) => {
    const guildActivity = useQuery(api.guilds.getGuildActivity, { guildId });

    return (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 h-full flex flex-col">
            <div className="flex items-center gap-3 mb-4">
                <Sparkles className="text-amber-400" size={20} />
                <h3 className="text-lg font-bold text-white">Activity</h3>
            </div>
            <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar max-h-[300px] pr-1">
                {!guildActivity ? (
                    <div className="text-center text-slate-500 text-sm py-4">Loading...</div>
                ) : guildActivity.length === 0 ? (
                    <div className="text-center text-slate-500 text-sm py-4">No recent activity.</div>
                ) : (
                    guildActivity.map((activity) => (
                        <div key={activity._id} className="flex items-start gap-2.5 text-xs">
                            <div className="w-6 h-6 bg-slate-700 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden mt-0.5">
                                {activity.userPictureUrl ? (
                                    <img src={activity.userPictureUrl} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="font-bold text-[10px] text-white uppercase">{activity.userName.substring(0, 2)}</span>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-slate-300 leading-snug">
                                    <span className="font-bold text-white">{activity.userName}</span>
                                    {' '}
                                    {activity.type === 'joined' && 'joined'}
                                    {activity.type === 'guild_created' && 'created guild'}
                                    {activity.type === 'left' && 'left'}
                                    {activity.type === 'kicked' && 'was kicked'}
                                    {activity.type === 'promoted' && `promoted to ${activity.data.newRole}`}
                                    {activity.type === 'project_started' && `started "${activity.data.projectTitle}"`}
                                    {activity.type === 'project_completed' && `completed "${activity.data.projectTitle}"`}
                                </p>
                                <p className="text-[10px] text-slate-600 mt-0.5">
                                    {new Date(activity.timestamp).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
