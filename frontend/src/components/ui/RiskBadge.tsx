type RiskLevel = "LOW" | "MEDIUM" | "HIGH";

const config: Record<RiskLevel, { label: string; color: string; bg: string; border: string }> = {
  LOW:    { label: "Low Risk",    color: "#34d399", bg: "rgba(16,185,129,0.1)",  border: "rgba(16,185,129,0.25)" },
  MEDIUM: { label: "Medium Risk", color: "#fbbf24", bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.25)" },
  HIGH:   { label: "High Risk",   color: "#f87171", bg: "rgba(239,68,68,0.1)",   border: "rgba(239,68,68,0.25)" },
};

export function RiskBadge({ level }: { level: RiskLevel }) {
  const { label, color, bg, border } = config[level] || config.MEDIUM;
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold font-mono uppercase tracking-wider"
      style={{ background: bg, color, border: `1px solid ${border}` }}>
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color }}></span>
      {label}
    </span>
  );
}
