import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Server, Activity, Search, Filter, MoreVertical, Terminal } from 'lucide-react';
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

const Dashboard = () => {
    const { user } = useAuthStore();
    const [serverIds, setServerIds] = useState<string[]>([]);
    const [serversData, setServersData] = useState<Record<string, ServerData>>({});
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

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

    const serversList = Object.entries(serversData).map(([id, data]) => ({ id, ...data }));
    const filteredServers = serversList.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.id.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="flex-1 w-full max-w-7xl mx-auto h-full flex flex-col pt-2">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 pb-0">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground mb-1">Servers</h1>
                    <p className="text-muted-foreground text-sm">Manage and monitor your infrastructure</p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <Input
                        icon={<Search size={16} />}
                        placeholder="Search servers..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full md:w-64 h-9"
                    />
                    <Button variant="outline" size="icon" className="h-9 w-9" title="Filter" onClick={() => Toast.promise(new Promise(resolve => setTimeout(resolve, 1000)), { loading: 'Applying filter...', success: 'Filter applied', error: 'Error' })}>
                        <Filter size={16} />
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
                        title="No instances found"
                        description="You don't currently have any active servers assigned to your account."
                        actionLabel="Deploy Instance"
                        actionHref="/register"
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
                                    <div className="bg-surface border border-border rounded-lg p-5 h-full flex flex-col hover:border-border-hover transition-colors shadow-sm cursor-pointer group">

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
        </div>
    );
};

export default Dashboard;
