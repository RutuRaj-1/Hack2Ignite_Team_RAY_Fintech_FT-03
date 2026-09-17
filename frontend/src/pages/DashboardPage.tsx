import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import {
  getBusiness, getAnalyticsSummary, getFraudSummary, getCreditProfile,
  assessLoan, seedDemoData,
  type BusinessResponse, type FinancialSummary, type FraudSummaryResponse,
  type CreditProfileResponse, type LoanAssessmentResponse,
} from "@/lib/api";
import { DashboardLayout } from "@/components/DashboardLayout";
import { MetricCard } from "@/components/ui/MetricCard";
import { TrustScoreCard } from "@/components/ui/TrustScoreCard";
import { RiskBadge } from "@/components/ui/RiskBadge";
import {
  IndianRupee, TrendingDown, TrendingUp, ShieldAlert,
  ArrowRight, Landmark, Bot, Zap, Loader2, Building2, Activity,
} from "lucide-react";

export default function DashboardPage() {
  const { firebaseUser, authLoading, getIdToken, isDemo } = useAuth();
  const [loading, setLoading] = useState(true);
  const [demoLoading, setDemoLoading] = useState(false);
  const [business, setBusiness] = useState<BusinessResponse | null>(null);
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [fraudSummary, setFraudSummary] = useState<FraudSummaryResponse | null>(null);
  const [creditProfile, setCreditProfile] = useState<CreditProfileResponse | null>(null);
  const [loanAssessment, setLoanAssessment] = useState<LoanAssessmentResponse | null>(null);

  const loadData = async () => {
    try {
      const idToken = await getIdToken();
      if (!idToken) return;

      let biz = await getBusiness(idToken).catch(() => null);
      if (!biz && (isDemo || localStorage.getItem("finbridge_demo_mode") === "true")) {
        await seedDemoData(idToken).catch(() => null);
        biz = await getBusiness(idToken).catch(() => null);
      }
      setBusiness(biz);

      if (biz) {
        const [an, fr, cr] = await Promise.all([
          getAnalyticsSummary(idToken).catch(() => null),
          getFraudSummary(idToken).catch(() => null),
          getCreditProfile(idToken).catch(() => null),
        ]);
        setSummary(an); setFraudSummary(fr); setCreditProfile(cr);
        if (cr && cr.trust_score > 40) {
          const loan = await assessLoan({ requested_amount: 500000, tenure_months: 12, purpose: "Working Capital" }, idToken).catch(() => null);
          setLoanAssessment(loan);
        }
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (!authLoading && firebaseUser) loadData();
  }, [authLoading, firebaseUser]);

  const loadDemoData = async () => {
    setDemoLoading(true);
    try {
      const idToken = await getIdToken();
      if (!idToken) return;
      await seedDemoData(idToken);
      setLoading(true);
      await loadData();
    } catch (e) { console.error(e); }
    finally { setDemoLoading(false); }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-[70vh] items-center justify-center gap-4 flex-col">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-2 border-blue-500/20" />
            <div className="absolute inset-0 rounded-full border-t-2 border-blue-500 animate-spin" />
          </div>
          <p className="text-sm font-mono text-slate-400">Loading your financial overview...</p>
        </div>
      </DashboardLayout>
    );
  }

  const friskLevel = fraudSummary ? (fraudSummary.high_risk.count > 0 ? "HIGH" : fraudSummary.medium_risk.count > 0 ? "MEDIUM" : "LOW") : null;

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Welcome back, <span className="text-gradient-brand">{business?.business_name || firebaseUser?.displayName || "User"}</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">Here's your business financial intelligence overview.</p>
        </div>
        <button onClick={loadDemoData} disabled={demoLoading || loading} className="btn btn-ghost btn-sm">
          {demoLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 text-amber-400" />}
          {demoLoading ? "Seeding..." : "Demo Data"}
        </button>
      </div>

      {!business ? (
        <div className="card p-12 text-center flex flex-col items-center">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6 animate-float"
            style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)" }}>
            <Building2 className="w-10 h-10 text-blue-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">No Business Profile Found</h2>
          <p className="text-slate-400 mb-8 max-w-md">Complete business onboarding to start using the financial intelligence platform.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/onboarding" className="btn btn-primary">Complete Onboarding</Link>
            <button onClick={loadDemoData} disabled={demoLoading} className="btn btn-ghost">
              {demoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 text-amber-400" />}
              Quick Start (Demo Data)
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* KPI Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Avg Monthly Revenue" delay={0}
              value={summary ? `₹${parseFloat(summary.monthly_revenue).toLocaleString("en-IN")}` : "₹—"}
              icon={TrendingUp} trendDirection="up" trend="Consistent"
              accentColor="#10b981"
            />
            <MetricCard
              title="Avg Monthly Expenses" delay={100}
              value={summary ? `₹${parseFloat(summary.monthly_expenses).toLocaleString("en-IN")}` : "₹—"}
              icon={TrendingDown} accentColor="#f59e0b"
            />
            <MetricCard
              title="Net Cash Flow" delay={200}
              value={summary ? `₹${parseFloat(summary.net_cash_flow).toLocaleString("en-IN")}` : "₹—"}
              icon={IndianRupee}
              trendDirection={summary && parseFloat(summary.net_cash_flow) > 0 ? "up" : "down"}
              accentColor="#3b82f6"
            />
            <div className="card p-5 animate-fade-in-up" style={{ animationDelay: "300ms", borderTop: "2px solid rgba(239,68,68,0.3)" }}>
              <div className="flex items-start justify-between mb-3">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Fraud Risk</p>
                <ShieldAlert className={`w-5 h-5 ${friskLevel === "HIGH" ? "text-red-400" : friskLevel === "MEDIUM" ? "text-amber-400" : "text-emerald-400"}`} />
              </div>
              {fraudSummary ? (
                <>
                  <RiskBadge level={friskLevel as "LOW" | "MEDIUM" | "HIGH"} />
                  <p className="text-xs text-slate-500 mt-2">{fraudSummary.open_alerts} open alert{fraudSummary.open_alerts !== 1 ? "s" : ""}</p>
                </>
              ) : (
                <p className="text-sm text-slate-500 mt-2">No data yet</p>
              )}
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="flex flex-col gap-5">
              <TrustScoreCard score={creditProfile?.trust_score || 0} delay={400} />

              {loanAssessment && (
                <div className="card p-5 animate-fade-in-up delay-500" style={{ borderTop: "2px solid rgba(59,130,246,0.4)" }}>
                  <div className="flex items-center gap-2 mb-3">
                    <Activity className="w-4 h-4 text-blue-400" />
                    <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Prototype Loan Range</h3>
                  </div>
                  <p className="text-xs text-slate-500 mb-3">Based on Trust Score & Cash Flow</p>
                  <p className="text-xl font-bold text-blue-400 mb-3">
                    ₹{loanAssessment.recommended_min_amount.toLocaleString("en-IN")} –{" "}
                    ₹{loanAssessment.recommended_max_amount.toLocaleString("en-IN")}
                  </p>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs text-slate-400">EMI: ₹{loanAssessment.estimated_emi.toLocaleString("en-IN")}/mo</span>
                    <RiskBadge level={loanAssessment.risk_level} />
                  </div>
                  <Link to="/loan" className="btn btn-outline btn-sm w-full">
                    Apply Now <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>

            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { to: "/analytics",       icon: TrendingUp,  color: "#3b82f6",  title: "Financial Analytics",   desc: "View cash flow trends, expense breakdowns, and revenue consistency." },
                { to: "/schemes",         icon: Landmark,    color: "#f59e0b",  title: "Govt Schemes",          desc: "Discover and match with MSME subsidies and loan schemes." },
                { to: "/fraud-alerts",    icon: ShieldAlert, color: "#8b5cf6",  title: "Risk Intelligence",     desc: "Real-time fraud detection and transaction anomaly analysis." },
                { to: "/financial-coach", icon: Bot,         color: "#fb7185",  title: "AI Financial Coach",    desc: "Personalized Hindi/English guidance to improve trust score." },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.to} to={item.to}
                    className="card p-5 group cursor-pointer animate-fade-in-up"
                    style={{ borderTop: `2px solid ${item.color}30`, animationDelay: "400ms" }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                      style={{ background: `${item.color}12`, border: `1px solid ${item.color}25` }}>
                      <Icon className="w-5 h-5" style={{ color: item.color }} />
                    </div>
                    <h3 className="text-sm font-bold text-white mb-2">{item.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                    <div className="flex items-center gap-1 mt-4 text-xs font-semibold transition-all group-hover:translate-x-1"
                      style={{ color: item.color }}>
                      Explore <ArrowRight className="w-3 h-3" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
