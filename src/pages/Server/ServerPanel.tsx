import { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
    Terminal, Folder, Database, Calendar, Users, Archive,
    Globe, Settings, FileText, Download, Play, RotateCcw,
    Square, Skull, Cpu, MemoryStick, Activity
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

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

const mockStats = Array.from({ length: 20 }, (_, i) => ({
    time: i,
    cpu: Math.random() * 40 + 10,
    ram: Math.random() * 500 + 1000,
    netIn: Math.random() * 5 + 1,
    netOut: Math.random() * 20 + 5,
}));

const versionsData = {
    Paper: ['1.21.1', '1.21', '1.20.6', '1.20.4', '1.19.4', '1.18.2', '1.16.5', '1.8.8'],
    Vanilla: ['1.21.1', '1.20.6', '1.19.4', '1.18.2', '1.17.1', '1.12.2'],
    Purpur: ['1.21.1', '1.20.6', '1.20.4', '1.19.4'],
    Fabric: ['1.21.1', '1.20.6', '1.20.1', '1.19.4'],
    Forge: ['1.20.4', '1.20.1', '1.19.4', '1.16.5', '1.12.2'],
};

const ServerPanel = () => {
    const { id } = useParams();
    const [activeTab, setActiveTab] = useState('console');
    const [selectedSoftware, setSelectedSoftware] = useState<string | null>(null);
    const [selectedVersion, setSelectedVersion] = useState<string | null>(null);

    const tabs = [
        { id: 'console', label: 'Console', icon: Terminal },
        { id: 'files', label: 'Files', icon: Folder },
        { id: 'databases', label: 'Databases', icon: Database },
        { id: 'schedules', label: 'Schedules', icon: Calendar },
        { id: 'users', label: 'Users', icon: Users },
        { id: 'backups', label: 'Backups', icon: Archive },
        { id: 'network', label: 'Network', icon: Globe },
        { id: 'settings', label: 'Settings', icon: Settings },
        { id: 'activity', label: 'Activity', icon: FileText },
        { id: 'versions', label: 'Versions', icon: Download },
    ];

    return (
        <div className="flex-1 flex flex-col md:flex-row w-full max-w-[1400px] mx-auto px-4 md:px-8 py-8 h-full gap-8">

            {/* Sidebar Desktop */}
            <div className="w-56 flex-shrink-0 hidden md:flex flex-col gap-2 relative">
                <div className="glass-panel p-4 rounded-3xl sticky top-24">
                    <div className="mb-6 px-2">
                        <h1 className="text-xl font-bold text-white truncate" title={`Server ${id} `}>Survival SMP</h1>
                        <p className="text-xs text-textMuted font-mono bg-surface inline-block px-2 py-1 rounded mt-1">{id}</p>
                    </div>
                    <nav className="flex flex-col gap-1">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items - center gap - 3 px - 4 py - 2.5 rounded - xl transition - all font - medium text - sm ${activeTab === tab.id
                                        ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                        : 'text-textMuted hover:bg-white/5 hover:text-white'
                                    } `}
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
                            className={`flex items - center gap - 2 px - 4 py - 2 rounded - xl whitespace - nowrap text - sm font - medium transition - all ${activeTab === tab.id ? 'bg-primary text-white' : 'glass-panel text-textMuted'
                                } `}
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
                            <button className="flex-1 min-w-[120px] bg-secondary hover:bg-emerald-400 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-secondary/20 transition-all">
                                <Play size={18} /> Start
                            </button>
                            <button className="flex-1 min-w-[120px] bg-accent hover:bg-yellow-500 text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-accent/20 transition-all">
                                <RotateCcw size={18} /> Restart
                            </button>
                            <button className="flex-1 min-w-[120px] bg-surface border border-danger hover:bg-danger text-danger hover:text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all">
                                <Square size={18} /> Stop
                            </button>
                            <button className="flex-1 min-w-[120px] bg-danger hover:bg-red-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-danger/20 transition-all">
                                <Skull size={18} /> Kill
                            </button>
                        </div>

                        {/* Terminal Window */}
                        <div className="glass-panel rounded-2xl overflow-hidden border border-white/10 shadow-2xl flex flex-col h-[400px]">
                            <div className="bg-surface/80 px-4 py-2 border-b border-white/5 flex items-center gap-2">
                                <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-danger" /><div className="w-3 h-3 rounded-full bg-accent" /><div className="w-3 h-3 rounded-full bg-secondary" /></div>
                                <span className="text-xs text-textMuted font-mono ml-2">pl1.hoxen.one - root@{id}</span>
                            </div>
                            <div className="flex-1 bg-black p-4 overflow-y-auto font-mono text-sm leading-relaxed">
                                {mockLogs.map((log, i) => (
                                    <div key={i} className="text-gray-300">
                                        <span className="text-blue-400">{log.substring(0, 10)}</span>
                                        <span className={log.includes('INFO') ? 'text-green-400' : 'text-gray-300'}>{log.substring(10, 31)}</span>
                                        <span className="text-gray-100">{log.substring(31)}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="bg-surface border-t border-white/5 p-2">
                                <input type="text" placeholder="Type a command..." className="w-full bg-black/50 border border-white/10 rounded-lg py-2 px-3 outline-none focus:border-primary text-white font-mono text-sm" />
                            </div>
                        </div>

                        {/* Graphs */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="glass-panel p-5 rounded-2xl">
                                <div className="flex items-center gap-2 mb-4 text-white font-semibold"><Cpu size={18} className="text-primary" /> CPU Usage</div>
                                <div className="h-32">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={mockStats}>
                                            <Area type="monotone" dataKey="cpu" stroke="#6366f1" fillOpacity={0.2} fill="#6366f1" isAnimationActive={false} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                                <p className="text-center font-mono mt-2 text-sm">28.4% / 200%</p>
                            </div>
                            <div className="glass-panel p-5 rounded-2xl">
                                <div className="flex items-center gap-2 mb-4 text-white font-semibold"><MemoryStick size={18} className="text-accent" /> RAM Usage</div>
                                <div className="h-32">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={mockStats}>
                                            <Area type="monotone" dataKey="ram" stroke="#f59e0b" fillOpacity={0.2} fill="#f59e0b" isAnimationActive={false} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                                <p className="text-center font-mono mt-2 text-sm">1245 MB / 4096 MB</p>
                            </div>
                            <div className="glass-panel p-5 rounded-2xl">
                                <div className="flex items-center gap-2 mb-4 text-white font-semibold"><Activity size={18} className="text-secondary" /> Network (In/Out)</div>
                                <div className="h-32">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={mockStats}>
                                            <Area type="monotone" dataKey="netIn" stroke="#10b981" fillOpacity={0.2} fill="#10b981" isAnimationActive={false} />
                                            <Area type="monotone" dataKey="netOut" stroke="#ef4444" fillOpacity={0.2} fill="#ef4444" isAnimationActive={false} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                                <p className="text-center font-mono mt-2 text-sm flex gap-4 justify-center">
                                    <span className="text-secondary">↓ 3.2 MB/s</span> <span className="text-danger">↑ 14.5 MB/s</span>
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'settings' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                        <div className="glass-panel p-6 rounded-3xl">
                            <h2 className="text-xl font-bold text-white mb-6">SFTP Details</h2>

                            <div className="space-y-6">
                                <div className="bg-surface p-4 rounded-xl border border-white/5">
                                    <p className="text-xs text-textMuted uppercase tracking-wider font-semibold mb-1">Server Address</p>
                                    <div className="flex items-center justify-between">
                                        <p className="font-mono text-white select-all">sftp://pl1.hoxen.one:2022</p>
                                    </div>
                                </div>
                                <div className="bg-surface p-4 rounded-xl border border-white/5">
                                    <p className="text-xs text-textMuted uppercase tracking-wider font-semibold mb-1">Username</p>
                                    <div className="flex items-center justify-between">
                                        <p className="font-mono text-white select-all">xylos.{id}</p>
                                    </div>
                                </div>
                                <p className="text-sm text-textMuted">Your SFTP password is the same as the password you use to access this panel.</p>
                                <button className="bg-primary hover:bg-primaryHover text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-primary/20">Launch SFTP</button>
                            </div>
                        </div>

                        <div className="glass-panel p-6 rounded-3xl">
                            <h2 className="text-xl font-bold text-white mb-6">Debug Information</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-surface p-4 rounded-xl border border-white/5">
                                    <p className="text-xs text-textMuted uppercase tracking-wider font-semibold mb-1">Node</p>
                                    <p className="text-white font-medium">pl1.hoxen.one</p>
                                </div>
                                <div className="bg-surface p-4 rounded-xl border border-white/5">
                                    <p className="text-xs text-textMuted uppercase tracking-wider font-semibold mb-1">Server ID</p>
                                    <p className="text-white font-mono text-xs overflow-hidden text-ellipsis">{id}-24a0-40db-a9c8-6da68529d679</p>
                                </div>
                            </div>
                        </div>

                        <div className="glass-panel p-6 rounded-3xl border border-danger/20">
                            <h2 className="text-xl font-bold text-danger mb-2">Reinstall Server</h2>
                            <p className="text-textMuted text-sm mb-4">Reinstalling your server will stop it, and then re-run the installation script that initially set it up. <strong className="text-white">Some files may be deleted or modified during this process, please back up your data before continuing.</strong></p>
                            <button className="bg-danger hover:bg-red-500 text-white font-bold py-2.5 px-6 rounded-xl transition-colors shadow-lg shadow-danger/20">Reinstall Server</button>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'versions' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-panel p-6 rounded-3xl min-h-[500px]">
                        {!selectedSoftware && !selectedVersion && (
                            <>
                                <h2 className="text-2xl font-bold text-white mb-6">Software Versions</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {Object.keys(versionsData).map(software => (
                                        <button
                                            key={software}
                                            onClick={() => setSelectedSoftware(software)}
                                            className="bg-surface border border-white/5 hover:border-primary/50 hover:bg-white/5 p-6 rounded-2xl text-left transition-all group"
                                        >
                                            <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors">{software}</h3>
                                            <p className="text-sm text-textMuted mt-1">{versionsData[software as keyof typeof versionsData].length} Minecraft versions</p>
                                            <p className="text-xs text-textMuted mt-1 mb-0">{Math.floor(Math.random() * 5000 + 100)} Builds</p>
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}

                        {selectedSoftware && !selectedVersion && (
                            <>
                                <div className="flex items-center gap-4 mb-8">
                                    <button onClick={() => setSelectedSoftware(null)} className="text-textMuted hover:text-white px-4 py-2 bg-surface rounded-lg transition-colors">Go Back</button>
                                    <h2 className="text-2xl font-bold text-white">{selectedSoftware} Versions</h2>
                                </div>
                                <div className="space-y-2">
                                    {versionsData[selectedSoftware as keyof typeof versionsData].map(version => (
                                        <button
                                            key={version}
                                            onClick={() => setSelectedVersion(version)}
                                            className="w-full bg-surface border border-white/5 hover:bg-white/5 p-4 rounded-xl flex items-center justify-between transition-colors group"
                                        >
                                            <div>
                                                <span className="text-lg font-bold text-white block text-left group-hover:text-primary transition-colors">{version}</span>
                                                <span className="text-xs bg-secondary/20 text-secondary px-2 py-0.5 rounded font-mono font-semibold uppercase tracking-widest mt-1 inline-block">Release</span>
                                            </div>
                                            <div className="text-right text-sm text-textMuted">
                                                {Math.floor(Math.random() * 200 + 10)} Builds
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}

                        {selectedSoftware && selectedVersion && (
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold text-white">Install {selectedSoftware} {selectedVersion}</h2>
                                    <button onClick={() => setSelectedVersion(null)} className="text-textMuted hover:text-white">Cancel</button>
                                </div>

                                <div className="bg-surface border border-white/10 rounded-2xl p-6">
                                    <p className="font-mono text-sm text-textMuted mb-2 text-center bg-black/30 w-max mx-auto px-4 py-1 rounded-full border border-white/5">Build 130 [stable]</p>

                                    <div className="mt-8 mb-8 p-4 bg-danger/10 border border-danger/20 rounded-xl">
                                        <label className="flex items-start gap-3 cursor-pointer">
                                            <input type="checkbox" className="mt-1 w-5 h-5 rounded border-danger/30 text-danger bg-surface focus:ring-danger focus:ring-offset-surface" />
                                            <div>
                                                <span className="text-white font-bold block mb-1">Wipe Server Files</span>
                                                <span className="text-sm text-red-300 block">This will delete all files on your server before installing the new version. This cannot be undone.</span>
                                            </div>
                                        </label>
                                    </div>

                                    <button className="w-full bg-primary hover:bg-primaryHover text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/30 transition-all text-lg">
                                        Start Installation
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                )}

            </div>
        </div>
    );
};

export default ServerPanel;
