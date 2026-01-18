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

    // 1. Hydration (Initial Load)
    useEffect(() => {
        // Only load if we have a user and cloud state exists, and we haven't loaded yet
        if (isUserLoaded && user && cloudState && !hasLoadedRef.current) {
            console.log("☁️ Found Cloud Save, Hydrating Local Store...", cloudState);

            // Zustand's setState can take a partial or full state.
            // We assume cloudState is the full persist object or the state itself.
            // Our store uses 'persist' middleware, but setState works on the store root.
            // We need to be careful not to break functions. Zustand persist saves "state" part.
            // The cloudState we saved is likely the full state object including data.
            // Let's assume structure matches.

            useGameStore.setState(cloudState);
            // We use merge (default) to ensure methods defined in the store creator are preserved.
            // cloudState contains only data, so this updates the data while keeping functions intact.

            hasLoadedRef.current = true;
            addToast({ type: 'success', message: 'Cloud Save Loaded', amount: 0 });
        }
    }, [cloudState, isUserLoaded, user]);

    // 2. Auto-Save (Persistence)
    useEffect(() => {
        if (!isUserLoaded || !user) return;

        // We subscribe to the store
        // Use a ref to debounce
        let timeoutId: NodeJS.Timeout;

        const unsub = useGameStore.subscribe((state) => {
            // Don't save if we haven't loaded yet (avoid overwriting cloud with empty local)
            // UNLESS we are sure this is a new game.
            // But typically we want to check for cloud existence first.

            // Wait for cloud query to resolve at least once (undefined means loading, null means empty).
            if (cloudState === undefined) return;

            // Debounce save
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                // Strip out functions if needed, but Convex usually handles JSON-serializable data.
                // Zustand state includes functions in the object usually? No, just data if defined that way.
                // Let's verify what we send.

                // We can just send the whole state, Convex/V8 serialization will ignore functions.
                // Ideally we pick only data fields: stats, tasks, projects, etc.
                // Sending 'state' might send everything.

                // Let's manually pick the persistable parts to be safe and efficient.
                const {
                    stats, settings, projects, tasks, skillNodes, skillEdges,
                    isTutorialActive, journalEntries, inventory,
                    cart, purchaseHistory
                } = state;

                const payload = {
                    stats, settings, projects, tasks, skillNodes, skillEdges,
                    isTutorialActive, journalEntries, inventory,
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
                // If failed, we might want to reload or retry?
                // Ideally we let it retry on next render, but mapped check needs to be careful.
                processingRef.current.delete(reward._id);
            }
        });
    }, [pendingRewards, claimReward, addToast]);


    return null; // Headless component
};
