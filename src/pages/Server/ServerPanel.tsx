import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useParams, Link } from 'react-router-dom';
import {
    Terminal, Folder, Database, Calendar, Users, Archive,
    Globe, Settings, Download, Play, RotateCcw,
    Square, Skull, Cpu, MemoryStick, Activity, ShieldAlert,
    File, Plus, Trash2, Edit2, Lock, Clock, X, FilePlus, FolderPlus, Type
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { serverService } from '../../services/serverService';
import { ServerData } from '../../types/firebase';
import { cn } from '../../lib/utils';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

const STARTUP_SEQUENCE = [
    "[SERVER THREAD/INFO]: Starting maxen-host dedicated server instance...",
    "[SERVER THREAD/INFO]: Loading kernel and module bindings...",
    "[SERVER THREAD/INFO]: Acquiring local IP address and port bindings...",
    "[SERVER THREAD/INFO]: Starting environment pre-flight checks...",
    "[SERVER THREAD/INFO]: Pre-flight successful. Launching primary thread.",
    "[SERVER THREAD/INFO]: Generating keypair...",
    "[SERVER THREAD/INFO]: Starting service on *:25565",
    "[SERVER THREAD/INFO]: Initializing remote management protocols...",
    "[SERVER THREAD/INFO]: Preparing level \"world\"",
    "[SERVER THREAD/INFO]: Preparing start region for dimension minecraft:overworld",
    "[SERVER THREAD/INFO]: Time elapsed: 1845ms",
    "[SERVER THREAD/INFO]: Done (4.29s)! Type \"help\" or \"?\" for commands.",
];

// Stats are now generated dynamically via state

// Removed mock arrays

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
    const { user } = useAuthStore();
    const [activeTab, setActiveTab] = useState('console');

    // Remote State (from Firebase)
    const [serverData, setServerData] = useState<ServerData | null>(null);
    const [stats, setStats] = useState<{ time: number, cpu: number, ram: number, netIn: number, netOut: number }[]>(Array.from({ length: 20 }, (_, i) => ({ time: i, cpu: 0, ram: 0, netIn: 0, netOut: 0 })));
    const [logs, setLogs] = useState<{ message: string, type: 'INFO' | 'WARN' | 'ERROR', timestamp: number }[]>([]);

    // Local State
    const [isLoading, setIsLoading] = useState(true);
    const [selectedSoftware, setSelectedSoftware] = useState<string | null>(null);
    const [selectedVersion, setSelectedVersion] = useState<string | null>(null);
    const [wipeServer, setWipeServer] = useState(false);
    const [consoleInput, setConsoleInput] = useState("");
    const [serverNameInput, setServerNameInput] = useState("");
    const [allocations, setAllocations] = useState<any[]>([]);
    const [databases, setDatabases] = useState<any[]>([]);
    const [files, setFiles] = useState<any[]>([
        { name: 'server.jar', type: 'file', size: '42.1 MB', date: new Date().toISOString().split('T')[0] },
        { name: 'server.properties', type: 'file', size: '1.2 KB', date: new Date().toISOString().split('T')[0] },
        { name: 'eula.txt', type: 'file', size: '0.1 KB', date: new Date().toISOString().split('T')[0] },
    ]);
    const [schedules, setSchedules] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [backups, setBackups] = useState<any[]>([]);

    // File manager modals
    const [fileModal, setFileModal] = useState<{ type: 'create-file' | 'create-folder' | 'rename' | 'edit' | null, target?: any }>({ type: null });
    const [fileModalInput, setFileModalInput] = useState('');
    const [fileEditContent, setFileEditContent] = useState('');

    // Schedule creation modal
    const [scheduleModal, setScheduleModal] = useState(false);
    const [schedName, setSchedName] = useState('');
    const [schedCron, setSchedCron] = useState('');

    // Refs for simulation intervals
    const simulatorRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const startupSequenceRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const timeRef = useRef(0);
    const logsEndRef = useRef<HTMLDivElement>(null);

    // Initial Data Fetch
    useEffect(() => {
        if (!id) return;

        const unsubServer = serverService.subscribeToServer(id, (data) => {
            setServerData(data);
            if (data && serverNameInput === "") { // Only set initially so we don't overwrite typing
                setServerNameInput(data.name);
            }
            setIsLoading(false);
        });

        const unsubStats = serverService.subscribeToStats(id, (data) => {
            if (data) {
                // Keep the last 20 stat entries mapped by time
                const sortedStats = Object.values(data).sort((a, b) => a.time - b.time);
                let latest20 = sortedStats.slice(-20);

                // If there aren't 20 entries yet, pad with zeroes at the beginning to always keep the graph full width
                while (latest20.length < 20) {
                    latest20 = [{ time: (latest20[0]?.time || 0) - 1, cpu: 0, ram: 0, netIn: 0, netOut: 0 }, ...latest20];
                }

                setStats(latest20);
                timeRef.current = sortedStats[sortedStats.length - 1]?.time || 0;
            } else {
                setStats(Array.from({ length: 20 }, (_, i) => ({ time: i, cpu: 0, ram: 0, netIn: 0, netOut: 0 })));
                timeRef.current = 0;
            }
        });

        const unsubLogs = serverService.subscribeToLogs(id, (data) => {
            if (data) {
                setLogs(Object.values(data).sort((a, b) => a.timestamp - b.timestamp));
            } else {
                setLogs([]);
            }
        });

        return () => {
            unsubServer();
            unsubStats();
            unsubLogs();
            if (simulatorRef.current) clearInterval(simulatorRef.current);
            if (startupSequenceRef.current) clearInterval(startupSequenceRef.current);
        };
    }, [id]);

    // Auto-scroll console
    useEffect(() => {
        logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    // Graph & State Simulator Loop!
    // This effect acts as the "Server Hardware Simulator". If the server is not offline, it artificially generates CPU/RAM ticks and writes them to the DB.
    useEffect(() => {
        if (!id || !serverData) return;

        if (simulatorRef.current) clearInterval(simulatorRef.current);

        if (serverData.status === 'running' || serverData.status === 'starting' || serverData.status === 'stopping') {
            simulatorRef.current = setInterval(() => {
                timeRef.current++;
                let newStat;

                const currentSpecs = serverData.specs || { cpu: 1, ram: 1 };
                const maxRam = currentSpecs.ram * 1024; // MB
                const maxCpu = currentSpecs.cpu * 100;

                if (serverData.status === 'running') {
                    newStat = {
                        time: timeRef.current,
                        cpu: Math.min(maxCpu, Math.max(0, (stats[stats.length - 1]?.cpu || 5) + (Math.random() * 10 - 5))),
                        ram: Math.min(maxRam, Math.max(0, (stats[stats.length - 1]?.ram || (maxRam * 0.3)) + (Math.random() * 20 - 10))),
                        netIn: Math.random() * 2,
                        netOut: Math.random() * 5
                    };
                } else if (serverData.status === 'starting') {
                    newStat = {
                        time: timeRef.current,
                        cpu: maxCpu * (0.6 + Math.random() * 0.4), // Heavy CPU on start
                        ram: maxRam * (0.4 + Math.random() * 0.4), // Heavy RAM load on start
                        netIn: Math.random() * 15,
                        netOut: Math.random() * 25
                    };
                } else {
                    // Stopping
                    newStat = {
                        time: timeRef.current,
                        cpu: Math.max(0, (stats[stats.length - 1]?.cpu || 0) * 0.8), // Decaying CPU
                        ram: Math.max(0, (stats[stats.length - 1]?.ram || 0) * 0.8), // Decaying RAM
                        netIn: 0,
                        netOut: 0
                    };
                }

                serverService.pushServerStatTick(id, newStat);
            }, 1000);
        } else {
            // When offline, clear the backend stats buffer to "reset" the graph for the next boot.
            // Using a debounce/timeout here could be safer, but for simulation, we wipe stats when truly offline.
            // (We will skip actually deleting the stats history here so the graph freezes nicely instead of drawing blank)
        }

        return () => {
            if (simulatorRef.current) clearInterval(simulatorRef.current);
        };
    }, [id, serverData?.status, serverData?.specs]);


    const handleStart = async () => {
        if (!id || !serverData || serverData.status !== 'offline') return;
        toast.success('Starting server...');
        await serverService.deleteServerStats(id); // Clean previous run's graphs
        await serverService.updateServerStatus(id, 'starting');
        await serverService.pushServerLog(id, "Server marked as STARTING by user.", 'INFO');

        let step = 0;
        if (startupSequenceRef.current) clearInterval(startupSequenceRef.current);

        // Simulate Startup Sequence Logs
        startupSequenceRef.current = setInterval(async () => {
            if (step < STARTUP_SEQUENCE.length) {
                await serverService.pushServerLog(id, STARTUP_SEQUENCE[step], 'INFO');
                step++;
            } else {
                if (startupSequenceRef.current) clearInterval(startupSequenceRef.current);
                // Important: Verify it's STILL starting (wasn't killed mid-boot) before marking as running
                serverService.subscribeToServer(id, async (freshData) => {
                    if (freshData && freshData.status === 'starting') {
                        await serverService.updateServerStatus(id, 'running');
                        toast.success('Server is online!', { icon: '🚀' });
                    }
                })(); // immediately execute and unsub
            }
        }, 800);
    };

    const handleGracefulStop = async () => {
        if (!id || !serverData || serverData.status === 'offline' || serverData.status === 'stopping') return;
        toast('Sending graceful stop command...', { icon: '🛑' });
        await serverService.updateServerStatus(id, 'stopping');
        await serverService.pushServerLog(id, "Server marked as STOPPING by user. Issuing SIGINT...", 'WARN');

        setTimeout(async () => {
            // If it hasn't been killed manually, mark as offline after 5 seconds
            serverService.subscribeToServer(id, async (freshData) => {
                if (freshData && freshData.status === 'stopping') {
                    await serverService.updateServerStatus(id, 'offline');
                    await serverService.pushServerLog(id, "Server shutdown successfully.", 'INFO');
                    toast.success('Server offline');
                }
            })(); // immediately execute and unsub
        }, 5000);
    };

    const handleRestart = async () => {
        toast('Restarting server...', { icon: '🔄' });
        await handleGracefulStop();
        // Wait for it to die, then start. 6 seconds covers the 5s stop timer.
        setTimeout(() => {
            handleStart();
        }, 6000);
    };

    const handleKill = async () => {
        if (!id || !serverData || serverData.status === 'offline') return;
        toast.error('Process killed ungracefully.');

        if (startupSequenceRef.current) clearInterval(startupSequenceRef.current);
        await serverService.updateServerStatus(id, 'offline');
        await serverService.pushServerLog(id, "PROCESS TERMINATED UNGRACEFULLY (SIGKILL 9).", 'ERROR');
    };

    const formatTimestamp = (ts: number) => {
        const d = new Date(ts);
        return `[${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}]`;
    };

    const submitCommand = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!consoleInput.trim() || !id || serverData?.status !== 'running') return;

        await serverService.pushServerLog(id, `> ${consoleInput}`, 'INFO');
        setConsoleInput('');

        // Simulate some fake command responses
        setTimeout(async () => {
            await serverService.pushServerLog(id, `Unknown command or syntax error. Type "help" for a list.`, 'WARN');
        }, 200);
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

    const content = (
        <div className="flex-1 flex flex-col w-full max-w-7xl mx-auto px-4 md:px-0 py-6 h-full gap-6">

            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-4 border-b border-border">
                <div className="flex flex-col gap-1">
                    <Link to="/dashboard" className="text-xs text-muted-foreground hover:text-foreground transition-colors font-medium mb-1">← Back to Servers</Link>
                    {isLoading ? (
                        <div className="animate-pulse space-y-2">
                            <div className="h-7 bg-surface rounded w-64"></div>
                            <div className="h-4 bg-surface rounded w-32"></div>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-bold text-foreground tracking-tight">{serverData?.name || 'Loading...'}</h1>
                                <div className={cn(
                                    "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                                    serverData?.status === 'running' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                                        serverData?.status === 'starting' || serverData?.status === 'stopping' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20 animate-pulse' :
                                            'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                                )}>
                                    {serverData?.status || 'offline'}
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground font-mono">{id}</p>
                        </>
                    )}
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto no-scrollbar pb-1 md:pb-0">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap border border-transparent outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                                activeTab === tab.id
                                    ? "bg-surface text-foreground border-border shadow-sm"
                                    : "text-muted-foreground hover:text-foreground hover:bg-surface-hover"
                            )}
                        >
                            <tab.icon size={14} className={cn(activeTab === tab.id ? "text-foreground" : "text-muted-foreground opacity-70")} />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {activeTab === 'console' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="space-y-6">

                        {/* Top Controls & Specs Row */}
                        <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
                            <div className="flex flex-wrap items-center gap-2">
                                <Button
                                    onClick={handleStart}
                                    disabled={isLoading || serverData?.status !== 'offline'}
                                    className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white min-w-[100px]"
                                >
                                    <Play size={16} /> Start
                                </Button>
                                <Button
                                    onClick={handleRestart}
                                    disabled={isLoading || serverData?.status === 'offline'}
                                    variant="secondary"
                                    className="gap-2 min-w-[100px]"
                                >
                                    <RotateCcw size={16} /> Restart
                                </Button>
                                <Button
                                    onClick={handleGracefulStop}
                                    disabled={isLoading || serverData?.status === 'offline' || serverData?.status === 'stopping'}
                                    variant="outline"
                                    className="gap-2 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 min-w-[100px]"
                                >
                                    {serverData?.status === 'stopping' ? `Stopping...` : <><Square size={16} /> Stop</>}
                                </Button>
                                <Button
                                    onClick={handleKill}
                                    disabled={isLoading || serverData?.status === 'offline'}
                                    variant="danger"
                                    className="gap-2 min-w-[100px]"
                                >
                                    <Skull size={16} /> Kill
                                </Button>
                            </div>

                            <div className="flex items-center gap-4 text-sm bg-surface py-1.5 px-3 rounded-md border border-border">
                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                    <span className="font-semibold text-foreground">Node:</span> <span className="font-mono">{serverData?.node || 'node-01'}</span>
                                </div>
                                <div className="h-4 w-px bg-border" />
                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                    <span className="font-semibold text-foreground">IP:</span> <span className="font-mono select-all">192.168.1.100:25565</span>
                                </div>
                            </div>
                        </div>

                        {/* Terminal Window */}
                        <div className="bg-zinc-950 border border-border shadow-sm rounded-lg overflow-hidden flex flex-col h-[450px]">
                            <div className="bg-surface border-b border-border px-4 py-2 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Terminal size={14} className="text-muted-foreground" />
                                    <span className="text-xs font-mono text-muted-foreground">Console Output</span>
                                </div>
                                {serverData?.status === 'stopping' && (
                                    <span className="text-xs font-mono text-amber-500 animate-pulse">Graceful Shutdown in Progress...</span>
                                )}
                            </div>
                            <div className="flex-1 p-4 overflow-y-auto font-mono text-sm leading-relaxed scroll-smooth scrollbar-thin flex flex-col justify-start">
                                <div>
                                    {logs.length === 0 && <div className="text-muted-foreground italic">Server is offline. Press Start to boot.</div>}
                                    {logs.map((log, i) => (
                                        <div key={i} className="text-zinc-300">
                                            <span className="text-blue-400/80 mr-2">{formatTimestamp(log.timestamp)}</span>
                                            <span className={log.type === 'INFO' ? 'text-zinc-300' : log.type === 'ERROR' ? 'text-rose-400' : 'text-amber-400'}>{log.message}</span>
                                        </div>
                                    ))}
                                    <div ref={logsEndRef} />
                                </div>
                            </div>
                            <div className="border-t border-border bg-surface p-2">
                                <form onSubmit={submitCommand} className="relative">
                                    <Terminal size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        type="text"
                                        value={consoleInput}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConsoleInput(e.target.value)}
                                        placeholder={serverData?.status === 'running' ? "Execute a command..." : "Server must be running to execute commands"}
                                        disabled={serverData?.status !== 'running'}
                                        className="w-full pl-9 h-9 font-mono text-sm bg-background border-none shadow-none focus-visible:ring-0"
                                    />
                                </form>
                            </div>
                        </div>

                        {/* Graphs */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="bg-surface border border-border shadow-sm p-4 rounded-lg flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center gap-1.5 text-foreground font-semibold text-sm">
                                            <Cpu size={14} className="text-muted-foreground" /> CPU Load
                                        </div>
                                        <span className="font-mono text-sm font-bold text-foreground">{stats[19]?.cpu.toFixed(1) || 0}%</span>
                                    </div>
                                    <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mb-4">
                                        {serverData?.specs?.cpu || '--'} Cores Limit
                                    </div>
                                </div>
                                <div className="h-16 -mx-2 -mb-2 mt-auto">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={stats}>
                                            <Area type="monotone" dataKey="cpu" stroke="currentColor" className="text-blue-500" strokeWidth={2} fillOpacity={0.1} fill="currentColor" isAnimationActive={false} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="bg-surface border border-border shadow-sm p-4 rounded-lg flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center gap-1.5 text-foreground font-semibold text-sm">
                                            <MemoryStick size={14} className="text-muted-foreground" /> Memory
                                        </div>
                                        <span className="font-mono text-sm font-bold text-foreground">{stats[19]?.ram.toFixed(0) || 0} MB</span>
                                    </div>
                                    <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mb-4">
                                        {serverData?.specs?.ram ? serverData.specs.ram * 1024 : '--'} MB Allocated
                                    </div>
                                </div>
                                <div className="h-16 -mx-2 -mb-2 mt-auto">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={stats}>
                                            <Area type="monotone" dataKey="ram" stroke="currentColor" className="text-purple-500" strokeWidth={2} fillOpacity={0.1} fill="currentColor" isAnimationActive={false} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="bg-surface border border-border shadow-sm p-4 rounded-lg flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center gap-1.5 text-foreground font-semibold text-sm">
                                            <Activity size={14} className="text-muted-foreground" /> Network Out
                                        </div>
                                        <span className="font-mono text-sm font-bold text-foreground">{stats[19]?.netOut?.toFixed(1) || 0} MB/s</span>
                                    </div>
                                    <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mb-4">
                                        Traffic
                                    </div>
                                </div>
                                <div className="h-16 -mx-2 -mb-2 mt-auto">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={stats}>
                                            <Area type="monotone" dataKey="netOut" stroke="currentColor" className="text-emerald-500" strokeWidth={2} fillOpacity={0.1} fill="currentColor" isAnimationActive={false} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'settings' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                        <div className="bg-surface border border-border shadow-sm p-8 rounded-lg">
                            <h2 className="text-2xl font-bold text-foreground mb-6">Settings</h2>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-bold text-foreground mb-4">SFTP Details</h3>
                                        <div className="space-y-4">
                                            <div className="bg-surface p-4 rounded-lg border border-border">
                                                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Server Address</p>
                                                <div className="font-mono text-foreground select-all text-sm">sftp://{serverData?.node || 'pl1.hoxen.one'}:{serverData?.settings?.sftpPort || 2022}</div>
                                            </div>
                                            <div className="bg-surface p-4 rounded-lg border border-border">
                                                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Username</p>
                                                <div className="font-mono text-foreground select-all text-sm">{user?.email?.split('@')[0] || 'admin'}.{id?.substring(0, 8)}</div>
                                            </div>
                                            <p className="text-sm text-muted-foreground">Your SFTP password is the same as the password you use to access this panel.</p>
                                            <Button onClick={() => toast("SFTP connection attempted", { icon: "🔌" })} className="w-full md:w-auto">Launch SFTP</Button>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-bold text-foreground mb-4">Change Server Details</h3>
                                        <div className="space-y-4">
                                            <div className="bg-surface p-4 rounded-lg border border-border">
                                                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-2">Server Name</p>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={serverNameInput}
                                                        onChange={(e) => setServerNameInput(e.target.value)}
                                                        className="w-full bg-background border border-border rounded-lg py-2 px-3 outline-none focus:border-primary text-foreground text-sm"
                                                    />
                                                    <button
                                                        onClick={async () => {
                                                            if (!id || !serverNameInput.trim()) return;
                                                            await serverService.updateServerName(id, serverNameInput.trim());
                                                            await serverService.pushServerLog(id, `Server rename: ${serverNameInput}`, 'INFO');
                                                            toast.success("Server renamed successfully.");
                                                        }}
                                                        disabled={serverNameInput === serverData?.name || !serverNameInput.trim()}
                                                        className="bg-surface hover:bg-surface-hover text-foreground border border-border px-4 py-2 rounded-lg font-medium transition-colors text-sm whitespace-nowrap disabled:opacity-50"
                                                    >
                                                        Save
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-bold text-foreground mb-4">Debug Information</h3>
                                        <div className="space-y-4">
                                            <div className="bg-surface p-4 rounded-lg border border-border">
                                                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Node</p>
                                                <p className="text-foreground font-medium text-sm">{serverData?.node || 'pl1.hoxen.one'}</p>
                                            </div>
                                            <div className="bg-surface p-4 rounded-lg border border-border flex flex-col">
                                                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Server ID / UUID</p>
                                                <p className="text-foreground font-mono text-xs overflow-hidden text-ellipsis select-all">{id}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-bold text-foreground mb-4">Danger Zone</h3>
                                        <div className="bg-danger/10 p-6 rounded-xl border border-danger/20">
                                            <h4 className="font-bold text-danger mb-2">Reinstall Server</h4>
                                            <p className="text-sm text-muted-foreground mb-4">Reinstalling your server will stop it, and then re-run the installation script that initially set it up. <strong className="text-foreground">Some files may be deleted or modified during this process, please back up your data before continuing.</strong></p>
                                            <button
                                                onClick={() => {
                                                    if (window.confirm("Are you SURE you want to reinstall? This might delete data.")) {
                                                        toast.success("Reinstallation sequence initiated...");
                                                        serverService.updateServerStatus(id!, 'stopping');
                                                        serverService.pushServerLog(id!, "System Reinstall Command Issued.", 'WARN');
                                                    }
                                                }}
                                                className="bg-danger hover:bg-red-500 text-white font-bold py-2.5 px-6 rounded-lg transition-colors"
                                            >
                                                Reinstall Server
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'versions' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-surface border border-border shadow-sm p-6 md:p-8 rounded-lg min-h-[600px]">

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
                                        <h2 className="text-2xl font-bold text-foreground mb-2">Software Versions Installer</h2>
                                        <p className="text-muted-foreground">Install or update your server software from our extensive pre-configured list.</p>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {Object.keys(versionsData).map(software => (
                                            <button
                                                key={software}
                                                onClick={() => setSelectedSoftware(software)}
                                                className="bg-surface border border-border hover:border-primary/50 hover:bg-primary/5 p-6 rounded-lg text-left transition-all group relative overflow-hidden"
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                                <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors relative z-10">{software}</h3>
                                                <p className="text-sm text-muted-foreground mt-1 relative z-10">{versionsData[software as keyof typeof versionsData].length} Game Versions</p>
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
                                        <button onClick={() => setSelectedSoftware(null)} className="text-muted-foreground hover:text-foreground p-2.5 bg-surface rounded-lg transition-colors border border-border hover:border-foreground/20">
                                            <span className="sr-only">Go Back</span>
                                            ←
                                        </button>
                                        <div>
                                            <h2 className="text-2xl font-bold text-foreground">{selectedSoftware}</h2>
                                            <p className="text-sm text-muted-foreground">Select a game version to continue</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-4xl">
                                        {versionsData[selectedSoftware as keyof typeof versionsData].map(version => (
                                            <button
                                                key={version}
                                                onClick={() => setSelectedVersion(version)}
                                                className="w-full bg-surface border border-border hover:border-primary/30 p-4 rounded-lg flex items-center justify-between transition-colors group"
                                            >
                                                <div>
                                                    <span className="text-lg font-bold text-foreground block text-left group-hover:text-primary transition-colors">{version}</span>
                                                </div>
                                                <div className="text-right flex flex-col items-end gap-1">
                                                    <span className="text-[10px] bg-secondary/10 text-secondary border border-secondary/20 px-2 py-0.5 rounded font-mono font-semibold uppercase tracking-widest">Release</span>
                                                    <span className="text-xs text-muted-foreground">Latest build available</span>
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
                                        <h2 className="text-3xl font-bold text-foreground mb-2">Install {selectedSoftware} <span className="text-primary">{selectedVersion}</span></h2>
                                        <p className="text-muted-foreground">You are about to modify your server's core jar file.</p>
                                    </div>

                                    <div className="bg-surface border border-border rounded-lg p-8 relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent" />

                                        <div className="flex justify-between items-center py-4 border-b border-border mb-6">
                                            <span className="text-muted-foreground">Target Build</span>
                                            <span className="font-mono text-sm font-bold text-foreground bg-surface px-3 py-1 rounded-lg border border-border">{generateBuildName()}</span>
                                        </div>

                                        <div className="mb-8 p-5 bg-danger/10 border border-danger/20 rounded-lg relative overflow-hidden group">
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
                                                    <span className="text-foreground font-bold block mb-1 text-lg">Wipe Server Files</span>
                                                    <span className="text-sm text-red-200/80 block leading-relaxed">Checking this box will completely format your server directory, deleting world data, plugins, and configurations. This cannot be undone.</span>
                                                </div>
                                            </label>
                                        </div>

                                        <div className="flex gap-4">
                                            <button
                                                onClick={() => setSelectedVersion(null)}
                                                className="flex-1 bg-surface hover:bg-surface-hover border border-border text-foreground font-bold py-4 rounded-lg transition-all"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={async () => {
                                                    toast.success(`Installing ${selectedSoftware} ${selectedVersion} sequence initiated. Restarting server...`);

                                                    if (id) {
                                                        await serverService.pushServerLog(id, `Started installation of ${selectedSoftware} ${selectedVersion} ${wipeServer ? '(with Server Wipe)' : ''}`, 'WARN');
                                                        await serverService.updateServerStatus(id, 'stopping');
                                                    }

                                                    setTimeout(async () => {
                                                        if (id) {
                                                            await serverService.updateServerStatus(id, 'offline');
                                                            // Provide a brief pause before returning to console
                                                        }
                                                        setSelectedVersion(null);
                                                        setWipeServer(false);
                                                        setActiveTab('console'); // Go back to console to watch it boot
                                                    }, 2000);
                                                }}
                                                className="flex-[2] bg-primary hover:bg-primary-hover text-white font-bold py-4 rounded-lg transition-all text-lg flex justify-center items-center gap-2">
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
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-surface border border-border shadow-sm p-6 rounded-lg">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                            <div>
                                <h2 className="text-xl font-bold text-foreground mb-1">File Manager</h2>
                                <p className="text-xs text-muted-foreground font-mono bg-background border border-border py-1 px-2 rounded-md inline-block">/home/container</p>
                            </div>
                            <div className="flex gap-2 w-full md:w-auto">
                                <Button variant="outline" size="sm" className="flex-1 md:flex-none gap-1" onClick={() => { setFileModal({ type: 'create-file' }); setFileModalInput(''); }}><FilePlus size={14} /> New File</Button>
                                <Button variant="outline" size="sm" className="flex-1 md:flex-none gap-1" onClick={() => { setFileModal({ type: 'create-folder' }); setFileModalInput(''); }}><FolderPlus size={14} /> New Folder</Button>
                                <Button size="sm" className="flex-1 md:flex-none" onClick={() => toast.success('Upload dialog opened')}>Upload</Button>
                            </div>
                        </div>
                        <div className="overflow-x-auto border border-border rounded-lg bg-background">
                            <table className="w-full text-left border-collapse text-sm">
                                <thead>
                                    <tr className="border-b border-border bg-surface text-muted-foreground uppercase tracking-wider text-xs">
                                        <th className="py-3 px-4 font-semibold w-[60%]">Name</th>
                                        <th className="py-3 px-4 font-semibold">Size</th>
                                        <th className="py-3 px-4 font-semibold hidden md:table-cell">Last Modified</th>
                                        <th className="py-3 px-4 font-semibold text-right"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {files.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="p-8 text-center text-muted-foreground text-sm">No files found.</td>
                                        </tr>
                                    ) : files.map((f, i) => (
                                        <tr key={i} className="border-b border-border hover:bg-surface transition-colors group">
                                            <td className="p-3 px-4 flex items-center gap-3 cursor-pointer" onClick={() => f.type === 'folder' ? toast(`Opened folder: ${f.name}`, { icon: '📂' }) : (() => { setFileModal({ type: 'edit', target: f }); setFileEditContent(`# ${f.name}\n\n// File content simulation\n// Edit this text and click Save`); })()}>
                                                {f.type === 'folder' ? <Folder size={16} className="text-blue-500" /> : <File size={16} className="text-muted-foreground" />}
                                                <span className="font-medium text-foreground hover:text-primary transition-colors">{f.name}</span>
                                            </td>
                                            <td className="p-3 px-4 text-muted-foreground">{f.size}</td>
                                            <td className="p-3 px-4 text-muted-foreground hidden md:table-cell">{f.date}</td>
                                            <td className="p-3 px-4 text-right">
                                                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setFileModal({ type: 'rename', target: f }); setFileModalInput(f.name); }} className="h-8 w-8" title="Rename"><Type size={14} /></Button>
                                                    {f.type === 'file' && <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setFileModal({ type: 'edit', target: f }); setFileEditContent(`# ${f.name}\n\n// File content simulation\n// Edit this text and click Save`); }} className="h-8 w-8" title="Edit"><Edit2 size={14} /></Button>}
                                                    <Button variant="ghost" size="icon" onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (window.confirm(`Delete "${f.name}"? This cannot be undone.`)) {
                                                            setFiles(prev => prev.filter(x => x.name !== f.name));
                                                            toast.success(`Deleted ${f.name}`);
                                                        }
                                                    }} className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10" title="Delete"><Trash2 size={14} /></Button>
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
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-surface border border-border shadow-sm p-6 rounded-lg">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-foreground">Databases</h2>
                            <Button size="sm" onClick={() => {
                                const dbName = prompt('Database Name:');
                                if (dbName) {
                                    setDatabases(prev => [...prev, { name: dbName, host: 'db2.hoxen.one', username: `u${Math.floor(Math.random() * 1000)}_db`, size: '0 MB' }]);
                                    toast.success('Database created');
                                }
                            }} className="gap-2">
                                <Plus size={16} /> New Database
                            </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {databases.length === 0 ? (
                                <div className="col-span-full py-8 text-center text-muted-foreground text-sm border border-border border-dashed rounded-lg bg-background">
                                    No databases created yet.
                                </div>
                            ) : databases.map((db, i) => (
                                <div key={i} className="bg-background border border-border p-5 rounded-lg relative group hover:border-primary/20 transition-all flex flex-col">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-md bg-surface border border-border flex items-center justify-center text-foreground">
                                                <Database size={18} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-foreground text-base tracking-tight">{db.name}</h3>
                                                <span className="text-[10px] text-emerald-500 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 uppercase tracking-widest font-bold">Active</span>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={() => {
                                            setDatabases(prev => prev.filter(x => x.name !== db.name));
                                            toast.success('Database deleted');
                                        }} className="text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14} /></Button>
                                    </div>
                                    <div className="space-y-3 font-mono text-xs flex-1">
                                        <div className="flex justify-between border-b border-border pb-2">
                                            <span className="text-muted-foreground font-sans uppercase tracking-wider font-semibold text-[10px]">Host</span>
                                            <span className="text-foreground select-all">{db.host}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-border pb-2">
                                            <span className="text-muted-foreground font-sans uppercase tracking-wider font-semibold text-[10px]">Username</span>
                                            <span className="text-foreground select-all">{db.username}</span>
                                        </div>
                                        <div className="flex justify-between pt-1">
                                            <span className="text-muted-foreground font-sans uppercase tracking-wider font-semibold text-[10px]">Size</span>
                                            <span className="text-foreground">{db.size}</span>
                                        </div>
                                    </div>
                                    <Button variant="outline" onClick={() => toast.success(`Revealed password for ${db.name}: hunter2`)} className="w-full mt-5 gap-2 h-9 text-xs">
                                        <Lock size={12} /> Reveal Password
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {activeTab === 'schedules' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-surface border border-border shadow-sm p-6 rounded-lg">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-foreground">Schedules & Cron</h2>
                            <Button size="sm" onClick={() => { setScheduleModal(true); setSchedName(''); setSchedCron(''); }} className="gap-2">
                                <Plus size={16} /> Create Schedule
                            </Button>
                        </div>
                        <div className="space-y-3">
                            {schedules.length === 0 ? (
                                <div className="py-8 text-center text-muted-foreground text-sm border border-border border-dashed rounded-lg bg-background">
                                    No schedules configured.
                                </div>
                            ) : schedules.map((s, i) => (
                                <div key={i} className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 bg-background border border-border hover:border-primary/20 rounded-lg transition-all group">
                                    <div className="flex items-center gap-4 mb-4 md:mb-0">
                                        <div className="w-10 h-10 rounded-md bg-surface flex items-center justify-center text-primary border border-border">
                                            <Clock size={18} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-foreground text-sm">{s.name}</h3>
                                            <p className="text-xs text-muted-foreground mt-0.5">Executes: <span className="font-mono bg-surface border border-border px-1.5 py-0.5 rounded text-foreground">{s.cron}</span></p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                                        <div className="text-right">
                                            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Next Run</p>
                                            <p className="font-medium text-sm text-amber-500">{s.next}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button variant="outline" size="sm">Edit</Button>
                                            <Button variant="ghost" size="icon" onClick={() => {
                                                setSchedules(prev => prev.filter(x => x.name !== s.name));
                                                toast.success('Schedule removed');
                                            }} className="h-9 w-9 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"><Trash2 size={14} /></Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {activeTab === 'users' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-surface border border-border shadow-sm p-6 rounded-lg">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-foreground">Subusers</h2>
                            <Button size="sm" onClick={() => toast.success('Invite link copied to clipboard!')} className="gap-2">
                                <Plus size={16} /> Invite User
                            </Button>
                        </div>
                        <div className="space-y-3">
                            {users.length === 0 ? (
                                <div className="py-8 text-center text-muted-foreground text-sm border border-border border-dashed rounded-lg bg-background">
                                    No subusers added yet.
                                </div>
                            ) : users.map((u, i) => (
                                <div key={i} className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 bg-background border border-border rounded-lg transition-all group">
                                    <div className="flex items-center gap-4 mb-4 md:mb-0">
                                        <div className="hidden md:flex w-10 h-10 rounded-md bg-surface items-center justify-center text-muted-foreground border border-border">
                                            <Users size={18} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-foreground text-sm mb-1 flex items-center gap-2">
                                                {u.email}
                                                {u['2fa'] && <span className="text-[10px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded uppercase tracking-widest font-bold flex items-center gap-1"><ShieldAlert size={10} /> 2FA setup</span>}
                                            </h3>
                                            <div className="flex gap-1.5 flex-wrap">
                                                {u.perms?.map((p: string) => <span key={p} className="text-[10px] font-mono font-medium text-foreground bg-surface border border-border px-1.5 py-0.5 rounded">{p}</span>)}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                                        <Button variant="outline" size="sm">Manage Roles</Button>
                                        <Button variant="ghost" size="icon" onClick={() => {
                                            setUsers(prev => prev.filter(x => x.email !== u.email));
                                            toast.success('User removed');
                                        }} className="h-9 w-9 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"><Trash2 size={14} /></Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {activeTab === 'backups' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-surface border border-border shadow-sm p-6 rounded-lg">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-foreground mb-1">Backups</h2>
                                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Limit: <span className="text-foreground">1 / 3</span> backups</p>
                            </div>
                            <Button size="sm" className="gap-2">
                                <Archive size={16} /> Create Backup
                            </Button>
                        </div>
                        <div className="space-y-3">
                            {backups.length === 0 ? (
                                <div className="py-8 text-center text-muted-foreground text-sm border border-border border-dashed rounded-lg bg-background">
                                    No backups exist for this instance.
                                </div>
                            ) : backups.map((b, i) => (
                                <div key={i} className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 bg-background border border-border hover:border-primary/20 rounded-lg transition-all group">
                                    <div className="flex items-center gap-4 mb-4 md:mb-0">
                                        <div className="w-10 h-10 rounded-md bg-surface flex items-center justify-center text-primary border border-border">
                                            <Archive size={18} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-foreground text-sm flex items-center gap-2">{b.name} <span className="text-[10px] text-muted-foreground font-mono bg-surface border border-border px-1.5 py-0.5 rounded font-normal">{b.size}</span></h3>
                                            <p className="text-xs text-muted-foreground mt-0.5">{b.date}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                                        <span className="text-[10px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-1 rounded font-bold uppercase tracking-widest mr-2">{b.status}</span>
                                        <Button variant="outline" size="icon" onClick={() => toast.success('Downloading backup...')} className="h-9 w-9"><Download size={14} /></Button>
                                        <Button variant="outline" size="icon" onClick={() => toast.success('Restoring backup...')} className="h-9 w-9" title="Restore"><RotateCcw size={14} /></Button>
                                        <Button variant="ghost" size="icon" onClick={() => {
                                            setBackups(prev => prev.filter(x => x.name !== b.name));
                                            toast.success('Backup deleted');
                                        }} className="h-9 w-9 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"><Trash2 size={14} /></Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {activeTab === 'network' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-surface border border-border shadow-sm p-6 rounded-lg">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-foreground">Network Allocations</h2>
                            <Button variant="outline" size="sm" onClick={() => {
                                setAllocations(prev => [...prev, { ip: '192.168.1.100', port: Math.floor(Math.random() * 50000 + 10000), isDefault: false, alias: '' }]);
                                toast.success('Port requested and currently provisioning');
                            }} className="gap-2">
                                <Plus size={16} /> Request Port
                            </Button>
                        </div>
                        <div className="overflow-x-auto border border-border rounded-lg bg-background">
                            <table className="w-full text-left border-collapse text-sm">
                                <thead>
                                    <tr className="border-b border-border bg-surface text-muted-foreground uppercase tracking-wider text-xs">
                                        <th className="py-3 px-4 font-semibold">IP Address</th>
                                        <th className="py-3 px-4 font-semibold">Port</th>
                                        <th className="py-3 px-4 font-semibold">Alias (Hostname)</th>
                                        <th className="py-3 px-4 font-semibold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {allocations.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="p-8 text-center text-muted-foreground text-sm">No allocations found. Start your server to allocate ports.</td>
                                        </tr>
                                    ) : allocations.map((a, i) => (
                                        <tr key={i} className={`border-b border-border hover:bg-surface transition-colors group ${a.isDefault ? 'bg-primary/5' : ''}`}>
                                            <td className="p-3 px-4 font-mono text-sm text-foreground">
                                                {a.ip}
                                                {a.isDefault && <span className="ml-3 text-[10px] bg-primary/20 text-primary border border-primary/30 px-2 py-0.5 rounded font-bold uppercase tracking-widest">Primary</span>}
                                            </td>
                                            <td className="p-3 px-4 font-mono text-foreground text-sm">{a.port}</td>
                                            <td className="p-3 px-4">
                                                {a.alias ? (
                                                    <span className="font-mono text-xs bg-background border border-border text-foreground px-2 py-1 rounded">{a.alias}</span>
                                                ) : (
                                                    <span className="text-muted-foreground text-xs italic">None</span>
                                                )}
                                            </td>
                                            <td className="p-3 px-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {!a.isDefault && <Button variant="outline" size="sm" onClick={() => toast.success('Allocation marked as primary')} className="h-8 text-xs">Make Primary</Button>}
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
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-surface border border-danger/20 shadow-sm p-6 rounded-lg">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2"><ShieldAlert className="text-danger" /> Firewall</h2>
                            <Button variant="danger" onClick={() => toast.success('Rule modal opened')} className="gap-2">
                                <Plus size={16} /> Add Rule
                            </Button>
                        </div>
                        <div className="text-center py-12 text-muted-foreground">
                            <ShieldAlert className="w-12 h-12 text-danger/30 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-foreground mb-2">No custom rules active</h3>
                            <p className="text-sm">By default, all outgoing traffic is allowed and incoming is blocked except for your active allocations.</p>
                        </div>
                    </motion.div>
                )}

            </div>
        </div>
    );

    // Modals rendered via portal-style at the end
    const modals = (
        <AnimatePresence>
            {fileModal.type && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setFileModal({ type: null })}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-background w-full max-w-lg rounded-lg border border-border shadow-2xl overflow-hidden"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center p-5 border-b border-border bg-surface">
                            <h3 className="text-lg font-bold text-foreground">
                                {fileModal.type === 'create-file' && 'Create New File'}
                                {fileModal.type === 'create-folder' && 'Create New Folder'}
                                {fileModal.type === 'rename' && `Rename: ${fileModal.target?.name}`}
                                {fileModal.type === 'edit' && `Edit: ${fileModal.target?.name}`}
                            </h3>
                            <button onClick={() => setFileModal({ type: null })} className="text-muted-foreground hover:text-foreground transition-colors"><X size={18} /></button>
                        </div>
                        <div className="p-5 space-y-4">
                            {(fileModal.type === 'create-file' || fileModal.type === 'create-folder' || fileModal.type === 'rename') && (
                                <>
                                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Name</label>
                                    <input
                                        type="text" value={fileModalInput} onChange={e => setFileModalInput(e.target.value)}
                                        placeholder={fileModal.type === 'create-folder' ? 'folder_name' : 'filename.txt'}
                                        className="w-full bg-surface border border-border rounded-lg py-2.5 px-4 outline-none focus:border-primary text-foreground text-sm font-mono"
                                        autoFocus
                                    />
                                    <div className="flex gap-3 pt-2">
                                        <Button variant="outline" className="flex-1" onClick={() => setFileModal({ type: null })}>Cancel</Button>
                                        <Button className="flex-[2]" disabled={!fileModalInput.trim()} onClick={() => {
                                            if (fileModal.type === 'rename' && fileModal.target) {
                                                setFiles(prev => prev.map(f => f.name === fileModal.target.name ? { ...f, name: fileModalInput.trim() } : f));
                                                toast.success(`Renamed to ${fileModalInput.trim()}`);
                                            } else {
                                                const newF = { name: fileModalInput.trim(), type: fileModal.type === 'create-folder' ? 'folder' : 'file', size: fileModal.type === 'create-folder' ? '—' : '0 B', date: new Date().toISOString().split('T')[0] };
                                                setFiles(prev => [...prev, newF]);
                                                toast.success(`Created ${newF.name}`);
                                            }
                                            setFileModal({ type: null });
                                        }}>
                                            {fileModal.type === 'rename' ? 'Rename' : 'Create'}
                                        </Button>
                                    </div>
                                </>
                            )}
                            {fileModal.type === 'edit' && (
                                <>
                                    <textarea
                                        value={fileEditContent}
                                        onChange={e => setFileEditContent(e.target.value)}
                                        className="w-full bg-surface border border-border rounded-lg py-3 px-4 outline-none focus:border-primary text-foreground text-sm font-mono min-h-[300px] resize-y"
                                        spellCheck={false}
                                    />
                                    <div className="flex gap-3 pt-2">
                                        <Button variant="outline" className="flex-1" onClick={() => setFileModal({ type: null })}>Cancel</Button>
                                        <Button className="flex-[2]" onClick={() => {
                                            toast.success(`Saved ${fileModal.target?.name}`);
                                            setFileModal({ type: null });
                                        }}>Save Changes</Button>
                                    </div>
                                </>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}

            {scheduleModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setScheduleModal(false)}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-background w-full max-w-md rounded-lg border border-border shadow-2xl overflow-hidden"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center p-5 border-b border-border bg-surface">
                            <h3 className="text-lg font-bold text-foreground">Create Schedule</h3>
                            <button onClick={() => setScheduleModal(false)} className="text-muted-foreground hover:text-foreground transition-colors"><X size={18} /></button>
                        </div>
                        <div className="p-5 space-y-4">
                            <div>
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Schedule Name</label>
                                <input type="text" value={schedName} onChange={e => setSchedName(e.target.value)} placeholder="e.g. Auto Restart" className="w-full bg-surface border border-border rounded-lg py-2.5 px-4 outline-none focus:border-primary text-foreground text-sm" autoFocus />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Cron Expression</label>
                                <input type="text" value={schedCron} onChange={e => setSchedCron(e.target.value)} placeholder="0 */6 * * *" className="w-full bg-surface border border-border rounded-lg py-2.5 px-4 outline-none focus:border-primary text-foreground text-sm font-mono" />
                                <p className="text-xs text-muted-foreground mt-1">Format: minute hour day month weekday</p>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <Button variant="outline" className="flex-1" onClick={() => setScheduleModal(false)}>Cancel</Button>
                                <Button className="flex-[2]" disabled={!schedName.trim() || !schedCron.trim()} onClick={() => {
                                    setSchedules(prev => [...prev, { name: schedName.trim(), cron: schedCron.trim(), next: 'Pending...' }]);
                                    toast.success(`Schedule "${schedName}" created`);
                                    setScheduleModal(false);
                                }}>Create Schedule</Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );

    return (
        <>
            {content}
            {modals}
        </>
    );
};

export default ServerPanel;
