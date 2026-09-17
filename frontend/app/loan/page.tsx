"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { DashboardLayout } from "@/components/DashboardLayout";
import { LoanRecommendationCard } from "@/components/ui/LoanRecommendationCard";
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
  CreditCard,
  Sliders,
  Landmark,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  IndianRupee,
  Activity,
  Sparkles,
  ChevronRight,
  Loader2,
  FileText,
  RefreshCw,
  Info,
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
  const { firebaseUser, getIdToken, authLoading } = useAuth();

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
    if (!authLoading) {
      if (firebaseUser) {
        fetchData();
      } else {
        setLoading(false);
      }
    }
  }, [firebaseUser, authLoading, fetchData]);

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

  if (loading && !creditProfile) {
    return (
      <DashboardLayout>
        <div className="flex h-[80vh] items-center justify-center">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* ── Page Header & Controls ──────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <CreditCard className="h-6 w-6 text-cyan-400" />
              AI Micro-Lending Hub
            </h1>
            <p className="text-sm text-gray-400 mt-1">FT-03 · Underwriting Layer</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link href="/credit-profile" className="btn btn-outline !py-1.5 !px-3 !text-xs">
              <Activity className="h-3.5 w-3.5 mr-1 text-cyan-400" />
              Trust Score ({creditProfile?.trust_score ?? "—"}/100)
            </Link>
            <Link href="/financial-coach?q=Can%20I%20afford%20a%20micro%20loan%20for%20my%20business%3F" className="btn btn-outline border-purple-500/30 text-purple-300 hover:bg-purple-500/10 !py-1.5 !px-3 !text-xs">
              <Sparkles className="h-3.5 w-3.5 mr-1" />
              Ask AI Coach
            </Link>
          </div>
        </div>

        {/* ── Prototype Notice Banner ─────────────────────────────────────── */}
        <div className="glass-card p-4 border-cyan-500/20 bg-cyan-500/5">
          <div className="flex items-start gap-3.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 mt-0.5 shrink-0">
              <Info className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                  Prototype Recommendation
                </span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Loan offers are synthesized from your MSME Financial Trust Score, real cash flow surplus, and fraud telemetry. 
                This is a hackathon prototype, not an official bank sanction.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300 text-sm flex items-center justify-between">
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
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-300 text-sm flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ── Business Financial Telemetry Header Strip ───────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card p-4">
            <span className="text-[11px] font-medium text-gray-400 block">Financial Trust Score</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-extrabold text-cyan-400">
                {creditProfile ? creditProfile.trust_score : "—"}
              </span>
              <span className="text-xs text-gray-500">/ 100</span>
            </div>
            <span className="text-[10px] text-emerald-400 block mt-0.5 font-medium">
              Behavioral Model Verified
            </span>
          </div>

          <div className="glass-card p-4">
            <span className="text-[11px] font-medium text-gray-400 block">Net Monthly Cash Flow</span>
            <span className={`text-2xl font-extrabold mt-1 block ${(creditProfile?.metrics.net_cash_flow ?? 0) >= 0 ? "text-emerald-400" : "text-red-400"}`}>
              {creditProfile ? `${creditProfile.metrics.net_cash_flow >= 0 ? "+" : ""}${formatINR(creditProfile.metrics.net_cash_flow)}` : "—"}
            </span>
            <span className="text-[10px] text-gray-400 block mt-0.5">
              Available monthly operating surplus
            </span>
          </div>

          <div className="glass-card p-4">
            <span className="text-[11px] font-medium text-gray-400 block">Avg Monthly Revenue</span>
            <span className="text-2xl font-extrabold text-white mt-1 block">
              {creditProfile ? formatINR(creditProfile.metrics.avg_monthly_revenue) : "—"}
            </span>
            <span className="text-[10px] text-gray-400 block mt-0.5">
              Expense Ratio: {creditProfile ? `${(creditProfile.metrics.expense_ratio * 100).toFixed(0)}%` : "—"}
            </span>
          </div>

          <div className="glass-card p-4">
            <span className="text-[11px] font-medium text-gray-400 block">Risk Telemetry</span>
            <span className="text-2xl font-extrabold text-indigo-400 mt-1 block">
              {assessment ? assessment.risk_level : "LOW"} Risk
            </span>
            <span className="text-[10px] text-gray-400 block mt-0.5">
              Fraud rate: {creditProfile ? `${(creditProfile.metrics.fraud_alert_rate * 100).toFixed(1)}%` : "0%"}
            </span>
          </div>
        </div>

        {/* ── Main 2-Column Workflow: Form & Assessment ────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Loan Application Form (5 cols) */}
          <div className="lg:col-span-5 glass-card p-7 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-indigo-400" />
                Borrowing Request
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Customize loan amount and tenure to test repayment capacity.
              </p>
            </div>

            <form onSubmit={handleApply} className="space-y-5">
              {/* Requested Amount */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-semibold text-gray-200">Requested Amount</label>
                  <span className="text-cyan-400 font-mono font-bold text-sm">
                    {formatINR(requestedAmount)}
                  </span>
                </div>

                <div className="relative">
                  <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="number"
                    min={1000}
                    step={1000}
                    value={requestedAmount}
                    onChange={(e) => setRequestedAmount(Number(e.target.value))}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-black/20 text-white text-sm font-semibold focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
                  />
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {PRESET_AMOUNTS.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setRequestedAmount(amt)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border transition font-mono ${
                        requestedAmount === amt
                          ? "border-cyan-500 bg-cyan-500/10 text-cyan-400"
                          : "border-white/5 bg-black/20 text-gray-400 hover:text-white hover:bg-white/5"
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
                  <label className="font-semibold text-gray-200">Repayment Tenure</label>
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
                          : "border-white/5 bg-black/20 text-gray-400 hover:border-white/10 hover:text-white"
                      }`}
                    >
                      {t}M
                    </button>
                  ))}
                </div>
              </div>

              {/* Purpose */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-200">Loan Purpose</label>
                <select
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-black/20 text-white text-xs focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
                >
                  {PURPOSES.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              {/* Form Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleAssess}
                  disabled={assessing || submitting}
                  className="btn btn-outline flex-1 justify-center disabled:opacity-50"
                >
                  {assessing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                  Re-Assess
                </button>

                <button
                  type="submit"
                  disabled={submitting || assessing}
                  className="btn btn-primary flex-1 justify-center disabled:opacity-50"
                >
                  {submitting ? (
                    <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Submitting...</>
                  ) : (
                    <>Apply Now <ChevronRight className="h-4 w-4 ml-1" /></>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Explainable Prototype Assessment Card (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {assessment && (
              <LoanRecommendationCard 
                assessment={assessment} 
                topScheme={topScheme || undefined}
              />
            )}
          </div>
        </div>

        {/* ── Recent Applications Table ───────────────────────────────────── */}
        {applications.length > 0 && (
          <div className="glass-card p-7 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FileText className="h-4 w-4 text-cyan-400" />
                  Your Loan Applications
                </h3>
                <p className="text-xs text-gray-400">Track the status of your borrowing requests.</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-gray-400">
                    <th className="pb-3 font-semibold">Date</th>
                    <th className="pb-3 font-semibold">Purpose</th>
                    <th className="pb-3 font-semibold">Requested</th>
                    <th className="pb-3 font-semibold">Tenure</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold">Recommended Offer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-gray-300">
                  {applications.map((app) => {
                    const topOffer = app.offers && app.offers.length > 0 ? app.offers[0] : null;
                    return (
                      <tr key={app.id} className="hover:bg-white/5">
                        <td className="py-3 font-mono">
                          {new Date(app.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                        </td>
                        <td className="py-3 font-medium text-white">{app.purpose}</td>
                        <td className="py-3 font-mono font-bold text-gray-200">
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
                            ? `${formatINR(topOffer.recommended_min_amount)} - ${formatINR(topOffer.recommended_max_amount)} (EMI: ${formatINR(topOffer.estimated_emi)})`
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
      </div>
    </DashboardLayout>
  );
}
