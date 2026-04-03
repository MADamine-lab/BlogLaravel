// Firebase Configuration
// Replace these values with your Firebase project credentials
// Get these from: https://console.firebase.google.com/

import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBJYkI5laObVR5xO5e29rPVX6zVlkGwsu8",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "blogproject-7c05f.firebaseapp.com",
    databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://blogproject-7c05f-default-rtdb.firebaseio.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "blogproject-7c05f",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "blogproject-7c05f.firebasestorage.app",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "181233164356",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:181233164356:web:c5053c21335f12cfc29c11",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database
export const db = getDatabase(app);

// Initialize Firestore
export const firestore = getFirestore(app);

export default app;
