"use client";

/**
 * FINBRIDGE — Auth Context (Part 02)
 * Wraps Firebase Auth state + FINBRIDGE user DB record.
 * Provides: currentUser, dbUser, loading, signOut, idToken helper.
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import {
  type User as FirebaseUser,
  onAuthStateChanged,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { type UserResponse, getMe, ApiError } from "@/lib/api";

// ─────────────────────────────────────────────
// Context type
// ─────────────────────────────────────────────

interface AuthContextValue {
  /** Firebase user object (null if not signed in) */
  firebaseUser: FirebaseUser | null;
  /** FINBRIDGE DB user (null if not registered or not signed in) */
  dbUser: UserResponse | null;
  /** Generic user alias for DashboardLayout and components */
  user: UserResponse | null;
  /** True while auth state is being determined */
  loading: boolean;
  /** Alias for loading expected by all pages */
  authLoading: boolean;
  /** True if signed in via demo mode */
  isDemo: boolean;
  /** Sign out from Firebase and clear local state */
  signOut: () => Promise<void>;
  /** Quick 1-click demo login for testing & hackathon evaluation */
  loginDemo: () => Promise<void>;
  /** Get current Firebase ID token (refreshes if needed) */
  getIdToken: () => Promise<string | null>;
}

const DEMO_USER: UserResponse = {
  id: "demo-msme-user-001",
  name: "Shree Digital Solutions",
  email: "demo@finbridge.in",
  firebase_uid: "demo-msme-user-001",
  is_active: true,
  created_at: new Date().toISOString(),
  has_business: true,
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ─────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [dbUser, setDbUser] = useState<UserResponse | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [loading, setLoading] = useState(true);

  const getIdToken = useCallback(async (): Promise<string | null> => {
    if (isDemo || (typeof window !== "undefined" && localStorage.getItem("finbridge_demo_mode") === "true")) {
      return "demo-token";
    }
    if (!firebaseUser) return null;
    try {
      return await firebaseUser.getIdToken(/* forceRefresh */ false);
    } catch {
      return null;
    }
  }, [firebaseUser, isDemo]);

  // Check initial demo mode or subscribe to Firebase auth state
  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("finbridge_demo_mode") === "true") {
      setIsDemo(true);
      setDbUser(DEMO_USER);
      setFirebaseUser({
        uid: DEMO_USER.firebase_uid,
        email: DEMO_USER.email,
        displayName: DEMO_USER.name,
        getIdToken: async () => "demo-token",
      } as unknown as FirebaseUser);
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);

      if (fbUser) {
        try {
          const token = await fbUser.getIdToken();
          const user = await getMe(token);
          setDbUser(user);
        } catch (err) {
          // User exists in Firebase but not in our DB (hasn't completed registration)
          if (err instanceof ApiError && err.statusCode === 401) {
            setDbUser(null);
          }
        }
      } else {
        setDbUser(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const loginDemo = useCallback(async () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("finbridge_demo_mode", "true");
    }
    setIsDemo(true);
    setDbUser(DEMO_USER);
    setFirebaseUser({
      uid: DEMO_USER.firebase_uid,
      email: DEMO_USER.email,
      displayName: DEMO_USER.name,
      getIdToken: async () => "demo-token",
    } as unknown as FirebaseUser);
    setLoading(false);
  }, []);

  const signOut = useCallback(async () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("finbridge_demo_mode");
    }
    setIsDemo(false);
    try {
      await firebaseSignOut(auth);
    } catch {
      // ignore
    }
    setFirebaseUser(null);
    setDbUser(null);
  }, []);

  const user = dbUser || (firebaseUser ? {
    id: firebaseUser.uid,
    name: firebaseUser.displayName || "MSME Owner",
    email: firebaseUser.email || "owner@finbridge.in",
    firebase_uid: firebaseUser.uid,
    is_active: true,
    created_at: new Date().toISOString(),
    has_business: true,
  } : (isDemo ? DEMO_USER : null));

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        dbUser,
        user,
        loading,
        authLoading: loading,
        isDemo,
        signOut,
        loginDemo,
        getIdToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within <AuthProvider>");
  }
  return ctx;
}
