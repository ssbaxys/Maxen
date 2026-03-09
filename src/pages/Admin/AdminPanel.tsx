import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import {
    Activity, Users, FileText, Server, AlertTriangle,
    Search, ShieldBan, Trash2, Plus, X, Power, Skull
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

const mockChartData = [
    { name: 'Mon', visits: 4000, registrations: 240 },
    { name: 'Tue', visits: 3000, registrations: 139 },
    { name: 'Wed', visits: 2000, registrations: 980 },
    { name: 'Thu', visits: 2780, registrations: 390 },
    { name: 'Fri', visits: 1890, registrations: 480 },
    { name: 'Sat', visits: 2390, registrations: 380 },
    { name: 'Sun', visits: 3490, registrations: 430 },
];

const mockUsers = [
    { id: '1a2b3c', email: 'pro@gamer.com', nick: 'ProServerOwner', root: false, status: 'active' },
    { id: '4d5e6f', email: 'noob@play.net', nick: 'Noobie', root: false, status: 'banned' },
    { id: '7g8h9i', email: 'admin@maxen.host', nick: 'MaxenAdmin', root: true, status: 'active' },
];

const mockLogs = [
    { id: 'L1', user: 'ProServerOwner', action: 'Stopped server 3faj5n1k9', time: '10 mins ago' },
    { id: 'L2', user: 'Noobie', action: 'Failed login attempt', time: '1 hour ago' },
    { id: 'L3', user: 'System', action: 'Automated Backup for pl1.hoxen.one', time: '2 hours ago' },
];

const AdminPanel = () => {
    const { isRoot, isLoading } = useAuthStore();
    const [activeTab, setActiveTab] = useState('monitoring');
    const [search, setSearch] = useState('');
    const [logSort, setLogSort] = useState<'newest' | 'alphabetical'>('newest');

    // Modals
    const [isCreateServerOpen, setCreateServerOpen] = useState(false);
    const [isBanModalOpen, setBanModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any>(null);

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

    const handleBanClick = (user: any) => {
        setSelectedUser(user);
        setBanModalOpen(true);
    };

    return (
        <div className="flex-1 flex w-full max-w-7xl mx-auto px-4 md:px-8 py-8 h-full">
            {/* Sidebar */}
            <div className="w-64 flex-shrink-0 mr-8 hidden md:block">
                <div className="glass-panel p-4 rounded-3xl sticky top-24">
                    <h2 className="text-xs font-bold text-textMuted uppercase tracking-widest px-4 mb-4">Admin Dashboard</h2>
                    <nav className="space-y-1">
                        {tabs.map(tab => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${isActive
                                        ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                        : `text-textMuted hover:bg-white/5 hover:text-white ${tab.color || ''}`
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
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-primary text-white' : 'glass-panel text-textMuted'
                                }`}
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
                            <h2 className="text-2xl font-bold text-white mb-6">System Monitoring</h2>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <div className="glass-panel p-6 rounded-3xl">
                                    <p className="text-textMuted text-sm font-semibold uppercase tracking-wider mb-2">Total Visits (7d)</p>
                                    <p className="text-4xl font-extrabold text-white">19,630</p>
                                    <p className="text-secondary text-sm mt-2 flex items-center gap-1"><Activity size={14} /> +12.5%</p>
                                </div>
                                <div className="glass-panel p-6 rounded-3xl">
                                    <p className="text-textMuted text-sm font-semibold uppercase tracking-wider mb-2">New Registrations</p>
                                    <p className="text-4xl font-extrabold text-white">2,739</p>
                                    <p className="text-secondary text-sm mt-2 flex items-center gap-1"><Users size={14} /> +8.1%</p>
                                </div>
                                <div className="glass-panel p-6 rounded-3xl">
                                    <p className="text-textMuted text-sm font-semibold uppercase tracking-wider mb-2">Active Nodes</p>
                                    <p className="text-4xl font-extrabold text-white">24 / 24</p>
                                    <p className="text-secondary text-sm mt-2 flex items-center gap-1">All Systems Normal</p>
                                </div>
                            </div>

                            <div className="glass-panel p-6 rounded-3xl h-[400px]">
                                <h3 className="text-lg font-bold text-white mb-4">Traffic Overview</h3>
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
                            </div>
                        </div>
                    )}

                    {activeTab === 'users' && (
                        <div className="glass-panel rounded-3xl p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-white">User Management</h2>
                                <div className="relative w-72">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted w-5 h-5" />
                                    <input
                                        type="text"
                                        placeholder="Search by ID, email, nick..."
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                        className="w-full bg-surface border border-white/10 rounded-xl py-2 pl-10 pr-4 outline-none focus:border-primary transition-all text-sm"
                                    />
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-white/10 text-textMuted text-xs uppercase tracking-wider">
                                            <th className="pb-3 pl-4 font-semibold">User (Nick / ID)</th>
                                            <th className="pb-3 p-4 font-semibold">Email</th>
                                            <th className="pb-3 p-4 font-semibold">Pass (Hash)</th>
                                            <th className="pb-3 p-4 font-semibold">Status</th>
                                            <th className="pb-3 p-4 font-semibold text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {mockUsers.filter(u => u.nick.toLowerCase().includes(search.toLowerCase()) || u.id.includes(search)).map(user => (
                                            <tr key={user.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                                                <td className="p-4">
                                                    <div className="font-bold text-white flex items-center gap-2">
                                                        {user.nick}
                                                        {user.root && <span className="bg-primary/20 text-primary text-[10px] px-2 py-0.5 rounded-full uppercase tracking-widest border border-primary/30">Root</span>}
                                                    </div>
                                                    <div className="text-xs text-textMuted font-mono mt-0.5">#{user.id}</div>
                                                </td>
                                                <td className="p-4 text-sm text-textMuted">{user.email}</td>
                                                <td className="p-4 text-xs font-mono text-textMuted opacity-50">••••••••••</td>
                                                <td className="p-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold ${user.status === 'active' ? 'bg-secondary/10 text-secondary border border-secondary/20' : 'bg-danger/10 text-danger border border-danger/20'}`}>
                                                        {user.status === 'active' ? <div className="w-1.5 h-1.5 rounded-full bg-secondary" /> : <ShieldBan size={12} />}
                                                        {user.status.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button onClick={() => handleBanClick(user)} className="p-2 bg-surface hover:bg-danger/20 text-textMuted hover:text-danger rounded-lg transition-colors border border-white/5 hover:border-danger/30 tooltip" title="Ban / Restrict">
                                                            <ShieldBan size={16} />
                                                        </button>
                                                        <button className="p-2 bg-surface hover:bg-danger/20 text-textMuted hover:text-danger rounded-lg transition-colors border border-white/5 hover:border-danger/30" title="Delete Account">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'servers' && (
                        <div className="glass-panel rounded-3xl p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-white">Server Fleet</h2>
                                <button onClick={() => setCreateServerOpen(true)} className="flex items-center gap-2 bg-primary hover:bg-primaryHover text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-primary/20">
                                    <Plus size={16} /> Deploy New
                                </button>
                            </div>

                            <div className="text-center py-12 text-textMuted border border-dashed border-white/10 rounded-2xl">
                                <Server className="w-12 h-12 text-textMuted/30 mx-auto mb-4" />
                                No global servers to display right now.
                            </div>
                        </div>
                    )}

                    {activeTab === 'trolling' && (
                        <div className="glass-panel rounded-3xl p-6 border-accent/20 border">
                            <h2 className="text-2xl font-bold text-accent mb-2 flex items-center gap-2"><Skull /> Trolling Controls</h2>
                            <p className="text-textMuted text-sm mb-8">Execute fun or purely chaotic functions across the hosting backend.</p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <button className="p-4 bg-surface border border-accent/20 rounded-2xl text-left hover:bg-accent/10 transition-colors group">
                                    <h3 className="font-bold text-white group-hover:text-accent transition-colors flex items-center gap-2 mb-1"><Power size={18} /> Crash All Servers</h3>
                                    <p className="text-xs text-textMuted">Immediately kill -9 all running Pterodactyl wings.</p>
                                </button>
                                <button className="p-4 bg-surface border border-accent/20 rounded-2xl text-left hover:bg-accent/10 transition-colors group">
                                    <h3 className="font-bold text-white group-hover:text-accent transition-colors flex items-center gap-2 mb-1"><Users size={18} /> Rickroll All Users</h3>
                                    <p className="text-xs text-textMuted">Force audio playback of Never Gonna Give You Up.</p>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Add basic empty state for Logs to prevent breaking */}
                    {activeTab === 'logs' && (
                        <div className="glass-panel rounded-3xl p-6">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                                <h2 className="text-2xl font-bold text-white">Audit Logs</h2>
                                <div className="flex items-center gap-3 w-full md:w-auto">
                                    <div className="relative flex-1 md:w-64">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted w-4 h-4" />
                                        <input
                                            type="text"
                                            placeholder="Search logs..."
                                            value={search}
                                            onChange={e => setSearch(e.target.value)}
                                            className="w-full bg-surface border border-white/10 rounded-xl py-2 pl-9 pr-4 outline-none focus:border-primary transition-all text-sm"
                                        />
                                    </div>
                                    <select
                                        value={logSort}
                                        onChange={(e) => setLogSort(e.target.value as any)}
                                        className="bg-surface border border-white/10 rounded-xl py-2 px-3 outline-none focus:border-primary text-sm transition-all text-white"
                                    >
                                        <option value="newest">Newest First</option>
                                        <option value="alphabetical">Alphabetical</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                {mockLogs
                                    .filter(log => log.user.toLowerCase().includes(search.toLowerCase()) || log.action.toLowerCase().includes(search.toLowerCase()))
                                    .sort((a, b) => {
                                        if (logSort === 'alphabetical') return a.action.localeCompare(b.action);
                                        return 0; // simple mock sort
                                    })
                                    .map(log => (
                                        <div key={log.id} className="flex justify-between p-4 bg-surface border border-white/5 rounded-xl text-sm hover:bg-white/[0.02] transition-colors">
                                            <div><span className="font-bold text-white pr-2 border-r border-white/10 mr-2">{log.user}</span> <span className="text-textMuted">{log.action}</span></div>
                                            <div className="text-textMuted text-xs/none font-mono flex items-center">{log.time}</div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    )}

                </motion.div>
            </div>

            {/* Ban/Restriction Modal */}
            <AnimatePresence>
                {isBanModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="glass-panel w-full max-w-lg rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col"
                        >
                            <div className="flex justify-between items-center p-6 border-b border-white/5">
                                <h3 className="text-xl font-bold text-white">Restrict User: {selectedUser?.nick}</h3>
                                <button onClick={() => setBanModalOpen(false)} className="text-textMuted hover:text-white transition-colors"><X size={20} /></button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="text-xs font-semibold text-textMuted uppercase tracking-wider block mb-2">Duration</label>
                                    <select className="w-full bg-surface border border-white/10 rounded-xl py-3 px-4 text-white outline-none focus:border-danger transition-colors">
                                        <option>1 Hour</option>
                                        <option>24 Hours</option>
                                        <option>7 Days</option>
                                        <option>Permanent</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-textMuted uppercase tracking-wider block mb-2">Features to Block</label>
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input type="checkbox" className="w-4 h-4 rounded border-white/20 text-danger bg-surface focus:ring-danger focus:ring-offset-surface" />
                                            <span className="text-sm text-white">Server Creation</span>
                                        </label>
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input type="checkbox" className="w-4 h-4 rounded border-white/20 text-danger bg-surface focus:ring-danger focus:ring-offset-surface" />
                                            <span className="text-sm text-white">Console Access</span>
                                        </label>
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input type="checkbox" className="w-4 h-4 rounded border-white/20 text-danger bg-surface focus:ring-danger focus:ring-offset-surface" />
                                            <span className="text-sm text-white">Full Login Block (Ban)</span>
                                        </label>
                                    </div>
                                </div>
                                <button className="w-full mt-4 bg-danger hover:bg-red-500 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-danger/20">Apply Restrictions</button>
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
                            className="glass-panel w-full max-w-lg rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col"
                        >
                            <div className="flex justify-between items-center p-6 border-b border-white/5">
                                <h3 className="text-xl font-bold text-white">Deploy New Server</h3>
                                <button onClick={() => setCreateServerOpen(false)} className="text-textMuted hover:text-white transition-colors"><X size={20} /></button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-semibold text-textMuted uppercase tracking-wider block mb-2">Server Name</label>
                                        <input type="text" placeholder="e.g. Vanilla SMP" className="w-full bg-surface border border-white/10 rounded-xl py-3 px-4 outline-none focus:border-primary text-white text-sm" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-semibold text-textMuted uppercase tracking-wider block mb-2">RAM (GB)</label>
                                            <input type="number" step="0.1" placeholder="e.g. 2.5" className="w-full bg-surface border border-white/10 rounded-xl py-3 px-4 outline-none focus:border-primary text-white text-sm" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-textMuted uppercase tracking-wider block mb-2">Storage (NVMe GB)</label>
                                            <input type="number" step="1" placeholder="e.g. 20" className="w-full bg-surface border border-white/10 rounded-xl py-3 px-4 outline-none focus:border-primary text-white text-sm" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-textMuted uppercase tracking-wider block mb-2">Virtual Cores</label>
                                        <input type="number" step="1" placeholder="e.g. 2" className="w-full bg-surface border border-white/10 rounded-xl py-3 px-4 outline-none focus:border-primary text-white text-sm" />
                                    </div>
                                </div>
                                <button className="w-full mt-4 bg-primary hover:bg-primaryHover text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-primary/20">Provision Server</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminPanel;
