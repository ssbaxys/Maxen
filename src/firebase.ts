import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBXVJzcz5krKz6UbCoUmD8LEzRr6JQdMoU",
    authDomain: "maxen-host.firebaseapp.com",
    databaseURL: "https://maxen-host-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "maxen-host",
    storageBucket: "maxen-host.firebasestorage.app",
    messagingSenderId: "812394006704",
    appId: "1:812394006704:web:46f2856a9f11a0be1f5375",
    measurementId: "G-7X0TBR1W66"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
