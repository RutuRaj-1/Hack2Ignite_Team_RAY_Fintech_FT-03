import React, { ReactNode } from "react";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function ChartCard({ title, subtitle, children, className = "", delay = 0 }: ChartCardProps) {
  return (
    <div 
      className={`glass-card p-6 animate-fade-in-up flex flex-col ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
      </div>
      <div className="flex-1 w-full min-h-[300px]">
        {children}
      </div>
    </div>
  );
}
