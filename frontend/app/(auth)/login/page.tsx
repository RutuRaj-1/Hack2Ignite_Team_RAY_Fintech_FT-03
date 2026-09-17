"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { loginUser, ApiError } from "@/lib/api";
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const { loginDemo } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // 1. Authenticate with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken();

      // 2. Authenticate with FINBRIDGE Backend
      const response = await loginUser(idToken);

      // 3. Navigate based on profile status
      if (response.user.has_business) {
        router.push("/dashboard");
      } else {
        router.push("/onboarding");
      }
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else if (err && typeof err === "object" && "code" in err) {
        const fbErr = err as { code: string; message: string };
        switch (fbErr.code) {
          case "auth/invalid-credential":
          case "auth/user-not-found":
          case "auth/wrong-password":
            setError("Invalid email or password. Please verify your credentials.");
            break;
          case "auth/too-many-requests":
            setError("Too many failed attempts. Please reset your password or try again later.");
            break;
          case "auth/network-request-failed":
            setError("Network error. Please check your internet connection.");
            break;
          default:
            setError(fbErr.message || "Failed to sign in. Please try again.");
        }
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-[#0D1117] relative overflow-hidden">
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">
              FIN<span className="text-blue-500">BRIDGE</span>
            </span>
          </Link>
          <h1 className="text-2xl font-semibold text-gray-100">Welcome back</h1>
          <p className="text-sm text-gray-400 mt-1">
            Sign in to access your credit intelligence and micro-lending hub
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-[#161B22]/90 border border-gray-800/80 backdrop-blur-xl rounded-2xl p-8 shadow-2xl">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm text-red-200">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-gray-300 uppercase tracking-wider mb-2">
                Business Email
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="owner@enterprise.in"
                  className="w-full bg-[#0D1117] border border-gray-700/80 rounded-xl pl-11 pr-4 py-3 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="w-5 h-5 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#0D1117] border border-gray-700/80 rounded-xl pl-11 pr-4 py-3 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold uppercase tracking-wider rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_#000] flex items-center justify-center gap-2 transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="relative my-4 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700/80"></div>
              </div>
              <span className="relative px-3 bg-[#111726] text-[11px] font-mono uppercase text-gray-400 font-bold">
                Or Fast Evaluation
              </span>
            </div>

            <button
              type="button"
              onClick={async () => {
                await loginDemo();
                router.push("/dashboard");
              }}
              className="w-full py-3 px-4 bg-[#182236] hover:bg-[#1f2b45] text-amber-300 text-xs font-mono font-bold uppercase tracking-wider rounded-xl border-2 border-amber-500/40 shadow-[3px_3px_0px_0px_#000] flex items-center justify-center gap-2 transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] cursor-pointer"
            >
              <span>⚡ Enter as Demo MSME Owner</span>
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-gray-800/80 text-center">
            <p className="text-sm text-gray-400">
              Don&apos;t have an account yet?{" "}
              <Link
                href="/register"
                className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>

        {/* Demo / Hackathon evaluation tip */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            FINBRIDGE Secure Micro-Lending Architecture • FT-03 Primary Engine
          </p>
        </div>
      </div>
    </main>
  );
}
