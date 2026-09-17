import React, { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
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
} from "lucide-react";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, signOut, isDemo } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: "var(--bg-base)" }}>
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-2 border-blue-500/20"></div>
          <div className="absolute inset-0 rounded-full border-t-2 border-blue-500 animate-spin"></div>
        </div>
        <p className="text-sm font-mono text-slate-400">Loading FINBRIDGE Platform...</p>
      </div>
    );
  }

  const navItems = [
    { name: "Dashboard",    href: "/dashboard",       icon: LayoutDashboard },
    { name: "Transactions", href: "/transactions",     icon: Receipt },
    { name: "Analytics",    href: "/analytics",        icon: BarChart3 },
    { name: "Fraud & Risk", href: "/fraud-alerts",     icon: ShieldAlert },
    { name: "Trust Score",  href: "/credit-profile",   icon: Target },
    { name: "Micro-Loan",   href: "/loan",             icon: Briefcase },
    { name: "Schemes",      href: "/schemes",          icon: Landmark },
    { name: "AI Coach",     href: "/financial-coach",  icon: Bot },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const pathname = location.pathname;

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="p-5 border-b" style={{ borderColor: "var(--border-subtle)" }}>
        <Link to="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "var(--grad-brand)" }}>
            <Zap size={18} className="text-white fill-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight">
              FIN<span className="text-blue-400">BRIDGE</span>
            </h1>
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">MSME Engine FT-03</p>
          </div>
        </Link>

        {isDemo && (
          <div className="mt-3 px-2.5 py-1.5 rounded-lg text-[10px] font-mono font-bold text-amber-400 flex items-center justify-between"
            style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)" }}>
            <span>⚡ DEMO MODE</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
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
              <Icon className={`nav-icon w-4 h-4 ${isActive ? "text-blue-400" : "text-slate-500"}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>

      {/* User Footer */}
      <div className="p-4 border-t" style={{ borderColor: "var(--border-subtle)" }}>
        <div className="flex items-center gap-3 mb-3 px-1">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
            style={{ background: "var(--grad-brand)" }}>
            {user.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">{user.name || "MSME Owner"}</p>
            <p className="text-[10px] font-mono text-slate-500 truncate">{user.email}</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="btn btn-danger btn-sm w-full"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg-base)" }}>
      {/* Desktop Sidebar */}
      <aside className="sidebar hidden md:flex flex-col">
        <SidebarContent />
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 z-50 flex items-center justify-between px-4"
        style={{ background: "rgba(3,7,18,0.95)", borderBottom: "1px solid var(--border-subtle)", backdropFilter: "blur(20px)" }}>
        <Link to="/" className="font-bold text-lg text-white">
          FIN<span className="text-blue-400">BRIDGE</span>
        </Link>
        <button onClick={() => setIsMobileOpen(!isMobileOpen)} className="p-2 text-slate-400 hover:text-white transition-colors">
          {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Sidebar */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="sidebar-overlay" onClick={() => setIsMobileOpen(false)} />
          <aside className="sidebar relative flex flex-col pt-14 w-64">
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
