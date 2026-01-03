import React from 'react';
import { Shield } from 'lucide-react';

export const PrivacyPolicy: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto pb-20 space-y-8">
            <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                    <Shield className="text-indigo-400" size={32} />
                </div>
                <div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Privacy Policy</h1>
                    <p className="text-slate-400">Last Updated: December 31, 2025</p>
                </div>
            </div>

            <div className="space-y-8 text-slate-300 leading-relaxed">
                <section className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
                    <h2 className="text-xl font-bold text-white mb-4">1. Data Storage & Account</h2>
                    <p className="mb-4">
                        To ensure your progress is never lost, PARA RPG provides cloud synchronization features.
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-slate-400">
                        <li><strong>Game Save Data:</strong> We store your game progress (quests, stats, inventory) in our secure database to allow for cross-device play and backup.</li>
                        <li><strong>Authentication:</strong> If you create an account, we store your email address and authentication credentials securely.</li>
                        <li><strong>Local Mode:</strong> You may choose to play without an account, in which case data remains local to your device, but is at risk of loss if browser data is cleared.</li>
                    </ul>
                </section>

                <section className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
                    <h2 className="text-xl font-bold text-white mb-4">2. Payments & Virtual Goods</h2>
                    <p className="mb-4">
                        The Application offers optional purchasable cosmetic items using real currency.
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-slate-400">
                        <li><strong>Payment Processing:</strong> We use third-party payment processors (e.g., Stripe) to handle financial transactions. We do not store your full credit card details on our servers.</li>
                        <li><strong>Transaction History:</strong> We retain a record of your purchase history to ensure you have access to paid content.</li>
                    </ul>
                </section>

                <section className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
                    <h2 className="text-xl font-bold text-white mb-4">3. Data Security</h2>
                    <p>
                        We implement industry-standard security measures to protect your personal information and game data. However, no method of transmission over the Internet is 100% secure.
                    </p>
                </section>

                <section className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
                    <h2 className="text-xl font-bold text-white mb-4">4. Contact Us</h2>
                    <p>
                        If you have any questions about this Privacy Policy, please contact the developer directly or via the project repository.
                    </p>
                </section>
            </div>
        </div>
    );
};
