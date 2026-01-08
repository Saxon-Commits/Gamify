import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation } from "convex/react";
import { api } from '../convex/_generated/api';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';

export const InvitePage: React.FC = () => {
    const { code } = useParams<{ code: string }>();
    const navigate = useNavigate();
    const joinGuildByCode = useMutation(api.guilds.joinGuildByCode);

    const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        const join = async () => {
            if (!code) {
                setStatus('error');
                setErrorMessage("Invalid invite link.");
                return;
            }

            try {
                const guildId = await joinGuildByCode({ inviteCode: code });
                setStatus('success');
                // Short delay to show success message before redirect
                setTimeout(() => {
                    navigate('/app/guild');
                }, 2000);
            } catch (error: any) {
                console.error("Failed to join guild:", error);

                let msg = "Failed to join guild.";
                if (error.message.includes("already a member")) msg = "You are already a member of this guild.";
                else if (error.message.includes("expired")) msg = "This invite link has expired.";
                else if (error.message.includes("full")) msg = "The guild is full.";

                setStatus('error');
                setErrorMessage(msg);
            }
        };

        join();
    }, [code, joinGuildByCode, navigate]);

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
                {status === 'processing' && (
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
                        <h2 className="text-xl font-bold text-white">Joining Guild...</h2>
                        <p className="text-slate-400">Verifying your invite code.</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex flex-col items-center gap-4 animate-in zoom-in duration-300">
                        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-8 h-8 text-green-500" />
                        </div>
                        <h2 className="text-xl font-bold text-white">Welcome Aboard!</h2>
                        <p className="text-slate-400">You have successfully joined the guild.</p>
                        <p className="text-xs text-slate-500">Redirecting to headquarters...</p>
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex flex-col items-center gap-4 animate-in shake duration-300">
                        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
                            <AlertCircle className="w-8 h-8 text-red-500" />
                        </div>
                        <h2 className="text-xl font-bold text-white">Oops!</h2>
                        <p className="text-red-400 font-medium">{errorMessage}</p>
                        <button
                            onClick={() => navigate('/app/guild')}
                            className="mt-4 px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold transition-colors"
                        >
                            Back to Guilds
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
