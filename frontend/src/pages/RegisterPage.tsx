import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { registerUser, loginUser, ApiError } from "@/lib/api";
import { User, Lock, Mail, ArrowRight, ShieldCheck, AlertCircle, Loader2, CheckCircle2, Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }
    setLoading(true);
    try {
      let idToken: string;
      try {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        try { await updateProfile(cred.user, { displayName: name }); } catch { /* non-fatal */ }
        idToken = await cred.user.getIdToken();
      } catch (fbErr: any) {
        if (fbErr?.code === "auth/email-already-in-use") {
          // Account already created in Firebase — authenticate directly with provided password
          const cred = await signInWithEmailAndPassword(auth, email, password);
          idToken = await cred.user.getIdToken();
        } else {
          throw fbErr;
        }
      }

      // Sync user profile to backend
      const res = await registerUser(idToken, name.trim() || "MSME Owner", email.trim());
      navigate(res.user.has_business ? "/dashboard" : "/onboarding");
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else if (err && typeof err === "object" && "code" in err) {
        const fbErr = err as { code: string; message: string };
        const map: Record<string, string> = {
          "auth/email-already-in-use": "An account with this email already exists. Please sign in.",
          "auth/wrong-password": "An account with this email exists, but the password was incorrect. Please sign in.",
          "auth/invalid-credential": "An account with this email exists, but credentials didn't match. Please sign in.",
          "auth/invalid-email": "Invalid email address format.",
          "auth/weak-password": "Password is too weak. Choose a stronger one (min 6 chars).",
        };
        setError(map[fbErr.code] || fbErr.message || "Failed to create account.");
      } else {
        setError("An unexpected error occurred during registration. Please verify your details.");
      }
    } finally {
      setLoading(false);
    }
  };

  const strength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const strengthColors = ["transparent", "#ef4444", "#f59e0b", "#10b981"];
  const strengthLabels = ["", "Weak", "Good", "Strong"];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: "var(--bg-base)" }}>
      <div className="glow-blob glow-blob-purple w-[500px] h-[500px] -top-40 -right-40" />
      <div className="glow-blob glow-blob-blue w-[400px] h-[400px] bottom-0 -left-20" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8 animate-fade-in-up">
          <Link to="/" className="inline-flex items-center gap-3 group mb-5">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-105"
              style={{ background: "var(--grad-brand)", boxShadow: "0 8px 24px rgba(37,99,235,0.4)" }}>
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">FIN<span className="text-blue-400">BRIDGE</span></span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Create your account</h1>
          <p className="text-sm text-slate-400 mt-1">Join MSMEs unlocking AI-powered micro-lending</p>
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
              <label>Full Name</label>
              <div className="input-icon">
                <User className="icon w-4 h-4" />
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Your business name" className="input" />
              </div>
            </div>

            <div>
              <label>Business Email</label>
              <div className="input-icon">
                <Mail className="icon w-4 h-4" />
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@business.com" className="input" />
              </div>
            </div>

            <div>
              <label>Password</label>
              <div className="input-icon">
                <Lock className="icon w-4 h-4" />
                <input
                  type={showPw ? "text" : "password"}
                  required value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="input" style={{ paddingRight: "2.75rem" }}
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex-1 h-1 rounded-full transition-all duration-300"
                        style={{ background: i <= strength ? strengthColors[strength] : "rgba(255,255,255,0.06)" }} />
                    ))}
                  </div>
                  <p className="text-[11px] font-mono" style={{ color: strengthColors[strength] }}>
                    {strengthLabels[strength]}
                  </p>
                </div>
              )}
            </div>

            <div>
              <label>Confirm Password</label>
              <div className="input-icon">
                <Lock className="icon w-4 h-4" />
                <input
                  type="password" required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="input"
                />
              </div>
              {confirmPassword && (
                <p className={`text-[11px] font-mono mt-1 ${password === confirmPassword ? "text-emerald-400" : "text-red-400"}`}>
                  {password === confirmPassword ? "✓ Passwords match" : "✗ Passwords don't match"}
                </p>
              )}
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary w-full mt-2">
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /><span>Creating Account...</span></>
              ) : (
                <><span>Continue to Business Profile</span><ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <div className="mt-5 pt-5 border-t text-center" style={{ borderColor: "var(--border-subtle)" }}>
            <p className="text-sm text-slate-400">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">Sign in</Link>
            </p>
          </div>
        </div>

        {/* Trust badges */}
        <div className="mt-4 flex items-center justify-center gap-6">
          {[["Bank-Grade Encryption"], ["Instant Eligibility Check"]].map(([label]) => (
            <div key={label} className="flex items-center gap-1.5 text-xs text-slate-500">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
