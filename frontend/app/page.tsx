"use client";

import Link from "next/link";
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
} from "lucide-react";

// ────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────

interface FeatureCardProps {
  icon: React.ReactNode;
  badge: string;
  badgeVariant: string;
  title: string;
  description: string;
  delay: string;
}

interface StatProps {
  value: string;
  label: string;
  delay: string;
}

// ────────────────────────────────────────────────────────────
// Sub-components
// ────────────────────────────────────────────────────────────

function NavBar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-[hsl(220_14%_18%)]">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div
            id="nav-logo-icon"
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "var(--gradient-brand)" }}
          >
            <Zap size={18} className="text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">
            <span className="gradient-text">FIN</span>
            <span className="text-[hsl(210_20%_95%)]">BRIDGE</span>
          </span>
        </div>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          {["Platform", "How it Works", "For MSMEs", "Docs"].map((item) => (
            <a
              key={item}
              href="#"
              className="text-sm font-medium text-[hsl(215_16%_65%)] hover:text-[hsl(210_20%_95%)] transition-colors"
            >
              {item}
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="flex items-center gap-3">
          <button id="nav-login-btn" className="btn btn-ghost text-sm py-2 px-4">
            Sign In
          </button>
          <button id="nav-apply-btn" className="btn btn-primary text-sm py-2 px-5">
            Apply Now
          </button>
        </div>
      </div>
    </nav>
  );
}

function HeroSection() {
  return (
    <section
      id="hero"
      className="relative min-h-dvh flex flex-col items-center justify-center text-center px-6 pt-24 pb-16 overflow-hidden"
    >
      {/* Background radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "var(--gradient-hero)" }}
      />
      {/* Decorative grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(215 20% 60%) 1px, transparent 1px), linear-gradient(90deg, hsl(215 20% 60%) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto space-y-8">
        {/* Badge */}
        <div className="animate-fade-in flex justify-center">
          <span className="badge badge-blue">
            <span className="status-dot status-dot-online" />
            Built for Bharat&apos;s MSMEs
          </span>
        </div>

        {/* Headline */}
        <h1 className="animate-fade-in-up delay-100 text-5xl md:text-7xl font-black leading-none tracking-tighter">
          <span className="text-[hsl(210_20%_95%)]">Break the</span>
          <br />
          <span className="gradient-text">Credit Barrier</span>
        </h1>

        {/* Sub-headline */}
        <p className="animate-fade-in-up delay-200 text-lg md:text-xl text-[hsl(215_16%_65%)] max-w-2xl mx-auto leading-relaxed">
          FINBRIDGE uses your real financial story — UPI transactions, GST
          filings, and cash flows — to unlock micro-loans for small businesses
          that traditional credit bureaus ignore.
        </p>

        {/* CTA buttons */}
        <div className="animate-fade-in-up delay-300 flex flex-wrap gap-4 justify-center">
          <button id="hero-apply-btn" className="btn btn-primary text-base py-3 px-8">
            Get Your Loan Score
            <ArrowRight size={18} />
          </button>
          <button id="hero-learn-btn" className="btn btn-ghost text-base py-3 px-8">
            See How It Works
          </button>
        </div>

        {/* Trust row */}
        <div className="animate-fade-in-up delay-400 flex flex-wrap gap-6 justify-center pt-2">
          {[
            { icon: <Lock size={14} />, text: "Bank-grade encryption" },
            { icon: <CheckCircle size={14} />, text: "RBI-compliant framework" },
            { icon: <Globe size={14} />, text: "Serving 6 states" },
          ].map(({ icon, text }) => (
            <span
              key={text}
              className="flex items-center gap-2 text-sm text-[hsl(215_12%_45%)]"
            >
              {icon}
              {text}
            </span>
          ))}
        </div>
      </div>

      {/* Floating stat cards */}
      <div className="animate-fade-in-up delay-500 mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl w-full">
        {[
          { value: "₹50K–₹5L", label: "Loan Range" },
          { value: "72 hrs", label: "Approval Time" },
          { value: "98%", label: "Uptime SLA" },
          { value: "0 CIBIL", label: "Score Required" },
        ].map(({ value, label }) => (
          <div key={label} className="glass-card p-4 text-center">
            <div className="text-2xl font-black gradient-text">{value}</div>
            <div className="text-xs text-[hsl(215_12%_45%)] mt-1">{label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function FeatureCard({
  icon,
  badge,
  badgeVariant,
  title,
  description,
  delay,
}: FeatureCardProps) {
  return (
    <div className={`glass-card p-6 space-y-4 animate-fade-in-up ${delay}`}>
      <div className="flex items-start justify-between">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-white"
          style={{ background: "var(--gradient-brand)" }}
        >
          {icon}
        </div>
        <span className={`badge ${badgeVariant}`}>{badge}</span>
      </div>
      <h3 className="text-lg font-bold text-[hsl(210_20%_95%)]">{title}</h3>
      <p className="text-sm text-[hsl(215_16%_65%)] leading-relaxed">
        {description}
      </p>
    </div>
  );
}

function FeaturesSection() {
  const features: FeatureCardProps[] = [
    {
      icon: <TrendingUp size={22} />,
      badge: "FT-03 Core",
      badgeVariant: "badge-blue",
      title: "Alternative Credit Scoring",
      description:
        "Our ML pipeline analyses UPI velocity, GST filing consistency, seasonal cash flows, and utility bill regularity to build a true creditworthiness profile.",
      delay: "delay-100",
    },
    {
      icon: <ShieldCheck size={22} />,
      badge: "FT-02",
      badgeVariant: "badge-purple",
      title: "AI Fraud Detection",
      description:
        "Real-time anomaly detection flags suspicious transaction patterns, protecting lenders and borrowers from financial fraud before damage is done.",
      delay: "delay-200",
    },
    {
      icon: <FileText size={22} />,
      badge: "FT-04",
      badgeVariant: "badge-green",
      title: "Government Scheme Matching",
      description:
        "Automatically surface eligible MSME subsidies, MUDRA schemes, and state-level credit programs based on your business profile.",
      delay: "delay-300",
    },
    {
      icon: <Cpu size={22} />,
      badge: "FT-05",
      badgeVariant: "badge-amber",
      title: "Expense Intelligence",
      description:
        "Automated categorisation of business expenses with cash flow forecasting and profitability dashboards powered by your own transaction data.",
      delay: "delay-100",
    },
    {
      icon: <BookOpen size={22} />,
      badge: "FT-01",
      badgeVariant: "badge-blue",
      title: "Financial Literacy Coach",
      description:
        "An AI-powered coach that guides borrowers through loan management, credit improvement, and financial planning in Hindi and English.",
      delay: "delay-200",
    },
    {
      icon: <Lock size={22} />,
      badge: "Security",
      badgeVariant: "badge-purple",
      title: "Zero-Trust Architecture",
      description:
        "End-to-end encryption, JWT-secured API endpoints, and Supabase Row-Level Security ensure your financial data remains private.",
      delay: "delay-300",
    },
  ];

  return (
    <section id="features" className="py-24 px-6">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-4xl md:text-5xl font-black text-[hsl(210_20%_95%)]">
            One Platform.{" "}
            <span className="gradient-text">Five Superpowers.</span>
          </h2>
          <p className="text-[hsl(215_16%_65%)] max-w-xl mx-auto">
            Every feature is designed around a single mission: making credit
            accessible to every hardworking Indian entrepreneur.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <FeatureCard key={f.title} {...f} />
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const steps = [
    {
      num: "01",
      title: "Create Your Profile",
      desc: "Register your MSME in under 5 minutes. Upload GST details, link your UPI ID, and submit KYC documents digitally.",
    },
    {
      num: "02",
      title: "AI Analyses Your Data",
      desc: "Our ML engine analyses 200+ alternative signals from your real financial activity — no CIBIL score needed.",
    },
    {
      num: "03",
      title: "Receive Your Score",
      desc: "Get a transparent FINBRIDGE Credit Score with an explainability report showing exactly how to improve it.",
    },
    {
      num: "04",
      title: "Get Funded",
      desc: "Matched lenders review your profile and funds are disbursed within 72 hours of approval.",
    },
  ];

  return (
    <section id="how-it-works" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-[hsl(210_20%_95%)]">
            From Zero to <span className="gradient-text">Funded</span>
          </h2>
          <p className="text-[hsl(215_16%_65%)]">Four simple steps.</p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 relative">
          {/* connector line */}
          <div className="hidden md:block absolute top-10 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-[hsl(217_100%_60%/0.4)] to-transparent" />

          {steps.map(({ num, title, desc }) => (
            <div key={num} className="glass-card p-6 space-y-3 text-center relative">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold mx-auto mb-4"
                style={{ background: "var(--gradient-brand)" }}
              >
                {num}
              </div>
              <h3 className="font-bold text-[hsl(210_20%_95%)]">{title}</h3>
              <p className="text-sm text-[hsl(215_16%_65%)] leading-relaxed">
                {desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ApiStatusSection() {
  return (
    <section id="api-status" className="py-16 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="glass-card p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-[hsl(210_20%_95%)]">
              API Health
            </h3>
            <span className="badge badge-green">
              <span className="status-dot status-dot-online" />
              All Systems Operational
            </span>
          </div>

          <div className="space-y-3">
            {[
              { name: "GET /health", status: "Operational", time: "< 10ms" },
              { name: "POST /api/v1/auth/login", status: "Operational", time: "< 50ms" },
              { name: "GET /api/v1/credit/score/:id", status: "Coming in Part 03", time: "—" },
              { name: "POST /api/v1/loans/apply", status: "Coming in Part 02", time: "—" },
            ].map(({ name, status, time }) => (
              <div
                key={name}
                className="flex items-center justify-between py-3 border-b border-[hsl(220_14%_18%)] last:border-0"
              >
                <code className="mono text-sm text-[hsl(217_100%_75%)]">
                  {name}
                </code>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-[hsl(215_12%_45%)]">{time}</span>
                  <span
                    className={`text-xs font-medium ${
                      status === "Operational"
                        ? "text-[hsl(158_64%_65%)]"
                        : "text-[hsl(215_16%_65%)]"
                    }`}
                  >
                    {status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-[hsl(220_14%_18%)] py-12 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "var(--gradient-brand)" }}
          >
            <Zap size={14} className="text-white" />
          </div>
          <span className="font-bold">
            <span className="gradient-text">FIN</span>
            <span className="text-[hsl(210_20%_95%)]">BRIDGE</span>
          </span>
        </div>

        <p className="text-sm text-[hsl(215_12%_45%)] text-center">
          Built by Team RAY — Ruturaj Bhome & Akhilesh Dhumal · Hack2Ignite
          2026 · FT-03
        </p>

        <div className="flex gap-6">
          {["Privacy", "Terms", "API Docs"].map((link) => (
            <a
              key={link}
              href="#"
              className="text-sm text-[hsl(215_12%_45%)] hover:text-[hsl(215_16%_65%)] transition-colors"
            >
              {link}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}

// ────────────────────────────────────────────────────────────
// Page
// ────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <main>
      <NavBar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <ApiStatusSection />
      <Footer />
    </main>
  );
}
