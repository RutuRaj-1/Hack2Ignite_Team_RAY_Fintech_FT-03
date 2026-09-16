"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { 
  getBusiness, 
  getAnalyticsSummary, 
  getFraudSummary, 
  getCreditProfile, 
  assessLoan, 
  seedDemoData,
  type BusinessResponse,
  type FinancialSummary,
  type FraudSummaryResponse,
  type CreditProfileResponse,
  type LoanAssessmentResponse,
  ApiError 
} from "@/lib/api";
import { DashboardLayout } from "@/components/DashboardLayout";
import { MetricCard } from "@/components/ui/MetricCard";
import { TrustScoreCard } from "@/components/ui/TrustScoreCard";
import { RiskBadge } from "@/components/ui/RiskBadge";
import {
  IndianRupee,
  TrendingDown,
  TrendingUp,
  ShieldAlert,
  ArrowRight,
  Landmark,
  Bot,
  Zap,
  Loader2
} from "lucide-react";

export default function DashboardPage() {
  const { firebaseUser, authLoading, getIdToken } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [demoLoading, setDemoLoading] = useState(false);
  const [business, setBusiness] = useState<BusinessResponse | null>(null);
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [fraudSummary, setFraudSummary] = useState<FraudSummaryResponse | null>(null);
  const [creditProfile, setCreditProfile] = useState<CreditProfileResponse | null>(null);
  const [loanAssessment, setLoanAssessment] = useState<LoanAssessmentResponse | null>(null);

  const loadDashboardData = async () => {
    try {
      const idToken = await getIdToken();
      if (!idToken) return;

      const biz = await getBusiness(idToken).catch(() => null);
      setBusiness(biz);

      if (biz) {
        // Fetch remaining metrics in parallel
        const [an, fr, cr] = await Promise.all([
          getAnalyticsSummary(idToken).catch(() => null),
          getFraudSummary(idToken).catch(() => null),
          getCreditProfile(idToken).catch(() => null)
        ]);
        
        setSummary(an);
        setFraudSummary(fr);
        setCreditProfile(cr);

        // Try getting a prototype loan assessment if we have credit metrics
        if (cr && cr.trust_score > 40) {
           const loan = await assessLoan({
             requested_amount: 500000,
             tenure_months: 12,
             purpose: "Working Capital"
           }, idToken).catch(() => null);
           setLoanAssessment(loan);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && firebaseUser) {
      loadDashboardData();
    }
  }, [authLoading, firebaseUser]);

  const loadDemoData = async () => {
    setDemoLoading(true);
    try {
      const idToken = await getIdToken();
      if (!idToken) return;
      await seedDemoData(idToken);
      // Reload dashboard data
      setLoading(true);
      await loadDashboardData();
    } catch (e) {
      console.error(e);
      alert("Failed to seed demo data. See console for details.");
    } finally {
      setDemoLoading(false);
    }
  };

  if (loading) {
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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Welcome back, {business?.business_name || firebaseUser?.displayName || "User"}
          </h1>
          <p className="text-gray-400 text-sm mt-1">Here is your business financial overview.</p>
        </div>
        
        <button 
          onClick={loadDemoData}
          disabled={demoLoading || loading}
          className="btn btn-primary"
        >
          {demoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
          {demoLoading ? "Seeding..." : "Demo Mode (Auto-Seed)"}
        </button>
      </div>

      {!business ? (
        <div className="glass-card p-8 text-center flex flex-col items-center justify-center min-h-[40vh]">
          <Building2 className="w-16 h-16 text-blue-500/50 mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">No Business Profile Found</h2>
          <p className="text-gray-400 mb-6 max-w-md">
            You need to complete your business onboarding to start using the financial intelligence platform.
          </p>
          <div className="flex gap-4">
            <Link href="/onboarding" className="btn btn-primary">
              Complete Onboarding
            </Link>
            <button 
              onClick={loadDemoData}
              disabled={demoLoading}
              className="btn btn-outline border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
            >
              {demoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              {demoLoading ? "Seeding Demo Data..." : "Quick Start (Shree Digital Demo)"}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard 
              title="Avg Monthly Revenue" 
              value={summary ? `₹${parseFloat(summary.monthly_revenue).toLocaleString()}` : "₹0"}
              icon={TrendingUp}
              trend={summary ? "Consistent" : ""}
              trendDirection="up"
              delay={100}
            />
            <MetricCard 
              title="Avg Monthly Expenses" 
              value={summary ? `₹${parseFloat(summary.monthly_expenses).toLocaleString()}` : "₹0"}
              icon={TrendingDown}
              delay={200}
            />
            <MetricCard 
              title="Net Cash Flow" 
              value={summary ? `₹${parseFloat(summary.net_cash_flow).toLocaleString()}` : "₹0"}
              icon={IndianRupee}
              trendDirection={summary && parseFloat(summary.net_cash_flow) > 0 ? "up" : "down"}
              delay={300}
            />
            
            <div className="glass-card p-6 flex flex-col justify-between animate-fade-in-up delay-400">
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-medium text-gray-400">Fraud Risk Profile</span>
                <ShieldAlert className={`w-5 h-5 ${fraudSummary?.high_risk.count ? 'text-red-400' : 'text-emerald-400'}`} />
              </div>
              {fraudSummary ? (
                <>
                  <div className="text-2xl font-bold text-white mb-2">
                    {fraudSummary.high_risk.count > 0 ? "HIGH" : fraudSummary.medium_risk.count > 0 ? "MEDIUM" : "LOW"} RISK
                  </div>
                  <div className="text-xs text-gray-400">
                    {fraudSummary.open_alerts} Open Alerts
                  </div>
                </>
              ) : (
                <div className="text-sm text-gray-500 mt-2">No data available</div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 flex flex-col gap-6">
               <TrustScoreCard score={creditProfile?.trust_score || 0} delay={500} />
               
               {loanAssessment && (
                 <div className="glass-card p-6 border-blue-500/20 bg-blue-500/5">
                   <h3 className="text-lg font-bold text-white mb-2">Prototype Loan Range</h3>
                   <p className="text-sm text-gray-400 mb-4">Based on your Trust Score & Cash Flow</p>
                   
                   <div className="text-2xl font-bold text-blue-400 mb-2">
                     ₹{loanAssessment.recommended_min_amount.toLocaleString()} - ₹{loanAssessment.recommended_max_amount.toLocaleString()}
                   </div>
                   <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                     <span className="text-sm text-gray-400">Est. EMI: ₹{loanAssessment.estimated_emi.toLocaleString()}/mo</span>
                     <RiskBadge level={loanAssessment.risk_level} />
                   </div>
                   <Link href="/loan" className="btn btn-outline w-full mt-4">
                     Apply Now <ArrowRight className="w-4 h-4" />
                   </Link>
                 </div>
               )}
            </div>
            
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
               {/* Quick Actions / Recommendations */}
               <Link href="/analytics" className="glass-card p-6 hover:border-blue-500/50 transition-colors group">
                 <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                   <TrendingUp className="w-6 h-6" />
                 </div>
                 <h3 className="text-lg font-bold text-white mb-2">Financial Analytics</h3>
                 <p className="text-sm text-gray-400">View detailed cash flow trends, expense breakdowns, and revenue consistency.</p>
               </Link>

               <Link href="/schemes" className="glass-card p-6 hover:border-amber-500/50 transition-colors group">
                 <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                   <Landmark className="w-6 h-6" />
                 </div>
                 <h3 className="text-lg font-bold text-white mb-2">Govt Schemes</h3>
                 <p className="text-sm text-gray-400">Discover and match with MSME government subsidies and loan schemes.</p>
               </Link>

               <Link href="/financial-coach" className="glass-card p-6 hover:border-purple-500/50 transition-colors group md:col-span-2">
                 <div className="flex items-start gap-4">
                   <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                     <Bot className="w-6 h-6" />
                   </div>
                   <div>
                     <h3 className="text-lg font-bold text-white mb-2">AI Financial Coach</h3>
                     <p className="text-sm text-gray-400 mb-3">Get personalized insights on improving your trust score, reducing fraud risk, and optimizing cash flow based on your real data.</p>
                     <span className="text-sm font-medium text-purple-400 flex items-center gap-1">
                       Chat with Coach <ArrowRight className="w-4 h-4" />
                     </span>
                   </div>
                 </div>
               </Link>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
