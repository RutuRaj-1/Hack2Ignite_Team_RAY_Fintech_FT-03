import { Link } from "react-router-dom";
import { Zap, ArrowLeft, Home } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6 text-center relative overflow-hidden"
      style={{ background: "var(--bg-base)" }}
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="glass-card max-w-md w-full p-8 border border-white/10 space-y-6 relative z-10 animate-scaleUp">
        <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center" style={{ background: "var(--grad-brand)" }}>
          <Zap size={28} className="text-white fill-white" />
        </div>

        <div className="space-y-2">
          <p className="text-4xl font-mono font-black text-white">404</p>
          <h2 className="text-lg font-bold text-white">Page Not Found</h2>
          <p className="text-xs text-slate-400">
            The telemetry path you requested does not exist on the FINBRIDGE MSME Underwriting node.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link to="/" className="btn btn-secondary text-xs flex items-center justify-center gap-2">
            <Home size={14} /> Home Portal
          </Link>
          <Link to="/dashboard" className="btn btn-primary text-xs flex items-center justify-center gap-2">
            <ArrowLeft size={14} /> MSME Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
