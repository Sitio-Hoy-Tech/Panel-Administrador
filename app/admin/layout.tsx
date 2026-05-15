"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

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
  const supabase = createClient();

  useEffect(() => {
    const detectPlan = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setPlan("esencial"); // fallback
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
    };
    detectPlan();
  }, [supabase]);

  // Mientras carga el plan, no renderizar nada (evita flash)
  if (!plan) return null;

  switch (plan) {
    case "esencial":
      return <EsencialLayout>{children}</EsencialLayout>;
    case "emprendimiento":
      return <EmprendimientoLayout>{children}</EmprendimientoLayout>;
    case "empresa":
      return <EmpresaLayout>{children}</EmpresaLayout>;
  }
}
