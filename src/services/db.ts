import { ref, onValue, set, update, push, remove, DataSnapshot } from 'firebase/database';
import { db } from '../lib/firebase/init';

// Generic service for reading and writing to Realtime Database
export const dbService = {
    // Listen to changes at a specific path
    subscribe: <T>(path: string, callback: (data: T | null) => void) => {
        const dbRef = ref(db, path);
        const unsubscribe = onValue(dbRef, (snapshot: DataSnapshot) => {
            if (snapshot.exists()) {
                callback(snapshot.val() as T);
            } else {
                callback(null);
            }
        });
        return unsubscribe;
    },

    // Read once (useful for initialization checks)
    get: async <T>(path: string): Promise<T | null> => {
        return new Promise((resolve) => {
            const dbRef = ref(db, path);
            onValue(dbRef, (snapshot) => {
                if (snapshot.exists()) {
                    resolve(snapshot.val() as T);
                } else {
                    resolve(null);
                }
            }, { onlyOnce: true });
        });
    },

    // Write completely new data (overwrites)
    set: async (path: string, data: any): Promise<void> => {
        const dbRef = ref(db, path);
        return set(dbRef, data);
    },

    // Update specific child keys 
    update: async (path: string, data: any): Promise<void> => {
        const dbRef = ref(db, path);
        return update(dbRef, data);
    },

    // Push new item to a list and return the generated key
    push: async (path: string, data: any): Promise<string | null> => {
        const dbRef = ref(db, path);
        const newRef = push(dbRef);
        await set(newRef, data);
        return newRef.key;
    },

    // Delete data at a path
    remove: async (path: string): Promise<void> => {
        const dbRef = ref(db, path);
        return remove(dbRef);
    }
};
