import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
    theme: 'dark' | 'light';
    colorblindMode: boolean;
    volume: number;
    voiceOver: boolean;
    setTheme: (theme: 'dark' | 'light') => void;
    setColorblindMode: (enabled: boolean) => void;
    setVolume: (volume: number) => void;
    setVoiceOver: (enabled: boolean) => void;
}

export const useUIStore = create<UIState>()(
    persist(
        (set) => ({
            theme: 'dark',
            colorblindMode: false,
            volume: 50,
            voiceOver: false,
            setTheme: (theme) => set({ theme }),
            setColorblindMode: (enabled) => set({ colorblindMode: enabled }),
            setVolume: (volume) => set({ volume }),
            setVoiceOver: (enabled) => set({ voiceOver: enabled }),
        }),
        {
            name: 'maxen-ui-store',
        }
    )
);
