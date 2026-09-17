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
  IndianRupee,
  AlertTriangle,
  CheckCircle2,
  FileCheck,
  ArrowRight,
  Sparkles,
  Info,
  Loader2,
  TrendingUp,
  AlertCircle,
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
      const res = await assessLoan({ requested_amount: amount, tenure_months: tenure, purpose }, token);
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
      const res = await applyLoan({ requested_amount: requestedAmount, tenure_months: tenureMonths, purpose }, token);
      setSuccessMsg(`Application #${res.id.slice(0, 8)} registered successfully. Status: ${res.status}`);
      await fetchApplications();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit application.");
    } finally {
      setApplying(false);
    }
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val);

  const burdenColor = (pct: number) => {
    if (pct > 40) return "var(--danger)";
    if (pct > 25) return "var(--warning)";
    return "var(--success)";
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 page-enter">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="badge badge-brand">FT-03</span>
              <span className="badge badge-muted">Core Product</span>
            </div>
            <h1 className="text-h1 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "var(--brand-50)" }}>
                <Briefcase size={18} style={{ color: "var(--brand-700)" }} />
              </div>
              MSME Micro-Loan
            </h1>
            <p className="mt-1" style={{ color: "var(--text-muted)", fontSize: "14px" }}>
              Collateral-free credit lines underwritten by live cash-flow and trust telemetry.
            </p>
          </div>
          <Link
            to="/loan/simulator"
            className="btn btn-secondary btn-sm flex items-center gap-2 self-start"
          >
            <Sliders size={14} style={{ color: "var(--brand-700)" }} />
            EMI Simulator
          </Link>
        </div>

        {/* Success/Error Messages */}
        {successMsg && (
          <div className="alert alert-success">
            <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
            <span className="text-sm">{successMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="alert alert-danger">
            <AlertTriangle size={16} style={{ flexShrink: 0 }} />
            <span className="text-sm">{errorMsg}</span>
          </div>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Loan Configuration Panel */}
          <div className="lg:col-span-5 card p-6 space-y-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--brand-50)" }}>
                <IndianRupee size={16} style={{ color: "var(--brand-700)" }} />
              </div>
              <h3 className="font-semibold" style={{ color: "var(--brand-900)", fontSize: "15px" }}>Loan Configuration</h3>
            </div>

            <form onSubmit={handleApply} className="space-y-5">
              {/* Amount Slider */}
              <div>
                <div className="flex justify-between mb-2">
                  <label className="mb-0 text-xs" style={{ color: "var(--text-secondary)", textTransform: "none", letterSpacing: 0 }}>
                    Requested Amount
                  </label>
                  <span className="text-sm font-bold text-financial" style={{ color: "var(--brand-700)" }}>
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
                />
                <div className="flex justify-between mt-1">
                  <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>₹25,000</span>
                  <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>₹15,00,000</span>
                </div>
              </div>

              {/* Tenure Pills */}
              <div>
                <div className="flex justify-between mb-2">
                  <label className="mb-0 text-xs" style={{ color: "var(--text-secondary)", textTransform: "none", letterSpacing: 0 }}>
                    Tenure
                  </label>
                  <span className="text-sm font-bold" style={{ color: "var(--brand-700)" }}>{tenureMonths} months</span>
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
                      className="py-2 rounded-lg text-sm font-medium transition-all"
                      style={{
                        background: tenureMonths === m ? "var(--brand-700)" : "var(--background)",
                        color: tenureMonths === m ? "#fff" : "var(--text-secondary)",
                        border: `1.5px solid ${tenureMonths === m ? "var(--brand-700)" : "var(--border)"}`,
                        fontSize: "13px",
                      }}
                    >
                      {m}M
                    </button>
                  ))}
                </div>
              </div>

              {/* Purpose */}
              <div>
                <label>Purpose</label>
                <select
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="input"
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
                className="btn btn-primary w-full"
                style={{ justifyContent: "center" }}
              >
                {applying ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Registering Application...</>
                ) : (
                  <><FileCheck size={16} /> Submit Loan Application</>
                )}
              </button>
            </form>
          </div>

          {/* Live Assessment Panel */}
          <div className="lg:col-span-7 card p-6 flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--brand-50)" }}>
                    <Sparkles size={16} style={{ color: "var(--brand-700)" }} />
                  </div>
                  <h3 className="font-semibold" style={{ color: "var(--brand-900)", fontSize: "15px" }}>
                    Prototype Loan Assessment
                  </h3>
                </div>
                {assessment && <RiskBadge level={assessment.risk_level} />}
              </div>
              <p className="text-xs mb-5" style={{ color: "var(--text-muted)" }}>
                Real-time evaluation based on your banking inflows. {assessing && "Recalculating..."}
              </p>

              {/* Recommended Range — Hero */}
              {assessment && (
                <div className="card-hero p-5 mb-5 text-center">
                  <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)", letterSpacing: "0.06em" }}>
                    Recommended Range
                  </p>
                  <p className="text-financial" style={{ fontSize: "26px", color: "var(--brand-700)", letterSpacing: "-0.02em" }}>
                    {formatCurrency(assessment.recommended_min_amount)} – {formatCurrency(assessment.recommended_max_amount)}
                  </p>
                </div>
              )}

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  {
                    label: "Estimated EMI",
                    value: assessment ? `${formatCurrency(assessment.estimated_emi)}/mo` : "₹—",
                    color: "var(--text-primary)",
                  },
                  {
                    label: "Annual Rate",
                    value: assessment ? `${assessment.annual_interest_rate}%` : "—",
                    color: "var(--brand-700)",
                  },
                  {
                    label: "Total Interest",
                    value: assessment ? formatCurrency(assessment.estimated_interest) : "₹—",
                    color: "var(--text-secondary)",
                  },
                  {
                    label: "Debt Burden",
                    value: assessment?.repayment_burden_pct ? `${assessment.repayment_burden_pct.toFixed(1)}%` : "—",
                    color: assessment ? burdenColor(assessment.repayment_burden_pct) : "var(--text-muted)",
                  },
                  {
                    label: "Projected Surplus",
                    value: assessment ? formatCurrency(assessment.post_loan_projected_surplus) : "₹—",
                    color: "var(--success)",
                  },
                  {
                    label: "Total Repayment",
                    value: assessment ? formatCurrency(assessment.total_repayment) : "₹—",
                    color: "var(--text-secondary)",
                  },
                ].map((m) => (
                  <div key={m.label} className="sim-tile">
                    <p className="text-caption mb-1">{m.label}</p>
                    <p className="text-financial font-bold" style={{ color: m.color, fontSize: "15px" }}>{m.value}</p>
                  </div>
                ))}
              </div>

              {/* Supporting/Caution Factors */}
              {assessment && (
                <div className="mt-4 space-y-2">
                  {assessment.supporting_factors?.slice(0, 2).map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs" style={{ color: "var(--success-text)" }}>
                      <CheckCircle2 size={12} style={{ color: "var(--success)", flexShrink: 0 }} />
                      {f}
                    </div>
                  ))}
                  {assessment.caution_factors?.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs" style={{ color: "var(--warning-text)" }}>
                      <AlertCircle size={12} style={{ color: "var(--warning)", flexShrink: 0 }} />
                      {f}
                    </div>
                  ))}
                </div>
              )}

              {assessment?.prototype_recommendation && (
                <div className="alert alert-info mt-4 text-xs">
                  <TrendingUp size={14} style={{ flexShrink: 0 }} />
                  <p>{assessment.prototype_recommendation}</p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs" style={{ color: "var(--text-muted)", borderTop: "1px solid var(--border)", paddingTop: "0.75rem" }}>
              <Info size={13} style={{ flexShrink: 0 }} />
              This is a prototype recommendation. Indicative limits finalize upon lender verification.
            </div>
          </div>
        </div>

        {/* Applications Table */}
        <div className="card overflow-hidden">
          <div className="p-5 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border)" }}>
            <h3 className="font-semibold" style={{ color: "var(--brand-900)", fontSize: "15px" }}>
              Your Loan Applications
            </h3>
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>{applications.length} submitted</span>
          </div>
          <div className="table-wrapper" style={{ border: "none", borderRadius: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>Application ID</th>
                  <th>Requested</th>
                  <th>Tenure</th>
                  <th>Purpose</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {applications.length > 0 ? (
                  applications.map((app) => (
                    <tr key={app.id}>
                      <td className="font-mono text-xs" style={{ color: "var(--brand-700)", fontWeight: 600 }}>
                        #{app.id.slice(0, 8)}
                      </td>
                      <td className="text-financial font-bold" style={{ color: "var(--text-primary)" }}>
                        {formatCurrency(app.requested_amount)}
                      </td>
                      <td style={{ color: "var(--text-secondary)" }}>{app.tenure_months} months</td>
                      <td className="max-w-xs truncate" style={{ color: "var(--text-secondary)" }}>{app.purpose}</td>
                      <td>
                        <span className="badge badge-brand">{app.status}</span>
                      </td>
                      <td style={{ color: "var(--text-muted)" }}>
                        {new Date(app.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-8" style={{ color: "var(--text-muted)" }}>
                      {loadingApps ? "Loading applications..." : "No applications yet. Configure and apply above."}
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
