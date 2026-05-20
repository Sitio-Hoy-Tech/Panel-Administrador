"use client";

import { Sidebar } from "@/components/emprendimiento/Sidebar";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { usePathname } from "next/navigation";
import Image from "next/image";

export default function EmprendimientoLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const [userName, setUserName] = useState("Usuario");
  const [storeUrl, setStoreUrl] = useState<string | null | undefined>(undefined);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: userTenant } = await supabase
          .from("user_tenants")
          .select("tenant_id")
          .eq("user_id", user.id)
          .single();

        if (userTenant?.tenant_id) {
          const { data: tenant } = await supabase
            .from("tenants")
            .select("name, url")
            .eq("id", userTenant.tenant_id)
            .single();

          if (tenant?.name) setUserName(tenant.name);
          setStoreUrl(tenant?.url ?? null);
          if (tenant?.name) return;
        }

        const name = user.email?.split('@')[0] || "Usuario";
        setUserName(name);
        setStoreUrl(null);
      }
    };
    getUser();
  }, [supabase]);

  // Si estamos en el login, no mostramos el layout del dashboard
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col lg:flex-row h-svh w-full p-0 lg:p-6 gap-0 lg:gap-6 relative z-10 overflow-hidden bg-transparent">
      {/* Mobile & Tablet Header */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-slate-950/40 backdrop-blur-md border-b border-white/[0.05] relative z-50">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-emerald-500/20 via-teal-500/25 to-emerald-400/10 flex items-center justify-center border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.15)]">
            <span className="text-emerald-400 font-bold text-xs drop-shadow-[0_0_4px_rgba(16,185,129,0.4)]">{userName.charAt(0).toUpperCase()}</span>
          </div>
          <span className="font-bold text-white tracking-tight truncate max-w-[150px] md:max-w-none">{userName}</span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-slate-400 hover:text-white transition-colors"
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar - Desktop & Tablet/Mobile Overlay */}
      <div className={`
        fixed inset-0 z-40 lg:relative lg:inset-auto lg:z-auto
        ${isMobileMenuOpen ? 'visible' : 'invisible lg:visible'}
        transition-[visibility] duration-300
      `}>
        {/* Backdrop for mobile/tablet */}
        <div
          className={`
            lg:hidden fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300
            ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0'}
          `}
          onClick={() => setIsMobileMenuOpen(false)}
        />

        <div className={`
          relative z-50 h-full bg-slate-950/80 backdrop-blur-xl lg:bg-transparent border-r border-white/[0.05] lg:border-none w-64 flex-shrink-0 
          transition-transform duration-500 ease-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <Sidebar userName={userName} storeUrl={storeUrl} onLinkClick={() => setIsMobileMenuOpen(false)} />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0 h-full relative group overflow-hidden lg:p-0 lg:rounded-[2rem]">
        <div className="hidden lg:block absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 rounded-[2.5rem] pointer-events-none"></div>
        <main className="h-full bg-slate-950/30 backdrop-blur-md lg:rounded-[2rem] border-x-0 lg:border border-white/[0.07] shadow-[0_0_40px_rgba(0,0,0,0.8)] overflow-y-auto hide-scrollbar relative z-10">
          <div className="p-6 md:p-10 lg:p-12">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
