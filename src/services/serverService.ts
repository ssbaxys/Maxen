import { dbService } from './db';
import { ServerData, ServerMember, StatEntry, FirewallRule, LogEntry } from '../types/firebase';

export const serverService = {

    // Subscribe to all servers (for admin)
    subscribeToAllServers: (callback: (data: Record<string, ServerData> | null) => void) => {
        return dbService.subscribe<Record<string, ServerData>>('servers', callback);
    },

    // Subscribe to a specific server
    subscribeToServer: (serverId: string, callback: (data: ServerData | null) => void) => {
        return dbService.subscribe<ServerData>(`servers/${serverId}`, callback);
    },

    // Subscriptions for Server Deep Data
    subscribeToStats: (serverId: string, callback: (data: Record<string, StatEntry> | null) => void) => {
        return dbService.subscribe<Record<string, StatEntry>>(`serverStats/${serverId}`, callback);
    },

    subscribeToLogs: (serverId: string, callback: (data: Record<string, LogEntry> | null) => void) => {
        return dbService.subscribe<Record<string, LogEntry>>(`serverLogs/${serverId}`, callback);
    },

    subscribeToFirewall: (serverId: string, callback: (data: Record<string, FirewallRule> | null) => void) => {
        return dbService.subscribe<Record<string, FirewallRule>>(`serverFirewalls/${serverId}`, callback);
    },

    subscribeToServerMembers: (serverId: string, callback: (data: Record<string, ServerMember> | null) => void) => {
        return dbService.subscribe<Record<string, ServerMember>>(`serverMembers/${serverId}`, callback);
    },

    // Core Actions
    createServer: async (data: ServerData): Promise<string | null> => {
        return dbService.push('servers', {
            ...data,
            createdAt: Date.now()
        });
    },

    updateServerStatus: async (serverId: string, status: ServerData['status']): Promise<void> => {
        return dbService.update(`servers/${serverId}`, { status });
    },

    updateServerName: async (serverId: string, name: string): Promise<void> => {
        return dbService.update(`servers/${serverId}`, { name });
    },

    updateServerVersionInfo: async (serverId: string, software: string, build: string): Promise<void> => {
        return dbService.update(`servers/${serverId}/versionInfo`, { software, build });
    },

    // Modifiers 
    addFirewallRule: async (serverId: string, rule: Omit<FirewallRule, 'id'>): Promise<string | null> => {
        return dbService.push(`serverFirewalls/${serverId}`, rule);
    },

    deleteFirewallRule: async (serverId: string, ruleId: string): Promise<void> => {
        return dbService.remove(`serverFirewalls/${serverId}/${ruleId}`);
    },

    addServerMember: async (serverId: string, userId: string, member: ServerMember): Promise<void> => {
        return dbService.update(`serverMembers/${serverId}/${userId}`, member);
    },

    removeServerMember: async (serverId: string, userId: string): Promise<void> => {
        return dbService.remove(`serverMembers/${serverId}/${userId}`);
    },

    pushServerLog: async (serverId: string, message: string, type: 'INFO' | 'WARN' | 'ERROR'): Promise<string | null> => {
        return dbService.push(`serverLogs/${serverId}`, { message, type, timestamp: Date.now() });
    },

    pushServerStatTick: async (serverId: string, stat: StatEntry): Promise<string | null> => {
        // Warning: This writes 1 entry per second in simulation. Heavy on writes, only use while a client is physically watching in our simple architecture!
        return dbService.push(`serverStats/${serverId}`, stat);
    },

    deleteServerStats: async (serverId: string): Promise<void> => {
        return dbService.remove(`serverStats/${serverId}`);
    },

    deleteServer: async (serverId: string): Promise<void> => {
        await Promise.all([
            dbService.remove(`servers/${serverId}`),
            dbService.remove(`serverMembers/${serverId}`),
            dbService.remove(`serverLogs/${serverId}`),
            dbService.remove(`serverStats/${serverId}`),
            dbService.remove(`serverFirewalls/${serverId}`)
        ]);
    }
};
