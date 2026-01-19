import React from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

interface AdminSystemPanelProps {
    systemFlags: Record<string, any>;
    localBannerMsg: string;
    onBannerChange: (msg: string) => void;
    onSetBanner: () => void;
    onToggleMaintenance: () => void;
}

export const AdminSystemPanel: React.FC<AdminSystemPanelProps> = ({
    systemFlags,
    localBannerMsg,
    onBannerChange,
    onSetBanner,
    onToggleMaintenance,
}) => {
    return (
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 space-y-6 mt-8">
            <div className="flex items-center gap-2 text-blue-400 border-b border-slate-700 pb-4">
                <RefreshCw size={20} />
                <h3 className="font-bold uppercase tracking-wider">System Control</h3>
            </div>

            <div className="space-y-4">
                {/* BANNER CONTROL */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Global Banner Message</label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white"
                            placeholder={systemFlags['global_banner'] || "No active banner"}
                            value={localBannerMsg}
                            onChange={(e) => onBannerChange(e.target.value)}
                        />
                        <button onClick={onSetBanner} className="bg-blue-600 hover:bg-blue-500 text-white px-4 rounded text-xs font-bold">SET</button>
                    </div>
                    {systemFlags['global_banner'] && (
                        <p className="text-[10px] text-green-500">Current Banner: "{systemFlags['global_banner']}"</p>
                    )}
                </div>

                {/* MAINTENANCE TOGGLE */}
                <div className="flex items-center justify-between bg-black/20 p-4 rounded-lg border border-slate-800">
                    <div>
                        <h4 className="font-bold text-red-400 flex items-center gap-2">
                            <AlertTriangle size={16} /> Maintenance Mode
                        </h4>
                        <p className="text-xs text-slate-500">Locks out non-admins.</p>
                    </div>
                    <button
                        onClick={onToggleMaintenance}
                        className={`px-4 py-2 rounded text-xs font-bold transition-colors border ${systemFlags['maintenance_mode']
                            ? 'bg-red-500 text-white border-red-400 animate-pulse'
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500'
                            }`}>
                        {systemFlags['maintenance_mode'] ? 'ACTIVE (UNLOCK APP)' : 'OFF (LOCK APP)'}
                    </button>
                </div>
            </div>
        </div>
    );
};
