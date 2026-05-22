"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { createClient as createCrmClient } from "@supabase/supabase-js";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";

import EsencialLayout from "./_plans/esencial/layout";
import EmprendimientoLayout from "./_plans/emprendimiento/layout";
import EmpresaLayout from "./_plans/empresa/layout";
import SupportChat from "@/components/shared/SupportChat";
import { SubscriptionContext } from "@/components/shared/SubscriptionContext";

type PlanType = "esencial" | "emprendimiento" | "empresa";

const ALLOWED_WHEN_EXPIRED = ["/admin/mi-plan", "/admin/soporte"];

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [plan, setPlan] = useState<PlanType | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [subscriptionExpired, setSubscriptionExpired] = useState(false);
  const [subscriptionAtRisk, setSubscriptionAtRisk] = useState(false);
  const [graceDaysLeft, setGraceDaysLeft] = useState(0);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const detectPlan = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setPlan(null);
      return;
    }

    // JOIN en una sola consulta en vez de dos secuenciales
    const { data } = await supabase
      .from("user_tenants")
      .select("tenant_id, tenants(plan)")
      .eq("user_id", user.id)
      .single();

    if (!data?.tenant_id) {
      setPlan("esencial");
      return;
    }

    const planRaw = ((data.tenants as any)?.plan || "").toLowerCase().trim();
    if (planRaw.includes("empresa")) {
      setPlan("empresa");
    } else if (planRaw.includes("emprendimiento")) {
      setPlan("emprendimiento");
    } else {
      setPlan("esencial");
    }

    // Verificar vencimiento de suscripción en el CRM
    const crm = createCrmClient(
      process.env.NEXT_PUBLIC_CRM_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_CRM_SUPABASE_ANON_KEY!
    );
    const { data: clienteData } = await crm
      .from("clientes")
      .select("fecha_vencimiento, mp_init_point")
      .eq("tenant_id", data.tenant_id)
      .single();

    if (clienteData?.mp_init_point) {
      setPaymentUrl(clienteData.mp_init_point);
    }

    if (clienteData?.fecha_vencimiento) {
      const now = new Date();
      const vencimiento = new Date(clienteData.fecha_vencimiento);
      const graceEnd = new Date(vencimiento);
      graceEnd.setDate(graceEnd.getDate() + 5);
      setSubscriptionExpired(now > graceEnd);
      const inGrace = now > vencimiento && now <= graceEnd;
      setSubscriptionAtRisk(inGrace);
      if (inGrace) {
        setGraceDaysLeft(Math.ceil((graceEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
      }
    }
  }, [supabase]);

  // Redirigir si la suscripción venció y el usuario intenta acceder a una sección bloqueada
  useEffect(() => {
    if (subscriptionExpired && !ALLOWED_WHEN_EXPIRED.some(p => pathname.startsWith(p))) {
      router.replace("/admin/mi-plan");
    }
  }, [subscriptionExpired, pathname, router]);

  // onAuthStateChange dispara inmediatamente con la sesión actual (INITIAL_SESSION),
  // cubriendo el montaje inicial y los cambios de auth sin necesidad de effects adicionales.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      detectPlan();
      setAccessToken(session?.access_token ?? null);
    });
    return () => subscription.unsubscribe();
  }, [supabase, detectPlan]);

  // En login: renderizar children directamente (sin layout de plan)
  // En otras rutas sin plan aún: mostrar loader premium
  if (!plan) {
    if (pathname === "/admin/login") return <>{children}</>;
    return (
      <div className="flex items-center justify-center h-svh w-full bg-transparent relative overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/5 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>

        <div className="flex flex-col items-center gap-8 relative z-10">
          <div className="relative h-20 w-20">
            {/* Pulsing ring around the logo */}
            <div className="absolute -inset-4 rounded-full border border-white/[0.07] animate-[ping_3s_linear_infinite]"></div>
            <div className="absolute -inset-2 rounded-full border border-white/[0.05] animate-[ping_2s_linear_infinite]"></div>

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

  const chat = accessToken ? <SupportChat accessToken={accessToken} /> : null;

  switch (plan) {
    case "esencial":
      return <SubscriptionContext.Provider value={{ expired: subscriptionExpired, atRisk: subscriptionAtRisk, graceDaysLeft, paymentUrl }}><EsencialLayout>{children}</EsencialLayout>{chat}</SubscriptionContext.Provider>;
    case "emprendimiento":
      return <SubscriptionContext.Provider value={{ expired: subscriptionExpired, atRisk: subscriptionAtRisk, graceDaysLeft, paymentUrl }}><EmprendimientoLayout>{children}</EmprendimientoLayout>{chat}</SubscriptionContext.Provider>;
    case "empresa":
      return <SubscriptionContext.Provider value={{ expired: subscriptionExpired, atRisk: subscriptionAtRisk, graceDaysLeft, paymentUrl }}><EmpresaLayout>{children}</EmpresaLayout>{chat}</SubscriptionContext.Provider>;
  }
}
