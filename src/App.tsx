import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { ref, get } from 'firebase/database';
import { useAuthStore } from './store/authStore';

import Layout from './components/Layout/Layout';
import Home from './pages/Home/Home';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Dashboard/Dashboard';

import ServerPanel from './pages/Server/ServerPanel';
import AdminPanel from './pages/Admin/AdminPanel';
import { Toaster } from 'react-hot-toast';

function App() {
    const { setUser, setVisualNick, setIsRoot, setLoading } = useAuthStore();

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
            <Layout>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/servers/:id/*" element={<ServerPanel />} />
                    <Route path="/admin/*" element={<AdminPanel />} />
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
                <Toaster
                    position="bottom-right"
                    toastOptions={{
                        className: '!bg-surface !text-white !border !border-white/10 !shadow-2xl',
                        success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
                        error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } }
                    }}
                />
            </Layout>
        </Router>
    );
}

export default App;
