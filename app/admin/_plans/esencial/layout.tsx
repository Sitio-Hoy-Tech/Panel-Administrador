"use client";

import { Sidebar } from "@/components/esencial/Sidebar";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { usePathname } from "next/navigation";
import Image from "next/image";

export default function EsencialLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const [userName, setUserName] = useState("Usuario");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const name = user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split('@')[0] || "Usuario";
        setUserName(name);
      }
    };
    getUser();
  }, [supabase]);

  // Si estamos en el login, no mostramos el layout del dashboard
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col lg:flex-row h-svh w-full p-0 lg:p-6 gap-0 lg:gap-6 relative z-10 overflow-hidden bg-black">
      {/* Mobile & Tablet Header */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-[#0A0A0A] border-b border-white/5 relative z-50">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-white to-zinc-400 flex items-center justify-center">
            <span className="text-black font-bold text-sm">{userName.charAt(0).toUpperCase()}</span>
          </div>
          <span className="font-bold text-white tracking-tight truncate max-w-[150px] md:max-w-none">{userName}</span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-zinc-400 hover:text-white transition-colors"
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
          relative z-50 h-full bg-[#0A0A0A] lg:bg-transparent border-r border-white/5 lg:border-none w-64 flex-shrink-0 
          transition-transform duration-500 ease-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <Sidebar userName={userName} onLinkClick={() => setIsMobileMenuOpen(false)} />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 h-full relative group overflow-hidden lg:p-0">
        <div className="hidden lg:block absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 rounded-[2.5rem] pointer-events-none"></div>
        <main className="h-full bg-[#0A0A0A]/80 backdrop-blur-3xl lg:rounded-[2rem] border-x-0 lg:border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.8)] overflow-y-auto hide-scrollbar relative z-10">
          {/* Watermark Logo - Bottom Corner (Hidden in forms) */}
          {!(pathname.includes("/admin/productos/crear") || pathname.includes("/admin/productos/editar")) && (
            <div className="fixed lg:absolute bottom-6 right-6 opacity-[0.15] pointer-events-none select-none z-10 transition-all duration-500 group-hover:opacity-30 group-hover:scale-110">
              <Image 
                src="/logo-sitiohoy.png" 
                alt="SitioHoy Logo" 
                width={100} 
                height={100} 
                className="object-contain"
              />
            </div>
          )}
          
          <div className="p-6 md:p-10 lg:p-12">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
