import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, LogOut, Settings, ShieldAlert, Volume2, Eye } from 'lucide-react';
import { auth } from '../../firebase';
import { signOut } from 'firebase/auth';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

const Header = () => {
    const { user, visualNick, isRoot } = useAuthStore();
    const { volume, setVolume, colorblindMode, setColorblindMode } = useUIStore();
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
    const displayNick = visualNick || user?.email?.split('@')[0] || 'User';

    return (
        <header className="sticky top-0 z-50 glass-panel border-b border-white/5 py-4 px-6 md:px-12 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center transform group-hover:scale-105 transition-all shadow-lg shadow-primary/20">
                    <span className="font-bold text-white text-xl">M</span>
                </div>
                <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-textMuted group-hover:to-white transition-colors">Maxen</span>
            </Link>

            <nav className="flex items-center gap-6">
                {user ? (
                    <div className="relative" ref={menuRef}>
                        <button
                            onClick={() => setMenuOpen(!menuOpen)}
                            className="flex items-center gap-3 hover:bg-white/5 px-3 py-2 rounded-lg transition-colors cursor-pointer"
                        >
                            <div className="flex flex-col items-end hidden md:flex">
                                <span className="text-sm font-medium">{displayNick}</span>
                                <span className="text-xs text-textMuted font-mono">#{shortId}</span>
                            </div>
                            <div className="w-9 h-9 rounded-full bg-surface border border-white/10 flex items-center justify-center overflow-hidden">
                                <User size={18} className="text-textMuted" />
                            </div>
                        </button>

                        <AnimatePresence>
                            {menuOpen && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute right-0 mt-2 w-72 glass-panel rounded-xl shadow-2xl overflow-hidden py-2"
                                >
                                    <div className="px-4 py-3 border-b border-white/5 bg-white/[0.02]">
                                        <p className="font-semibold text-white">{displayNick}</p>
                                        <p className="text-xs text-textMuted font-mono select-all">{user.email || user.phoneNumber || 'No email/phone'}</p>
                                        <p className="text-xs text-textMuted font-mono mt-1">ID: {user.uid}</p>
                                    </div>

                                    <div className="p-2 space-y-1">
                                        <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-white/5 rounded-lg transition-colors">
                                            <User size={16} className="text-textMuted" />
                                            Dashboard
                                        </Link>

                                        <button onClick={() => { }} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-white/5 rounded-lg transition-colors shadow-none text-left">
                                            <Settings size={16} className="text-textMuted" />
                                            Settings (2FA, Profile)
                                        </button>

                                        <div className="py-2 px-3">
                                            <p className="text-xs font-semibold text-textMuted uppercase tracking-widest mb-2">Accessiblity</p>

                                            <div className="flex items-center justify-between mb-3 text-sm">
                                                <div className="flex items-center gap-2 text-textMuted"><Volume2 size={16} /> Volume</div>
                                                <input type="range" min="0" max="100" value={volume} onChange={(e) => setVolume(Number(e.target.value))} className="w-24 accent-primary" />
                                            </div>

                                            <label className="flex items-center justify-between text-sm cursor-pointer group">
                                                <div className="flex items-center gap-2 text-textMuted group-hover:text-white transition-colors"><Eye size={16} /> Colorblind</div>
                                                <div className={clsx("w-8 h-4 rounded-full transition-colors relative", colorblindMode ? "bg-primary" : "bg-white/10")}>
                                                    <div className={clsx("absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white transition-transform", colorblindMode ? "translate-x-4" : "")} />
                                                </div>
                                                <input type="checkbox" className="sr-only" checked={colorblindMode} onChange={(e) => setColorblindMode(e.target.checked)} />
                                            </label>
                                        </div>

                                    </div>

                                    {isRoot && (
                                        <div className="p-2 border-t border-white/5">
                                            <Link to="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm text-accent hover:bg-accent/10 rounded-lg transition-colors font-medium">
                                                <ShieldAlert size={16} />
                                                Admin Panel
                                            </Link>
                                        </div>
                                    )}

                                    <div className="p-2 border-t border-white/5">
                                        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-danger hover:bg-danger/10 rounded-lg transition-colors text-left">
                                            <LogOut size={16} />
                                            Logout
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ) : (
                    <div className="flex items-center gap-4 border border-white/10 p-1 rounded-xl glass-panel">
                        <Link to="/login" className="px-5 py-2 text-sm font-medium hover:text-white transition-colors">Log in</Link>
                        <Link to="/register" className="px-5 py-2 text-sm font-semibold bg-white text-black rounded-lg hover:bg-gray-200 transition-colors shadow-[0_0_15px_rgba(255,255,255,0.4)]">Sign Up</Link>
                    </div>
                )}
            </nav>
        </header>
    );
};

export default Header;
