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
                    vitality, isTutorialActive, journalEntries, inventory,
                    cart, purchaseHistory, activityLog
                } = state;

                const payload = {
                    stats, settings, projects, tasks, skillNodes, skillEdges,
                    vitality, isTutorialActive, journalEntries, inventory,
                    cart, purchaseHistory, activityLog
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

    return null; // Headless component
};
