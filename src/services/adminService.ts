import { dbService } from './db';
import { UserData, ServerData, AdminLog, BanData } from '../types/firebase';

export const adminService = {
    // Fetch all global logs
    subscribeToLogs: (callback: (logs: AdminLog[]) => void) => {
        return dbService.subscribe<Record<string, AdminLog>>('logs', (data) => {
            if (!data) return callback([]);

            // Convert Record to Array and insert ID
            const logsArray = Object.entries(data).map(([key, value]) => ({
                ...value,
                id: key
            }));

            // Sort by newest by default
            callback(logsArray.sort((a, b) => b.timestamp - a.timestamp));
        });
    },

    // Push a new global log
    createLog: async (log: Omit<AdminLog, 'id'>) => {
        return dbService.push('logs', log);
    },

    // Subscribe to all users (Requires Root Rules in DB)
    subscribeToAllUsers: (callback: (users: Record<string, UserData>) => void) => {
        return dbService.subscribe<Record<string, UserData>>('users', (data) => {
            callback(data || {});
        });
    },

    // Subscribe to all servers globally (Requires Root Rules in DB)
    subscribeToAllServers: (callback: (servers: Record<string, ServerData>) => void) => {
        return dbService.subscribe<Record<string, ServerData>>('servers', (data) => {
            callback(data || {});
        });
    },

    // Update user ban data
    updateUserBan: async (uid: string, banData: BanData | null) => {
        return dbService.update(`users/${uid}`, { banData });
    },

    // Delete a user entirely
    deleteUser: async (uid: string) => {
        // Warning: This only deletes DB record, not Firebase Auth record directly from client.
        // True Auth deletion usually requires Cloud Functions.
        return dbService.remove(`users/${uid}`);
    },

    // Admin server deletion
    deleteServer: async (serverId: string) => {
        return dbService.remove(`servers/${serverId}`);
    }
};
