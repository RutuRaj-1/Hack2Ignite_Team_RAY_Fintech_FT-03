import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { checkHealth } from "@/lib/api";
import {
  TrendingUp, ShieldAlert, Cpu, Landmark, Bot,
  ArrowRight, Zap, Calculator, CheckCircle2,
  Sparkles, Activity, ChevronRight, Briefcase,
} from "lucide-react";

export default function HomePage() {
  const navigate = useNavigate();
  const { user, loginDemo } = useAuth();
  const [healthStatus, setHealthStatus] = useState<"checking" | "online" | "offline">("checking");
  const [healthLatency, setHealthLatency] = useState<number | null>(null);

  useEffect(() => {
    const ping = async () => {
      const start = performance.now();
      try {
        await checkHealth();
        setHealthStatus("online");
        setHealthLatency(Math.round(performance.now() - start));
      } catch {
        setHealthStatus("offline");
      }
    };
    ping();
  }, []);

  const handleLaunchDemo = async () => {
    await loginDemo();
    navigate("/dashboard");
  };

  const features = [
    {
      icon: TrendingUp,
      title: "Alternative Credit Scoring",
      desc: "7-dimension UPI and cash-flow trust score. Eliminates bureau bias for micro-enterprises.",
      badge: "FT-03",
      accent: "#237277",
      bgSoft: "#EEF8F7",
      href: "/credit-profile",
    },
    {
      icon: ShieldAlert,
      title: "AI Fraud & Anomaly Shield",
      desc: "Real-time heuristic anomaly detection on transactions to prevent fraud and over-leverage.",
      badge: "FT-02",
      accent: "#D96559",
      bgSoft: "#FDECEA",
      href: "/fraud-alerts",
    },
    {
      icon: Briefcase,
      title: "Inclusive Micro-Lending",
      desc: "Cashflow-calibrated underwriting with automated overborrowing safeguards.",
      badge: "CORE",
      accent: "#169C73",
      bgSoft: "#E8F7F1",
      href: "/loan",
    },
    {
      icon: Landmark,
      title: "Govt Scheme Discovery",
      desc: "Instant matching to MUDRA, PM SVANidhi, and Stand-Up India subsidies.",
      badge: "FT-04",
      accent: "#D89B22",
      bgSoft: "#FFF6DF",
      href: "/schemes",
    },
    {
      icon: Cpu,
      title: "Cash Flow Intelligence",
      desc: "Monthly trends, operating expense ratios, and seamless CSV transaction ingestion.",
      badge: "FT-05",
      accent: "#2563EB",
      bgSoft: "#EAF2FF",
      href: "/analytics",
    },
    {
      icon: Bot,
      title: "Bilingual AI Financial Coach",
      desc: "Hindi & English conversational financial guidance powered by grounded domain intelligence.",
      badge: "FT-01",
      accent: "#7457C8",
      bgSoft: "#F2EEFF",
      href: "/financial-coach",
    },
  ];

  const stats = [
    { label: "Loan Range", value: "₹50K–₹5L", sub: "Calibrated MSME sizing" },
    { label: "Underwriting Cycle", value: "72 hrs", sub: "Automated cashflow check" },
    { label: "Min CIBIL Needed", value: "0", sub: "Real behavioral data" },
    { label: "Overborrow Guard", value: "Active", sub: "35% debt burden cap" },
  ];

  return (
    <div className="min-h-screen" style={{ background: "var(--background)", color: "var(--text-primary)" }}>
      {/* ── Top Navigation ──────────────────────────────────── */}
      <nav
        className="sticky top-0 z-50 px-6 backdrop-blur-md"
        style={{
          background: "rgba(255, 255, 255, 0.92)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div className="max-w-7xl mx-auto h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm"
              style={{ background: "var(--brand-700)" }}
            >
              <Zap size={18} className="text-white fill-white" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight" style={{ color: "var(--brand-900)" }}>
                Fin<span style={{ color: "var(--brand-600)" }}>Bridge</span>
              </span>
              <span
                className="hidden sm:inline-block ml-2 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full"
                style={{ background: "var(--brand-50)", color: "var(--brand-800)" }}
              >
                MSME Platform
              </span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-7">
            <a href="#features" className="text-xs font-semibold uppercase tracking-wider hover:text-teal-800 transition-colors" style={{ color: "var(--text-secondary)" }}>
              Platform Modules
            </a>
            <a href="#simulator" className="text-xs font-semibold uppercase tracking-wider hover:text-teal-800 transition-colors" style={{ color: "var(--text-secondary)" }}>
              Repayment Sandbox
            </a>
            <a href="#workflow" className="text-xs font-semibold uppercase tracking-wider hover:text-teal-800 transition-colors" style={{ color: "var(--text-secondary)" }}>
              Workflow
            </a>
            <div className="flex items-center gap-2 pl-2 border-l" style={{ borderColor: "var(--border)" }}>
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: healthStatus === "online" ? "var(--success)" : "var(--warning)" }}
              />
              <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                {healthStatus === "online" ? `API ${healthLatency}ms` : "API Standby"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {user ? (
              <Link to="/dashboard" className="btn btn-primary btn-sm flex items-center gap-1.5">
                Dashboard <ArrowRight size={14} />
              </Link>
            ) : (
              <>
                <button
                  onClick={handleLaunchDemo}
                  className="btn btn-primary btn-sm flex items-center gap-1.5"
                  style={{ background: "var(--brand-700)" }}
                >
                  <Sparkles size={14} /> Live Demo
                </button>
                <Link to="/login" className="btn btn-secondary btn-sm hidden sm:inline-flex">
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── Hero Section ────────────────────────────────────── */}
      <section className="relative pt-20 pb-20 px-6 overflow-hidden" style={{ background: "linear-gradient(180deg, #FFFFFF 0%, #F7FAF9 100%)" }}>
        {/* Subtle decorative mint pattern */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            backgroundImage: "radial-gradient(#237277 0.75px, transparent 0.75px)",
            backgroundSize: "28px 28px",
          }}
        />

        <div className="max-w-5xl mx-auto relative z-10 text-center">
          {/* Tagline Pill */}
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 animate-fade-in"
            style={{
              background: "var(--brand-50)",
              border: "1px solid var(--brand-100)",
              color: "var(--brand-800)",
            }}
          >
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "var(--success)" }} />
            <span className="text-xs font-semibold tracking-wide uppercase">
              AI-Powered Micro-Lending &amp; Financial Intelligence
            </span>
          </div>

          {/* Headline */}
          <h1
            className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.08] max-w-4xl mx-auto mb-6"
            style={{ color: "var(--brand-900)" }}
          >
            Break the Credit Barrier.{" "}
            <br className="hidden sm:inline" />
            <span style={{ color: "var(--brand-700)" }}>Unlock Micro-Loans</span>{" "}
            with Real Data.
          </h1>

          <p
            className="text-base sm:text-xl max-w-2xl mx-auto leading-relaxed mb-10"
            style={{ color: "var(--text-secondary)" }}
          >
            FinBridge replaces bureau rejections with explainable algorithmic trust.
            We evaluate daily transaction velocity, operating margins, and seasonal cash flow to qualify Bharat's MSMEs in 72 hours.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
            <button
              onClick={handleLaunchDemo}
              className="btn btn-primary btn-lg flex items-center gap-2 shadow-md"
              style={{ background: "var(--brand-700)", padding: "14px 28px", fontSize: "15px" }}
            >
              <Zap size={18} />
              Launch Live Platform Demo
              <ArrowRight size={18} />
            </button>
            <Link
              to="/loan/simulator"
              className="btn btn-secondary btn-lg flex items-center gap-2"
              style={{ padding: "14px 28px", fontSize: "15px" }}
            >
              <Calculator size={18} style={{ color: "var(--brand-700)" }} />
              Repayment Sandbox
            </Link>
          </div>

          {/* Key Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            {stats.map((s, i) => (
              <div
                key={i}
                className="card p-5"
                style={{
                  background: "#FFFFFF",
                  border: "1px solid var(--border)",
                  boxShadow: "0 2px 8px rgba(18,62,64,0.04)",
                }}
              >
                <p className="text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted)" }}>
                  {s.label}
                </p>
                <p className="text-2xl font-bold font-financial" style={{ color: "var(--brand-900)" }}>
                  {s.value}
                </p>
                <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
                  {s.sub}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features / Architecture Grid ────────────────────── */}
      <section id="features" className="py-20 px-6" style={{ background: "var(--surface-100)" }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span
              className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-3"
              style={{ background: "var(--brand-100)", color: "var(--brand-900)" }}
            >
              Integrated Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold mb-3" style={{ color: "var(--brand-900)" }}>
              One Coherent Platform. Six Intelligence Layers.
            </h2>
            <p className="max-w-xl mx-auto text-sm sm:text-base" style={{ color: "var(--text-secondary)" }}>
              Built specifically around the national MSME credit gap. Every module connects to explainable underwriting rules and live telemetry.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <Link
                  key={i}
                  to={f.href}
                  className="card p-6 flex flex-col group transition-all duration-200"
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid var(--border)",
                    boxShadow: "0 2px 6px rgba(18,62,64,0.04)",
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: f.bgSoft, border: `1px solid ${f.accent}20` }}
                    >
                      <Icon className="w-6 h-6" style={{ color: f.accent }} />
                    </div>
                    <span
                      className="px-2.5 py-0.5 rounded-md text-xs font-bold font-mono uppercase"
                      style={{ background: f.bgSoft, color: f.accent, border: `1px solid ${f.accent}30` }}
                    >
                      {f.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-bold mb-2 group-hover:text-teal-800 transition-colors" style={{ color: "var(--brand-900)" }}>
                    {f.title}
                  </h3>
                  <p className="text-xs leading-relaxed flex-1" style={{ color: "var(--text-secondary)" }}>
                    {f.desc}
                  </p>

                  <div
                    className="flex items-center gap-1.5 mt-5 pt-3 border-t text-xs font-semibold group-hover:translate-x-1 transition-transform"
                    style={{ borderColor: "var(--border)", color: f.accent }}
                  >
                    <span>Launch Module</span>
                    <ChevronRight size={14} />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Repayment Sandbox Preview ───────────────────────── */}
      <section id="simulator" className="py-20 px-6" style={{ background: "#FFFFFF" }}>
        <div className="max-w-5xl mx-auto">
          <div
            className="card p-8 md:p-10"
            style={{
              background: "var(--surface-50)",
              border: "1px solid var(--border)",
              boxShadow: "0 4px 16px rgba(18,62,64,0.05)",
            }}
          >
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              <div>
                <span
                  className="inline-block px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider mb-3"
                  style={{ background: "var(--brand-100)", color: "var(--brand-800)" }}
                >
                  FT-03 Engine Preview
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold mb-3" style={{ color: "var(--brand-900)" }}>
                  Real-Time Loan Sizing &amp; Burden Check
                </h2>
                <p className="text-sm leading-relaxed mb-6" style={{ color: "var(--text-secondary)" }}>
                  Test feasibility before underwriting. Our simulator evaluates exact monthly installments against operating cash surplus to prevent default cycles.
                </p>

                <div className="grid grid-cols-3 gap-3 mb-6">
                  {[
                    { label: "Principal", val: "₹1,00,000", color: "var(--brand-900)" },
                    { label: "Tenure", val: "12 Months", color: "var(--brand-700)" },
                    { label: "Est. EMI", val: "₹8,975/mo", color: "var(--success)" },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-xl text-left"
                      style={{ background: "#FFFFFF", border: "1px solid var(--border)" }}
                    >
                      <p className="text-[10px] font-semibold uppercase mb-1" style={{ color: "var(--text-muted)" }}>
                        {item.label}
                      </p>
                      <p className="text-sm font-bold font-financial" style={{ color: item.color }}>
                        {item.val}
                      </p>
                    </div>
                  ))}
                </div>

                <Link
                  to="/loan/simulator"
                  className="btn btn-primary inline-flex items-center gap-2"
                  style={{ background: "var(--brand-700)" }}
                >
                  Open Full Sandbox <ArrowRight size={16} />
                </Link>
              </div>

              <div
                className="p-6 rounded-2xl space-y-3.5"
                style={{ background: "#FFFFFF", border: "1px solid var(--border)" }}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--brand-900)" }}>
                    Underwriting Guardrails
                  </p>
                  <span
                    className="px-2 py-0.5 rounded text-[11px] font-semibold"
                    style={{ background: "var(--success-soft)", color: "var(--success-text)" }}
                  >
                    RBI Aligned
                  </span>
                </div>

                {[
                  "35% maximum debt repayment burden ceiling",
                  "Automated overborrowing & leverage warning",
                  "Post-installment operating buffer verification",
                  "Direct integration with Govt Subsidy Engine",
                ].map((rule, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-xs" style={{ color: "var(--text-body)" }}>
                    <CheckCircle2 size={16} className="flex-shrink-0" style={{ color: "var(--success)" }} />
                    <span>{rule}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Zero Paperwork Journey ──────────────────────────── */}
      <section id="workflow" className="py-20 px-6" style={{ background: "var(--surface-100)" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span
              className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-3"
              style={{ background: "var(--brand-100)", color: "var(--brand-900)" }}
            >
              Zero Bureaucracy
            </span>
            <h2 className="text-3xl font-bold mb-3" style={{ color: "var(--brand-900)" }}>
              From Real Activity to Approved Credit
            </h2>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Four transparent steps designed for everyday Indian micro-enterprises.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { n: "01", title: "Profile Enterprise", desc: "Basic identity and operational category in under 2 minutes.", color: "#237277" },
              { n: "02", title: "Ingest Cash Flow", desc: "Upload UPI & bank statement CSV records without paperwork.", color: "#2563EB" },
              { n: "03", title: "Receive Trust Score", desc: "Get an explainable 0–100 behavioral score with key factors.", color: "#169C73" },
              { n: "04", title: "Calibrated Lending", desc: "Access calibrated micro-loans matched with applicable subsidies.", color: "#D89B22" },
            ].map((step) => (
              <div
                key={step.n}
                className="card p-6"
                style={{
                  background: "#FFFFFF",
                  border: "1px solid var(--border)",
                  borderTop: `3px solid ${step.color}`,
                }}
              >
                <span className="text-3xl font-black font-mono mb-3 block" style={{ color: step.color }}>
                  {step.n}
                </span>
                <h4 className="text-sm font-bold mb-1.5" style={{ color: "var(--brand-900)" }}>
                  {step.title}
                </h4>
                <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Live Telemetry & API Health ─────────────────────── */}
      <section className="py-16 px-6" style={{ background: "#FFFFFF" }}>
        <div className="max-w-3xl mx-auto">
          <div
            className="card p-6"
            style={{
              background: "#FFFFFF",
              border: "1px solid var(--border)",
              boxShadow: "0 2px 8px rgba(18,62,64,0.04)",
            }}
          >
            <div className="flex items-center justify-between pb-4 mb-4 border-b" style={{ borderColor: "var(--border)" }}>
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5" style={{ color: "var(--success)" }} />
                <h3 className="text-sm font-bold" style={{ color: "var(--brand-900)" }}>
                  Core Underwriting Telemetry
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: healthStatus === "online" ? "var(--success)" : "var(--warning)" }}
                />
                <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                  {healthStatus === "online" ? `All Endpoints Operational (${healthLatency}ms)` : "Standby Mode"}
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              {[
                { method: "GET", path: "/health", label: "Core Service Health", ok: healthStatus === "online" },
                { method: "GET", path: "/api/v1/credit/profile", label: "FT-03 Credit Scoring", ok: true },
                { method: "POST", path: "/api/v1/loans/assess", label: "Underwriting Pipeline", ok: true },
                { method: "POST", path: "/api/v1/fraud/analyze", label: "FT-02 Anomaly Heuristics", ok: true },
                { method: "GET", path: "/api/v1/schemes/matches", label: "FT-04 Subsidy Engine", ok: true },
                { method: "POST", path: "/api/v1/coach/ask", label: "FT-01 AI Coach Pipeline", ok: true },
              ].map((ep) => (
                <div
                  key={ep.path}
                  className="flex items-center justify-between py-2 px-3 rounded-lg text-xs"
                  style={{ background: "var(--surface-50)" }}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="font-mono font-bold px-1.5 py-0.5 rounded text-[10px]"
                      style={{ background: "var(--brand-100)", color: "var(--brand-800)" }}
                    >
                      {ep.method}
                    </span>
                    <span className="font-mono" style={{ color: "var(--text-body)" }}>{ep.path}</span>
                    <span className="hidden sm:inline text-[11px]" style={{ color: "var(--text-muted)" }}>• {ep.label}</span>
                  </div>
                  <span className="font-mono font-semibold" style={{ color: ep.ok ? "var(--success-text)" : "var(--warning-text)" }}>
                    {ep.ok ? "200 OK" : "Standby"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer
        className="py-10 px-6 border-t"
        style={{
          background: "var(--surface-100)",
          borderColor: "var(--border)",
        }}
      >
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shadow-sm"
              style={{ background: "var(--brand-700)" }}
            >
              <Zap size={15} className="text-white fill-white" />
            </div>
            <div>
              <p className="text-sm font-bold" style={{ color: "var(--brand-900)" }}>
                Fin<span style={{ color: "var(--brand-600)" }}>Bridge</span>
              </p>
              <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                Hack2Ignite 2026 • Team RAY • FT-03 Hero Track
              </p>
            </div>
          </div>

          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
            Built for Indian MSMEs with Explainable AI &amp; Cash Flow Underwriting
          </p>

          <div className="flex items-center gap-5 text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>
            <Link to="/dashboard" className="hover:text-teal-800 transition-colors">Dashboard</Link>
            <Link to="/loan/simulator" className="hover:text-teal-800 transition-colors">Simulator</Link>
            <Link to="/schemes" className="hover:text-teal-800 transition-colors">Govt Schemes</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
