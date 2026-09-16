"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { getBusiness, updateBusiness, type BusinessResponse, ApiError } from "@/lib/api";
import {
  ShieldCheck,
  Building2,
  MapPin,
  Calendar,
  IndianRupee,
  LogOut,
  TrendingUp,
  CreditCard,
  BookOpen,
  FileCheck2,
  PieChart,
  Edit3,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { firebaseUser, dbUser, loading: authLoading, signOut, getIdToken } = useAuth();

  const [business, setBusiness] = useState<BusinessResponse | null>(null);
  const [loadingBusiness, setLoadingBusiness] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit modal state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editAge, setEditAge] = useState("");
  const [editTurnover, setEditTurnover] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);


  useEffect(() => {
    if (!authLoading && !firebaseUser) {
      router.push("/login");
      return;
    }

    let isMounted = true;
    if (firebaseUser) {
      getIdToken().then((idToken) => {
        if (!isMounted || !idToken) return;
        getBusiness(idToken)
          .then((data) => {
            if (!isMounted) return;
            setBusiness(data);
            setEditName(data.business_name);
            setEditLocation(data.location || "");
            setEditAge(data.business_age ? String(data.business_age) : "");
            setEditTurnover(data.annual_turnover || "");
          })
          .catch((err: unknown) => {
            if (!isMounted) return;
            if (err instanceof ApiError && err.statusCode === 404) {
              setBusiness(null);
            } else {
              setError("Failed to load business profile.");
            }
          })
          .finally(() => {
            if (isMounted) setLoadingBusiness(false);
          });
      });
    }

    return () => {
      isMounted = false;
    };
  }, [authLoading, firebaseUser, router, getIdToken]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingEdit(true);
    try {
      const idToken = await getIdToken();
      if (!idToken) return;

      const updated = await updateBusiness(idToken, {
        business_name: editName,
        location: editLocation || undefined,
        business_age: editAge ? parseInt(editAge, 10) : undefined,
        annual_turnover: editTurnover || undefined,
      });

      setBusiness(updated);
      setIsEditing(false);
    } catch {
      setError("Failed to update business profile.");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  if (authLoading || (firebaseUser && loadingBusiness)) {
    return (
      <div className="min-h-screen bg-[#0D1117] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  const formatCurrency = (val?: string | null) => {
    if (!val) return "Not specified";
    const num = parseFloat(val);
    if (isNaN(num)) return val;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  return (
    <div className="min-h-screen bg-[#0D1117] text-gray-100">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-[#161B22]/80 backdrop-blur-md border-b border-gray-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              FIN<span className="text-blue-500">BRIDGE</span>
            </span>
            <span className="ml-2 text-xs bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded-full font-medium hidden sm:inline-block">
              Part 06 Active • Micro-Lending
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <nav className="hidden sm:flex items-center gap-1">
              <Link
                href="/loan"
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 shadow-md transition-colors"
              >
                Loan Hub
              </Link>
              <Link
                href="/loan/simulator"
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-cyan-400 hover:text-white hover:bg-gray-800 transition-colors"
              >
                Simulator
              </Link>
              <Link
                href="/credit-profile"
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
              >
                Trust Score
              </Link>
              <Link
                href="/transactions"
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
              >
                Transactions
              </Link>
              <Link
                href="/analytics"
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
              >
                Analytics
              </Link>
              <Link
                href="/fraud-alerts"
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-colors"
              >
                Fraud Engine
              </Link>
            </nav>

            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-gray-200">
                {dbUser?.name || firebaseUser?.displayName || "MSME Owner"}
              </p>
              <p className="text-xs text-gray-500">{firebaseUser?.email}</p>
            </div>

            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800/80 hover:bg-gray-800 text-gray-300 hover:text-white text-xs font-medium border border-gray-700/80 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <p className="text-sm text-red-200">{error}</p>
          </div>
        )}

        {/* Missing business onboarding notice */}
        {!business && (
          <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border border-blue-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-white">Complete Business Onboarding</h3>
              <p className="text-sm text-gray-300 mt-1">
                Your business profile is required to calculate your alternative credit score and unlock lending limits.
              </p>
            </div>
            <Link
              href="/onboarding"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-600/25 flex items-center gap-2 shrink-0 transition-colors"
            >
              <span>Setup Business</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* Top Business Card */}
        {business && (
          <div className="mb-8 bg-[#161B22] border border-gray-800 rounded-2xl p-6 relative overflow-hidden shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                  <Building2 className="w-7 h-7 text-blue-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-2xl font-bold text-white">{business.business_name}</h2>
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" />
                      Profile Active
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mt-0.5">
                    {business.business_type || "MSME Enterprise"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-medium text-gray-200 border border-gray-700 transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-gray-400" />
                  <span>Edit Profile</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-800">
              <div className="bg-[#0D1117] p-3.5 rounded-xl border border-gray-800/80">
                <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                  <MapPin className="w-3.5 h-3.5 text-gray-500" />
                  <span>Location</span>
                </div>
                <p className="text-sm font-semibold text-gray-200">
                  {business.location || "Not specified"}
                </p>
              </div>

              <div className="bg-[#0D1117] p-3.5 rounded-xl border border-gray-800/80">
                <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                  <Calendar className="w-3.5 h-3.5 text-gray-500" />
                  <span>Business Age</span>
                </div>
                <p className="text-sm font-semibold text-gray-200">
                  {business.business_age ? `${business.business_age} Years` : "Not specified"}
                </p>
              </div>

              <div className="bg-[#0D1117] p-3.5 rounded-xl border border-gray-800/80">
                <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                  <IndianRupee className="w-3.5 h-3.5 text-gray-500" />
                  <span>Annual Turnover</span>
                </div>
                <p className="text-sm font-semibold text-emerald-400">
                  {formatCurrency(business.annual_turnover)}
                </p>
              </div>

              <div className="bg-[#0D1117] p-3.5 rounded-xl border border-gray-800/80">
                <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  <span>Credit Eligibility</span>
                </div>
                <p className="text-sm font-semibold text-blue-400">
                  Engine Ready (FT-03)
                </p>
              </div>
            </div>
          </div>
        )}

        {/* FINBRIDGE Platform Modules Grid */}
        <div>
          <h3 className="text-lg font-bold text-white mb-4">Platform Architecture Modules</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* FT-03: Micro-Lending & Credit Scoring — LIVE in Part 05 */}
            <Link
              href="/credit-profile"
              className="bg-[#161B22] border-2 border-cyan-500/40 rounded-2xl p-6 relative overflow-hidden shadow-lg group hover:border-cyan-500/70 transition-colors block"
            >
              <div className="w-10 h-10 rounded-xl bg-cyan-600/10 border border-cyan-500/30 flex items-center justify-center mb-4">
                <CreditCard className="w-5 h-5 text-cyan-400" />
              </div>
              <div className="inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 mb-2">
                Active • FT-03
              </div>
              <h4 className="text-lg font-semibold text-white">Financial Trust Score</h4>
              <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                Alternative behavioral credit score (0-100) synthesizing cash flow, consistency, expense discipline, and fraud telemetry.
              </p>
              <div className="mt-5 pt-4 border-t border-gray-800 flex items-center justify-between">
                <span className="text-xs text-cyan-400 font-medium">View Trust Profile →</span>
                <span className="text-xs bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-1 rounded">Part 05 Live</span>
              </div>
            </Link>

            {/* FT-02: Fraud Detection — LIVE in Part 04 */}
            <Link
              href="/fraud-alerts"
              className="bg-[#161B22] border-2 border-red-500/40 rounded-2xl p-6 relative group hover:border-red-500/70 transition-colors block"
            >
              <div className="w-10 h-10 rounded-xl bg-red-600/10 border border-red-500/20 flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5 text-red-400" />
              </div>
              <div className="inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-red-500/10 text-red-300 mb-2">
                Active • FT-02
              </div>
              <h4 className="text-lg font-semibold text-white">Fraud & Anomaly Shield</h4>
              <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                Real-time isolation forest and autoencoder pipeline detecting circular invoicing and forged statements.
              </p>
              <div className="mt-5 pt-4 border-t border-gray-800 flex items-center justify-between">
                <span className="text-xs text-red-400 font-medium">View Alerts →</span>
                <span className="text-xs bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-1 rounded">Part 04 Live</span>
              </div>
            </Link>

            {/* FT-01: Literacy */}
            <div className="bg-[#161B22] border border-gray-800 rounded-2xl p-6 relative group hover:border-gray-700 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center mb-4">
                <BookOpen className="w-5 h-5 text-purple-400" />
              </div>
              <div className="inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 mb-2">
                Supporting • FT-01
              </div>
              <h4 className="text-lg font-semibold text-white">AI Financial Coach</h4>
              <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                Vernacular, interactive guidance in Hindi and regional dialects tailored for small merchant credit building.
              </p>
              <div className="mt-5 pt-4 border-t border-gray-800 flex items-center justify-between">
                <span className="text-xs text-gray-400">Architecture Ready</span>
              </div>
            </div>

            {/* FT-04: Government Schemes */}
            <div className="bg-[#161B22] border border-gray-800 rounded-2xl p-6 relative group hover:border-gray-700 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-amber-600/10 border border-amber-500/20 flex items-center justify-center mb-4">
                <FileCheck2 className="w-5 h-5 text-amber-400" />
              </div>
              <div className="inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 mb-2">
                Supporting • FT-04
              </div>
              <h4 className="text-lg font-semibold text-white">Govt Scheme Discovery</h4>
              <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                Automated matching against PMEGP, CGTMSE, MUDRA loans, and state-level subsidy schemes.
              </p>
              <div className="mt-5 pt-4 border-t border-gray-800 flex items-center justify-between">
                <span className="text-xs text-gray-400">Architecture Ready</span>
              </div>
            </div>

            {/* FT-05: Expense Analytics — LIVE in Part 03 */}
            <Link
              href="/analytics"
              className="bg-[#161B22] border-2 border-emerald-500/40 rounded-2xl p-6 relative group hover:border-emerald-500/70 transition-colors block"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center mb-4">
                <PieChart className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 mb-2">
                Active • FT-05
              </div>
              <h4 className="text-lg font-semibold text-white">MSME Expense Analytics</h4>
              <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                CSV upload, categorized transactions, revenue &amp; expense trends, cash-flow volatility.
              </p>
              <div className="mt-5 pt-4 border-t border-gray-800 flex items-center justify-between">
                <span className="text-xs text-emerald-400 font-medium">Open Analytics →</span>
                <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded">Part 03 Live</span>
              </div>
            </Link>

            {/* Quick Status Box */}
            <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-500/20 rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wider mb-2">
                  <TrendingUp className="w-4 h-4" />
                  <span>Hackathon State</span>
                </div>
                <h4 className="text-base font-bold text-white">Part 04 Complete</h4>
                <p className="text-xs text-gray-400 mt-2">
                  Hybrid rule & ML engine deployed. Anomaly detection via Isolation Forest and 6 rule signals active.
                </p>
              </div>
              <div className="text-[11px] text-gray-500 mt-4">
                Database: SQLite (Dev) / PostgreSQL (Prod)
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#161B22] border border-gray-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4">Edit Business Profile</h3>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Business Name
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-[#0D1117] border border-gray-700 rounded-xl px-3.5 py-2 text-sm text-gray-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Location (City, State)
                </label>
                <input
                  type="text"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  className="w-full bg-[#0D1117] border border-gray-700 rounded-xl px-3.5 py-2 text-sm text-gray-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Years in Operation
                  </label>
                  <input
                    type="number"
                    value={editAge}
                    onChange={(e) => setEditAge(e.target.value)}
                    className="w-full bg-[#0D1117] border border-gray-700 rounded-xl px-3.5 py-2 text-sm text-gray-100 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Turnover (₹)
                  </label>
                  <input
                    type="number"
                    value={editTurnover}
                    onChange={(e) => setEditTurnover(e.target.value)}
                    className="w-full bg-[#0D1117] border border-gray-700 rounded-xl px-3.5 py-2 text-sm text-gray-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-md transition-colors cursor-pointer disabled:opacity-50"
                >
                  {savingEdit ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
