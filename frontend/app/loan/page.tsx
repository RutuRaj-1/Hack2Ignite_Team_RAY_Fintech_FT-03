"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  applyLoan,
  assessLoan,
  getCreditProfile,
  getLoanApplications,
  getSchemeMatches,
  type CreditProfileResponse,
  type LoanApplicationResponse,
  type LoanAssessmentResponse,
  type SchemeMatchResponse,
} from "@/lib/api";
import {
  ShieldCheck,
  CreditCard,
  Sliders,
  TrendingUp,
  Landmark,
  TrendingDown,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  IndianRupee,
  Activity,
  Layers,
  Sparkles,
  Info,
  ChevronRight,
  Loader2,
  FileText,
  Building2,
  Scale,
  RefreshCw,
} from "lucide-react";

function formatINR(val: number): string {
  if (Math.abs(val) >= 100000) {
    return `₹${(val / 100000).toFixed(2)} Lakh`;
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(val);
}

const PRESET_AMOUNTS = [25000, 50000, 100000, 200000, 500000];
const TENURE_OPTIONS = [3, 6, 12, 18, 24, 36];
const PURPOSES = [
  "Working Capital",
  "Inventory Restocking",
  "Machinery & Tools Purchase",
  "Storefront Expansion",
  "Supplier Bill Clearing",
];

export default function LoanPage() {
  const { firebaseUser, getIdToken, loading: authLoading } = useAuth();
  const router = useRouter();

  const [creditProfile, setCreditProfile] = useState<CreditProfileResponse | null>(null);
  const [applications, setApplications] = useState<LoanApplicationResponse[]>([]);
  const [assessment, setAssessment] = useState<LoanAssessmentResponse | null>(null);
  const [topScheme, setTopScheme] = useState<SchemeMatchResponse | null>(null);

  const [requestedAmount, setRequestedAmount] = useState<number>(75000);
  const [tenureMonths, setTenureMonths] = useState<number>(12);
  const [purpose, setPurpose] = useState<string>("Working Capital");

  const [loading, setLoading] = useState(true);
  const [assessing, setAssessing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    const token = await getIdToken();
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const [profileRes, appsRes, schemeRes] = await Promise.all([
        getCreditProfile(token).catch(() => null),
        getLoanApplications(token).catch(() => []),
        getSchemeMatches(token).catch(() => null),
      ]);

      if (profileRes) setCreditProfile(profileRes);
      if (appsRes) setApplications(appsRes);
      if (schemeRes && schemeRes.matches.length > 0) {
        // Only show if match percentage is high enough
        const best = schemeRes.matches[0];
        if (best.match_percentage >= 50) {
          setTopScheme(best);
        }
      }

      // Run initial assessment with current parameters
      const assessRes = await assessLoan(
        {
          requested_amount: requestedAmount,
          tenure_months: tenureMonths,
          purpose,
        },
        token
      );
      setAssessment(assessRes);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message ?? "Failed to initialize loan assessment telemetry.");
    } finally {
      setLoading(false);
    }
  }, [getIdToken, requestedAmount, tenureMonths, purpose]);

  useEffect(() => {
    if (!authLoading && !firebaseUser) {
      router.push("/login");
    } else if (firebaseUser) {
      fetchData();
    }
  }, [firebaseUser, authLoading, router, fetchData]);

  const handleAssess = async () => {
    const token = await getIdToken();
    if (!token) return;
    setAssessing(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await assessLoan(
        {
          requested_amount: requestedAmount,
          tenure_months: tenureMonths,
          purpose,
        },
        token
      );
      setAssessment(res);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message ?? "Assessment failed.");
    } finally {
      setAssessing(false);
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = await getIdToken();
    if (!token) return;
    setSubmitting(true);
    setError(null);
    setSuccessMsg(null);
    try {
      // 1. Submit application
      const app = await applyLoan(
        {
          requested_amount: requestedAmount,
          tenure_months: tenureMonths,
          purpose,
        },
        token
      );

      // 2. Assess & attach offer
      const assessRes = await assessLoan(
        {
          application_id: app.id,
          requested_amount: requestedAmount,
          tenure_months: tenureMonths,
          purpose,
        },
        token
      );
      setAssessment(assessRes);
      setSuccessMsg("Loan application submitted and prototype offer generated successfully!");

      // Refresh applications list
      const updatedApps = await getLoanApplications(token);
      setApplications(updatedApps);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message ?? "Failed to submit loan application.");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || (!firebaseUser && loading)) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-white">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30 pb-20">
      {/* ── Top Header Bar ──────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-slate-400 hover:text-white transition text-sm font-medium"
            >
              <ShieldCheck className="h-5 w-5 text-indigo-400" />
              <span>FINBRIDGE</span>
            </Link>
            <span className="text-slate-600">/</span>
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-cyan-400" />
              <h1 className="text-base font-semibold text-white">AI Micro-Lending Hub</h1>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded-full">
              FT-03 Core
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/credit-profile"
              className="text-xs px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/60 text-slate-300 hover:bg-slate-800 transition flex items-center gap-1.5"
            >
              <Activity className="h-3.5 w-3.5 text-cyan-400" />
              <span>Trust Score ({creditProfile?.trust_score ?? "—"}/100)</span>
            </Link>
            <Link
              href="/loan/simulator"
              className="text-xs px-3 py-1.5 rounded-lg border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 transition flex items-center gap-1.5 font-semibold"
            >
              <Sliders className="h-3.5 w-3.5 text-indigo-400" />
              <span>Open Loan Simulator</span>
            </Link>
            <Link
              href="/financial-coach?q=Can%20I%20afford%20a%20micro%20loan%20for%20my%20business%3F"
              className="text-xs px-3 py-1.5 rounded-lg border border-purple-500/30 bg-purple-950/40 text-purple-300 hover:bg-purple-900/60 transition flex items-center gap-1.5"
            >
              <Sparkles className="h-3.5 w-3.5 text-purple-400" />
              <span>Ask AI Coach</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-8 space-y-8">
        {/* ── Prototype Notice Banner ─────────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-2xl border border-indigo-500/20 bg-gradient-to-r from-indigo-950/40 via-slate-900/60 to-cyan-950/40 p-4 backdrop-blur-xl">
          <div className="flex items-start gap-3.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mt-0.5 shrink-0">
              <Info className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                  FT-03 Underwriting Layer
                </span>
                <span className="text-xs text-slate-400">
                  Alternative Credit Assessment & Repayment Simulation
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Loan offers are prototype recommendations synthesized from your MSME Financial Trust Score,
                real cash flow surplus, and fraud telemetry. Over-borrowing limits protect your operating buffer.
                This is a hackathon prototype, not an official bank sanction.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-950/30 p-4 text-rose-300 text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
            <button onClick={fetchData} className="text-xs underline hover:text-white">
              Retry
            </button>
          </div>
        )}

        {successMsg && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/30 p-4 text-emerald-300 text-sm flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ── Business Financial Telemetry Header Strip ───────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl">
            <span className="text-[11px] font-medium text-slate-400 block">Financial Trust Score</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-extrabold text-cyan-400">
                {creditProfile ? creditProfile.trust_score : "—"}
              </span>
              <span className="text-xs text-slate-500">/ 100</span>
            </div>
            <span className="text-[10px] text-emerald-400 block mt-0.5 font-medium">
              Behavioral Model Verified
            </span>
          </div>

          <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl">
            <span className="text-[11px] font-medium text-slate-400 block">Net Monthly Cash Flow</span>
            <span
              className={`text-2xl font-extrabold mt-1 block ${
                (creditProfile?.metrics.net_cash_flow ?? 0) >= 0 ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {creditProfile
                ? `${creditProfile.metrics.net_cash_flow >= 0 ? "+" : ""}${formatINR(
                    creditProfile.metrics.net_cash_flow
                  )}`
                : "—"}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              Available monthly operating surplus
            </span>
          </div>

          <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl">
            <span className="text-[11px] font-medium text-slate-400 block">Avg Monthly Revenue</span>
            <span className="text-2xl font-extrabold text-white mt-1 block">
              {creditProfile ? formatINR(creditProfile.metrics.avg_monthly_revenue) : "—"}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              Expense Ratio:{" "}
              {creditProfile ? `${(creditProfile.metrics.expense_ratio * 100).toFixed(0)}%` : "—"}
            </span>
          </div>

          <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl">
            <span className="text-[11px] font-medium text-slate-400 block">Risk Telemetry</span>
            <span className="text-2xl font-extrabold text-indigo-400 mt-1 block">
              {assessment ? assessment.risk_level : "LOW"} Risk
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              Fraud rate:{" "}
              {creditProfile ? `${(creditProfile.metrics.fraud_alert_rate * 100).toFixed(1)}%` : "0%"}
            </span>
          </div>
        </div>

        {/* ── Main 2-Column Workflow: Form & Assessment ────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Loan Application Form (5 cols) */}
          <div className="lg:col-span-5 rounded-3xl border border-slate-800 bg-slate-900/60 p-7 shadow-xl backdrop-blur-xl space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-indigo-400" />
                Borrowing Request
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Customize loan amount and tenure to test repayment capacity.
              </p>
            </div>

            <form onSubmit={handleApply} className="space-y-5">
              {/* Requested Amount */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-semibold text-slate-200">Requested Amount</label>
                  <span className="text-cyan-400 font-mono font-bold text-sm">
                    {formatINR(requestedAmount)}
                  </span>
                </div>

                <div className="relative">
                  <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="number"
                    min={1000}
                    step={1000}
                    value={requestedAmount}
                    onChange={(e) => setRequestedAmount(Number(e.target.value))}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white text-sm font-semibold focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
                  />
                </div>

                {/* Quick Presets */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {PRESET_AMOUNTS.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setRequestedAmount(amt)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border transition font-mono ${
                        requestedAmount === amt
                          ? "border-cyan-500 bg-cyan-500/10 text-cyan-400"
                          : "border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white"
                      }`}
                    >
                      {formatINR(amt)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tenure (Months) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-semibold text-slate-200">Repayment Tenure</label>
                  <span className="text-indigo-400 font-mono font-bold text-sm">
                    {tenureMonths} Months
                  </span>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {TENURE_OPTIONS.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTenureMonths(t)}
                      className={`py-2 rounded-xl text-xs font-bold border transition ${
                        tenureMonths === t
                          ? "border-indigo-500 bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                          : "border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-white"
                      }`}
                    >
                      {t}M
                    </button>
                  ))}
                </div>
              </div>

              {/* Purpose */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-200">Loan Purpose</label>
                <select
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
                >
                  {PURPOSES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              {/* Form Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleAssess}
                  disabled={assessing || submitting}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {assessing ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="h-3.5 w-3.5" />
                  )}
                  <span>Re-Assess Capacity</span>
                </button>

                <button
                  type="submit"
                  disabled={submitting || assessing}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white text-xs font-bold shadow-lg shadow-cyan-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <span>Apply & Generate Offer</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Explainable Prototype Assessment Card (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {assessment && (
              <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-8 shadow-2xl backdrop-blur-xl space-y-6 relative overflow-hidden">
                {/* Background Ambient Glow */}
                <div
                  className={`absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl opacity-20 pointer-events-none ${
                    assessment.is_overborrowing_risk
                      ? "bg-rose-500"
                      : "bg-gradient-to-br from-indigo-500 to-cyan-400"
                  }`}
                />

                {/* Recommendation Banner */}
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20">
                      Underwriting Recommendation
                    </span>
                    <span
                      className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                        assessment.risk_level === "LOW"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : assessment.risk_level === "MEDIUM"
                          ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/30"
                          : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                      }`}
                    >
                      {assessment.risk_level} Risk Tier
                    </span>
                  </div>

                  <div className="mt-4 p-5 rounded-2xl border border-slate-800/80 bg-slate-950/70">
                    <span className="text-xs text-slate-400 block font-medium">
                      Recommended Sustainable Loan Range
                    </span>
                    <div className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                      {formatINR(assessment.recommended_min_amount)} –{" "}
                      {formatINR(assessment.recommended_max_amount)}
                    </div>
                    <p className="text-xs text-slate-300 mt-2 leading-relaxed font-medium">
                      {assessment.prototype_recommendation}
                    </p>
                  </div>
                </div>

                {/* Over-Borrowing Protective Alert (if triggered) */}
                {assessment.is_overborrowing_risk && (
                  <div className="p-4 rounded-2xl border border-amber-500/30 bg-amber-950/20 text-amber-300 flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block">
                        Over-Borrowing Protection Activated
                      </span>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        The requested borrowing of {formatINR(assessment.requested_amount)} consumes{" "}
                        {assessment.repayment_burden_pct.toFixed(1)}% of your monthly cash flow, leaving
                        a narrow operating cushion. Consider borrowing within the recommended range.
                      </p>
                    </div>
                  </div>
                )}

                {/* Estimated Loan Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                  <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/50">
                    <span className="text-[10px] text-slate-400 block">Monthly EMI</span>
                    <span className="text-base sm:text-lg font-bold text-cyan-400 mt-0.5 block">
                      {formatINR(assessment.estimated_emi)}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Reducing balance</span>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/50">
                    <span className="text-[10px] text-slate-400 block">Interest Rate</span>
                    <span className="text-base sm:text-lg font-bold text-white mt-0.5 block">
                      {assessment.annual_interest_rate.toFixed(1)}%
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">p.a. APR</span>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/50">
                    <span className="text-[10px] text-slate-400 block">Total Interest</span>
                    <span className="text-base sm:text-lg font-bold text-indigo-400 mt-0.5 block">
                      {formatINR(assessment.estimated_interest)}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Over {tenureMonths}M</span>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/50">
                    <span className="text-[10px] text-slate-400 block">Total Outflow</span>
                    <span className="text-base sm:text-lg font-bold text-white mt-0.5 block">
                      {formatINR(assessment.total_repayment)}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Principal + Interest</span>
                  </div>
                </div>

                {/* Solvency Impact Analysis Card */}
                <div className="p-4 rounded-2xl border border-slate-800 bg-slate-950/50 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300">
                      Cash Flow Solvency Impact
                    </span>
                    <span
                      className={`font-mono font-bold ${
                        assessment.post_loan_projected_surplus >= 0
                          ? "text-emerald-400"
                          : "text-rose-400"
                      }`}
                    >
                      Surplus: {assessment.post_loan_projected_surplus >= 0 ? "+" : ""}
                      {formatINR(assessment.post_loan_projected_surplus)}/mo
                    </span>
                  </div>

                  {/* Burden Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Repayment Burden Ratio</span>
                      <span className="font-mono font-semibold">
                        {assessment.repayment_burden_pct.toFixed(1)}% (Benchmark ≤ 35%)
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          assessment.repayment_burden_pct <= 35
                            ? "bg-emerald-500"
                            : assessment.repayment_burden_pct <= 50
                            ? "bg-amber-500"
                            : "bg-rose-500"
                        }`}
                        style={{
                          width: `${Math.min(100, Math.max(5, assessment.repayment_burden_pct))}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Explainability Breakdown: Supporting vs Cautions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Supporting Factors */}
                  <div className="p-4 rounded-2xl border border-emerald-500/20 bg-emerald-950/10 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Supporting Strengths (+)</span>
                    </div>
                    {assessment.supporting_factors.length > 0 ? (
                      <ul className="space-y-1.5 text-[11px] text-slate-300">
                        {assessment.supporting_factors.map((f, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-emerald-400 font-bold mt-0.5">•</span>
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-[11px] text-slate-400 italic">No strong factors detected.</p>
                    )}
                  </div>

                  {/* Caution Factors */}
                  <div className="p-4 rounded-2xl border border-amber-500/20 bg-amber-950/10 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                      <AlertTriangle className="h-4 w-4" />
                      <span>Cautions & Risks (-)</span>
                    </div>
                    {assessment.caution_factors.length > 0 ? (
                      <ul className="space-y-1.5 text-[11px] text-slate-300">
                        {assessment.caution_factors.map((c, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-amber-400 font-bold mt-0.5">•</span>
                            <span>{c}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-[11px] text-slate-400 italic">Zero caution signals detected.</p>
                    )}
                  </div>
                </div>

                {/* FT-04 Integration: Potential Financing Support */}
                {topScheme && (
                  <div className="p-4 rounded-2xl border border-amber-500/20 bg-amber-950/10 space-y-3 relative overflow-hidden">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mt-0.5 shrink-0">
                        <Landmark className="h-4 w-4" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                            Potential Financing Support (FT-04)
                          </span>
                          <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-mono">
                            {topScheme.match_percentage}% Match
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-200">
                          {topScheme.scheme.name}
                        </h4>
                        <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
                          Consider checking this official subsidy/loan scheme to reduce your commercial borrowing burden. 
                        </p>
                        <div className="pt-2">
                          <Link 
                            href="/schemes"
                            className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
                          >
                            View Eligibility Details <ChevronRight className="h-3 w-3" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* AI Financial Coach Guidance Bar */}
                <div className="p-4 rounded-2xl border border-purple-500/30 bg-purple-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="h-4 w-4 text-purple-400 shrink-0" />
                    <span className="text-xs text-slate-300">
                      Unsure about your monthly EMI burden or surplus impact?
                    </span>
                  </div>
                  <Link
                    href={`/financial-coach?q=Can%20I%20afford%20a%20₹${assessment.requested_amount}%20loan%20with%20an%20EMI%20of%20₹${Math.round(assessment.estimated_emi)}%3F`}
                    className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shrink-0 transition flex items-center gap-1 self-start sm:self-center"
                  >
                    <span>Ask Coach About Affordability</span>
                    <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Recent Applications Table ───────────────────────────────────── */}
        {applications.length > 0 && (
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-7 shadow-xl backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FileText className="h-4 w-4 text-cyan-400" />
                  Your Loan Applications
                </h3>
                <p className="text-xs text-slate-400">
                  Track the status of your prototype borrowing requests.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="pb-3 font-semibold">Date</th>
                    <th className="pb-3 font-semibold">Purpose</th>
                    <th className="pb-3 font-semibold">Requested</th>
                    <th className="pb-3 font-semibold">Tenure</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold">Recommended Offer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {applications.map((app) => {
                    const topOffer = app.offers && app.offers.length > 0 ? app.offers[0] : null;
                    return (
                      <tr key={app.id} className="hover:bg-slate-800/20">
                        <td className="py-3 font-mono">
                          {new Date(app.created_at).toLocaleDateString("en-IN", {
                            month: "short",
                            day: "numeric",
                          })}
                        </td>
                        <td className="py-3 font-medium text-white">{app.purpose}</td>
                        <td className="py-3 font-mono font-bold text-slate-200">
                          {formatINR(app.requested_amount)}
                        </td>
                        <td className="py-3 font-mono">{app.tenure_months} Months</td>
                        <td className="py-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase">
                            {app.status}
                          </span>
                        </td>
                        <td className="py-3 font-mono text-cyan-400 font-semibold">
                          {topOffer
                            ? `${formatINR(topOffer.recommended_min_amount)} - ${formatINR(
                                topOffer.recommended_max_amount
                              )} (EMI: ${formatINR(topOffer.estimated_emi)})`
                            : "Assessment in progress"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
