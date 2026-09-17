"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { DashboardLayout } from "@/components/DashboardLayout";
import { SchemeCard } from "@/components/ui/SchemeCard";
import { getSchemeMatches, SchemeMatchResponse } from "@/lib/api";
import {
  Landmark,
  HelpCircle,
  ShieldCheck,
  Loader2,
} from "lucide-react";

export default function GovernmentSchemesPage() {
  const { firebaseUser, getIdToken, authLoading } = useAuth();

  const [matches, setMatches] = useState<SchemeMatchResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!firebaseUser) {
        setLoading(false);
        return;
      }
      const fetchMatches = async () => {
        const token = await getIdToken();
        if (!token) {
          setLoading(false);
          return;
        }
        setLoading(true);
        try {
          const res = await getSchemeMatches(token);
          setMatches(res.matches || []);
        } catch (error) {
          console.error("Error fetching scheme matches:", error);
        } finally {
          setLoading(false);
        }
      };
      
      fetchMatches();
    }
  }, [firebaseUser, authLoading, getIdToken]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-[80vh] items-center justify-center">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-10">
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
        {matches.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl bg-white/5">
            <ShieldCheck className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-300">No schemes matched</h3>
            <p className="text-gray-500 text-sm mt-1">
              Please ensure your business profile is fully updated to discover eligible schemes.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {matches.map((match) => (
              <SchemeCard key={match.id} match={match} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
