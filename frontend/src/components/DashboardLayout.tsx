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
  const [isMobileOpen, setIsMobileOpen] = useState(false);
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

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  if (loading || !user) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          background: "var(--background)",
        }}
      >
        <div className="spinner" />
        <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Loading FinBridge...</p>
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
      <div style={{ padding: "1.25rem", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: "0.75rem", textDecoration: "none" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              background: "var(--brand-700)",
            }}
          >
            <Zap size={17} color="white" fill="white" />
          </div>
          <div>
            <div style={{ fontSize: "15px", fontWeight: 700, letterSpacing: "-0.025em", color: "var(--brand-900)", lineHeight: 1.2 }}>
              Fin<span style={{ color: "var(--brand-600)" }}>Bridge</span>
            </div>
            <div style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)" }}>
              MSME Intelligence
            </div>
          </div>
        </Link>

        {isDemo && (
          <div
            className="mt-3"
            style={{
              marginTop: "0.75rem",
              padding: "0.375rem 0.625rem",
              borderRadius: "8px",
              fontSize: "10px",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "var(--warning-soft)",
              border: "1px solid rgba(216,155,34,0.25)",
              color: "var(--warning-text)",
            }}
          >
            <span>⚡ DEMO MODE</span>
            <span
              className="animate-pulse"
              style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--warning)" }}
            />
          </div>
        )}
      </div>

      {/* Navigation */}
      <div style={{ flex: 1, padding: "1rem 0.75rem", overflowY: "auto" }}>
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => setIsMobileOpen(false)}
              className={`nav-item${isActive ? " active" : ""}`}
            >
              <Icon className="nav-icon" size={16} />
              <span>{item.name}</span>
              {isActive && (
                <ChevronRight
                  size={13}
                  style={{ marginLeft: "auto", color: "var(--brand-600)" }}
                />
              )}
            </Link>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{ padding: "1rem", borderTop: "1px solid var(--border)", flexShrink: 0 }}>
        {/* API Status */}
        <div
          style={{
            marginBottom: "0.75rem",
            padding: "0.375rem 0.625rem",
            borderRadius: "8px",
            fontSize: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background:
              apiOnline === true
                ? "var(--success-soft)"
                : apiOnline === false
                ? "var(--danger-soft)"
                : "#EFF5F3",
            border: `1px solid ${
              apiOnline === true
                ? "rgba(22,156,115,0.2)"
                : apiOnline === false
                ? "rgba(217,101,89,0.2)"
                : "var(--border)"
            }`,
            color:
              apiOnline === true
                ? "var(--success-text)"
                : apiOnline === false
                ? "var(--danger-text)"
                : "var(--text-muted)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
            <span
              className={apiOnline === true ? "animate-pulse" : ""}
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background:
                  apiOnline === true
                    ? "var(--success)"
                    : apiOnline === false
                    ? "var(--danger)"
                    : "var(--text-muted)",
                flexShrink: 0,
              }}
            />
            <span style={{ fontWeight: 500 }}>
              {apiOnline === true
                ? "Backend Online"
                : apiOnline === false
                ? "Backend Offline"
                : "Connecting..."}
            </span>
          </div>
          <span style={{ color: "var(--text-muted)" }}>:8000</span>
        </div>

        {/* User Info */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem", padding: "0 0.25rem" }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: 700,
              fontSize: "12px",
              flexShrink: 0,
              background: "var(--brand-700)",
            }}
          >
            {user.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: "var(--text-primary)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {user.name || "MSME Owner"}
            </p>
            <p
              style={{
                fontSize: "10px",
                color: "var(--text-muted)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {user.email}
            </p>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          className="btn btn-ghost btn-sm"
          style={{ width: "100%", justifyContent: "flex-start", gap: "0.5rem" }}
        >
          <LogOut size={14} />
          Sign Out
        </button>
      </div>
    </>
  );

  return (
    <div className="dashboard-root">
      {/* Desktop Sidebar — hidden on mobile via CSS */}
      <aside className="sidebar desktop-sidebar">
        <SidebarContent />
      </aside>

      {/* Mobile Top Bar — hidden on desktop via CSS */}
      <div className="mobile-header-bar">
        <Link
          to="/"
          style={{ fontWeight: 700, fontSize: "16px", color: "var(--brand-900)", textDecoration: "none", letterSpacing: "-0.02em" }}
        >
          Fin<span style={{ color: "var(--brand-700)" }}>Bridge</span>
        </Link>
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          aria-label="Toggle navigation"
          style={{
            padding: "0.5rem",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            color: "var(--text-secondary)",
            background: isMobileOpen ? "var(--brand-50)" : "transparent",
            display: "flex",
            alignItems: "center",
          }}
        >
          {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div className="mobile-sidebar-overlay" onClick={() => setIsMobileOpen(false)}>
          <aside
            className="sidebar mobile-sidebar open"
            onClick={(e) => e.stopPropagation()}
          >
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <main className="dashboard-main">
        <div className="dashboard-content page-enter">{children}</div>
      </main>
    </div>
  );
}
