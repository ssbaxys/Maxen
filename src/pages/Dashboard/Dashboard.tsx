import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Server, Activity, AlertCircle, Search } from 'lucide-react';
import { db } from '../../firebase';
import { ref, onValue } from 'firebase/database';
import { useAuthStore } from '../../store/authStore';
import { motion } from 'framer-motion';
import clsx from 'clsx';

// Type for our server list
type ServerData = {
    id: string;
    name: string;
    status: 'running' | 'offline' | 'starting';
    ram: number; // in GB
    cpu: number; // cores
    node: string;
};

const Dashboard = () => {
    const { user } = useAuthStore();
    const [servers, setServers] = useState<ServerData[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    // Mock initial data if no real DB data exists for this user
    useEffect(() => {
        if (!user) return;
        const serversRef = ref(db, 'servers');
        const unsubscribe = onValue(serversRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const userServers: ServerData[] = [];
                Object.keys(data).forEach(key => {
                    if (data[key].users && data[key].users[user.uid]) {
                        userServers.push({ id: key, ...data[key] });
                    }
                });
                setServers(userServers);
            } else {
                // Fallback for visual demonstration purposes before actual creation
                setServers([
                    { id: '3faj5n1k9', name: 'Survival SMP', status: 'running', ram: 4, cpu: 2, node: 'pl1.hoxen.one' },
                    { id: '8a9x8z2m1', name: 'Lobby', status: 'offline', ram: 2, cpu: 1, node: 'alt.hoxen.one' }
                ]);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, [user]);

    if (!user) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center">
                <AlertCircle className="w-12 h-12 text-accent mb-4" />
                <h2 className="text-xl font-bold">Authentication Required</h2>
                <p className="text-textMuted mt-2">Please login to view your servers.</p>
                <Link to="/login" className="mt-6 px-6 py-2 bg-primary text-white rounded-lg font-medium">Log In</Link>
            </div>
        );
    }

    const filteredServers = servers.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.id.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="flex-1 max-w-7xl mx-auto px-6 md:px-12 py-12 w-full">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Your Servers</h1>
                    <p className="text-textMuted">Manage and monitor all your instances</p>
                </div>

                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search servers..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full bg-surface border border-white/10 rounded-xl py-2.5 pl-10 pr-4 outline-none focus:border-primary transition-all text-sm"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full py-12 text-center text-textMuted animate-pulse">Loading servers...</div>
                ) : filteredServers.length === 0 ? (
                    <div className="col-span-full glass-panel py-16 text-center rounded-3xl border-dashed">
                        <Server className="w-12 h-12 text-textMuted/50 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-white mb-2">No servers found</h3>
                        <p className="text-textMuted text-sm">You don't have any servers matching your criteria.</p>
                    </div>
                ) : (
                    filteredServers.map((server, index) => (
                        <motion.div
                            key={server.id}
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Link
                                to={`/servers/${server.id}`}
                                className="block glass-panel p-6 rounded-2xl hover:border-primary/50 transition-all group overflow-hidden relative"
                            >
                                <div className="flex justify-between items-start mb-6 relative z-10">
                                    <div className="flex items-center gap-3">
                                        <div className={clsx("w-3 h-3 rounded-full relative",
                                            server.status === 'running' ? 'bg-secondary' :
                                                server.status === 'offline' ? 'bg-danger' : 'bg-accent'
                                        )}>
                                            {server.status === 'running' && <div className="absolute inset-0 bg-secondary rounded-full animate-ping opacity-50" />}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors">{server.name}</h3>
                                            <p className="text-xs text-textMuted font-mono">{server.node}</p>
                                        </div>
                                    </div>
                                    <Server className="text-textMuted group-hover:text-white transition-colors" />
                                </div>

                                <div className="grid grid-cols-2 gap-4 relative z-10">
                                    <div className="bg-surface p-3 rounded-xl border border-white/5">
                                        <p className="text-xs text-textMuted mb-1 font-semibold uppercase tracking-wider">Memory</p>
                                        <p className="text-sm font-semibold text-white">{server.ram} GB</p>
                                    </div>
                                    <div className="bg-surface p-3 rounded-xl border border-white/5">
                                        <p className="text-xs text-textMuted mb-1 font-semibold uppercase tracking-wider">CPU</p>
                                        <p className="text-sm font-semibold text-white">{server.cpu} Cores</p>
                                    </div>
                                </div>

                                <div className="mt-6 flex items-center justify-between text-xs text-textMuted border-t border-white/5 pt-4 relative z-10">
                                    <span className="font-mono">{server.id}</span>
                                    <div className="flex items-center gap-1 group-hover:text-primary transition-colors font-medium">
                                        Manage <Activity size={12} />
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Dashboard;
