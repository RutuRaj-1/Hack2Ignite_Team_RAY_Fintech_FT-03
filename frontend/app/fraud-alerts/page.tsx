"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import {
  FraudAlertResponse,
  FraudSummaryResponse,
  getFraudAlerts,
  getFraudSummary,
  runFraudAnalysis,
} from "../../lib/api";
import {
  AlertTriangle,
  CheckCircle,
  Shield,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  Activity,
  Calendar,
  AlertCircle,
  Loader2,
  Search,
} from "lucide-react";

export default function FraudAlertsPage() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();

  const [summary, setSummary] = useState<FraudSummaryResponse | null>(null);
  const [alerts, setAlerts] = useState<FraudAlertResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [filter, setFilter] = useState<string>("ALL");

  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const sumRes = await getFraudSummary(token);
      setSummary(sumRes);

      const alertRes = await getFraudAlerts(
        token,
        filter === "ALL" ? undefined : filter
      );
      setAlerts(alertRes.alerts);
    } catch (error) {
      console.error("Error fetching fraud data:", error);
    } finally {
      setLoading(false);
    }
  }, [token, filter]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    } else if (user && token) {
      fetchData();
    }
  }, [user, token, authLoading, router, fetchData]);

  const handleRunAnalysis = async () => {
    if (!token) return;
    setAnalyzing(true);
    try {
      await runFraudAnalysis(token);
      await fetchData();
    } catch (error) {
      console.error("Error running analysis:", error);
    } finally {
      setAnalyzing(false);
    }
  };

  const formatINR = (val: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);

  if (authLoading || (!user && loading)) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-900 text-white">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6 md:p-10 font-sans selection:bg-indigo-500/30">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-2">
              <Shield className="w-4 h-4" />
              <span className="text-xs font-semibold tracking-wide uppercase">
                FT-02 Engine Active
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white">
              Risk <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Intelligence</span>
            </h1>
            <p className="text-gray-400 max-w-xl text-sm md:text-base">
              Hybrid rule and anomaly detection engine. We monitor transactions to generate risk signals for the credit assessment layer.
            </p>
          </div>

          <button
            onClick={handleRunAnalysis}
            disabled={analyzing}
            className="group relative inline-flex items-center justify-center px-6 py-3 font-semibold text-white transition-all duration-200 bg-indigo-600 border border-transparent rounded-xl hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden"
          >
            <div className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-black" />
            {analyzing ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <Activity className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
            )}
            {analyzing ? "Analyzing..." : "Run Risk Analysis"}
          </button>
        </div>

        {/* Stats Row */}
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="col-span-2 md:col-span-1 p-5 rounded-2xl bg-gray-900/50 border border-gray-800 backdrop-blur-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Search className="w-12 h-12" />
              </div>
              <p className="text-sm text-gray-400 font-medium mb-1">Analyzed / Total</p>
              <div className="flex items-baseline space-x-2">
                <h3 className="text-3xl font-bold text-white">{summary.analyzed_transactions}</h3>
                <span className="text-gray-500 text-sm">/ {summary.total_transactions}</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-gray-900/50 border border-green-500/20 backdrop-blur-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-green-500">
                <ShieldCheck className="w-12 h-12" />
              </div>
              <p className="text-sm text-green-400 font-medium mb-1 flex items-center">
                <span className="w-2 h-2 rounded-full bg-green-500 mr-2 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                Low Risk
              </p>
              <div className="flex items-baseline space-x-2">
                <h3 className="text-3xl font-bold text-white">{summary.low_risk.count}</h3>
                <span className="text-green-500/70 text-sm">{summary.low_risk.percentage}%</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-gray-900/50 border border-yellow-500/20 backdrop-blur-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-yellow-500">
                <AlertTriangle className="w-12 h-12" />
              </div>
              <p className="text-sm text-yellow-400 font-medium mb-1 flex items-center">
                <span className="w-2 h-2 rounded-full bg-yellow-500 mr-2 shadow-[0_0_8px_rgba(234,179,8,0.6)]" />
                Medium Risk
              </p>
              <div className="flex items-baseline space-x-2">
                <h3 className="text-3xl font-bold text-white">{summary.medium_risk.count}</h3>
                <span className="text-yellow-500/70 text-sm">{summary.medium_risk.percentage}%</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-gray-900/50 border border-red-500/20 backdrop-blur-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-red-500">
                <ShieldAlert className="w-12 h-12" />
              </div>
              <p className="text-sm text-red-400 font-medium mb-1 flex items-center">
                <span className="w-2 h-2 rounded-full bg-red-500 mr-2 shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
                High Risk
              </p>
              <div className="flex items-baseline space-x-2">
                <h3 className="text-3xl font-bold text-white">{summary.high_risk.count}</h3>
                <span className="text-red-500/70 text-sm">{summary.high_risk.percentage}%</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-gray-900/50 border border-gray-800 backdrop-blur-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <AlertCircle className="w-12 h-12" />
              </div>
              <p className="text-sm text-gray-400 font-medium mb-1">Open Alerts</p>
              <div className="flex items-baseline space-x-2">
                <h3 className="text-3xl font-bold text-white">{summary.open_alerts}</h3>
              </div>
            </div>
          </div>
        )}

        {/* Alerts List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-gray-800 pb-4">
            <h2 className="text-xl font-semibold text-white">Detected Signals</h2>
            <div className="flex space-x-2">
              {["ALL", "HIGH", "MEDIUM", "LOW"].map((level) => (
                <button
                  key={level}
                  onClick={() => setFilter(level)}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    filter === level
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
          ) : alerts.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-gray-800 rounded-2xl bg-gray-900/20">
              <ShieldCheck className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-300">No signals found</h3>
              <p className="text-gray-500 text-sm mt-1">
                {filter === "ALL" 
                  ? "Try running an analysis to detect risk signals." 
                  : `No ${filter.toLowerCase()} risk signals found.`}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`group relative flex flex-col rounded-2xl border bg-gray-900/40 p-6 backdrop-blur-sm transition-all duration-300 hover:bg-gray-900/60 ${
                    alert.risk_level === "HIGH"
                      ? "border-red-500/30 hover:border-red-500/50 hover:shadow-[0_0_30px_rgba(239,68,68,0.1)]"
                      : alert.risk_level === "MEDIUM"
                      ? "border-yellow-500/30 hover:border-yellow-500/50 hover:shadow-[0_0_30px_rgba(234,179,8,0.1)]"
                      : "border-green-500/30 hover:border-green-500/50 hover:shadow-[0_0_30px_rgba(34,197,94,0.1)]"
                  }`}
                >
                  {/* Top Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <div className="flex items-center space-x-3 mb-1">
                        <span
                          className={`px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${
                            alert.risk_level === "HIGH"
                              ? "bg-red-500/10 text-red-400 border border-red-500/20"
                              : alert.risk_level === "MEDIUM"
                              ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                              : "bg-green-500/10 text-green-400 border border-green-500/20"
                          }`}
                        >
                          {alert.risk_level} RISK
                        </span>
                        <span className="text-sm font-medium text-gray-400 flex items-center">
                          Score: <span className="text-white ml-1 font-bold">{alert.risk_score}</span>/100
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-2 flex items-center">
                        <Activity className="w-3 h-3 mr-1" /> Engine: {alert.model_type}
                      </div>
                    </div>
                    {/* Transaction Mini Card */}
                    <div className="text-right">
                      <p className="text-xl font-bold text-white mb-1">
                        {formatINR(alert.transaction?.amount || 0)}
                      </p>
                      <p className="text-sm text-gray-400 flex items-center justify-end">
                        <Calendar className="w-3 h-3 mr-1" />
                        {alert.transaction?.transaction_date}
                      </p>
                    </div>
                  </div>

                  {/* Transaction Details */}
                  <div className="bg-gray-950/50 rounded-xl p-4 mb-6 border border-gray-800">
                    <p className="text-sm font-medium text-gray-300">
                      {alert.transaction?.merchant || "Unknown Merchant"}
                    </p>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                      {alert.transaction?.description || "No description provided"}
                    </p>
                    <div className="mt-3 flex items-center space-x-2">
                      <span className="px-2 py-1 bg-gray-800 text-gray-300 rounded text-xs">
                        {alert.transaction?.transaction_type.toUpperCase()}
                      </span>
                      <span className="px-2 py-1 bg-gray-800 text-gray-300 rounded text-xs">
                        {alert.transaction?.category}
                      </span>
                    </div>
                  </div>

                  {/* Reasons List */}
                  <div className="space-y-3 mt-auto">
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                      Detected Anomalies
                    </h4>
                    {alert.detected_reasons.length > 0 ? (
                      alert.detected_reasons.map((reason, idx) => (
                        <div key={idx} className="flex items-start">
                          <div className="mt-0.5 mr-3 flex-shrink-0">
                            {reason.severity === "HIGH" ? (
                              <ShieldAlert className="w-4 h-4 text-red-400" />
                            ) : reason.severity === "MEDIUM" ? (
                              <AlertTriangle className="w-4 h-4 text-yellow-400" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-200">
                              {reason.reason}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              Rule: {reason.rule_name.replace(/_/g, " ")}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex items-start">
                        <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 mr-3 flex-shrink-0" />
                        <p className="text-sm text-gray-400">Normal behavior patterns only</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
