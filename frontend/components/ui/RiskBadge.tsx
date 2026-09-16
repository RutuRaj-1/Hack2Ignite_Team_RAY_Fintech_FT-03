import React from "react";

interface RiskBadgeProps {
  level: "LOW" | "MEDIUM" | "HIGH" | string;
  className?: string;
}

export function RiskBadge({ level, className = "" }: RiskBadgeProps) {
  const levelUpper = level.toUpperCase();
  
  let badgeClass = "badge-blue";
  if (levelUpper === "LOW") badgeClass = "badge-green";
  else if (levelUpper === "MEDIUM") badgeClass = "badge-amber";
  else if (levelUpper === "HIGH") badgeClass = "badge-purple";

  return (
    <span className={`badge ${badgeClass} ${className}`}>
      {levelUpper} RISK
    </span>
  );
}
