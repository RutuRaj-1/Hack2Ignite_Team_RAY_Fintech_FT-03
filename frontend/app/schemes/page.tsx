"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { getSchemeMatches, SchemeMatchResponse } from "@/lib/api";
import {
  Landmark,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  TrendingUp,
  Loader2,
} from "lucide-react";

export default function GovernmentSchemesPage() {
  const { firebaseUser, getIdToken, loading: authLoading } = useAuth();
  const router = useRouter();

  const [matches, setMatches] = useState<SchemeMatchResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMatches = async () => {
    const token = await getIdToken();
    if (!token) return;
    setLoading(true);
    try {
      const res = await getSchemeMatches(token);
      setMatches(res.matches);
    } catch (error) {
      console.error("Error fetching scheme matches:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !firebaseUser) {
      router.push("/login");
    } else if (firebaseUser) {
      fetchMatches();
    }
  }, [firebaseUser, authLoading, router]);

  if (authLoading || (!firebaseUser && loading)) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-950 text-white">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6 md:p-10 font-sans selection:bg-amber-500/30">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-2">
              <Landmark className="w-4 h-4" />
              <span className="text-xs font-semibold tracking-wide uppercase">
                FT-04 Government Schemes
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white">
              Financing <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">Opportunities</span>
            </h1>
            <p className="text-gray-400 max-w-xl text-sm md:text-base">
              Discover official government subsidies and loan schemes tailored to your MSME profile. Reduce your commercial credit burden by leveraging eligible support.
            </p>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="p-4 rounded-xl bg-blue-900/20 border border-blue-500/30 flex items-start gap-3 backdrop-blur-sm">
          <HelpCircle className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
          <p className="text-sm text-blue-200">
            <strong>Informational / Prototype Match:</strong> The matching engine provides an estimated eligibility score based on your FINBRIDGE profile. You must verify official eligibility criteria on the respective government portals before applying.
          </p>
        </div>

        {/* Scheme List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          </div>
        ) : matches.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-gray-800 rounded-2xl bg-gray-900/20">
            <ShieldCheck className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-300">No schemes matched</h3>
            <p className="text-gray-500 text-sm mt-1">
              Please ensure your business profile is fully updated to discover eligible schemes.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {matches.map((match) => (
              <div
                key={match.id}
                className="group relative flex flex-col rounded-2xl border bg-gray-900/40 p-6 backdrop-blur-sm transition-all duration-300 hover:bg-gray-900/60 border-gray-800 hover:border-gray-700"
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="pr-4">
                    <h3 className="text-xl font-bold text-white mb-2 leading-tight">
                      {match.scheme.name}
                    </h3>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                        <CheckCircle2 className="w-3 h-3" />
                        {match.scheme.verification_status}
                      </span>
                    </div>
                  </div>
                  {/* Match Score */}
                  <div className="flex flex-col items-end shrink-0">
                    <div className="flex items-baseline gap-1">
                      <span className={`text-3xl font-bold ${match.match_percentage >= 70 ? 'text-emerald-400' : match.match_percentage >= 40 ? 'text-amber-400' : 'text-gray-400'}`}>
                        {match.match_percentage}%
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Match</span>
                  </div>
                </div>

                <p className="text-sm text-gray-400 mb-6 leading-relaxed flex-grow">
                  {match.scheme.description}
                </p>

                {/* Match Details */}
                <div className="bg-gray-950/50 rounded-xl p-4 mb-6 border border-gray-800 space-y-4">
                  <div>
                    <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2 flex items-center">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mr-1.5" /> Why it matched
                    </h4>
                    <ul className="space-y-1.5">
                      {match.matched_conditions.map((cond, idx) => (
                        <li key={idx} className="text-sm text-gray-400 flex items-start">
                          <span className="mr-2 text-emerald-500/50">•</span> {cond}
                        </li>
                      ))}
                      {match.matched_conditions.length === 0 && (
                        <li className="text-sm text-gray-600 italic">No specific profile matches</li>
                      )}
                    </ul>
                  </div>

                  {match.unmet_conditions.length > 0 && (
                    <div className="pt-3 border-t border-gray-800/50">
                      <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2 flex items-center">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-500 mr-1.5" /> Needs Verification / Unmet
                      </h4>
                      <ul className="space-y-1.5">
                        {match.unmet_conditions.map((cond, idx) => (
                          <li key={idx} className="text-sm text-gray-400 flex items-start">
                            <span className="mr-2 text-amber-500/50">•</span> {cond}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Footer Link */}
                <div className="mt-auto flex justify-end">
                  <a
                    href={match.scheme.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm font-semibold text-amber-400 hover:text-amber-300 transition-colors group/link"
                  >
                    View Official Details 
                    <ExternalLink className="w-4 h-4 ml-1.5 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
