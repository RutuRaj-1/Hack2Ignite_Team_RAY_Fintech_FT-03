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
  CheckCircle2, AlertCircle,
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

  const friskLevel = fraudSummary
    ? fraudSummary.high_risk.count > 0 ? "HIGH"
      : fraudSummary.medium_risk.count > 0 ? "MEDIUM"
      : "LOW"
    : null;

  const netCashFlow = summary ? parseFloat(summary.net_cash_flow) : 0;
  const isPositiveCashFlow = netCashFlow > 0;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-[70vh] items-center justify-center gap-4 flex-col">
          <div className="spinner" />
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>Loading your financial overview...</p>
        </div>
      </DashboardLayout>
    );
  }

  const formatCurrency = (val: string | number) => {
    const num = typeof val === "string" ? parseFloat(val) : val;
    if (isNaN(num)) return "₹—";
    return `₹${num.toLocaleString("en-IN")}`;
  };

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider badge badge-brand">
              Financial Dashboard
            </span>
          </div>
          <h1 className="text-h1" style={{ color: "var(--brand-900)" }}>
            Good day, {business?.business_name || firebaseUser?.displayName?.split(" ")[0] || "Welcome"}
          </h1>
          <p className="mt-1" style={{ color: "var(--text-muted)", fontSize: "14px" }}>
            Your business financial intelligence is ready. {summary ? `${summary.transaction_count} transactions analyzed.` : ""}
          </p>
        </div>
        <button
          onClick={loadDemoData}
          disabled={demoLoading || loading}
          className="btn btn-ghost btn-sm flex-shrink-0"
        >
          {demoLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" style={{ color: "var(--warning)" }} />}
          {demoLoading ? "Seeding..." : "Load Demo Data"}
        </button>
      </div>

      {!business ? (
        /* Empty State */
        <div className="card p-12 text-center flex flex-col items-center animate-fade-in-up">
          <div className="empty-state-icon mb-4 animate-float">
            <Building2 className="w-8 h-8" />
          </div>
          <h2 className="text-h3 mb-2">No Business Profile Found</h2>
          <p className="mb-8 max-w-md" style={{ color: "var(--text-muted)", fontSize: "14px" }}>
            Complete business onboarding to start using the financial intelligence platform and unlock your Trust Score, loan recommendations, and AI coaching.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link to="/onboarding" className="btn btn-primary">
              Complete Onboarding
              <ArrowRight className="w-4 h-4" />
            </Link>
            <button onClick={loadDemoData} disabled={demoLoading} className="btn btn-secondary">
              {demoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" style={{ color: "var(--warning)" }} />}
              Quick Start with Demo Data
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* KPI Row — Top 4 metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Avg Monthly Revenue"
              value={summary ? formatCurrency(summary.monthly_revenue) : "₹—"}
              icon={TrendingUp}
              delay={0}
              trendDirection="up"
              trend="Consistent"
              accentColor="var(--success)"
            />
            <MetricCard
              title="Avg Monthly Expenses"
              value={summary ? formatCurrency(summary.monthly_expenses) : "₹—"}
              icon={TrendingDown}
              delay={100}
              accentColor="var(--warning)"
            />
            <MetricCard
              title="Net Cash Flow"
              value={summary ? formatCurrency(summary.net_cash_flow) : "₹—"}
              icon={IndianRupee}
              delay={200}
              trendDirection={isPositiveCashFlow ? "up" : "down"}
              trend={isPositiveCashFlow ? "Positive" : "Negative"}
              accentColor={isPositiveCashFlow ? "var(--brand-700)" : "var(--danger)"}
            />
            {/* Fraud Risk Card */}
            <div className="card p-5 animate-fade-in-up" style={{ animationDelay: "300ms" }}>
              <div className="flex items-start justify-between mb-3">
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)", letterSpacing: "0.05em" }}>
                  Fraud Risk
                </p>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{
                    background: friskLevel === "HIGH" ? "var(--danger-soft)" : friskLevel === "MEDIUM" ? "var(--warning-soft)" : "var(--success-soft)",
                    border: `1px solid ${friskLevel === "HIGH" ? "rgba(217,101,89,0.2)" : friskLevel === "MEDIUM" ? "rgba(216,155,34,0.2)" : "rgba(22,156,115,0.2)"}`,
                  }}>
                  <ShieldAlert className="w-4 h-4"
                    style={{ color: friskLevel === "HIGH" ? "var(--danger)" : friskLevel === "MEDIUM" ? "var(--warning)" : "var(--success)" }} />
                </div>
              </div>
              {fraudSummary ? (
                <>
                  <RiskBadge level={friskLevel as "LOW" | "MEDIUM" | "HIGH"} />
                  <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
                    {fraudSummary.open_alerts} open alert{fraudSummary.open_alerts !== 1 ? "s" : ""}
                  </p>
                </>
              ) : (
                <p className="text-sm mt-2" style={{ color: "var(--text-muted)" }}>No data yet</p>
              )}
            </div>
          </div>

          {/* Main Grid: Trust Score + Loan Recommendation | Feature Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Trust Score + Loan */}
            <div className="flex flex-col gap-5">
              <TrustScoreCard
                score={creditProfile?.trust_score || 0}
                delay={400}
                positiveFactors={creditProfile?.positive_factors}
                negativeFactors={creditProfile?.negative_factors}
                showFactors={true}
              />

              {/* Prototype Loan Recommendation */}
              {loanAssessment && (
                <div className="card p-5 animate-fade-in-up delay-500" style={{ borderTop: "3px solid var(--brand-700)" }}>
                  <div className="flex items-center gap-2 mb-1">
                    <Activity className="w-4 h-4" style={{ color: "var(--brand-700)" }} />
                    <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)", letterSpacing: "0.04em" }}>
                      Prototype Loan Recommendation
                    </span>
                  </div>
                  <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>Based on Trust Score & Cash Flow</p>

                  <p className="text-financial mb-1" style={{ color: "var(--brand-700)", fontSize: "20px", fontWeight: 700 }}>
                    ₹{loanAssessment.recommended_min_amount.toLocaleString("en-IN")} –{" "}
                    ₹{loanAssessment.recommended_max_amount.toLocaleString("en-IN")}
                  </p>

                  <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>
                    Estimated EMI:{" "}
                    <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
                      ₹{loanAssessment.estimated_emi.toLocaleString("en-IN")}/month
                    </span>
                  </p>

                  {/* Supporting factors */}
                  {loanAssessment.supporting_factors?.slice(0, 2).map((f, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-xs mb-1" style={{ color: "var(--success-text)" }}>
                      <CheckCircle2 size={12} style={{ color: "var(--success)", flexShrink: 0 }} />
                      <span>{f}</span>
                    </div>
                  ))}
                  {loanAssessment.caution_factors?.slice(0, 1).map((f, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-xs mb-1" style={{ color: "var(--warning-text)" }}>
                      <AlertCircle size={12} style={{ color: "var(--warning)", flexShrink: 0 }} />
                      <span>{f}</span>
                    </div>
                  ))}

                  <div className="flex items-center gap-2 mt-4">
                    <Link to="/loan" className="btn btn-primary btn-sm flex-1" style={{ justifyContent: "center" }}>
                      Simulate Loan
                    </Link>
                    <RiskBadge level={loanAssessment.risk_level} />
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Feature Cards Grid */}
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  to: "/analytics",
                  icon: TrendingUp,
                  color: "var(--brand-700)",
                  bg: "var(--brand-50)",
                  title: "Financial Analytics",
                  desc: "Cash flow trends, expense breakdowns, and revenue consistency analysis.",
                  tag: "FT-05",
                },
                {
                  to: "/schemes",
                  icon: Landmark,
                  color: "var(--success)",
                  bg: "var(--success-soft)",
                  title: "Government Schemes",
                  desc: "Discover and match with MSME subsidies and government loan schemes.",
                  tag: "FT-04",
                },
                {
                  to: "/fraud-alerts",
                  icon: ShieldAlert,
                  color: "var(--danger)",
                  bg: "var(--danger-soft)",
                  title: "Fraud & Risk Intelligence",
                  desc: "Real-time fraud detection and transaction anomaly analysis.",
                  tag: "FT-02",
                },
                {
                  to: "/financial-coach",
                  icon: Bot,
                  color: "var(--ai)",
                  bg: "var(--ai-soft)",
                  title: "AI Financial Coach",
                  desc: "Personalized guidance in Hindi/English to improve your trust score.",
                  tag: "FT-01",
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="card card-interactive p-5 group animate-fade-in-up"
                    style={{ animationDelay: "400ms" }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                        style={{ background: item.bg, border: `1px solid ${item.color}20` }}>
                        <Icon className="w-5 h-5" style={{ color: item.color }} />
                      </div>
                      <span className="badge badge-muted text-[10px]">{item.tag}</span>
                    </div>
                    <h3 className="text-sm font-bold mb-1.5" style={{ color: "var(--text-primary)" }}>{item.title}</h3>
                    <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>{item.desc}</p>
                    <div
                      className="flex items-center gap-1 mt-4 text-xs font-semibold transition-all group-hover:translate-x-1"
                      style={{ color: item.color }}
                    >
                      Explore <ArrowRight className="w-3 h-3" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Disclaimer */}
          <p className="text-xs text-center pb-2" style={{ color: "var(--text-muted)" }}>
            FinBridge is a prototype financial intelligence platform. Scores and loan recommendations are indicative and not a guarantee of approval.
          </p>
        </div>
      )}
    </DashboardLayout>
  );
}
