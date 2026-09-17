import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/lib/auth-context";
import {
  getCreditProfile, assessCredit,
  type CreditProfileResponse, type CreditComponentScores,
} from "@/lib/api";
import {
  Target, CheckCircle2, RefreshCw, Sparkles, Award, Layers, Info, AlertTriangle, TrendingUp,
} from "lucide-react";
import { TrustScoreCard } from "@/components/ui/TrustScoreCard";

const COMPONENT_LABELS: Record<keyof CreditComponentScores, { label: string; desc: string }> = {
  cash_flow_health:   { label: "Cash Flow Health",     desc: "Net liquidity surplus, positive month ratio, and operating margin buffer." },
  financial_stability:{ label: "Financial Stability",  desc: "Operating continuity, revenue regularity, and turnover consistency." },
  revenue_consistency:{ label: "Revenue Consistency",  desc: "Low month-to-month volatility in customer invoices and sales settlements." },
  expense_discipline: { label: "Expense Discipline",   desc: "Controlled overhead ratio with sustainable operational outlays." },
  repayment_capacity: { label: "Repayment Capacity",   desc: "Projected debt-service coverage ratio based on verified bank ledger flow." },
  transaction_behavior:{label: "Transaction Behavior", desc: "Velocity of verified digital transfers, counterparty variety, and volume regularity." },
  fraud_risk:         { label: "Integrity & Risk",     desc: "Low incidence of velocity spikes, structuring, and suspicious round figures." },
};

function scoreBar(score: number) {
  if (score >= 75) return "var(--success)";
  if (score >= 50) return "var(--brand-700)";
  if (score >= 35) return "var(--warning)";
  return "var(--danger)";
}

export default function CreditProfilePage() {
  const { getIdToken } = useAuth();
  const [profile, setProfile] = useState<CreditProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchProfile = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const token = await getIdToken();
      if (!token) return;
      const res = await getCreditProfile(token);
      setProfile(res);
    } catch {
      try {
        const token = await getIdToken();
        if (token) {
          const assessed = await assessCredit(token, false);
          setProfile(assessed);
        }
      } catch (assessErr: any) {
        setErrorMsg(assessErr.message || "Failed to load credit profile.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRecalculate = async () => {
    setRecalculating(true);
    setErrorMsg(null);
    try {
      const token = await getIdToken();
      if (!token) return;
      const res = await assessCredit(token, true);
      setProfile(res);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to recalculate.");
    } finally {
      setRecalculating(false);
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  const formatCurrency = (num: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(num);

  return (
    <DashboardLayout>
      <div className="space-y-6 page-enter">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="badge badge-brand">Trust Score</span>
              <span className="badge badge-muted">Alternative Credit</span>
            </div>
            <h1 className="text-h1 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "var(--brand-50)" }}>
                <Target size={18} style={{ color: "var(--brand-700)" }} />
              </div>
              MSME Trust Score
            </h1>
            <p className="mt-1" style={{ color: "var(--text-muted)", fontSize: "14px" }}>
              Alternative creditworthiness benchmark from cash-flow telemetry — not collateral.
            </p>
          </div>
          <button
            onClick={handleRecalculate}
            disabled={recalculating}
            className="btn btn-primary flex items-center gap-2 self-start"
          >
            <Sparkles size={14} className={recalculating ? "animate-spin" : ""} />
            {recalculating ? "Recalculating..." : "Recalculate Score"}
          </button>
        </div>

        {errorMsg && (
          <div className="alert alert-danger">
            <AlertTriangle size={16} style={{ flexShrink: 0 }} />
            <span className="text-sm">{errorMsg}</span>
          </div>
        )}

        {/* Hero Score + Model Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <TrustScoreCard score={profile?.trust_score ?? 0} delay={0} />

          <div className="lg:col-span-2 card p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Award size={16} style={{ color: "var(--brand-700)" }} />
                  <h3 className="font-semibold" style={{ color: "var(--brand-900)", fontSize: "15px" }}>Underwriting Engine</h3>
                </div>
                <span className="badge badge-muted text-[10px]">FINBRIDGE-ML v2.3</span>
              </div>

              <p className="text-sm leading-relaxed mb-5" style={{ color: "var(--text-muted)" }}>
                This score is derived from real-time cash inflows, banking velocity, fraud clearance,
                and counterparty reputation. Traditional CIBIL scores penalize thin-file MSMEs —
                FinBridge quantifies verified economic velocity instead.
              </p>

              {profile?.metrics && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: "Monthly Inflow",   value: formatCurrency(profile.metrics.avg_monthly_revenue), color: "var(--brand-700)" },
                    { label: "Monthly Outlay",   value: formatCurrency(profile.metrics.avg_monthly_expense),  color: "var(--text-primary)" },
                    { label: "Expense Burden",   value: `${profile.metrics.expense_ratio.toFixed(1)}%`,       color: "var(--warning)" },
                    { label: "Active Months",    value: `${profile.metrics.active_months} cycles`,            color: "var(--brand-700)" },
                  ].map((m) => (
                    <div key={m.label} className="p-3 rounded-xl" style={{ background: "var(--background)", border: "1px solid var(--border)" }}>
                      <p className="text-caption mb-1">{m.label}</p>
                      <p className="text-sm font-bold text-financial" style={{ color: m.color }}>{m.value}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 flex items-center justify-between text-xs"
              style={{ borderTop: "1px solid var(--border)", color: "var(--text-muted)" }}>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={13} style={{ color: "var(--success)" }} />
                Risk Engine Synchronized
              </span>
              <span style={{ color: "var(--text-muted)" }}>
                Last updated: {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "Live"}
              </span>
            </div>
          </div>
        </div>

        {/* Component Score Breakdown */}
        {profile?.components && (
          <div className="card p-6 space-y-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Layers size={16} style={{ color: "var(--brand-700)" }} />
                <h3 className="font-semibold" style={{ color: "var(--brand-900)", fontSize: "15px" }}>Score Attribution</h3>
              </div>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Vector weights contributing to the 0–100 Trust Score.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(profile.components).map(([key, score]) => {
                const info = COMPONENT_LABELS[key as keyof CreditComponentScores] || { label: key, desc: "" };
                const scoreNum = typeof score === "number" ? Math.round(score) : 0;
                const barColor = scoreBar(scoreNum);

                return (
                  <div key={key} className="p-4 rounded-xl space-y-2.5"
                    style={{ background: "var(--background)", border: "1px solid var(--border)" }}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{info.label}</span>
                      <span className="text-sm font-bold text-financial" style={{ color: barColor }}>{scoreNum}<span style={{ color: "var(--text-muted)", fontWeight: 400, fontSize: "11px" }}>/100</span></span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${Math.max(4, scoreNum)}%`, background: barColor }} />
                    </div>
                    <p className="text-xs leading-snug" style={{ color: "var(--text-muted)" }}>{info.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Positive & Negative Factors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card p-6 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 size={16} style={{ color: "var(--success)" }} />
              <h3 className="font-semibold" style={{ color: "var(--success-text)", fontSize: "15px" }}>
                Positive Drivers
              </h3>
            </div>
            {profile?.positive_factors && profile.positive_factors.length > 0 ? (
              profile.positive_factors.map((f, i) => (
                <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl text-sm"
                  style={{ background: "var(--success-soft)", border: "1px solid rgba(22,156,115,0.18)", color: "var(--success-text)" }}>
                  <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: "var(--success)" }} />
                  {f}
                </div>
              ))
            ) : (
              <p className="text-sm py-4" style={{ color: "var(--text-muted)" }}>No positive drivers indexed yet. Load more transaction data.</p>
            )}
          </div>

          <div className="card p-6 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle size={16} style={{ color: "var(--warning)" }} />
              <h3 className="font-semibold" style={{ color: "var(--warning-text)", fontSize: "15px" }}>
                Risk Considerations
              </h3>
            </div>
            {profile?.negative_factors && profile.negative_factors.length > 0 ? (
              profile.negative_factors.map((f, i) => (
                <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl text-sm"
                  style={{ background: "var(--warning-soft)", border: "1px solid rgba(216,155,34,0.18)", color: "var(--warning-text)" }}>
                  <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: "var(--warning)" }} />
                  {f}
                </div>
              ))
            ) : (
              <p className="text-sm py-4" style={{ color: "var(--text-muted)" }}>No active risk penalties registered.</p>
            )}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="flex items-start gap-3 p-4 rounded-xl text-xs"
          style={{ background: "var(--surface-muted)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>
          <Info size={14} style={{ flexShrink: 0, marginTop: 1 }} />
          <p>{profile?.disclaimer ?? "Disclaimer: The FinBridge Trust Score is a computational decision-support indicator for MSME lending risk modeling. Final underwriting decisions remain subject to statutory lender verification and RBI guidelines."}</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
