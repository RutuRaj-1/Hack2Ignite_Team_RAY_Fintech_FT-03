"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { DashboardLayout } from "@/components/DashboardLayout";
import {
  assessCredit,
  getCreditProfile,
  type CreditProfileResponse,
  type CreditComponentScores,
} from "@/lib/api";
import {
  Award,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Loader2,
  Activity,
  Layers,
  Scale,
  Zap,
  Sparkles,
  ChevronRight,
  Info,
} from "lucide-react";

// ─── Component metadata with weights and display icons ─────────────────────────

interface ComponentMeta {
  key: keyof CreditComponentScores;
  label: string;
  weight: number;
  description: string;
  color: string;
  barColor: string;
}

const COMPONENTS: ComponentMeta[] = [
  {
    key: "financial_stability",
    label: "Financial Stability",
    weight: 25,
    description: "Operational longevity, turnover scale, and business track record depth.",
    color: "from-blue-500 to-cyan-400",
    barColor: "bg-cyan-500",
  },
  {
    key: "cash_flow_health",
    label: "Cash Flow Health",
    weight: 20,
    description: "Net cash flow margin, monthly positive consistency, and buffer against deficits.",
    color: "from-emerald-500 to-teal-400",
    barColor: "bg-emerald-500",
  },
  {
    key: "revenue_consistency",
    label: "Revenue Consistency",
    weight: 15,
    description: "Low variance in monthly customer collections and predictable inflows.",
    color: "from-indigo-500 to-blue-400",
    barColor: "bg-indigo-500",
  },
  {
    key: "expense_discipline",
    label: "Expense Discipline",
    weight: 10,
    description: "Controlled operating costs relative to revenue; avoids overspending.",
    color: "from-purple-500 to-pink-400",
    barColor: "bg-purple-500",
  },
  {
    key: "repayment_capacity",
    label: "Repayment Capacity",
    weight: 15,
    description: "Net disposable margin available to comfortably service debt installments.",
    color: "from-amber-500 to-yellow-400",
    barColor: "bg-amber-500",
  },
  {
    key: "transaction_behavior",
    label: "Transaction Behaviour",
    weight: 10,
    description: "Commercial velocity, bilateral flow (credits & debits), and regular circulation.",
    color: "from-sky-500 to-indigo-400",
    barColor: "bg-sky-500",
  },
  {
    key: "fraud_risk",
    label: "Fraud / Risk Signals",
    weight: 5,
    description: "Inverted risk telemetry; clean transactions without anomalies or velocity flags.",
    color: "from-emerald-400 to-green-500",
    barColor: "bg-green-500",
  },
];

function getScoreTier(score: number) {
  if (score >= 80) {
    return {
      tier: "Prime Trust",
      label: "Excellent Financial Behavior",
      textColor: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/30",
      gradient: "from-emerald-500 to-teal-400",
      ringColor: "#10B981",
    };
  }
  if (score >= 65) {
    return {
      tier: "Strong Trust",
      label: "Healthy Alternative Profile",
      textColor: "text-indigo-400",
      bgColor: "bg-indigo-500/10",
      borderColor: "border-indigo-500/30",
      gradient: "from-indigo-500 to-blue-400",
      ringColor: "#6366F1",
    };
  }
  if (score >= 50) {
    return {
      tier: "Moderate Trust",
      label: "Building Financial Footprint",
      textColor: "text-amber-400",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/30",
      gradient: "from-amber-500 to-yellow-400",
      ringColor: "#F59E0B",
    };
  }
  return {
    tier: "Elevated Risk",
    label: "Needs Cash Flow Improvement",
    textColor: "text-rose-400",
    bgColor: "bg-rose-500/10",
    borderColor: "border-rose-500/30",
    gradient: "from-rose-500 to-orange-400",
    ringColor: "#EF4444",
  };
}

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

export default function CreditProfilePage() {
  const { firebaseUser, getIdToken, authLoading } = useAuth();

  const [profile, setProfile] = useState<CreditProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [assessing, setAssessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recalcFraud, setRecalcFraud] = useState(false);

  const fetchProfile = useCallback(async () => {
    const token = await getIdToken();
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getCreditProfile(token);
      setProfile(data);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message ?? "Failed to load financial trust score.");
    } finally {
      setLoading(false);
    }
  }, [getIdToken]);

  useEffect(() => {
    if (!authLoading && firebaseUser) {
      fetchProfile();
    }
  }, [firebaseUser, authLoading, fetchProfile]);

  const handleRunAssessment = async () => {
    const token = await getIdToken();
    if (!token) return;
    setAssessing(true);
    setError(null);
    try {
      const res = await assessCredit(token, recalcFraud);
      setProfile(res);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message ?? "Failed to run credit assessment.");
    } finally {
      setAssessing(false);
    }
  };

  if (loading && !profile) {
    return (
      <DashboardLayout>
        <div className="flex h-[80vh] items-center justify-center">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  const scoreTier = profile ? getScoreTier(profile.trust_score) : getScoreTier(0);
  const strokeDashoffset = profile
    ? 283 - (283 * profile.trust_score) / 100
    : 283;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* ── Page Header & Controls ──────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Award className="h-6 w-6 text-cyan-400" />
              Financial Trust Score
            </h1>
            <p className="text-sm text-gray-400 mt-1">FT-03 · Ethical & Non-Discriminatory Scoring Architecture</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link href="/analytics" className="btn btn-outline !py-1.5 !px-3 !text-xs">
              <Activity className="h-3.5 w-3.5 mr-1" />
              Analytics
            </Link>
            <Link href="/fraud-alerts" className="btn btn-outline !py-1.5 !px-3 !text-xs border-amber-500/20 text-amber-400 hover:bg-amber-500/10">
              <AlertTriangle className="h-3.5 w-3.5 mr-1" />
              Fraud Telemetry
            </Link>
            <button
              onClick={handleRunAssessment}
              disabled={assessing}
              className="btn btn-primary !py-1.5 !px-3 !text-xs"
            >
              {assessing ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                  Assessing...
                </>
              ) : (
                <>
                  <RefreshCw className="h-3.5 w-3.5 mr-1" />
                  Re-Assess Score
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-rose-300 text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
            <button onClick={fetchProfile} className="text-xs underline hover:text-white">
              Retry
            </button>
          </div>
        )}

        {/* ── Score Hero Section ──────────────────────────────────────────── */}
        {profile && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Left: Score Gauge Card (5 cols) */}
            <div className="lg:col-span-5 glass-card p-8 flex flex-col justify-between relative overflow-hidden">
              {/* Background ambient glow */}
              <div
                className={`absolute -top-24 -right-24 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none bg-gradient-to-br ${scoreTier.gradient}`}
              />

              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-cyan-400" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                      Overall Trust Metric
                    </span>
                  </div>
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full border ${scoreTier.bgColor} ${scoreTier.textColor} ${scoreTier.borderColor}`}
                  >
                    {scoreTier.tier}
                  </span>
                </div>

                {/* Circular Gauge */}
                <div className="flex flex-col items-center justify-center my-8">
                  <div className="relative w-52 h-52 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      {/* Background circle */}
                      <circle cx="50" cy="50" r="45" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                      {/* Progress circle */}
                      <circle
                        cx="50" cy="50" r="45" fill="transparent"
                        stroke={scoreTier.ringColor} strokeWidth="8" strokeDasharray="283" strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round" className="transition-all duration-1000 ease-out"
                      />
                    </svg>

                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-6xl font-extrabold tracking-tight text-white drop-shadow-md">
                        {profile.trust_score}
                      </span>
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest mt-1">
                        Out of 100
                      </span>
                    </div>
                  </div>

                  <p className={`text-sm font-semibold mt-2 ${scoreTier.textColor}`}>
                    {scoreTier.label}
                  </p>
                  <p className="text-xs text-gray-400 text-center max-w-xs mt-1">
                    Weighted synthesis of 7 independent financial and behavioral dimensions.
                  </p>
                </div>
              </div>

              {/* Assessment Footer info */}
              <div className="pt-6 border-t border-white/10 flex items-center justify-between text-xs text-gray-400">
                <span>
                  Assessed: {new Date(profile.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                </span>
                <label className="flex items-center gap-1.5 cursor-pointer text-gray-400 hover:text-white transition">
                  <input
                    type="checkbox"
                    checked={recalcFraud}
                    onChange={(e) => setRecalcFraud(e.target.checked)}
                    className="rounded border-gray-700 bg-black/20 text-blue-500 focus:ring-blue-500/20 text-xs"
                  />
                  <span className="text-[11px]">Re-run ML check</span>
                </label>
              </div>
            </div>

            {/* Right: Component Sub-Scores (7 cols) */}
            <div className="lg:col-span-7 glass-card p-8 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <Layers className="h-5 w-5 text-blue-400" />
                      Component Breakdown
                    </h2>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Prompt-mandated 7-pillar credit assessment formula.
                    </p>
                  </div>
                  <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20">
                    7 Pillars Active
                  </span>
                </div>

                <div className="space-y-4">
                  {COMPONENTS.map((comp) => {
                    const score = profile.components[comp.key] ?? 0;
                    return (
                      <div key={comp.key} className="group p-3.5 rounded-2xl border border-white/5 bg-black/20 hover:border-white/10 hover:bg-white/5 transition">
                        <div className="flex items-center justify-between text-xs mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-200">{comp.label}</span>
                            <span className="text-[11px] font-mono text-gray-400 bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
                              {comp.weight}% wt
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 font-bold">
                            <span className="text-white text-sm">{score}</span>
                            <span className="text-gray-500 text-[10px]">/ 100</span>
                          </div>
                        </div>

                        {/* Animated Progress Bar */}
                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${comp.barColor} rounded-full transition-all duration-700`}
                            style={{ width: `${Math.max(4, score)}%` }}
                          />
                        </div>

                        <p className="text-[11px] text-gray-400 mt-2 line-clamp-1 group-hover:line-clamp-none transition">
                          {comp.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Explainability Section: Positive & Negative Factors ─────────── */}
        {profile && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Scale className="h-5 w-5 text-blue-400" />
                  Score Explainability & Metric Drivers
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Positive Factors */}
              <div className="glass-card p-6 border-emerald-500/20 bg-emerald-500/5">
                <div className="flex items-center gap-2.5 text-emerald-400 font-semibold text-sm mb-4">
                  <CheckCircle2 className="h-5 w-5 shrink-0" />
                  <span>Positive Credit Indicators (+ Factors)</span>
                </div>

                {profile.positive_factors.length > 0 ? (
                  <ul className="space-y-3">
                    {profile.positive_factors.map((factor, idx) => (
                      <li key={idx} className="text-xs text-gray-300 bg-black/20 border border-emerald-500/10 rounded-xl p-3 flex items-start gap-2.5">
                        <span className="text-emerald-400 font-bold mt-0.5">+</span>
                        <span>{factor}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-gray-400 italic">No positive indicators identified yet.</p>
                )}
              </div>

              {/* Negative / Risk Factors */}
              <div className="glass-card p-6 border-amber-500/20 bg-amber-500/5">
                <div className="flex items-center gap-2.5 text-amber-400 font-semibold text-sm mb-4">
                  <AlertTriangle className="h-5 w-5 shrink-0" />
                  <span>Risk Signals & Constraints (- Factors)</span>
                </div>

                {profile.negative_factors.length > 0 ? (
                  <ul className="space-y-3">
                    {profile.negative_factors.map((factor, idx) => (
                      <li key={idx} className="text-xs text-gray-300 bg-black/20 border border-amber-500/10 rounded-xl p-3 flex items-start gap-2.5">
                        <span className="text-amber-400 font-bold mt-0.5">-</span>
                        <span>{factor}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-gray-400 italic">No negative factors detected.</p>
                )}
              </div>
            </div>

            {/* AI Coach CTA */}
            <div className="glass-card p-4 border-purple-500/30 bg-purple-500/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Need deeper score insights?</h4>
                  <p className="text-xs text-gray-400">Ask the AI Financial Coach to analyze your score breakdown and recommend ways to improve it.</p>
                </div>
              </div>
              <Link
                href="/financial-coach?q=Why%20is%20my%20financial%20trust%20score%20what%20it%20is%20and%20how%20can%20I%20improve%20it%3F"
                className="btn btn-primary !bg-purple-600 hover:!bg-purple-500 !border-purple-600 whitespace-nowrap"
              >
                Ask Coach to Explain <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>
        )}

        {/* ── Financial Telemetry Metrics Grid ────────────────────────────── */}
        {profile && profile.metrics && (
          <div className="glass-card p-8 space-y-6">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Zap className="h-4 w-4 text-cyan-400" />
              Underlying Behavioral Metrics
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                <span className="text-[11px] font-medium text-gray-400 block">Avg Monthly Revenue</span>
                <span className="text-lg font-bold text-white mt-1 block">
                  {formatINR(profile.metrics.avg_monthly_revenue)}
                </span>
                <span className="text-[10px] text-gray-500 block mt-0.5">
                  Std Dev: {formatINR(profile.metrics.revenue_std)}
                </span>
              </div>

              <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                <span className="text-[11px] font-medium text-gray-400 block">Avg Monthly Outflow</span>
                <span className="text-lg font-bold text-white mt-1 block">
                  {formatINR(profile.metrics.avg_monthly_expense)}
                </span>
                <span className="text-[10px] text-gray-500 block mt-0.5">
                  Ratio: {(profile.metrics.expense_ratio * 100).toFixed(1)}% of rev
                </span>
              </div>

              <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                <span className="text-[11px] font-medium text-gray-400 block">Net Cash Flow Margin</span>
                <span className={`text-lg font-bold mt-1 block ${profile.metrics.net_cash_flow >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {profile.metrics.net_cash_flow >= 0 ? "+" : ""}
                  {formatINR(profile.metrics.net_cash_flow)}
                </span>
                <span className="text-[10px] text-gray-500 block mt-0.5">
                  Surplus margin: {(profile.metrics.repayment_capacity * 100).toFixed(1)}%
                </span>
              </div>

              <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                <span className="text-[11px] font-medium text-gray-400 block">Digital Velocity</span>
                <span className="text-lg font-bold text-white mt-1 block">
                  {profile.metrics.transaction_frequency.toFixed(1)} tx/mo
                </span>
                <span className="text-[10px] text-gray-500 block mt-0.5">
                  {profile.metrics.total_transactions} txns across {profile.metrics.active_months} mo
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
