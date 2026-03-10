import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { auth, db } from './lib/firebase/init';
import { onAuthStateChanged } from 'firebase/auth';
import { ref, get } from 'firebase/database';
import { useAuthStore } from './store/authStore';
import { useUIStore } from './store/uiStore';

import PublicLayout from './components/layouts/PublicLayout';
import PanelLayout from './components/layouts/PanelLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';

import Home from './pages/Home/Home';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import ServerPanel from './pages/Server/ServerPanel';
import AdminPanel from './pages/Admin/AdminPanel';
import Profile from './pages/Profile/Profile';
import Settings from './pages/Settings/Settings';
import NotFound from './pages/NotFound/NotFound';
import { Toaster } from 'react-hot-toast';

function App() {
    const { setUser, setVisualNick, setIsRoot, setLoading } = useAuthStore();
    const theme = useUIStore((s) => s.theme);

    // Apply theme class to <html>
    useEffect(() => {
        const root = document.documentElement;
        if (theme === 'light') {
            root.classList.add('light');
        } else {
            root.classList.remove('light');
        }
    }, [theme]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                // Fetch user data from DB
                const userRef = ref(db, `users/${currentUser.uid}`);
                const snapshot = await get(userRef);
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    setVisualNick(data.visualNick || null);
                    setIsRoot(!!data.root);
                }
            } else {
                setVisualNick(null);
                setIsRoot(false);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [setUser, setVisualNick, setIsRoot, setLoading]);

    return (
        <Router>
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
                <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
                <Route path="/register" element={<PublicLayout><Register /></PublicLayout>} />

                {/* Protected Panel Routes */}
                <Route path="/dashboard" element={<ProtectedRoute><PanelLayout><Dashboard /></PanelLayout></ProtectedRoute>} />
                <Route path="/servers/:id/*" element={<ProtectedRoute><PanelLayout><ServerPanel /></PanelLayout></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><PanelLayout><Profile /></PanelLayout></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><PanelLayout><Settings /></PanelLayout></ProtectedRoute>} />
                <Route path="/admin/*" element={<ProtectedRoute requireRoot={true}><PanelLayout><AdminPanel /></PanelLayout></ProtectedRoute>} />

                {/* 404 Route */}
                <Route path="*" element={<PublicLayout><NotFound /></PublicLayout>} />
            </Routes>
            <Toaster
                position="bottom-right"
                toastOptions={{
                    className: '!bg-surface !text-foreground !border !border-border !shadow-lg',
                    success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
                    error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } }
                }}
            />
        </Router>
    );
}

export default App;
