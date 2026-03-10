import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useParams, Link } from 'react-router-dom';
import {
    Terminal, Folder, Database, Calendar, Users, Archive,
    Globe, Settings, Download, Play, RotateCcw,
    Square, Skull, Cpu, MemoryStick, Activity, ShieldAlert,
    File, Plus, Trash2, Edit2, Lock, Clock
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

const mockLogs = [
    "[10:24:15] [Server thread/INFO]: Starting minecraft server version 1.21.1",
    "[10:24:15] [Server thread/INFO]: Loading properties",
    "[10:24:15] [Server thread/INFO]: Default game type: SURVIVAL",
    "[10:24:15] [Server thread/INFO]: Generating keypair",
    "[10:24:16] [Server thread/INFO]: Starting Minecraft server on *:25565",
    "[10:24:16] [Server thread/INFO]: Using default channel type",
    "[10:24:18] [Server thread/INFO]: Preparing level \"world\"",
    "[10:24:22] [Server thread/INFO]: Preparing start region for dimension minecraft:overworld",
    "[10:24:24] [Server thread/INFO]: Time elapsed: 1452 ms",
    "[10:24:24] [Server thread/INFO]: Done (9.124s)! For help, type \"help\"",
];

// Stats are now generated dynamically via state

const mockFiles = [
    { name: 'world', type: 'folder', size: '--', date: 'Oct 24, 2023 14:32' },
    { name: 'plugins', type: 'folder', size: '--', date: 'Oct 24, 2023 14:30' },
    { name: 'server.properties', type: 'file', size: '1.2 KB', date: 'Oct 24, 2023 14:35' },
    { name: 'spigot.yml', type: 'file', size: '3.4 KB', date: 'Oct 24, 2023 14:35' },
    { name: 'eula.txt', type: 'file', size: '158 B', date: 'Oct 24, 2023 14:31' },
];

const mockDatabases = [
    { name: 's1_core', host: 'db1.hoxen.one', username: 'u1_r4nd0m', size: '45.2 MB' },
];

const mockSchedules = [
    { name: 'Daily Backup', cron: '0 4 * * *', next: 'in 8 hours', status: 'Active' },
    { name: 'Restart Server', cron: '0 0 * * *', next: 'in 4 hours', status: 'Active' },
];

const mockSubusers = [
    { email: 'admin2@example.com', perms: ['control', 'console'], '2fa': true },
];

const mockBackups = [
    { name: 'Backup_2023-10-24', size: '1.4 GB', date: 'Oct 24, 2023 04:00', status: 'Completed' },
];

const mockAllocations = [
    { ip: '192.168.1.100', port: 25565, isDefault: true, alias: 'play.hoxen.one' },
    { ip: '192.168.1.100', port: 8192, isDefault: false, alias: '' },
];

const versionsData = {
    Vanilla: ['1.21.1', '1.20.6', '1.19.4', '1.18.2', '1.17.1', '1.12.2'],
    Paper: ['1.21.1', '1.21', '1.20.6', '1.20.4', '1.19.4', '1.18.2', '1.16.5', '1.8.8'],
    Pufferfish: ['1.21.1', '1.20.6', '1.19.4'],
    Spigot: ['1.21.1', '1.20.6', '1.19.4', '1.16.5', '1.8.8'],
    Folia: ['1.21.1', '1.20.6', '1.20.4', '1.19.4'],
    Purpur: ['1.21.1', '1.20.6', '1.20.4', '1.19.4', '1.18.2'],
    Waterfall: ['1.20', '1.19'],
    Velocity: ['3.3.0', '3.2.0', '3.1.0'],
    Fabric: ['1.21.1', '1.20.6', '1.20.1', '1.19.4', '1.18.2'],
    BungeeCord: ['1.21', '1.20', '1.19', '1.8'],
    Quilt: ['1.21.1', '1.20.6', '1.19.4'],
    Forge: ['1.20.4', '1.20.1', '1.19.4', '1.16.5', '1.12.2', '1.8.9'],
    NeoForge: ['1.21.1', '1.20.6', '1.20.4'],
    Mohist: ['1.20.1', '1.19.4', '1.16.5', '1.12.2'],
    Arclight: ['1.20.1', '1.19.4', '1.16.5', '1.12.2'],
    Sponge: ['1.20.2', '1.16.5', '1.12.2'],
    Leaves: ['1.21.1', '1.20.6'],
    Canvas: ['1.21.1', '1.20.6'],
};

const ServerPanel = () => {
    const { id } = useParams();
    const [activeTab, setActiveTab] = useState('console');
    const [selectedSoftware, setSelectedSoftware] = useState<string | null>(null);
    const [selectedVersion, setSelectedVersion] = useState<string | null>(null);
    const [wipeServer, setWipeServer] = useState(false);

    // Deep Simulation States
    const [serverState, setServerState] = useState<'offline' | 'starting' | 'running' | 'stopping'>('offline');
    const [logs, setLogs] = useState<string[]>([]);
    const [stats, setStats] = useState(Array.from({ length: 20 }, (_, i) => ({ time: i, cpu: 0, ram: 0, netIn: 0, netOut: 0 })));

    const [files, setFiles] = useState(mockFiles);
    const [databases, setDatabases] = useState(mockDatabases);
    const [schedules, setSchedules] = useState(mockSchedules);
    const [users, setUsers] = useState(mockSubusers);
    const [backups, setBackups] = useState(mockBackups);
    const [allocations, setAllocations] = useState(mockAllocations);

    // Shut down timer state
    const [isShuttingDown, setIsShuttingDown] = useState(false);
    const [shutdownTime, setShutdownTime] = useState(5);

    useEffect(() => {
        let timer: ReturnType<typeof setInterval>;
        if (isShuttingDown && shutdownTime > 0) {
            timer = setInterval(() => {
                setShutdownTime(prev => prev - 1);
            }, 1000);
        } else if (isShuttingDown && shutdownTime === 0) {
            setIsShuttingDown(false);
            setShutdownTime(5);
            setServerState('offline');
            setLogs(prev => [...prev, "[10:25:05] [Server thread/INFO]: Server stopped."]);
            toast.success('Server offline');
        }
        return () => clearInterval(timer);
    }, [isShuttingDown, shutdownTime]);

    useEffect(() => {
        const timer = setInterval(() => {
            setStats(prev => {
                const newStats = [...prev.slice(1)];
                const lastTime = prev[prev.length - 1].time;
                if (serverState === 'running') {
                    newStats.push({ time: lastTime + 1, cpu: Math.random() * 15 + 5, ram: Math.random() * 200 + 1200, netIn: Math.random() * 2, netOut: Math.random() * 5 });
                } else if (serverState === 'starting') {
                    newStats.push({ time: lastTime + 1, cpu: Math.random() * 40 + 60, ram: Math.random() * 1000 + 500, netIn: Math.random() * 10, netOut: Math.random() * 20 });
                } else {
                    newStats.push({ time: lastTime + 1, cpu: 0, ram: 0, netIn: 0, netOut: 0 });
                }
                return newStats;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [serverState]);

    const handleStart = () => {
        if (serverState !== 'offline') return;
        toast.success('Starting server...');
        setServerState('starting');
        setLogs(["[10:24:15] [Server thread/INFO]: Starting minecraft server..."]);

        let step = 1;
        const interval = setInterval(() => {
            if (step < mockLogs.length) {
                setLogs(prev => [...prev, mockLogs[step]]);
                step++;
            } else {
                clearInterval(interval);
                setServerState('running');
                toast.success('Server is online!', { icon: '🚀' });
            }
        }, 600);
    };

    const handleRestart = () => {
        toast('Restarting server...', { icon: '🔄' });
        setServerState('stopping');
        setIsShuttingDown(true);
        setShutdownTime(3);
        setTimeout(() => {
            handleStart();
        }, 3500);
    };

    const handleGracefulStop = () => {
        if (serverState === 'offline') return;
        toast('Sending stop command...', { icon: '🛑' });
        setIsShuttingDown(true);
        setShutdownTime(5);
    };

    const handleKill = () => {
        if (serverState === 'offline') return;
        toast.error('Process killed ungracefully.');
        setServerState('offline');
        setLogs(prev => [...prev, "[10:24:25] [Server thread/ERROR]: Process killed by user."]);
        setIsShuttingDown(false);
    };

    const tabs = [
        { id: 'console', label: 'Console', icon: Terminal },
        { id: 'files', label: 'Files', icon: Folder },
        { id: 'databases', label: 'Databases', icon: Database },
        { id: 'schedules', label: 'Schedules', icon: Calendar },
        { id: 'users', label: 'Users', icon: Users },
        { id: 'backups', label: 'Backups', icon: Archive },
        { id: 'network', label: 'Network', icon: Globe },
        { id: 'settings', label: 'Settings', icon: Settings },
        { id: 'versions', label: 'Versions', icon: Download },
        { id: 'firewall', label: 'Firewall', icon: ShieldAlert },
    ];

    const generateBuildName = () => {
        const build = Math.floor(Math.random() * 500 + 10);
        return `Build ${build} [stable]`;
    };

    return (
        <div className="flex-1 flex flex-col md:flex-row w-full max-w-[1400px] mx-auto px-4 md:px-8 py-8 h-full gap-8">

            {/* Sidebar Desktop */}
            <div className="w-56 flex-shrink-0 hidden md:flex flex-col gap-2 relative">
                <div className="glass-panel p-4 rounded-3xl sticky top-24">
                    <div className="mb-6 px-2">
                        <Link to="/dashboard" className="text-xs text-textMuted hover:text-white transition-colors block mb-4">← Back to Servers</Link>
                        <h1 className="text-xl font-bold text-white truncate" title={`Server ${id}`}>Survival SMP</h1>
                        <p className="text-xs text-textMuted font-mono bg-surface inline-block px-2 py-1 rounded mt-1">{id}</p>
                    </div>
                    <nav className="flex flex-col gap-1">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all font-medium text-sm border border-transparent ${activeTab === tab.id
                                    ? 'bg-primary/10 text-primary border-primary/20 shadow-lg shadow-primary/5'
                                    : 'text-textMuted hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <tab.icon size={16} />
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">

                {/* Mobile Tabs */}
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

                {activeTab === 'console' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">

                        {/* Server Controls */}
                        <div className="glass-panel p-4 rounded-2xl flex flex-wrap gap-3">
                            <button onClick={handleStart} disabled={serverState !== 'offline'} className="flex-1 min-w-[120px] bg-secondary hover:bg-emerald-400 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-secondary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                                <Play size={18} /> Start
                            </button>
                            <button onClick={handleRestart} disabled={serverState === 'offline'} className="flex-1 min-w-[120px] bg-accent hover:bg-yellow-500 text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-accent/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                                <RotateCcw size={18} /> Restart
                            </button>
                            <button
                                onClick={handleGracefulStop}
                                disabled={serverState === 'offline' || isShuttingDown}
                                className="flex-1 min-w-[120px] bg-surface border border-danger hover:bg-danger text-danger hover:text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                            >
                                {isShuttingDown ? `Stopping (${shutdownTime}s)` : <><Square size={18} /> Stop</>}
                            </button>
                            <button onClick={handleKill} disabled={serverState === 'offline'} className="flex-1 min-w-[120px] bg-danger hover:bg-red-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-danger/20 transition-all font-mono disabled:opacity-50 disabled:cursor-not-allowed">
                                <Skull size={18} /> Kill -9
                            </button>
                        </div>

                        {/* Terminal Window */}
                        <div className="glass-panel rounded-2xl overflow-hidden border border-white/10 shadow-2xl flex flex-col h-[400px]">
                            <div className="bg-surface/80 px-4 py-2 border-b border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-danger" /><div className="w-3 h-3 rounded-full bg-accent" /><div className="w-3 h-3 rounded-full bg-secondary" /></div>
                                    <span className="text-xs text-textMuted font-mono ml-2">pl1.hoxen.one - root@{id}</span>
                                </div>
                                {isShuttingDown && (
                                    <span className="text-xs font-bold text-danger animate-pulse">Graceful Shutdown in Progress: {shutdownTime}s...</span>
                                )}
                            </div>
                            <div className="flex-1 bg-[#0c0c0e] p-4 overflow-y-auto font-mono text-sm leading-relaxed scroll-smooth scrollbar-thin flex flex-col justify-end">
                                <div>
                                    {logs.length === 0 && <div className="text-textMuted italic">Server is offline. Press Start to boot.</div>}
                                    {logs.filter(log => typeof log === 'string').map((log, i) => (
                                        <div key={i} className="text-gray-300">
                                            <span className="text-blue-400">{log.substring(0, 10)}</span>
                                            <span className={log.includes('INFO') ? 'text-green-400' : log.includes('ERROR') ? 'text-red-400' : 'text-gray-300'}>{log.substring(10, 31)}</span>
                                            <span className="text-gray-100">{log.substring(31)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-surface border-t border-white/5 p-2">
                                <input type="text" placeholder="Type a command..." className="w-full bg-black/50 border border-white/10 rounded-lg py-2 px-3 outline-none focus:border-primary text-white font-mono text-sm" />
                            </div>
                        </div>

                        {/* Graphs */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="glass-panel p-5 rounded-2xl relative overflow-hidden group">
                                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2 text-white font-semibold"><Cpu size={16} className="text-primary" /> CPU Usage</div>
                                    <span className="font-mono text-sm font-bold text-primary">{stats[19].cpu.toFixed(1)}%</span>
                                </div>
                                <div className="text-xs text-textMuted mb-2">0% / 200% (2 Cores)</div>
                                <div className="h-24">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={stats}>
                                            <Area type="monotone" dataKey="cpu" stroke="#6366f1" fillOpacity={0.2} fill="#6366f1" isAnimationActive={false} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                            <div className="glass-panel p-5 rounded-2xl relative overflow-hidden group">
                                <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2 text-white font-semibold"><MemoryStick size={16} className="text-accent" /> Memory Usage</div>
                                    <span className="font-mono text-sm font-bold text-accent">{stats[19].ram.toFixed(0)} MB</span>
                                </div>
                                <div className="text-xs text-textMuted mb-2">0 MB / 4096 MB</div>
                                <div className="h-24">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={stats}>
                                            <Area type="monotone" dataKey="ram" stroke="#f59e0b" fillOpacity={0.2} fill="#f59e0b" isAnimationActive={false} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                            <div className="glass-panel p-5 rounded-2xl relative overflow-hidden group">
                                <div className="absolute inset-0 bg-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2 text-white font-semibold"><Activity size={16} className="text-secondary" /> Network (In/Out)</div>
                                    <div className="font-mono text-sm font-bold flex gap-2">
                                        <span className="text-secondary">{(stats[19].netIn + stats[19].netOut).toFixed(1)} MB/s</span>
                                    </div>
                                </div>
                                <div className="text-xs text-textMuted flex gap-3 mb-2">
                                    <span className="text-secondary">Inbound</span>
                                    <span className="text-danger">Outbound</span>
                                </div>
                                <div className="h-24">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={stats}>
                                            <Area type="monotone" dataKey="netIn" stroke="#10b981" fillOpacity={0.2} fill="#10b981" isAnimationActive={false} />
                                            <Area type="monotone" dataKey="netOut" stroke="#ef4444" fillOpacity={0.2} fill="#ef4444" isAnimationActive={false} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'settings' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                        <div className="glass-panel p-8 rounded-3xl">
                            <h2 className="text-2xl font-bold text-white mb-6">Settings</h2>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-bold text-white mb-4">SFTP Details</h3>
                                        <div className="space-y-4">
                                            <div className="bg-surface p-4 rounded-xl border border-white/5">
                                                <p className="text-xs text-textMuted uppercase tracking-wider font-semibold mb-1">Server Address</p>
                                                <div className="font-mono text-white select-all text-sm">sftp://pl1.hoxen.one:2022</div>
                                            </div>
                                            <div className="bg-surface p-4 rounded-xl border border-white/5">
                                                <p className="text-xs text-textMuted uppercase tracking-wider font-semibold mb-1">Username</p>
                                                <div className="font-mono text-white select-all text-sm">xylos.{id}</div>
                                            </div>
                                            <p className="text-sm text-textMuted">Your SFTP password is the same as the password you use to access this panel.</p>
                                            <button className="bg-primary hover:bg-primaryHover text-white px-6 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-primary/20 w-full md:w-auto">Launch SFTP</button>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-bold text-white mb-4">Change Server Details</h3>
                                        <div className="space-y-4">
                                            <div className="bg-surface p-4 rounded-xl border border-white/5">
                                                <p className="text-xs text-textMuted uppercase tracking-wider font-semibold mb-2">Server Name</p>
                                                <div className="flex gap-2">
                                                    <input type="text" defaultValue="Survival SMP" className="w-full bg-black/30 border border-white/10 rounded-lg py-2 px-3 outline-none focus:border-primary text-white text-sm" />
                                                    <button className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm whitespace-nowrap">Save</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-bold text-white mb-4">Debug Information</h3>
                                        <div className="space-y-4">
                                            <div className="bg-surface p-4 rounded-xl border border-white/5">
                                                <p className="text-xs text-textMuted uppercase tracking-wider font-semibold mb-1">Node</p>
                                                <p className="text-white font-medium text-sm">pl1.hoxen.one</p>
                                            </div>
                                            <div className="bg-surface p-4 rounded-xl border border-white/5 flex flex-col">
                                                <p className="text-xs text-textMuted uppercase tracking-wider font-semibold mb-1">Server ID</p>
                                                <p className="text-white font-mono text-xs overflow-hidden text-ellipsis select-all">{id}-24a0-40db-a9c8-6da68529d679</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-bold text-white mb-4">Danger Zone</h3>
                                        <div className="bg-danger/10 p-6 rounded-xl border border-danger/20">
                                            <h4 className="font-bold text-danger mb-2">Reinstall Server</h4>
                                            <p className="text-sm text-red-100/70 mb-4">Reinstalling your server will stop it, and then re-run the installation script that initially set it up. <strong className="text-white">Some files may be deleted or modified during this process, please back up your data before continuing.</strong></p>
                                            <button className="bg-danger hover:bg-red-500 text-white font-bold py-2.5 px-6 rounded-xl transition-colors shadow-lg shadow-danger/20">Reinstall Server</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'versions' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-panel p-6 md:p-8 rounded-3xl min-h-[600px]">

                        <AnimatePresence mode="wait">
                            {!selectedSoftware && !selectedVersion && (
                                <motion.div
                                    key="categories"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <div className="mb-8">
                                        <h2 className="text-2xl font-bold text-white mb-2">Software Versions Installer</h2>
                                        <p className="text-textMuted">Install or update your server software from our extensive pre-configured list.</p>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {Object.keys(versionsData).map(software => (
                                            <button
                                                key={software}
                                                onClick={() => setSelectedSoftware(software)}
                                                className="bg-surface border border-white/5 hover:border-primary/50 hover:bg-primary/5 p-6 rounded-2xl text-left transition-all group relative overflow-hidden"
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                                <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors relative z-10">{software}</h3>
                                                <p className="text-sm text-textMuted mt-1 relative z-10">{versionsData[software as keyof typeof versionsData].length} Game Versions</p>
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {selectedSoftware && !selectedVersion && (
                                <motion.div
                                    key="versions"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <div className="flex items-center gap-4 mb-8">
                                        <button onClick={() => setSelectedSoftware(null)} className="text-textMuted hover:text-white p-2.5 bg-surface rounded-xl transition-colors border border-white/5 hover:border-white/20">
                                            <span className="sr-only">Go Back</span>
                                            ←
                                        </button>
                                        <div>
                                            <h2 className="text-2xl font-bold text-white">{selectedSoftware}</h2>
                                            <p className="text-sm text-textMuted">Select a game version to continue</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-4xl">
                                        {versionsData[selectedSoftware as keyof typeof versionsData].map(version => (
                                            <button
                                                key={version}
                                                onClick={() => setSelectedVersion(version)}
                                                className="w-full bg-surface border border-white/5 hover:border-primary/30 p-4 rounded-xl flex items-center justify-between transition-colors group"
                                            >
                                                <div>
                                                    <span className="text-lg font-bold text-white block text-left group-hover:text-primary transition-colors">{version}</span>
                                                </div>
                                                <div className="text-right flex flex-col items-end gap-1">
                                                    <span className="text-[10px] bg-secondary/10 text-secondary border border-secondary/20 px-2 py-0.5 rounded font-mono font-semibold uppercase tracking-widest">Release</span>
                                                    <span className="text-xs text-textMuted">Latest build available</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {selectedSoftware && selectedVersion && (
                                <motion.div
                                    key="install"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.2 }}
                                    className="max-w-2xl mx-auto mt-12"
                                >
                                    <div className="text-center mb-10">
                                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/20 text-primary mb-6">
                                            <Download size={32} />
                                        </div>
                                        <h2 className="text-3xl font-bold text-white mb-2">Install {selectedSoftware} <span className="text-primary">{selectedVersion}</span></h2>
                                        <p className="text-textMuted">You are about to modify your server's core jar file.</p>
                                    </div>

                                    <div className="bg-surface border border-white/10 rounded-3xl p-8 relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent" />

                                        <div className="flex justify-between items-center py-4 border-b border-white/5 mb-6">
                                            <span className="text-textMuted">Target Build</span>
                                            <span className="font-mono text-sm font-bold text-white bg-white/5 px-3 py-1 rounded-lg border border-white/10">{generateBuildName()}</span>
                                        </div>

                                        <div className="mb-8 p-5 bg-danger/10 border border-danger/20 rounded-2xl relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                                <Skull size={64} className="text-danger" />
                                            </div>
                                            <label className="flex items-start gap-4 cursor-pointer relative z-10 w-full">
                                                <input
                                                    type="checkbox"
                                                    checked={wipeServer}
                                                    onChange={(e) => setWipeServer(e.target.checked)}
                                                    className="mt-1 w-5 h-5 rounded border-danger/30 text-danger bg-black/50 focus:ring-danger focus:ring-offset-surface cursor-pointer"
                                                />
                                                <div className="flex-1">
                                                    <span className="text-white font-bold block mb-1 text-lg">Wipe Server Files</span>
                                                    <span className="text-sm text-red-200/80 block leading-relaxed">Checking this box will completely format your server directory, deleting world data, plugins, and configurations. This cannot be undone.</span>
                                                </div>
                                            </label>
                                        </div>

                                        <div className="flex gap-4">
                                            <button
                                                onClick={() => setSelectedVersion(null)}
                                                className="flex-1 bg-surface hover:bg-white/5 border border-white/10 text-white font-bold py-4 rounded-xl transition-all"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={() => {
                                                    toast.success(`Installing ${selectedSoftware} ${selectedVersion} sequence initiated. Restarting server...`);
                                                    setServerState('stopping');
                                                    setTimeout(() => {
                                                        setServerState('offline');
                                                        setSelectedVersion(null);
                                                    }, 2000);
                                                }}
                                                className="flex-[2] bg-primary hover:bg-primaryHover text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/30 transition-all text-lg flex justify-center items-center gap-2">
                                                <Download size={20} />
                                                Start Installation
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}

                {activeTab === 'files' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-panel p-6 rounded-3xl">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-1">File Manager</h2>
                                <p className="text-sm text-textMuted font-mono bg-white/5 py-1 px-2 rounded-lg inline-block">/home/container</p>
                            </div>
                            <div className="flex gap-2 w-full md:w-auto">
                                <button className="flex-1 md:flex-none justify-center bg-surface hover:bg-white/10 border border-white/10 text-white font-medium py-2 px-4 rounded-xl transition-all text-sm">New File</button>
                                <button className="flex-1 md:flex-none justify-center bg-surface hover:bg-white/10 border border-white/10 text-white font-medium py-2 px-4 rounded-xl transition-all text-sm">New Folder</button>
                                <button className="flex-1 md:flex-none justify-center bg-primary hover:bg-primaryHover text-white font-medium py-2 px-4 rounded-xl transition-all text-sm shadow-lg shadow-primary/20">Upload</button>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/10 text-textMuted text-xs uppercase tracking-wider">
                                        <th className="pb-3 pl-4 font-semibold w-[60%]">Name</th>
                                        <th className="pb-3 p-4 font-semibold">Size</th>
                                        <th className="pb-3 p-4 font-semibold hidden md:table-cell">Last Modified</th>
                                        <th className="pb-3 p-4 font-semibold text-right"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {files.map((f, i) => (
                                        <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                                            <td className="p-4 flex items-center gap-3">
                                                {f.type === 'folder' ? <Folder size={18} className="text-accent" /> : <File size={18} className="text-textMuted" />}
                                                <span className="font-medium text-white hover:text-primary transition-colors cursor-pointer">{f.name}</span>
                                            </td>
                                            <td className="p-4 text-sm text-textMuted">{f.size}</td>
                                            <td className="p-4 text-sm text-textMuted hidden md:table-cell">{f.date}</td>
                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => toast('Edit feature incoming', { icon: '📝' })} className="p-2 bg-surface hover:bg-white/10 text-textMuted hover:text-white rounded-lg transition-colors border border-white/5 hover:border-white/20"><Edit2 size={14} /></button>
                                                    <button onClick={() => {
                                                        setFiles(prev => prev.filter(x => x.name !== f.name));
                                                        toast.success(`Deleted ${f.name}`);
                                                    }} className="p-2 bg-surface hover:bg-danger/20 text-textMuted hover:text-danger rounded-lg transition-colors border border-white/5 hover:border-danger/30"><Trash2 size={14} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'databases' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-panel p-6 rounded-3xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-white">Databases</h2>
                            <button onClick={() => {
                                const dbName = prompt('Database Name:');
                                if (dbName) {
                                    setDatabases(prev => [...prev, { name: dbName, host: 'db2.hoxen.one', username: `u${Math.floor(Math.random() * 1000)}_db`, size: '0 MB' }]);
                                    toast.success('Database created');
                                }
                            }} className="flex items-center gap-2 bg-primary hover:bg-primaryHover text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-primary/20">
                                <Plus size={16} /> New Database
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {databases.map((db, i) => (
                                <div key={i} className="bg-surface border border-white/5 p-6 rounded-2xl relative group hover:border-white/20 transition-all">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary border border-secondary/20">
                                                <Database size={20} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-white text-lg">{db.name}</h3>
                                                <span className="text-xs text-secondary font-mono bg-secondary/10 px-2 py-0.5 rounded border border-secondary/20">Active</span>
                                            </div>
                                        </div>
                                        <button onClick={() => {
                                            setDatabases(prev => prev.filter(x => x.name !== db.name));
                                            toast.success('Database deleted');
                                        }} className="text-danger hover:bg-danger/10 p-2 rounded-lg transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={16} /></button>
                                    </div>
                                    <div className="space-y-3 font-mono text-sm">
                                        <div className="flex justify-between border-b border-white/5 pb-2">
                                            <span className="text-textMuted text-xs font-sans uppercase tracking-wider">Host</span>
                                            <span className="text-white select-all">{db.host}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-white/5 pb-2">
                                            <span className="text-textMuted text-xs font-sans uppercase tracking-wider">Username</span>
                                            <span className="text-white select-all">{db.username}</span>
                                        </div>
                                        <div className="flex justify-between pt-1">
                                            <span className="text-textMuted text-xs font-sans uppercase tracking-wider">Size</span>
                                            <span className="text-white">{db.size}</span>
                                        </div>
                                    </div>
                                    <button onClick={() => toast.success(`Revealed password for ${db.name}: hunter2`)} className="w-full mt-4 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white py-2 rounded-xl transition-colors font-medium text-sm">
                                        <Lock size={14} /> Reveal Password
                                    </button>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {activeTab === 'schedules' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-panel p-6 rounded-3xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-white">Schedules & Cron</h2>
                            <button onClick={() => toast('Schedule creation modal opened', { icon: '📝' })} className="flex items-center gap-2 bg-primary hover:bg-primaryHover text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-primary/20">
                                <Plus size={16} /> Create Schedule
                            </button>
                        </div>
                        <div className="space-y-3">
                            {schedules.map((s, i) => (
                                <div key={i} className="flex flex-col md:flex-row items-start md:items-center justify-between p-5 bg-surface border border-white/5 hover:border-primary/30 rounded-2xl transition-all group">
                                    <div className="flex items-center gap-4 mb-4 md:mb-0">
                                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                            <Clock size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white text-lg">{s.name}</h3>
                                            <p className="text-sm text-textMuted">Executes: <span className="font-mono bg-black/40 px-1.5 py-0.5 rounded text-white">{s.cron}</span></p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                                        <div className="text-right">
                                            <p className="text-xs text-textMuted uppercase tracking-wider">Next Run</p>
                                            <p className="font-medium text-amber-400">{s.next}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-sm font-medium transition-colors">Edit</button>
                                            <button onClick={() => {
                                                setSchedules(prev => prev.filter(x => x.name !== s.name));
                                                toast.success('Schedule removed');
                                            }} className="p-2 bg-white/5 hover:bg-danger/20 hover:text-danger hover:border-danger/30 border border-white/10 text-textMuted rounded-xl transition-colors"><Trash2 size={16} /></button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {activeTab === 'users' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-panel p-6 rounded-3xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-white">Subusers</h2>
                            <button onClick={() => toast.success('Invite link copied to clipboard!')} className="flex items-center gap-2 bg-primary hover:bg-primaryHover text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-primary/20">
                                <Plus size={16} /> Invite User
                            </button>
                        </div>
                        <div className="space-y-3">
                            {users.map((u, i) => (
                                <div key={i} className="flex flex-col md:flex-row items-start md:items-center justify-between p-5 bg-surface border border-white/5 rounded-2xl transition-all group">
                                    <div className="flex items-center gap-4 mb-4 md:mb-0">
                                        <div className="hidden md:flex w-12 h-12 rounded-full bg-white/5 items-center justify-center text-textMuted border border-white/10">
                                            <Users size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white mb-1 flex items-center gap-2">
                                                {u.email}
                                                {u['2fa'] && <span className="text-[10px] bg-secondary/10 text-secondary border border-secondary/20 px-2 py-0.5 rounded-full uppercase tracking-widest font-bold flex items-center gap-1"><ShieldAlert size={10} /> 2FA setup</span>}
                                            </h3>
                                            <div className="flex gap-2">
                                                {u.perms.map(p => <span key={p} className="text-xs font-mono text-textMuted bg-black/40 border border-white/10 px-2 py-0.5 rounded">{p}</span>)}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                                        <button className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-sm font-medium transition-colors">Manage Roles</button>
                                        <button onClick={() => {
                                            setUsers(prev => prev.filter(x => x.email !== u.email));
                                            toast.success('User removed');
                                        }} className="p-2 bg-white/5 hover:bg-danger/20 hover:text-danger hover:border-danger/30 border border-white/10 text-textMuted rounded-xl transition-colors"><Trash2 size={16} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {activeTab === 'backups' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-panel p-6 rounded-3xl">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-1">Backups</h2>
                                <p className="text-sm text-textMuted">Limit: <span className="text-white font-medium">1 / 3</span> backups</p>
                            </div>
                            <button className="flex items-center gap-2 bg-primary hover:bg-primaryHover text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-primary/20">
                                <Archive size={16} /> Create Backup
                            </button>
                        </div>
                        <div className="space-y-3">
                            {backups.map((b, i) => (
                                <div key={i} className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 bg-surface border border-white/5 hover:border-white/20 rounded-2xl transition-all group">
                                    <div className="flex items-center gap-4 mb-4 md:mb-0">
                                        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent border border-accent/20">
                                            <Archive size={18} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white">{b.name} <span className="text-xs text-textMuted ml-2 font-normal">{b.size}</span></h3>
                                            <p className="text-sm text-textMuted">{b.date}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                                        <span className="text-xs bg-secondary/10 text-secondary border border-secondary/20 px-3 py-1.5 rounded-lg uppercase tracking-wider font-bold mr-2">{b.status}</span>
                                        <button onClick={() => toast.success('Downloading backup...')} className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl transition-colors"><Download size={16} /></button>
                                        <button onClick={() => toast.success('Restoring backup...')} className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl transition-colors tooltip" title="Restore"><RotateCcw size={16} /></button>
                                        <button onClick={() => {
                                            setBackups(prev => prev.filter(x => x.name !== b.name));
                                            toast.success('Backup deleted');
                                        }} className="p-2 bg-white/5 hover:bg-danger/20 hover:text-danger hover:border-danger/30 border border-white/10 text-textMuted rounded-xl transition-colors"><Trash2 size={16} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {activeTab === 'network' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-panel p-6 rounded-3xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-white">Network Allocations</h2>
                            <button onClick={() => {
                                setAllocations(prev => [...prev, { ip: '192.168.1.100', port: Math.floor(Math.random() * 50000 + 10000), isDefault: false, alias: '' }]);
                                toast.success('Port requested and currently provisioning');
                            }} className="flex items-center gap-2 bg-surface hover:bg-white/10 border border-white/10 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all">
                                <Plus size={16} /> Request Port
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/10 text-textMuted text-xs uppercase tracking-wider">
                                        <th className="pb-3 pl-4 font-semibold">IP Address</th>
                                        <th className="pb-3 p-4 font-semibold">Port</th>
                                        <th className="pb-3 p-4 font-semibold">Alias (Hostname)</th>
                                        <th className="pb-3 p-4 font-semibold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {allocations.map((a, i) => (
                                        <tr key={i} className={`border-b border-white/5 hover:bg-white/[0.02] transition-colors group ${a.isDefault ? 'bg-primary/5' : ''}`}>
                                            <td className="p-4 font-mono text-sm text-white">
                                                {a.ip}
                                                {a.isDefault && <span className="ml-3 text-[10px] bg-primary/20 text-primary border border-primary/30 px-2 py-0.5 rounded-full uppercase tracking-widest font-bold">Primary</span>}
                                            </td>
                                            <td className="p-4 font-mono text-white text-sm">{a.port}</td>
                                            <td className="p-4">
                                                {a.alias ? (
                                                    <span className="bg-surface border border-white/10 text-white px-3 py-1 rounded-lg text-sm">{a.alias}</span>
                                                ) : (
                                                    <span className="text-textMuted text-sm italic">None</span>
                                                )}
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {!a.isDefault && <button onClick={() => toast.success('Allocation marked as primary')} className="text-xs border border-primary/50 text-primary hover:bg-primary hover:text-white px-3 py-1 rounded-lg transition-colors font-semibold">Make Primary</button>}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'firewall' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-panel p-6 rounded-3xl border border-danger/20">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-2"><ShieldAlert className="text-danger" /> Firewall</h2>
                            <button onClick={() => toast.success('Rule modal opened')} className="flex items-center gap-2 bg-danger hover:bg-red-500 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-danger/20">
                                <Plus size={16} /> Add Rule
                            </button>
                        </div>
                        <div className="text-center py-12 text-textMuted">
                            <ShieldAlert className="w-12 h-12 text-danger/30 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-white mb-2">No custom rules active</h3>
                            <p className="text-sm">By default, all outgoing traffic is allowed and incoming is blocked except for your active allocations.</p>
                        </div>
                    </motion.div>
                )}

            </div>
        </div>
    );
};

export default ServerPanel;
