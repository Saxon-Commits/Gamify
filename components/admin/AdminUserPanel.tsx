import React from 'react';
import { Shield, Search, Ban } from 'lucide-react';

interface AdminUserPanelProps {
    searchQuery: string;
    searchResults: any[];
    selectedUser: any;
    userGameState: any;
    onSearchChange: (query: string) => void;
    onSelectUser: (user: any) => void;
    onBan: () => void;
    onUnban: () => void;
}

export const AdminUserPanel: React.FC<AdminUserPanelProps> = ({
    searchQuery,
    searchResults,
    selectedUser,
    userGameState,
    onSearchChange,
    onSelectUser,
    onBan,
    onUnban,
}) => {
    return (
        <>
            {/* Search Column */}
            <div className="space-y-4">
                <h2 className="text-lg font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2">User Database</h2>
                <div className="relative">
                    <Search className="absolute left-3 top-3 text-slate-500" size={16} />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-red-500 transition-colors"
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>

                <div className="space-y-2 mt-4">
                    {searchResults?.map((u: any) => (
                        <div
                            key={u._id}
                            onClick={() => onSelectUser(u)}
                            className={`p-4 rounded-lg cursor-pointer border transition-all ${selectedUser?._id === u._id
                                ? 'bg-red-900/20 border-red-500/50'
                                : 'bg-slate-900 border-slate-800 hover:border-slate-600'
                                }`}
                        >
                            <div className="flex justify-between items-center">
                                <div>
                                    <div className="font-bold text-white">{u.name || 'Unnamed'}</div>
                                    <div className="text-xs text-slate-500">{u.email}</div>
                                </div>
                                <div className={`text-[10px] px-2 py-0.5 rounded ${u.role === 'admin' ? 'bg-red-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
                                    {u.role || 'USER'}
                                </div>
                            </div>
                        </div>
                    ))}
                    {searchResults?.length === 0 && searchQuery && (
                        <div className="text-center text-slate-500 py-8 italic">No subjects found.</div>
                    )}
                </div>
            </div>

            {/* Actions Column */}
            <div className="space-y-4">
                <h2 className="text-lg font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2">Action Console</h2>

                {selectedUser ? (
                    <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 space-y-6">
                        <div className="flex items-center gap-4 border-b border-slate-700 pb-6">
                            <img src={selectedUser.pictureUrl} alt="avi" className="w-16 h-16 rounded-full border-2 border-slate-600" />
                            <div>
                                <h3 className="text-xl font-bold">{selectedUser.name}</h3>
                                <p className="text-xs font-mono text-slate-500">ID: {selectedUser._id}</p>
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-slate-800">
                            <h4 className="text-xs font-bold uppercase text-red-500">Punitive Actions</h4>
                            {selectedUser.role === 'banned' ? (
                                <button onClick={onUnban} className="w-full flex items-center justify-center gap-2 bg-emerald-900/20 hover:bg-emerald-900/40 border border-emerald-900 text-emerald-500 py-3 rounded text-sm font-bold transition-colors">
                                    <Shield size={16} /> UNBAN USER
                                </button>
                            ) : (
                                <button onClick={onBan} className="w-full flex items-center justify-center gap-2 bg-red-900/20 hover:bg-red-900/40 border border-red-900 text-red-500 py-3 rounded text-sm font-bold transition-colors">
                                    <Ban size={16} /> BAN USER
                                </button>
                            )}
                        </div>

                        {/* INSPECTOR SECTION */}
                        {userGameState && (
                            <div className="space-y-4 pt-4 border-t border-slate-800">
                                <h4 className="text-xs font-bold uppercase text-blue-500 flex items-center gap-2">
                                    <Search size={12} /> Live Inspector
                                </h4>

                                <div className="grid grid-cols-3 gap-2 text-center">
                                    <div className="bg-slate-950 p-2 rounded border border-slate-800">
                                        <div className="text-[10px] text-slate-500 uppercase">XP</div>
                                        <div className="text-sm font-black text-purple-400">{userGameState.stats?.xp || 0}</div>
                                    </div>
                                    <div className="bg-slate-950 p-2 rounded border border-slate-800">
                                        <div className="text-[10px] text-slate-500 uppercase">Gold</div>
                                        <div className="text-sm font-black text-amber-400">{userGameState.stats?.gold || 0}</div>
                                    </div>
                                    <div className="bg-slate-950 p-2 rounded border border-slate-800">
                                        <div className="text-[10px] text-slate-500 uppercase">Gems</div>
                                        <div className="text-sm font-black text-cyan-400">{userGameState.stats?.gems || 0}</div>
                                    </div>
                                </div>

                                <div>
                                    <div className="text-[10px] font-bold text-slate-500 uppercase mb-2">Inventory ({userGameState.inventory?.length || 0})</div>
                                    <div className="max-h-40 overflow-y-auto space-y-1 bg-slate-950 p-2 rounded border border-slate-800">
                                        {userGameState.inventory?.map((i: any, idx: number) => (
                                            <div key={idx} className="flex items-center justify-between text-xs p-1 hover:bg-slate-900 rounded">
                                                <span className="text-slate-300">{i.name}</span>
                                                <span className="text-slate-600 text-[10px] uppercase">{i.rarity || 'Common'}</span>
                                            </div>
                                        ))}
                                        {(!userGameState.inventory || userGameState.inventory.length === 0) && (
                                            <div className="text-center text-slate-600 italic text-xs py-2">Empty Inventory</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="h-64 flex flex-col items-center justify-center text-slate-600 border-2 border-dashed border-slate-800 rounded-xl">
                        <Shield size={48} className="mb-4 opacity-20" />
                        <p>Select a subject from database</p>
                    </div>
                )}
            </div>
        </>
    );
};
