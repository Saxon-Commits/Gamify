
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
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { TermsOfService } from './pages/TermsOfService';
import { Grindstone } from './pages/tools/Grindstone';
import { MindWipe } from './pages/tools/MindWipe';


const App: React.FC = () => {
  return (
    <HashRouter>
      <BackgroundMusicPlayer />

      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<QuestLog />} />
          <Route path="skills" element={<SkillTree />} />
          <Route path="shop" element={<Shop />} />
          <Route path="journal" element={<Journal />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="character" element={<Character />} />
          <Route path="settings" element={<Settings />} />
          <Route path="privacy" element={<PrivacyPolicy />} />
          <Route path="terms" element={<TermsOfService />} />
        </Route>

        {/* Full Screen Tools */}
        <Route path="tools/grindstone" element={<Grindstone />} />
        <Route path="tools/mind-wipe" element={<MindWipe />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
