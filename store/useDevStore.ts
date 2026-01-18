
import { create } from 'zustand';
import { EquipmentOffset } from '../src/utils/EquipmentConfig';

interface DevStore {
    devPanelOpen: boolean;
    setDevPanelOpen: (v: boolean) => void;
    devEditMode: 'backdrop' | 'avatar' | 'companion' | 'equipment';
    setDevEditMode: (v: 'backdrop' | 'avatar' | 'companion' | 'equipment') => void;

    // Companion
    devCompanionTop: number; setDevCompanionTop: (v: number) => void;
    devCompanionRight: number; setDevCompanionRight: (v: number) => void;
    devCompanionScale: number; setDevCompanionScale: (v: number) => void;
    devCompanionRotation: number; setDevCompanionRotation: (v: number) => void;

    // Avatar
    devAvatarScale: number; setDevAvatarScale: (v: number) => void;
    devAvatarOffsetX: number; setDevAvatarOffsetX: (v: number) => void;
    devAvatarOffsetY: number; setDevAvatarOffsetY: (v: number) => void;

    // Backdrop
    devBackdropScale: number; setDevBackdropScale: (v: number) => void;
    devBackdropOffsetX: number; setDevBackdropOffsetX: (v: number) => void;
    devBackdropOffsetY: number; setDevBackdropOffsetY: (v: number) => void;

    // Equipment
    devActiveItem: string; setDevActiveItem: (v: string) => void;
    devOffset: EquipmentOffset; setDevOffset: (v: EquipmentOffset) => void;
    isDevMode: boolean; setIsDevMode: (v: boolean) => void;
}

export const useDevStore = create<DevStore>((set) => ({
    devPanelOpen: false,
    setDevPanelOpen: (v) => set({ devPanelOpen: v }),
    devEditMode: 'backdrop',
    setDevEditMode: (v) => set({ devEditMode: v }),

    // Companion
    devCompanionTop: 38.5,
    setDevCompanionTop: (v) => set({ devCompanionTop: v }),
    devCompanionRight: 63,
    setDevCompanionRight: (v) => set({ devCompanionRight: v }),
    devCompanionScale: 1,
    setDevCompanionScale: (v) => set({ devCompanionScale: v }),
    devCompanionRotation: 7,
    setDevCompanionRotation: (v) => set({ devCompanionRotation: v }),

    // Avatar
    devAvatarScale: 77,
    setDevAvatarScale: (v) => set({ devAvatarScale: v }),
    devAvatarOffsetX: 1,
    setDevAvatarOffsetX: (v) => set({ devAvatarOffsetX: v }),
    devAvatarOffsetY: -16,
    setDevAvatarOffsetY: (v) => set({ devAvatarOffsetY: v }),

    // Backdrop
    devBackdropScale: 100,
    setDevBackdropScale: (v) => set({ devBackdropScale: v }),
    devBackdropOffsetX: 0,
    setDevBackdropOffsetX: (v) => set({ devBackdropOffsetX: v }),
    devBackdropOffsetY: 0,
    setDevBackdropOffsetY: (v) => set({ devBackdropOffsetY: v }),

    // Equipment
    devActiveItem: 'a_seraph_wings',
    setDevActiveItem: (v) => set({ devActiveItem: v }),
    devOffset: { top: 30, left: 50, scale: 1.0, rotation: 0, zIndex: 60 },
    setDevOffset: (v) => set({ devOffset: v }),
    isDevMode: false,
    setIsDevMode: (v) => set({ isDevMode: v }),
}));
