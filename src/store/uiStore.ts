import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
    theme: 'dark' | 'light';
    colorblindMode: boolean;
    volume: number;
    voiceoverEnabled: boolean;
    language: 'en' | 'ru';
    setTheme: (theme: 'dark' | 'light') => void;
    setColorblindMode: (enabled: boolean) => void;
    setVolume: (volume: number) => void;
    setVoiceover: (enabled: boolean) => void;
    setLanguage: (lang: 'en' | 'ru') => void;
}

export const useUIStore = create<UIState>()(
    persist(
        (set) => ({
            theme: 'dark',
            colorblindMode: false,
            volume: 100,
            voiceoverEnabled: false,
            language: 'en',
            setTheme: (theme) => set({ theme }),
            setColorblindMode: (colorblindMode) => set({ colorblindMode }),
            setVolume: (volume) => set({ volume }),
            setVoiceover: (voiceoverEnabled) => set({ voiceoverEnabled }),
            setLanguage: (language) => set({ language }),
        }),
        {
            name: 'maxen-ui-storage',
        }
    )
);
