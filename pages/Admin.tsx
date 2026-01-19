
import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { SHOP_ITEMS } from '../src/utils/GameEconomy';
import { ALL_COSMETIC_ITEMS } from '../src/utils/CosmeticsData';
import { Shield, Search, Coins, Ban, RefreshCw, Gem, AlertTriangle, Gift, Package } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { AdminSystemPanel } from '../components/admin/AdminSystemPanel';
import { AdminEconomyPanel } from '../components/admin/AdminEconomyPanel';
import { AdminGuildInspector } from '../components/admin/AdminGuildInspector';
import { AdminUserPanel } from '../components/admin/AdminUserPanel';

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
                <AdminUserPanel
                    searchQuery={searchQuery}
                    searchResults={searchResults}
                    selectedUser={selectedUser}
                    userGameState={userGameState}
                    onSearchChange={setSearchQuery}
                    onSelectUser={setSelectedUser}
                    onBan={handleBan}
                    onUnban={handleUnban}
                />

                {/* Actions Column with Economy Panel and System Panel */}
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

                            <AdminEconomyPanel
                                selectedUser={selectedUser}
                                customAmount={customAmount}
                                selectedItemId={selectedItemId}
                                grantableItems={GRANTABLE_ITEMS}
                                onCustomAmountChange={setCustomAmount}
                                onSelectedItemChange={setSelectedItemId}
                                onGrantGold={handleGrantGold}
                                onGrantGems={handleGrantGems}
                                onGrantItem={handleGrantItem}
                            />
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
            <AdminGuildInspector
                guilds={allGuilds}
                onDisbandGuild={handleDisbandGuild}
            />
        </div>
    );
};

export default Admin; // Default export for lazy loading logic
