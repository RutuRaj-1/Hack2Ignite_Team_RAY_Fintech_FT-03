"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  getCreditProfile,
  simulateLoan,
  type CreditProfileResponse,
  type LoanSimulationResponse,
} from "@/lib/api";
import {
  ShieldCheck,
  CreditCard,
  Sliders,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  IndianRupee,
  Activity,
  ArrowLeft,
  ArrowRight,
  Info,
  Sparkles,
  Zap,
  Scale,
  Loader2,
  RotateCcw,
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

// Client-side instant reducing-balance EMI calculation for zero-latency slider updates
function calculateClientEmi(p: number, annualRate: number, n: number) {
  if (p <= 0 || n <= 0) return { emi: 0, totalRepayment: 0, totalInterest: 0 };
  const r = annualRate / 12.0 / 100.0;
  if (r === 0) {
    const emi = p / n;
    return { emi, totalRepayment: p, totalInterest: 0 };
  }
  const pow = Math.pow(1 + r, n);
  const emi = (p * r * pow) / (pow - 1);
  const totalRepayment = emi * n;
  const totalInterest = Math.max(0, totalRepayment - p);
  return {
    emi: Math.round(emi),
    totalRepayment: Math.round(totalRepayment),
    totalInterest: Math.round(totalInterest),
  };
}

export default function LoanSimulatorPage() {
  const { firebaseUser, getIdToken, loading: authLoading } = useAuth();
  const router = useRouter();

  const [creditProfile, setCreditProfile] = useState<CreditProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Simulator state
  const [loanAmount, setLoanAmount] = useState<number>(100000);
  const [tenureMonths, setTenureMonths] = useState<number>(12);
  const [interestRate, setInterestRate] = useState<number>(14.0);

  const [simResult, setSimResult] = useState<LoanSimulationResponse | null>(null);
  const [simulating, setSimulating] = useState(false);

  // Load verified business telemetry
  useEffect(() => {
    if (!authLoading && !firebaseUser) {
      router.push("/login");
      return;
    }

    if (firebaseUser) {
      getIdToken().then((token) => {
        if (!token) return;
        getCreditProfile(token)
          .then((profile) => {
            setCreditProfile(profile);
            // Default interest rate based on verified trust score
            if (profile.trust_score >= 80) setInterestRate(12.0);
            else if (profile.trust_score >= 65) setInterestRate(14.5);
            else if (profile.trust_score >= 50) setInterestRate(17.5);
            else setInterestRate(21.0);
          })
          .catch(() => {})
          .finally(() => setLoading(false));
      });
    }
  }, [firebaseUser, authLoading, router, getIdToken]);

  // Debounced server simulation
  const runServerSimulation = useCallback(
    async (amount: number, tenure: number, rate: number) => {
      const token = await getIdToken();
      if (!token) return;
      setSimulating(true);
      try {
        const res = await simulateLoan(
          {
            loan_amount: amount,
            tenure_months: tenure,
            annual_interest_rate: rate,
          },
          token
        );
        setSimResult(res);
      } catch (e) {
        console.error("Simulation error", e);
      } finally {
        setSimulating(false);
      }
    },
    [getIdToken]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      runServerSimulation(loanAmount, tenureMonths, interestRate);
    }, 200);
    return () => clearTimeout(timer);
  }, [loanAmount, tenureMonths, interestRate, runServerSimulation]);

  // Instant reactive client values
  const clientEmi = calculateClientEmi(loanAmount, interestRate, tenureMonths);
  const netCashFlow = creditProfile?.metrics.net_cash_flow ?? 45000;
  const postSurplus = netCashFlow - clientEmi.emi;
  const burdenPct = netCashFlow > 0 ? (clientEmi.emi / netCashFlow) * 100 : 150;
  const isOverborrowing = postSurplus < 0 || burdenPct > 35;

  if (authLoading || (!firebaseUser && loading)) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-white">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30 pb-20">
      {/* ── Top Navbar ─────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/loan"
              className="flex items-center gap-1.5 text-slate-400 hover:text-white transition text-xs font-semibold"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Loan Hub</span>
            </Link>
            <span className="text-slate-600">/</span>
            <div className="flex items-center gap-2">
              <Sliders className="h-4 w-4 text-indigo-400" />
              <h1 className="text-base font-semibold text-white">Repayment Simulator</h1>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full">
              Live Scenario
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setLoanAmount(100000);
                setTenureMonths(12);
                setInterestRate(14.0);
              }}
              className="text-xs px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white transition flex items-center gap-1.5"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset Defaults</span>
            </button>
            <Link
              href="/loan"
              className="text-xs px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition font-semibold flex items-center gap-1.5 shadow-lg shadow-indigo-600/20"
            >
              <span>Apply with These Terms</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-8 space-y-8">
        {/* ── Guidance Banner ────────────────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-2xl border border-indigo-500/20 bg-gradient-to-r from-indigo-950/40 via-slate-900/60 to-cyan-950/40 p-4 backdrop-blur-xl">
          <div className="flex items-start gap-3.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mt-0.5 shrink-0">
              <Info className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                  Dynamic Solvency Modeler
                </span>
                <span className="text-xs text-slate-400">
                  Real-time reducing-balance amortization with cash flow protection
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Drag the sliders to see instant reducing-balance monthly installments, total interest,
                and how your net monthly cash flow responds. If the repayment burden exceeds 35%,
                over-borrowing safeguards will visually warn you.
              </p>
            </div>
          </div>
        </div>

        {/* ── Main Simulator Layout (2 Columns) ───────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Interactive Controls (6 cols) */}
          <div className="lg:col-span-6 rounded-3xl border border-slate-800 bg-slate-900/60 p-8 shadow-xl backdrop-blur-xl space-y-7">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sliders className="h-5 w-5 text-cyan-400" />
                  Loan Parameters
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Adjust principal, tenure, and APR to model scenario viability.
                </p>
              </div>
              {simulating && <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />}
            </div>

            {/* Slider 1: Loan Amount */}
            <div className="space-y-3 p-4 rounded-2xl border border-slate-800/80 bg-slate-950/60">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">Loan Principal</label>
                <div className="flex items-center gap-1 font-mono text-cyan-400 font-extrabold text-lg">
                  <span>{formatINR(loanAmount)}</span>
                </div>
              </div>

              <input
                type="range"
                min={10000}
                max={1000000}
                step={5000}
                value={loanAmount}
                onChange={(e) => setLoanAmount(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg appearance-none"
              />

              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>₹10,000</span>
                <span>₹2,50,000</span>
                <span>₹5,00,000</span>
                <span>₹10,00,000</span>
              </div>
            </div>

            {/* Slider 2: Tenure Months */}
            <div className="space-y-3 p-4 rounded-2xl border border-slate-800/80 bg-slate-950/60">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">Repayment Tenure</label>
                <div className="flex items-center gap-1 font-mono text-indigo-400 font-extrabold text-lg">
                  <span>{tenureMonths} Months</span>
                  <span className="text-xs text-slate-500 font-sans">
                    ({(tenureMonths / 12).toFixed(1)} yr)
                  </span>
                </div>
              </div>

              <input
                type="range"
                min={1}
                max={36}
                step={1}
                value={tenureMonths}
                onChange={(e) => setTenureMonths(Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer h-2 bg-slate-800 rounded-lg appearance-none"
              />

              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>1 Month</span>
                <span>12 Months</span>
                <span>24 Months</span>
                <span>36 Months</span>
              </div>
            </div>

            {/* Slider 3: Interest Rate APR */}
            <div className="space-y-3 p-4 rounded-2xl border border-slate-800/80 bg-slate-950/60">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-xs font-semibold text-slate-300">Annual Interest Rate</label>
                  <span className="text-[10px] text-slate-400 block">
                    Based on Trust Score ({creditProfile?.trust_score ?? "70"}/100)
                  </span>
                </div>
                <span className="font-mono text-white font-extrabold text-lg">
                  {interestRate.toFixed(1)}% p.a.
                </span>
              </div>

              <input
                type="range"
                min={8.0}
                max={26.0}
                step={0.5}
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer h-2 bg-slate-800 rounded-lg appearance-none"
              />

              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>8.0% (Prime)</span>
                <span>14.5% (Standard)</span>
                <span>20.0% (Elevated)</span>
                <span>26.0% (Max)</span>
              </div>
            </div>
          </div>

          {/* Right Column: Dynamic Results & Cash Flow Impact (6 cols) */}
          <div className="lg:col-span-6 space-y-6">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-8 shadow-2xl backdrop-blur-xl space-y-6 relative overflow-hidden">
              {/* Background Glow */}
              <div
                className={`absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl opacity-20 pointer-events-none ${
                  isOverborrowing ? "bg-rose-500" : "bg-cyan-500"
                }`}
              />

              {/* Monthly EMI Hero Card */}
              <div className="p-6 rounded-2xl border border-slate-800/80 bg-slate-950/80 text-center space-y-1">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  Estimated Monthly EMI
                </span>
                <div className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400 font-mono tracking-tight">
                  {formatINR(clientEmi.emi)}
                </div>
                <span className="text-[11px] text-slate-500 block pt-1">
                  Reducing-balance monthly installment for {tenureMonths} month(s)
                </span>
              </div>

              {/* Over-Borrowing Protective Alert Banner */}
              {isOverborrowing && (
                <div className="p-4 rounded-2xl border border-amber-500/30 bg-amber-950/25 text-amber-300 flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-1 text-xs">
                    <span className="font-bold text-amber-400 block uppercase tracking-wider">
                      Over-Borrowing Warning
                    </span>
                    <p className="text-slate-300 leading-relaxed">
                      {postSurplus < 0
                        ? `Projected cash flow enters deficit (-₹${Math.abs(
                            postSurplus
                          ).toLocaleString(
                            "en-IN"
                          )}/mo). Reduce loan amount or extend tenure to avoid operational cash squeeze.`
                        : `EMI consumes ${burdenPct.toFixed(
                            1
                          )}% of monthly surplus (safe benchmark ≤ 35%). Consider borrowing less.`}
                    </p>
                  </div>
                </div>
              )}

              {/* Metrics Breakdown Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/50">
                  <span className="text-[11px] text-slate-400 block">Total Interest Payable</span>
                  <span className="text-lg font-bold text-indigo-400 mt-0.5 block font-mono">
                    {formatINR(clientEmi.totalInterest)}
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    {((clientEmi.totalInterest / loanAmount) * 100).toFixed(1)}% of principal
                  </span>
                </div>

                <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/50">
                  <span className="text-[11px] text-slate-400 block">Total Repayment Outflow</span>
                  <span className="text-lg font-bold text-white mt-0.5 block font-mono">
                    {formatINR(clientEmi.totalRepayment)}
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    Principal + all interest
                  </span>
                </div>
              </div>

              {/* Solvency & Cash Flow Impact Box */}
              <div className="p-5 rounded-2xl border border-slate-800 bg-slate-950/60 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300">
                    Monthly Cash Flow Comparison
                  </span>
                  <span className="text-[11px] text-cyan-400 font-mono">
                    Burden: {burdenPct.toFixed(1)}%
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Current Net Surplus</span>
                    <span className="text-sm font-bold text-emerald-400 mt-0.5 block font-mono">
                      +{formatINR(netCashFlow)}/mo
                    </span>
                  </div>

                  <div
                    className={`p-3 rounded-xl border ${
                      postSurplus >= 0
                        ? "bg-slate-900/60 border-slate-800 text-emerald-400"
                        : "bg-rose-950/20 border-rose-500/30 text-rose-400"
                    }`}
                  >
                    <span className="text-[10px] text-slate-400 block">Post-Loan Surplus</span>
                    <span className="text-sm font-bold mt-0.5 block font-mono">
                      {postSurplus >= 0 ? "+" : ""}
                      {formatINR(postSurplus)}/mo
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        burdenPct <= 35
                          ? "bg-emerald-500"
                          : burdenPct <= 50
                          ? "bg-amber-500"
                          : "bg-rose-500"
                      }`}
                      style={{ width: `${Math.min(100, Math.max(5, burdenPct))}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>Safe (&le;35%)</span>
                    <span>Caution (35-50%)</span>
                    <span>Danger (&gt;50%)</span>
                  </div>
                </div>
              </div>

              {/* Call to action */}
              <div className="pt-2">
                <Link
                  href={`/loan?amount=${loanAmount}&tenure=${tenureMonths}`}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 transition flex items-center justify-center gap-2"
                >
                  <span>Proceed to Loan Application</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
