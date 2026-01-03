import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SignInButton, SignUpButton, useUser } from '@clerk/clerk-react';
import { Shield, Zap, Trophy, Layout, Users, Star, ArrowRight, Check } from 'lucide-react';

export const LandingPage: React.FC = () => {
    const { isSignedIn } = useUser();
    const navigate = useNavigate();

    // Redirect if already signed in is handled by App.tsx routing, 
    // but as a fallback/UX choice we can also show a "Go to App" button if they land here.

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30">

            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center transform rotate-3">
                            <Trophy size={18} className="text-white" />
                        </div>
                        <span className="font-bold text-xl tracking-tight">ParaXP</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <SignInButton mode="modal">
                            <button className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
                                Sign In
                            </button>
                        </SignInButton>
                        <SignUpButton mode="modal">
                            <button className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-full transition-all hover:shadow-[0_0_20px_-5px_rgba(79,70,229,0.5)]">
                                Get Started
                            </button>
                        </SignUpButton>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                {/* Background Gradients */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] -z-10" />
                <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-purple-600/10 rounded-full blur-[100px] -z-10" />

                <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-6 animate-fade-in-up">
                        <Star size={12} />
                        <span>Productivity Evolved</span>
                    </div>

                    <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-8 leading-tight bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">
                        Turn Your Life <br />
                        Into a <span className="text-indigo-500">RPG Admin Adventure</span>
                    </h1>

                    <p className="text-lg lg:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                        Stop managing tasks and start completing quests. Track your habits, build your skill tree, and level up in real life.
                        The only productivity tool that actually makes work fun.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <SignUpButton mode="modal">
                            <button className="w-full sm:w-auto px-8 py-4 bg-white text-slate-950 font-bold rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center gap-2">
                                <Zap size={20} />
                                Start Your Journey Free
                            </button>
                        </SignUpButton>
                        <Link to="/app" className="w-full sm:w-auto px-8 py-4 bg-slate-800 text-white font-semibold rounded-xl hover:bg-slate-700 border border-slate-700 transition-colors flex items-center justify-center gap-2">
                            Try Demo Mode
                        </Link>
                    </div>

                    {/* Hero Image / Placeholder */}
                    <div className="mt-20 relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 aspect-video max-w-5xl mx-auto group">
                        <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
                            <span className="text-slate-600 font-mono text-sm">[ APP SCREENSHOT PLACEHOLDER ]</span>
                            {/* TODO: Replace with actual app screenshot */}
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-24 bg-slate-950 relative">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">Complete Quests. Earn Loot.</h2>
                        <p className="text-slate-400 max-w-xl mx-auto">
                            We've taken the best mechanics from your favorite RPGs and applied them to your daily workflow.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Layout className="text-blue-400" />}
                            title="Quest Log"
                            desc="Organize tasks into projects and pillars. Vitality, Work, and Soul quests align your day."
                        />
                        <FeatureCard
                            icon={<Users className="text-green-400" />}
                            title="Skill Trees"
                            desc="Invest your XP into real skills. Visualize your growth from Novice to Master."
                        />
                        <FeatureCard
                            icon={<Shield className="text-purple-400" />}
                            title="Epic Rewards"
                            desc="Earn gold for completing tasks. Spend it in the shop on real-world rewards or in-game skins."
                        />
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section className="py-24 border-t border-white/5">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">Simple, Transparent Pricing</h2>
                        <p className="text-slate-400">Start for free, upgrade for cloud sync and unlimited power.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {/* Free Tier */}
                        <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800">
                            <h3 className="text-xl font-bold mb-2">Novice</h3>
                            <div className="text-4xl font-bold mb-6">$0</div>
                            <ul className="space-y-4 mb-8 text-slate-400 text-sm">
                                <li className="flex items-center gap-3"><Check size={16} className="text-green-500" /> Local Storage Only</li>
                                <li className="flex items-center gap-3"><Check size={16} className="text-green-500" /> Minimal Skill Tree</li>
                                <li className="flex items-center gap-3"><Check size={16} className="text-green-500" /> Basic Quests</li>
                            </ul>
                            <Link to="/app" className="block w-full py-3 text-center bg-slate-800 hover:bg-slate-700 rounded-xl font-semibold transition-colors">
                                Play Demo
                            </Link>
                        </div>

                        {/* Pro Tier */}
                        <div className="p-8 rounded-3xl bg-indigo-600/10 border border-indigo-500/50 relative">
                            <div className="absolute top-0 right-0 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-2xl">
                                MOST POPULAR
                            </div>
                            <h3 className="text-xl font-bold mb-2 text-white">Guild Master</h3>
                            <div className="text-4xl font-bold mb-6 text-white">$9<span className="text-lg text-indigo-200 font-normal">/mo</span></div>
                            <ul className="space-y-4 mb-8 text-indigo-100 text-sm">
                                <li className="flex items-center gap-3"><Check size={16} className="text-indigo-300" /> Cloud Sync (Cross-Device)</li>
                                <li className="flex items-center gap-3"><Check size={16} className="text-indigo-300" /> Unlimited Journal History</li>
                                <li className="flex items-center gap-3"><Check size={16} className="text-indigo-300" /> Advanced Analytics</li>
                                <li className="flex items-center gap-3"><Check size={16} className="text-indigo-300" /> Priority Support</li>
                            </ul>
                            <SignUpButton mode="modal">
                                <button className="block w-full py-3 text-center bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold transition-colors shadow-lg shadow-indigo-500/25">
                                    Get Pro
                                </button>
                            </SignUpButton>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-white/5 bg-slate-950">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2 opacity-50">
                        <Trophy size={16} />
                        <span className="font-bold text-sm">ParaXP © 2024</span>
                    </div>

                    <div className="flex gap-6 text-sm text-slate-500">
                        <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                        <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
                        <a href="mailto:support@gamify.app" className="hover:text-white transition-colors">Contact</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

const FeatureCard: React.FC<{ icon: React.ReactNode, title: string, desc: string }> = ({ icon, title, desc }) => (
    <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-colors">
        <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center mb-4">
            {icon}
        </div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
    </div>
);
