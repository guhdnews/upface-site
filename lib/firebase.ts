import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';
import { getFunctions } from 'firebase/functions';

// Your Firebase config - using actual Upface project credentials
const firebaseConfig = {
  apiKey: "AIzaSyBT-WPFksU6ZaK4YT7TNutoiEHbLEOKcO4",
  authDomain: "upface-site.firebaseapp.com",
  projectId: "upface-site",
  storageBucket: "upface-site.firebasestorage.app",
  messagingSenderId: "749769098149",
  appId: "1:749769098149:web:5e64d187bb57c874c5de4c",
  measurementId: "G-8SVPR754XT"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);

// Initialize Analytics (only in browser)
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;
