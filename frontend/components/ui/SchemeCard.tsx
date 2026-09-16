import React from "react";
import { ExternalLink, Check, X } from "lucide-react";
import type { SchemeMatchResponse } from "@/lib/api";

interface SchemeCardProps {
  match: SchemeMatchResponse;
  className?: string;
}

export function SchemeCard({ match, className = "" }: SchemeCardProps) {
  const { scheme, match_percentage, matched_conditions, unmet_conditions } = match;
  
  return (
    <div className={`glass-card p-6 flex flex-col h-full ${className}`}>
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-bold text-white pr-4">{scheme.name}</h3>
        <div className="flex flex-col items-end">
          <span className="text-2xl font-bold text-emerald-400">{Math.round(match_percentage)}%</span>
          <span className="text-xs text-gray-400">Match</span>
        </div>
      </div>
      
      <p className="text-sm text-gray-300 mb-6 flex-grow line-clamp-3">
        {scheme.description}
      </p>
      
      <div className="space-y-4 mb-6">
        {matched_conditions.slice(0, 2).map((condition, i) => (
          <div key={i} className="flex items-start gap-2 text-sm text-gray-300">
            <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
            <span>{condition}</span>
          </div>
        ))}
        {unmet_conditions.slice(0, 1).map((condition, i) => (
          <div key={i} className="flex items-start gap-2 text-sm text-gray-400">
            <X className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
            <span>{condition}</span>
          </div>
        ))}
      </div>
      
      <div className="mt-auto pt-4 border-t border-white/10 flex justify-between items-center">
        <span className="text-xs text-blue-400 bg-blue-500/10 px-2 py-1 rounded">
          {scheme.verification_status}
        </span>
        <a 
          href={scheme.source_url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-sm font-medium text-white hover:text-blue-400 flex items-center gap-1 transition-colors"
        >
          View Details <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}
