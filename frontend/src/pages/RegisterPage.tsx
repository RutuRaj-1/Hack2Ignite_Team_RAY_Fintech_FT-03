import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { registerUser, loginUser, ApiError } from "@/lib/api";
import { User, Lock, Mail, ArrowRight, AlertCircle, Loader2, CheckCircle2, Eye, EyeOff, Shield } from "lucide-react";

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
          const cred = await signInWithEmailAndPassword(auth, email, password);
          idToken = await cred.user.getIdToken();
        } else {
          throw fbErr;
        }
      }
      const res = await registerUser(idToken, name.trim() || "MSME Owner", email.trim());
      navigate(res.user.has_business ? "/dashboard" : "/onboarding");
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else if (err && typeof err === "object" && "code" in err) {
        const fbErr = err as { code: string; message: string };
        const map: Record<string, string> = {
          "auth/email-already-in-use": "An account with this email exists. Please sign in.",
          "auth/wrong-password": "Credentials didn't match. Please sign in.",
          "auth/invalid-credential": "Credentials didn't match. Please sign in.",
          "auth/invalid-email": "Invalid email address format.",
          "auth/weak-password": "Password too weak (min 6 characters).",
        };
        setError(map[fbErr.code] || fbErr.message || "Failed to create account.");
      } else {
        setError("An unexpected error occurred. Please verify your details.");
      }
    } finally {
      setLoading(false);
    }
  };

  const strength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const strengthColors = ["transparent", "var(--danger)", "var(--warning)", "var(--success)"];
  const strengthLabels = ["", "Weak", "Good", "Strong"];

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--background)" }}>
      <div className="fixed inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse at 80% 20%, rgba(61,165,166,0.06) 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, rgba(22,156,115,0.04) 0%, transparent 60%)",
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
          <h1 className="text-h2" style={{ color: "var(--brand-900)" }}>Create your account</h1>
          <p className="mt-1" style={{ color: "var(--text-muted)", fontSize: "14px" }}>
            Join MSMEs unlocking AI-powered micro-lending
          </p>
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
              <label>Full Name</label>
              <div className="input-icon">
                <User className="icon w-4 h-4" />
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="Your business name" className="input" id="register-name" />
              </div>
            </div>

            <div>
              <label>Business Email</label>
              <div className="input-icon">
                <Mail className="icon w-4 h-4" />
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="owner@enterprise.in" className="input" id="register-email" />
              </div>
            </div>

            <div>
              <label>Password</label>
              <div className="input-icon relative">
                <Lock className="icon w-4 h-4" />
                <input type={showPw ? "text" : "password"} required value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters" className="input"
                  style={{ paddingRight: "2.75rem" }} id="register-password" />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: "var(--text-muted)" }}
                  aria-label={showPw ? "Hide password" : "Show password"}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex-1 h-1 rounded-full transition-all"
                        style={{ background: i <= strength ? strengthColors[strength] : "var(--border)" }} />
                    ))}
                  </div>
                  <p className="text-xs font-medium" style={{ color: strengthColors[strength] }}>
                    {strengthLabels[strength]}
                  </p>
                </div>
              )}
            </div>

            <div>
              <label>Confirm Password</label>
              <div className="input-icon">
                <Lock className="icon w-4 h-4" />
                <input type="password" required value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password" className="input" id="register-confirm-password" />
              </div>
              {confirmPassword && (
                <p className="text-xs font-medium mt-1"
                  style={{ color: password === confirmPassword ? "var(--success)" : "var(--danger)" }}>
                  {password === confirmPassword ? "✓ Passwords match" : "✗ Passwords don't match"}
                </p>
              )}
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary w-full mt-2" id="register-submit">
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /><span>Creating Account...</span></>
              ) : (
                <><span>Continue to Business Profile</span><ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <div className="mt-5 pt-5 text-center" style={{ borderTop: "1px solid var(--border)" }}>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Already have an account?{" "}
              <Link to="/login" className="font-semibold transition-colors" style={{ color: "var(--brand-700)" }}>
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Trust indicators */}
        <div className="mt-4 flex items-center justify-center gap-6">
          {["Bank-Grade Encryption", "Instant Eligibility Check"].map((label) => (
            <div key={label} className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
              <CheckCircle2 className="w-3.5 h-3.5" style={{ color: "var(--success)" }} />
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
