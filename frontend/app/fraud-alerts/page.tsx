"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { DashboardLayout } from "@/components/DashboardLayout";
import { FraudAlertCard } from "@/components/ui/FraudAlertCard";
import {
  FraudAlertResponse,
  FraudSummaryResponse,
  getFraudAlerts,
  getFraudSummary,
  runFraudAnalysis,
} from "@/lib/api";
import {
  AlertTriangle,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Activity,
  AlertCircle,
  Loader2,
  Search,
} from "lucide-react";

export default function FraudAlertsPage() {
  const { firebaseUser, getIdToken, authLoading } = useAuth();

  const [summary, setSummary] = useState<FraudSummaryResponse | null>(null);
  const [alerts, setAlerts] = useState<FraudAlertResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [filter, setFilter] = useState<string>("ALL");

  const fetchData = useCallback(async () => {
    const token = await getIdToken();
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
  }, [getIdToken, filter]);

  useEffect(() => {
    if (!authLoading && firebaseUser) {
      fetchData();
    }
  }, [firebaseUser, authLoading, fetchData]);

  const handleRunAnalysis = async () => {
    const token = await getIdToken();
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

  if (loading && !summary) {
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
      <div className="space-y-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-2">
              <Shield className="w-4 h-4" />
              <span className="text-xs font-semibold tracking-wide uppercase">
                FT-02 Engine Active
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white">
              Risk <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Intelligence</span>
            </h1>
            <p className="text-gray-400 max-w-xl text-sm md:text-base">
              Hybrid rule and anomaly detection engine. We monitor transactions to generate risk signals for the credit assessment layer.
            </p>
          </div>

          <button
            onClick={handleRunAnalysis}
            disabled={analyzing}
            className="btn btn-primary"
          >
            {analyzing ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <Activity className="w-5 h-5 mr-2" />
            )}
            {analyzing ? "Analyzing..." : "Run Risk Analysis"}
          </button>
        </div>

        {/* Stats Row */}
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="col-span-2 md:col-span-1 glass-card p-5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Search className="w-12 h-12" />
              </div>
              <p className="text-sm text-gray-400 font-medium mb-1">Analyzed / Total</p>
              <div className="flex items-baseline space-x-2">
                <h3 className="text-3xl font-bold text-white">{summary.analyzed_transactions}</h3>
                <span className="text-gray-500 text-sm">/ {summary.total_transactions}</span>
              </div>
            </div>

            <div className="glass-card p-5 border-emerald-500/20 bg-emerald-500/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-emerald-500">
                <ShieldCheck className="w-12 h-12" />
              </div>
              <p className="text-sm text-emerald-400 font-medium mb-1 flex items-center">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                Low Risk
              </p>
              <div className="flex items-baseline space-x-2">
                <h3 className="text-3xl font-bold text-white">{summary.low_risk.count}</h3>
                <span className="text-emerald-500/70 text-sm">{summary.low_risk.percentage}%</span>
              </div>
            </div>

            <div className="glass-card p-5 border-amber-500/20 bg-amber-500/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-amber-500">
                <AlertTriangle className="w-12 h-12" />
              </div>
              <p className="text-sm text-amber-400 font-medium mb-1 flex items-center">
                <span className="w-2 h-2 rounded-full bg-amber-500 mr-2 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
                Medium Risk
              </p>
              <div className="flex items-baseline space-x-2">
                <h3 className="text-3xl font-bold text-white">{summary.medium_risk.count}</h3>
                <span className="text-amber-500/70 text-sm">{summary.medium_risk.percentage}%</span>
              </div>
            </div>

            <div className="glass-card p-5 border-red-500/20 bg-red-500/5 relative overflow-hidden group">
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

            <div className="glass-card p-5 relative overflow-hidden group">
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-4 gap-4">
            <h2 className="text-xl font-semibold text-white">Detected Signals</h2>
            <div className="flex flex-wrap space-x-2">
              {["ALL", "HIGH", "MEDIUM", "LOW"].map((level) => (
                <button
                  key={level}
                  onClick={() => setFilter(level)}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    filter === level
                      ? "bg-blue-600 text-white"
                      : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : alerts.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl bg-white/5">
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
                <FraudAlertCard key={alert.id} alert={alert} />
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
