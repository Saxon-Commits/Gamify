
import React, { useState, useEffect, useRef } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
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
import { Inventory } from './pages/Inventory';
import { Journal } from './pages/Journal';
import { Guild } from './pages/Guild';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { TermsOfService } from './pages/TermsOfService';
import { Grindstone } from './pages/tools/Grindstone';

import { InvitePage } from './pages/InvitePage';


import { SignedIn, SignedOut, RedirectToSignIn, useUser } from "@clerk/clerk-react";
import { LandingPage } from './pages/LandingPage';
import { useMutation, useConvexAuth } from "convex/react";
import { api } from "./convex/_generated/api";

const App: React.FC = () => {
  // Sync User to Convex
  const { user } = useUser();
  const { isAuthenticated } = useConvexAuth();
  const storeUser = useMutation(api.storeUser.storeUser);

  useEffect(() => {
    if (user && isAuthenticated) {
      // Only attempt to store if we are truly authenticated with Convex
      storeUser().catch(e => console.error("Sync failed:", e));
    }
  }, [user, isAuthenticated, storeUser]);

  // Initial Theme Sync
  useEffect(() => {
    const theme = useGameStore.getState().settings.theme;
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Global Auto-Save Logic
  const gameState = useGameStore(state => state);
  const saveToCloud = useMutation(api.gameState.save);
  const pendingSave = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!user || !isAuthenticated) return;

    // Skip if state is empty/default (avoid overwriting cloud with empty)
    if (Object.keys(gameState.stats).length === 0) return;

    if (pendingSave.current) clearTimeout(pendingSave.current);

    pendingSave.current = setTimeout(async () => {
      try {
        const stateToSave = JSON.parse(JSON.stringify(gameState));
        await saveToCloud({ state: stateToSave });
        // Optional: console.log("Global Auto-save success");
      } catch (error) {
        console.error("Global Auto-save failed:", error);
      }
    }, 2000); // 2 second debounce

    return () => {
      if (pendingSave.current) clearTimeout(pendingSave.current);
    };
  }, [
    user,
    isAuthenticated,
    // Watch critical state (same dependencies as before)
    gameState.stats,
    gameState.inventory,
    gameState.tasks,
    gameState.projects,
    gameState.vitality,
    gameState.skillNodes,
    // When the user changes avatar, `stats` changes (activeAvatarId), so this will trigger!
    saveToCloud
  ]);

  return (
    <HashRouter>
      {/* Background Music Player should persist across all pages? Or only in App?
          Design choice: Only in App to keep Landing Page clean. move inside Layout? 
          Actually, let's keep it global but maybe mute on landing. For simplicity, keep global. 
      */}
      <BackgroundMusicPlayer />

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
          <Route path="inventory" element={<Inventory />} />
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

        {/* Catch all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
