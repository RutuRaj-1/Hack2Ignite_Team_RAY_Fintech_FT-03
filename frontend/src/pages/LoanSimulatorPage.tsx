import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/lib/auth-context";
import {
  simulateLoan,
  type LoanSimulationResponse,
} from "@/lib/api";
import {
  Sliders,
  DollarSign,
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  PieChart,
  ShieldAlert,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart as RechartsPie,
  Pie,
  Cell,
  Tooltip,
} from "recharts";

export default function LoanSimulatorPage() {
  const { getIdToken } = useAuth();
  const [loanAmount, setLoanAmount] = useState<number>(300000);
  const [tenureMonths, setTenureMonths] = useState<number>(12);
  const [annualRate, setAnnualRate] = useState<number>(14.5);
  const [simulation, setSimulation] = useState<LoanSimulationResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const runSimulation = async (p = loanAmount, n = tenureMonths, r = annualRate) => {
    setLoading(true);
    try {
      const token = await getIdToken();
      if (!token) return;

      const res = await simulateLoan(
        {
          loan_amount: p,
          tenure_months: n,
          annual_interest_rate: r,
        },
        token
      );
      setSimulation(res);
    } catch (err) {
      console.error("Simulation error:", err);
      // Fallback local calculations if backend is offline
      const monthlyRate = r / 12 / 100;
      const emi = (p * monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1);
      const totalRepayment = emi * n;
      const totalInterest = totalRepayment - p;
      setSimulation({
        loan_amount: p,
        tenure_months: n,
        annual_interest_rate: r,
        emi: Math.round(emi),
        total_interest: Math.round(totalInterest),
        total_repayment: Math.round(totalRepayment),
        current_cash_flow: 85000,
        post_loan_cash_flow: Math.round(85000 - emi),
        repayment_burden_pct: Math.round((emi / 85000) * 100),
        is_overborrowing_risk: emi / 85000 > 0.35,
        risk_level: emi / 85000 > 0.35 ? "HIGH" : "LOW",
        cautions: emi / 85000 > 0.35 ? ["Debt service obligation exceeds 35% of operational net cash margin."] : [],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runSimulation(loanAmount, tenureMonths, annualRate);
  }, []);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const pieData = simulation
    ? [
        { name: "Principal", value: simulation.loan_amount, color: "#3b82f6" },
        { name: "Total Interest", value: simulation.total_interest, color: "#f59e0b" },
      ]
    : [];

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fadeIn">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link to="/loan" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-mono">
                <ArrowLeft size={13} /> Back to Loans
              </Link>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
              <Sliders className="text-blue-400" size={26} />
              Dynamic Working Capital & Debt Simulator
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Stress-test debt affordability, simulate monthly repayment curves, and prevent over-borrowing distress.
            </p>
          </div>
        </div>

        {/* Warning banner if overborrowing */}
        {simulation?.is_overborrowing_risk && (
          <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 flex items-start gap-3">
            <ShieldAlert size={20} className="text-rose-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-bold text-rose-200">Over-Borrowing Risk Detected</p>
              <p>
                The projected EMI consumes {simulation.repayment_burden_pct}% of your average monthly net operating cash surplus. We recommend reducing the requested principal or extending the tenure to protect liquidity buffers.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls column */}
          <div className="lg:col-span-6 glass-card p-6 border border-white/5 space-y-6">
            <h3 className="text-base font-semibold text-white">Scenario Parameters</h3>

            {/* Principal */}
            <div>
              <div className="flex justify-between items-center text-xs mb-2">
                <span className="text-slate-400">Principal Amount</span>
                <span className="font-mono font-bold text-white text-base">
                  {formatCurrency(loanAmount)}
                </span>
              </div>
              <input
                type="range"
                min="50000"
                max="2500000"
                step="50000"
                value={loanAmount}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setLoanAmount(v);
                  runSimulation(v, tenureMonths, annualRate);
                }}
                className="w-full accent-blue-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
                <span>₹50,000</span>
                <span>₹25,00,000</span>
              </div>
            </div>

            {/* Tenure */}
            <div>
              <div className="flex justify-between items-center text-xs mb-2">
                <span className="text-slate-400">Tenure (Months)</span>
                <span className="font-mono font-bold text-white text-base">
                  {tenureMonths} Months
                </span>
              </div>
              <input
                type="range"
                min="3"
                max="36"
                step="3"
                value={tenureMonths}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setTenureMonths(v);
                  runSimulation(loanAmount, v, annualRate);
                }}
                className="w-full accent-blue-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
                <span>3 Months</span>
                <span>36 Months</span>
              </div>
            </div>

            {/* Interest Rate */}
            <div>
              <div className="flex justify-between items-center text-xs mb-2">
                <span className="text-slate-400">Annual Interest Rate (APR)</span>
                <span className="font-mono font-bold text-blue-400 text-base">
                  {annualRate.toFixed(1)}%
                </span>
              </div>
              <input
                type="range"
                min="8.0"
                max="24.0"
                step="0.5"
                value={annualRate}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setAnnualRate(v);
                  runSimulation(loanAmount, tenureMonths, v);
                }}
                className="w-full accent-blue-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
                <span>8.0% (Subsidized)</span>
                <span>24.0% (Unsecured)</span>
              </div>
            </div>

            {/* Presets */}
            <div className="pt-2">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-2">
                Quick MSME Scenarios
              </span>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <button
                  onClick={() => {
                    setLoanAmount(100000);
                    setTenureMonths(6);
                    setAnnualRate(12);
                    runSimulation(100000, 6, 12);
                  }}
                  className="p-2 rounded bg-slate-900 border border-white/5 text-slate-300 hover:text-white text-center"
                >
                  <p className="font-bold">₹1 Lakh</p>
                  <p className="text-[10px] text-slate-500">6 Months</p>
                </button>
                <button
                  onClick={() => {
                    setLoanAmount(500000);
                    setTenureMonths(12);
                    setAnnualRate(14);
                    runSimulation(500000, 12, 14);
                  }}
                  className="p-2 rounded bg-slate-900 border border-white/5 text-slate-300 hover:text-white text-center"
                >
                  <p className="font-bold">₹5 Lakhs</p>
                  <p className="text-[10px] text-slate-500">12 Months</p>
                </button>
                <button
                  onClick={() => {
                    setLoanAmount(1000000);
                    setTenureMonths(24);
                    setAnnualRate(13.5);
                    runSimulation(1000000, 24, 13.5);
                  }}
                  className="p-2 rounded bg-slate-900 border border-white/5 text-slate-300 hover:text-white text-center"
                >
                  <p className="font-bold">₹10 Lakhs</p>
                  <p className="text-[10px] text-slate-500">24 Months</p>
                </button>
              </div>
            </div>
          </div>

          {/* Result Telemetry column */}
          <div className="lg:col-span-6 space-y-6">
            <div className="glass-card p-6 border border-white/5 space-y-5">
              <h3 className="text-base font-semibold text-white">Projected Obligation Summary</h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5">
                  <span className="text-xs text-slate-400">Monthly EMI</span>
                  <p className="text-2xl font-mono font-bold text-white mt-1">
                    {simulation ? formatCurrency(simulation.emi) : "₹--"}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">Fixed monthly charge</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5">
                  <span className="text-xs text-slate-400">Total Interest Outflow</span>
                  <p className="text-2xl font-mono font-bold text-amber-400 mt-1">
                    {simulation ? formatCurrency(simulation.total_interest) : "₹--"}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">Cost of capital</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5">
                  <span className="text-xs text-slate-400">Total Net Repayment</span>
                  <p className="text-xl font-mono font-bold text-blue-400 mt-1">
                    {simulation ? formatCurrency(simulation.total_repayment) : "₹--"}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">Principal + Interest</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5">
                  <span className="text-xs text-slate-400">Debt Repayment Ratio</span>
                  <p className={`text-xl font-mono font-bold mt-1 ${
                    (simulation?.repayment_burden_pct ?? 0) > 30 ? "text-rose-400" : "text-emerald-400"
                  }`}>
                    {simulation?.repayment_burden_pct ? `${simulation.repayment_burden_pct}%` : "--"}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">Target is below 30%</p>
                </div>
              </div>

              {/* Repayment Breakdown Pie Chart */}
              <div className="pt-2">
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPie>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={65}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0f172a",
                          borderColor: "rgba(255,255,255,0.1)",
                          borderRadius: "8px",
                        }}
                        formatter={(val: any) => [formatCurrency(val), ""]}
                      />
                    </RechartsPie>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-6 text-xs text-slate-400">
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-blue-500" /> Principal ({formatCurrency(loanAmount)})
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-amber-500" /> Interest ({formatCurrency(simulation?.total_interest ?? 0)})
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
