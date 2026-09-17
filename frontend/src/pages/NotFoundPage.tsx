import { Link } from "react-router-dom";
import { Zap, ArrowLeft, Home } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6 text-center relative overflow-hidden"
      style={{ background: "var(--background)" }}
    >
      <div
        className="card max-w-md w-full p-8 space-y-6 relative z-10 animate-scale-up"
        style={{
          background: "#FFFFFF",
          border: "1px solid var(--border)",
          boxShadow: "0 8px 30px rgba(18, 62, 64, 0.08)",
        }}
      >
        <div
          className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center shadow-sm"
          style={{ background: "var(--brand-700)" }}
        >
          <Zap size={26} className="text-white fill-white" />
        </div>

        <div className="space-y-2">
          <p className="text-5xl font-mono font-black" style={{ color: "var(--brand-900)" }}>
            404
          </p>
          <h2 className="text-lg font-bold" style={{ color: "var(--brand-900)" }}>
            Page Not Found
          </h2>
          <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            The requested page does not exist in the FinBridge MSME Underwriting portal.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link
            to="/"
            className="btn btn-secondary text-xs flex items-center justify-center gap-2"
          >
            <Home size={14} /> Home Portal
          </Link>
          <Link
            to="/dashboard"
            className="btn btn-primary text-xs flex items-center justify-center gap-2"
            style={{ background: "var(--brand-700)" }}
          >
            <ArrowLeft size={14} /> MSME Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
