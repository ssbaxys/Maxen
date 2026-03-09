import { create } from 'zustand';
import { User } from 'firebase/auth';

interface AuthState {
    user: User | null;
    visualNick: string | null;
    isRoot: boolean;
    isLoading: boolean;
    setUser: (user: User | null) => void;
    setVisualNick: (nick: string | null) => void;
    setIsRoot: (isRoot: boolean) => void;
    setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    visualNick: null,
    isRoot: false,
    isLoading: true,
    setUser: (user) => set({ user }),
    setVisualNick: (visualNick) => set({ visualNick }),
    setIsRoot: (isRoot) => set({ isRoot }),
    setLoading: (isLoading) => set({ isLoading }),
}));
