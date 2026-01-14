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

    // Mobile Accordion State
    const [mobileOpenSection, setMobileOpenSection] = useState<string | null>(null);
    const toggleSection = (section: string) => {
        setMobileOpenSection(mobileOpenSection === section ? null : section);
    };

    // Helper to get ID from path
    const getAvatarIdFromPath = (path: string) => {
        const found = AVAILABLE_AVATARS.find(a => a.path === path);
        if (found) return found.requiredItemId || AVAILABLE_AVATARS[0].requiredItemId;
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

    // Selection Logic
    const selectedShopItem = useMemo(() => {
        const avatarDef = AVAILABLE_AVATARS.find(a => a.path === selectedAvatarPath);
        if (!avatarDef || avatarDef.id === 'base') {
            return {
                slots: ['WEAPON', 'ARMOR', 'ACCESSORY']
            };
        }
        return [...SHOP_ITEMS, ...ALL_COSMETIC_ITEMS].find(i => i.id === avatarDef.requiredItemId);
    }, [selectedAvatarPath]);

    const currentSlots = (selectedShopItem as any)?.slots || [];
    const isStarterAvatar = STARTER_AVATARS.some(s => s.id === currentAvatarId);
    const canEquipArmor = currentSlots.includes('ARMOR');
    const canEquipAccessory = currentSlots.includes('ACCESSORY') || isStarterAvatar;

    const equippedArmorId = stats.activeArmorId;
    const equippedAccessoryId = stats.activeAccessoryId;

    // Helper Component for Sections
    const SectionHeader = ({ id, label, icon: Icon }: { id: string, label: string, icon: any }) => (
        <button
            onClick={() => toggleSection(id)}
            className={`w-full md:hidden flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl mb-2 shadow-sm transition-all ${mobileOpenSection === id ? 'ring-2 ring-indigo-500/50 border-indigo-500/50' : ''}`}
        >
            <div className="flex items-center gap-3 font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider text-xs">
                <Icon size={16} className="text-slate-400" /> {label}
            </div>
            <ChevronDown size={18} className={`text-slate-400 transition-transform duration-300 ${mobileOpenSection === id ? 'rotate-180' : ''}`} />
        </button>
    );

    return (
        <div className="md:bg-white md:dark:bg-slate-900 md:border md:border-slate-200 md:dark:border-slate-800 md:rounded-3xl md:p-6 md:space-y-4 lg:sticky lg:top-4">
            {/* Desktop Header */}
            <div className="hidden md:flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-1">
                <Swords size={20} className="text-slate-400" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wider">Loadout</h3>
            </div>

            {/* AVATARS SELECTOR */}
            <div className="md:block">
                <SectionHeader id="avatars" label="Avatars" icon={Users} />
                <div className={`${mobileOpenSection === 'avatars' ? 'block mb-4' : 'hidden'} md:block animate-in slide-in-from-top-2 duration-200`}>
                    <div className="hidden md:flex justify-between items-center mb-1">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                            <Users size={14} /> Avatars
                        </label>
                    </div>
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1.5 grid grid-cols-6 gap-1">
                        {AVAILABLE_AVATARS.map(avatar => {
                            const isUnlocked = !avatar.requiredItemId || inventory.some(i => i.id === avatar.requiredItemId) || STARTER_AVATARS.some(s => s.id === avatar.id);
                            const currentId = avatar.requiredItemId || 'base';
                            const activeId = stats.activeAvatarId || 'base';
                            const isSelected = currentId === activeId;

                            return (
                                <button
                                    key={avatar.id}
                                    onClick={() => {
                                        if (isUnlocked) {
                                            setSelectedAvatarPath(avatar.path);
                                            setAvatar(avatar.requiredItemId || 'base');
                                        }
                                    }}
                                    className={`aspect-square rounded-lg border-2 relative group flex items-center justify-center bg-slate-100 dark:bg-black/40 overflow-hidden ${isSelected ? 'border-amber-400 shadow-lg' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600'} ${!isUnlocked && 'grayscale opacity-30'}`}
                                >
                                    <img src={avatar.path} className="w-full h-full object-cover pixelated" />
                                    {isSelected && <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-amber-400 rounded-full shadow-[0_0_5px_rgba(251,191,36,0.8)]"></div>}
                                </button>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* ARMOR SLOT */}
            <div className={`md:block transition-opacity duration-500 ${canEquipArmor ? 'opacity-100' : 'opacity-30 grayscale pointer-events-none'}`}>
                <SectionHeader id="armor" label="Armor" icon={Shield} />
                <div className={`${mobileOpenSection === 'armor' ? 'block mb-4' : 'hidden'} md:block animate-in slide-in-from-top-2 duration-200`}>
                    <div className="hidden md:flex justify-between items-center mb-1">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                            <Shield size={14} /> Armor
                        </label>
                        {!canEquipArmor && <span className="text-[10px] text-red-500 font-bold uppercase border border-red-500/30 bg-red-900/10 px-2 py-0.5 rounded">Locked</span>}
                    </div>
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1.5 grid grid-cols-6 gap-1">
                        {/* NONE OPTION */}
                        <button
                            onClick={() => canEquipArmor && equipItem('armor', null)}
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
                                    onClick={() => canEquipArmor && equipItem('armor', item.id === equippedArmorId ? null : item.id)}
                                    className={`aspect-square rounded-lg border-2 relative group flex items-center justify-center bg-slate-100 dark:bg-black/40 ${equippedArmorId === item.id ? 'border-amber-400 shadow-lg' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600'}`}
                                >
                                    <img src={item.imageUrl} className="w-3/4 h-3/4 object-contain pixelated" />
                                    {equippedArmorId === item.id && <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-amber-400 rounded-full shadow-[0_0_5px_rgba(251,191,36,0.8)]"></div>}
                                </button>
                            ))}
                    </div>
                </div>
            </div>

            {/* BACKDROP SLOT */}
            <div className="md:block">
                <SectionHeader id="backdrop" label="Backdrop" icon={Monitor} />
                <div className={`${mobileOpenSection === 'backdrop' ? 'block mb-4' : 'hidden'} md:block animate-in slide-in-from-top-2 duration-200`}>
                    <div className="hidden md:flex justify-between items-center mb-1">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                            <Monitor size={14} /> Backdrop
                        </label>
                    </div>
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1.5 grid grid-cols-6 gap-1">
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

            {/* ACCESSORY SLOT */}
            <div className={`md:block transition-opacity duration-500 ${canEquipAccessory ? 'opacity-100' : 'opacity-30 grayscale pointer-events-none'}`}>
                <SectionHeader id="companion" label="Companion" icon={Sparkles} />
                <div className={`${mobileOpenSection === 'companion' ? 'block mb-4' : 'hidden'} md:block animate-in slide-in-from-top-2 duration-200`}>
                    <div className="hidden md:flex justify-between items-center mb-1">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                            <Sparkles size={14} /> Companion
                        </label>
                        {!canEquipAccessory && <span className="text-[10px] text-red-500 font-bold uppercase border border-red-500/30 bg-red-900/10 px-2 py-0.5 rounded">Locked</span>}
                    </div>
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1.5 grid grid-cols-6 gap-1">
                        {/* NONE OPTION */}
                        <button
                            onClick={() => canEquipAccessory && equipItem('accessory', null)}
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
                                onClick={() => canEquipAccessory && equipItem('accessory', item.id === equippedAccessoryId ? null : item.id)}
                                className={`aspect-square rounded-lg border-2 relative group flex items-center justify-center bg-slate-100 dark:bg-black/40 ${equippedAccessoryId === item.id ? 'border-amber-400 shadow-lg' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600'}`}
                            >
                                <img src={item.imageUrl} className="w-3/4 h-3/4 object-contain pixelated" />
                                {equippedAccessoryId === item.id && <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-amber-400 rounded-full shadow-[0_0_5px_rgba(251,191,36,0.8)]"></div>}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
