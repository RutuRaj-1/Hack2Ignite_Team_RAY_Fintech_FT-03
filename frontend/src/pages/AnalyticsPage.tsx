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
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  RefreshCw,
  Layers,
  IndianRupee,
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
} from "recharts";

// FinBridge canonical chart palette
const CHART_COLORS = ["#237277", "#2563EB", "#169C73", "#D89B22", "#7457C8", "#D96559"];

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
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(num);
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

  const tooltipStyle = {
    backgroundColor: "var(--surface)",
    border: "1px solid var(--border-strong)",
    borderRadius: "10px",
    boxShadow: "var(--shadow-md)",
    color: "var(--text-primary)",
    fontSize: "13px",
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="badge badge-brand">FT-05</span>
            </div>
            <h1 className="text-h1 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "var(--info-soft)" }}>
                <BarChart3 size={18} style={{ color: "var(--info)" }} />
              </div>
              Financial Analytics
            </h1>
            <p className="mt-1" style={{ color: "var(--text-muted)", fontSize: "14px" }}>
              Revenue stability, expense ratios, and working capital trends.
            </p>
          </div>
          <button
            onClick={loadData}
            disabled={loading}
            className="btn btn-secondary btn-sm flex items-center gap-2 self-start md:self-auto"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} style={{ color: "var(--brand-700)" }} />
            Refresh Data
          </button>
        </div>

        {/* Top KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "Monthly Revenue",
              value: summary ? formatCurrency(summary.monthly_revenue) : "₹—",
              icon: <ArrowUpRight size={16} style={{ color: "var(--success)" }} />,
              iconBg: "var(--success-soft)",
              sub: "Avg regular inflows",
              subColor: "var(--success)",
            },
            {
              label: "Monthly Expenses",
              value: summary ? formatCurrency(summary.monthly_expenses) : "₹—",
              icon: <ArrowDownRight size={16} style={{ color: "var(--danger)" }} />,
              iconBg: "var(--danger-soft)",
              sub: summary?.expense_ratio ? `${parseFloat(summary.expense_ratio).toFixed(1)}% of revenue` : "—",
              subColor: "var(--danger)",
            },
            {
              label: "Net Cash Flow",
              value: summary ? formatCurrency(summary.net_cash_flow) : "₹—",
              icon: <IndianRupee size={16} style={{ color: "var(--brand-700)" }} />,
              iconBg: "var(--brand-50)",
              sub: "Net operating liquidity",
              subColor: "var(--brand-700)",
            },
            {
              label: "Revenue Stability",
              value: summary?.revenue_consistency ? `${parseFloat(summary.revenue_consistency).toFixed(1)}%` : "—",
              icon: <Layers size={16} style={{ color: "var(--ai)" }} />,
              iconBg: "var(--ai-soft)",
              sub: `Volatility: ${summary?.cash_flow_volatility ?? "—"}`,
              subColor: "var(--ai)",
            },
          ].map((kpi, i) => (
            <div key={i} className="card p-5 animate-fade-in-up" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="flex items-start justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)", letterSpacing: "0.05em" }}>
                  {kpi.label}
                </span>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: kpi.iconBg }}>
                  {kpi.icon}
                </div>
              </div>
              <div className="text-financial mb-1" style={{ fontSize: "22px", color: "var(--text-primary)" }}>{kpi.value}</div>
              <p className="text-xs" style={{ color: kpi.subColor }}>{kpi.sub}</p>
            </div>
          ))}
        </div>

        {/* Tab Navigation */}
        <div className="tabs">
          {[
            { key: "cashflow", label: "Cash Flow" },
            { key: "expenses", label: "Expenses" },
            { key: "trends",   label: "Revenue Trends" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key as typeof activeTab)}
              className={`tab-item ${activeTab === t.key ? "active" : ""}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Cash Flow Tab */}
        {activeTab === "cashflow" && (
          <div className="card p-6 space-y-4 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-h3" style={{ fontSize: "16px" }}>Monthly Cash Flow</h3>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Revenue vs. Expenses per month</p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm" style={{ background: "#237277" }} />
                  <span style={{ color: "var(--text-secondary)" }}>Revenue</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm" style={{ background: "#D96559" }} />
                  <span style={{ color: "var(--text-secondary)" }}>Expenses</span>
                </span>
              </div>
            </div>

            <div className="h-80 w-full pt-2">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gradRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#237277" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#237277" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gradExp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#D96559" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#D96559" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="month" stroke="var(--border)" tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
                    <YAxis stroke="var(--border)" tick={{ fill: "var(--text-muted)", fontSize: 11 }} tickFormatter={(v) => `₹${v / 1000}k`} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [formatCurrency(v), ""]} />
                    <Area type="monotone" dataKey="Revenue" stroke="#237277" strokeWidth={2.5} fillOpacity={1} fill="url(#gradRev)" />
                    <Area type="monotone" dataKey="Expenses" stroke="#D96559" strokeWidth={2.5} fillOpacity={1} fill="url(#gradExp)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="empty-state h-full">
                  <TrendingUp size={32} style={{ color: "var(--brand-100)" }} />
                  <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>No cashflow data. Upload transactions or load demo data.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Expenses Tab */}
        {activeTab === "expenses" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
            <div className="card p-6 space-y-4">
              <div>
                <h3 className="text-h3" style={{ fontSize: "16px" }}>Expense Distribution</h3>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Share of outgoing capital by category</p>
              </div>
              <div className="h-72 w-full">
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                        {pieData.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [formatCurrency(v), "Amount"]} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="empty-state h-full">
                    <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>No expense data available.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="card p-6 space-y-4">
              <div>
                <h3 className="text-h3" style={{ fontSize: "16px" }}>Categorical Breakdown</h3>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Aggregated spend ranking</p>
              </div>
              <div className="space-y-2.5 overflow-y-auto max-h-72 pr-1">
                {expenses.length > 0 ? (
                  expenses.map((exp, idx) => (
                    <div key={exp.category} className="flex items-center justify-between p-3 rounded-xl"
                      style={{ background: "var(--background)", border: "1px solid var(--border)" }}>
                      <div className="flex items-center gap-3">
                        <span className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ background: CHART_COLORS[idx % CHART_COLORS.length] }} />
                        <div>
                          <p className="text-sm font-medium capitalize" style={{ color: "var(--text-primary)" }}>{exp.category}</p>
                          <p className="text-xs" style={{ color: "var(--text-muted)" }}>{exp.transaction_count} transactions</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-financial" style={{ color: "var(--text-primary)" }}>{formatCurrency(exp.total)}</p>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>{exp.percentage}%</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-sm py-8" style={{ color: "var(--text-muted)" }}>No expenses logged.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Revenue Trends Tab */}
        {activeTab === "trends" && (
          <div className="card p-6 space-y-4 animate-fade-in">
            <div>
              <h3 className="text-h3" style={{ fontSize: "16px" }}>Monthly Revenue Progression</h3>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Gross revenue receipts tracked per month</p>
            </div>
            <div className="h-80 w-full pt-2">
              {trend.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="month" stroke="var(--border)" tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
                    <YAxis stroke="var(--border)" tick={{ fill: "var(--text-muted)", fontSize: 11 }} tickFormatter={(v) => `₹${v / 1000}k`} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [formatCurrency(v), "Revenue"]} />
                    <Bar dataKey="revenue" fill="#237277" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="empty-state h-full">
                  <BarChart3 size={32} style={{ color: "var(--brand-100)" }} />
                  <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>No revenue trend data available.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
