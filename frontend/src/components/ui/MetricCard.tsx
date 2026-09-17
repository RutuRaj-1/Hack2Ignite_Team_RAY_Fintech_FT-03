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
  iconBg?: string;
}

export function MetricCard({
  title,
  value,
  icon: Icon,
  trend,
  trendDirection,
  delay = 0,
  subtitle,
  accentColor = "var(--brand-700)",
  iconBg,
}: MetricCardProps) {
  const bg = iconBg || `${accentColor}18`;

  return (
    <div
      className="card metric-card p-5 animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)", letterSpacing: "0.05em" }}>
          {title}
        </p>
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: bg, border: `1px solid ${accentColor}20` }}
        >
          <Icon className="w-4 h-4" style={{ color: accentColor }} />
        </div>
      </div>

      <div className="text-financial-lg" style={{ color: "var(--text-primary)", fontSize: "26px" }}>{value}</div>

      {(trend || subtitle) && (
        <div className="flex items-center gap-1.5 mt-2">
          {trend && trendDirection && (
            <>
              {trendDirection === "up"
                ? <TrendingUp className="w-3 h-3" style={{ color: "var(--success)" }} />
                : <TrendingDown className="w-3 h-3" style={{ color: "var(--danger)" }} />}
              <span className="text-xs font-medium" style={{ color: trendDirection === "up" ? "var(--success)" : "var(--danger)" }}>
                {trend}
              </span>
            </>
          )}
          {subtitle && <span className="text-xs" style={{ color: "var(--text-muted)" }}>{subtitle}</span>}
        </div>
      )}
    </div>
  );
}
