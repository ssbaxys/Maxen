import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, LogOut, Settings, ShieldAlert, Volume2, Eye } from 'lucide-react';
import { auth } from '../../lib/firebase/init';
import { signOut } from 'firebase/auth';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';

const Header = () => {
    const { i18n } = useTranslation();
    const { user, visualNick, isRoot } = useAuthStore();
    const { volume, setVolume, colorblindMode, setColorblindMode, language, setLanguage, voiceoverEnabled, setVoiceover } = useUIStore();
    const navigate = useNavigate();
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = async () => {
        await signOut(auth);
        setMenuOpen(false);
        navigate('/');
    };

    const displayNick = visualNick || user?.email?.split('@')[0] || 'User';

    // Breadcrumb logic mapping
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbLabel = pathSegments.length > 0
        ? pathSegments[0].charAt(0).toUpperCase() + pathSegments[0].slice(1)
        : 'Overview';

    return (
        <header className="sticky top-0 z-50 bg-background border-b border-border h-[57px] px-4 md:px-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <Link to="/" className="flex items-center gap-2.5 group">
                    <div className="w-7 h-7 rounded bg-foreground flex items-center justify-center transform group-hover:scale-105 transition-all">
                        <span className="font-bold text-background text-sm">M</span>
                    </div>
                </Link>

                {/* Clean SaaS Breadcrumb */}
                <div className="hidden md:flex items-center text-sm font-medium text-muted-foreground select-none">
                    <span className="text-foreground mx-2 font-bold tracking-tight">Maxen</span>
                    <span className="mx-1 opacity-50">/</span>
                    <span className="mx-2 truncate max-w-[200px]">{breadcrumbLabel}</span>
                </div>
            </div>

            <nav className="flex items-center gap-4">
                {user ? (
                    <div className="relative" ref={menuRef}>
                        <button
                            onClick={() => setMenuOpen(!menuOpen)}
                            className="flex items-center gap-2 hover:bg-surface-hover px-1.5 py-1.5 rounded-md transition-colors cursor-pointer outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
                        >
                            <div className="w-7 h-7 rounded border border-border bg-surface flex items-center justify-center overflow-hidden">
                                <User size={14} className="text-foreground" />
                            </div>
                        </button>

                        <AnimatePresence>
                            {menuOpen && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: 5 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: 5 }}
                                    transition={{ duration: 0.15, ease: "easeOut" }}
                                    className="absolute right-0 mt-2 w-64 bg-surface rounded-md shadow-lg overflow-hidden py-1 border border-border"
                                >
                                    <div className="px-4 py-3 border-b border-border bg-background">
                                        <p className="font-semibold text-sm text-foreground">{displayNick}</p>
                                        <p className="text-xs text-muted-foreground font-mono select-all truncate">{user.email || user.phoneNumber || 'No email/phone'}</p>
                                        <p className="text-[10px] text-muted-foreground font-mono mt-1 break-all">ID: {user.uid}</p>
                                    </div>

                                    <div className="p-1 space-y-0.5">
                                        <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 px-3 py-1.5 text-sm hover:bg-surface-hover rounded-sm transition-colors text-foreground">
                                            <User size={14} className="text-muted-foreground" />
                                            Dashboard
                                        </Link>

                                        <button onClick={() => navigate('/settings')} className="w-full flex items-center gap-2.5 px-3 py-1.5 text-sm hover:bg-surface-hover rounded-sm transition-colors text-left text-foreground">
                                            <Settings size={14} className="text-muted-foreground" />
                                            Settings
                                        </button>

                                        <div className="py-2 px-3 mt-1 border-t border-border">
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Preferences</p>

                                            <div className="flex items-center justify-between mb-3 text-xs font-medium">
                                                <div className="flex items-center gap-2 text-muted-foreground"><Volume2 size={14} /> Volume</div>
                                                <input type="range" min="0" max="100" value={volume} onChange={(e) => setVolume(Number(e.target.value))} className="w-20 accent-foreground" />
                                            </div>

                                            <label className="flex items-center justify-between text-xs font-medium cursor-pointer group mb-3">
                                                <div className="flex items-center gap-2 text-muted-foreground group-hover:text-foreground transition-colors"><Eye size={14} /> Colorblind</div>
                                                <div className={cn("w-7 h-3.5 rounded-full transition-colors relative", colorblindMode ? "bg-foreground" : "bg-muted")}>
                                                    <div className={cn("absolute top-0.5 left-0.5 w-2.5 h-2.5 rounded-full bg-background transition-transform duration-200", colorblindMode ? "translate-x-3.5" : "")} />
                                                </div>
                                                <input type="checkbox" className="sr-only" checked={colorblindMode} onChange={(e) => setColorblindMode(e.target.checked)} />
                                            </label>

                                            <label className="flex items-center justify-between text-xs font-medium cursor-pointer group">
                                                <div className="flex items-center gap-2 text-muted-foreground group-hover:text-foreground transition-colors"><Volume2 size={14} /> Voiceover</div>
                                                <div className={cn("w-7 h-3.5 rounded-full transition-colors relative", voiceoverEnabled ? "bg-foreground" : "bg-muted")}>
                                                    <div className={cn("absolute top-0.5 left-0.5 w-2.5 h-2.5 rounded-full bg-background transition-transform duration-200", voiceoverEnabled ? "translate-x-3.5" : "")} />
                                                </div>
                                                <input type="checkbox" className="sr-only" checked={voiceoverEnabled} onChange={(e) => setVoiceover(e.target.checked)} />
                                            </label>

                                            <div className="flex items-center justify-between text-xs font-medium mt-3 pt-3 border-t border-border">
                                                <div className="flex items-center gap-2 text-muted-foreground">Language</div>
                                                <div className="flex bg-surface border border-border rounded-md p-0.5">
                                                    <button onClick={() => { setLanguage('en'); i18n.changeLanguage('en'); }} className={cn("px-2 py-0.5 text-[10px] rounded-[4px] transition-all font-bold", language === 'en' ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground")}>EN</button>
                                                    <button onClick={() => { setLanguage('ru'); i18n.changeLanguage('ru'); }} className={cn("px-2 py-0.5 text-[10px] rounded-[4px] transition-all font-bold", language === 'ru' ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground")}>RU</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {isRoot && (
                                        <div className="p-1 border-t border-border">
                                            <Link to="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 px-3 py-1.5 text-sm text-foreground hover:bg-surface-hover rounded-sm transition-colors font-medium">
                                                <ShieldAlert size={14} />
                                                Admin Panel
                                            </Link>
                                        </div>
                                    )}

                                    <div className="p-1 border-t border-border">
                                        <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-3 py-1.5 text-sm text-danger hover:bg-danger/10 rounded-sm transition-colors text-left font-medium">
                                            <LogOut size={14} />
                                            Logout
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" onClick={() => navigate('/login')} size="sm" className="h-8">
                            Log in
                        </Button>
                        <Button onClick={() => navigate('/register')} size="sm" className="h-8">
                            Sign Up
                        </Button>
                    </div>
                )}
            </nav>
        </header>
    );
};

export default Header;
