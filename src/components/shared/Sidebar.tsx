import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Settings, User, ShieldAlert, LogOut, Home } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { auth } from '../../lib/firebase/init';
import { signOut } from 'firebase/auth';
import { Dropdown } from '../ui/Dropdown';
import { cn } from '../../lib/utils';
import Toast from '../ui/Toast';

const Sidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, visualNick, isRoot } = useAuthStore();

    const links = [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Profile', path: '/profile', icon: User },
        { name: 'Settings', path: '/settings', icon: Settings },
    ];

    if (isRoot) {
        links.push({ name: 'Admin', path: '/admin', icon: ShieldAlert });
    }

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/');
        } catch (error) {
            Toast.error("Failed to sign out");
        }
    };

    const userDropdownItems = [
        { label: 'Home Page', icon: <Home size={16} />, onClick: () => navigate('/') },
        { label: 'Profile', icon: <User size={16} />, onClick: () => navigate('/profile') },
        { label: 'Settings', icon: <Settings size={16} />, onClick: () => navigate('/settings') },
        ...(isRoot ? [{ label: 'Admin Panel', icon: <ShieldAlert size={16} />, onClick: () => navigate('/admin') }] : []),
        { label: 'Sign Out', icon: <LogOut size={16} />, onClick: handleLogout, destructive: true },
    ];

    return (
        <aside className="w-64 flex-shrink-0 border-r border-border glass-panel hidden md:flex flex-col relative z-20 h-[calc(100vh-61px)] sticky top-[61px] overflow-visible">
            <nav className="p-4 space-y-1 flex-1 overflow-y-auto w-full scrollbar-hidden">
                {links.map(link => {
                    const isActive = location.pathname.startsWith(link.path);
                    return (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm w-full",
                                isActive
                                    ? "bg-primary/10 text-primary font-bold border border-primary/20 shadow-glow-sm"
                                    : "text-muted-foreground hover:bg-surface hover:text-foreground border border-transparent"
                            )}
                        >
                            <link.icon size={18} />
                            {link.name}
                        </Link>
                    )
                })}
            </nav>

            {/* Bottom User Block */}
            {user && (
                <div className="p-4 border-t border-border mt-auto w-full">
                    <Dropdown
                        className="w-full"
                        align="left"
                        items={userDropdownItems}
                        trigger={
                            <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-surface-hover transition-colors cursor-pointer w-full group overflow-hidden">
                                <div className="w-10 h-10 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold shadow-sm shrink-0">
                                    {(visualNick || user.email || 'U')[0].toUpperCase()}
                                </div>
                                <div className="flex flex-col min-w-0 flex-1 overflow-hidden">
                                    <span className="text-sm font-bold text-foreground truncate block">
                                        {visualNick || "User"}
                                    </span>
                                    <span className="text-xs text-muted-foreground font-mono truncate block group-hover:text-foreground/70 transition-colors">
                                        {user.uid.slice(0, 16)}...
                                    </span>
                                </div>
                            </div>
                        }
                    />
                </div>
            )}
        </aside>
    );
};

export default Sidebar;
