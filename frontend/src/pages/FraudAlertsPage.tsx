import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/lib/auth-context";
import {
  getFraudSummary,
  getFraudAlerts,
  runFraudAnalysis,
  explainFraudAlert,
  type FraudSummaryResponse,
  type FraudAlertResponse,
} from "@/lib/api";
import {
  ShieldAlert,
  ShieldCheck,
  Play,
  Filter,
  Bot,
  RefreshCw,
  X,
  AlertTriangle,
} from "lucide-react";
import { RiskBadge } from "@/components/ui/RiskBadge";

export default function FraudAlertsPage() {
  const { getIdToken } = useAuth();
  const [summary, setSummary] = useState<FraudSummaryResponse | null>(null);
  const [alerts, setAlerts] = useState<FraudAlertResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningAnalysis, setRunningAnalysis] = useState(false);
  const [filterLevel, setFilterLevel] = useState<string>("ALL");
  const [selectedAlert, setSelectedAlert] = useState<FraudAlertResponse | null>(null);
  const [explanation, setExplanation] = useState<{ explanation: string; recommendation: string } | null>(null);
  const [explaining, setExplaining] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setMsg(null);
    try {
      const token = await getIdToken();
      if (!token) return;

      const [sumRes, alertRes] = await Promise.all([
        getFraudSummary(token).catch(() => null),
        getFraudAlerts(token, filterLevel === "ALL" ? undefined : filterLevel, 50, 0)
          .catch(() => ({ alerts: [], total: 0, limit: 50, offset: 0 })),
      ]);

      if (sumRes) setSummary(sumRes);
      if (alertRes) setAlerts(alertRes.alerts || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filterLevel]);

  const handleRunAnalysis = async () => {
    setRunningAnalysis(true);
    setMsg(null);
    try {
      const token = await getIdToken();
      if (!token) return;
      const res = await runFraudAnalysis(token);
      setMsg(`Analysis complete: ${res.analyzed ?? 0} transactions evaluated.`);
      await loadData();
    } catch (err: any) {
      setMsg(err.message || "Failed to complete fraud scan.");
    } finally {
      setRunningAnalysis(false);
    }
  };

  const handleExplain = async (alert: FraudAlertResponse) => {
    setSelectedAlert(alert);
    setExplanation(null);
    setExplaining(true);
    try {
      const token = await getIdToken();
      if (!token) return;
      const reasons = alert.detected_reasons?.map((r) => `${r.rule_name}: ${r.reason}`) || [];
      const res = await explainFraudAlert(
        { amount: alert.transaction?.amount ?? 0, risk_level: alert.risk_level, detected_reasons: reasons },
        token
      );
      setExplanation(res);
    } catch {
      setExplanation({
        explanation: "Automated analysis indicates unusual transaction velocity or pattern matching standard anomaly thresholds.",
        recommendation: "Request corresponding vendor invoices and statutory tax receipts to reconcile.",
      });
    } finally {
      setExplaining(false);
    }
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val);

  return (
    <DashboardLayout>
      <div className="space-y-6 page-enter">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="badge badge-danger">FT-02</span>
              <span className="badge badge-muted">Risk Intelligence</span>
            </div>
            <h1 className="text-h1 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "var(--danger-soft)" }}>
                <ShieldAlert size={18} style={{ color: "var(--danger)" }} />
              </div>
              Fraud & Risk Detection
            </h1>
            <p className="mt-1" style={{ color: "var(--text-muted)", fontSize: "14px" }}>
              Multi-layer heuristic rules monitoring your transaction ledger integrity.
            </p>
          </div>

          <button
            onClick={handleRunAnalysis}
            disabled={runningAnalysis}
            className="btn btn-primary flex items-center gap-2 self-start"
          >
            <Play size={14} className={runningAnalysis ? "animate-spin" : ""} />
            {runningAnalysis ? "Scanning..." : "Run Fraud Detection"}
          </button>
        </div>

        {/* Status message */}
        {msg && (
          <div className="alert alert-info">
            <ShieldCheck size={16} style={{ flexShrink: 0 }} />
            <span className="flex-1 text-sm">{msg}</span>
            <button onClick={() => setMsg(null)} style={{ color: "var(--info)", flexShrink: 0 }}>
              <X size={14} />
            </button>
          </div>
        )}

        {/* Risk Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card p-5">
            <p className="text-caption mb-2">Total Scanned</p>
            <p className="text-financial" style={{ fontSize: "28px", color: "var(--text-primary)" }}>
              {summary?.analyzed_transactions ?? 0}
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Verified ledger records</p>
          </div>

          <div className="card p-5" style={{ borderLeft: "4px solid var(--success)" }}>
            <p className="text-caption mb-2" style={{ color: "var(--success-text)" }}>Low Risk</p>
            <p className="text-financial" style={{ fontSize: "28px", color: "var(--success)" }}>
              {summary?.low_risk?.count ?? 0}
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--success-text)" }}>
              {summary?.low_risk?.percentage?.toFixed(1) ?? "100"}% of volume
            </p>
          </div>

          <div className="card p-5" style={{ borderLeft: "4px solid var(--warning)" }}>
            <p className="text-caption mb-2" style={{ color: "var(--warning-text)" }}>Medium Risk</p>
            <p className="text-financial" style={{ fontSize: "28px", color: "var(--warning)" }}>
              {summary?.medium_risk?.count ?? 0}
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--warning-text)" }}>
              {summary?.medium_risk?.percentage?.toFixed(1) ?? "0"}% of volume
            </p>
          </div>

          <div className="card p-5" style={{ borderLeft: "4px solid var(--danger)" }}>
            <p className="text-caption mb-2" style={{ color: "var(--danger-text)" }}>High Risk</p>
            <p className="text-financial" style={{ fontSize: "28px", color: "var(--danger)" }}>
              {summary?.high_risk?.count ?? 0}
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--danger-text)" }}>
              {summary?.open_alerts ?? 0} active flags
            </p>
          </div>
        </div>

        {/* Filter + Refresh */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs flex items-center gap-1.5" style={{ color: "var(--text-muted)" }}>
              <Filter size={13} /> Filter:
            </span>
            {["ALL", "HIGH", "MEDIUM", "LOW"].map((level) => (
              <button
                key={level}
                onClick={() => setFilterLevel(level)}
                className="btn btn-sm"
                style={{
                  background: filterLevel === level ? "var(--brand-700)" : "var(--surface)",
                  color: filterLevel === level ? "#fff" : "var(--text-secondary)",
                  border: `1px solid ${filterLevel === level ? "var(--brand-700)" : "var(--border)"}`,
                  minHeight: "30px",
                  padding: "0.3rem 0.75rem",
                  fontSize: "0.75rem",
                }}
              >
                {level}
              </button>
            ))}
          </div>
          <button
            onClick={loadData}
            className="btn btn-ghost btn-sm"
            style={{ padding: "0.4rem" }}
            aria-label="Refresh"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        {/* Alert Cards */}
        <div className="space-y-3">
          {alerts.length > 0 ? (
            alerts.map((al) => {
              const cardClass = al.risk_level === "HIGH" ? "card-fraud-high" : al.risk_level === "MEDIUM" ? "card-fraud-medium" : "card-fraud-low";
              return (
                <div key={al.id} className={`${cardClass} p-4 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-md`}>
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2.5">
                      <RiskBadge level={al.risk_level} />
                      <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                        Risk Score: <strong style={{ color: "var(--text-primary)" }}>{al.risk_score}/100</strong>
                      </span>
                      <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                        {new Date(al.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                      {al.transaction ? (
                        <>₹{al.transaction.amount.toLocaleString()} — {al.transaction.merchant || al.transaction.category}</>
                      ) : (
                        `Risk Signal #${al.id.slice(0, 8)}`
                      )}
                    </p>

                    <div className="flex flex-wrap gap-1.5">
                      {al.detected_reasons?.map((r, idx) => (
                        <span key={idx} className="badge badge-muted text-[10px] py-0.5">
                          {r.rule_name || r.reason}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => handleExplain(al)}
                    className="btn btn-secondary btn-sm flex items-center gap-1.5 self-start md:self-center flex-shrink-0"
                  >
                    <Bot size={13} style={{ color: "var(--ai)" }} />
                    AI Explanation
                  </button>
                </div>
              );
            })
          ) : (
            <div className="card p-12 text-center">
              <div className="empty-state">
                <div className="empty-state-icon" style={{ background: "var(--success-soft)", border: "1px solid rgba(22,156,115,0.2)" }}>
                  <ShieldCheck style={{ color: "var(--success)" }} />
                </div>
                <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
                  {loading ? "Checking transaction database..." : "No alerts for this risk level"}
                </p>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  {!loading && "Run fraud detection to analyze your latest transactions."}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* AI Explanation Modal */}
        {selectedAlert && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(23,40,37,0.4)", backdropFilter: "blur(4px)" }}>
            <div className="card max-w-lg w-full p-6 space-y-4 animate-scale-up" style={{ boxShadow: "var(--shadow-lg)" }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--ai-soft)" }}>
                    <Bot size={16} style={{ color: "var(--ai)" }} />
                  </div>
                  <h3 className="font-semibold" style={{ color: "var(--brand-900)", fontSize: "15px" }}>AI Fraud Diagnostic</h3>
                </div>
                <button
                  onClick={() => setSelectedAlert(null)}
                  className="p-1.5 rounded-lg transition-colors hover:bg-gray-100"
                  style={{ color: "var(--text-muted)" }}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Alert info */}
              <div className="p-3 rounded-xl" style={{ background: "var(--background)", border: "1px solid var(--border)" }}>
                <div className="flex justify-between text-xs mb-1">
                  <span style={{ color: "var(--text-muted)" }}>Alert #{selectedAlert.id.slice(0, 8)}</span>
                  <RiskBadge level={selectedAlert.risk_level} />
                </div>
                {selectedAlert.transaction && (
                  <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                    Amount: <span style={{ color: "var(--success)", fontWeight: 600 }}>₹{selectedAlert.transaction.amount.toLocaleString()}</span>
                    {" "}({selectedAlert.transaction.category})
                  </p>
                )}
              </div>

              {explaining ? (
                <div className="py-8 flex flex-col items-center gap-3">
                  <div className="spinner" />
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>Generating AI explanation...</p>
                </div>
              ) : explanation ? (
                <div className="space-y-3 text-sm">
                  <div className="alert alert-info">
                    <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: 2 }} />
                    <div>
                      <p className="font-semibold mb-1">Root Cause Analysis</p>
                      <p className="leading-relaxed">{explanation.explanation}</p>
                    </div>
                  </div>
                  <div className="alert alert-success">
                    <ShieldCheck size={14} style={{ flexShrink: 0, marginTop: 2 }} />
                    <div>
                      <p className="font-semibold mb-1">Recommendation</p>
                      <p className="leading-relaxed">{explanation.recommendation}</p>
                    </div>
                  </div>
                </div>
              ) : null}

              <button onClick={() => setSelectedAlert(null)} className="btn btn-primary w-full">
                Acknowledge & Close
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
