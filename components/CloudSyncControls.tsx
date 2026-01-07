import React from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { useGameStore } from '../store/useGameStore';
import { useUser, SignInButton } from '@clerk/clerk-react';
import { Cloud, Upload, Download, RefreshCw, Check, AlertCircle } from 'lucide-react';

export const CloudSyncControls: React.FC = () => {
    const { isSignedIn, user } = useUser();
    const gameState = useGameStore(state => state);
    const saveToCloud = useMutation(api.gameState.save);
    // We don't auto-load here to avoid overwrites, but we could fetch metadata
    const cloudState = useQuery(api.gameState.load);

    const [status, setStatus] = React.useState<'idle' | 'saving' | 'loading' | 'success' | 'error'>('idle');

    // Auto-save is now handled globally in App.tsx
    // We keep this component for manual control and status display (if we link state later)

    /* 
       TODO: To show "Saving..." status here from the global saver, we'd need to move `status` 
       to the global store. for now, this manual button is just an extra "Force Save".
    */

    const handleSave = async () => {
        if (!isSignedIn) return;
        setStatus('saving');
        try {
            // Create a clean copy of state excluding functions
            const stateToSave = JSON.parse(JSON.stringify(gameState));
            await saveToCloud({ state: stateToSave });
            setStatus('success');
            setTimeout(() => setStatus('idle'), 2000);
        } catch (error) {
            console.error(error);
            setStatus('error');
        }
    };

    const handleLoad = async () => {
        if (!cloudState) return;
        if (!confirm("This will OVERWRITE your local progress with the cloud save. Are you sure?")) return;

        // Naively replace state
        useGameStore.setState(cloudState);
        alert("Cloud save loaded!");
    };

    if (!isSignedIn) {
        return (
            <div className="p-4 bg-slate-950/50 rounded-xl border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Cloud className="text-slate-500" size={20} />
                    <div>
                        <div className="text-sm font-bold text-slate-300">Sync is inactive</div>
                        <div className="text-xs text-slate-500">Sign in to backup your progress.</div>
                    </div>
                </div>
                <SignInButton mode="modal">
                    <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-colors">
                        Sign In
                    </button>
                </SignInButton>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-xs">
                        {user?.firstName?.[0] || 'U'}
                    </div>
                    <div>
                        <div className="text-sm font-bold text-indigo-400">Cloud Sync Active</div>
                        <div className="text-xs text-indigo-300/60">Logged in as {user?.primaryEmailAddress?.emailAddress}</div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {status === 'success' && <Check size={16} className="text-green-400" />}
                    {status === 'saving' && <RefreshCw size={16} className="text-indigo-400 animate-spin" />}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <button
                    onClick={handleSave}
                    disabled={status === 'saving'}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
                >
                    <Upload size={14} className={status === 'saving' ? 'animate-bounce' : ''} />
                    <span>{status === 'saving' ? 'Saving...' : 'Save to Cloud'}</span>
                </button>

                <button
                    onClick={handleLoad}
                    disabled={!cloudState}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Download size={14} />
                    <span>Load from Cloud</span>
                </button>
            </div>

            {cloudState && (
                <div className="text-[10px] text-center text-slate-600 font-mono">
                    Cloud Save Found (State Size: {(JSON.stringify(cloudState).length / 1024).toFixed(2)} KB)
                </div>
            )}
        </div>
    );
};
