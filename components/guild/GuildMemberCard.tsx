import React from 'react';
import { Crown, Sliders } from 'lucide-react';
import { MiniCharacterCard } from '../MiniCharacterCard';

interface MemberLoadout {
    id: string;
    name: string;
    level: number;
    role: string;
    avatarId?: string;
    weaponId?: string;
    armorId?: string;
    companionId?: string;
    backdropId?: string;
}

interface GuildMemberCardProps {
    member: MemberLoadout;
    isUser?: boolean;
    onEdit?: () => void;
}

export const GuildMemberCard: React.FC<GuildMemberCardProps> = ({
    member,
    isUser = false,
    onEdit
}) => {
    const borderClass = isUser
        ? 'border-2 border-amber-500/50 bg-gradient-to-br from-amber-500/20 to-orange-600/20'
        : 'border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-indigo-500/50';

    return (
        <div className={`${borderClass} rounded-xl p-2 relative overflow-hidden transition-colors`}>
            {isUser && (
                <div className="absolute top-2 right-2 z-20">
                    <Crown size={14} className="text-amber-400" />
                </div>
            )}

            <MiniCharacterCard
                avatarId={member.avatarId}
                companionId={member.companionId}
                backdropId={member.backdropId}
                weaponId={member.weaponId}
                armorId={member.armorId}
                className="w-full mb-3"
            />

            <div className="flex items-center justify-between">
                <div className="min-w-0">
                    <p className={`font-bold text-sm truncate ${isUser ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                        {member.name}
                    </p>
                    <p className="text-xs">
                        <span className={
                            isUser ? 'text-amber-400' :
                                member.role === 'Leader' ? 'text-amber-400' :
                                    member.role === 'Officer' ? 'text-indigo-400' :
                                        'text-slate-400'
                        }>
                            {isUser ? 'You' : member.role}
                        </span>
                        <span className="text-slate-500"> • Lvl {member.level}</span>
                    </p>
                </div>
                {onEdit && (
                    <button
                        onClick={onEdit}
                        className="p-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300 transition-colors"
                    >
                        <Sliders size={12} />
                    </button>
                )}
            </div>
        </div>
    );
};
