import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
    theme: 'dark' | 'light';
    colorblindMode: boolean;
    volume: number;
    voiceoverEnabled: boolean;
    setTheme: (theme: 'dark' | 'light') => void;
    setColorblindMode: (enabled: boolean) => void;
    setVolume: (volume: number) => void;
    setVoiceover: (enabled: boolean) => void;
}

export const useUIStore = create<UIState>()(
    persist(
        (set) => ({
            theme: 'dark',
            colorblindMode: false,
            volume: 100,
            voiceoverEnabled: false,
            setTheme: (theme) => set({ theme }),
            setColorblindMode: (colorblindMode) => set({ colorblindMode }),
            setVolume: (volume) => set({ volume }),
            setVoiceover: (voiceoverEnabled) => set({ voiceoverEnabled }),
        }),
        {
            name: 'maxen-ui-storage',
        }
    )
);
