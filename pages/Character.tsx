import React, { useState, useEffect } from 'react';
import { useGameStore } from '../store/useGameStore';


// New Components
import { AttributesPanel } from '../components/character/AttributesPanel';
import { LoadoutPanel } from '../components/character/LoadoutPanel';
// DevControls is now GLOBAL in Layout, removed from here
// import { DevControls } from '../components/character/DevControls';
import { CharacterDisplayCard } from '../components/character/CharacterDisplayCard';
import { MobileStatsPanel } from '../components/character/MobileStatsPanel';
import { UpgradeCompanionButton } from '../components/character/UpgradeCompanionButton';

import { AVAILABLE_AVATARS, MASTERY_AVATARS } from '../components/character/CharacterData';

export const Character: React.FC = () => {
    const { stats } = useGameStore();

    // --- LOCAL STATE for Visual Selection Only ---
    const [selectedAvatarPath, setSelectedAvatarPath] = useState(AVAILABLE_AVATARS[0].path);

    // Sync selected avatar with active avatar on mount/change
    useEffect(() => {
        if (stats.activeAvatarId) {
            // Check Mastery
            const mastery = MASTERY_AVATARS.find(m => m.id === stats.activeAvatarId);
            if (mastery) {
                setSelectedAvatarPath(mastery.path);
                return;
            }
            // Check Standard
            const found = AVAILABLE_AVATARS.find(a => a.requiredItemId === stats.activeAvatarId);
            if (found) setSelectedAvatarPath(found.path);
        }
    }, [stats.activeAvatarId]);

    return (
        <div className="bg-slate-50 dark:bg-slate-950 min-h-screen pb-32 transition-colors duration-500 font-sans selection:bg-amber-100 dark:selection:bg-amber-900/30">

            <div className="max-w-[1920px] mx-auto px-0 md:px-2 lg:px-6 grid grid-cols-1 lg:grid-cols-12 gap-2 lg:gap-6 relative items-start pt-0 md:pt-8">

                {/* MOBILE LAYOUT: Split Top Section */}
                <div className="flex md:hidden w-full gap-3">
                    {/* Left: Character Card (Scaled Down) */}
                    <div className="w-[55%]">
                        <CharacterDisplayCard
                            selectedAvatarPath={selectedAvatarPath}
                        />
                    </div>

                    {/* Right: Mobile Stats */}
                    <div className="w-[45%]">
                        <MobileStatsPanel />
                    </div>
                </div>


                {/* LEFT COLUMN: STATS (Desktop) */}
                <div className="hidden lg:block lg:col-span-3 space-y-6 lg:order-1">
                    <AttributesPanel />
                </div>

                {/* CENTER COLUMN: DISPLAY (Desktop) */}
                <div className="hidden md:flex lg:col-span-4 flex-col items-center lg:order-2">
                    <CharacterDisplayCard
                        selectedAvatarPath={selectedAvatarPath}
                    />
                    <UpgradeCompanionButton />
                </div>

                {/* RIGHT COLUMN: LOADOUT (Shared but moved below on mobile) */}
                <div className="lg:col-span-5 space-y-6 lg:order-3">
                    <LoadoutPanel
                        selectedAvatarPath={selectedAvatarPath}
                        setSelectedAvatarPath={setSelectedAvatarPath}
                    />
                </div>
            </div>

        </div>
    );
};



