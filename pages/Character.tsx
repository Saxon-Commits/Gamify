import React, { useState, useEffect } from 'react';
import { useGameStore } from '../store/useGameStore';
import { Link } from 'react-router-dom';
import { ArrowLeft, Gamepad } from 'lucide-react';

// New Components
import { AttributesPanel } from '../components/character/AttributesPanel';
import { MasteryAvatarSelector } from '../components/character/MasteryAvatarSelector';
import { ConsistencyGraph } from '../components/character/ConsistencyGraph';
import { LoadoutPanel } from '../components/character/LoadoutPanel';
import { DevControls } from '../components/character/DevControls';
import { CharacterDisplayCard } from '../components/character/CharacterDisplayCard';
import { MobileStatsPanel } from '../components/character/MobileStatsPanel';

import { EquipmentOffset } from '../src/utils/EquipmentConfig';
import { AVAILABLE_AVATARS, MASTERY_AVATARS } from '../components/character/CharacterData';

export const Character: React.FC = () => {
    const { stats, inventory } = useGameStore();

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


    // --- DEV CONTROL STATE (Hoisted) ---
    const [devPanelOpen, setDevPanelOpen] = useState(false);
    const [devEditMode, setDevEditMode] = useState<'backdrop' | 'avatar' | 'companion' | 'equipment'>('backdrop');

    // Companion Dev State
    const [devCompanionTop, setDevCompanionTop] = useState(38.5);
    const [devCompanionRight, setDevCompanionRight] = useState(63);
    const [devCompanionScale, setDevCompanionScale] = useState(1);
    const [devCompanionRotation, setDevCompanionRotation] = useState(7);

    // Avatar Dev State
    const [devAvatarScale, setDevAvatarScale] = useState(77);
    const [devAvatarOffsetX, setDevAvatarOffsetX] = useState(1);
    const [devAvatarOffsetY, setDevAvatarOffsetY] = useState(-16);

    // Backdrop Dev State
    const [devBackdropScale, setDevBackdropScale] = useState(100);
    const [devBackdropOffsetX, setDevBackdropOffsetX] = useState(0);
    const [devBackdropOffsetY, setDevBackdropOffsetY] = useState(0);

    // Equipment Dev State
    const [isDevMode, setIsDevMode] = useState(false);
    const [devActiveItem, setDevActiveItem] = useState('a_seraph_wings');
    const [devOffset, setDevOffset] = useState<EquipmentOffset>({ top: 30, left: 50, scale: 1.0, rotation: 0, zIndex: 60 });


    return (
        <div className="bg-slate-50 dark:bg-slate-950 min-h-screen pb-32 transition-colors duration-500 font-sans selection:bg-amber-100 dark:selection:bg-amber-900/30">

            <div className="max-w-7xl mx-auto pt-0 md:pt-8 px-6 mb-0 md:mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-center md:text-left hidden md:block">
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter mb-2">
                        Character
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Customize your legend.</p>
                </div>
                <div className="flex gap-3 w-full md:w-auto justify-center hidden md:flex">
                    <Link to="/" className="bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 px-5 py-3 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all border border-slate-200 dark:border-slate-800 flex items-center gap-2 group">
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        Back to Hub
                    </Link>
                    <Link to="/play" className="bg-gradient-to-r from-indigo-600 to-indigo-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                        <Gamepad size={18} />
                        Enter Game
                    </Link>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-0 md:px-2 lg:px-6 grid grid-cols-1 lg:grid-cols-12 gap-2 lg:gap-8 relative items-start">

                {/* MOBILE LAYOUT: Split Top Section */}
                <div className="flex md:hidden w-full gap-3">
                    {/* Left: Character Card (Scaled Down) */}
                    <div className="w-[55%]">
                        <CharacterDisplayCard
                            selectedAvatarPath={selectedAvatarPath}
                            devPanelOpen={devPanelOpen}
                            devEditMode={devEditMode}
                            devBackdropScale={devBackdropScale}
                            devBackdropOffsetX={devBackdropOffsetX}
                            devBackdropOffsetY={devBackdropOffsetY}
                            devAvatarScale={devAvatarScale}
                            devAvatarOffsetX={devAvatarOffsetX}
                            devAvatarOffsetY={devAvatarOffsetY}
                            devCompanionTop={devCompanionTop}
                            devCompanionRight={devCompanionRight}
                            devCompanionScale={devCompanionScale}
                            devCompanionRotation={devCompanionRotation}
                            isDevMode={isDevMode}
                            devActiveItem={devActiveItem}
                            devOffset={devOffset}
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
                    <MasteryAvatarSelector />
                </div>

                {/* CENTER COLUMN: DISPLAY (Desktop) */}
                <div className="hidden md:flex lg:col-span-6 flex-col items-center lg:order-2">
                    <CharacterDisplayCard
                        selectedAvatarPath={selectedAvatarPath}
                        devPanelOpen={devPanelOpen}
                        devEditMode={devEditMode}
                        devBackdropScale={devBackdropScale}
                        devBackdropOffsetX={devBackdropOffsetX}
                        devBackdropOffsetY={devBackdropOffsetY}
                        devAvatarScale={devAvatarScale}
                        devAvatarOffsetX={devAvatarOffsetX}
                        devAvatarOffsetY={devAvatarOffsetY}
                        devCompanionTop={devCompanionTop}
                        devCompanionRight={devCompanionRight}
                        devCompanionScale={devCompanionScale}
                        devCompanionRotation={devCompanionRotation}
                        isDevMode={isDevMode}
                        devActiveItem={devActiveItem}
                        devOffset={devOffset}
                    />
                </div>

                {/* RIGHT COLUMN: LOADOUT (Shared but moved below on mobile) */}
                <div className="lg:col-span-3 space-y-6 lg:order-3">
                    {/* Mastery Selector shown here on mobile for flow - HIDDEN per user request */}
                    <div className="hidden md:block lg:hidden">
                        <MasteryAvatarSelector />
                    </div>
                    <LoadoutPanel
                        selectedAvatarPath={selectedAvatarPath}
                        setSelectedAvatarPath={setSelectedAvatarPath}
                    />
                </div>
            </div>


            {/* DEV CONTROLS OVERLAY - Hidden on Mobile */}
            <div className="hidden md:block">
                <DevControls
                    devPanelOpen={devPanelOpen} setDevPanelOpen={setDevPanelOpen}
                    devEditMode={devEditMode} setDevEditMode={setDevEditMode}
                    devCompanionTop={devCompanionTop} setDevCompanionTop={setDevCompanionTop}
                    devCompanionRight={devCompanionRight} setDevCompanionRight={setDevCompanionRight}
                    devCompanionScale={devCompanionScale} setDevCompanionScale={setDevCompanionScale}
                    devCompanionRotation={devCompanionRotation} setDevCompanionRotation={setDevCompanionRotation}
                    devAvatarScale={devAvatarScale} setDevAvatarScale={setDevAvatarScale}
                    devAvatarOffsetX={devAvatarOffsetX} setDevAvatarOffsetX={setDevAvatarOffsetX}
                    devAvatarOffsetY={devAvatarOffsetY} setDevAvatarOffsetY={setDevAvatarOffsetY}
                    devBackdropScale={devBackdropScale} setDevBackdropScale={setDevBackdropScale}
                    devBackdropOffsetX={devBackdropOffsetX} setDevBackdropOffsetX={setDevBackdropOffsetX}
                    devBackdropOffsetY={devBackdropOffsetY} setDevBackdropOffsetY={setDevBackdropOffsetY}
                    devActiveItem={devActiveItem} setDevActiveItem={setDevActiveItem}
                    devOffset={devOffset} setDevOffset={setDevOffset}
                    isDevMode={isDevMode} setIsDevMode={setIsDevMode}
                    activeBackdropId={stats.activeBackdropId}
                />
            </div>

        </div>
    );
};


