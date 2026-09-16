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
  /** True while auth state is being determined */
  loading: boolean;
  /** Sign out from Firebase and clear local state */
  signOut: () => Promise<void>;
  /** Get current Firebase ID token (refreshes if needed) */
  getIdToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ─────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [dbUser, setDbUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const getIdToken = useCallback(async (): Promise<string | null> => {
    if (!firebaseUser) return null;
    try {
      return await firebaseUser.getIdToken(/* forceRefresh */ false);
    } catch {
      return null;
    }
  }, [firebaseUser]);

  // Subscribe to Firebase auth state
  useEffect(() => {
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

  const signOut = useCallback(async () => {
    await firebaseSignOut(auth);
    setFirebaseUser(null);
    setDbUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ firebaseUser, dbUser, loading, signOut, getIdToken }}
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
