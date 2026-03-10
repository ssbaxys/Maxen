import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getAnalytics, Analytics } from "firebase/analytics";
import { firebaseConfig } from "./config";

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getDatabase(app);

// Initialize Analytics conditionally (only in browser environment if supported)
export let analytics: Analytics | null = null;
if (typeof window !== 'undefined') {
    analytics = getAnalytics(app);
}
