import { User, ShieldAlert, Mail, Phone, Calendar, KeyRound, MonitorSmartphone, Plus } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { motion } from 'framer-motion';

const Profile = () => {
    const { user, visualNick, isRoot } = useAuthStore();

    // Mock data for formatting
    const formatDate = (timestamp: string | undefined) => {
        if (!timestamp) return 'Unknown';
        return new Date(parseInt(timestamp)).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
    };

    return (
        <div className="flex-1 max-w-5xl mx-auto px-6 md:px-12 py-12 w-full">
            <div className="mb-8 border-b border-border pb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
                        Profile Overview
                    </h1>
                    <p className="text-muted-foreground text-sm">Manage your personal information and security settings</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
                {/* Left Column: ID Card */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-1 space-y-6">
                    <Card className="p-8 text-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors" />

                        <div className="relative inline-flex mb-6">
                            <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-primary to-accent p-1 shadow-glow-lg">
                                <div className="w-full h-full bg-surface rounded-[calc(2rem-4px)] flex items-center justify-center">
                                    <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-primary to-white">
                                        {(visualNick || user?.email || 'U')[0].toUpperCase()}
                                    </span>
                                </div>
                            </div>
                            {isRoot && (
                                <div className="absolute -bottom-2 -right-2 bg-accent text-accent-foreground p-1.5 rounded-xl border-2 border-surface shadow-lg">
                                    <ShieldAlert size={16} />
                                </div>
                            )}
                        </div>

                        <h2 className="text-2xl font-bold text-foreground mb-1">
                            {visualNick || 'Standard User'}
                        </h2>

                        <div className="flex items-center justify-center gap-2 mb-6 text-muted-foreground font-mono">
                            <span className="text-xs bg-surface-hover px-2 py-1 rounded-md border border-border">
                                #{user?.uid ? user.uid.slice(0, 5).toUpperCase() : '00000'}
                            </span>
                            <span className="text-[10px] break-all max-w-[120px] truncate opacity-50" title={user?.uid}>
                                {user?.uid}
                            </span>
                        </div>

                        <div className="flex justify-center gap-2">
                            {isRoot ? (
                                <Badge variant="danger" className="text-xs px-3 py-1 uppercase tracking-widest font-bold">Root Administrator</Badge>
                            ) : (
                                <Badge variant="secondary" className="text-xs px-3 py-1 uppercase tracking-widest font-bold">Standard Member</Badge>
                            )}
                        </div>
                    </Card>

                    <Card className="p-6">
                        <h3 className="text-sm font-bold text-foreground uppercase tracking-widest mb-4">Security Overview</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-surface rounded-xl border border-border">
                                <div className="flex items-center gap-3">
                                    <KeyRound size={18} className="text-muted-foreground" />
                                    <span className="text-sm font-medium text-foreground">Password</span>
                                </div>
                                <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Set</Badge>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-surface rounded-xl border border-border">
                                <div className="flex items-center gap-3">
                                    <MonitorSmartphone size={18} className="text-muted-foreground" />
                                    <span className="text-sm font-medium text-foreground">Two-Factor (2FA)</span>
                                </div>
                                <Badge variant="outline" className="text-muted-foreground">Disabled</Badge>
                            </div>

                            <Button variant="outline" className="w-full mt-2">Setup 2FA</Button>
                        </div>
                    </Card>
                </motion.div>

                {/* Right Column: Details */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2 space-y-6">
                    <Card className="p-8">
                        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-border">
                            <User className="text-primary w-5 h-5" />
                            <h3 className="text-lg font-bold text-foreground">Personal Information</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Display Name</label>
                                <p className="text-foreground font-medium text-lg">{visualNick || 'Not configured'}</p>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Account Creation</label>
                                <div className="flex items-center gap-2 text-foreground font-medium text-lg">
                                    <Calendar size={18} className="text-muted-foreground" />
                                    {formatDate(user?.metadata.creationTime)}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Primary Email</label>
                                <div className="flex items-center gap-2 text-foreground font-medium text-lg">
                                    <Mail size={18} className="text-muted-foreground" />
                                    {user?.email || 'Unknown'}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Phone Number</label>
                                <div className="flex items-center gap-2 text-foreground font-medium text-lg">
                                    <Phone size={18} className="text-muted-foreground" />
                                    {user?.phoneNumber || <span className="text-muted-foreground italic">Not linked</span>}
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-8 inline-block w-full">
                        <div className="flex items-center justify-between mb-6 pb-6 border-b border-border">
                            <div className="flex items-center gap-3">
                                <KeyRound className="text-primary w-5 h-5" />
                                <h3 className="text-lg font-bold text-foreground">Authentication Providers</h3>
                            </div>
                            <Button variant="glass" size="sm" className="h-8 gap-2"><Plus size={14} /> Link Provider</Button>
                        </div>

                        <div className="grid gap-3">
                            {user?.providerData.map((provider, idx) => {
                                let ProviderIcon: any = MonitorSmartphone;
                                let providerName = provider.providerId;
                                let bgClass = "bg-white/5";

                                if (provider.providerId === 'password') {
                                    ProviderIcon = Mail;
                                    providerName = 'Email / Password';
                                } else if (provider.providerId === 'google.com') {
                                    ProviderIcon = () => <span className="font-bold font-serif text-blue-400">G</span>;
                                    providerName = 'Google';
                                    bgClass = "bg-blue-500/10 border-blue-500/20";
                                } else if (provider.providerId === 'phone') {
                                    ProviderIcon = Phone;
                                    providerName = 'Phone SMS';
                                    bgClass = "bg-emerald-500/10 border-emerald-500/20";
                                }

                                return (
                                    <div key={idx} className="flex items-center justify-between p-4 bg-surface rounded-xl border border-border">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center border border-transparent ${bgClass}`}>
                                                <ProviderIcon size={18} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-foreground capitalize">
                                                    {providerName}
                                                </p>
                                                <p className="text-xs text-muted-foreground">{provider.email || provider.phoneNumber || provider.uid || 'Linked'}</p>
                                            </div>
                                        </div>
                                        <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Active</Badge>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
};

export default Profile;
