import React from 'react';
import { Link } from 'react-router-dom';
import { useClerk } from "@clerk/clerk-react";
import { useGameStore } from '../store/useGameStore';
import { Database, Trash2, Download, Info, Unlock, Coins, Volume2, BookOpen } from 'lucide-react';
import { SHOP_ITEMS } from '../src/utils/GameEconomy';
import { ALL_COSMETIC_ITEMS } from '../src/utils/CosmeticsData';
import { CloudSyncControls } from '../components/CloudSyncControls';
import { useQuery, useAction } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Shield, Zap, Info as InfoIcon, Sun } from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';

const LIFETIME_PRICE_ID = 'price_1SlpqyLQXrapzCX8bubgyJ0C';

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

        {/* MEMBERSHIP CARD */}
        <section className="relative overflow-hidden bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-500/30 rounded-2xl p-6 group shadow-lg dark:shadow-none">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-50/50 dark:from-indigo-500/10 to-purple-50/50 dark:to-purple-500/10 opacity-50" />

          <div className="relative flex justify-between items-start">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-500/20 rounded-lg">
                <Shield className="text-indigo-500 dark:text-indigo-400" size={24} />
              </div>
              <div>
                <h2 className="text-lg font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Status: {user?.subscription === 'lifetime' ? 'Lifetime Archetype' : 'Novice'}</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Current Access Level</p>
              </div>
            </div>
            {user?.subscription === 'lifetime' && (
              <div className="px-3 py-1 bg-green-500/20 border border-green-500/50 rounded-full text-xs font-bold text-green-400 uppercase tracking-widest flex items-center gap-2">
                <Zap size={12} fill="currentColor" />
                Active
              </div>
            )}
          </div>

          {user?.subscription !== 'lifetime' && (
            <div className="relative mt-4 bg-slate-50 dark:bg-slate-950/50 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
              <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white">Unlock Lifetime Access</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm">
                    Get permanent access to Cloud Sync, Unlimited Journal Formatting, 3 Exclusive Avatars, and support future development.
                  </p>
                  <div className="flex gap-2">
                    <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-bold uppercase">One-time payment</span>
                    <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px] font-bold uppercase">No subscriptions</span>
                  </div>
                </div>
                <button
                  onClick={handleUpgrade}
                  className="px-8 py-4 bg-white text-indigo-950 rounded-xl font-black uppercase tracking-wider hover:bg-indigo-50 hover:scale-105 transition-all shadow-xl shadow-indigo-500/20"
                >
                  Get Access - $49
                </button>
              </div>
            </div>
          )}
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
            Version 1.2.0 - "Constellation Update"
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
              onClick={() => {
                const { inventory } = useGameStore.getState();
                // Merge both lists
                const combinedItems = [...SHOP_ITEMS, ...ALL_COSMETIC_ITEMS];
                const allItems = combinedItems.filter(i => i.type !== 'REAL_LIFE' && i.type !== 'SYSTEM');

                const currentInventory = useGameStore.getState().inventory;
                const finalInventory = [...currentInventory];

                allItems.forEach(item => {
                  if (!finalInventory.some(i => i.id === item.id)) {
                    finalInventory.push({
                      id: item.id,
                      name: item.name,
                      type: item.type as any,
                      acquiredAt: new Date().toISOString(),
                      quantity: 1,
                      imageUrl: item.imageUrl,
                      perks: (item as any).perks,
                      slots: (item as any).slots // Ensure slots are carried over
                    });
                  }
                });

                useGameStore.setState({ inventory: finalInventory });
                alert(`Unlocked ${finalInventory.length - currentInventory.length} new items! (Total: ${finalInventory.length})`);
              }}
              className="flex items-center space-x-2 px-6 py-3 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-400 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors"
            >
              <Unlock size={14} />
              <span>Unlock All Items (Dev)</span>
            </button>
            <button
              onClick={() => {
                const currentState = useGameStore.getState();
                useGameStore.setState({
                  stats: {
                    ...currentState.stats,
                    gold: currentState.stats.gold + 100000,
                  }
                });
                alert('Added 100,000 Gold!');
              }}
              className="flex items-center space-x-2 px-6 py-3 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors"
            >
              <Coins size={14} />
              <span>+100k Resources (Dev)</span>
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
