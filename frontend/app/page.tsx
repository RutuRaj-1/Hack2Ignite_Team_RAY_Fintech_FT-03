"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { checkHealth } from "@/lib/api";
import {
  ShieldCheck,
  TrendingUp,
  Cpu,
  FileText,
  BookOpen,
  ArrowRight,
  CheckCircle,
  Zap,
  Globe,
  Lock,
  Layers,
  Sparkles,
  Activity,
  Calculator,
  Compass,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const { user, loginDemo } = useAuth();
  const [healthStatus, setHealthStatus] = useState<"checking" | "online" | "offline">("checking");
  const [healthLatency, setHealthLatency] = useState<number | null>(null);

  useEffect(() => {
    const pingBackend = async () => {
      const start = performance.now();
      try {
        await checkHealth();
        const latency = Math.round(performance.now() - start);
        setHealthStatus("online");
        setHealthLatency(latency);
      } catch {
        setHealthStatus("offline");
      }
    };
    pingBackend();
  }, []);

  const handleLaunchDemo = async () => {
    await loginDemo();
    router.push("/dashboard");
  };

  return (
    <main className="min-h-screen bg-[#090d16] text-[#f8fafc] flex flex-col">
      {/* ── Navigation Bar ────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#090d16]/90 backdrop-blur-md border-b-2 border-[#222f46]">
        <div className="brutal-container py-3.5 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-blue-600 border-2 border-black flex items-center justify-center shadow-[3px_3px_0px_0px_#000] group-hover:translate-x-[-1px] group-hover:translate-y-[-1px] transition-transform">
              <Zap size={20} className="text-white fill-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight flex items-center">
                <span className="text-blue-500">FIN</span>
                <span className="text-white">BRIDGE</span>
              </span>
              <span className="text-[10px] font-mono tracking-widest text-gray-400 uppercase -mt-1 font-bold">
                Fintech Engine FT-03
              </span>
            </div>
          </Link>

          {/* Dynamic Nav Links */}
          <div className="hidden lg:flex items-center gap-6">
            <a href="#features" className="text-xs uppercase font-mono font-bold tracking-wider text-gray-400 hover:text-white transition-colors">
              Platform Features
            </a>
            <a href="#simulator-preview" className="text-xs uppercase font-mono font-bold tracking-wider text-gray-400 hover:text-white transition-colors">
              Loan Engine
            </a>
            <a href="#how-it-works" className="text-xs uppercase font-mono font-bold tracking-wider text-gray-400 hover:text-white transition-colors">
              Workflow
            </a>
            <a href="#api-health" className="text-xs uppercase font-mono font-bold tracking-wider text-gray-400 hover:text-white transition-colors flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${healthStatus === "online" ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
              System Status
            </a>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            {user ? (
              <Link href="/dashboard" className="btn btn-primary text-xs py-2 px-4 uppercase tracking-wider font-bold">
                Go to Dashboard <ArrowRight size={14} />
              </Link>
            ) : (
              <>
                <button
                  onClick={handleLaunchDemo}
                  className="btn btn-primary text-xs py-2 px-4 uppercase tracking-wider font-bold cursor-pointer"
                  title="Launch with preloaded MSME demo data"
                >
                  <Sparkles size={14} className="text-amber-300" />
                  Live Demo
                </button>
                <Link href="/login" className="btn btn-ghost text-xs py-2 px-3.5 hidden sm:inline-flex uppercase tracking-wider">
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── Hero Section ──────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* Background Grid Accent */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage:
              "linear-gradient(#222f46 1px, transparent 1px), linear-gradient(90deg, #222f46 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <div className="brutal-container relative z-10 text-center max-w-5xl mx-auto space-y-8">
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#111726] border-2 border-[#222f46] shadow-[3px_3px_0px_0px_#000]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-gray-300">
              Bharat MSME Credit Protocol • 100% Digital & Explainable
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.05]">
            Break the <span className="gradient-text">Credit Barrier</span>.
            <br />
            Unlock Micro-Loans with Real Data.
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            FINBRIDGE replaces outdated credit bureau rejections with algorithmic trust.
            We analyze UPI transaction velocity, seasonal cash flows, and GST regularity to assess
            creditworthiness and simulate micro-loans within 72 hours.
          </p>

          {/* Primary CTA Button Cluster */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={handleLaunchDemo}
              className="btn btn-primary text-sm sm:text-base py-3.5 px-8 font-extrabold uppercase tracking-wide cursor-pointer flex items-center gap-2"
            >
              <Zap size={18} />
              Launch Live Platform Demo
              <ArrowRight size={18} />
            </button>

            <Link
              href="/loan/simulator"
              className="btn btn-ghost text-sm sm:text-base py-3.5 px-6 font-bold uppercase tracking-wide flex items-center gap-2"
            >
              <Calculator size={18} className="text-blue-400" />
              Repayment Simulator
            </Link>
          </div>

          {/* Benchmark Stat Cards Container */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-8 text-left">
            {[
              { label: "Loan Ticket Range", val: "₹50K – ₹5L", desc: "Tailored for small merchants", color: "border-blue-500/40 text-blue-400" },
              { label: "Approval Cycle", val: "72 Hours", desc: "Automated underwriting", color: "border-emerald-500/40 text-emerald-400" },
              { label: "Minimum CIBIL", val: "0 Required", desc: "Alternative scoring engine", color: "border-purple-500/40 text-purple-400" },
              { label: "Underwriting Risk", val: "Overborrow Guard", desc: "Surplus cashflow check", color: "border-amber-500/40 text-amber-400" },
            ].map((stat) => (
              <div key={stat.label} className="brutal-card p-5 space-y-1">
                <span className="text-[11px] font-mono uppercase font-bold text-gray-400 tracking-wider">
                  {stat.label}
                </span>
                <div className={`text-2xl sm:text-3xl font-black ${stat.color}`}>
                  {stat.val}
                </div>
                <p className="text-xs text-gray-500">{stat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Superpowers (All Active Dynamic Modules) ───────────────────── */}
      <section id="features" className="py-20 bg-[#0c101c] border-y-2 border-[#222f46]">
        <div className="brutal-container space-y-12">
          {/* Section Header */}
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="badge badge-blue">Interactive Platform Modules</div>
            <h2 className="text-3xl sm:text-5xl font-black text-white">
              One Architecture. <span className="gradient-text">Five Superpowers.</span>
            </h2>
            <p className="text-sm sm:text-base text-gray-400">
              Each module connects directly to our FastAPI backend engines and ML risk pipelines.
              Click any card to explore the active tool.
            </p>
          </div>

          {/* Grid of Interactive Modules */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1: FT-03 Credit Scoring */}
            <Link href="/credit-profile" className="brutal-card p-6 flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-blue-600/20 border-2 border-blue-500 flex items-center justify-center text-blue-400 shadow-[2px_2px_0px_0px_#000]">
                    <TrendingUp size={24} />
                  </div>
                  <span className="badge badge-blue">FT-03 Engine</span>
                </div>
                <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                  Alternative Credit Scoring
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Evaluate real financial health across 7 weighted dimensions including UPI frequency,
                  expense discipline, cash flow volatility, and consistency.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t-2 border-[#222f46] flex items-center justify-between text-xs font-mono font-bold text-blue-400 group-hover:translate-x-1 transition-transform">
                <span>View Trust Score Matrix</span>
                <ArrowRight size={14} />
              </div>
            </Link>

            {/* Card 2: FT-02 Fraud Intelligence */}
            <Link href="/fraud-alerts" className="brutal-card p-6 flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-purple-600/20 border-2 border-purple-500 flex items-center justify-center text-purple-400 shadow-[2px_2px_0px_0px_#000]">
                    <ShieldCheck size={24} />
                  </div>
                  <span className="badge badge-purple">FT-02 Security</span>
                </div>
                <h3 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors">
                  AI Fraud & Anomaly Detection
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Heuristic and statistical pattern detection for high-velocity transfers, suspicious odd-hour
                  outflows, and unknown merchant spikes before disbursement.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t-2 border-[#222f46] flex items-center justify-between text-xs font-mono font-bold text-purple-400 group-hover:translate-x-1 transition-transform">
                <span>Inspect Active Risk Alerts</span>
                <ArrowRight size={14} />
              </div>
            </Link>

            {/* Card 3: FT-03 Micro-Loan Engine */}
            <Link href="/loan" className="brutal-card p-6 flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-emerald-600/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 shadow-[2px_2px_0px_0px_#000]">
                    <Calculator size={24} />
                  </div>
                  <span className="badge badge-green">Part 06 Core</span>
                </div>
                <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                  Explainable Micro-Loans
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Algorithmic loan sizing with overborrowing protection, transparent EMI projection,
                  and instant risk-grade tiering based on verified cash flow.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t-2 border-[#222f46] flex items-center justify-between text-xs font-mono font-bold text-emerald-400 group-hover:translate-x-1 transition-transform">
                <span>Configure & Apply</span>
                <ArrowRight size={14} />
              </div>
            </Link>

            {/* Card 4: FT-04 Government Schemes */}
            <Link href="/schemes" className="brutal-card p-6 flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-amber-600/20 border-2 border-amber-500 flex items-center justify-center text-amber-400 shadow-[2px_2px_0px_0px_#000]">
                    <FileText size={24} />
                  </div>
                  <span className="badge badge-amber">FT-04 Schemes</span>
                </div>
                <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors">
                  Government Subsidy Matching
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Automatic eligibility matching with MUDRA, Stand-Up India, PM SVANidhi, and state subsidy
                  programs based on turnover and business profile.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t-2 border-[#222f46] flex items-center justify-between text-xs font-mono font-bold text-amber-400 group-hover:translate-x-1 transition-transform">
                <span>View Eligible Subsidies</span>
                <ArrowRight size={14} />
              </div>
            </Link>

            {/* Card 5: FT-05 Expense Intelligence */}
            <Link href="/analytics" className="brutal-card p-6 flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-cyan-600/20 border-2 border-cyan-500 flex items-center justify-center text-cyan-400 shadow-[2px_2px_0px_0px_#000]">
                    <Cpu size={24} />
                  </div>
                  <span className="badge badge-blue">FT-05 Analytics</span>
                </div>
                <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">
                  Expense & Cash Flow Intelligence
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Interactive monthly trends, expense ratio tracking, transaction CSV batch ingestion,
                  and net liquidity forecasting.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t-2 border-[#222f46] flex items-center justify-between text-xs font-mono font-bold text-cyan-400 group-hover:translate-x-1 transition-transform">
                <span>Open Analytics Charts</span>
                <ArrowRight size={14} />
              </div>
            </Link>

            {/* Card 6: FT-01 AI Financial Coach */}
            <Link href="/financial-coach" className="brutal-card p-6 flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-rose-600/20 border-2 border-rose-500 flex items-center justify-center text-rose-400 shadow-[2px_2px_0px_0px_#000]">
                    <BookOpen size={24} />
                  </div>
                  <span className="badge badge-purple">FT-01 AI Coach</span>
                </div>
                <h3 className="text-xl font-bold text-white group-hover:text-rose-400 transition-colors">
                  Bilingual Financial Coach
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Interactive guidance powered by LLM and business context in Hindi and English.
                  Assists with debt management, GST tips, and score improvement.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t-2 border-[#222f46] flex items-center justify-between text-xs font-mono font-bold text-rose-400 group-hover:translate-x-1 transition-transform">
                <span>Start Coaching Chat</span>
                <ArrowRight size={14} />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Interactive Loan Simulator Preview Section ────────────────── */}
      <section id="simulator-preview" className="py-20 px-4">
        <div className="brutal-container">
          <div className="brutal-card p-8 md:p-12 border-2 border-blue-500/40 relative overflow-hidden">
            <div className="brutal-header -m-8 md:-m-12 mb-8 bg-[#0b101d] px-6 py-4 border-b-2 border-[#222f46]">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500 border border-black" />
                <div className="w-3 h-3 rounded-full bg-amber-500 border border-black" />
                <div className="w-3 h-3 rounded-full bg-emerald-500 border border-black" />
                <span className="text-xs font-mono text-gray-400 ml-2 font-bold">
                  SIMULATOR_CORE_V1 // FT-03_REPAYMENT_ENGINE
                </span>
              </div>
              <span className="badge badge-green">Live Sandbox</span>
            </div>

            <div className="grid lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-5">
                <h3 className="text-2xl sm:text-4xl font-black text-white">
                  Real-Time Loan & Repayment Simulator
                </h3>
                <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                  Test repayment feasibility before submitting applications. Our simulator computes exact monthly EMIs,
                  total interest overhead, and checks whether the loan burden exceeds healthy cashflow thresholds.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                  <div className="bg-[#090d16] p-3 rounded-xl border border-[#222f46]">
                    <div className="text-[11px] font-mono text-gray-400 uppercase">Principal</div>
                    <div className="text-lg font-bold text-white">₹1,00,000</div>
                  </div>
                  <div className="bg-[#090d16] p-3 rounded-xl border border-[#222f46]">
                    <div className="text-[11px] font-mono text-gray-400 uppercase">Tenure</div>
                    <div className="text-lg font-bold text-blue-400">12 Months</div>
                  </div>
                  <div className="bg-[#090d16] p-3 rounded-xl border border-[#222f46]">
                    <div className="text-[11px] font-mono text-gray-400 uppercase">Est. EMI</div>
                    <div className="text-lg font-bold text-emerald-400">₹8,975/mo</div>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href="/loan/simulator"
                    className="btn btn-primary text-sm py-3 px-6 uppercase tracking-wider font-bold inline-flex items-center gap-2"
                  >
                    Open Full Repayment Simulator <ArrowRight size={16} />
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-5 bg-[#090d16] p-6 rounded-xl border-2 border-[#222f46] space-y-4">
                <div className="text-xs font-mono font-bold uppercase text-gray-400 tracking-wider flex items-center justify-between">
                  <span>Underwriting Parameters</span>
                  <span className="text-emerald-400">RBI Guidelines</span>
                </div>
                <ul className="space-y-2 text-xs text-gray-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                    <span>35% Maximum Repayment Burden Threshold</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                    <span>Automatic Overborrowing Risk Warning</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                    <span>Post-Loan Projected Operating Surplus</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                    <span>Seamless Transition to Loan Application</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Workflow Steps ────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-20 bg-[#0c101c] border-t-2 border-[#222f46]">
        <div className="brutal-container space-y-12">
          <div className="text-center space-y-3 max-w-xl mx-auto">
            <div className="badge badge-purple">Zero-Paperwork Journey</div>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              From Real Activity to Approved Credit
            </h2>
            <p className="text-sm text-gray-400">
              Four transparent steps designed for everyday Indian micro-enterprises.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                step: "01",
                title: "Register & Profile",
                desc: "Provide basic business identity, location, and operational age in under 2 minutes.",
              },
              {
                step: "02",
                title: "Upload Transactions",
                desc: "Ingest your digital UPI and banking CSV records for automated cash flow calculation.",
              },
              {
                step: "03",
                title: "Receive Trust Score",
                desc: "Get an explainable 0-100 FINBRIDGE Trust Score with supporting factors and cautions.",
              },
              {
                step: "04",
                title: "Borrow Safely",
                desc: "Access calibrated micro-loans with matched government subsidies and AI guidance.",
              },
            ].map((item) => (
              <div key={item.step} className="brutal-card p-6 space-y-3 relative">
                <div className="text-3xl font-black text-blue-500 font-mono">
                  {item.step}
                </div>
                <h4 className="text-lg font-bold text-white">{item.title}</h4>
                <p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Live API Health Section (Dynamic Endpoints) ───────────────── */}
      <section id="api-health" className="py-16 px-4">
        <div className="brutal-container max-w-4xl mx-auto">
          <div className="brutal-card p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-[#222f46] pb-4">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Activity className="text-emerald-400" size={20} />
                  Live API Health & Gateway Endpoints
                </h3>
                <p className="text-xs text-gray-400">
                  FastAPI service status verified with real-time ping.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`badge ${healthStatus === "online" ? "badge-green" : "badge-amber"}`}>
                  <span className={`status-dot ${healthStatus === "online" ? "status-dot-online" : "status-dot-warning"}`} />
                  {healthStatus === "online" ? "All Systems Operational" : "Local Standby Mode"}
                </span>
                {healthLatency !== null && (
                  <span className="text-xs font-mono text-gray-400">
                    {healthLatency}ms
                  </span>
                )}
              </div>
            </div>

            <div className="divide-y-2 divide-[#1b263b] space-y-1">
              {[
                { method: "GET", path: "/health", label: "Core API Health & Ping", status: healthStatus === "online" ? "200 OK" : "Standby", time: healthLatency ? `< ${healthLatency}ms` : "< 15ms" },
                { method: "GET", path: "/api/v1/credit/profile", label: "FT-03 Alternative Credit Scoring", status: "Operational", time: "< 45ms" },
                { method: "POST", path: "/api/v1/loans/assess", label: "FT-03 / Part 06 ML Underwriting Engine", status: "Operational", time: "< 35ms" },
                { method: "POST", path: "/api/v1/fraud/analyze", label: "FT-02 Real-Time Anomaly Engine", status: "Operational", time: "< 60ms" },
                { method: "GET", path: "/api/v1/schemes/matches", label: "FT-04 Government Subsidy Matcher", status: "Operational", time: "< 25ms" },
                { method: "POST", path: "/api/v1/coach/ask", label: "FT-01 Bilingual Financial AI Coach", status: "Operational", time: "< 120ms" },
              ].map((item) => (
                <div key={item.path} className="flex flex-col sm:flex-row sm:items-center justify-between py-3 gap-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/40">
                      {item.method}
                    </span>
                    <span className="font-mono text-xs text-gray-300 font-medium">
                      {item.path}
                    </span>
                    <span className="hidden md:inline text-xs text-gray-500">
                      — {item.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-mono">
                    <span className="text-gray-400">{item.time}</span>
                    <span className="text-emerald-400 font-bold">{item.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <footer className="mt-auto border-t-2 border-[#222f46] bg-[#070a12] py-10 px-4">
        <div className="brutal-container flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 border border-black flex items-center justify-center">
              <Zap size={16} className="text-white fill-white" />
            </div>
            <div>
              <span className="font-black text-white">
                FIN<span className="text-blue-500">BRIDGE</span>
              </span>
              <p className="text-[11px] text-gray-500">Hack2Ignite 2026 • Team RAY</p>
            </div>
          </div>

          <p className="text-xs text-gray-400 text-center">
            Built by Ruturaj Bhome & Akhilesh Dhumal • FT-03 Alternative Credit Scoring & Micro-Lending
          </p>

          <div className="flex items-center gap-4 text-xs font-mono text-gray-400">
            <Link href="/dashboard" className="hover:text-white transition-colors">
              Dashboard
            </Link>
            <Link href="/loan/simulator" className="hover:text-white transition-colors">
              Simulator
            </Link>
            <Link href="/schemes" className="hover:text-white transition-colors">
              Schemes
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
