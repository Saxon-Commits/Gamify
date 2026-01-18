
import React, { useState, useEffect, useRef } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useQuery } from 'convex/react';

// Lazy load Admin to save bundle size
const AdminPage = React.lazy(() => import('./pages/Admin'));

// Helper for Admin Check
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const me = useQuery(api.users.getMe);

  // 1. Loading State (prevent flash / wait for query)
  if (me === undefined) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500 font-mono">Verifying Clearance...</div>;
  }

  // 2. Access Denied (Redirect)
  if (!me || me.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  // 3. Access Granted
  return <>{children}</>;
};
import { Volume2, VolumeX, Music } from 'lucide-react';
import { useGameStore } from './store/useGameStore';
import { BackgroundMusicPlayer } from './components/BackgroundMusicPlayer';
import { Layout } from './components/Layout';
// Dashboard removed
import { SkillTree } from './pages/SkillTree';
import { QuestLog } from './pages/QuestLog';
import { Settings } from './pages/Settings';
import { Character } from './pages/Character';
import { Shop } from './pages/Shop';

import { Journal } from './pages/Journal';
import { Guild } from './pages/Guild';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { TermsOfService } from './pages/TermsOfService';
import { Grindstone } from './pages/tools/Grindstone';

import { InvitePage } from './pages/InvitePage';
import { Shield } from 'lucide-react';


import { SignedIn, SignedOut, RedirectToSignIn, useUser } from "@clerk/clerk-react";
import { LandingPage } from './pages/LandingPage';
import { useMutation, useConvexAuth } from "convex/react";
import { api } from "./convex/_generated/api";
import { SyncManager } from './components/SyncManager';
import { usePostHog } from 'posthog-js/react';

const App: React.FC = () => {
  // Sync User to Convex
  const { user } = useUser();
  const { isAuthenticated } = useConvexAuth();
  const storeUser = useMutation(api.storeUser.storeUser);
  const posthog = usePostHog();

  useEffect(() => {
    if (user && isAuthenticated) {
      // Sync Name
      const currentName = useGameStore.getState().stats.name;
      const newName = user.fullName || user.firstName || user.username;

      // PostHog Identification
      if (posthog) {
        posthog.identify(user.id, {
          email: user.primaryEmailAddress?.emailAddress,
          name: newName,
          username: user.username
        });
      }

      if (newName && newName !== currentName) {
        useGameStore.getState().setName(newName);
      }

      // Only attempt to store if we are truly authenticated with Convex
      storeUser().catch(e => console.error("Sync failed:", e));
    } else if (!user && posthog) {
      // Reset PostHog on logout
      posthog.reset();
    }
  }, [user, isAuthenticated, storeUser, posthog]);

  // Initial Theme Sync
  useEffect(() => {
    const theme = useGameStore.getState().settings.theme;
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Daily Check (Streak Protection) - MOVED UP TO FIX HOOK ERROR
  useEffect(() => {
    useGameStore.getState().checkDailyReset();
  }, []);

  // System Flags (Maintenance Check)
  const systemFlags = useQuery(api.admin.getSystemFlags) || {};
  const isMaintenanceMode = systemFlags['maintenance_mode'] === true;

  const me = useQuery(api.users.getMe);
  const isAdmin = me?.role === 'admin';
  const isBanned = me?.role === 'banned';

  // 1. BAN LOCKOUT
  if (isBanned) {
    return (
      <div className="min-h-screen bg-red-950 flex flex-col items-center justify-center p-8 text-center space-y-6">
        <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center border border-red-500/50">
          <Shield className="text-red-500" size={48} />
        </div>
        <div>
          <h1 className="text-4xl font-black text-white uppercase tracking-wider mb-2">Account Banned</h1>
          <p className="text-red-200 max-w-md mx-auto">
            Your access to the realm has been revoked due to a violation of the high council's decrees.
          </p>
        </div>
        <div className="text-xs text-red-400 font-mono mt-8">
          ID: {me?._id}
        </div>
      </div>
    );
  }

  // 2. MAINTENANCE LOCKOUT
  if (isMaintenanceMode && !isAdmin && me !== undefined) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8 text-center space-y-6">
        <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center animate-pulse">
          <Shield className="text-amber-500" size={40} />
        </div>
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-wider mb-2">System Maintenance</h1>
          <p className="text-slate-400 max-w-md mx-auto">
            The realm is currently undergoing arcane restructuring. <br />
            Please check back shortly.
          </p>
        </div>
        <div className="text-xs text-slate-600 font-mono">
          Access is restricted to High Council (Admins) only.
        </div>
      </div>
    );
  }



  return (
    <HashRouter>
      {/* Background Music Player should persist across all pages? Or only in App?
          Design choice: Only in App to keep Landing Page clean. move inside Layout? 
          Actually, let's keep it global but maybe mute on landing. For simplicity, keep global. 
      */}
      <BackgroundMusicPlayer />
      <SyncManager />

      <Routes>
        {/* Public Landing Page */}
        <Route path="/" element={
          <>
            <SignedIn>
              <Navigate to="/app" replace />
            </SignedIn>
            <SignedOut>
              <LandingPage />
            </SignedOut>
          </>
        } />

        {/* Protected App Routes */}
        <Route path="/app" element={<Layout />}>
          <Route index element={<QuestLog />} />
          <Route path="skills" element={<SkillTree />} />
          <Route path="shop" element={<Shop />} />
          <Route path="journal" element={<Journal />} />

          <Route path="character" element={<Character />} />
          <Route path="guild" element={<Guild />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Legal Pages - accessible to all */}
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />

        {/* Full Screen Tools */}
        <Route path="/app/tools/grindstone" element={<Grindstone />} />


        {/* Invite Route - Requires Auth */}
        <Route path="/invite/:code" element={
          <>
            <SignedIn>
              <InvitePage />
            </SignedIn>
            <SignedOut>
              <RedirectToSignIn />
            </SignedOut>
          </>
        } />

        {/* Admin Route - Lazy Loaded & Protected */}
        <Route
          path="/admin"
          element={
            <React.Suspense fallback={<div className="p-10 text-center text-slate-500">Loading Command Console...</div>}>
              <SignedIn>
                <AdminRoute>
                  <AdminPage />
                </AdminRoute>
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </React.Suspense>
          }
        />

        {/* Catch all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
