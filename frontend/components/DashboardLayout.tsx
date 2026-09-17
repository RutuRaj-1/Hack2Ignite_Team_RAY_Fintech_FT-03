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
  const { user, loading, signOut, isDemo } = useAuth();
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
      <div className="min-h-screen bg-[#090d16] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
        <p className="text-xs font-mono text-gray-400">Loading FINBRIDGE Platform...</p>
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
      <div className="p-5 border-b-2 border-[#222f46] bg-[#0c101c]">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_#000]">
            <span className="text-white font-black text-base">F</span>
          </div>
          <div>
            <h1 className="text-base font-black text-white tracking-tight flex items-center">
              FIN<span className="text-blue-500">BRIDGE</span>
            </h1>
            <p className="text-[10px] font-mono text-gray-400 uppercase tracking-wider font-bold">MSME Engine FT-03</p>
          </div>
        </Link>

        {isDemo && (
          <div className="mt-3 py-1 px-2 rounded bg-amber-500/15 border border-amber-500/40 text-[10px] font-mono font-bold text-amber-400 flex items-center justify-between">
            <span>DEMO MODE ACTIVE</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          </div>
        )}
      </div>
      
      <div className="flex-1 py-5 px-3 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.href}
              href={item.href}
              onClick={() => setIsMobileOpen(false)}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                isActive 
                  ? "bg-blue-600 text-white border-2 border-black shadow-[3px_3px_0px_0px_#000]" 
                  : "text-gray-300 hover:text-white hover:bg-[#161f30] border-2 border-transparent hover:border-[#222f46]"
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.name}
            </Link>
          );
        })}
      </div>
      
      <div className="p-4 border-t-2 border-[#222f46] bg-[#0c101c]">
        <div className="flex items-center gap-3 px-1 mb-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 border-2 border-black flex items-center justify-center text-white font-bold text-xs shadow-[2px_2px_0px_0px_#000]">
            {user.name?.charAt(0) || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">{user.name || "MSME Owner"}</p>
            <p className="text-[10px] font-mono text-gray-400 truncate">{user.email}</p>
          </div>
        </div>
        <button 
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white bg-[#151d2e] hover:bg-red-500/20 hover:text-red-400 border border-[#222f46] transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          Exit / Sign Out
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#090d16] flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col fixed inset-y-0 left-0 bg-[#0f1422] border-r-2 border-[#222f46] z-20">
        <SidebarContent />
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#0f1422] border-b-2 border-[#222f46] z-30 flex items-center justify-between px-4">
        <Link href="/" className="font-black text-lg text-white">
          FIN<span className="text-blue-500">BRIDGE</span>
        </Link>
        <button 
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 text-gray-400 hover:text-white cursor-pointer"
        >
          {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Sidebar overlay */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsMobileOpen(false)} />
          <aside className="relative w-64 max-w-[80%] bg-[#0f1422] border-r-2 border-[#222f46] flex flex-col pt-16">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 pt-16 md:pt-0 min-h-screen flex flex-col">
        <div className="p-4 sm:p-6 lg:p-8 flex-1 w-full max-w-7xl mx-auto space-y-6">
          {children}
        </div>
      </main>
    </div>
  );
}
