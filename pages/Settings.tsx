import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useClerk } from "@clerk/clerk-react";
import { useGameStore } from '../store/useGameStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { Database, Trash2, Download, Info, Unlock, Coins, Volume2, BookOpen, CheckCircle, Edit2, X, RefreshCw, User as UserIcon } from 'lucide-react';
import { SHOP_ITEMS } from '../src/utils/GameEconomy';
import { ALL_COSMETIC_ITEMS } from '../src/utils/CosmeticsData';
import { CloudSyncControls } from '../components/CloudSyncControls';
import { useQuery, useAction, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Shield, Zap, Info as InfoIcon, Sun } from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';
import { useUser } from '@clerk/clerk-react';

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
  const { user: clerkUser } = useUser();
  const user = useQuery(api.users.getMe);
  const pay = useAction(api.pay.createCheckoutSession);
  const deleteAccountMutation = useMutation(api.users.deleteAccount);

  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleUpgrade = async () => {
    try {
      const url = await pay({ priceId: LIFETIME_PRICE_ID });
      if (url) window.location.href = url;
    } catch (e) {
      console.error(e);
      alert('Failed to create checkout session');
    }
  };

  const handleDeleteAccount = async () => {
    // Double confirmation
    const confirmed = window.confirm(
      "⚠️ WARNING: This will PERMANENTLY delete your account and ALL data including:\n\n" +
      "• All game progress (level, XP, stats)\n" +
      "• All items and inventory\n" +
      "• Journal entries\n" +
      "• Guild memberships and owned guilds\n" +
      "• Everything else\n\n" +
      "This action CANNOT be undone. Are you absolutely sure?"
    );

    if (!confirmed) return;

    // Second confirmation
    const reallyConfirmed = window.confirm(
      "This is your FINAL warning. Click OK to permanently delete your account."
    );

    if (!reallyConfirmed) return;

    setIsDeleting(true);

    try {
      // 1. Delete all Convex data first
      console.log("Deleting Convex data...");
      await deleteAccountMutation();

      // 2. Try to delete Clerk account (may fail if email unverified)
      console.log("Attempting to delete Clerk account...");
      if (clerkUser) {
        try {
          await clerkUser.delete();
          console.log("✅ Account fully deleted (Convex + Clerk)");
        } catch (clerkError: any) {
          console.warn("Clerk deletion failed (likely unverified email), but Convex data deleted:", clerkError);

          // Sign out manually since Clerk delete failed
          await signOut();

          alert(
            "Your game data has been deleted, but your login account still exists.\n\n" +
            "To fully delete your account:\n" +
            "1. Verify your email in Clerk settings\n" +
            "2. Or contact support\n\n" +
            "You've been signed out."
          );
        }
      } else {
        // No Clerk user, just sign out
        await signOut();
      }

    } catch (error: any) {
      console.error("Delete failed:", error);
      alert("Failed to delete account: " + (error.message || "Unknown error"));
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="grid grid-cols-1 gap-6">


        <ProfileSettings currentUsername={user?.username} />

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
                  {Math.round(useSettingsStore.getState().musicVolume * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={useSettingsStore.getState().musicVolume}
                onChange={(e) => useSettingsStore.getState().setMusicVolume(parseFloat(e.target.value))}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400 text-sm font-medium">Sound Effects Volume</span>
                <span className="text-indigo-500 dark:text-indigo-400 text-xs font-mono bg-indigo-50 dark:bg-indigo-500/10 px-2 py-1 rounded">
                  {Math.round(useSettingsStore.getState().sfxVolume * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={useSettingsStore.getState().sfxVolume}
                onChange={(e) => useSettingsStore.getState().setSfxVolume(parseFloat(e.target.value))}
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

        {/* Account Danger Zone */}
        <section className="bg-red-950/20 dark:bg-red-950/40 border-2 border-red-500/30 rounded-2xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Trash2 className="text-red-500" size={18} />
            <h2 className="text-sm font-bold uppercase tracking-widest text-red-500">Danger Zone</h2>
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>
          <button
            onClick={handleDeleteAccount}
            disabled={isDeleting}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed text-white font-bold rounded-xl uppercase tracking-widest shadow-lg transition-all flex items-center gap-2"
          >
            <Trash2 size={16} />
            {isDeleting ? 'Deleting...' : 'Delete Account'}
          </button>
        </section>

      </div>
    </div>
  );
};
