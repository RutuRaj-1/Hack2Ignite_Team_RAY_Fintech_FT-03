/**
 * FINBRIDGE — Auth Context
 * Wraps Firebase Auth state + FINBRIDGE user DB record.
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

interface AuthContextValue {
  firebaseUser: FirebaseUser | null;
  dbUser: UserResponse | null;
  user: UserResponse | null;
  loading: boolean;
  authLoading: boolean;
  isDemo: boolean;
  signOut: () => Promise<void>;
  loginDemo: () => Promise<void>;
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [dbUser, setDbUser] = useState<UserResponse | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [loading, setLoading] = useState(true);

  const getIdToken = useCallback(async (): Promise<string | null> => {
    if (isDemo || localStorage.getItem("finbridge_demo_mode") === "true") {
      return "demo-token";
    }
    if (!firebaseUser) return null;
    try {
      return await firebaseUser.getIdToken(false);
    } catch {
      return null;
    }
  }, [firebaseUser, isDemo]);

  useEffect(() => {
    if (localStorage.getItem("finbridge_demo_mode") === "true") {
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

    let unsubscribe = () => {};
    try {
      if (auth && auth.app) {
        unsubscribe = onAuthStateChanged(
          auth,
          async (fbUser) => {
            setFirebaseUser(fbUser);

            if (fbUser) {
              try {
                const token = await fbUser.getIdToken();
                const user = await getMe(token);
                setDbUser(user);
              } catch (err) {
                if (err instanceof ApiError && err.statusCode === 401) {
                  setDbUser(null);
                }
              }
            } else {
              setDbUser(null);
            }

            setLoading(false);
          },
          (error) => {
            console.warn("Auth state change error:", error);
            setLoading(false);
          }
        );
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.warn("Firebase Auth listener error:", err);
      setLoading(false);
    }

    return () => {
      try {
        unsubscribe();
      } catch {
        // ignore
      }
    };
  }, []);

  const loginDemo = useCallback(async () => {
    localStorage.setItem("finbridge_demo_mode", "true");
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
    localStorage.removeItem("finbridge_demo_mode");
    setIsDemo(false);
    try {
      await firebaseSignOut(auth);
    } catch {
      // ignore
    }
    setFirebaseUser(null);
    setDbUser(null);
  }, []);

  const user =
    dbUser ||
    (firebaseUser
      ? {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || "MSME Owner",
          email: firebaseUser.email || "owner@finbridge.in",
          firebase_uid: firebaseUser.uid,
          is_active: true,
          created_at: new Date().toISOString(),
          has_business: true,
        }
      : isDemo
      ? DEMO_USER
      : null);

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

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within <AuthProvider>");
  }
  return ctx;
}
