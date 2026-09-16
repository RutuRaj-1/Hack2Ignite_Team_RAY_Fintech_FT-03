"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { createBusiness, ApiError } from "@/lib/api";
import {
  Building2,
  MapPin,
  Calendar,
  IndianRupee,
  Briefcase,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Check,
} from "lucide-react";

const BUSINESS_TYPES = [
  "Retail & Kirana",
  "Manufacturing & Production",
  "Wholesale & Distribution",
  "Professional Services",
  "Food & Beverage / Restaurant",
  "Logistics & Transport",
  "Textile & Apparel",
  "Healthcare & Pharma",
  "Information Technology",
  "Agriculture & Allied",
  "Other MSME",
];

export default function OnboardingPage() {
  const router = useRouter();
  const { firebaseUser, dbUser, loading: authLoading, getIdToken } = useAuth();

  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState(BUSINESS_TYPES[0]);
  const [location, setLocation] = useState("");
  const [businessAge, setBusinessAge] = useState("");
  const [annualTurnover, setAnnualTurnover] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Route protection: if auth done and no user, send to login
  useEffect(() => {
    if (!authLoading && !firebaseUser) {
      router.push("/login");
    }
    // If user already has business profile created, go to dashboard
    if (!authLoading && dbUser?.has_business) {
      router.push("/dashboard");
    }
  }, [authLoading, firebaseUser, dbUser, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!businessName.trim()) {
      setError("Please enter your registered business or trade name.");
      return;
    }

    setSubmitting(true);

    try {
      const idToken = await getIdToken();
      if (!idToken) {
        throw new Error("Authentication session expired. Please log in again.");
      }

      await createBusiness(idToken, {
        business_name: businessName.trim(),
        business_type: businessType,
        location: location.trim() || undefined,
        business_age: businessAge ? parseInt(businessAge, 10) : undefined,
        annual_turnover: annualTurnover ? annualTurnover.trim() : undefined,
      });

      // Successful onboarding -> Dashboard
      router.push("/dashboard");
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.statusCode === 409) {
          // Already created -> proceed to dashboard
          router.push("/dashboard");
          return;
        }
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to save business profile. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0D1117] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0D1117] text-gray-100 py-12 px-4 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-2xl mx-auto z-10 relative">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              FIN<span className="text-blue-500">BRIDGE</span>
            </span>
          </div>
          <h1 className="text-3xl font-bold text-white">Setup Your Business Profile</h1>
          <p className="text-sm text-gray-400 mt-1.5">
            This information powers our AI alternative credit scoring engine (FT-03)
          </p>
        </div>

        {/* Stepper */}
        <div className="mb-8 bg-[#161B22]/80 border border-gray-800 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            {/* Step 1 */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-xs font-bold">
                <Check className="w-4 h-4" />
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-semibold text-emerald-400">Step 1</p>
                <p className="text-xs text-gray-400">Account Created</p>
              </div>
            </div>

            <div className="flex-1 h-0.5 bg-blue-600/30 mx-3" />

            {/* Step 2 */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-lg shadow-blue-500/30">
                2
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-semibold text-blue-400">Step 2</p>
                <p className="text-xs text-gray-300">Business Details</p>
              </div>
            </div>

            <div className="flex-1 h-0.5 bg-gray-800 mx-3" />

            {/* Step 3 */}
            <div className="flex items-center gap-3 opacity-50">
              <div className="w-8 h-8 rounded-full bg-gray-800 text-gray-400 border border-gray-700 flex items-center justify-center text-xs font-bold">
                3
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-semibold text-gray-500">Step 3</p>
                <p className="text-xs text-gray-500">Credit Decision</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-[#161B22]/90 border border-gray-800 backdrop-blur-xl rounded-2xl p-8 shadow-2xl">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm text-red-200">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Business Name */}
            <div>
              <label className="block text-xs font-medium text-gray-300 uppercase tracking-wider mb-2">
                Business / Enterprise Name <span className="text-blue-400">*</span>
              </label>
              <div className="relative">
                <Building2 className="w-5 h-5 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Omkar Enterprises & Logistics"
                  className="w-full bg-[#0D1117] border border-gray-700/80 rounded-xl pl-11 pr-4 py-3 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* Business Type */}
            <div>
              <label className="block text-xs font-medium text-gray-300 uppercase tracking-wider mb-2">
                Industry / Business Sector
              </label>
              <div className="relative">
                <Briefcase className="w-5 h-5 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  className="w-full bg-[#0D1117] border border-gray-700/80 rounded-xl pl-11 pr-4 py-3 text-sm text-gray-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors appearance-none cursor-pointer"
                >
                  {BUSINESS_TYPES.map((type) => (
                    <option key={type} value={type} className="bg-[#161B22] text-gray-200">
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Location */}
              <div>
                <label className="block text-xs font-medium text-gray-300 uppercase tracking-wider mb-2">
                  Operating Location (City, State)
                </label>
                <div className="relative">
                  <MapPin className="w-5 h-5 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Pune, Maharashtra"
                    className="w-full bg-[#0D1117] border border-gray-700/80 rounded-xl pl-11 pr-4 py-3 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                </div>
              </div>

              {/* Business Age */}
              <div>
                <label className="block text-xs font-medium text-gray-300 uppercase tracking-wider mb-2">
                  Years in Operation
                </label>
                <div className="relative">
                  <Calendar className="w-5 h-5 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={businessAge}
                    onChange={(e) => setBusinessAge(e.target.value)}
                    placeholder="e.g. 4"
                    className="w-full bg-[#0D1117] border border-gray-700/80 rounded-xl pl-11 pr-4 py-3 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Annual Turnover */}
            <div>
              <label className="block text-xs font-medium text-gray-300 uppercase tracking-wider mb-2">
                Estimated Annual Turnover (₹ INR)
              </label>
              <div className="relative">
                <IndianRupee className="w-5 h-5 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={annualTurnover}
                  onChange={(e) => setAnnualTurnover(e.target.value)}
                  placeholder="e.g. 1850000"
                  className="w-full bg-[#0D1117] border border-gray-700/80 rounded-xl pl-11 pr-4 py-3 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1.5">
                Approximate annual gross revenue. Used by our micro-lending risk model.
              </p>
            </div>

            {/* Submit */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 transition-all hover:shadow-blue-600/40 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Business Profile...</span>
                  </>
                ) : (
                  <>
                    <span>Complete Onboarding & Enter Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
