import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { createBusiness, ApiError } from "@/lib/api";
import { Building2, MapPin, Calendar, IndianRupee, Briefcase, ArrowRight, CheckCircle2, Loader2, AlertCircle } from "lucide-react";

const BUSINESS_TYPES = ["Retail", "Manufacturing", "Services", "Agriculture", "Food & Beverage", "E-commerce", "Healthcare", "Education", "Transport", "Other"];
const LOCATIONS = ["Maharashtra", "Delhi", "Karnataka", "Tamil Nadu", "Gujarat", "Rajasthan", "West Bengal", "Telangana", "Andhra Pradesh", "Other"];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { getIdToken } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    business_name: "", business_type: "", location: "", business_age: "", annual_turnover: "",
  });

  const update = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      const token = await getIdToken();
      if (!token) throw new Error("Not authenticated");
      await createBusiness(token, {
        business_name: form.business_name,
        business_type: form.business_type || undefined,
        location: form.location || undefined,
        business_age: form.business_age ? parseInt(form.business_age) : undefined,
        annual_turnover: form.annual_turnover || undefined,
      });
      navigate("/dashboard");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to create business profile.");
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { n: 1, label: "Business Info" },
    { n: 2, label: "Location & Age" },
    { n: 3, label: "Financials" },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--background)" }}>
      <div className="fixed inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse at 50% 0%, rgba(61,165,166,0.07) 0%, transparent 70%)",
      }} />

      <div className="w-full max-w-lg relative z-10">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-float"
            style={{ background: "var(--brand-700)", boxShadow: "0 8px 24px rgba(35,114,119,0.3)" }}>
            <Building2 className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-h1 mb-1">Business Profile Setup</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
            Tell us about your business for accurate credit scoring
          </p>
        </div>

        {/* Step Indicators */}
        <div className="flex items-center justify-center gap-2 mb-8 animate-fade-in-up delay-100">
          {steps.map((s, i) => (
            <div key={s.n} className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                  style={{
                    background: step > s.n ? "var(--success)" : step === s.n ? "var(--brand-700)" : "var(--border)",
                    color: step >= s.n ? "#fff" : "var(--text-muted)",
                  }}>
                  {step > s.n ? <CheckCircle2 size={14} /> : s.n}
                </div>
                <span className="text-xs font-medium" style={{ color: step >= s.n ? "var(--text-primary)" : "var(--text-muted)" }}>
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className="w-8 h-px" style={{ background: step > s.n ? "var(--success)" : "var(--border)" }} />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="card p-7 animate-fade-in-up delay-200">
          {error && (
            <div className="alert alert-danger mb-5">
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <h2 className="font-bold mb-4" style={{ color: "var(--brand-900)", fontSize: "18px" }}>Business Identity</h2>
              <div>
                <label>Business Name *</label>
                <div className="input-icon">
                  <Building2 className="icon w-4 h-4" />
                  <input className="input" type="text" required value={form.business_name}
                    onChange={(e) => update("business_name", e.target.value)}
                    placeholder="Shree Digital Solutions" id="biz-name" />
                </div>
              </div>
              <div>
                <label>Business Type</label>
                <select className="input" value={form.business_type}
                  onChange={(e) => update("business_type", e.target.value)}>
                  <option value="">Select type...</option>
                  {BUSINESS_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <button className="btn btn-primary w-full mt-2"
                onClick={() => form.business_name && setStep(2)}
                disabled={!form.business_name}>
                Next Step <ArrowRight size={16} />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="font-bold mb-4" style={{ color: "var(--brand-900)", fontSize: "18px" }}>Location & Age</h2>
              <div>
                <label>State / Location</label>
                <select className="input" value={form.location} onChange={(e) => update("location", e.target.value)}>
                  <option value="">Select state...</option>
                  {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label>Business Age (years)</label>
                <div className="input-icon">
                  <Calendar className="icon w-4 h-4" />
                  <input className="input" type="number" min="0" max="100" value={form.business_age}
                    onChange={(e) => update("business_age", e.target.value)} placeholder="e.g. 3" />
                </div>
              </div>
              <div className="flex gap-3">
                <button className="btn btn-ghost flex-1" onClick={() => setStep(1)}>Back</button>
                <button className="btn btn-primary flex-1" onClick={() => setStep(3)}>
                  Next <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="font-bold mb-4" style={{ color: "var(--brand-900)", fontSize: "18px" }}>Financial Profile</h2>
              <div>
                <label>Annual Turnover (₹)</label>
                <div className="input-icon">
                  <IndianRupee className="icon w-4 h-4" />
                  <input className="input" type="text" value={form.annual_turnover}
                    onChange={(e) => update("annual_turnover", e.target.value)} placeholder="e.g. 1200000" />
                </div>
                <p className="text-xs mt-1.5" style={{ color: "var(--text-muted)" }}>
                  Used for government scheme eligibility matching
                </p>
              </div>
              <div className="flex gap-3 mt-4">
                <button className="btn btn-ghost flex-1" onClick={() => setStep(2)}>Back</button>
                <button className="btn btn-primary flex-1" onClick={handleSubmit} disabled={loading}>
                  {loading
                    ? <><Loader2 className="w-4 h-4 animate-spin" />Creating...</>
                    : <><CheckCircle2 size={16} />Complete Setup</>}
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-xs mt-5" style={{ color: "var(--text-muted)" }}>
          Your data is encrypted and used exclusively for credit scoring.
        </p>
      </div>
    </div>
  );
}
