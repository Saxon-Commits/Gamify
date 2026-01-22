import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UISettings {
    theme: 'light' | 'dark';
    musicVolume: number;
    sfxVolume: number;
    isMusicMuted: boolean;
    honorSystemAgreed: boolean;
}

interface SettingsStore extends UISettings {
    setTheme: (theme: 'light' | 'dark') => void;
    setMusicVolume: (volume: number) => void;
    setSfxVolume: (volume: number) => void;
    toggleMusicMute: () => void;
    confirmHonorPledge: () => void;
}

// UI settings stored locally for performance (not game-critical data)
export const useSettingsStore = create<SettingsStore>()(
    persist(
        (set) => ({
            theme: 'dark',
            musicVolume: 0.4,
            sfxVolume: 0.4,
            isMusicMuted: false,
            honorSystemAgreed: false,

            setTheme: (theme) => set({ theme }),
            setMusicVolume: (volume) => set({ musicVolume: volume }),
            setSfxVolume: (volume) => set({ sfxVolume: volume }),
            toggleMusicMute: () => set((state) => ({ isMusicMuted: !state.isMusicMuted })),
            confirmHonorPledge: () => set({ honorSystemAgreed: true }),
        }),
        {
            name: 'xp-focus-ui-settings', // localStorage key
        }
    )
);
