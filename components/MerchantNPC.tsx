import React, { useState } from 'react';
import { MessageSquare } from 'lucide-react';

interface MerchantNPCProps {
    className?: string;
    variant?: 'shop' | 'quest' | 'default';
    dialogue?: string;
}

export const MerchantNPC: React.FC<MerchantNPCProps> = ({
    className = '',
    variant = 'default',
    dialogue
}) => {
    const [showDialogue, setShowDialogue] = useState(false);

    // Default dialogues based on variant if none provided
    const getDialogue = () => {
        if (dialogue) return dialogue;
        switch (variant) {
            case 'shop': return "Got some rare things on sale, stranger...";
            case 'quest': return "Bounties fresh from the guild!";
            default: return "Need something?";
        }
    };

    return (
        <div
            className={`relative group ${className}`}
            onMouseEnter={() => setShowDialogue(true)}
            onMouseLeave={() => setShowDialogue(false)}
        >
            {/* Video Container */}
            {/* mix-blend-screen removes the black background */}
            <div className="relative z-10 w-full h-full flex justify-center items-center">
                <video
                    src="/avatars/merchant/idle.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-contain mix-blend-screen pointer-events-none drop-shadow-[0_0_15px_rgba(74,222,128,0.2)]"
                    style={{
                        filter: 'contrast(1.2) brightness(0.9)',
                        maskImage: 'radial-gradient(circle, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 95%)',
                        WebkitMaskImage: 'radial-gradient(circle, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 95%)'
                    }}
                />
            </div>

            {/* Dialogue Bubble (Shows on Hover) */}
            <div className={`
        absolute -top-12 left-1/2 -translate-x-1/2 
        bg-slate-900 border border-slate-700 text-slate-200 
        text-xs font-bold px-3 py-2 rounded-lg shadow-xl whitespace-nowrap z-20
        transition-all duration-300 transform origin-bottom
        ${showDialogue ? 'scale-100 opacity-100' : 'scale-90 opacity-0 pointer-events-none'}
      `}>
                {getDialogue()}
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 border-b border-r border-slate-700 transform rotate-45"></div>
            </div>

            {/* Ambient Glow for "Grounding" (Optional) */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-2/3 h-4 bg-green-500/10 blur-xl rounded-full pointer-events-none"></div>
        </div>
    );
};
