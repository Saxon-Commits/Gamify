import React from 'react';
import { Scroll } from 'lucide-react';

export const TermsOfService: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto pb-20 space-y-8">
            <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
                    <Scroll className="text-amber-400" size={32} />
                </div>
                <div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Terms of Service</h1>
                    <p className="text-slate-400">Last Updated: December 31, 2025</p>
                </div>
            </div>

            <div className="space-y-8 text-slate-300 leading-relaxed">
                <section className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
                    <h2 className="text-xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
                    <p>
                        By accessing or using Questify ("the Application"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Application.
                    </p>
                </section>

                <section className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
                    <h2 className="text-xl font-bold text-white mb-4">2. Virtual Items & Real Money Purchases</h2>
                    <div className="p-4 bg-amber-950/30 border border-amber-900/50 rounded-xl mb-4">
                        <p className="text-amber-200 font-bold text-sm uppercase tracking-wide mb-2">Refund Policy: All Sales Final</p>
                        <p className="text-amber-100/80 text-sm">
                            By purchasing virtual items, currency, or cosmetics with real money, you acknowledge that you are purchasing a limited, non-transferable, revocable license.
                        </p>
                    </div>
                    <ul className="list-disc pl-6 space-y-2 text-slate-400">
                        <li><strong>License, Not Ownership:</strong> You do not own the virtual items. You purchase a license to use them within the Application.</li>
                        <li><strong>No Monetary Value:</strong> Virtual items cannot be redeemed for real money, goods, or services from us or any other party.</li>
                        <li><strong>Non-Refundable:</strong> All purchases are final. We do not offer refunds for virtual items except as required by applicable law.</li>
                        <li><strong>Availability:</strong> We reserve the right to modify, remove, or change the price of virtual items at any time without notice.</li>
                    </ul>
                </section>

                <section className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
                    <h2 className="text-xl font-bold text-white mb-4">3. User Conduct</h2>
                    <p className="mb-4">
                        The Application relies on an "Honor System" for task verification. You agree to use the Application for its intended purpose of personal productivity and gamification.
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-slate-400">
                        <li><strong>Cheating & Exploits:</strong> You agree not to exploit vulnerabilities in the cloud save system or game logic to unfairly gain advantage or manipulate the economy.</li>
                        <li><strong>Account Security:</strong> You are responsible for maintaining the confidentiality of your account credentials.</li>
                    </ul>
                </section>

                <section className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
                    <h2 className="text-xl font-bold text-white mb-4">4. Limitation of Liability</h2>
                    <p className="mb-4">
                        The Application is provided "AS IS" and "AS AVAILABLE" without warranties of any kind.
                    </p>
                    <p className="text-slate-400">
                        We are not responsible for any data loss resulting from server downtime, synchronization errors, or database failures. While we strive to keep your data safe, you should maintain local backups of important information.
                    </p>
                </section>
            </div>
        </div>
    );
};
