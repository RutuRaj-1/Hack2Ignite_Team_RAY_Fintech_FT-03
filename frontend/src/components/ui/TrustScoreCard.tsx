import { useEffect, useState } from "react";
import { Shield } from "lucide-react";

interface TrustScoreCardProps {
  score: number;
  delay?: number;
}

function getScoreColor(score: number): string {
  if (score >= 75) return "#10b981";
  if (score >= 55) return "#3b82f6";
  if (score >= 35) return "#f59e0b";
  return "#ef4444";
}

function getScoreLabel(score: number): string {
  if (score >= 75) return "Excellent";
  if (score >= 55) return "Good";
  if (score >= 35) return "Fair";
  if (score > 0)   return "Poor";
  return "N/A";
}

export function TrustScoreCard({ score, delay = 0 }: TrustScoreCardProps) {
  const [displayScore, setDisplayScore] = useState(0);
  const color = getScoreColor(score);
  const label = getScoreLabel(score);

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

  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDash = (displayScore / 100) * circumference;

  return (
    <div className="card p-6 animate-fade-in-up" style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-4 h-4 text-blue-400" />
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Trust Score</h3>
      </div>

      <div className="flex flex-col items-center gap-4">
        <div className="relative" style={{ width: 164, height: 164 }}>
          {/* Background ring */}
          <svg width="164" height="164" viewBox="0 0 164 164" className="absolute inset-0 -rotate-90">
            <circle cx="82" cy="82" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
            <circle
              cx="82" cy="82" r={radius}
              fill="none"
              stroke={color}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${strokeDash} ${circumference}`}
              style={{ filter: `drop-shadow(0 0 8px ${color}60)`, transition: "stroke-dasharray 0.05s linear" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-white" style={{ color }}>{displayScore}</span>
            <span className="text-xs font-mono text-slate-400 mt-0.5">/100</span>
          </div>
        </div>

        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold"
            style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}>
            {label}
          </span>
          <p className="text-xs text-slate-500 mt-2">FINBRIDGE Trust Score</p>
        </div>
      </div>
    </div>
  );
}
