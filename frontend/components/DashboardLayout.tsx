"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  X
} from "lucide-react";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Transactions", href: "/transactions", icon: Receipt },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
    { name: "Fraud & Risk", href: "/fraud-alerts", icon: ShieldAlert },
    { name: "Trust Score", href: "/credit-profile", icon: Target },
    { name: "Micro-Loan", href: "/loan", icon: Briefcase },
    { name: "Schemes", href: "/schemes", icon: Landmark },
    { name: "AI Coach", href: "/financial-coach", icon: Bot },
  ];

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const SidebarContent = () => (
    <>
      <div className="p-6 border-b border-white/10">
        <h1 className="text-xl font-bold gradient-text tracking-tight">FINBRIDGE</h1>
        <p className="text-xs text-gray-400 mt-1">AI Financial Intelligence</p>
      </div>
      
      <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.href}
              href={item.href}
              onClick={() => setIsMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                isActive 
                  ? "bg-blue-600/15 text-blue-400 font-medium" 
                  : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </div>
      
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-gradient-brand flex items-center justify-center text-white font-bold text-sm">
            {user.name?.charAt(0) || user.email?.charAt(0) || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user.name || "User"}</p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>
        </div>
        <button 
          onClick={handleSignOut}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#0D1117] flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col fixed inset-y-0 left-0 bg-[#161B22] border-r border-white/5 z-20">
        <SidebarContent />
      </aside>

      {/* Mobile Header & Sidebar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#161B22] border-b border-white/5 z-30 flex items-center justify-between px-4">
        <h1 className="text-lg font-bold gradient-text">FINBRIDGE</h1>
        <button 
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 -mr-2 text-gray-400 hover:text-white"
        >
          {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-20 flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileOpen(false)} />
          <aside className="relative w-64 max-w-[80%] bg-[#161B22] border-r border-white/5 flex flex-col pt-16">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 md:ml-64 pt-16 md:pt-0 min-h-screen flex flex-col relative overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] -z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-violet-600/10 rounded-full blur-[120px] -z-10 pointer-events-none" />
        
        <div className="p-4 md:p-8 flex-1 w-full max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
