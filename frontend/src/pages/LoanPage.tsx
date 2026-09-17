import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/lib/auth-context";
import {
  assessLoan,
  applyLoan,
  getLoanApplications,
  type LoanAssessmentResponse,
  type LoanApplicationResponse,
} from "@/lib/api";
import {
  Briefcase,
  Sliders,
  DollarSign,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  FileCheck,
  ArrowRight,
  Sparkles,
  Info,
  Clock,
} from "lucide-react";
import { RiskBadge } from "@/components/ui/RiskBadge";

export default function LoanPage() {
  const { getIdToken } = useAuth();
  const [requestedAmount, setRequestedAmount] = useState<number>(200000);
  const [tenureMonths, setTenureMonths] = useState<number>(12);
  const [purpose, setPurpose] = useState<string>("Working Capital Expansion");
  const [assessment, setAssessment] = useState<LoanAssessmentResponse | null>(null);
  const [assessing, setAssessing] = useState(false);
  const [applying, setApplying] = useState(false);
  const [applications, setApplications] = useState<LoanApplicationResponse[]>([]);
  const [loadingApps, setLoadingApps] = useState(true);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const triggerAssessment = async (amount = requestedAmount, tenure = tenureMonths) => {
    setAssessing(true);
    setErrorMsg(null);
    try {
      const token = await getIdToken();
      if (!token) return;
      const res = await assessLoan(
        {
          requested_amount: amount,
          tenure_months: tenure,
          purpose,
        },
        token
      );
      setAssessment(res);
    } catch (err: any) {
      console.error(err);
    } finally {
      setAssessing(false);
    }
  };

  const fetchApplications = async () => {
    setLoadingApps(true);
    try {
      const token = await getIdToken();
      if (!token) return;
      const apps = await getLoanApplications(token);
      setApplications(apps || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingApps(false);
    }
  };

  useEffect(() => {
    triggerAssessment(requestedAmount, tenureMonths);
    fetchApplications();
  }, []);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setApplying(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const token = await getIdToken();
      if (!token) throw new Error("Auth required");

      const res = await applyLoan(
        {
          requested_amount: requestedAmount,
          tenure_months: tenureMonths,
          purpose,
        },
        token
      );
      setSuccessMsg(`Application #${res.id.slice(0, 8)} successfully registered! Status: ${res.status}`);
      await fetchApplications();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit loan application.");
    } finally {
      setApplying(false);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fadeIn">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
              <Briefcase className="text-blue-400" size={26} />
              MSME Micro-Loan Underwriting & Sanctioning
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Collateral-free credit lines underwritten by live cash-flow velocity and trust telemetry.
            </p>
          </div>

          <Link
            to="/loan/simulator"
            className="btn btn-secondary text-xs flex items-center gap-2 self-start sm:self-auto"
          >
            <Sliders size={14} className="text-blue-400" />
            Interactive EMI Simulator
          </Link>
        </div>

        {successMsg && (
          <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-xs flex items-center gap-2.5">
            <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs flex items-center gap-2.5">
            <AlertTriangle size={16} className="text-rose-400 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Assessment Calculator & Application Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Configure loan parameters */}
          <div className="lg:col-span-5 glass-card p-6 border border-white/5 space-y-5">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <DollarSign className="text-blue-400" size={18} />
              Loan Request Configuration
            </h3>

            <form onSubmit={handleApply} className="space-y-4">
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-2">
                  <span>Requested Principal</span>
                  <span className="font-mono font-bold text-white text-sm">
                    {formatCurrency(requestedAmount)}
                  </span>
                </div>
                <input
                  type="range"
                  min="25000"
                  max="1500000"
                  step="25000"
                  value={requestedAmount}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setRequestedAmount(val);
                    triggerAssessment(val, tenureMonths);
                  }}
                  className="w-full accent-blue-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
                  <span>₹25,000</span>
                  <span>₹15,00,000</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-2">
                  <span>Tenure Duration</span>
                  <span className="font-mono font-bold text-white text-sm">
                    {tenureMonths} Months
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[3, 6, 12, 24].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        setTenureMonths(m);
                        triggerAssessment(requestedAmount, m);
                      }}
                      className={`py-2 rounded-lg text-xs font-mono font-medium transition-all ${
                        tenureMonths === m
                          ? "bg-blue-600 text-white font-bold"
                          : "bg-slate-900/80 border border-white/5 text-slate-400 hover:text-white"
                      }`}
                    >
                      {m}M
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Business Deployment Purpose
                </label>
                <select
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full bg-slate-900/80 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Working Capital Expansion">Working Capital Expansion</option>
                  <option value="Raw Material Procurement">Raw Material Procurement</option>
                  <option value="Equipment & Tooling Purchase">Equipment & Tooling Purchase</option>
                  <option value="Inventory Stocking for Festival Surge">Inventory Stocking for Festival Surge</option>
                  <option value="Store Renovation & Commercial Lease">Store Renovation & Commercial Lease</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={applying || assessing}
                className="w-full btn btn-primary text-xs py-3 flex items-center justify-center gap-2 mt-4"
              >
                <FileCheck size={16} />
                {applying ? "Registering Application..." : "Submit Loan Application"}
              </button>
            </form>
          </div>

          {/* Underwriting Live Assessment Result */}
          <div className="lg:col-span-7 glass-card p-6 border border-white/5 flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <Sparkles className="text-amber-400" size={18} />
                  Instant Underwriting Pre-Screening
                </h3>
                {assessment && <RiskBadge level={assessment.risk_level} />}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Real-time evaluation based on your active verified banking inflows.
              </p>

              {/* Numbers Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-5">
                <div className="p-3 rounded-lg bg-slate-900/60 border border-white/5">
                  <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Estimated EMI</p>
                  <p className="text-lg font-mono font-bold text-white mt-1">
                    {assessment ? formatCurrency(assessment.estimated_emi) : "₹--"}
                    <span className="text-[10px] font-normal text-slate-500">/mo</span>
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-slate-900/60 border border-white/5">
                  <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Annual APR</p>
                  <p className="text-lg font-mono font-bold text-blue-400 mt-1">
                    {assessment?.annual_interest_rate ?? "14.5"}%
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-slate-900/60 border border-white/5">
                  <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Total Interest</p>
                  <p className="text-lg font-mono font-bold text-slate-300 mt-1">
                    {assessment ? formatCurrency(assessment.estimated_interest) : "₹--"}
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-slate-900/60 border border-white/5">
                  <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Debt Burden %</p>
                  <p className={`text-lg font-mono font-bold mt-1 ${
                    (assessment?.repayment_burden_pct ?? 0) > 30 ? "text-amber-400" : "text-emerald-400"
                  }`}>
                    {assessment?.repayment_burden_pct ? `${assessment.repayment_burden_pct.toFixed(1)}%` : "--"}
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-slate-900/60 border border-white/5">
                  <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Projected Surplus</p>
                  <p className="text-lg font-mono font-bold text-emerald-400 mt-1">
                    {assessment ? formatCurrency(assessment.post_loan_projected_surplus) : "₹--"}
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-slate-900/60 border border-white/5">
                  <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Eligible Band</p>
                  <p className="text-xs font-mono font-bold text-purple-300 mt-2">
                    {assessment ? `${formatCurrency(assessment.recommended_min_amount)} – ${formatCurrency(assessment.recommended_max_amount)}` : "Computing..."}
                  </p>
                </div>
              </div>

              {/* Recommendation Note */}
              {assessment && (
                <div className="mt-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-200">
                  <p className="font-semibold text-blue-300">Underwriter Assessment Summary:</p>
                  <p className="mt-0.5 leading-relaxed">{assessment.prototype_recommendation}</p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-white/5 text-[11px] text-slate-500 flex items-center gap-1.5">
              <Info size={13} />
              Pre-approved limits are indicative and finalize upon automated disbursement consent.
            </div>
          </div>
        </div>

        {/* Existing Applications Ledger */}
        <div className="glass-card border border-white/5 overflow-hidden">
          <div className="p-5 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-base font-semibold text-white">Your Loan Applications & Sanction Letters</h3>
            <span className="text-xs text-slate-400 font-mono">{applications.length} submitted</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 border-b border-white/5 text-slate-400 font-mono uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Application ID</th>
                  <th className="py-3 px-4">Requested</th>
                  <th className="py-3 px-4">Tenure</th>
                  <th className="py-3 px-4">Purpose</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Offers Available</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {applications.length > 0 ? (
                  applications.map((app) => (
                    <tr key={app.id} className="hover:bg-white/[0.02]">
                      <td className="py-3 px-4 font-mono text-blue-400">#{app.id.slice(0, 8)}</td>
                      <td className="py-3 px-4 font-mono font-bold text-white">
                        {formatCurrency(app.requested_amount)}
                      </td>
                      <td className="py-3 px-4 font-mono">{app.tenure_months} Months</td>
                      <td className="py-3 px-4 text-slate-300 max-w-xs truncate">{app.purpose}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          {app.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-500">
                        {new Date(app.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                        {app.offers?.length || 1} Sanctioned
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500 font-mono">
                      {loadingApps ? "Loading loan records..." : "No loan applications yet. Configure and apply above."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
