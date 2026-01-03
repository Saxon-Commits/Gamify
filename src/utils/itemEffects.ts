import { GameState, Stats, ActiveBuff } from '../../types';

type EffectResult = {
    success: boolean;
    message: string;
    updates?: Partial<GameState>;
    statsUpdates?: Partial<Stats>;
};

export const ITEM_EFFECTS: Record<string, (state: GameState) => EffectResult> = {
    'stim_pack': (state) => {
        const currentEnergy = state.stats.energy;
        const maxEnergy = state.stats.maxEnergy;

        if (currentEnergy >= maxEnergy) {
            return { success: false, message: "Energy is already full!" };
        }

        const newEnergy = Math.min(maxEnergy, currentEnergy + 20);
        return {
            success: true,
            message: "+20 Energy Restored",
            statsUpdates: { energy: newEnergy }
        };
    },

    'overclock_mode': (state) => {
        // 4 Hours duration
        const durationMs = 4 * 60 * 60 * 1000;
        const expiresAt = new Date(Date.now() + durationMs).toISOString();

        const newBuff: ActiveBuff = {
            id: `buff_${Date.now()}`,
            type: 'XP_BOOST',
            value: 2,
            expiresAt
        };

        return {
            success: true,
            message: "Overclock Mode Engaged: 2x XP for 4 hours!",
            updates: { activeBuffs: [...(state.activeBuffs || []), newBuff] }
        };
    },

    'ubereats_token': () => ({
        success: true,
        message: "Cheat Meal Token Redeemed. Enjoy your food!",
        // No stat changes, just consumes
    }),

    'netflix_pass': () => ({ // Legacy ID support
        success: true,
        message: "Netflix Pass Redeemed. Enjoy the show!",
    }),

    'youtube_token': () => ({
        success: true,
        message: "YouTube Pass Redeemed. Zoning out authorized.",
    }),

    'offline_protocol': () => ({
        success: true,
        message: "Offline Protocol Active. Go touch grass.",
    }),

    'chronos_key': () => ({
        success: false,
        message: "Cannot use directly. Apply to a specific Quest in the Log.",
    }),

    'mind_wipe': () => ({
        success: false,
        message: "Visit the Skill Tree to use this for a respec.",
    })
};
