"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  getAnalyticsSummary,
  getAnalyticsCashflow,
  getAnalyticsExpenses,
  getAnalyticsRevenueTrend,
  type FinancialSummary,
  type CashflowResponse,
  type ExpensesResponse,
  type RevenueTrendResponse,
} from "@/lib/api";
import {
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Minus,
  Loader2,
  AlertCircle,
  IndianRupee,
  BarChart2,
  PieChart,
  Activity,
  Upload,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

// ─── Color palette ───────────────────────────────────────────────────────────

const PIE_COLORS = [
  "#3B82F6", "#8B5CF6", "#10B981", "#F59E0B",
  "#EF4444", "#EC4899", "#F97316", "#6366F1", "#14B8A6",
];

// ─── Formatter ───────────────────────────────────────────────────────────────

function formatINR(value: string | number): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "₹0";
  if (Math.abs(num) >= 100000) {
    return `₹${(num / 100000).toFixed(1)}L`;
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(num);
}

function formatMonth(m: string): string {
  const [year, month] = m.split("-");
  const d = new Date(parseInt(year), parseInt(month) - 1, 1);
  return d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
}

// ─── Custom chart tooltip ─────────────────────────────────────────────────────

const ChartTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1C2230] border border-gray-700 rounded-xl p-3 shadow-2xl text-xs">
      <p className="text-gray-400 mb-2 font-medium">
        {label ? formatMonth(label) : ""}
      </p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">
          {p.name}: {formatINR(p.value)}
        </p>
      ))}
    </div>
  );
};

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  subtitle,
  icon: Icon,
  color,
  trend,
}: {
  label: string;
  value: string;
  subtitle?: string;
  icon: React.ElementType;
  color: string;
  trend?: "up" | "down" | "neutral";
}) {
  const TrendIcon =
    trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendColor =
    trend === "up"
      ? "text-emerald-400"
      : trend === "down"
      ? "text-red-400"
      : "text-gray-400";

  return (
    <div className="bg-[#161B22] border border-gray-800 rounded-2xl p-5 hover:border-gray-700 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}
        >
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <TrendIcon className={`w-4 h-4 ${trendColor}`} />
        )}
      </div>
      <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
      <p className="text-sm font-medium text-gray-400 mt-1">{label}</p>
      {subtitle && (
        <p className="text-xs text-gray-600 mt-0.5">{subtitle}</p>
      )}
    </div>
  );
}

// ─── Section card ─────────────────────────────────────────────────────────────

function ChartCard({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[#161B22] border border-gray-800 rounded-2xl p-6">
      <div className="flex items-center gap-2.5 mb-6">
        <Icon className="w-4 h-4 text-blue-400" />
        <h2 className="text-sm font-semibold text-white">{title}</h2>
      </div>
      {children}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const router = useRouter();
  const { firebaseUser, loading: authLoading, getIdToken } = useAuth();

  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [cashflow, setCashflow] = useState<CashflowResponse | null>(null);
  const [expenses, setExpenses] = useState<ExpensesResponse | null>(null);
  const [revTrend, setRevTrend] = useState<RevenueTrendResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !firebaseUser) {
      router.push("/login");
    }
  }, [authLoading, firebaseUser, router]);

  useEffect(() => {
    if (!firebaseUser) return;
    let mounted = true;

    const load = async () => {
      const idToken = await getIdToken();
      if (!idToken || !mounted) return;
      try {
        const [s, c, e, r] = await Promise.all([
          getAnalyticsSummary(idToken),
          getAnalyticsCashflow(idToken),
          getAnalyticsExpenses(idToken),
          getAnalyticsRevenueTrend(idToken),
        ]);
        if (!mounted) return;
        setSummary(s);
        setCashflow(c);
        setExpenses(e);
        setRevTrend(r);
      } catch (err: unknown) {
        if (!mounted) return;
        const msg =
          err instanceof Error ? err.message : "Failed to load analytics.";
        setError(msg);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [firebaseUser, getIdToken]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#0D1117] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-9 h-9 text-blue-500 animate-spin" />
          <p className="text-sm text-gray-500">Loading analytics…</p>
        </div>
      </div>
    );
  }

  // ── Prepare chart data ──────────────────────────────────────────────────
  const cashflowChartData = (cashflow?.months ?? []).map((m) => ({
    month: m.month,
    Revenue: parseFloat(m.revenue),
    Expenses: parseFloat(m.expenses),
    Net: parseFloat(m.net),
  }));

  const revTrendChartData = (revTrend?.trend ?? []).map((m) => ({
    month: m.month,
    Revenue: parseFloat(m.revenue),
  }));

  const expenseChartData = (expenses?.categories ?? []).map((c) => ({
    name: c.category,
    value: parseFloat(c.total),
    percentage: parseFloat(c.percentage),
  }));

  const hasData = summary && summary.transaction_count > 0;

  const netPositive =
    summary && parseFloat(summary.net_cash_flow) >= 0;

  return (
    <div className="min-h-screen bg-[#0D1117] text-gray-100">
      {/* ── Navbar ── */}
      <header className="sticky top-0 z-40 bg-[#161B22]/80 backdrop-blur-md border-b border-gray-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              FIN<span className="text-blue-500">BRIDGE</span>
            </span>
          </Link>
          <nav className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/transactions"
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            >
              Transactions
            </Link>
            <Link
              href="/analytics"
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20"
            >
              Analytics
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* ── Page header ── */}
        <div>
          <h1 className="text-2xl font-bold text-white">Financial Analytics</h1>
          <p className="text-sm text-gray-400 mt-1">
            FT-05 · MSME Expense & Revenue Intelligence Engine
          </p>
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        {/* ── No data CTA ── */}
        {!hasData && !error && (
          <div className="rounded-2xl bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-500/20 p-10 flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Upload className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                No transaction data yet
              </h2>
              <p className="text-sm text-gray-400 mt-2 max-w-md">
                Upload your bank statement CSV on the Transactions page to
                unlock all analytics insights.
              </p>
            </div>
            <Link
              href="/transactions"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-600/25 transition-colors"
            >
              Upload Transactions
            </Link>
          </div>
        )}

        {hasData && summary && (
          <>
            {/* ── KPI Cards ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <KpiCard
                label="Avg Monthly Revenue"
                value={formatINR(summary.monthly_revenue)}
                subtitle={`Total: ${formatINR(summary.total_revenue)}`}
                icon={TrendingUp}
                color="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                trend="up"
              />
              <KpiCard
                label="Avg Monthly Expenses"
                value={formatINR(summary.monthly_expenses)}
                subtitle={`Total: ${formatINR(summary.total_expenses)}`}
                icon={TrendingDown}
                color="bg-red-500/10 border border-red-500/20 text-red-400"
                trend="down"
              />
              <KpiCard
                label="Net Cash Flow"
                value={formatINR(summary.net_cash_flow)}
                subtitle="Monthly average"
                icon={Activity}
                color={
                  netPositive
                    ? "bg-blue-500/10 border border-blue-500/20 text-blue-400"
                    : "bg-orange-500/10 border border-orange-500/20 text-orange-400"
                }
                trend={netPositive ? "up" : "down"}
              />
              <KpiCard
                label="Expense Ratio"
                value={`${(parseFloat(summary.expense_ratio) * 100).toFixed(1)}%`}
                subtitle="Expenses / Revenue"
                icon={PieChart}
                color="bg-purple-500/10 border border-purple-500/20 text-purple-400"
                trend={
                  parseFloat(summary.expense_ratio) < 0.7
                    ? "up"
                    : "down"
                }
              />
            </div>

            {/* ── Secondary metrics ── */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-[#161B22] border border-gray-800 rounded-2xl p-5">
                <p className="text-xs text-gray-500 mb-1">Avg Transaction Value</p>
                <p className="text-xl font-bold text-white">
                  {formatINR(summary.average_transaction_value)}
                </p>
              </div>
              <div className="bg-[#161B22] border border-gray-800 rounded-2xl p-5">
                <p className="text-xs text-gray-500 mb-1">Revenue Consistency (CV)</p>
                <p className="text-xl font-bold text-white">
                  {(parseFloat(summary.revenue_consistency) * 100).toFixed(1)}%
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Lower = more consistent
                </p>
              </div>
              <div className="bg-[#161B22] border border-gray-800 rounded-2xl p-5">
                <p className="text-xs text-gray-500 mb-1">Cash-Flow Volatility</p>
                <p className="text-xl font-bold text-white">
                  {formatINR(summary.cash_flow_volatility)}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Std-dev of monthly net
                </p>
              </div>
            </div>

            {/* ── Revenue Trend Chart ── */}
            {revTrendChartData.length > 0 && (
              <ChartCard title="Monthly Revenue Trend" icon={TrendingUp}>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={revTrendChartData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#1F2937"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="month"
                      tickFormatter={formatMonth}
                      tick={{ fill: "#6B7280", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tickFormatter={(v) => formatINR(v)}
                      tick={{ fill: "#6B7280", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      width={80}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="Revenue"
                      stroke="#10B981"
                      strokeWidth={2.5}
                      dot={{ fill: "#10B981", r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>
            )}

            {/* ── Cash-Flow Area Chart ── */}
            {cashflowChartData.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartCard title="Revenue vs Expenses" icon={BarChart2}>
                  <ResponsiveContainer width="100%" height={230}>
                    <AreaChart data={cashflowChartData}>
                      <defs>
                        <linearGradient
                          id="revGrad"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#10B981"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor="#10B981"
                            stopOpacity={0}
                          />
                        </linearGradient>
                        <linearGradient
                          id="expGrad"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#EF4444"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor="#EF4444"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#1F2937"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="month"
                        tickFormatter={formatMonth}
                        tick={{ fill: "#6B7280", fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tickFormatter={(v) => formatINR(v)}
                        tick={{ fill: "#6B7280", fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                        width={75}
                      />
                      <Tooltip content={<ChartTooltip />} />
                      <Legend
                        wrapperStyle={{ fontSize: "11px", color: "#9CA3AF" }}
                      />
                      <Area
                        type="monotone"
                        dataKey="Revenue"
                        stroke="#10B981"
                        fill="url(#revGrad)"
                        strokeWidth={2}
                      />
                      <Area
                        type="monotone"
                        dataKey="Expenses"
                        stroke="#EF4444"
                        fill="url(#expGrad)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Net Cash Flow Trend" icon={Activity}>
                  <ResponsiveContainer width="100%" height={230}>
                    <AreaChart data={cashflowChartData}>
                      <defs>
                        <linearGradient
                          id="netGrad"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#3B82F6"
                            stopOpacity={0.35}
                          />
                          <stop
                            offset="95%"
                            stopColor="#3B82F6"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#1F2937"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="month"
                        tickFormatter={formatMonth}
                        tick={{ fill: "#6B7280", fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tickFormatter={(v) => formatINR(v)}
                        tick={{ fill: "#6B7280", fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                        width={75}
                      />
                      <Tooltip content={<ChartTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="Net"
                        stroke="#3B82F6"
                        fill="url(#netGrad)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartCard>
              </div>
            )}

            {/* ── Expense Categories Donut ── */}
            {expenseChartData.length > 0 && (
              <ChartCard title="Expense Categories Breakdown" icon={PieChart}>
                <div className="flex flex-col lg:flex-row items-center gap-6">
                  <div className="w-full lg:w-64 h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={expenseChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={70}
                          outerRadius={110}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {expenseChartData.map((_, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={PIE_COLORS[index % PIE_COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: number) => formatINR(value)}
                          contentStyle={{
                            background: "#1C2230",
                            border: "1px solid #374151",
                            borderRadius: "12px",
                            fontSize: "12px",
                          }}
                        />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Legend */}
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
                    {expenseChartData.map((cat, i) => (
                      <div
                        key={cat.name}
                        className="flex items-center justify-between bg-[#0D1117] rounded-xl px-3 py-2.5 border border-gray-800/80"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{
                              backgroundColor:
                                PIE_COLORS[i % PIE_COLORS.length],
                            }}
                          />
                          <span className="text-xs text-gray-300 font-medium">
                            {cat.name}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-white">
                            {formatINR(cat.value)}
                          </p>
                          <p className="text-[10px] text-gray-500">
                            {cat.percentage.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </ChartCard>
            )}
          </>
        )}

        {/* ── Bottom stats ── */}
        {hasData && summary && (
          <div className="rounded-2xl bg-[#161B22] border border-gray-800 p-6">
            <div className="flex items-center gap-2.5 mb-4">
              <IndianRupee className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-semibold text-white">
                Financial Health Summary
              </h2>
              <span className="text-[10px] text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full ml-auto">
                {summary.transaction_count} transactions analyzed
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-500">Total Revenue</p>
                <p className="text-lg font-bold text-emerald-400 mt-0.5">
                  {formatINR(summary.total_revenue)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Expenses</p>
                <p className="text-lg font-bold text-red-400 mt-0.5">
                  {formatINR(summary.total_expenses)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Net Profit</p>
                <p
                  className={`text-lg font-bold mt-0.5 ${
                    parseFloat(summary.total_revenue) -
                      parseFloat(summary.total_expenses) >=
                    0
                      ? "text-blue-400"
                      : "text-orange-400"
                  }`}
                >
                  {formatINR(
                    parseFloat(summary.total_revenue) -
                      parseFloat(summary.total_expenses)
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Expense Ratio</p>
                <p className="text-lg font-bold text-purple-400 mt-0.5">
                  {(parseFloat(summary.expense_ratio) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
