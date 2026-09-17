import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { checkHealth } from "@/lib/api";
import {
  ShieldCheck, TrendingUp, Cpu, FileText, BookOpen,
  ArrowRight, Zap, Globe, Calculator, CheckCircle2,
  Sparkles, Activity, ChevronRight, Star,
} from "lucide-react";

export default function HomePage() {
  const navigate = useNavigate();
  const { user, loginDemo } = useAuth();
  const [healthStatus, setHealthStatus] = useState<"checking" | "online" | "offline">("checking");
  const [healthLatency, setHealthLatency] = useState<number | null>(null);
  const [activeFeature, setActiveFeature] = useState(0);

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

  useEffect(() => {
    const interval = setInterval(() => setActiveFeature((f) => (f + 1) % 6), 3500);
    return () => clearInterval(interval);
  }, []);

  const handleLaunchDemo = async () => {
    await loginDemo();
    navigate("/dashboard");
  };

  const features = [
    { icon: TrendingUp, title: "Alternative Credit Scoring", desc: "7-dimension UPI-based trust score. No CIBIL required.", color: "#3b82f6", badge: "FT-03", href: "/credit-profile" },
    { icon: ShieldCheck, title: "AI Fraud Detection", desc: "Real-time heuristic anomaly detection on transactions.", color: "#8b5cf6", badge: "FT-02", href: "/fraud-alerts" },
    { icon: Calculator, title: "Micro-Loan Engine", desc: "Algorithmic sizing with overborrowing protection.", color: "#10b981", badge: "CORE", href: "/loan" },
    { icon: FileText, title: "Govt Scheme Matching", desc: "Auto-match MUDRA, PM SVANidhi, Stand-Up India.", color: "#f59e0b", badge: "FT-04", href: "/schemes" },
    { icon: Cpu, title: "Cash Flow Intelligence", desc: "Monthly trends, expense ratios, CSV ingestion.", color: "#22d3ee", badge: "FT-05", href: "/analytics" },
    { icon: BookOpen, title: "Bilingual AI Coach", desc: "Hindi & English financial guidance from LLM.", color: "#fb7185", badge: "FT-01", href: "/financial-coach" },
  ];

  const stats = [
    { label: "Loan Range", value: "₹50K–₹5L", sub: "Micro-MSME sized" },
    { label: "Approval Cycle", value: "72 hrs", sub: "Automated underwriting" },
    { label: "Min CIBIL", value: "0", sub: "Alternative scoring" },
    { label: "Risk Guard", value: "Active", sub: "Overborrow protection" },
  ];

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-base)" }}>
      {/* ── Navigation ─────────────────────────────────────── */}
      <nav className="nav px-4">
        <div className="container h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105"
              style={{ background: "var(--grad-brand)" }}>
              <Zap size={16} className="text-white fill-white" />
            </div>
            <div>
              <span className="text-lg font-bold text-white tracking-tight">
                FIN<span className="text-blue-400">BRIDGE</span>
              </span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {[["#features","Features"],["#simulator","Simulator"],["#workflow","Workflow"]].map(([href, label]) => (
              <a key={href} href={href} className="text-xs font-semibold text-slate-400 hover:text-white transition-colors uppercase tracking-wider">
                {label}
              </a>
            ))}
            <div className="flex items-center gap-1.5">
              <span className={`status-dot ${healthStatus === "online" ? "status-online" : "status-warning"}`} />
              <span className="text-xs text-slate-400 font-mono">
                {healthStatus === "online" ? `API ${healthLatency}ms` : "Standby"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {user ? (
              <Link to="/dashboard" className="btn btn-primary btn-sm">
                Dashboard <ArrowRight size={14} />
              </Link>
            ) : (
              <>
                <button onClick={handleLaunchDemo} className="btn btn-primary btn-sm">
                  <Sparkles size={14} className="text-amber-300" /> Live Demo
                </button>
                <Link to="/login" className="btn btn-ghost btn-sm hidden sm:inline-flex">Sign In</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="relative pt-32 pb-24 px-4 overflow-hidden">
        {/* Glow blobs */}
        <div className="glow-blob glow-blob-blue w-[600px] h-[600px] -top-48 -left-48 animate-glow-pulse" />
        <div className="glow-blob glow-blob-purple w-[400px] h-[400px] top-20 right-0 animate-glow-pulse" style={{ animationDelay: "1s" }} />

        {/* Grid bg */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{ backgroundImage: "linear-gradient(rgba(59,130,246,1) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,1) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />

        <div className="container relative z-10 text-center">
          {/* Pill badge */}
          <div className="animate-fade-in-up inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6"
            style={{ background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)" }}>
            <span className="status-dot status-online animate-pulse" />
            <span className="text-xs font-mono font-semibold text-blue-300 uppercase tracking-wider">
              Bharat MSME Credit Protocol • 100% Digital & Explainable
            </span>
          </div>

          {/* Headline */}
          <h1 className="animate-fade-in-up delay-100 text-5xl sm:text-7xl md:text-8xl font-black tracking-tight leading-[1.02] max-w-5xl mx-auto mb-6">
            Break the{" "}
            <span className="text-gradient">Credit Barrier</span>.
            <br />
            <span className="text-white">Unlock Micro-Loans</span>
            <br />
            <span className="text-slate-400 text-4xl sm:text-5xl md:text-6xl font-bold">with Real Data.</span>
          </h1>

          <p className="animate-fade-in-up delay-200 text-base sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10">
            FINBRIDGE replaces outdated credit bureau rejections with algorithmic trust.
            We analyze UPI velocity, seasonal cash flows, and GST regularity to approve micro-loans in 72 hours.
          </p>

          {/* CTAs */}
          <div className="animate-fade-in-up delay-300 flex flex-wrap items-center justify-center gap-4 mb-16">
            <button onClick={handleLaunchDemo}
              className="btn btn-primary btn-lg text-sm sm:text-base">
              <Zap size={18} />
              Launch Live Platform Demo
              <ArrowRight size={18} />
            </button>
            <Link to="/loan/simulator"
              className="btn btn-ghost btn-lg text-sm sm:text-base">
              <Calculator size={18} className="text-blue-400" />
              Repayment Simulator
            </Link>
          </div>

          {/* Stats */}
          <div className="animate-fade-in-up delay-400 grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {stats.map((s, i) => (
              <div key={i} className="card p-5 text-left"
                style={{ animationDelay: `${i * 100 + 400}ms` }}>
                <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-2">{s.label}</p>
                <p className="text-2xl font-black text-gradient-brand">{s.value}</p>
                <p className="text-xs text-slate-500 mt-1">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Grid ──────────────────────────────────── */}
      <section id="features" className="py-24 px-4" style={{ background: "rgba(10,15,30,0.5)" }}>
        <div className="container">
          <div className="text-center mb-16">
            <span className="badge badge-blue mb-4">Platform Modules</span>
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
              One Architecture.{" "}
              <span className="text-gradient">Six Superpowers.</span>
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Each module connects to our FastAPI backend and ML risk pipelines. Click any card to explore.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <Link key={i} to={f.href}
                  className="card card-interactive p-6 flex flex-col group"
                  style={{ borderTop: `2px solid ${f.color}30` }}
                  onMouseEnter={() => setActiveFeature(i)}>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ background: `${f.color}15`, border: `1px solid ${f.color}30` }}>
                      <Icon className="w-6 h-6" style={{ color: f.color }} />
                    </div>
                    <span className="badge" style={{
                      background: `${f.color}10`, color: f.color,
                      border: `1px solid ${f.color}25`, fontSize: "0.65rem"
                    }}>
                      {f.badge}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-gradient transition-all">{f.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed flex-1">{f.desc}</p>
                  <div className="flex items-center gap-2 mt-5 pt-4 border-t text-xs font-semibold transition-all group-hover:translate-x-1"
                    style={{ borderColor: "var(--border-subtle)", color: f.color }}>
                    <span>Explore Module</span>
                    <ChevronRight size={14} />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Simulator Preview ──────────────────────────────── */}
      <section id="simulator" className="py-24 px-4">
        <div className="container">
          <div className="card p-8 md:p-12 overflow-hidden" style={{ border: "1px solid rgba(59,130,246,0.2)" }}>
            {/* Terminal header */}
            <div className="terminal-header -mx-8 md:-mx-12 -mt-8 md:-mt-12 mb-8">
              <div className="flex items-center gap-1.5">
                <div className="terminal-dot bg-red-500" />
                <div className="terminal-dot bg-amber-500" />
                <div className="terminal-dot bg-emerald-500" />
              </div>
              <span className="text-xs font-mono text-slate-400 ml-2">
                SIMULATOR_CORE_V1 // FT-03_REPAYMENT_ENGINE
              </span>
              <span className="badge badge-green ml-auto">Live Sandbox</span>
            </div>

            <div className="grid lg:grid-cols-2 gap-10 items-center">
              <div>
                <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
                  Real-Time Loan &amp; Repayment Simulator
                </h2>
                <p className="text-slate-400 leading-relaxed mb-6">
                  Test feasibility before applying. Our simulator computes exact EMIs, total interest overhead,
                  and checks if the loan burden exceeds healthy cashflow thresholds.
                </p>
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {[
                    { label: "Principal", val: "₹1,00,000" },
                    { label: "Tenure", val: "12 Months", color: "#3b82f6" },
                    { label: "Est. EMI", val: "₹8,975/mo", color: "#10b981" },
                  ].map((item, i) => (
                    <div key={i} className="p-3 rounded-xl" style={{ background: "rgba(10,15,30,0.8)", border: "1px solid var(--border-subtle)" }}>
                      <p className="text-[10px] font-mono text-slate-500 uppercase mb-1">{item.label}</p>
                      <p className="text-base font-bold" style={{ color: item.color || "#f1f5f9" }}>{item.val}</p>
                    </div>
                  ))}
                </div>
                <Link to="/loan/simulator" className="btn btn-primary">
                  Open Full Simulator <ArrowRight size={16} />
                </Link>
              </div>

              <div className="p-6 rounded-xl space-y-3"
                style={{ background: "rgba(10,15,30,0.8)", border: "1px solid var(--border-subtle)" }}>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Underwriting Parameters</p>
                  <span className="badge badge-green">RBI Guidelines</span>
                </div>
                {[
                  "35% Maximum Repayment Burden Threshold",
                  "Automatic Overborrowing Risk Warning",
                  "Post-Loan Projected Operating Surplus",
                  "Seamless Transition to Loan Application",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-sm text-slate-300">
                    <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Workflow ────────────────────────────────────────── */}
      <section id="workflow" className="py-24 px-4" style={{ background: "rgba(10,15,30,0.5)" }}>
        <div className="container">
          <div className="text-center mb-16">
            <span className="badge badge-purple mb-4">Zero-Paperwork Journey</span>
            <h2 className="text-4xl font-black text-white mb-3">From Real Activity to Approved Credit</h2>
            <p className="text-slate-400">Four transparent steps for everyday Indian micro-enterprises.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { n: "01", title: "Register & Profile", desc: "Basic business identity in under 2 minutes.", color: "#3b82f6" },
              { n: "02", title: "Upload Transactions", desc: "Ingest UPI/banking CSV records for cash flow analysis.", color: "#8b5cf6" },
              { n: "03", title: "Receive Trust Score", desc: "Get an explainable 0–100 score with supporting factors.", color: "#10b981" },
              { n: "04", title: "Borrow Safely", desc: "Access calibrated micro-loans with matched govt subsidies.", color: "#f59e0b" },
            ].map((item) => (
              <div key={item.n} className="card p-6 animate-fade-in-up" style={{ borderTop: `2px solid ${item.color}40` }}>
                <span className="text-4xl font-black font-mono mb-4 block" style={{ color: item.color }}>{item.n}</span>
                <h4 className="text-base font-bold text-white mb-2">{item.title}</h4>
                <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── API Health ─────────────────────────────────────── */}
      <section className="py-16 px-4">
        <div className="container max-w-3xl mx-auto">
          <div className="card p-6">
            <div className="flex items-center justify-between pb-4 mb-4 border-b" style={{ borderColor: "var(--border-subtle)" }}>
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Live API Health</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className={`status-dot ${healthStatus === "online" ? "status-online" : "status-warning"}`} />
                <span className="text-xs font-mono text-slate-400">
                  {healthStatus === "online" ? `All Systems Operational${healthLatency ? ` • ${healthLatency}ms` : ""}` : "Local Standby"}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              {[
                { method: "GET",  path: "/health",                  label: "Core Health Ping",           ok: healthStatus === "online" },
                { method: "GET",  path: "/api/v1/credit/profile",   label: "FT-03 Credit Scoring",       ok: true },
                { method: "POST", path: "/api/v1/loans/assess",     label: "ML Underwriting Engine",     ok: true },
                { method: "POST", path: "/api/v1/fraud/analyze",    label: "FT-02 Anomaly Engine",       ok: true },
                { method: "GET",  path: "/api/v1/schemes/matches",  label: "Govt Subsidy Matcher",       ok: true },
                { method: "POST", path: "/api/v1/coach/ask",        label: "AI Financial Coach",         ok: true },
              ].map((item) => (
                <div key={item.path} className="flex items-center justify-between py-2.5 px-1 rounded-lg text-sm hover:bg-blue-500/3 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-mono font-bold px-1.5 py-0.5 rounded"
                      style={{ background: "rgba(59,130,246,0.1)", color: "#60a5fa", border: "1px solid rgba(59,130,246,0.2)" }}>
                      {item.method}
                    </span>
                    <span className="font-mono text-xs text-slate-300">{item.path}</span>
                  </div>
                  <span className={`text-xs font-mono font-bold ${item.ok ? "text-emerald-400" : "text-amber-400"}`}>
                    {item.ok ? "● 200 OK" : "○ Standby"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="py-10 px-4 border-t" style={{ borderColor: "var(--border-subtle)", background: "rgba(3,7,18,0.8)" }}>
        <div className="container flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--grad-brand)" }}>
              <Zap size={14} className="text-white fill-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">FIN<span className="text-blue-400">BRIDGE</span></p>
              <p className="text-[11px] text-slate-500">Hack2Ignite 2026 • Team RAY • FT-03</p>
            </div>
          </div>

          <p className="text-xs text-slate-500">Built by Ruturaj Bhome &amp; Akhilesh Dhumal</p>

          <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
            {[["Dashboard","/dashboard"],["Simulator","/loan/simulator"],["Schemes","/schemes"]].map(([label, href]) => (
              <Link key={href} to={href} className="hover:text-white transition-colors">{label}</Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
