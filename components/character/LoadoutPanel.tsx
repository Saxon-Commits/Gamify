import React, { useMemo, useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { Ban, Monitor, Shield, Sparkles, Swords, Users, ChevronDown } from 'lucide-react';
import { SHOP_ITEMS } from '../../src/utils/GameEconomy';
import { ALL_COSMETIC_ITEMS, COSMETIC_SHOP_ITEMS, STARTER_AVATARS } from '../../src/utils/CosmeticsData';
import { AVAILABLE_AVATARS } from './CharacterData';

interface LoadoutPanelProps {
    selectedAvatarPath: string;
    setSelectedAvatarPath: (path: string) => void;
}

export const LoadoutPanel: React.FC<LoadoutPanelProps> = ({ selectedAvatarPath, setSelectedAvatarPath }) => {
    const { stats, inventory, setAvatar, equipItem, setBackdrop } = useGameStore();
    const [avatarTab, setAvatarTab] = useState<'standard' | 'mastery'>('standard');

    // Mobile Accordion State
    const [mobileOpenSection, setMobileOpenSection] = useState<string | null>(null);
    const toggleSection = (section: string) => {
        setMobileOpenSection(mobileOpenSection === section ? null : section);
    };

    // Helper to get ID from path
    const getAvatarIdFromPath = (path: string) => {
        const found = AVAILABLE_AVATARS.find(a => a.path === path);
        if (found) return found.requiredItemId || AVAILABLE_AVATARS[0].requiredItemId;
        // Check Mastery
        const mastery = [
            { id: 'avatar_scribe_master', path: '/avatars/mastery/scribe_master.png' },
            { id: 'avatar_master_blacksmith', path: '/avatars/mastery/master_blacksmith.png' },
            { id: 'avatar_master_bounty_hunter', path: '/avatars/mastery/master_bounty_hunter.png' }
        ].find(m => m.path === path);
        if (mastery) return mastery.id;

        return 'base'; // fallback
    };

    const currentAvatarId = getAvatarIdFromPath(selectedAvatarPath);

    // Filter Items
    const isArmor = (item: any) => item.slots?.length ? item.slots.includes('ARMOR') : item.id.startsWith('a_');
    const isAccessory = (item: any) => item.slots?.length ? item.slots.includes('ACCESSORY') : (item.id.startsWith('acc_') || item.type === 'COMPANION' || item.id.startsWith('companion-'));

    // Combined Registry
    const ALL_ITEMS = useMemo(() => {
        const map = new Map();
        [...SHOP_ITEMS, ...ALL_COSMETIC_ITEMS].forEach(i => map.set(i.id, i));
        return Array.from(map.values());
    }, []);

    // Selection Logic - Only needed for Armor/Accessory unlock checks mostly
    const selectedShopItem = useMemo(() => {
        const avatarDef = AVAILABLE_AVATARS.find(a => a.path === selectedAvatarPath);
        if (!avatarDef || avatarDef.id === 'base') {
            // Basic fallback
            return { slots: ['WEAPON', 'ARMOR', 'ACCESSORY'] };
        }
        return [...SHOP_ITEMS, ...ALL_COSMETIC_ITEMS].find(i => i.id === avatarDef.requiredItemId);
    }, [selectedAvatarPath]);

    const currentSlots = (selectedShopItem as any)?.slots || [];
    // Mastery/Starters can usually equip everything by default logic unless restricted
    const canEquipArmor = true; // Simplified for "glanceable" UI - rely on visual lock if needed, but standard logic says most can equip
    const canEquipAccessory = true;

    const equippedArmorId = stats.activeArmorId;
    const equippedAccessoryId = stats.activeAccessoryId;

    // Helper Component for Sections
    const SectionHeader = ({ id, label, icon: Icon }: { id: string, label: string, icon: any }) => (
        <button
            onClick={() => toggleSection(id)}
            className={`w-full md:hidden flex items-center justify-between p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl mb-1 shadow-sm transition-all ${mobileOpenSection === id ? 'ring-2 ring-indigo-500/50 border-indigo-500/50' : ''}`}
        >
            <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider text-xs">
                <Icon size={14} className="text-slate-400" /> {label}
            </div>
            <ChevronDown size={14} className={`text-slate-400 transition-transform duration-300 ${mobileOpenSection === id ? 'rotate-180' : ''}`} />
        </button>
    );

    // Define Mastery Avatars Data Locally for selector
    const masteryAvatars = [
        { id: 'avatar_scribe_master', label: 'Scribe', img: '/avatars/mastery/scribe_master.png' },
        { id: 'avatar_master_blacksmith', label: 'Smith', img: '/avatars/mastery/master_blacksmith.png' },
        { id: 'avatar_master_bounty_hunter', label: 'Hunter', img: '/avatars/mastery/master_bounty_hunter.png' }
    ];

    // Mastery avatar IDs to filter from AVAILABLE_AVATARS (they'll be added separately with mastery styling)
    const masteryIds = masteryAvatars.map(m => m.id);

    // Unified Avatar List
    const allAvatars = [
        ...AVAILABLE_AVATARS.filter(a => !masteryIds.includes(a.id)).map(a => ({
            id: a.id,
            displayPath: a.path,
            unlockId: a.requiredItemId || 'base',
            isUnlocked: !a.requiredItemId || inventory.some(i => i.id === a.requiredItemId) || STARTER_AVATARS.some(s => s.id === a.id),
            type: 'standard'
        })),
        ...masteryAvatars.map(a => ({
            id: a.id,
            displayPath: a.img,
            unlockId: a.id,
            isUnlocked: inventory.some(i => i.id === a.id),
            type: 'mastery'
        }))
    ];

    return (
        <div className="md:bg-white md:dark:bg-slate-900 md:border md:border-slate-200 md:dark:border-slate-800 md:rounded-3xl md:p-4 md:space-y-3 lg:sticky lg:top-4">
            {/* Desktop Header */}
            <div className="hidden md:flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2 mb-2">
                <div className="flex items-center gap-2">
                    <Swords size={18} className="text-slate-400" />
                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Loadout</h3>
                </div>
            </div>

            {/* MAIN CONTENT GRID - 4 Columns */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">

                {/* 1. AVATARS */}
                <div className="flex flex-col gap-2">
                    <SectionHeader id="avatars" label="Avatars" icon={Users} />
                    <div className={`${mobileOpenSection === 'avatars' ? 'block' : 'hidden'} md:block flex-1 min-h-0`}>
                        <div className="hidden md:flex justify-between items-center mb-1 min-h-[28px]">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 h-4">
                                <Users size={12} /> Avatar
                            </label>
                        </div>
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2 grid grid-cols-3 gap-2">
                            {allAvatars.map(avatar => {
                                const isSelected = stats.activeAvatarId === avatar.unlockId;
                                return (
                                    <button
                                        key={avatar.id}
                                        onClick={() => {
                                            if (avatar.isUnlocked) {
                                                setSelectedAvatarPath(avatar.displayPath);
                                                setAvatar(avatar.unlockId);
                                            }
                                        }}
                                        className={`aspect-square rounded-lg border-2 relative group flex items-center justify-center bg-slate-100 dark:bg-black/40 overflow-hidden ${isSelected ? (avatar.type === 'mastery' ? 'border-amber-500 shadow-lg shadow-amber-500/20' : 'border-amber-400 shadow-lg') : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600'} ${!avatar.isUnlocked && 'grayscale opacity-30 cursor-not-allowed'}`}
                                    >
                                        <img src={avatar.displayPath} className="w-full h-full object-cover pixelated" />
                                        {!avatar.isUnlocked && <div className="absolute inset-0 flex items-center justify-center bg-black/50"><Ban size={12} className="text-white/70" /></div>}
                                        {isSelected && <div className={`absolute top-1 right-1 w-1.5 h-1.5 rounded-full shadow-[0_0_5px_rgba(251,191,36,0.8)] ${avatar.type === 'mastery' ? 'bg-amber-500 shadow-[0_0_5px_rgba(245,158,11,0.8)]' : 'bg-amber-400'}`}></div>}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {/* 2. ARMOR */}
                <div className="flex flex-col gap-2">
                    <SectionHeader id="armor" label="Armor" icon={Shield} />
                    <div className={`${mobileOpenSection === 'armor' ? 'block' : 'hidden'} md:block flex-1 min-h-0`}>
                        <div className="hidden md:flex justify-between items-center mb-1 min-h-[28px]">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 h-4">
                                <Shield size={12} /> Armor
                            </label>
                        </div>
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2 grid grid-cols-3 gap-2">
                            {/* NONE OPTION */}
                            <button
                                onClick={() => equipItem('armor', null)}
                                className={`aspect-square rounded-lg border-2 relative group flex items-center justify-center bg-slate-100 dark:bg-black/40 ${!equippedArmorId ? 'border-amber-400 shadow-lg' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600'}`}
                            >
                                <div className="text-slate-600 group-hover:text-slate-400 transition-colors">
                                    <Ban size={16} />
                                </div>
                                {!equippedArmorId && <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-amber-400 rounded-full shadow-[0_0_5px_rgba(251,191,36,0.8)]"></div>}
                            </button>

                            {ALL_ITEMS.filter(i => isArmor(i) && i.type !== 'AVATAR' && inventory.some(inv => inv.id === i.id))
                                .sort((a, b) => (a.id === 'a_void_cloak' ? -1 : b.id === 'a_void_cloak' ? 1 : 0))
                                .map(item => (
                                    <button
                                        key={item.id}
                                        onClick={() => equipItem('armor', item.id === equippedArmorId ? null : item.id)}
                                        className={`aspect-square rounded-lg border-2 relative group flex items-center justify-center bg-slate-100 dark:bg-black/40 ${equippedArmorId === item.id ? 'border-amber-400 shadow-lg' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600'}`}
                                    >
                                        <img src={item.imageUrl} className="w-full h-full object-contain pixelated" />
                                        {equippedArmorId === item.id && <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-amber-400 rounded-full shadow-[0_0_5px_rgba(251,191,36,0.8)]"></div>}
                                    </button>
                                ))}
                        </div>
                    </div>
                </div>

                {/* 3. BACKDROP */}
                <div className="flex flex-col gap-2">
                    <SectionHeader id="backdrop" label="Backdrop" icon={Monitor} />
                    <div className={`${mobileOpenSection === 'backdrop' ? 'block' : 'hidden'} md:block flex-1 min-h-0`}>
                        <div className="hidden md:flex justify-between items-center mb-1 min-h-[28px]">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 h-4">
                                <Monitor size={12} /> Backdrop
                            </label>
                        </div>
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2 grid grid-cols-3 gap-2">
                            {/* NONE OPTION */}
                            <button
                                onClick={() => setBackdrop(null)}
                                className={`aspect-square rounded-lg border-2 relative group flex items-center justify-center bg-slate-100 dark:bg-black/40 ${!stats.activeBackdropId ? 'border-amber-400 shadow-lg' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600'}`}
                            >
                                <div className="text-slate-600 group-hover:text-slate-400 transition-colors">
                                    <Ban size={16} />
                                </div>
                                {!stats.activeBackdropId && <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-amber-400 rounded-full shadow-[0_0_5px_rgba(251,191,36,0.8)]"></div>}
                            </button>

                            {COSMETIC_SHOP_ITEMS.filter(i => i.type === 'THEME' && inventory.some(inv => inv.id === i.id)).map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => setBackdrop(item.id === stats.activeBackdropId ? null : item.id)}
                                    className={`aspect-square rounded-lg border-2 relative group flex items-center justify-center bg-slate-100 dark:bg-black/40 overflow-hidden ${stats.activeBackdropId === item.id ? 'border-amber-400 shadow-lg' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600'}`}
                                    title={item.name}
                                >
                                    {item.imageUrl.endsWith('.mp4') ? (
                                        <video src={item.imageUrl} className="w-full h-full object-cover opacity-80" muted loop autoPlay playsInline />
                                    ) : (
                                        <img src={item.imageUrl} className="w-full h-full object-cover" />
                                    )}
                                    {stats.activeBackdropId === item.id && <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-amber-400 rounded-full shadow-[0_0_5px_rgba(251,191,36,0.8)]"></div>}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 4. COMPANION */}
                <div className="flex flex-col gap-2">
                    <SectionHeader id="companion" label="Companion" icon={Sparkles} />
                    <div className={`${mobileOpenSection === 'companion' ? 'block' : 'hidden'} md:block flex-1 min-h-0`}>
                        <div className="hidden md:flex justify-between items-center mb-1 min-h-[28px]">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 h-4">
                                <Sparkles size={12} /> Companion
                            </label>
                        </div>
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2 grid grid-cols-3 gap-2">
                            {/* NONE OPTION */}
                            <button
                                onClick={() => equipItem('accessory', null)}
                                className={`aspect-square rounded-lg border-2 relative group flex items-center justify-center bg-slate-100 dark:bg-black/40 ${!equippedAccessoryId ? 'border-amber-400 shadow-lg' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600'}`}
                            >
                                <div className="text-slate-600 group-hover:text-slate-400 transition-colors">
                                    <Ban size={16} />
                                </div>
                                {!equippedAccessoryId && <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-amber-400 rounded-full shadow-[0_0_5px_rgba(251,191,36,0.8)]"></div>}
                            </button>

                            {ALL_ITEMS.filter(i => isAccessory(i) && i.type !== 'AVATAR' && inventory.some(inv => inv.id === i.id)).map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => equipItem('accessory', item.id === equippedAccessoryId ? null : item.id)}
                                    className={`aspect-square rounded-lg border-2 relative group flex items-center justify-center bg-slate-100 dark:bg-black/40 ${equippedAccessoryId === item.id ? 'border-amber-400 shadow-lg' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600'}`}
                                >
                                    <img src={item.imageUrl} className="w-full h-full object-contain pixelated" />
                                    {equippedAccessoryId === item.id && <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-amber-400 rounded-full shadow-[0_0_5px_rgba(251,191,36,0.8)]"></div>}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
