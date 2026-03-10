import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Server, Activity, Search, Filter } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { serverService } from '../../services/serverService';
import { userService } from '../../services/userService';
import { ServerData } from '../../types/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { EmptyState } from '../../components/ui/EmptyState';
import { Spinner } from '../../components/ui/Spinner';
import { Card } from '../../components/ui/Card';
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

    // Fetch user's server list first
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

    // Fetch live data for each server the user has access to
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
                    // Server deleted
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
        <div className="flex-1 w-full max-w-7xl mx-auto h-full flex flex-col">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 pb-6 border-b border-border">
                <div>
                    <h1 className="text-3xl font-bold text-foreground mb-1">Dashboard</h1>
                    <p className="text-muted-foreground text-sm">Manage and monitor your running instances</p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <Input
                        icon={<Search size={18} />}
                        placeholder="Search servers..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full md:w-64 lg:w-80"
                    />
                    <Button variant="outline" size="icon" title="Filter" onClick={() => Toast.promise(new Promise(resolve => setTimeout(resolve, 1000)), { loading: 'Applying filter...', success: 'Filter applied', error: 'Error' })}>
                        <Filter size={18} />
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="flex-1 flex flex-col items-center justify-center">
                    <Spinner size="lg" className="text-primary mb-4" />
                    <p className="text-sm font-medium text-muted-foreground animate-pulse">Synchronizing cluster...</p>
                </div>
            ) : serverIds.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center">
                    <EmptyState
                        icon={<Server />}
                        title="No servers found"
                        description="You don't currently have any active servers assigned to your account. Deploy a new instance to get started."
                        actionLabel="Deploy Server"
                        actionHref="/register" // Assuming deployment flow might begin here or store
                    />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-max">
                    <AnimatePresence>
                        {filteredServers.map((server, index) => (
                            <motion.div
                                key={server.id}
                                layout
                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: index * 0.05, duration: 0.2 }}
                            >
                                <Link to={`/servers/${server.id}`} className="block h-full group">
                                    <Card className="p-6 h-full flex flex-col hover:border-primary/40 transition-all hover:shadow-glass-lg relative overflow-hidden">

                                        {/* Status Glow Blob */}
                                        <div className={cn(
                                            "absolute -right-12 -top-12 w-32 h-32 blur-[60px] rounded-full transition-colors duration-700 opacity-20 group-hover:opacity-40",
                                            server.status === 'running' ? 'bg-secondary' :
                                                server.status === 'starting' || server.status === 'stopping' ? 'bg-accent' : 'bg-danger'
                                        )} />

                                        <div className="flex justify-between items-start mb-6 relative z-10">
                                            <div className="flex items-center gap-3">
                                                <div className="relative flex h-3 w-3">
                                                    {server.status === 'running' && (
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                                                    )}
                                                    <span className={cn(
                                                        "relative inline-flex rounded-full h-3 w-3 transition-colors",
                                                        server.status === 'running' ? 'bg-secondary' :
                                                            server.status === 'starting' || server.status === 'stopping' ? 'bg-accent' : 'bg-danger'
                                                    )}></span>
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">{server.name}</h3>
                                                    <p className="text-xs text-muted-foreground font-mono">{server.node}</p>
                                                </div>
                                            </div>
                                            <Server className="text-muted-foreground group-hover:text-foreground transition-colors" size={20} />
                                        </div>

                                        <div className="grid grid-cols-3 gap-3 relative z-10 mb-6 flex-1">
                                            <div className="bg-surface p-3 rounded-xl border border-border">
                                                <p className="text-[10px] text-muted-foreground mb-1 font-bold uppercase tracking-wider">Storage</p>
                                                <p className="text-sm font-semibold text-foreground">{server.specs?.disk || 0}GB</p>
                                            </div>
                                            <div className="bg-surface p-3 rounded-xl border border-border">
                                                <p className="text-[10px] text-muted-foreground mb-1 font-bold uppercase tracking-wider">Memory</p>
                                                <p className="text-sm font-semibold text-foreground">{server.specs?.ram || 0}GB</p>
                                            </div>
                                            <div className="bg-surface p-3 rounded-xl border border-border">
                                                <p className="text-[10px] text-muted-foreground mb-1 font-bold uppercase tracking-wider">CPU</p>
                                                <p className="text-sm font-semibold text-foreground">{server.specs?.cpu || 0}C</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-4 relative z-10">
                                            <span className="font-mono bg-surface px-2 py-1 rounded-md border border-border group-hover:border-primary/20 transition-colors">
                                                id: {server.id.substring(0, 8)}...
                                            </span>
                                            <div className="flex items-center gap-1 group-hover:text-primary transition-colors font-medium">
                                                Open Console <Activity size={14} className="ml-1" />
                                            </div>
                                        </div>
                                    </Card>
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
