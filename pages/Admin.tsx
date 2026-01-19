
import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { SHOP_ITEMS } from '../src/utils/GameEconomy';
import { ALL_COSMETIC_ITEMS } from '../src/utils/CosmeticsData';
import { Shield, Search, Coins, Ban, RefreshCw, Gem, AlertTriangle, Gift, Package } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { AdminSystemPanel } from '../components/admin/AdminSystemPanel';

const Admin = () => {
    const { user } = useUser();
    const stats = useQuery(api.admin.getStats);
    const [searchQuery, setSearchQuery] = useState('');

    const grantGold = useMutation(api.admin.grantGold);
    const grantGems = useMutation(api.admin.grantGems);
    const grantItem = useMutation(api.admin.grantItem);
    const banUser = useMutation(api.admin.banUser);
    const unbanUser = useMutation(api.admin.unbanUser);

    // Guild Inspector
    const allGuilds = useQuery(api.guilds.admin.getAll) || [];
    const disbandGuild = useMutation(api.guilds.admin.disband);

    const handleDisbandGuild = async (guildId: any, name: string) => {
        if (!confirm(`DANGER: Are you sure you want to DISBAND "${name}"?\n\nThis will DELETE all data including members, projects, and activities.\nThis cannot be undone.`)) return;
        try {
            await disbandGuild({ guildId });
            alert(`Guild "${name}" has been disbanded.`);
        } catch (err: any) {
            alert('Failed to disband: ' + err.message);
        }
    };

    // System Flags
    const systemFlags = useQuery(api.admin.getSystemFlags) || {};
    const setSystemFlag = useMutation(api.admin.setSystemFlag);
    const [localBannerMsg, setLocalBannerMsg] = useState('');

    // Debounce or just pass state directly for now
    const searchResults = useQuery(api.admin.searchUsers, { query: searchQuery }) || [];
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const userGameState = useQuery(api.admin.getUserGameState, selectedUser ? { userId: selectedUser._id } : "skip");

    const [customAmount, setCustomAmount] = useState<number>(0);
    const [selectedItemId, setSelectedItemId] = useState<string>('');

    // Combine all items for the dropdown and deduplicate by ID
    const rawItems = [...SHOP_ITEMS, ...ALL_COSMETIC_ITEMS];
    const GRANTABLE_ITEMS = Array.from(new Map(rawItems.map(item => [item.id, item])).values());

    const handleGrantGold = async (amount: number) => {
        if (!selectedUser || amount <= 0) return;
        try {
            await grantGold({ userId: selectedUser._id, amount });
            alert(`Granted ${amount} Gold to ${selectedUser.name || 'User'}`);
        } catch (err) {
            alert('Failed: ' + err);
        }
    };

    const handleGrantGems = async (amount: number) => {
        if (!selectedUser || amount <= 0) return;
        try {
            await grantGems({ userId: selectedUser._id, amount });
            alert(`Granted ${amount} Gems to ${selectedUser.name || 'User'}`);
        } catch (err) {
            alert('Failed: ' + err);
        }
    };

    const handleGrantItem = async () => {
        if (!selectedUser || !selectedItemId) return;
        const item = GRANTABLE_ITEMS.find(i => i.id === selectedItemId);
        if (!item) return;

        if (!confirm(`Grant '${item.name}' to ${selectedUser.name}?`)) return;

        try {
            await grantItem({ userId: selectedUser._id, itemId: selectedItemId });
            alert(`Granted ${item.name} to ${selectedUser.name || 'User'}`);
        } catch (err) {
            alert('Failed: ' + err);
        }
    };

    const handleBan = async () => {
        if (!selectedUser || !confirm(`Are you sure you want to BAN ${selectedUser.name}?`)) return;
        try {
            await banUser({ userId: selectedUser._id });
            alert('User Banned.');
            setSelectedUser({ ...selectedUser, role: 'banned' }); // Optimistic update
        } catch (err) {
            alert('Failed: ' + err);
        }
    };

    const handleUnban = async () => {
        if (!selectedUser || !confirm(`Are you sure you want to UNBAN ${selectedUser.name}?`)) return;
        try {
            await unbanUser({ userId: selectedUser._id });
            alert('User Unbanned.');
            setSelectedUser({ ...selectedUser, role: 'user' }); // Optimistic update
        } catch (err) {
            alert('Failed: ' + err);
        }
    };

    // System Control Handlers
    const handleSetBanner = async () => {
        await setSystemFlag({ key: 'global_banner', value: localBannerMsg });
        alert('Banner Updated');
    };

    const handleToggleMaintenance = async () => {
        const current = systemFlags['maintenance_mode'] === true;
        if (!current && !confirm("WARNING: Activating Maintenance Mode will lock out all non-admin users. Proceed?")) return;

        await setSystemFlag({ key: 'maintenance_mode', value: !current });
    };

    if (!user) return <div className="p-10 text-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 p-8 font-mono">
            <header className="flex items-center justify-between mb-8 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3 text-red-500">
                    <Shield size={32} />
                    <h1 className="text-2xl font-black uppercase tracking-widest">Admin Command</h1>
                </div>
                <div className="text-xs text-slate-500">
                    Logged in as: <span className="text-white">{user.fullName}</span>
                </div>
            </header>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="bg-slate-900 border border-slate-700 p-6 rounded-xl">
                    <h3 className="text-slate-500 text-xs uppercase tracking-wider mb-2">Total Users</h3>
                    <div className="text-4xl font-bold text-white">{stats?.totalUsers ?? '-'}</div>
                </div>
                <div className="bg-slate-900 border border-slate-700 p-6 rounded-xl">
                    <h3 className="text-slate-500 text-xs uppercase tracking-wider mb-2">Total Guilds</h3>
                    <div className="text-4xl font-bold text-emerald-400">{stats?.totalGuilds ?? '-'}</div>
                </div>
                <div className="bg-slate-900 border border-slate-700 p-6 rounded-xl">
                    <h3 className="text-slate-500 text-xs uppercase tracking-wider mb-2">System Status</h3>
                    <div className={`text-4xl font-bold ${systemFlags['maintenance_mode'] ? 'text-red-500' : 'text-green-500'}`}>
                        {systemFlags['maintenance_mode'] ? 'MAINTENANCE' : 'ONLINE'}
                    </div>
                </div>
            </div>

            {/* User Management */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2 mt-4">
                        {searchResults?.map((u: any) => (
                            <div
                                key={u._id}
                                onClick={() => setSelectedUser(u)}
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

                            <div className="space-y-4">
                                <h4 className="text-xs font-bold uppercase text-emerald-500">Economy Injection</h4>

                                {/* GOLD SECTION */}
                                <div className="space-y-2">
                                    <h5 className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1"><Coins size={10} /> Grant Gold</h5>
                                    <div className="grid grid-cols-3 gap-2">
                                        <button onClick={() => handleGrantGold(1000)} className="bg-emerald-900/30 hover:bg-emerald-900/50 border border-emerald-900 text-emerald-400 py-2 rounded text-xs font-bold transition-colors">+1k</button>
                                        <button onClick={() => handleGrantGold(10000)} className="bg-emerald-900/30 hover:bg-emerald-900/50 border border-emerald-900 text-emerald-400 py-2 rounded text-xs font-bold transition-colors">+10k</button>
                                        <button onClick={() => handleGrantGold(100000)} className="bg-emerald-900/30 hover:bg-emerald-900/50 border border-emerald-900 text-emerald-400 py-2 rounded text-xs font-bold transition-colors">+100k</button>
                                    </div>
                                </div>

                                {/* GEMS SECTION */}
                                <div className="space-y-2">
                                    <h5 className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1"><Gem size={10} /> Grant Gems</h5>
                                    <div className="grid grid-cols-3 gap-2">
                                        <button onClick={() => handleGrantGems(10)} className="bg-purple-900/30 hover:bg-purple-900/50 border border-purple-900 text-purple-400 py-2 rounded text-xs font-bold transition-colors">+10</button>
                                        <button onClick={() => handleGrantGems(100)} className="bg-purple-900/30 hover:bg-purple-900/50 border border-purple-900 text-purple-400 py-2 rounded text-xs font-bold transition-colors">+100</button>
                                        <button onClick={() => handleGrantGems(500)} className="bg-purple-900/30 hover:bg-purple-900/50 border border-purple-900 text-purple-400 py-2 rounded text-xs font-bold transition-colors">+500</button>
                                    </div>
                                </div>

                                {/* CUSTOM AMOUNT SECTION */}
                                <div className="pt-2 border-t border-slate-800 space-y-2">
                                    <h5 className="text-[10px] font-bold text-slate-500 uppercase">Custom Amount</h5>
                                    <div className="flex gap-2">
                                        <input
                                            type="number"
                                            placeholder="Amount"
                                            className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1 text-xs focus:border-red-500 outline-none"
                                            value={customAmount}
                                            onChange={(e) => setCustomAmount(Number(e.target.value))}
                                        />
                                        <button onClick={() => handleGrantGold(customAmount)} className="bg-emerald-600 hover:bg-emerald-500 text-white rounded px-3 text-xs font-bold">Gold</button>
                                        <button onClick={() => handleGrantGems(customAmount)} className="bg-purple-600 hover:bg-purple-500 text-white rounded px-3 text-xs font-bold">Gems</button>
                                    </div>
                                </div>
                            </div>

                            {/* ITEM INJECTION SECTION */}
                            <div className="space-y-2 pt-4 border-t border-slate-800">
                                <h5 className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                                    <Gift size={10} /> Grant Item (Santa Clause)
                                </h5>
                                <div className="flex gap-2">
                                    <select
                                        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                                        value={selectedItemId}
                                        onChange={(e) => setSelectedItemId(e.target.value)}
                                    >
                                        <option value="">Select an Item...</option>
                                        <optgroup label="Items">
                                            {GRANTABLE_ITEMS.filter(i => i.type === 'IN_GAME' || i.type === 'BLACK_MARKET').map(i => (
                                                <option key={i.id} value={i.id}>{i.name} ({i.rarity})</option>
                                            ))}
                                        </optgroup>
                                        <optgroup label="Avatars & Cosmetics">
                                            {GRANTABLE_ITEMS.filter(i => i.type === 'AVATAR' || i.type === 'THEME').map(i => (
                                                <option key={i.id} value={i.id}>{i.name} ({i.rarity})</option>
                                            ))}
                                        </optgroup>
                                        <optgroup label="Companions">
                                            {GRANTABLE_ITEMS.filter(i => i.type === 'COMPANION' || (i as any).type === 'ACCESSORY').map(i => (
                                                <option key={i.id} value={i.id}>{i.name} ({i.rarity})</option>
                                            ))}
                                        </optgroup>
                                    </select>
                                    <button
                                        onClick={handleGrantItem}
                                        disabled={!selectedItemId}
                                        className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 rounded text-xs font-bold whitespace-nowrap"
                                    >
                                        GRANT
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-slate-800">
                                <h4 className="text-xs font-bold uppercase text-red-500">Punitive Actions</h4>
                                {selectedUser.role === 'banned' ? (
                                    <button onClick={handleUnban} className="w-full flex items-center justify-center gap-2 bg-emerald-900/20 hover:bg-emerald-900/40 border border-emerald-900 text-emerald-500 py-3 rounded text-sm font-bold transition-colors">
                                        <Shield size={16} /> UNBAN USER
                                    </button>
                                ) : (
                                    <button onClick={handleBan} className="w-full flex items-center justify-center gap-2 bg-red-900/20 hover:bg-red-900/40 border border-red-900 text-red-500 py-3 rounded text-sm font-bold transition-colors">
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

                    {/* SYSTEM CONTROL PANEL */}
                    <AdminSystemPanel
                        systemFlags={systemFlags}
                        localBannerMsg={localBannerMsg}
                        onBannerChange={setLocalBannerMsg}
                        onSetBanner={handleSetBanner}
                        onToggleMaintenance={handleToggleMaintenance}
                    />
                </div>
            </div>


            {/* GUILD INSPECTOR */}
            <div className="mt-12">
                <h2 className="text-lg font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2 mb-6 flex items-center gap-2">
                    <Shield size={18} /> Guild Inspector
                </h2>

                <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-400">
                            <thead className="bg-slate-950 text-xs uppercase font-bold text-slate-500">
                                <tr>
                                    <th className="px-6 py-4">Guild Name & ID</th>
                                    <th className="px-6 py-4">Leader</th>
                                    <th className="px-6 py-4 text-center">Members</th>
                                    <th className="px-6 py-4 text-center">Level</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {allGuilds.map((guild: any) => (
                                    <tr key={guild._id} className="hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-white text-base">{guild.name}</div>
                                            <div className="text-[10px] font-mono opacity-50">{guild._id}</div>
                                            {guild.description && <div className="text-xs mt-1 text-slate-500 truncate max-w-xs">{guild.description}</div>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-white">{guild.leaderName}</div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="bg-slate-800 text-slate-300 px-2 py-1 rounded text-xs font-bold">{guild.memberCount}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="font-mono text-purple-400 font-bold">{guild.level}</div>
                                            <div className="text-[10px] text-slate-600">{guild.xp || 0} XP</div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleDisbandGuild(guild._id, guild.name)}
                                                className="bg-red-900/20 hover:bg-red-900/40 border border-red-900/50 text-red-500 px-3 py-1.5 rounded text-xs font-bold transition-all hover:scale-105"
                                            >
                                                DISBAND
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {allGuilds.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-slate-600 italic">No guilds found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Admin; // Default export for lazy loading logic
