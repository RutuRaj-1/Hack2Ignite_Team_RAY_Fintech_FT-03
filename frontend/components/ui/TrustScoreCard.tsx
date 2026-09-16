import React from "react";

interface TrustScoreCardProps {
  score: number;
  className?: string;
  delay?: number;
}

export function TrustScoreCard({ score, className = "", delay = 0 }: TrustScoreCardProps) {
  // Map score 0-100 to color
  let colorClass = "text-emerald-400";
  let strokeClass = "stroke-emerald-400";
  let dropShadow = "drop-shadow-[0_0_12px_rgba(52,211,153,0.5)]";
  let label = "Excellent";

  if (score < 40) {
    colorClass = "text-red-400";
    strokeClass = "stroke-red-400";
    dropShadow = "drop-shadow-[0_0_12px_rgba(239,68,68,0.5)]";
    label = "Poor";
  } else if (score < 70) {
    colorClass = "text-amber-400";
    strokeClass = "stroke-amber-400";
    dropShadow = "drop-shadow-[0_0_12px_rgba(251,191,36,0.5)]";
    label = "Fair";
  }

  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div 
      className={`glass-card p-6 flex flex-col items-center justify-center animate-fade-in-up ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <h3 className="text-sm font-medium text-gray-400 self-start mb-4">Financial Trust Score</h3>
      
      <div className="relative flex items-center justify-center mb-4">
        {/* Background Circle */}
        <svg className="w-32 h-32 transform -rotate-90">
          <circle
            cx="64"
            cy="64"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-white/10"
          />
          {/* Progress Circle */}
          <circle
            cx="64"
            cy="64"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={`${strokeClass} transition-all duration-1000 ease-out`}
            style={{ filter: `drop-shadow(0 0 6px var(--tw-shadow-color))` }}
          />
        </svg>
        
        <div className="absolute flex flex-col items-center justify-center">
          <span className={`text-4xl font-bold ${colorClass} ${dropShadow}`}>{score}</span>
        </div>
      </div>
      
      <span className={`text-sm font-semibold tracking-wide uppercase ${colorClass}`}>{label}</span>
    </div>
  );
}
