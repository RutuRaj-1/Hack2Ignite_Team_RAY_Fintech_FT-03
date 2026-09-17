import React from "react";
import { CheckCircle2, ShieldAlert, Landmark, ArrowRight } from "lucide-react";
import { RiskBadge } from "./RiskBadge";
import type { LoanAssessmentResponse, SchemeMatchResponse } from "@/lib/api";

interface LoanRecommendationCardProps {
  assessment: LoanAssessmentResponse;
  className?: string;
  topScheme?: SchemeMatchResponse;
}

export function LoanRecommendationCard({ assessment, className = "", topScheme }: LoanRecommendationCardProps) {
  return (
    <div className={`glass-card p-6 ${className}`}>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">Loan Assessment</h3>
          <p className="text-sm text-gray-400">Based on your business profile and cash flow</p>
        </div>
        <RiskBadge level={assessment.risk_level} />
      </div>

      <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <p className="text-sm text-blue-200 mb-1">Recommended Range</p>
          <div className="text-2xl font-bold text-white">
            ₹{assessment.recommended_min_amount.toLocaleString()} - ₹{assessment.recommended_max_amount.toLocaleString()}
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-blue-200 mb-1">Est. EMI</p>
          <div className="text-xl font-bold text-blue-400">
            ~₹{assessment.estimated_emi.toLocaleString()}/mo
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm font-semibold text-emerald-400 flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-4 h-4" /> Supporting Factors
          </h4>
          <ul className="space-y-2">
            {assessment.supporting_factors.map((factor, idx) => (
              <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                <span className="text-emerald-500 mt-1">•</span> {factor}
              </li>
            ))}
          </ul>
        </div>
        
        {assessment.caution_factors.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-amber-400 flex items-center gap-2 mb-3">
              <ShieldAlert className="w-4 h-4" /> Cautions
            </h4>
            <ul className="space-y-2">
              {assessment.caution_factors.map((factor, idx) => (
                <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                  <span className="text-amber-500 mt-1">•</span> {factor}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      {topScheme && (
        <div className="mt-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">
                  {topScheme.match_percentage}% Match
                </span>
                <h5 className="text-sm font-bold text-white">{topScheme.scheme.name}</h5>
              </div>
              <p className="text-xs text-gray-300 mt-0.5 line-clamp-1">{topScheme.scheme.description}</p>
            </div>
          </div>
          {topScheme.scheme.source_url && (
            <a
              href={topScheme.scheme.source_url}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 shrink-0"
            >
              Details <ArrowRight className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      )}

      <div className="mt-6 text-xs text-gray-500 border-t border-white/10 pt-4">
        {assessment.disclaimer}
      </div>
    </div>
  );
}
