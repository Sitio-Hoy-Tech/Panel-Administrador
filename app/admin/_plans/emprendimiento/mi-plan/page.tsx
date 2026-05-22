import { CheckCircle2, AlertTriangle, XCircle, CreditCard, TrendingUp, Truck, BarChart3 } from "lucide-react";
import Image from "next/image";
import { getCurrentTenant } from "@/utils/auth";
import { createClient } from "@supabase/supabase-js";

type SubscriptionStatus = "active" | "at_risk" | "expired";

export default async function MiPlanPage() {
  const tenantId = await getCurrentTenant();
  let nextPaymentDate: string | null = null;
  let gracePeriodEndDate: string | null = null;
  let subscriptionStatus: SubscriptionStatus = "active";

  if (tenantId) {
    const crmSupabase = createClient(
      process.env.NEXT_PUBLIC_CRM_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_CRM_SUPABASE_ANON_KEY!
    );
    const { data } = await crmSupabase
      .from("clientes")
      .select("fecha_vencimiento")
      .eq("tenant_id", tenantId)
      .single();

    if (data?.fecha_vencimiento) {
      const vencimiento = new Date(data.fecha_vencimiento);
      const now = new Date();
      const graceEnd = new Date(vencimiento);
      graceEnd.setDate(graceEnd.getDate() + 5);

      const fmt = (d: Date) => d.toLocaleDateString("es-AR", {
        day: "2-digit", month: "2-digit", year: "numeric",
        timeZone: "America/Argentina/Buenos_Aires",
      });

      nextPaymentDate = fmt(vencimiento);
      gracePeriodEndDate = fmt(graceEnd);

      if (now > graceEnd) subscriptionStatus = "expired";
      else if (now > vencimiento) subscriptionStatus = "at_risk";
    }
  }

  const statusConfig = {
    active:   { icon: CheckCircle2,  iconColor: "text-emerald-500", iconBg: "bg-emerald-500/10", label: "Suscripción Activa",    labelColor: "text-emerald-400" },
    at_risk:  { icon: AlertTriangle, iconColor: "text-amber-500",   iconBg: "bg-amber-500/10",   label: "Suscripción en Riesgo", labelColor: "text-amber-400"   },
    expired:  { icon: XCircle,       iconColor: "text-red-500",     iconBg: "bg-red-500/10",     label: "Suscripción Vencida",   labelColor: "text-red-400"     },
  }[subscriptionStatus];
  const StatusIcon = statusConfig.icon;
  return (
    <div className="max-w-3xl mx-auto space-y-8 relative">
      {/* Background Watermark for branding */}
      <div className="absolute -top-20 -right-20 opacity-[0.03] pointer-events-none select-none -z-10">
        <Image 
          src="/logo-sitiohoy.png" 
          alt="" 
          width={400} 
          height={400} 
          className="object-contain"
        />
      </div>
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Mi Plan</h1>
        <p className="mt-2 text-slate-400">Detalles de tu suscripción en SitioHoy.</p>
      </div>

      <div className="glass-panel overflow-hidden">
        {/* Header del Plan */}
        <div className="bg-surface border-b border-border p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-full ${statusConfig.iconBg} flex items-center justify-center`}>
              <StatusIcon className={`h-5 w-5 ${statusConfig.iconColor}`} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Plan Emprendimiento</h2>
              <p className={`text-sm font-medium ${statusConfig.labelColor}`}>{statusConfig.label}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-foreground">$37.000</p>
            <p className="text-xs text-slate-400 uppercase tracking-wider mt-1">por mes</p>
          </div>
        </div>

        {/* Banner de advertencia */}
        {subscriptionStatus === "at_risk" && (
          <div className="mx-6 mt-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
            <AlertTriangle className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-300">Tu suscripción está vencida</p>
              <p className="text-xs text-amber-400/80 mt-0.5">Tenés plazo hasta el {gracePeriodEndDate} para renovar antes de que tu sitio sea suspendido.</p>
            </div>
          </div>
        )}
        {subscriptionStatus === "expired" && (
          <div className="mx-6 mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
            <XCircle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-red-300">Suscripción suspendida</p>
              <p className="text-xs text-red-400/80 mt-0.5">El período de gracia venció. Contactá a soporte para renovar tu plan.</p>
            </div>
          </div>
        )}

        {/* Detalles del Plan */}
        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">
              Características Incluidas
            </h3>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                Catálogo de hasta 200 productos.
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span className="flex items-center gap-1.5">
                  Cobros online con MercadoPago
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded-md font-semibold uppercase">+ Cuotas</span>
                </span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                Envíos con valores fijos por zona.
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                Analíticas de visitas y tráfico (Umami).
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                Tienda 100% autogestionable.
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                Diseño profesional y responsive.
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                Hosting y Certificado SSL.
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                Soporte con asistencia en 24hs.
              </li>
            </ul>
          </div>

          <hr className="border-border" />

          {/* Gestión de Pago */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-background/50 rounded-xl p-4 border border-border">
            <div className="flex items-center gap-3 text-slate-300">
              <CreditCard className="h-5 w-5" />
              <div>
                <p className="text-sm font-medium">Pago procesado vía MercadoPago</p>
                <p className="text-xs text-slate-500">
                  {subscriptionStatus === "active" ? "Próximo cobro automático" : "Fecha de vencimiento"}: {nextPaymentDate ?? "—"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
