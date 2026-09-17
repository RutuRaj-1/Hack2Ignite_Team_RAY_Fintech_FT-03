import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/lib/auth-context";
import { simulateLoan, type LoanSimulationResponse } from "@/lib/api";
import { Sliders, ArrowLeft, ShieldAlert, CheckCircle2 } from "lucide-react";
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip,
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
      const res = await simulateLoan({ loan_amount: p, tenure_months: n, annual_interest_rate: r }, token);
      setSimulation(res);
    } catch {
      // Fallback calculation if backend is offline
      const monthlyRate = r / 12 / 100;
      const emi = (p * monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1);
      const totalRepayment = emi * n;
      const totalInterest = totalRepayment - p;
      setSimulation({
        loan_amount: p, tenure_months: n, annual_interest_rate: r,
        emi: Math.round(emi), total_interest: Math.round(totalInterest),
        total_repayment: Math.round(totalRepayment),
        current_cash_flow: 85000, post_loan_cash_flow: Math.round(85000 - emi),
        repayment_burden_pct: Math.round((emi / 85000) * 100),
        is_overborrowing_risk: emi / 85000 > 0.35,
        risk_level: emi / 85000 > 0.35 ? "HIGH" : "LOW",
        cautions: emi / 85000 > 0.35 ? ["Debt service exceeds 35% of net cash margin."] : [],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { runSimulation(); }, []);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val);

  const burdenPct = simulation?.repayment_burden_pct ?? 0;
  const burdenColor = burdenPct > 40 ? "var(--danger)" : burdenPct > 25 ? "var(--warning)" : "var(--success)";

  const pieData = simulation
    ? [
        { name: "Principal", value: simulation.loan_amount,    color: "#237277" },
        { name: "Interest",  value: simulation.total_interest, color: "#D89B22" },
      ]
    : [];

  const tooltipStyle = {
    backgroundColor: "var(--surface)", border: "1px solid var(--border-strong)",
    borderRadius: "10px", boxShadow: "var(--shadow-md)", color: "var(--text-primary)",
  };

  const SliderControl = ({ label, value, min, max, step, format, onChange }: any) => (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>{label}</span>
        <span className="text-sm font-bold text-financial" style={{ color: "var(--brand-700)" }}>{format(value)}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))} />
      <div className="flex justify-between mt-1">
        <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>{format(min)}</span>
        <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>{format(max)}</span>
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6 page-enter">
        {/* Header */}
        <div>
          <Link to="/loan" className="inline-flex items-center gap-1.5 text-sm mb-3 transition-colors hover:opacity-80"
            style={{ color: "var(--brand-700)" }}>
            <ArrowLeft size={14} /> Back to Loans
          </Link>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge badge-brand">FT-03</span>
            <span className="badge badge-muted">EMI Simulator</span>
          </div>
          <h1 className="text-h1 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "var(--brand-50)" }}>
              <Sliders size={18} style={{ color: "var(--brand-700)" }} />
            </div>
            Loan EMI Simulator
          </h1>
          <p className="mt-1" style={{ color: "var(--text-muted)", fontSize: "14px" }}>
            Stress-test debt affordability and simulate monthly repayment scenarios.
          </p>
        </div>

        {/* Overborrowing Warning */}
        {simulation?.is_overborrowing_risk && (
          <div className="alert alert-danger">
            <ShieldAlert size={16} style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <p className="font-semibold mb-0.5">Repayment Burden Alert</p>
              <p className="text-sm">
                Projected EMI consumes {simulation.repayment_burden_pct}% of your monthly net cash surplus.
                Consider reducing the amount or extending tenure to protect your liquidity.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls */}
          <div className="lg:col-span-5 card p-6 space-y-6">
            <h3 className="font-semibold" style={{ color: "var(--brand-900)", fontSize: "15px" }}>Scenario Parameters</h3>

            <SliderControl
              label="Principal Amount" value={loanAmount} min={50000} max={2500000} step={50000}
              format={formatCurrency}
              onChange={(v: number) => { setLoanAmount(v); runSimulation(v, tenureMonths, annualRate); }}
            />

            <SliderControl
              label="Tenure (Months)" value={tenureMonths} min={3} max={36} step={3}
              format={(v: number) => `${v} months`}
              onChange={(v: number) => { setTenureMonths(v); runSimulation(loanAmount, v, annualRate); }}
            />

            <SliderControl
              label="Annual Interest Rate" value={annualRate} min={8} max={24} step={0.5}
              format={(v: number) => `${v.toFixed(1)}%`}
              onChange={(v: number) => { setAnnualRate(v); runSimulation(loanAmount, tenureMonths, v); }}
            />

            {/* Quick Presets */}
            <div>
              <p className="text-caption mb-2">Quick Scenarios</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "₹1 Lakh", p: 100000, n: 6,  r: 12 },
                  { label: "₹5 Lakhs", p: 500000, n: 12, r: 14 },
                  { label: "₹10 Lakhs", p: 1000000, n: 24, r: 13.5 },
                ].map((preset) => (
                  <button key={preset.label}
                    onClick={() => {
                      setLoanAmount(preset.p); setTenureMonths(preset.n); setAnnualRate(preset.r);
                      runSimulation(preset.p, preset.n, preset.r);
                    }}
                    className="p-2.5 rounded-xl text-center transition-all hover:shadow-md"
                    style={{ background: "var(--background)", border: "1px solid var(--border)" }}
                  >
                    <p className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>{preset.label}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>{preset.n} months</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-7 space-y-4">
            {/* Key metrics */}
            <div className="card p-6">
              <h3 className="font-semibold mb-4" style={{ color: "var(--brand-900)", fontSize: "15px" }}>
                Projected Obligation Summary {loading && <span className="text-xs ml-2" style={{ color: "var(--text-muted)" }}>Calculating...</span>}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Monthly EMI",       value: simulation ? formatCurrency(simulation.emi) : "₹—",              color: "var(--text-primary)",  cls: "" },
                  { label: "Total Interest",     value: simulation ? formatCurrency(simulation.total_interest) : "₹—",   color: "var(--warning)",       cls: "" },
                  { label: "Total Repayment",    value: simulation ? formatCurrency(simulation.total_repayment) : "₹—",  color: "var(--brand-700)",     cls: "" },
                  { label: "Repayment Burden",   value: simulation?.repayment_burden_pct ? `${simulation.repayment_burden_pct}%` : "—", color: burdenColor, cls: "" },
                  { label: "Current Cash Flow",  value: simulation ? formatCurrency(simulation.current_cash_flow) : "₹—", color: "var(--success)",      cls: "" },
                  { label: "Post-Loan Surplus",  value: simulation ? formatCurrency(simulation.post_loan_cash_flow) : "₹—",
                    color: (simulation?.post_loan_cash_flow ?? 0) > 0 ? "var(--success)" : "var(--danger)",              cls: "" },
                ].map((m) => (
                  <div key={m.label} className="sim-tile">
                    <p className="text-caption mb-1">{m.label}</p>
                    <p className="text-financial font-bold" style={{ color: m.color, fontSize: "17px" }}>{m.value}</p>
                  </div>
                ))}
              </div>

              {/* Repayment burden indicator */}
              {simulation && (
                <div className="mt-4">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>Repayment Burden</span>
                    <span className="text-xs font-semibold" style={{ color: burdenColor }}>{simulation.repayment_burden_pct}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{
                      width: `${Math.min(100, simulation.repayment_burden_pct)}%`,
                      background: burdenColor,
                    }} />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-[10px]" style={{ color: "var(--success)" }}>Healthy (0–25%)</span>
                    <span className="text-[10px]" style={{ color: "var(--danger)" }}>High (40%+)</span>
                  </div>
                </div>
              )}
            </div>

            {/* Pie chart breakdown */}
            <div className="card p-6">
              <h3 className="font-semibold mb-4" style={{ color: "var(--brand-900)", fontSize: "15px" }}>
                Repayment Composition
              </h3>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={4} dataKey="value">
                      {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [formatCurrency(v), ""]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-6 text-xs mt-2">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ background: "#237277" }} />
                  <span style={{ color: "var(--text-secondary)" }}>Principal ({formatCurrency(loanAmount)})</span>
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ background: "#D89B22" }} />
                  <span style={{ color: "var(--text-secondary)" }}>Interest ({formatCurrency(simulation?.total_interest ?? 0)})</span>
                </span>
              </div>
            </div>

            {/* Cautions */}
            {simulation?.cautions && simulation.cautions.length > 0 && (
              <div className="card-warning p-4 space-y-2">
                {simulation.cautions.map((c, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs" style={{ color: "var(--warning-text)" }}>
                    <CheckCircle2 size={13} style={{ color: "var(--warning)", marginTop: 1, flexShrink: 0 }} />
                    {c}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
