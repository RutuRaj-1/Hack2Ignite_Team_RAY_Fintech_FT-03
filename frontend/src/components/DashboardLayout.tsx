import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { checkHealth } from "@/lib/api";
import {
  LayoutDashboard,
  Receipt,
  BarChart3,
  ShieldAlert,
  Target,
  Briefcase,
  Landmark,
  Bot,
  LogOut,
  Menu,
  X,
  Zap,
  Calculator,
  ChevronRight,
} from "lucide-react";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, signOut, isDemo } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    let mounted = true;
    const verifyApi = async () => {
      try {
        await checkHealth();
        if (mounted) setApiOnline(true);
      } catch {
        if (mounted) setApiOnline(false);
      }
    };
    verifyApi();
    const interval = setInterval(verifyApi, 30000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: "var(--background)" }}>
        <div className="spinner" />
        <p className="text-sm text-body" style={{ color: "var(--text-muted)" }}>Loading FinBridge...</p>
      </div>
    );
  }

  const navItems = [
    { name: "Dashboard",      href: "/dashboard",       icon: LayoutDashboard },
    { name: "Transactions",   href: "/transactions",    icon: Receipt },
    { name: "Analytics",      href: "/analytics",       icon: BarChart3 },
    { name: "Fraud & Risk",   href: "/fraud-alerts",    icon: ShieldAlert },
    { name: "Trust Score",    href: "/credit-profile",  icon: Target },
    { name: "Micro-Loan",     href: "/loan",            icon: Briefcase },
    { name: "Loan Simulator", href: "/loan/simulator",  icon: Calculator },
    { name: "Schemes",        href: "/schemes",         icon: Landmark },
    { name: "AI Coach",       href: "/financial-coach", icon: Bot },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const pathname = location.pathname;

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="p-5" style={{ borderBottom: "1px solid var(--border)" }}>
        <Link to="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "var(--brand-700)" }}>
            <Zap size={17} className="text-white fill-white" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight" style={{ color: "var(--brand-900)", letterSpacing: "-0.025em" }}>
              Fin<span style={{ color: "var(--brand-600)" }}>Bridge</span>
            </h1>
            <p className="text-[10px] uppercase tracking-wider" style={{ color: "var(--text-muted)", fontSize: "10px", letterSpacing: "0.06em" }}>MSME Intelligence</p>
          </div>
        </Link>

        {isDemo && (
          <div className="mt-3 px-2.5 py-1.5 rounded-lg text-[10px] font-bold flex items-center justify-between"
            style={{ background: "var(--warning-soft)", border: "1px solid rgba(216,155,34,0.25)", color: "var(--warning-text)" }}>
            <span>⚡ DEMO MODE</span>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "var(--warning)" }} />
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 py-4 px-3 overflow-y-auto space-y-0.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => setIsMobileOpen(false)}
              className={`nav-item ${isActive ? "active" : ""}`}
            >
              <Icon className={`nav-icon w-4 h-4`} />
              <span>{item.name}</span>
              {isActive && <ChevronRight size={13} className="ml-auto" style={{ color: "var(--brand-600)" }} />}
            </Link>
          );
        })}
      </div>

      {/* User Footer */}
      <div className="p-4" style={{ borderTop: "1px solid var(--border)" }}>
        {/* API Status */}
        <div className="mb-3 px-2.5 py-1.5 rounded-lg text-[10px] flex items-center justify-between"
          style={{
            background: apiOnline === true ? "var(--success-soft)" : apiOnline === false ? "var(--danger-soft)" : "#EFF5F3",
            border: `1px solid ${apiOnline === true ? "rgba(22,156,115,0.2)" : apiOnline === false ? "rgba(217,101,89,0.2)" : "var(--border)"}`,
            color: apiOnline === true ? "var(--success-text)" : apiOnline === false ? "var(--danger-text)" : "var(--text-muted)",
          }}>
          <div className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${apiOnline === true ? "animate-pulse" : ""}`}
              style={{ background: apiOnline === true ? "var(--success)" : apiOnline === false ? "var(--danger)" : "var(--text-muted)" }} />
            <span className="font-medium">
              {apiOnline === true ? "Backend Online" : apiOnline === false ? "Backend Offline" : "Connecting..."}
            </span>
          </div>
          <span style={{ color: "var(--text-muted)" }}>:8000</span>
        </div>

        {/* User Info */}
        <div className="flex items-center gap-3 mb-3 px-1">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
            style={{ background: "var(--brand-700)" }}>
            {user.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate" style={{ color: "var(--text-primary)" }}>{user.name || "MSME Owner"}</p>
            <p className="text-[10px] truncate" style={{ color: "var(--text-muted)" }}>{user.email}</p>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          className="btn btn-ghost btn-sm w-full"
          style={{ justifyContent: "flex-start", gap: "0.5rem" }}
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex" style={{ background: "var(--background)" }}>
      {/* Desktop Sidebar */}
      <aside className="sidebar hidden md:flex flex-col">
        <SidebarContent />
      </aside>

      {/* Mobile Header */}
      <div className="mobile-header md:hidden">
        <Link to="/" className="font-bold text-base" style={{ color: "var(--brand-900)", letterSpacing: "-0.02em" }}>
          Fin<span style={{ color: "var(--brand-700)" }}>Bridge</span>
        </Link>
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 rounded-lg transition-colors"
          style={{ color: "var(--text-secondary)", background: isMobileOpen ? "var(--brand-50)" : "transparent" }}
          aria-label="Toggle navigation"
        >
          {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Sidebar */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="sidebar-overlay" onClick={() => setIsMobileOpen(false)} />
          <aside className="sidebar relative flex flex-col pt-14 w-64 open">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 md:ml-[260px] pt-14 md:pt-0 min-h-screen flex flex-col">
        <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full page-enter">
          {children}
        </div>
      </main>
    </div>
  );
}
