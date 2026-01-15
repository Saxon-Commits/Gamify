import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Sword, Network, User, Users, Settings, Coins, Zap, Sparkles, ShoppingBag, Book, Diamond, Menu, X } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { motion, AnimatePresence } from 'framer-motion';

interface NavItemProps {
  to: string;
  icon: React.ElementType;
  label: string;
  active: boolean;
  variant?: 'default' | 'fantasy';
}

const NavItem: React.FC<NavItemProps> = ({ to, icon: Icon, label, active, variant = 'default' }) => {
  // Fantasy Variant (Quests)
  if (variant === 'fantasy') {
    return (
      <Link to={to} className="relative group select-none flex items-center justify-center w-[110px] h-[36px]">
        {/* Ornate Background / Border Container */}
        <div
          className={`
            absolute inset-0 transition-all duration-500 ease-out
            ${active
              ? 'bg-gradient-to-b from-amber-300 via-amber-600 to-amber-800 shadow-[0_0_20px_rgba(245,158,11,0.6)]'
              : 'bg-gradient-to-b from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 opacity-50 group-hover:opacity-100 group-hover:from-amber-200 group-hover:to-amber-400 dark:group-hover:from-amber-700 dark:group-hover:to-amber-900 group-hover:shadow-[0_0_15px_rgba(245,158,11,0.3)]'
            }
          `}
          style={{
            clipPath: 'polygon(0% 50%, 8px 30%, 20px 0%, calc(100% - 20px) 0%, calc(100% - 8px) 30%, 100% 50%, calc(100% - 8px) 70%, calc(100% - 20px) 100%, 20px 100%, 8px 70%)'
          }}
        />

        {/* Inner Content Container - matching py-2 with regular buttons */}
        <div
          className={`
            relative z-10 flex items-center justify-center space-x-2 px-4 py-2
            transition-all duration-500 ease-out
            ${active ? 'bg-slate-900' : 'bg-slate-100 dark:bg-slate-950'}
          `}
          style={{
            clipPath: 'polygon(0% 50%, 8px 30%, 20px 0%, calc(100% - 20px) 0%, calc(100% - 8px) 30%, 100% 50%, calc(100% - 8px) 70%, calc(100% - 20px) 100%, 20px 100%, 8px 70%)'
          }}
        >
          <Icon size={16} className={`transition-colors duration-300 ${active ? 'text-amber-400' : 'text-slate-500 dark:text-slate-500 group-hover:text-amber-600 dark:group-hover:text-amber-200'}`} />
          <span className={`font-serif italic font-bold text-xs tracking-widest transition-colors duration-300 ${active ? 'text-amber-100' : 'text-slate-600 dark:text-slate-400 group-hover:text-amber-700 dark:group-hover:text-amber-100'}`}>
            {label}
          </span>
        </div>

        {/* Shine Effect - Wrapper clips, inner element animates */}
        {active && (
          <div
            className="absolute inset-0 overflow-hidden pointer-events-none"
            style={{ clipPath: 'polygon(0% 50%, 8px 30%, 20px 0%, calc(100% - 20px) 0%, calc(100% - 8px) 30%, 100% 50%, calc(100% - 8px) 70%, calc(100% - 20px) 100%, 20px 100%, 8px 70%)' }}
          >
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear', repeatDelay: 3 }}
              className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-amber-200/30 to-transparent"
            />
          </div>
        )}
      </Link>
    );
  }

  // Default Variant (Standard Pill)
  return (
    <Link
      to={to}
      className={`relative flex items-center justify-center w-[110px] h-[36px] rounded-full transition-colors duration-500 ease-out ${active ? 'text-amber-100' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800'}`}
    >
      {/* Background pill - always present but opacity controlled */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-amber-700 to-amber-600 rounded-full shadow-lg shadow-amber-900/40"
        initial={false}
        animate={{
          opacity: active ? 1 : 0,
          scale: active ? 1 : 0.95
        }}
        transition={{
          opacity: { duration: 0.3, ease: "easeOut" },
          scale: { duration: 0.3, ease: "easeOut" }
        }}
      />
      {/* Content - always in same position */}
      <div className="relative z-10 flex items-center justify-center gap-2">
        <Icon size={16} className={`transition-colors duration-300 ${active ? 'text-amber-200' : ''}`} />
        <span className="font-bold text-xs tracking-wide">{label}</span>
      </div>
    </Link>
  );
};

const ResourceItem: React.FC<{ icon?: React.ElementType; imageUrl?: string; value: number; label: string; description: string; color: string; imageClassName?: string }> = ({ icon: Icon, imageUrl, value, label, description, color, imageClassName }) => (
  <div className="group relative flex items-center gap-2 cursor-help hover:bg-slate-100 dark:hover:bg-slate-800/50 p-1.5 rounded-lg transition-colors">
    {imageUrl ? (
      <img src={imageUrl} alt={label} className={`${imageClassName || "w-10 h-10"} object-contain`} />
    ) : (
      Icon && <Icon size={14} className={color} />
    )}
    <div className="flex flex-col leading-none">
      <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 mb-0.5">{label}</span>
      <span className="text-sm font-bold text-slate-700 dark:text-slate-200 font-mono">{value}</span>
    </div>

    <div className="absolute top-full right-0 mt-3 w-32 p-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
      <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-0.5">{label}</div>
      <div className="text-[10px] text-slate-500 leading-tight">{description}</div>
    </div>
  </div>
);

import { HonorPledgeModal } from './HonorPledgeModal';
import { TutorialOverlay } from './TutorialOverlay';
import { RewardToastContainer } from './ui/RewardToastContainer';

import { StarterSelectionModal } from './StarterSelectionModal';

const MobileHamburgerNav = ({ NavLinks, stats }: { NavLinks: any[], stats: any }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const location = useLocation();

  return (
    <div className="md:hidden sticky top-0 z-50">
      {/* Mobile Header Bar */}
      <div className="h-14 bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 px-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Sword size={18} className="text-white" />
          </div>
          <span className="font-bold text-sm text-slate-800 dark:text-slate-100">{stats.name}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Level Indicator Mobile */}
          <div className="flex flex-col items-end mr-2">
            <span className="text-xs font-black text-slate-800 dark:text-white leading-none">Lvl {stats.level}</span>
          </div>
          <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xl"
          >
            <nav className="flex flex-col p-4 space-y-2">
              {/* Mobile Resources */}
              <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl mb-4">
                <ResourceItem imageUrl="/images/currency/gold_coin.png" value={stats.gold} label="Gold" description="" color="text-amber-500" />
                <div className="w-px h-6 bg-slate-200 dark:bg-slate-700" />
                <ResourceItem imageUrl="/images/currency/skill_point.png" value={stats.skillPoints} label="Shards" description="" color="text-blue-500" imageClassName="w-8 h-8" />
                <div className="w-px h-6 bg-slate-200 dark:bg-slate-700" />
                <ResourceItem imageUrl="/images/currency/gem icon.png" value={stats.gems} label="Gems" description="" color="text-cyan-400" imageClassName="w-10 h-10" />
              </div>

              {NavLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center space-x-4 p-3 rounded-xl transition-all ${location.pathname === link.to ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                >
                  <link.icon size={20} />
                  <span>{link.label}</span>
                </Link>
              ))}
              {/* Mobile Settings */}
              <Link
                to="/app/settings"
                onClick={() => setIsOpen(false)}
                className="flex items-center space-x-4 p-3 rounded-xl text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all border-t border-slate-100 dark:border-slate-800 mt-2"
              >
                <Settings size={20} />
                <span>Settings</span>
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const Layout: React.FC = () => {
  const { stats } = useGameStore();
  const location = useLocation();

  // Check if user needs to select a starter avatar
  const needsStarter = !stats.activeAvatarId || stats.activeAvatarId === 'base';

  const NavLinks = [
    { to: "/app", icon: Sword, label: "Quests", variant: 'fantasy' as const },
    { to: "/app/character", icon: User, label: "Character" },
    { to: "/app/skills", icon: Network, label: "Skills" },
    { to: "/app/shop", icon: ShoppingBag, label: "Shop" },
    { to: "/app/guild", icon: Users, label: "Guild" },
    { to: "/app/journal", icon: Book, label: "Journal" },
  ];

  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <HonorPledgeModal />
      <TutorialOverlay />
      <RewardToastContainer />
      {needsStarter && <StarterSelectionModal onComplete={() => { }} />}

      {needsStarter && <StarterSelectionModal onComplete={() => { }} />}
      <MobileHamburgerNav NavLinks={NavLinks} stats={stats} />

      {/* Top Navigation Bar - Desktop Only (Hidden on Mobile) */}
      <header className="hidden md:flex h-16 bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 px-6 items-center justify-between sticky top-0 z-50 transition-colors duration-300">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Sword size={18} className="text-white" />
          </div>
          <h1 className="text-lg font-black bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent tracking-tighter hidden sm:block">
            XP Focus
          </h1>
        </div>

        <nav className="flex items-center gap-1.5 bg-slate-100/50 dark:bg-slate-950/50 px-2 py-1.5 rounded-full border border-slate-200/50 dark:border-slate-800/50 transition-colors duration-300 overflow-x-auto max-w-full no-scrollbar">
          {NavLinks.map(link => (
            <NavItem
              key={link.to}
              to={link.to}
              icon={link.icon}
              label={link.label}
              active={location.pathname === link.to}
              // @ts-ignore
              variant={link.variant}
            />
          ))}
        </nav>

        <div className="flex items-center space-x-4 hidden md:flex">
          <div className="flex flex-col items-end mr-4 gap-1.5">
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-black text-slate-800 dark:text-white leading-none tracking-tight">Lvl {stats.level}</span>
              <span className="text-[10px] text-slate-500 font-mono">{stats.xp}/{stats.xpToNext} XP</span>
            </div>
            <div className="w-32 h-2 bg-slate-200 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700/50 rounded-full overflow-hidden p-[1px]">
              <div
                className="h-full bg-gradient-to-r from-indigo-600 to-purple-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)] transition-all duration-500 ease-out"
                style={{ width: `${Math.min(100, (stats.xp / stats.xpToNext) * 100)}%` }}
              />
            </div>
          </div>

          <div className="flex items-center">
            <ResourceItem imageUrl="/images/currency/gold_coin.png" value={stats.gold} label="Gold" description="Currency for items and gear." color="text-amber-500 dark:text-amber-400" />
            <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-2" />
            <ResourceItem imageUrl="/images/currency/skill_point.png" value={stats.skillPoints} label="Realm Shards" description="Unlock standard skill nodes." color="text-blue-500 dark:text-blue-400" imageClassName="w-10 h-10" />
            <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-2" />
            <ResourceItem imageUrl="/images/currency/gem icon.png" value={stats.gems} label="Gems" description="Premium Currency." color="text-cyan-400" imageClassName="w-12 h-12" />
          </div>

          {/* Settings Icon (Moved from main nav) */}
          <Link to="/app/settings" className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <Settings size={20} />
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-950 p-6 relative transition-colors duration-300">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none opacity-50 dark:opacity-100" />
        <div className="relative z-10 w-full h-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
