import { CheckCircle2, CreditCard, ExternalLink } from "lucide-react";

export default function MiPlanPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Mi Plan</h1>
        <p className="mt-2 text-zinc-400">Detalles de tu suscripción en SitioHoy.</p>
      </div>

      <div className="glass-panel overflow-hidden">
        {/* Header del Plan */}
        <div className="bg-surface border-b border-border p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Plan Esencial</h2>
              <p className="text-sm text-green-500 font-medium">Suscripción Activa</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-foreground">$25.000</p>
            <p className="text-xs text-zinc-400 uppercase tracking-wider mt-1">por mes</p>
          </div>
        </div>

        {/* Detalles del Plan */}
        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider mb-4">
              Características Incluidas
            </h3>
            <ul className="space-y-3 text-sm text-zinc-400">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                Catálogo de hasta 50 productos/servicios.
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                Redirección de ventas a WhatsApp.
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                Diseño profesional y responsive.
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                Hosting y Certificado SSL.
              </li>
            </ul>
          </div>

          <hr className="border-border" />

          {/* Gestión de Pago */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-background/50 rounded-xl p-4 border border-border">
            <div className="flex items-center gap-3 text-zinc-300">
              <CreditCard className="h-5 w-5" />
              <div>
                <p className="text-sm font-medium">Pago procesado vía MercadoPago</p>
                <p className="text-xs text-zinc-500">Próximo cobro automático: 15 del corriente mes</p>
              </div>
            </div>
            <button className="flex items-center justify-center gap-2 bg-surface hover:bg-surface-hover text-foreground px-4 py-2 rounded-lg font-medium transition-colors text-sm border border-border">
              <ExternalLink className="h-4 w-4 text-zinc-400" />
              Gestionar Tarjeta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
