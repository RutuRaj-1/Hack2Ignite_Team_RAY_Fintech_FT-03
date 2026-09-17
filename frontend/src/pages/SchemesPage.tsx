import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/lib/auth-context";
import {
  getSchemes, getSchemeMatches,
  type GovernmentSchemeResponse, type MatchingResult,
} from "@/lib/api";
import {
  Landmark, CheckCircle2, XCircle, ExternalLink, Sparkles, Search, ArrowRight,
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
      const [allSchemes, matches] = await Promise.allSettled([getSchemes(token), getSchemeMatches(token)]);
      if (allSchemes.status === "fulfilled") setSchemes(allSchemes.value || []);
      if (matches.status === "fulfilled") setMatchResult(matches.value);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadSchemes(); }, []);

  const filteredSchemes = schemes.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.description.toLowerCase().includes(search.toLowerCase())
  );

  const formatCurrency = (val: number | null) =>
    val === null ? "No Cap" : new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val);

  return (
    <DashboardLayout>
      <div className="space-y-6 page-enter">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="badge badge-success">FT-04</span>
              <span className="badge badge-muted">Scheme Discovery</span>
            </div>
            <h1 className="text-h1 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "var(--success-soft)" }}>
                <Landmark size={18} style={{ color: "var(--success)" }} />
              </div>
              Government Schemes
            </h1>
            <p className="mt-1" style={{ color: "var(--text-muted)", fontSize: "14px" }}>
              Automated matching against MSME subsidies (Mudra, CGTMSE, PMEGP).
            </p>
          </div>

          {/* Tab Toggle */}
          <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: "var(--background)", border: "1px solid var(--border)" }}>
            <button
              onClick={() => setActiveTab("matches")}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5"
              style={{
                background: activeTab === "matches" ? "var(--surface)" : "transparent",
                color: activeTab === "matches" ? "var(--brand-800)" : "var(--text-muted)",
                boxShadow: activeTab === "matches" ? "var(--shadow-sm)" : "none",
              }}
            >
              <Sparkles size={12} style={{ color: "var(--warning)" }} />
              Matches ({matchResult?.matches?.length ?? 0})
            </button>
            <button
              onClick={() => setActiveTab("all")}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                background: activeTab === "all" ? "var(--surface)" : "transparent",
                color: activeTab === "all" ? "var(--brand-800)" : "var(--text-muted)",
                boxShadow: activeTab === "all" ? "var(--shadow-sm)" : "none",
              }}
            >
              All Programs ({schemes.length})
            </button>
          </div>
        </div>

        {/* Search */}
        {activeTab === "all" && (
          <div className="input-icon max-w-md">
            <Search className="icon" size={16} />
            <input
              type="text"
              className="input"
              placeholder="Search scheme name, sector, or subsidy type..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        )}

        {/* Matched Schemes */}
        {activeTab === "matches" && (
          <div className="space-y-4">
            {matchResult?.matches && matchResult.matches.length > 0 ? (
              matchResult.matches.map((match) => {
                const scheme = match.scheme;
                const matchPct = match.match_percentage;
                const isHigh = matchPct >= 80;
                return (
                  <div key={match.id} className="card p-6 space-y-4 transition-shadow hover:shadow-md"
                    style={{ borderTop: `3px solid ${isHigh ? "var(--success)" : "var(--warning)"}` }}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2.5 mb-1.5">
                          <span className={`badge ${isHigh ? "badge-success" : "badge-warning"} badge-pill`}>
                            <CheckCircle2 size={11} />
                            {matchPct}% Match
                          </span>
                          <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: "var(--text-muted)", letterSpacing: "0.05em" }}>
                            Verified MSME Program
                          </span>
                        </div>
                        <h3 className="text-h3" style={{ fontSize: "17px" }}>{scheme.name}</h3>
                      </div>
                      {scheme.source_url && (
                        <a href={scheme.source_url} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm flex items-center gap-1.5 self-start sm:self-center">
                          Official Portal <ExternalLink size={12} />
                        </a>
                      )}
                    </div>

                    <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{scheme.description}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl space-y-2" style={{ background: "var(--success-soft)", border: "1px solid rgba(22,156,115,0.18)" }}>
                        <p className="text-xs font-semibold flex items-center gap-1.5" style={{ color: "var(--success-text)" }}>
                          <CheckCircle2 size={13} /> Criteria Satisfied
                        </p>
                        {match.matched_conditions?.map((c, i) => (
                          <p key={i} className="text-xs flex items-center gap-1.5" style={{ color: "var(--success-text)" }}>
                            <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: "var(--success)" }} />{c}
                          </p>
                        ))}
                      </div>

                      {match.unmet_conditions && match.unmet_conditions.length > 0 ? (
                        <div className="p-4 rounded-xl space-y-2" style={{ background: "var(--danger-soft)", border: "1px solid rgba(217,101,89,0.18)" }}>
                          <p className="text-xs font-semibold flex items-center gap-1.5" style={{ color: "var(--danger-text)" }}>
                            <XCircle size={13} /> Outstanding Prerequisites
                          </p>
                          {match.unmet_conditions.map((c, i) => (
                            <p key={i} className="text-xs flex items-center gap-1.5" style={{ color: "var(--danger-text)" }}>
                              <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: "var(--danger)" }} />{c}
                            </p>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 rounded-xl flex items-center text-sm" style={{ background: "var(--brand-50)", border: "1px solid var(--brand-100)", color: "var(--brand-700)" }}>
                          <CheckCircle2 size={14} className="mr-2" />
                          100% eligibility confirmed. Apply now.
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="card p-12 text-center">
                <div className="empty-state">
                  <div className="empty-state-icon" style={{ background: "var(--warning-soft)", border: "1px solid rgba(216,155,34,0.2)" }}>
                    <Landmark style={{ color: "var(--warning)" }} />
                  </div>
                  <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
                    {loading ? "Evaluating eligibility..." : "No high-confidence matches found"}
                  </p>
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                    {!loading && "Check All Programs below or load more transaction data to improve matching."}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* All Schemes Directory */}
        {activeTab === "all" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSchemes.map((scheme) => (
              <div key={scheme.id} className="scheme-card p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="badge badge-success text-[10px]">Govt of India</span>
                    <span className="w-2 h-2 rounded-full" style={{ background: "var(--success)" }} />
                  </div>
                  <h4 className="font-bold mb-1.5" style={{ color: "var(--brand-900)", fontSize: "15px" }}>{scheme.name}</h4>
                  <p className="text-xs leading-relaxed line-clamp-3" style={{ color: "var(--text-muted)" }}>{scheme.description}</p>
                </div>

                <div className="pt-3 mt-3 flex items-center justify-between" style={{ borderTop: "1px solid var(--border)" }}>
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                    Max Turnover: <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{formatCurrency(scheme.maximum_turnover)}</span>
                  </span>
                  {scheme.source_url && (
                    <a href={scheme.source_url} target="_blank" rel="noreferrer"
                      className="text-xs font-semibold flex items-center gap-1 transition-opacity hover:opacity-70"
                      style={{ color: "var(--brand-700)" }}>
                      View <ExternalLink size={11} />
                    </a>
                  )}
                </div>
              </div>
            ))}
            {filteredSchemes.length === 0 && (
              <div className="col-span-2 card p-12 text-center">
                <div className="empty-state">
                  <div className="empty-state-icon">
                    <Search />
                  </div>
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>No schemes match your search.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
