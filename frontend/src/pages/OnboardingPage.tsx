import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { createBusiness, ApiError } from "@/lib/api";
import { Building2, MapPin, Calendar, DollarSign, Briefcase, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";

const BUSINESS_TYPES = ["Retail", "Manufacturing", "Services", "Agriculture", "Food & Beverage", "E-commerce", "Healthcare", "Education", "Transport", "Other"];
const LOCATIONS = ["Maharashtra", "Delhi", "Karnataka", "Tamil Nadu", "Gujarat", "Rajasthan", "West Bengal", "Telangana", "Andhra Pradesh", "Other"];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { getIdToken } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    business_name: "", business_type: "", location: "",
    business_age: "", annual_turnover: "",
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
    <div className="min-h-screen flex items-center justify-center p-4 relative" style={{ background: "var(--bg-base)" }}>
      <div className="glow-blob glow-blob-blue w-[400px] h-[400px] -top-20 left-0" />
      <div className="glow-blob glow-blob-purple w-[300px] h-[300px] bottom-0 right-0" />

      <div className="w-full max-w-lg relative z-10">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "var(--grad-brand)", boxShadow: "0 8px 24px rgba(37,99,235,0.4)" }}>
            <Building2 className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Setup Your Business Profile</h1>
          <p className="text-sm text-slate-400 mt-1">Help us understand your business for accurate credit scoring</p>
        </div>

        {/* Step Indicators */}
        <div className="flex items-center justify-center gap-3 mb-8 animate-fade-in-up delay-100">
          {steps.map((s, i) => (
            <div key={s.n} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step > s.n ? "text-white" : step === s.n ? "text-white" : "text-slate-500"
              }`} style={{
                background: step > s.n ? "#10b981" : step === s.n ? "var(--grad-brand)" : "rgba(255,255,255,0.05)",
                border: step === s.n ? "none" : "1px solid var(--border-subtle)",
              }}>
                {step > s.n ? <CheckCircle2 size={14} /> : s.n}
              </div>
              <span className={`text-xs font-medium ${step === s.n ? "text-white" : "text-slate-500"}`}>{s.label}</span>
              {i < steps.length - 1 && <div className="w-8 h-px" style={{ background: step > s.n + 0 ? "#10b981" : "var(--border-subtle)" }} />}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="card p-7 animate-fade-in-up delay-200">
          {error && (
            <div className="alert alert-error mb-5">
              <p className="text-sm">{error}</p>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white mb-4">Business Identity</h2>
              <div>
                <label>Business Name *</label>
                <div className="input-icon">
                  <Building2 className="icon w-4 h-4" />
                  <input className="input" type="text" required value={form.business_name}
                    onChange={(e) => update("business_name", e.target.value)} placeholder="Shree Digital Solutions" />
                </div>
              </div>
              <div>
                <label>Business Type</label>
                <div className="input-icon">
                  <Briefcase className="icon w-4 h-4" />
                  <select className="input" value={form.business_type} onChange={(e) => update("business_type", e.target.value)}
                    style={{ appearance: "none" }}>
                    <option value="">Select type...</option>
                    {BUSINESS_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <button className="btn btn-primary w-full mt-2" onClick={() => form.business_name && setStep(2)} disabled={!form.business_name}>
                Next Step <ArrowRight size={16} />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white mb-4">Location & Age</h2>
              <div>
                <label>State / Location</label>
                <div className="input-icon">
                  <MapPin className="icon w-4 h-4" />
                  <select className="input" value={form.location} onChange={(e) => update("location", e.target.value)} style={{ appearance: "none" }}>
                    <option value="">Select state...</option>
                    {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
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
                <button className="btn btn-primary flex-1" onClick={() => setStep(3)}>Next <ArrowRight size={16} /></button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white mb-4">Financial Profile</h2>
              <div>
                <label>Annual Turnover (₹)</label>
                <div className="input-icon">
                  <DollarSign className="icon w-4 h-4" />
                  <input className="input" type="text" value={form.annual_turnover}
                    onChange={(e) => update("annual_turnover", e.target.value)} placeholder="e.g. 1200000" />
                </div>
                <p className="text-[11px] text-slate-500 mt-1 font-mono">Used for govt scheme eligibility matching</p>
              </div>
              <div className="flex gap-3 mt-4">
                <button className="btn btn-ghost flex-1" onClick={() => setStep(2)}>Back</button>
                <button className="btn btn-primary flex-1" onClick={handleSubmit} disabled={loading}>
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Creating...</> : <>Complete Setup <CheckCircle2 size={16} /></>}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
