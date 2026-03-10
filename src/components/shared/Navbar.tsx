import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

    const shortId = user?.uid.substring(0, 5) || '00000';
    const uidLength = user?.uid.length || 0;
    const displayNick = visualNick || user?.email?.split('@')[0] || 'User';

    return (
        <header className="sticky top-0 z-50 bg-background border-b border-border py-3 px-4 md:px-8 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 group">
                <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center transform group-hover:scale-105 transition-all shadow-sm">
                    <span className="font-bold text-primary-foreground text-lg">M</span>
                </div>
                <span className="text-xl font-bold tracking-tight text-foreground transition-colors group-hover:text-primary">Maxen</span>
            </Link>

            <nav className="flex items-center gap-4">
                {user ? (
                    <div className="relative" ref={menuRef}>
                        <button
                            onClick={() => setMenuOpen(!menuOpen)}
                            className="flex items-center gap-3 hover:bg-surface-hover px-2 py-1.5 rounded-lg transition-colors cursor-pointer ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                            <div className="flex flex-col items-end hidden md:flex">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-sm font-semibold text-foreground">{displayNick}</span>
                                    <span className="text-xs text-muted-foreground font-mono">({shortId})#{user.uid.substring(uidLength - 5)}</span>
                                </div>
                            </div>
                            <div className="w-9 h-9 rounded-full bg-surface border border-border flex items-center justify-center overflow-hidden shadow-sm">
                                <User size={16} className="text-muted-foreground" />
                            </div>
                        </button>

                        <AnimatePresence>
                            {menuOpen && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                    className="absolute right-0 mt-2 w-72 bg-surface rounded-xl shadow-lg overflow-hidden py-1 border border-border"
                                >
                                    <div className="px-4 py-3 border-b border-border bg-surface-hover/30">
                                        <p className="font-medium text-foreground">{displayNick}</p>
                                        <p className="text-xs text-muted-foreground font-mono select-all truncate">{user.email || user.phoneNumber || 'No email/phone'}</p>
                                        <p className="text-xs text-muted-foreground font-mono mt-1 break-all">ID: {user.uid}</p>
                                    </div>

                                    <div className="p-1 space-y-0.5">
                                        <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-surface-hover rounded-md transition-colors text-foreground">
                                            <User size={16} className="text-muted-foreground" />
                                            Dashboard
                                        </Link>

                                        <button onClick={() => { }} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-surface-hover rounded-md transition-colors text-left text-foreground">
                                            <Settings size={16} className="text-muted-foreground" />
                                            Settings
                                        </button>

                                        <div className="py-2 px-3 mt-1 border-t border-border">
                                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Preferences</p>

                                            <div className="flex items-center justify-between mb-3 text-sm">
                                                <div className="flex items-center gap-2 text-muted-foreground"><Volume2 size={16} /> Volume</div>
                                                <input type="range" min="0" max="100" value={volume} onChange={(e) => setVolume(Number(e.target.value))} className="w-24 accent-primary" />
                                            </div>

                                            <label className="flex items-center justify-between text-sm cursor-pointer group mb-3">
                                                <div className="flex items-center gap-2 text-muted-foreground group-hover:text-foreground transition-colors"><Eye size={16} /> Colorblind</div>
                                                <div className={cn("w-8 h-4 rounded-full transition-colors relative", colorblindMode ? "bg-primary" : "bg-muted")}>
                                                    <div className={cn("absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white transition-transform duration-200", colorblindMode ? "translate-x-4" : "")} />
                                                </div>
                                                <input type="checkbox" className="sr-only" checked={colorblindMode} onChange={(e) => setColorblindMode(e.target.checked)} />
                                            </label>

                                            <label className="flex items-center justify-between text-sm cursor-pointer group">
                                                <div className="flex items-center gap-2 text-muted-foreground group-hover:text-foreground transition-colors"><Volume2 size={16} /> Voiceover</div>
                                                <div className={cn("w-8 h-4 rounded-full transition-colors relative", voiceoverEnabled ? "bg-primary" : "bg-muted")}>
                                                    <div className={cn("absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white transition-transform duration-200", voiceoverEnabled ? "translate-x-4" : "")} />
                                                </div>
                                                <input type="checkbox" className="sr-only" checked={voiceoverEnabled} onChange={(e) => setVoiceover(e.target.checked)} />
                                            </label>

                                            <div className="flex items-center justify-between text-sm mt-3 pt-3 border-t border-border">
                                                <div className="flex items-center gap-2 text-muted-foreground">Language</div>
                                                <div className="flex bg-surface-hover rounded-lg p-0.5">
                                                    <button onClick={() => { setLanguage('en'); i18n.changeLanguage('en'); }} className={cn("px-2 py-1 text-xs rounded-md transition-all", language === 'en' ? "bg-surface shadow-sm text-foreground font-medium" : "text-muted-foreground hover:text-foreground")}>EN</button>
                                                    <button onClick={() => { setLanguage('ru'); i18n.changeLanguage('ru'); }} className={cn("px-2 py-1 text-xs rounded-md transition-all", language === 'ru' ? "bg-surface shadow-sm text-foreground font-medium" : "text-muted-foreground hover:text-foreground")}>RU</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {isRoot && (
                                        <div className="p-1 border-t border-border">
                                            <Link to="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 px-3 py-2 text-sm text-accent hover:bg-accent/10 rounded-md transition-colors font-medium">
                                                <ShieldAlert size={16} />
                                                Admin Panel
                                            </Link>
                                        </div>
                                    )}

                                    <div className="p-1 border-t border-border">
                                        <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-danger hover:bg-danger/10 rounded-md transition-colors text-left font-medium">
                                            <LogOut size={16} />
                                            Logout
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ) : (
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" onClick={() => navigate('/login')} size="sm">
                            Log in
                        </Button>
                        <Button onClick={() => navigate('/register')} size="sm">
                            Sign Up
                        </Button>
                    </div>
                )}
            </nav>
        </header>
    );
};

export default Header;
