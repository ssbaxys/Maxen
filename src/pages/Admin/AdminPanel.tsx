import { useState, useEffect, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { adminService } from '../../services/adminService';
import { UserData, ServerData, AdminLog, BanData } from '../../types/firebase';
import {
    Activity, Users, FileText, Server, AlertTriangle,
    Search, ShieldBan, Trash2, Plus, X, Power, Skull, Clock
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import Toast from '../../components/ui/Toast';

const AdminPanel = () => {
    const { isRoot, isLoading } = useAuthStore();
    const [activeTab, setActiveTab] = useState('monitoring');
    const [search, setSearch] = useState('');

    // Global State
    const [globalUsers, setGlobalUsers] = useState<Record<string, UserData>>({});
    const [globalServers, setGlobalServers] = useState<Record<string, ServerData>>({});
    const [globalLogs, setGlobalLogs] = useState<AdminLog[]>([]);

    // Sorting
    const [userSort, setUserSort] = useState<'newest' | 'alphabetical' | 'oldest'>('newest');
    const [logSort, setLogSort] = useState<'newest' | 'alphabetical'>('newest');

    // Modals
    const [isCreateServerOpen, setCreateServerOpen] = useState(false);

    // User Management Modal State
    const [isBanModalOpen, setBanModalOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [banDuration, setBanDuration] = useState('1h');
    const [blockedFeatures, setBlockedFeatures] = useState<string[]>([]);

    useEffect(() => {
        if (!isRoot) return;

        // Subscribe to global collections
        const unsubUsers = adminService.subscribeToAllUsers(setGlobalUsers);
        const unsubServers = adminService.subscribeToAllServers(setGlobalServers);
        const unsubLogs = adminService.subscribeToLogs(setGlobalLogs);

        return () => {
            unsubUsers();
            unsubServers();
            unsubLogs();
        };
    }, [isRoot]);

    // Computed derived data for the UI
    const usersArray = useMemo(() =>
        Object.entries(globalUsers).map(([id, data]) => ({ id, ...data })),
        [globalUsers]);

    const serversArray = useMemo(() =>
        Object.entries(globalServers).map(([id, data]) => ({ id, ...data })),
        [globalServers]);

    if (!isLoading && !isRoot) {
        return <Navigate to="/dashboard" />;
    }

    const tabs = [
        { id: 'monitoring', label: 'Monitoring', icon: Activity },
        { id: 'users', label: 'Users', icon: Users },
        { id: 'logs', label: 'Action Logs', icon: FileText },
        { id: 'servers', label: 'Servers', icon: Server },
        { id: 'trolling', label: 'Trolling', icon: AlertTriangle, color: 'text-accent' },
    ];

    const handleBanOpen = (uid: string) => {
        setSelectedUserId(uid);
        const u = globalUsers[uid];
        // Populate existing bans if any
        if (u && (u as any).banData) {
            setBlockedFeatures((u as any).banData.blockedFeatures || []);
        } else {
            setBlockedFeatures([]);
        }
        setBanModalOpen(true);
    };

    const handleApplyBan = async () => {
        if (!selectedUserId) return;

        let expiresAt: number | undefined;
        const now = Date.now();
        if (banDuration === '1h') expiresAt = now + 1000 * 60 * 60;
        if (banDuration === '24h') expiresAt = now + 1000 * 60 * 60 * 24;
        if (banDuration === '7d') expiresAt = now + 1000 * 60 * 60 * 24 * 7;
        if (banDuration === 'permanent') expiresAt = undefined;

        const ban: BanData = {
            reason: "Admin Action from Panel",
            issuedBy: "System Admin",
            issuedAt: now,
            expiresAt,
            blockedFeatures
        };

        try {
            await adminService.updateUserBan(selectedUserId, blockedFeatures.length > 0 ? ban : null);
            await adminService.createLog({
                action: blockedFeatures.length > 0 ? `Updated restrictions for user` : `Cleared restrictions for user`,
                user: "System Admin",
                target: selectedUserId,
                type: 'auth',
                timestamp: Date.now()
            });
            Toast.success("Restrictions updated.");
            setBanModalOpen(false);
        } catch (e) {
            Toast.error("Failed to update restrictions.");
        }
    };

    const handleDeleteUser = async (uid: string) => {
        if (!window.confirm("Are you ABSOLUTELY sure you want to delete this user? This cannot be undone.")) return;

        try {
            await adminService.deleteUser(uid);
            await adminService.createLog({
                action: 'Deleted User Database Record',
                user: 'System Admin',
                target: uid,
                type: 'auth',
                timestamp: Date.now()
            });
            Toast.success("User record deleted.");
        } catch (e) {
            Toast.error("Failed to delete user.");
        }
    };

    // Very basic placeholder for graph until real telemetry arrives
    const mockChartData = [
        { name: 'Mon', visits: 4000, registrations: 240 },
        { name: 'Tue', visits: 3000, registrations: 139 },
        { name: 'Wed', visits: 2000, registrations: Math.max(0, usersArray.length * 10 - 20) }, // Add some live reactivity
        { name: 'Thu', visits: 2780, registrations: usersArray.length * 5 },
        { name: 'Fri', visits: 1890, registrations: usersArray.length * 2 },
        { name: 'Sat', visits: 2390, registrations: usersArray.length },
        { name: 'Sun', visits: 3490, registrations: usersArray.length * 12 },
    ];

    return (
        <div className="flex-1 flex w-full max-w-7xl mx-auto px-4 md:px-8 py-8 h-full">
            {/* Sidebar */}
            <div className="w-64 flex-shrink-0 mr-8 hidden md:block">
                <div className="bg-surface border border-border p-4 rounded-lg sticky top-24">
                    <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-4 mb-4">Admin Dashboard</h2>
                    <nav className="space-y-1">
                        {tabs.map(tab => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => { setActiveTab(tab.id); setSearch(''); }}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium text-sm ${isActive
                                        ? 'bg-foreground text-background'
                                        : `text-muted-foreground hover:bg-surface-hover hover:text-foreground ${tab.color || ''}`
                                        }`}
                                >
                                    <Icon size={18} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </nav>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">

                {/* Mobile Nav */}
                <div className="md:hidden flex overflow-x-auto gap-2 mb-6 pb-2 no-scrollbar">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => { setActiveTab(tab.id); setSearch(''); }}
                            className={`flex items-center gap-2 px-4 py-2 rounded-md whitespace-nowrap text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-foreground text-background shadow-sm' : 'bg-surface hover:bg-surface-hover text-muted-foreground border border-transparent'}`}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Dynamic Content */}
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex-1"
                >
                    {activeTab === 'monitoring' && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-foreground mb-6">System Monitoring</h2>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <Card className="p-6">
                                    <p className="text-muted-foreground text-sm font-semibold uppercase tracking-wider mb-2">Total Users</p>
                                    <p className="text-4xl font-extrabold text-foreground">{usersArray.length}</p>
                                    <p className="text-primary text-sm mt-2 flex items-center gap-1"><Users size={14} /> LIVE</p>
                                </Card>
                                <Card className="p-6">
                                    <p className="text-muted-foreground text-sm font-semibold uppercase tracking-wider mb-2">Active Servers</p>
                                    <p className="text-4xl font-extrabold text-foreground">{serversArray.length}</p>
                                    <p className="text-secondary text-sm mt-2 flex items-center gap-1"><Server size={14} /> Global</p>
                                </Card>
                                <Card className="p-6">
                                    <p className="text-muted-foreground text-sm font-semibold uppercase tracking-wider mb-2">Action Logs</p>
                                    <p className="text-4xl font-extrabold text-foreground">{globalLogs.length}</p>
                                    <p className="text-emerald-500 text-sm mt-2 flex items-center gap-1"><Activity size={14} /> Tracking</p>
                                </Card>
                            </div>

                            <Card className="p-6 h-[400px]">
                                <h3 className="text-lg font-bold text-foreground mb-4">Traffic Overview (Simulated)</h3>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={mockChartData}>
                                        <defs>
                                            <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="colorRegs" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                        <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#121216', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                            itemStyle={{ color: '#fff' }}
                                        />
                                        <Area type="monotone" dataKey="visits" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorVisits)" />
                                        <Area type="monotone" dataKey="registrations" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRegs)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </Card>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <Card className="p-6">
                                    <p className="text-muted-foreground text-sm font-semibold uppercase tracking-wider mb-2">System Uptime</p>
                                    <p className="text-2xl font-extrabold text-foreground font-mono">47d 12h 33m</p>
                                    <p className="text-emerald-500 text-xs mt-2 font-medium">Since last maintenance</p>
                                </Card>
                                <Card className="p-6">
                                    <p className="text-muted-foreground text-sm font-semibold uppercase tracking-wider mb-2">Node Health</p>
                                    <p className="text-2xl font-extrabold text-foreground">3 / 3 Online</p>
                                    <p className="text-emerald-500 text-xs mt-2 font-medium flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> All nodes operational</p>
                                </Card>
                                <Card className="p-6">
                                    <p className="text-muted-foreground text-sm font-semibold uppercase tracking-wider mb-2">Memory Usage</p>
                                    <p className="text-2xl font-extrabold text-foreground">{(serversArray.length * 2.4).toFixed(1)} / 128 GB</p>
                                    <div className="mt-3 h-2 rounded-full bg-surface overflow-hidden border border-border">
                                        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${Math.min(100, (serversArray.length * 2.4 / 128) * 100)}%` }} />
                                    </div>
                                </Card>
                            </div>
                        </div>
                    )}

                    {activeTab === 'users' && (
                        <Card className="p-6">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                                <h2 className="text-2xl font-bold text-foreground">Global User Registry</h2>
                                <div className="flex items-center gap-3 w-full md:w-auto">
                                    <div className="relative flex-1 md:w-64">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                        <input
                                            type="text"
                                            placeholder="Search by ID, email, nick..."
                                            value={search}
                                            onChange={e => setSearch(e.target.value)}
                                            className="w-full bg-surface border border-border rounded-lg py-2 pl-9 pr-4 outline-none focus:border-primary transition-all text-sm"
                                        />
                                    </div>
                                    <select
                                        value={userSort}
                                        onChange={(e) => setUserSort(e.target.value as any)}
                                        className="bg-surface border border-border rounded-lg py-2 px-3 outline-none focus:border-primary text-sm transition-all"
                                    >
                                        <option value="newest">Newest First</option>
                                        <option value="oldest">Oldest First</option>
                                        <option value="alphabetical">Name A-Z</option>
                                    </select>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-border text-muted-foreground text-xs uppercase tracking-wider">
                                            <th className="pb-3 pl-4 font-semibold">User (Nick / UID)</th>
                                            <th className="pb-3 p-4 font-semibold">Contact</th>
                                            <th className="pb-3 p-4 font-semibold">Registration</th>
                                            <th className="pb-3 p-4 font-semibold">Security</th>
                                            <th className="pb-3 p-4 font-semibold text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {usersArray
                                            .filter(u =>
                                                u.visualNick?.toLowerCase().includes(search.toLowerCase()) ||
                                                u.id.includes(search) ||
                                                u.email.toLowerCase().includes(search.toLowerCase()) ||
                                                (u.phoneNumber && u.phoneNumber.includes(search))
                                            )
                                            .sort((a, b) => {
                                                if (userSort === 'newest') return b.createdAt - a.createdAt;
                                                if (userSort === 'oldest') return a.createdAt - b.createdAt;
                                                return (a.visualNick || a.email).localeCompare(b.visualNick || b.email);
                                            })
                                            .map(user => {
                                                const hasBan = (user as any).banData?.blockedFeatures?.length > 0;
                                                return (
                                                    <tr key={user.id} className="border-b border-border/50 hover:bg-surface transition-colors group">
                                                        <td className="p-4">
                                                            <div className="font-bold text-foreground flex items-center gap-2">
                                                                {user.visualNick || 'Unnamed User'}
                                                                {user.root && <Badge variant="danger" className="text-[10px] px-2 py-0.5">Root</Badge>}
                                                            </div>
                                                            <div className="text-xs text-muted-foreground font-mono mt-0.5">#{user.id}</div>
                                                        </td>
                                                        <td className="p-4 text-sm text-muted-foreground">
                                                            <div>{user.email}</div>
                                                            {user.phoneNumber && <div className="text-xs">{user.phoneNumber}</div>}
                                                        </td>
                                                        <td className="p-4 text-sm text-muted-foreground">
                                                            {new Date(user.createdAt).toLocaleDateString()}
                                                        </td>
                                                        <td className="p-4">
                                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold ${!hasBan ? 'bg-secondary/10 text-secondary border border-secondary/20' : 'bg-danger/10 text-danger border border-danger/20'}`}>
                                                                {!hasBan ? <div className="w-1.5 h-1.5 rounded-full bg-secondary" /> : <ShieldBan size={12} />}
                                                                {!hasBan ? 'CLEAN' : 'RESTRICTED'}
                                                            </span>
                                                        </td>
                                                        <td className="p-4 text-right">
                                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <button onClick={() => handleBanOpen(user.id)} className="p-2 bg-background hover:bg-danger/20 text-muted-foreground hover:text-danger rounded-lg transition-colors border border-border hover:border-danger/30 tooltip" title="Manage Restrictions">
                                                                    <ShieldBan size={16} />
                                                                </button>
                                                                <button onClick={() => handleDeleteUser(user.id)} className="p-2 bg-background hover:bg-danger/20 text-muted-foreground hover:text-danger rounded-lg transition-colors border border-border hover:border-danger/30" title="Delete Complete Record">
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )
                                            })}
                                    </tbody>
                                </table>
                                {usersArray.length === 0 && <div className="text-center py-8 text-muted-foreground">No users found.</div>}
                            </div>
                        </Card>
                    )}

                    {activeTab === 'servers' && (
                        <Card className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-foreground">Global Server Fleet</h2>
                                <Button onClick={() => setCreateServerOpen(true)} className="gap-2">
                                    <Plus size={16} /> Deploy New
                                </Button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-border text-muted-foreground text-xs uppercase tracking-wider">
                                            <th className="pb-3 pl-4 font-semibold">Server & Node</th>
                                            <th className="pb-3 p-4 font-semibold">Owner ID</th>
                                            <th className="pb-3 p-4 font-semibold">Specs</th>
                                            <th className="pb-3 p-4 font-semibold">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {serversArray.map(server => (
                                            <tr key={server.id} className="border-b border-border/50 hover:bg-surface transition-colors">
                                                <td className="p-4">
                                                    <div className="font-bold text-foreground">{server.name}</div>
                                                    <div className="text-xs text-muted-foreground font-mono mt-0.5">{server.node} | ID: {server.id}</div>
                                                </td>
                                                <td className="p-4 text-xs font-mono text-muted-foreground">{server.owner}</td>
                                                <td className="p-4 text-sm text-muted-foreground">
                                                    {server.specs.ram}GB RAM / {server.specs.cpu}c / {server.specs.disk}GB
                                                </td>
                                                <td className="p-4">
                                                    <Badge variant={server.status === 'running' ? 'success' : server.status === 'offline' ? 'danger' : 'secondary'} className="uppercase">
                                                        {server.status}
                                                    </Badge>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {serversArray.length === 0 && (
                                    <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-lg w-full mt-4">
                                        <Server className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                                        No global servers provisioned yet.
                                    </div>
                                )}
                            </div>
                        </Card>
                    )}

                    {activeTab === 'trolling' && (
                        <Card className="p-6 border-accent/30 border shadow-[0_0_30px_rgba(239,68,68,0.1)]">
                            <h2 className="text-2xl font-bold text-accent mb-2 flex items-center gap-2"><Skull /> Trolling Controls</h2>
                            <p className="text-muted-foreground text-sm mb-8">Execute fun or purely chaotic functions across the hosting backend. (Currently non-functional mock buttons).</p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <button onClick={() => Toast.error('Sent SIGKILL to all wings — just kidding!')} className="p-4 bg-surface border border-accent/20 rounded-lg text-left hover:bg-accent/10 transition-colors group">
                                    <h3 className="font-bold text-foreground group-hover:text-accent transition-colors flex items-center gap-2 mb-1"><Power size={18} /> Crash All Servers</h3>
                                    <p className="text-xs text-muted-foreground">Immediately kill -9 all running Pterodactyl wings.</p>
                                </button>
                                <button onClick={() => Toast.success('🎵 Never gonna give you up... (simulated)')} className="p-4 bg-surface border border-accent/20 rounded-lg text-left hover:bg-accent/10 transition-colors group">
                                    <h3 className="font-bold text-foreground group-hover:text-accent transition-colors flex items-center gap-2 mb-1"><Users size={18} /> Rickroll All Users</h3>
                                    <p className="text-xs text-muted-foreground">Force audio playback of Never Gonna Give You Up.</p>
                                </button>
                                <button onClick={() => Toast.success('Fake maintenance banner deployed!')} className="p-4 bg-surface border border-accent/20 rounded-lg text-left hover:bg-accent/10 transition-colors group">
                                    <h3 className="font-bold text-foreground group-hover:text-accent transition-colors flex items-center gap-2 mb-1"><AlertTriangle size={18} /> Fake Maintenance</h3>
                                    <p className="text-xs text-muted-foreground">Display a fake "Urgent Maintenance" banner to all users.</p>
                                </button>
                                <button onClick={() => Toast.success('All server names randomized!')} className="p-4 bg-surface border border-accent/20 rounded-lg text-left hover:bg-accent/10 transition-colors group">
                                    <h3 className="font-bold text-foreground group-hover:text-accent transition-colors flex items-center gap-2 mb-1"><Server size={18} /> Shuffle Server Names</h3>
                                    <p className="text-xs text-muted-foreground">Randomly reassign all server display names across users.</p>
                                </button>
                                <button onClick={() => Toast.success('Theme set to Comic Sans everywhere!')} className="p-4 bg-surface border border-accent/20 rounded-lg text-left hover:bg-accent/10 transition-colors group">
                                    <h3 className="font-bold text-foreground group-hover:text-accent transition-colors flex items-center gap-2 mb-1"><FileText size={18} /> Comic Sans Mode</h3>
                                    <p className="text-xs text-muted-foreground">Force Comic Sans MS as the only font across the entire panel.</p>
                                </button>
                                <button onClick={() => Toast.success('Dashboard inverted for all users!')} className="p-4 bg-surface border border-accent/20 rounded-lg text-left hover:bg-accent/10 transition-colors group">
                                    <h3 className="font-bold text-foreground group-hover:text-accent transition-colors flex items-center gap-2 mb-1"><Activity size={18} /> Invert Dashboard</h3>
                                    <p className="text-xs text-muted-foreground">Apply CSS transform: rotate(180deg) to the entire panel for everyone.</p>
                                </button>
                            </div>
                        </Card>
                    )}

                    {activeTab === 'logs' && (
                        <Card className="p-6">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                                <h2 className="text-2xl font-bold text-foreground">Global Audit Ledger</h2>
                                <div className="flex items-center gap-3 w-full md:w-auto">
                                    <div className="relative flex-1 md:w-64">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                        <input
                                            type="text"
                                            placeholder="Search ledger..."
                                            value={search}
                                            onChange={e => setSearch(e.target.value)}
                                            className="w-full bg-surface border border-border rounded-lg py-2 pl-9 pr-4 outline-none focus:border-primary transition-all text-sm"
                                        />
                                    </div>
                                    <select
                                        value={logSort}
                                        onChange={(e) => setLogSort(e.target.value as any)}
                                        className="bg-surface border border-border rounded-lg py-2 px-3 outline-none focus:border-primary text-sm transition-all"
                                    >
                                        <option value="newest">Newest First</option>
                                        <option value="alphabetical">Action A-Z</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                {globalLogs
                                    .filter(log => log.user.toLowerCase().includes(search.toLowerCase()) || log.action.toLowerCase().includes(search.toLowerCase()) || log.target?.includes(search))
                                    .sort((a, b) => {
                                        if (logSort === 'alphabetical') return a.action.localeCompare(b.action);
                                        return 0; // Default is newest via service block
                                    })
                                    .map(log => (
                                        <div key={log.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-surface border border-border rounded-lg text-sm hover:bg-surface-hover transition-colors gap-2 sm:gap-0">
                                            <div>
                                                <Badge variant="outline" className="mr-3 uppercase px-2 py-[2px] text-[10px]">{log.type}</Badge>
                                                <span className="font-bold text-foreground pr-2 border-r border-border mr-2">{log.user}</span>
                                                <span className="text-foreground">{log.action}</span>
                                                {log.target && <span className="text-muted-foreground text-xs ml-2">({log.target})</span>}
                                            </div>
                                            <div className="text-muted-foreground text-xs/none font-mono flex items-center gap-1.5 shrink-0"><Clock size={12} /> {new Date(log.timestamp).toLocaleString()}</div>
                                        </div>
                                    ))}
                                {globalLogs.length === 0 && <div className="text-center py-6 text-muted-foreground">No logs recorded globally.</div>}
                            </div>
                        </Card>
                    )}

                </motion.div>
            </div>

            {/* Ban/Restriction Modal */}
            <AnimatePresence>
                {isBanModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="bg-background w-full max-w-lg rounded-lg border border-border shadow-2xl overflow-hidden flex flex-col"
                        >
                            <div className="flex justify-between items-center p-6 border-b border-border bg-surface">
                                <h3 className="text-xl font-bold text-foreground flex items-center gap-2"><ShieldBan className="text-danger" /> Restrictions Console</h3>
                                <button onClick={() => setBanModalOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors"><X size={20} /></button>
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="bg-danger/5 border border-danger/20 p-4 rounded-lg">
                                    <p className="text-sm text-danger font-medium">Modifying privileges for User ID: <span className="font-mono">{selectedUserId}</span></p>
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Restriction Duration (From Now)</label>
                                    <select value={banDuration} onChange={(e) => setBanDuration(e.target.value)} className="w-full bg-surface border border-border rounded-lg py-3 px-4 text-foreground outline-none focus:border-danger transition-colors cursor-pointer appearance-none">
                                        <option value="1h">1 Hour (Cool off)</option>
                                        <option value="24h">24 Hours (Warning)</option>
                                        <option value="7d">7 Days (Severe Break)</option>
                                        <option value="permanent">Permanent (Exile)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Features to Revoke</label>
                                    <div className="space-y-3 bg-surface border border-border p-4 rounded-lg">
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={blockedFeatures.includes('login')}
                                                onChange={(e) => setBlockedFeatures(prev => e.target.checked ? [...prev, 'login'] : prev.filter(f => f !== 'login'))}
                                                className="w-4 h-4 rounded border-border text-danger bg-background focus:ring-danger"
                                            />
                                            <span className="text-sm font-medium text-foreground">Block Panel Login (Complete Ban)</span>
                                        </label>
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={blockedFeatures.includes('server_creation')}
                                                onChange={(e) => setBlockedFeatures(prev => e.target.checked ? [...prev, 'server_creation'] : prev.filter(f => f !== 'server_creation'))}
                                                className="w-4 h-4 rounded border-border text-danger bg-background focus:ring-danger"
                                            />
                                            <span className="text-sm text-foreground">Deny Server Deployment</span>
                                        </label>
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={blockedFeatures.includes('server_actions')}
                                                onChange={(e) => setBlockedFeatures(prev => e.target.checked ? [...prev, 'server_actions'] : prev.filter(f => f !== 'server_actions'))}
                                                className="w-4 h-4 rounded border-border text-danger bg-background focus:ring-danger"
                                            />
                                            <span className="text-sm text-foreground">Lock Server Power Actions (Stop/Start/Kill)</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="pt-2 flex gap-3">
                                    <Button variant="outline" className="flex-1" onClick={() => setBanModalOpen(false)}>Cancel</Button>
                                    <Button variant="danger" className="flex-[2] gap-2" onClick={handleApplyBan}><ShieldBan size={16} /> Enforce Limits</Button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}

                {isCreateServerOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-background w-full max-w-lg rounded-lg border border-border shadow-2xl overflow-hidden flex flex-col"
                        >
                            <div className="flex justify-between items-center p-6 border-b border-border bg-surface">
                                <h3 className="text-xl font-bold text-foreground">Deploy Global Server</h3>
                                <button onClick={() => setCreateServerOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors"><X size={20} /></button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="bg-primary/5 text-primary text-sm p-4 rounded-lg border border-primary/20 mb-2">
                                    Administrative bypass: Servers deployed here bypass billing pipelines.
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Server Display Name</label>
                                        <input type="text" placeholder="e.g. System Override Instance" className="w-full bg-surface border border-border rounded-lg py-3 px-4 outline-none focus:border-primary text-foreground text-sm" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Target Owner UID</label>
                                        <input type="text" placeholder="Paste user ID to bind ownership..." className="w-full bg-surface border border-border rounded-lg py-3 px-4 outline-none focus:border-primary text-foreground text-sm font-mono" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">RAM (GB)</label>
                                            <input type="number" step="0.1" placeholder="e.g. 2.5" className="w-full bg-surface border border-border rounded-lg py-3 px-4 outline-none focus:border-primary text-foreground text-sm" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Storage (NVMe GB)</label>
                                            <input type="number" step="1" placeholder="e.g. 20" className="w-full bg-surface border border-border rounded-lg py-3 px-4 outline-none focus:border-primary text-foreground text-sm" />
                                        </div>
                                    </div>
                                </div>
                                <div className="pt-4 flex gap-3">
                                    <Button variant="outline" className="flex-1" onClick={() => setCreateServerOpen(false)}>Cancel</Button>
                                    <Button className="flex-[2] gap-2" onClick={() => Toast.success("Server creation queued.")}><Plus size={16} /> Provision Instance</Button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminPanel;
