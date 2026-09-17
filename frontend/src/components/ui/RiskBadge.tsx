type RiskLevel = "LOW" | "MEDIUM" | "HIGH";

const config: Record<RiskLevel, { label: string; color: string; bg: string; border: string }> = {
  LOW:    { label: "Low Risk",    color: "var(--success-text)", bg: "var(--success-soft)", border: "rgba(22,156,115,0.25)" },
  MEDIUM: { label: "Medium Risk", color: "var(--warning-text)", bg: "var(--warning-soft)", border: "rgba(216,155,34,0.25)" },
  HIGH:   { label: "High Risk",   color: "var(--danger-text)",  bg: "var(--danger-soft)",  border: "rgba(217,101,89,0.25)" },
};

export function RiskBadge({ level }: { level: RiskLevel }) {
  const c = config[level] || config.MEDIUM;
  const dotColor = level === "LOW" ? "var(--success)" : level === "MEDIUM" ? "var(--warning)" : "var(--danger)";
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider"
      style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}`, letterSpacing: "0.04em" }}
    >
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: dotColor }} />
      {c.label}
    </span>
  );
}
