import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useClerk } from "@clerk/clerk-react";
import { useGameStore } from '../store/useGameStore';
import { Database, Trash2, Download, Info, Unlock, Coins, Volume2, BookOpen, CheckCircle, Edit2, X, RefreshCw, User as UserIcon } from 'lucide-react';
import { SHOP_ITEMS } from '../src/utils/GameEconomy';
import { ALL_COSMETIC_ITEMS } from '../src/utils/CosmeticsData';
import { CloudSyncControls } from '../components/CloudSyncControls';
import { useQuery, useAction, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Shield, Zap, Info as InfoIcon, Sun } from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';

const LIFETIME_PRICE_ID = 'price_1SlpqyLQXrapzCX8bubgyJ0C';

// Separate inner component to handle username edit state cleanly to avoid too much clutter in main
const ProfileSettings: React.FC<{ currentUsername?: string }> = ({ currentUsername }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newUsername, setNewUsername] = useState(currentUsername || "");
  const [error, setError] = useState("");

  const setUsernameMutation = useMutation(api.users.setUsername);
  // Note: React Query or specific hooks might be better for debounced check, 
  // but here we will just check on submit or let the mutation fail for simplicity
  // OR we can implement a manual check if we want real-time feedback.
  // Let's stick to simple "Save" button feedback.

  const handleSave = async () => {
    if (newUsername.length < 3) {
      setError("Too short (min 3 chars)");
      return;
    }
    try {
      await setUsernameMutation({ username: newUsername });
      setIsEditing(false);
      setError("");
    } catch (e: any) {
      setError(e.message || "Failed to update");
    }
  };

  return (
    <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
      <div className="flex items-center space-x-3 mb-6">
        <UserIcon className="text-indigo-500 dark:text-indigo-400" size={18} />
        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-700 dark:text-slate-200">Identity</h2>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 p-4 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="space-y-1 w-full sm:w-auto">
          <div className="text-xs text-slate-500 font-bold uppercase">Username</div>
          {isEditing ? (
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-bold">@</span>
              <input
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                className="bg-slate-200 dark:bg-slate-800 border-none rounded px-2 py-1 text-sm font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                autoFocus
              />
            </div>
          ) : (
            <div className="text-lg font-mono font-bold text-slate-900 dark:text-white">
              @{currentUsername || "unknown"}
            </div>
          )}
          {error && <div className="text-xs text-red-500">{error}</div>}
        </div>

        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <button onClick={() => { setIsEditing(false); setError(""); setNewUsername(currentUsername || ""); }} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors">
                <X size={16} />
              </button>
              <button onClick={handleSave} className="p-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg shadow-lg shadow-indigo-500/20 transition-colors">
                <CheckCircle size={16} />
              </button>
            </>
          ) : (
            <button onClick={() => { setIsEditing(true); setNewUsername(currentUsername || ""); }} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-indigo-500 transition-colors">
              <Edit2 size={16} />
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export const Settings: React.FC = () => {
  const { signOut } = useClerk();
  const settings = useGameStore(state => state.settings);
  const user = useQuery(api.users.getMe);
  const pay = useAction(api.pay.createCheckoutSession);

  const handleUpgrade = async () => {
    try {
      const url = await pay({ priceId: LIFETIME_PRICE_ID });
      if (url) window.location.href = url;
    } catch (error) {
      console.error("Payment Error:", error);
      alert("Failed to initiate checkout. See console.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="grid grid-cols-1 gap-6">


        <ProfileSettings currentUsername={user?.username} />

        {/* DEBUG: Role Status */}
        <section className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Shield className="text-amber-500" size={18} />
            <h2 className="text-sm font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">Debug: Access Level</h2>
          </div>
          <div className="space-y-2 font-mono text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">Current Role:</span>
              <span className={`font-bold ${user?.role === 'admin' ? 'text-green-500' : 'text-amber-500'}`}>
                {user?.role || 'undefined'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">Admin Access:</span>
              <span className={`font-bold ${user?.role === 'admin' ? 'text-green-500' : 'text-red-500'}`}>
                {user?.role === 'admin' ? '✅ GRANTED' : '❌ DENIED'}
              </span>
            </div>
            {user?.role !== 'admin' && (
              <div className="mt-4 p-3 bg-slate-900 dark:bg-slate-950 rounded text-xs text-slate-400">
                <p className="mb-2 font-bold text-amber-400">To fix admin access:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Go to Convex Dashboard</li>
                  <li>Open "users" table</li>
                  <li>Find your user</li>
                  <li>Set role = "admin"</li>
                </ol>
              </div>
            )}
          </div>
        </section>

        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Info className="text-indigo-500 dark:text-indigo-400" size={18} />
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-700 dark:text-slate-200">About the System</h2>
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-4">
            PARA RPG is a gamified productivity system designed to turn real-world projects into epic quests and habits into experience points.
            The system is powered by local storage, meaning all your data stays private and stored directly in your browser.
          </p>
          <div className="p-4 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
            Version 1.3.0 - "Sovereign Update"
          </div>
          <button
            onClick={() => useGameStore.getState().setTutorialActive(true)}
            className="mt-4 flex items-center gap-2 px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors"
          >
            <BookOpen size={14} />
            <span>Replay Tutorial</span>
          </button>

          <div className="mt-6 flex gap-4 text-xs text-slate-500">
            <Link to="/privacy" className="hover:text-indigo-400 underline decoration-slate-700 underline-offset-4 transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-indigo-400 underline decoration-slate-700 underline-offset-4 transition-colors">
              Terms of Service
            </Link>
          </div>
        </section>

        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Sun className="text-amber-500" size={18} />
              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-900 dark:text-white">Appearance</h2>
            </div>
            <ThemeToggle />
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Toggle between Light and Dark mode.
          </p>
        </section>

        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Volume2 className="text-indigo-500 dark:text-indigo-400" size={18} />
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-700 dark:text-slate-200">Audio Settings</h2>
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400 text-sm font-medium">Background Music Volume</span>
                <span className="text-indigo-500 dark:text-indigo-400 text-xs font-mono bg-indigo-50 dark:bg-indigo-500/10 px-2 py-1 rounded">
                  {Math.round((settings.musicVolume !== undefined ? settings.musicVolume : 0.4) * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.musicVolume !== undefined ? settings.musicVolume : 0.4}
                onChange={(e) => useGameStore.getState().setMusicVolume(parseFloat(e.target.value))}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400 text-sm font-medium">Sound Effects Volume</span>
                <span className="text-indigo-500 dark:text-indigo-400 text-xs font-mono bg-indigo-50 dark:bg-indigo-500/10 px-2 py-1 rounded">
                  {Math.round((settings.sfxVolume !== undefined ? settings.sfxVolume : 0.4) * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.sfxVolume !== undefined ? settings.sfxVolume : 0.4}
                onChange={(e) => useGameStore.getState().setSfxVolume(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 transition-all"
              />
            </div>
          </div>
        </section>

        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Database className="text-indigo-500 dark:text-indigo-400" size={18} />
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-700 dark:text-slate-200">Cloud Sync (Beta)</h2>
          </div>

          <CloudSyncControls />

          <p className="text-slate-500 text-[11px] mb-6 font-medium mt-6">Manage your local data.</p>
          <div className="flex flex-wrap gap-3">
            <button className="flex items-center space-x-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors">
              <Download size={14} />
              <span>Export Journey Log</span>
            </button>
            <button
              onClick={() => {
                if (confirm('Are you sure you want to completely wipe your progress? This cannot be undone.')) {
                  useGameStore.getState().resetGame();
                  window.location.reload();
                }
              }}
              className="flex items-center space-x-2 px-6 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors"
            >
              <Trash2 size={14} />
              <span>Wipe Journey (Reset)</span>
            </button>
            <button
              onClick={() => signOut()}
              className="flex items-center space-x-2 px-6 py-3 bg-red-600/20 hover:bg-red-600/30 border border-red-600/40 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors"
            >
              <Trash2 size={14} />
              <span>Log Out</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
