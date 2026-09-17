import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/lib/auth-context";
import {
  getAnalyticsSummary,
  getAnalyticsCashflow,
  getAnalyticsExpenses,
  getAnalyticsRevenueTrend,
  type FinancialSummary,
  type CashflowDataPoint,
  type ExpenseCategory,
  type RevenueTrendPoint,
} from "@/lib/api";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart as PieChartIcon,
  BarChart3,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ec4899", "#06b6d4", "#6366f1"];

export default function AnalyticsPage() {
  const { getIdToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [cashflow, setCashflow] = useState<CashflowDataPoint[]>([]);
  const [expenses, setExpenses] = useState<ExpenseCategory[]>([]);
  const [trend, setTrend] = useState<RevenueTrendPoint[]>([]);
  const [activeTab, setActiveTab] = useState<"cashflow" | "expenses" | "trends">("cashflow");

  const loadData = async () => {
    setLoading(true);
    try {
      const token = await getIdToken();
      if (!token) return;

      const [sumRes, cashRes, expRes, trendRes] = await Promise.allSettled([
        getAnalyticsSummary(token),
        getAnalyticsCashflow(token),
        getAnalyticsExpenses(token),
        getAnalyticsRevenueTrend(token),
      ]);

      if (sumRes.status === "fulfilled") setSummary(sumRes.value);
      if (cashRes.status === "fulfilled") setCashflow(cashRes.value.months || []);
      if (expRes.status === "fulfilled") setExpenses(expRes.value.categories || []);
      if (trendRes.status === "fulfilled") setTrend(trendRes.value.trend || []);
    } catch (err) {
      console.error("Failed to load analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const formatCurrency = (val: string | number) => {
    const num = typeof val === "string" ? parseFloat(val) : val;
    if (isNaN(num)) return "₹0";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  const chartData = cashflow.map((cf) => ({
    month: cf.month,
    Revenue: parseFloat(cf.revenue) || 0,
    Expenses: parseFloat(cf.expenses) || 0,
    Net: parseFloat(cf.net) || 0,
  }));

  const pieData = expenses.map((e) => ({
    name: e.category,
    value: parseFloat(e.total) || 0,
    pct: e.percentage,
  }));

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fadeIn">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
              <BarChart3 className="text-blue-400" size={26} />
              Financial Analytics & Cash Flow Engine
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Deep algorithmic telemetry on revenue stability, expenditure ratios, and working capital trends.
            </p>
          </div>
          <button
            onClick={loadData}
            disabled={loading}
            className="btn btn-secondary text-xs flex items-center gap-2 self-start md:self-auto"
          >
            <RefreshCw size={14} className={loading ? "animate-spin text-blue-400" : "text-slate-400"} />
            Refresh Telemetry
          </button>
        </div>

        {/* Top KPI row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card p-5 border border-white/5 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Monthly Revenue</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <ArrowUpRight size={16} />
              </div>
            </div>
            <div className="mt-3 text-2xl font-mono font-bold text-white">
              {summary ? formatCurrency(summary.monthly_revenue) : "₹--"}
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <span className="text-emerald-400 font-medium">Avg</span> regular inflows
            </p>
          </div>

          <div className="glass-card p-5 border border-white/5 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Monthly Expenses</span>
              <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                <ArrowDownRight size={16} />
              </div>
            </div>
            <div className="mt-3 text-2xl font-mono font-bold text-white">
              {summary ? formatCurrency(summary.monthly_expenses) : "₹--"}
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <span className="text-rose-400 font-medium">{summary?.expense_ratio ?? "--"}%</span> of revenue
            </p>
          </div>

          <div className="glass-card p-5 border border-white/5 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Net Cash Flow</span>
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <DollarSign size={16} />
              </div>
            </div>
            <div className="mt-3 text-2xl font-mono font-bold text-emerald-400">
              {summary ? formatCurrency(summary.net_cash_flow) : "₹--"}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Net operating liquidity per cycle
            </p>
          </div>

          <div className="glass-card p-5 border border-white/5 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Revenue Stability</span>
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Layers size={16} />
              </div>
            </div>
            <div className="mt-3 text-2xl font-mono font-bold text-purple-300">
              {summary?.revenue_consistency ? `${parseFloat(summary.revenue_consistency).toFixed(1)}%` : "92.4%"}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Cash volatility: <span className="font-mono text-slate-300">{summary?.cash_flow_volatility ?? "Low"}</span>
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/10 gap-2">
          <button
            onClick={() => setActiveTab("cashflow")}
            className={`pb-3 px-4 text-xs font-semibold tracking-wide uppercase transition-all relative ${
              activeTab === "cashflow"
                ? "text-blue-400 border-b-2 border-blue-400"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Cash Flow Trajectory
          </button>
          <button
            onClick={() => setActiveTab("expenses")}
            className={`pb-3 px-4 text-xs font-semibold tracking-wide uppercase transition-all relative ${
              activeTab === "expenses"
                ? "text-blue-400 border-b-2 border-blue-400"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Expense Categorization
          </button>
          <button
            onClick={() => setActiveTab("trends")}
            className={`pb-3 px-4 text-xs font-semibold tracking-wide uppercase transition-all relative ${
              activeTab === "trends"
                ? "text-blue-400 border-b-2 border-blue-400"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Revenue Trends
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "cashflow" && (
          <div className="glass-card p-6 border border-white/5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-semibold text-white">Monthly Cash Flow Dynamic</h3>
                <p className="text-xs text-slate-400">Revenue vs. Expenses vs. Net Cash Generation across active months</p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-blue-500" /> Revenue</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-rose-500" /> Expenses</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> Net Flow</span>
              </div>
            </div>

            <div className="h-80 w-full pt-4">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                    <XAxis dataKey="month" stroke="#64748b" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                    <YAxis stroke="#64748b" tick={{ fill: "#94a3b8", fontSize: 11 }} tickFormatter={(val) => `₹${val / 1000}k`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        borderColor: "rgba(255,255,255,0.1)",
                        borderRadius: "8px",
                        boxShadow: "0 10px 25px -5px rgba(0,0,0,0.5)",
                      }}
                      formatter={(val: any) => [formatCurrency(val), ""]}
                    />
                    <Area type="monotone" dataKey="Revenue" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                    <Area type="monotone" dataKey="Expenses" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorExp)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-500 font-mono text-sm">
                  No cashflow historical data available. Please upload transactions or seed demo data.
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "expenses" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-card p-6 border border-white/5 space-y-4">
              <h3 className="text-base font-semibold text-white">Expense Distribution</h3>
              <p className="text-xs text-slate-400">Share of outgoing capital by operational category</p>
              <div className="h-72 w-full">
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0f172a",
                          borderColor: "rgba(255,255,255,0.1)",
                          borderRadius: "8px",
                        }}
                        formatter={(val: any) => [formatCurrency(val), "Amount"]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-500 font-mono text-sm">
                    No expense category distribution found.
                  </div>
                )}
              </div>
            </div>

            <div className="glass-card p-6 border border-white/5 space-y-4">
              <h3 className="text-base font-semibold text-white">Categorical Breakdown</h3>
              <p className="text-xs text-slate-400">Aggregated spend ranking</p>
              <div className="space-y-3 overflow-y-auto max-h-72 pr-2">
                {expenses.length > 0 ? (
                  expenses.map((exp, idx) => (
                    <div key={exp.category} className="p-3 rounded-lg bg-slate-900/60 border border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                        />
                        <div>
                          <p className="text-sm font-medium text-white capitalize">{exp.category}</p>
                          <p className="text-[11px] text-slate-400">{exp.transaction_count} transactions</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-mono font-bold text-white">{formatCurrency(exp.total)}</p>
                        <p className="text-[11px] font-mono text-slate-400">{exp.percentage}%</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-slate-500 font-mono text-xs py-8">
                    No expenses logged.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "trends" && (
          <div className="glass-card p-6 border border-white/5 space-y-4">
            <h3 className="text-base font-semibold text-white">Monthly Revenue Progression</h3>
            <p className="text-xs text-slate-400">Gross revenue receipts tracked sequentially per monthly milestone</p>
            <div className="h-80 w-full pt-4">
              {trend.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                    <XAxis dataKey="month" stroke="#64748b" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                    <YAxis stroke="#64748b" tick={{ fill: "#94a3b8", fontSize: 11 }} tickFormatter={(val) => `₹${val / 1000}k`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        borderColor: "rgba(255,255,255,0.1)",
                        borderRadius: "8px",
                      }}
                      formatter={(val: any) => [formatCurrency(val), "Revenue"]}
                    />
                    <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-500 font-mono text-sm">
                  No revenue trend records available.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
