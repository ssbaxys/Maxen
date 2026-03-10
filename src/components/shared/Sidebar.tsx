import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Settings, User, ShieldAlert, LogOut, Home } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { auth } from '../../lib/firebase/init';
import { signOut } from 'firebase/auth';
import { Dropdown } from '../ui/Dropdown';
import { cn } from '../../lib/utils';
import Toast from '../ui/Toast';
import { useTranslation } from 'react-i18next';

const Sidebar = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
    const { user, visualNick, isRoot } = useAuthStore();

    const links = [
        { name: t('Dashboard'), path: '/dashboard', icon: LayoutDashboard },
        { name: t('Profile'), path: '/profile', icon: User },
        { name: t('Settings'), path: '/settings', icon: Settings },
    ];

    if (isRoot) {
        links.push({ name: t('Admin'), path: '/admin', icon: ShieldAlert });
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
        { label: t('Home Page'), icon: <Home size={16} />, onClick: () => navigate('/') },
        { label: t('Profile'), icon: <User size={16} />, onClick: () => navigate('/profile') },
        { label: t('Settings'), icon: <Settings size={16} />, onClick: () => navigate('/settings') },
        ...(isRoot ? [{ label: t('Admin Panel'), icon: <ShieldAlert size={16} />, onClick: () => navigate('/admin') }] : []),
        { label: t('Sign Out'), icon: <LogOut size={16} />, onClick: handleLogout, destructive: true },
    ];

    return (
        <aside className="w-[240px] flex-shrink-0 border-r border-border bg-background hidden md:flex flex-col relative z-20 h-[calc(100vh-57px)] sticky top-[57px] overflow-visible">
            <div className="px-4 py-4 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                {t('Main Menu')}
            </div>

            <nav className="px-3 space-y-0.5 flex-1 overflow-y-auto w-full scrollbar-hidden">
                {links.map(link => {
                    const isActive = location.pathname.startsWith(link.path);
                    return (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-md transition-all font-medium text-sm w-full outline-none",
                                isActive
                                    ? "bg-surface-hover text-foreground font-semibold"
                                    : "text-muted-foreground hover:bg-surface-hover/50 hover:text-foreground"
                            )}
                        >
                            <link.icon size={16} className={cn(isActive ? "text-foreground" : "text-muted-foreground")} />
                            {link.name}
                        </Link>
                    )
                })}
            </nav>

            {/* Bottom User Block */}
            {user && (
                <div className="p-3 mt-auto w-full">
                    <Dropdown
                        className="w-full"
                        align="left"
                        items={userDropdownItems}
                        trigger={
                            <div className="flex items-center gap-3 p-2 rounded-md hover:bg-surface-hover transition-colors cursor-pointer w-full group overflow-hidden border border-border bg-surface">
                                <div className="w-8 h-8 rounded bg-foreground flex items-center justify-center text-background font-bold shrink-0 text-xs">
                                    {(visualNick || user.email || 'U')[0].toUpperCase()}
                                </div>
                                <div className="flex flex-col min-w-0 flex-1 overflow-hidden">
                                    <span className="text-sm font-semibold text-foreground truncate block">
                                        {visualNick || "User"}
                                    </span>
                                    <span className="text-xs text-muted-foreground font-mono truncate block">
                                        {user.uid.slice(0, 10)}...
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
