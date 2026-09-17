import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: string;
  trendDirection?: "up" | "down";
  delay?: number;
  subtitle?: string;
  accentColor?: string;
}

export function MetricCard({ title, value, icon: Icon, trend, trendDirection, delay = 0, subtitle, accentColor = "#3b82f6" }: MetricCardProps) {
  return (
    <div
      className="card metric-card p-5 animate-fade-in-up"
      style={{ animationDelay: `${delay}ms`, borderTop: `2px solid ${accentColor}30` }}
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</p>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: `${accentColor}15` }}>
          <Icon className="w-4 h-4" style={{ color: accentColor }} />
        </div>
      </div>

      <div className="text-2xl font-bold text-white mb-1">{value}</div>

      {(trend || subtitle) && (
        <div className="flex items-center gap-1.5 mt-2">
          {trend && trendDirection && (
            <>
              {trendDirection === "up"
                ? <TrendingUp className="w-3 h-3 text-emerald-400" />
                : <TrendingDown className="w-3 h-3 text-red-400" />}
              <span className={`text-xs font-medium ${trendDirection === "up" ? "text-emerald-400" : "text-red-400"}`}>
                {trend}
              </span>
            </>
          )}
          {subtitle && <span className="text-xs text-slate-500">{subtitle}</span>}
        </div>
      )}
    </div>
  );
}
