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
  AlertTriangle,
  Play,
  Filter,
  Bot,
  RefreshCw,
  Clock,
  ArrowRight,
  X,
  CheckCircle2,
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
  const [explanation, setExplanation] = useState<{
    explanation: string;
    recommendation: string;
  } | null>(null);
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
        getFraudAlerts(token, filterLevel === "ALL" ? undefined : filterLevel, 50, 0).catch(() => ({ alerts: [], total: 0, limit: 50, offset: 0 })),
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
      setMsg(`Analysis complete: ${res.analyzed ?? 0} transactions evaluated through 12-vector fraud heuristic.`);
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
        {
          amount: alert.transaction?.amount ?? 0,
          risk_level: alert.risk_level,
          detected_reasons: reasons,
        },
        token
      );
      setExplanation(res);
    } catch (err: any) {
      setExplanation({
        explanation: "Automated analysis indicates unusual transaction velocity or pattern matching standard anomaly thresholds.",
        recommendation: "Request corresponding vendor invoices and statutory tax receipts to reconcile.",
      });
    } finally {
      setExplaining(false);
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
              <ShieldAlert className="text-rose-400" size={26} />
              AI Fraud & Anomaly Detection Surveillance
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Multi-layer heuristic rules and behavioral anomaly models monitoring ledger integrity.
            </p>
          </div>

          <button
            onClick={handleRunAnalysis}
            disabled={runningAnalysis}
            className="btn btn-primary text-xs flex items-center gap-2"
          >
            <Play size={14} className={runningAnalysis ? "animate-spin text-white" : "text-white fill-white"} />
            {runningAnalysis ? "Scanning Transaction Vectors..." : "Run AI Fraud Detection"}
          </button>
        </div>

        {msg && (
          <div className="p-4 rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-300 text-xs flex items-center justify-between">
            <span>{msg}</span>
            <button onClick={() => setMsg(null)} className="text-blue-400 hover:text-white">
              <X size={14} />
            </button>
          </div>
        )}

        {/* Risk summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card p-4 border border-white/5">
            <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Total Scanned</p>
            <p className="text-2xl font-mono font-bold text-white mt-1">
              {summary?.analyzed_transactions ?? 0}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">Verified ledger records</p>
          </div>

          <div className="glass-card p-4 border border-emerald-500/20 bg-emerald-500/[0.03]">
            <p className="text-[10px] font-mono uppercase tracking-wider text-emerald-400">Low Risk Clearance</p>
            <p className="text-2xl font-mono font-bold text-emerald-300 mt-1">
              {summary?.low_risk?.count ?? 0}
            </p>
            <p className="text-[11px] text-emerald-400/80 mt-0.5">
              {summary?.low_risk?.percentage?.toFixed(1) ?? "100"}% of volume
            </p>
          </div>

          <div className="glass-card p-4 border border-amber-500/20 bg-amber-500/[0.03]">
            <p className="text-[10px] font-mono uppercase tracking-wider text-amber-400">Medium Scrutiny</p>
            <p className="text-2xl font-mono font-bold text-amber-300 mt-1">
              {summary?.medium_risk?.count ?? 0}
            </p>
            <p className="text-[11px] text-amber-400/80 mt-0.5">
              {summary?.medium_risk?.percentage?.toFixed(1) ?? "0"}% of volume
            </p>
          </div>

          <div className="glass-card p-4 border border-rose-500/20 bg-rose-500/[0.03]">
            <p className="text-[10px] font-mono uppercase tracking-wider text-rose-400">High Risk Anomalies</p>
            <p className="text-2xl font-mono font-bold text-rose-300 mt-1">
              {summary?.high_risk?.count ?? 0}
            </p>
            <p className="text-[11px] text-rose-400/80 mt-0.5">
              {summary?.open_alerts ?? 0} active flags
            </p>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Filter size={14} /> Filter Risk:
            </span>
            {["ALL", "HIGH", "MEDIUM", "LOW"].map((level) => (
              <button
                key={level}
                onClick={() => setFilterLevel(level)}
                className={`px-3 py-1 rounded-md text-xs font-mono font-medium transition-all ${
                  filterLevel === level
                    ? "bg-blue-600 text-white"
                    : "bg-slate-900 border border-white/5 text-slate-400 hover:text-white"
                }`}
              >
                {level}
              </button>
            ))}
          </div>

          <button onClick={loadData} className="p-2 rounded-lg bg-slate-900 border border-white/5 text-slate-400 hover:text-white">
            <RefreshCw size={14} className={loading ? "animate-spin text-blue-400" : ""} />
          </button>
        </div>

        {/* Alerts List */}
        <div className="space-y-3">
          {alerts.length > 0 ? (
            alerts.map((al) => (
              <div
                key={al.id}
                className="glass-card p-4 border border-white/5 hover:border-white/10 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2.5">
                    <RiskBadge level={al.risk_level} />
                    <span className="text-xs font-mono text-slate-400">
                      Score: <strong className="text-white">{al.risk_score}</strong>/100
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {new Date(al.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-sm font-semibold text-white">
                    {al.transaction ? (
                      <>
                        ₹{al.transaction.amount.toLocaleString()} — {al.transaction.merchant || al.transaction.category}
                      </>
                    ) : (
                      `Suspicious Pattern Flag #${al.id.slice(0, 8)}`
                    )}
                  </p>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {al.detected_reasons?.map((r, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded bg-slate-900 border border-white/5 text-[11px] text-slate-300"
                      >
                        {r.rule_name || r.reason}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => handleExplain(al)}
                  className="btn btn-secondary text-xs flex items-center gap-1.5 self-start md:self-center"
                >
                  <Bot size={14} className="text-blue-400" />
                  <span>Explain with AI</span>
                  <ArrowRight size={13} className="text-slate-500" />
                </button>
              </div>
            ))
          ) : (
            <div className="glass-card p-12 border border-white/5 text-center text-slate-500 font-mono text-xs">
              {loading
                ? "Checking anomaly database..."
                : "No fraud or anomaly flags registered for this risk level."}
            </div>
          )}
        </div>

        {/* AI Explanation Drawer / Modal */}
        {selectedAlert && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="glass-card max-w-lg w-full p-6 border border-white/10 space-y-4 animate-scaleUp">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bot className="text-blue-400" size={20} />
                  <h3 className="text-base font-semibold text-white">AI Fraud Diagnostic</h3>
                </div>
                <button
                  onClick={() => setSelectedAlert(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/80 border border-white/5 text-xs space-y-1">
                <div className="flex justify-between font-mono text-slate-400">
                  <span>Alert ID: {selectedAlert.id.slice(0, 8)}</span>
                  <span className="font-bold text-white">{selectedAlert.risk_level} RISK</span>
                </div>
                {selectedAlert.transaction && (
                  <p className="text-slate-200">
                    Amount: <strong className="text-emerald-400">₹{selectedAlert.transaction.amount.toLocaleString()}</strong> ({selectedAlert.transaction.category})
                  </p>
                )}
              </div>

              {explaining ? (
                <div className="py-8 flex flex-col items-center justify-center gap-3 text-slate-400 text-xs font-mono">
                  <div className="w-8 h-8 rounded-full border-2 border-blue-500/20 border-t-blue-500 animate-spin" />
                  Generating contextual explainability report...
                </div>
              ) : explanation ? (
                <div className="space-y-3 text-xs">
                  <div className="p-3.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-200 space-y-1">
                    <p className="font-bold text-blue-300">Root Cause Analysis:</p>
                    <p className="leading-relaxed">{explanation.explanation}</p>
                  </div>
                  <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 space-y-1">
                    <p className="font-bold text-emerald-300">Remediation Recommendation:</p>
                    <p className="leading-relaxed">{explanation.recommendation}</p>
                  </div>
                </div>
              ) : null}

              <button
                onClick={() => setSelectedAlert(null)}
                className="w-full btn btn-primary text-xs py-2 mt-2"
              >
                Acknowledge & Close
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
