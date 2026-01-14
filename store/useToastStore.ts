import { create } from 'zustand';

export type RewardType = 'xp' | 'gold' | 'gems' | 'item';

export interface ToastMessage {
    id: string;
    type: RewardType;
    amount: number | string;
    message: string;
    icon?: string; // Optional custom icon URL or lucide name
}

interface ToastStore {
    toasts: ToastMessage[];
    addToast: (toast: Omit<ToastMessage, 'id'>) => void;
    removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
    toasts: [],
    addToast: (toast) => {
        const id = Math.random().toString(36).substring(7);
        set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));

        // Auto remove after 3 seconds
        setTimeout(() => {
            set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
        }, 4000); // 4s to allow for enter/exit anims
    },
    removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));
