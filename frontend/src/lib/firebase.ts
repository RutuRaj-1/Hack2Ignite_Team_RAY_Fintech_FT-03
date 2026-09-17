/**
 * FINBRIDGE — Firebase Client Configuration
 * Real Firebase project: finbridge-da1d1
 */

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyBtQgYoay-BhXvyQZ0OXiFTIXqyiY5uu4Y",
  authDomain: "finbridge-da1d1.firebaseapp.com",
  projectId: "finbridge-da1d1",
  storageBucket: "finbridge-da1d1.firebasestorage.app",
  messagingSenderId: "875010250826",
  appId: "1:875010250826:web:a83124ccda46461a0e6eb3",
  measurementId: "G-GGJ0MPB80D",
};

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || DEFAULT_FIREBASE_CONFIG.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || DEFAULT_FIREBASE_CONFIG.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || DEFAULT_FIREBASE_CONFIG.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || DEFAULT_FIREBASE_CONFIG.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || DEFAULT_FIREBASE_CONFIG.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || DEFAULT_FIREBASE_CONFIG.appId,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || DEFAULT_FIREBASE_CONFIG.measurementId,
};

// Singleton pattern with fail-safe initialization
let firebaseApp: FirebaseApp;
try {
  firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
} catch (err) {
  console.warn("Firebase App initialization warning:", err);
  firebaseApp = getApps().length === 0 ? initializeApp(DEFAULT_FIREBASE_CONFIG) : getApp();
}

let authInstance: Auth;
try {
  authInstance = getAuth(firebaseApp);
} catch (err) {
  console.error("Firebase Auth initialization error:", err);
  // Fallback to avoid breaking entire client bundle
  authInstance = {} as Auth;
}

export const auth: Auth = authInstance;

// Initialize analytics only in browser context
if (typeof window !== "undefined") {
  try {
    getAnalytics(firebaseApp);
  } catch {
    // Analytics may fail in some environments — non-fatal
  }
}

export default firebaseApp;
