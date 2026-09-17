import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/lib/auth-context";
import {
  getCreditProfile,
  assessCredit,
  type CreditProfileResponse,
  type CreditComponentScores,
} from "@/lib/api";
import {
  Target,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Award,
  Layers,
  Info,
} from "lucide-react";
import { TrustScoreCard } from "@/components/ui/TrustScoreCard";

const COMPONENT_LABELS: Record<keyof CreditComponentScores, { label: string; desc: string }> = {
  cash_flow_health: {
    label: "Cash Flow Health",
    desc: "Net liquidity surplus, positive month ratio, and operating margin buffer.",
  },
  financial_stability: {
    label: "Financial Stability",
    desc: "Operating continuity, revenue regularity, and turnover consistency.",
  },
  revenue_consistency: {
    label: "Revenue Consistency",
    desc: "Low month-to-month volatility in customer invoices and sales settlements.",
  },
  expense_discipline: {
    label: "Expense Discipline",
    desc: "Controlled overhead ratio with sustainable operational outlays.",
  },
  repayment_capacity: {
    label: "Repayment Capacity",
    desc: "Projected debt-service coverage ratio based on verified bank ledger flow.",
  },
  transaction_behavior: {
    label: "Transaction Behavior",
    desc: "Velocity of verified digital transfers, counterparty variety, and volume regularity.",
  },
  fraud_risk: {
    label: "Integrity & Fraud Risk",
    desc: "Low incidence of velocity spikes, structuring, and suspicious round figures.",
  },
};

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
    } catch (err: any) {
      // If profile doesn't exist yet, try to assess
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
      setErrorMsg(err.message || "Failed to assess credit.");
    } finally {
      setRecalculating(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fadeIn">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
              <Target className="text-blue-400" size={26} />
              MSME AI Trust Score & Underwriting Profile
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Holistic alternative creditworthiness benchmark computed from cash-flow telemetry, not collateral.
            </p>
          </div>

          <button
            onClick={handleRecalculate}
            disabled={recalculating}
            className="btn btn-primary text-xs flex items-center gap-2"
          >
            <Sparkles size={14} className={recalculating ? "animate-spin text-amber-400" : "text-amber-400"} />
            {recalculating ? "Re-Underwriting Telemetry..." : "Recalculate Trust Score"}
          </button>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 flex items-start gap-3">
            <AlertTriangle size={18} className="mt-0.5 text-rose-400 flex-shrink-0" />
            <div className="text-xs">
              <p className="font-semibold text-rose-200">Notice</p>
              <p>{errorMsg}</p>
            </div>
          </div>
        )}

        {/* Hero Score Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <TrustScoreCard score={profile?.trust_score ?? 0} />
          </div>

          <div className="lg:col-span-2 glass-card p-6 border border-white/5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <Award className="text-blue-400" size={18} />
                  Underwriting Engine Evaluation
                </h3>
                <span className="text-[11px] font-mono text-slate-400">
                  Model: FINBRIDGE-LightGBM v2.3
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                This score is dynamically derived from real-time cash inflows, banking velocity, fraud rule clearance, and counterparty reputation. Traditional CIBIL scores penalize thin-file MSMEs; FINBRIDGE quantifies verified economic velocity.
              </p>

              {/* Metrics Summary Strip */}
              {profile?.metrics && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
                  <div className="p-3 rounded-lg bg-slate-900/60 border border-white/5">
                    <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Monthly Inflow</p>
                    <p className="text-sm font-mono font-bold text-white mt-1">
                      {formatCurrency(profile.metrics.avg_monthly_revenue)}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900/60 border border-white/5">
                    <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Monthly Outlay</p>
                    <p className="text-sm font-mono font-bold text-white mt-1">
                      {formatCurrency(profile.metrics.avg_monthly_expense)}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900/60 border border-white/5">
                    <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Expense Burden</p>
                    <p className="text-sm font-mono font-bold text-emerald-400 mt-1">
                      {profile.metrics.expense_ratio.toFixed(1)}%
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900/60 border border-white/5">
                    <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Active Months</p>
                    <p className="text-sm font-mono font-bold text-blue-400 mt-1">
                      {profile.metrics.active_months} cycles
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-400" /> Continuous Risk Engine Synchronized
              </span>
              <span className="font-mono text-[11px] text-slate-500">
                Last calculated: {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "Live"}
              </span>
            </div>
          </div>
        </div>

        {/* Component Scoring Breakdown */}
        {profile?.components && (
          <div className="glass-card p-6 border border-white/5 space-y-5">
            <div>
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <Layers className="text-blue-400" size={18} />
                Dimensional Score Attribution
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Granular vector weights contributing to the overarching 0–100 Trust Score.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(profile.components).map(([key, score]) => {
                const compKey = key as keyof CreditComponentScores;
                const info = COMPONENT_LABELS[compKey] || { label: key, desc: "" };
                const scoreNum = typeof score === "number" ? Math.round(score) : 0;

                const colorClass =
                  scoreNum >= 75
                    ? "bg-emerald-500 text-emerald-400"
                    : scoreNum >= 50
                    ? "bg-blue-500 text-blue-400"
                    : scoreNum >= 35
                    ? "bg-amber-500 text-amber-400"
                    : "bg-rose-500 text-rose-400";

                return (
                  <div key={key} className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-white">{info.label}</span>
                      <span className="text-sm font-mono font-bold">{scoreNum}/100</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ${colorClass.split(" ")[0]}`}
                        style={{ width: `${Math.min(100, Math.max(5, scoreNum))}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 leading-normal">{info.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Qualitative Positive & Negative Factors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-card p-6 border border-white/5 space-y-4">
            <h3 className="text-base font-semibold text-emerald-400 flex items-center gap-2">
              <CheckCircle2 size={18} />
              Positive Underwriting Drivers
            </h3>
            <div className="space-y-2.5">
              {profile?.positive_factors && profile.positive_factors.length > 0 ? (
                profile.positive_factors.map((factor, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10 flex items-start gap-2.5 text-xs text-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                    <span>{factor}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 font-mono py-4">No specific positive drivers indexed yet.</p>
              )}
            </div>
          </div>

          <div className="glass-card p-6 border border-white/5 space-y-4">
            <h3 className="text-base font-semibold text-amber-400 flex items-center gap-2">
              <AlertTriangle size={18} />
              Risk Considerations & Opportunities
            </h3>
            <div className="space-y-2.5">
              {profile?.negative_factors && profile.negative_factors.length > 0 ? (
                profile.negative_factors.map((factor, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/10 flex items-start gap-2.5 text-xs text-amber-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                    <span>{factor}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 font-mono py-4">No active risk penalties registered.</p>
              )}
            </div>
          </div>
        </div>

        {/* Disclaimer Note */}
        <div className="p-4 rounded-xl bg-slate-900/40 border border-white/5 text-[11px] text-slate-400 flex items-start gap-2.5">
          <Info size={15} className="mt-0.5 text-slate-500 flex-shrink-0" />
          <p>
            {profile?.disclaimer ??
              "Disclaimer: The FINBRIDGE Trust Score is a computational decision-support indicator designed for MSME lending risk modeling. Final underwriting decisions remain subject to statutory lender verification and RBI guidelines."}
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
