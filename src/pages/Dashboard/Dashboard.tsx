import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Server, Activity, Search, Filter, MoreVertical, Terminal, Plus, X, Loader2 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { serverService } from '../../services/serverService';
import { userService } from '../../services/userService';
import { ServerData } from '../../types/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { EmptyState } from '../../components/ui/EmptyState';
import { Spinner } from '../../components/ui/Spinner';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { cn } from '../../lib/utils';
import Toast from '../../components/ui/Toast';
import { useTranslation } from 'react-i18next';

const Dashboard = () => {
    const { t } = useTranslation();
    const { user } = useAuthStore();
    const [serverIds, setServerIds] = useState<string[]>([]);
    const [serversData, setServersData] = useState<Record<string, ServerData>>({});
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    // Create server modal
    const [isCreateOpen, setCreateOpen] = useState(false);
    const [newName, setNewName] = useState('');
    const [newNode, setNewNode] = useState('Frankfurt-01');
    const [newRam, setNewRam] = useState('4');
    const [newCpu, setNewCpu] = useState('2');
    const [newDisk, setNewDisk] = useState('20');
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        if (!user) return;
        const unsubscribeUser = userService.subscribeToUser(user.uid, (userData) => {
            if (userData && userData.servers) {
                setServerIds(Object.keys(userData.servers));
            } else {
                setServerIds([]);
            }
            setLoading(false);
        });
        return () => unsubscribeUser();
    }, [user]);

    useEffect(() => {
        if (serverIds.length === 0) {
            setServersData({});
            return;
        }
        const unsubscribes: Array<() => void> = [];
        serverIds.forEach(id => {
            const unsub = serverService.subscribeToServer(id, (data) => {
                if (data) {
                    setServersData(prev => ({ ...prev, [id]: data }));
                } else {
                    setServersData(prev => {
                        const next = { ...prev };
                        delete next[id];
                        return next;
                    });
                }
            });
            unsubscribes.push(unsub);
        });
        return () => {
            unsubscribes.forEach(unsub => unsub());
        };
    }, [serverIds]);

    const handleCreateServer = async () => {
        if (!user || !newName.trim()) return;
        setIsCreating(true);
        try {
            const serverData: ServerData = {
                owner: user.uid,
                name: newName.trim(),
                node: newNode,
                status: 'offline',
                specs: {
                    ram: parseFloat(newRam) || 4,
                    cpu: parseInt(newCpu) || 2,
                    disk: parseFloat(newDisk) || 20,
                },
                createdAt: Date.now(),
            };
            const serverId = await serverService.createServer(serverData);
            if (serverId) {
                // Link server to user
                await userService.updateUser(user.uid, {
                    [`servers/${serverId}`]: true
                } as any);
                Toast.success('Server created successfully!');
                setCreateOpen(false);
                setNewName('');
            } else {
                Toast.error('Failed to create server.');
            }
        } catch (e) {
            Toast.error('Failed to create server.');
        } finally {
            setIsCreating(false);
        }
    };

    const serversList = Object.entries(serversData).map(([id, data]) => ({ id, ...data }));
    const filteredServers = serversList.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.id.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="flex-1 w-full max-w-7xl mx-auto h-full flex flex-col pt-2">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 pb-0">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground mb-1">{t('Servers')}</h1>
                    <p className="text-muted-foreground text-sm">{t('Manage and monitor your infrastructure')}</p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <Input
                        icon={<Search size={16} />}
                        placeholder={t('Search servers...')}
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full md:w-64 h-9"
                    />
                    <Button variant="outline" size="icon" className="h-9 w-9" title="Filter" onClick={() => Toast.promise(new Promise(resolve => setTimeout(resolve, 1000)), { loading: 'Applying filter...', success: 'Filter applied', error: 'Error' })}>
                        <Filter size={16} />
                    </Button>
                    <Button onClick={() => setCreateOpen(true)} className="h-9 gap-2 shrink-0">
                        <Plus size={16} /> {t('Create Server')}
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="flex-1 flex flex-col items-center justify-center">
                    <Spinner size="md" className="text-foreground mb-4" />
                    <p className="text-xs font-mono text-muted-foreground animate-pulse">Syncing nodes...</p>
                </div>
            ) : serverIds.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center mt-12 bg-surface/50 border border-border rounded-lg border-dashed p-12">
                    <EmptyState
                        icon={<Server size={24} />}
                        title={t('No instances found')}
                        description={t("You don't currently have any active servers assigned to your account.")}
                        actionLabel={t('Deploy Instance')}
                        actionOnClick={() => setCreateOpen(true)}
                    />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 auto-rows-max">
                    <AnimatePresence>
                        {filteredServers.map((server, index) => (
                            <motion.div
                                key={server.id}
                                layout
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                transition={{ delay: index * 0.03, duration: 0.15 }}
                            >
                                <Link to={`/servers/${server.id}`} className="block h-full outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg">
                                    <div className="bg-surface border border-border rounded-lg p-5 h-full flex flex-col hover:border-muted-foreground/20 transition-colors shadow-sm cursor-pointer group">

                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded border border-border bg-background flex items-center justify-center shrink-0 shadow-sm">
                                                    <Server size={18} className="text-foreground group-hover:text-primary transition-colors" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-0.5">
                                                        <h3 className="text-sm font-semibold text-foreground tracking-tight">{server.name}</h3>
                                                        <div className={cn(
                                                            "w-2 h-2 rounded-full",
                                                            server.status === 'running' ? 'bg-emerald-500' :
                                                                server.status === 'starting' || server.status === 'stopping' ? 'bg-amber-500 animate-pulse' : 'bg-rose-500'
                                                        )} />
                                                    </div>
                                                    <p className="text-xs text-muted-foreground font-mono">{server.id.substring(0, 8)}</p>
                                                </div>
                                            </div>

                                            <button className="text-muted-foreground hover:text-foreground p-1 transition-colors rounded hover:bg-surface-hover" aria-label="Server Options" onClick={(e) => e.preventDefault()}>
                                                <MoreVertical size={16} />
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-3 gap-2 mb-5 flex-1">
                                            <div className="bg-background rounded-md p-2 border border-border flex flex-col gap-1 items-center justify-center text-center">
                                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Mem</p>
                                                <p className="text-xs font-mono text-foreground">{server.specs?.ram || 0}GB</p>
                                            </div>
                                            <div className="bg-background rounded-md p-2 border border-border flex flex-col gap-1 items-center justify-center text-center">
                                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">CPU</p>
                                                <p className="text-xs font-mono text-foreground">{server.specs?.cpu || 0}C</p>
                                            </div>
                                            <div className="bg-background rounded-md p-2 border border-border flex flex-col gap-1 items-center justify-center text-center">
                                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Disk</p>
                                                <p className="text-xs font-mono text-foreground">{server.specs?.disk || 0}GB</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between mt-auto">
                                            <div className="flex items-center gap-1.5 px-2 py-1 bg-surface-hover rounded text-xs font-mono text-muted-foreground border border-transparent group-hover:border-border transition-colors">
                                                <Activity size={12} className={cn(server.status === 'running' ? 'text-emerald-500' : 'text-muted-foreground')} />
                                                {server.node}
                                            </div>

                                            <div className="text-xs font-medium flex items-center gap-1 text-muted-foreground group-hover:text-foreground transition-colors">
                                                <Terminal size={14} /> Open
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Create Server Modal */}
            <AnimatePresence>
                {isCreateOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-background w-full max-w-lg rounded-xl border border-border shadow-lg overflow-hidden flex flex-col"
                        >
                            <div className="flex justify-between items-center p-6 border-b border-border bg-surface">
                                <h3 className="text-lg font-bold text-foreground">{t('Create Server')}</h3>
                                <button onClick={() => setCreateOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors"><X size={20} /></button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">{t('Server Name')}</label>
                                    <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="My Minecraft Server" className="w-full bg-surface border border-border rounded-lg py-2.5 px-4 outline-none focus:border-primary text-foreground text-sm" />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">{t('Node Location')}</label>
                                    <select value={newNode} onChange={e => setNewNode(e.target.value)} className="w-full bg-surface border border-border rounded-lg py-2.5 px-4 outline-none focus:border-primary text-sm text-foreground appearance-none">
                                        <option value="Frankfurt-01">Frankfurt-01</option>
                                        <option value="Frankfurt-02">Frankfurt-02</option>
                                        <option value="Helsinki-01">Helsinki-01</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">{t('RAM (GB)')}</label>
                                        <input type="number" step="0.5" min="1" value={newRam} onChange={e => setNewRam(e.target.value)} className="w-full bg-surface border border-border rounded-lg py-2.5 px-4 outline-none focus:border-primary text-foreground text-sm" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">{t('CPU Cores')}</label>
                                        <input type="number" step="1" min="1" value={newCpu} onChange={e => setNewCpu(e.target.value)} className="w-full bg-surface border border-border rounded-lg py-2.5 px-4 outline-none focus:border-primary text-foreground text-sm" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">{t('Disk (GB)')}</label>
                                        <input type="number" step="1" min="5" value={newDisk} onChange={e => setNewDisk(e.target.value)} className="w-full bg-surface border border-border rounded-lg py-2.5 px-4 outline-none focus:border-primary text-foreground text-sm" />
                                    </div>
                                </div>
                                <div className="pt-2 flex gap-3">
                                    <Button variant="outline" className="flex-1" onClick={() => setCreateOpen(false)}>{t('Cancel')}</Button>
                                    <Button className="flex-[2] gap-2" onClick={handleCreateServer} disabled={!newName.trim() || isCreating}>
                                        {isCreating ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />} {t('Deploy')}
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Dashboard;
