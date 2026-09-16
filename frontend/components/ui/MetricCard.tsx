import React from "react";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendDirection?: "up" | "down" | "neutral";
  subtitle?: string;
  className?: string;
  delay?: number;
}

export function MetricCard({
  title,
  value,
  icon: Icon,
  trend,
  trendDirection,
  subtitle,
  className = "",
  delay = 0,
}: MetricCardProps) {
  const trendColor = 
    trendDirection === "up" ? "text-emerald-400" : 
    trendDirection === "down" ? "text-red-400" : "text-gray-400";

  return (
    <div 
      className={`glass-card p-6 animate-fade-in-up flex flex-col gap-2 ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex justify-between items-start">
        <p className="text-sm font-medium text-gray-400">{title}</p>
        <div className="p-2 rounded-lg bg-white/5 border border-white/10">
          <Icon className="w-5 h-5 text-blue-400" />
        </div>
      </div>
      
      <div className="flex items-baseline gap-2 mt-2">
        <h3 className="text-2xl font-bold text-white">{value}</h3>
        {trend && (
          <span className={`text-sm font-medium ${trendColor}`}>
            {trendDirection === "up" ? "↑" : trendDirection === "down" ? "↓" : "−"} {trend}
          </span>
        )}
      </div>
      
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );
}
