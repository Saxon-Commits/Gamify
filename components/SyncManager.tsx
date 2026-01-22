import React, { useEffect, useRef } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { useGameStore } from '../store/useGameStore';
import { useUser } from '@clerk/clerk-react';
import { useToastStore } from '../store/useToastStore';

export const SyncManager: React.FC = () => {
    const { user, isLoaded: isUserLoaded } = useUser();
    const saveGameState = useMutation(api.gameState.save);
    const cloudState = useQuery(api.gameState.load);

    const hasLoadedRef = useRef(false);
    const addToast = useToastStore(state => state.addToast);

    // 1. Cloud Hydration (Initial Load) - Single Source of Truth
    useEffect(() => {
        // Only load if we have a user and cloud state exists, and we haven't loaded yet
        if (isUserLoaded && user && cloudState && !hasLoadedRef.current) {
            console.log("☁️ Loading Cloud State (Single Source of Truth)...", cloudState);

            // Filter out old fields that no longer exist in GameState (e.g., settings)
            const { settings, ...validState } = cloudState as any;

            // Load cloud state into Zustand store
            useGameStore.setState(validState);

            hasLoadedRef.current = true;
            addToast({ type: 'success', message: 'Cloud Save Loaded', amount: 0 });
        }
    }, [cloudState, isUserLoaded, user, addToast]);

    // 2. Auto-Save to Cloud (Debounced)
    useEffect(() => {
        if (!isUserLoaded || !user) return;

        let timeoutId: NodeJS.Timeout;

        const unsub = useGameStore.subscribe((state) => {
            // Wait for cloud query to resolve at least once
            if (cloudState === undefined) return;

            // Debounce save
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                // Pick only persistable data fields
                const {
                    stats, projects, tasks, skillNodes, skillEdges,
                    journalEntries, inventory,
                    cart, purchaseHistory
                } = state;

                const payload = {
                    stats, projects, tasks, skillNodes, skillEdges,
                    journalEntries, inventory,
                    cart, purchaseHistory
                };

                console.log("☁️ Auto-Saving to Cloud...");
                saveGameState({ state: payload })
                    .catch(err => console.error("Cloud Save Failed:", err));

            }, 2000); // 2 second debounce
        });

        return () => {
            unsub();
            clearTimeout(timeoutId);
        };
    }, [isUserLoaded, user, saveGameState, cloudState]);

    // 3. Reward Listener (Injection)
    const pendingRewards = useQuery(api.rewards.getPending) || [];
    const claimReward = useMutation(api.rewards.claim);
    const processingRef = useRef<Set<string>>(new Set());

    useEffect(() => {
        if (!pendingRewards || pendingRewards.length === 0) return;

        pendingRewards.forEach(async (reward) => {
            // Avoid double processing in strict mode
            if (processingRef.current.has(reward._id)) return;
            processingRef.current.add(reward._id);

            console.log("🎁 Processing Pending Reward:", reward);

            // 1. Add to Local Store
            if (reward.type === 'gold') {
                useGameStore.getState().addResources({ gold: reward.amount });
            } else if (reward.type === 'gems') {
                useGameStore.getState().addResources({ gems: reward.amount });
            } else if (reward.type === 'xp') {
                useGameStore.getState().addResources({ xp: reward.amount });
            } else if (reward.type === 'item') {
                // Check if we have item data
                if (reward.data && reward.data.itemId) {
                    useGameStore.getState().addItem(reward.data.itemId, reward.amount || 1);
                }
            }
            // Add other types here if needed

            // 2. Notify User
            addToast({
                type: 'success',
                message: reward.description || 'System Reward Received!',
                amount: reward.amount
            });

            // 3. Claim on Server (Delete from queue)
            try {
                await claimReward({ rewardId: reward._id });
                processingRef.current.delete(reward._id);
            } catch (err) {
                console.error("Failed to claim reward:", err);
                processingRef.current.delete(reward._id);
            }
        });
    }, [pendingRewards, claimReward, addToast]);


    return null; // Headless component
};
