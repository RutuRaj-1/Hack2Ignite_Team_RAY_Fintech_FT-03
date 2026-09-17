import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { loginUser, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle, Loader2, Zap, Eye, EyeOff } from "lucide-react";

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
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: "var(--bg-base)" }}>
      {/* Background */}
      <div className="glow-blob glow-blob-blue w-[500px] h-[500px] -top-40 -left-40" />
      <div className="glow-blob glow-blob-purple w-[400px] h-[400px] bottom-0 right-0" />
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: "linear-gradient(rgba(59,130,246,1) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,1) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8 animate-fade-in-up">
          <Link to="/" className="inline-flex items-center gap-3 group mb-5">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-105"
              style={{ background: "var(--grad-brand)", boxShadow: "0 8px 24px rgba(37,99,235,0.4)" }}>
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">
              FIN<span className="text-blue-400">BRIDGE</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          <p className="text-sm text-slate-400 mt-1">Sign in to your credit intelligence hub</p>
        </div>

        {/* Card */}
        <div className="card p-7 animate-fade-in-up delay-100">
          {error && (
            <div className="alert alert-error mb-5">
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="owner@enterprise.in"
                  className="input"
                />
              </div>
            </div>

            <div>
              <label>Password</label>
              <div className="input-icon">
                <Lock className="icon w-4 h-4" />
                <input
                  type={showPw ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input"
                  style={{ paddingRight: "2.75rem" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary w-full mt-2">
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /><span>Verifying...</span></>
              ) : (
                <><span>Sign In</span><ArrowRight className="w-4 h-4" /></>
              )}
            </button>

            <div className="divider-text my-2">Or Fast Evaluation</div>

            <button
              type="button"
              onClick={async () => { await loginDemo(); navigate("/dashboard"); }}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5"
              style={{ background: "rgba(245,158,11,0.08)", color: "#fbbf24", border: "1px solid rgba(245,158,11,0.25)" }}
            >
              <Zap className="w-3.5 h-3.5" />
              Enter as Demo MSME Owner
            </button>
          </form>

          <div className="mt-5 pt-5 border-t text-center" style={{ borderColor: "var(--border-subtle)" }}>
            <p className="text-sm text-slate-400">
              Don't have an account?{" "}
              <Link to="/register" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                Create account
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-slate-600 mt-5">
          FINBRIDGE Secure Architecture • FT-03 Primary Engine
        </p>
      </div>
    </div>
  );
}
