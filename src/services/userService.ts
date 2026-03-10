import { dbService } from './db';
import { UserData, GlobalSettings } from '../types/firebase';

export const userService = {

    // Subscribe to a specific user's data
    subscribeToUser: (uid: string, callback: (data: UserData | null) => void) => {
        return dbService.subscribe<UserData>(`users/${uid}`, callback);
    },

    // Get user data once
    getUser: async (uid: string): Promise<UserData | null> => {
        return dbService.get<UserData>(`users/${uid}`);
    },

    // Create or update user data
    updateUser: async (uid: string, data: Partial<UserData>): Promise<void> => {
        return dbService.update(`users/${uid}`, data);
    },

    // Claim a unique username
    claimUsername: async (username: string, uid: string): Promise<boolean> => {
        try {
            const existing = await dbService.get(`usernames/${username}`);
            if (existing) return false;

            await dbService.set(`usernames/${username}`, uid);
            await dbService.update(`users/${uid}`, { visualNick: username });
            return true;
        } catch (e) {
            return false;
        }
    },

    // Update specific preferences
    updatePreferences: async (uid: string, preferences: Partial<UserData['preferences']>): Promise<void> => {
        // Fetch current to avoid overwriting all preferences
        const currentUser = await dbService.get<UserData>(`users/${uid}`);
        const currentPrefs = currentUser?.preferences || {};

        return dbService.update(`users/${uid}`, {
            preferences: { ...currentPrefs, ...preferences }
        });
    },

    // Subscribe to global settings
    subscribeToSettings: (callback: (data: GlobalSettings | null) => void) => {
        return dbService.subscribe<GlobalSettings>('settings', callback);
    }
};
