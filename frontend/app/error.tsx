"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error("[FINBRIDGE] Unhandled client error:", error);
  }, [error]);

  return (
    <main className="min-h-dvh flex items-center justify-center px-6">
      <div className="glass-card p-10 max-w-md w-full text-center space-y-6">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto"
          style={{ background: "hsl(0 84% 60% / 0.15)", border: "1px solid hsl(0 84% 60% / 0.3)" }}
        >
          <AlertCircle size={28} style={{ color: "hsl(0 84% 65%)" }} />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-[hsl(210_20%_95%)]">
            Something went wrong
          </h1>
          <p className="text-sm text-[hsl(215_16%_65%)]">
            {error.message || "An unexpected error occurred. Please try again."}
          </p>
          {error.digest && (
            <p className="mono text-xs text-[hsl(215_12%_45%)]">
              Error ID: {error.digest}
            </p>
          )}
        </div>

        <button
          id="error-retry-btn"
          onClick={reset}
          className="btn btn-primary w-full"
        >
          <RefreshCw size={16} />
          Try Again
        </button>
      </div>
    </main>
  );
}
