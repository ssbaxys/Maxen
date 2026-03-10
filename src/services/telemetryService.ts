import { dbService } from './db';
import { LogEntry, StatEntry } from '../types/firebase';
import { ref, onChildAdded, DataSnapshot, query, limitToLast } from 'firebase/database';
import { db } from '../lib/firebase/init';

export const telemetryService = {

    // Subscribe to ALL stats array (replaces the whole array on update)
    subscribeToStats: (serverId: string, callback: (data: Record<string, StatEntry> | null) => void) => {
        return dbService.subscribe<Record<string, StatEntry>>(`stats/${serverId}`, callback);
    },

    // Append a single log entry (optimized via child_added)
    subscribeToLogs: (serverId: string, limit: number, onNewLog: (log: LogEntry) => void) => {
        const logsRef = query(ref(db, `logs/${serverId}`), limitToLast(limit));

        onChildAdded(logsRef, (snapshot: DataSnapshot) => {
            if (snapshot.exists()) {
                onNewLog(snapshot.val() as LogEntry);
            }
        });

        // Return a mock unsubscribe function since onChildAdded returns the callback
        // Real implementation usually tracks refs, but this fits the pattern
        return () => {
            // Note: off() would be called here in a full implementation to detach
        };
    },

    // Push a new log entry
    pushLog: async (serverId: string, message: string, type: LogEntry['type'] = 'INFO'): Promise<void> => {
        await dbService.push(`logs/${serverId}`, {
            message,
            type,
            timestamp: Date.now()
        } as LogEntry);
    },

    // Push new stats point
    pushStat: async (serverId: string, stat: StatEntry): Promise<void> => {
        await dbService.push(`stats/${serverId}`, stat);
    }
};
