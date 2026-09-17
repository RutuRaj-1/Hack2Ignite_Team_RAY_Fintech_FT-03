import { useEffect, useState } from "react";
import { Shield } from "lucide-react";

interface TrustScoreCardProps {
  score: number;
  delay?: number;
  positiveFactors?: string[];
  negativeFactors?: string[];
  showFactors?: boolean;
}

function getScoreColor(score: number): string {
  if (score >= 80) return "#169C73";  // Strong — FinGreen
  if (score >= 60) return "#237277";  // Stable — FinBridge Teal
  if (score >= 40) return "#D89B22";  // Developing — FinAmber
  return "#D96559";                   // Needs Attention — FinCoral
}

function getScoreLabel(score: number): string {
  if (score >= 80) return "Strong";
  if (score >= 60) return "Stable";
  if (score >= 40) return "Developing";
  if (score > 0)   return "Needs Attention";
  return "N/A";
}

function getScoreBandBg(score: number): string {
  if (score >= 80) return "var(--success-soft)";
  if (score >= 60) return "var(--brand-50)";
  if (score >= 40) return "var(--warning-soft)";
  return "var(--danger-soft)";
}

export function TrustScoreCard({
  score,
  delay = 0,
  positiveFactors = [],
  negativeFactors = [],
  showFactors = false,
}: TrustScoreCardProps) {
  const [displayScore, setDisplayScore] = useState(0);
  const color = getScoreColor(score);
  const label = getScoreLabel(score);
  const bandBg = getScoreBandBg(score);

  useEffect(() => {
    const timer = setTimeout(() => {
      const increment = score / 60;
      let current = 0;
      const interval = setInterval(() => {
        current = Math.min(current + increment, score);
        setDisplayScore(Math.floor(current));
        if (current >= score) clearInterval(interval);
      }, 16);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timer);
  }, [score, delay]);

  // Semi-circular arc (top half only) for a gauge look
  const radius = 68;
  const circumference = 2 * Math.PI * radius;
  const strokeDash = (displayScore / 100) * circumference;

  return (
    <div className="card p-6 animate-fade-in-up" style={{ animationDelay: `${delay}ms` }}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "var(--brand-50)" }}>
          <Shield className="w-4 h-4" style={{ color: "var(--brand-700)" }} />
        </div>
        <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)", letterSpacing: "0.04em" }}>
          Financial Trust Score
        </h3>
      </div>

      {/* Score Ring */}
      <div className="flex flex-col items-center gap-3">
        <div className="relative" style={{ width: 164, height: 164 }}>
          {/* Background arc */}
          <svg width="164" height="164" viewBox="0 0 164 164" className="absolute inset-0 -rotate-90">
            <circle
              cx="82" cy="82" r={radius}
              fill="none"
              stroke="var(--brand-100)"
              strokeWidth="10"
            />
            <circle
              cx="82" cy="82" r={radius}
              fill="none"
              stroke={color}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${strokeDash} ${circumference}`}
              style={{ transition: "stroke-dasharray 0.05s linear" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-bold text-financial" style={{ fontSize: "40px", color, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.03em" }}>
              {displayScore}
            </span>
            <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>/100</span>
          </div>
        </div>

        {/* Band label */}
        <div className="text-center">
          <span
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold"
            style={{ background: bandBg, color, border: `1px solid ${color}25` }}
          >
            {label}
          </span>
          <p className="text-xs mt-1.5" style={{ color: "var(--text-muted)" }}>FinBridge Trust Score</p>
        </div>

        {/* Factors (optional) */}
        {showFactors && (positiveFactors.length > 0 || negativeFactors.length > 0) && (
          <div className="w-full mt-2 space-y-2">
            {positiveFactors.slice(0, 3).map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-xs" style={{ color: "var(--success-text)" }}>
                <span className="font-bold text-sm" style={{ color: "var(--success)" }}>✓</span>
                <span>{f}</span>
              </div>
            ))}
            {negativeFactors.slice(0, 2).map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-xs" style={{ color: "var(--warning-text)" }}>
                <span className="font-bold text-sm" style={{ color: "var(--warning)" }}>⚠</span>
                <span>{f}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
