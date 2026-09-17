import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/lib/auth-context";
import {
  getSchemes,
  getSchemeMatches,
  type GovernmentSchemeResponse,
  type MatchingResult,
  type SchemeMatchResponse,
} from "@/lib/api";
import {
  Landmark,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Sparkles,
  Search,
  Filter,
  Award,
  ChevronRight,
  Info,
} from "lucide-react";

export default function SchemesPage() {
  const { getIdToken } = useAuth();
  const [schemes, setSchemes] = useState<GovernmentSchemeResponse[]>([]);
  const [matchResult, setMatchResult] = useState<MatchingResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"matches" | "all">("matches");

  const loadSchemes = async () => {
    setLoading(true);
    try {
      const token = await getIdToken();
      if (!token) return;

      const [allSchemes, matches] = await Promise.allSettled([
        getSchemes(token),
        getSchemeMatches(token),
      ]);

      if (allSchemes.status === "fulfilled") setSchemes(allSchemes.value || []);
      if (matches.status === "fulfilled") setMatchResult(matches.value);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchemes();
  }, []);

  const filteredSchemes = schemes.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase())
  );

  const formatCurrency = (val: number | null) => {
    if (val === null) return "No Cap";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fadeIn">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
              <Landmark className="text-blue-400" size={26} />
              Government MSME Schemes & Subsidy Matcher
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Automated cross-referencing against statutory central & state schemes (Mudra, CGTMSE, PMEGP).
            </p>
          </div>

          <div className="flex items-center gap-1 bg-slate-900/60 p-1 rounded-lg border border-white/10 text-xs">
            <button
              onClick={() => setActiveTab("matches")}
              className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
                activeTab === "matches"
                  ? "bg-blue-600 text-white font-medium"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Sparkles size={13} className="text-amber-400" />
              Eligible Matches ({matchResult?.matches?.length ?? 0})
            </button>
            <button
              onClick={() => setActiveTab("all")}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeTab === "all"
                  ? "bg-blue-600 text-white font-medium"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              All Programs ({schemes.length})
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input
            type="text"
            placeholder="Search scheme name, sector, or subsidy keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900/60 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Tab 1: Matched Schemes */}
        {activeTab === "matches" && (
          <div className="space-y-4">
            {matchResult?.matches && matchResult.matches.length > 0 ? (
              matchResult.matches.map((match) => {
                const scheme = match.scheme;
                return (
                  <div
                    key={match.id}
                    className="glass-card p-6 border border-white/5 hover:border-blue-500/30 transition-all space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2.5">
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-bold flex items-center gap-1">
                            <CheckCircle2 size={12} /> {match.match_percentage}% Match
                          </span>
                          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                            Verified MSME Program
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-white mt-1.5">{scheme.name}</h3>
                      </div>

                      {scheme.source_url && (
                        <a
                          href={scheme.source_url}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-secondary text-xs flex items-center gap-1.5 self-start sm:self-center"
                        >
                          Official Portal
                          <ExternalLink size={12} />
                        </a>
                      )}
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">{scheme.description}</p>

                    {/* Matched vs unmet condition tags */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10 space-y-2">
                        <p className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                          <CheckCircle2 size={14} /> Criteria Satisfied
                        </p>
                        <div className="space-y-1">
                          {match.matched_conditions?.map((c, i) => (
                            <p key={i} className="text-[11px] text-emerald-200/90 flex items-center gap-1.5">
                              <span className="w-1 h-1 rounded-full bg-emerald-400" />
                              {c}
                            </p>
                          ))}
                        </div>
                      </div>

                      {match.unmet_conditions && match.unmet_conditions.length > 0 ? (
                        <div className="p-3 rounded-lg bg-rose-500/5 border border-rose-500/10 space-y-2">
                          <p className="text-xs font-semibold text-rose-400 flex items-center gap-1.5">
                            <XCircle size={14} /> Outstanding Prerequisites
                          </p>
                          <div className="space-y-1">
                            {match.unmet_conditions.map((c, i) => (
                              <p key={i} className="text-[11px] text-rose-200/90 flex items-center gap-1.5">
                                <span className="w-1 h-1 rounded-full bg-rose-400" />
                                {c}
                              </p>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 rounded-lg bg-slate-900/60 border border-white/5 flex items-center text-xs text-slate-400">
                          100% eligibility confirmed. Direct application available.
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="glass-card p-12 border border-white/5 text-center text-slate-500 font-mono text-xs">
                {loading
                  ? "Evaluating MSME scheme eligibility rules..."
                  : "No high-confidence scheme matches found yet for current turnover. Check 'All Programs' below."}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: All Schemes Directory */}
        {activeTab === "all" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSchemes.map((scheme) => (
              <div
                key={scheme.id}
                className="glass-card p-5 border border-white/5 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-blue-400 uppercase tracking-wider">
                      Govt of India Initiative
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  </div>
                  <h4 className="text-base font-bold text-white mt-1">{scheme.name}</h4>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-3">{scheme.description}</p>
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-400">
                    Max: {formatCurrency(scheme.maximum_turnover)}
                  </span>
                  {scheme.source_url && (
                    <a
                      href={scheme.source_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
                    >
                      View Details <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
