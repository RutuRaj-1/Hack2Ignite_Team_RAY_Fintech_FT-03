import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { loginUser, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import {
  Lock, Mail, ArrowRight, AlertCircle, Loader2, Zap, Eye, EyeOff, Shield,
} from "lucide-react";

export default function LoginPage() {
  const navigate = useNavigate();
  const { loginDemo } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await cred.user.getIdToken();
      try {
        const response = await loginUser(idToken);
        navigate(response.user.has_business ? "/dashboard" : "/onboarding");
      } catch {
        navigate("/dashboard");
      }
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else if (err && typeof err === "object" && "code" in err) {
        const fbErr = err as { code: string; message: string };
        const map: Record<string, string> = {
          "auth/invalid-credential": "Invalid email or password.",
          "auth/user-not-found": "No account found with this email.",
          "auth/wrong-password": "Incorrect password.",
          "auth/too-many-requests": "Too many attempts. Please try later.",
          "auth/network-request-failed": "Network error. Check your connection.",
        };
        setError(map[fbErr.code] || fbErr.message || "Failed to sign in.");
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--background)" }}>
      {/* Subtle Background Gradient */}
      <div className="fixed inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse at 20% 20%, rgba(61,165,166,0.06) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(22,156,115,0.04) 0%, transparent 60%)",
      }} />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8 animate-fade-in-up">
          <Link to="/" className="inline-flex items-center gap-3 group mb-5">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105"
              style={{ background: "var(--brand-700)", boxShadow: "0 8px 24px rgba(35,114,119,0.3)" }}>
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight" style={{ color: "var(--brand-900)", letterSpacing: "-0.03em" }}>
              Fin<span style={{ color: "var(--brand-600)" }}>Bridge</span>
            </span>
          </Link>
          <h1 className="text-h2" style={{ color: "var(--brand-900)" }}>Welcome back</h1>
          <p className="mt-1" style={{ color: "var(--text-muted)", fontSize: "14px" }}>Sign in to your financial intelligence hub</p>
        </div>

        {/* Card */}
        <div className="card p-7 animate-fade-in-up delay-100">
          {error && (
            <div className="alert alert-danger mb-5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label>Business Email</label>
              <div className="input-icon">
                <Mail className="icon w-4 h-4" />
                <input
                  type="email" required
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="owner@enterprise.in"
                  className="input"
                  id="login-email"
                />
              </div>
            </div>

            <div>
              <label>Password</label>
              <div className="input-icon relative">
                <Lock className="icon w-4 h-4" />
                <input
                  type={showPw ? "text" : "password"} required
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input"
                  style={{ paddingRight: "2.75rem" }}
                  id="login-password"
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: "var(--text-muted)" }}
                  aria-label={showPw ? "Hide password" : "Show password"}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary w-full mt-2" id="login-submit">
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /><span>Verifying...</span></>
              ) : (
                <><span>Sign In</span><ArrowRight className="w-4 h-4" /></>
              )}
            </button>

            <div className="divider-text my-1">
              <span>Or</span>
            </div>

            <button
              type="button"
              onClick={async () => { await loginDemo(); navigate("/dashboard"); }}
              className="w-full btn"
              id="demo-login-btn"
              style={{
                background: "var(--warning-soft)",
                color: "var(--warning-text)",
                border: "1px solid rgba(216,155,34,0.3)",
                justifyContent: "center",
                gap: "0.5rem",
              }}
            >
              <Zap className="w-4 h-4" />
              Enter as Demo MSME Owner
            </button>
          </form>

          <div className="mt-5 pt-5 text-center" style={{ borderTop: "1px solid var(--border)" }}>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Don't have an account?{" "}
              <Link to="/register" className="font-semibold transition-colors" style={{ color: "var(--brand-700)" }}>
                Create account
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs mt-5" style={{ color: "var(--text-muted)" }}>
          FinBridge Secure Platform • MSME Financial Intelligence
        </p>
      </div>
    </div>
  );
}
