/**
 * FINBRIDGE — Firebase Client Configuration
 * Real Firebase project: finbridge-da1d1
 */

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBtQgYoay-BhXvyQZ0OXiFTIXqyiY5uu4Y",
  authDomain: "finbridge-da1d1.firebaseapp.com",
  projectId: "finbridge-da1d1",
  storageBucket: "finbridge-da1d1.firebasestorage.app",
  messagingSenderId: "875010250826",
  appId: "1:875010250826:web:a83124ccda46461a0e6eb3",
  measurementId: "G-GGJ0MPB80D",
};

// Singleton pattern — prevent re-initialization during hot reload
const firebaseApp: FirebaseApp =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth: Auth = getAuth(firebaseApp);

// Initialize analytics only in browser context
if (typeof window !== "undefined") {
  try {
    getAnalytics(firebaseApp);
  } catch {
    // Analytics may fail in some environments — non-fatal
  }
}

export default firebaseApp;
