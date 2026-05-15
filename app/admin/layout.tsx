"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { usePathname } from "next/navigation";
import Image from "next/image";

import EsencialLayout from "./_plans/esencial/layout";
import EmprendimientoLayout from "./_plans/emprendimiento/layout";
import EmpresaLayout from "./_plans/empresa/layout";

type PlanType = "esencial" | "emprendimiento" | "empresa";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [plan, setPlan] = useState<PlanType | null>(null);
  const pathname = usePathname();
  const supabase = createClient();

  const detectPlan = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setPlan(null);
      return;
    }

    const { data: userTenant } = await supabase
      .from("user_tenants")
      .select("tenant_id")
      .eq("user_id", user.id)
      .single();

    if (!userTenant?.tenant_id) {
      setPlan("esencial");
      return;
    }

    const { data: tenant } = await supabase
      .from("tenants")
      .select("plan")
      .eq("id", userTenant.tenant_id)
      .single();

    const planRaw = (tenant?.plan || "").toLowerCase().trim();
    if (planRaw.includes("empresa")) {
      setPlan("empresa");
    } else if (planRaw.includes("emprendimiento")) {
      setPlan("emprendimiento");
    } else {
      setPlan("esencial");
    }
  }, [supabase]);

  // Detectar plan al montar y cuando cambia el auth
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      detectPlan();
    });
    return () => subscription.unsubscribe();
  }, [supabase, detectPlan]);

  // Re-detectar plan cuando cambia la ruta (ej: login → dashboard)
  useEffect(() => {
    detectPlan();
  }, [pathname, detectPlan]);

  // En login: renderizar children directamente (sin layout de plan)
  // En otras rutas sin plan aún: mostrar loader premium
  if (!plan) {
    if (pathname === "/admin/login") return <>{children}</>;
    return (
      <div className="flex items-center justify-center h-svh w-full bg-[#030303] relative overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/5 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
        
        <div className="flex flex-col items-center gap-8 relative z-10">
          <div className="relative h-20 w-20">
            {/* Pulsing ring around the logo */}
            <div className="absolute -inset-4 rounded-full border border-white/10 animate-[ping_3s_linear_infinite]"></div>
            <div className="absolute -inset-2 rounded-full border border-white/5 animate-[ping_2s_linear_infinite]"></div>
            
            <div className="relative h-full w-full transition-all duration-700">
              <Image
                src="/logo-sitiohoy.png"
                alt="SitioHoy Logo"
                fill
                className="object-contain animate-[pulse_2s_ease-in-out_infinite]"
                priority
              />
            </div>
          </div>

          <div className="flex flex-col items-center gap-2">
            <span className="text-xs font-bold text-white tracking-[0.3em] uppercase opacity-50">
              SitioHoy
            </span>
            <div className="flex items-center gap-1.5">
              <div className="h-1 w-1 rounded-full bg-white animate-bounce [animation-delay:-0.3s]"></div>
              <div className="h-1 w-1 rounded-full bg-white animate-bounce [animation-delay:-0.15s]"></div>
              <div className="h-1 w-1 rounded-full bg-white animate-bounce"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  switch (plan) {
    case "esencial":
      return <EsencialLayout>{children}</EsencialLayout>;
    case "emprendimiento":
      return <EmprendimientoLayout>{children}</EmprendimientoLayout>;
    case "empresa":
      return <EmpresaLayout>{children}</EmpresaLayout>;
  }
}
