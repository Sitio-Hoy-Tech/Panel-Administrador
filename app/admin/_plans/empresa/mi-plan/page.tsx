import { CheckCircle2, CreditCard, ExternalLink, TrendingUp, Truck, BarChart3 } from "lucide-react";

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
            <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Plan Empresa</h2>
              <p className="text-sm text-blue-400 font-medium">Suscripción Activa</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-foreground">$65.000</p>
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
                <CheckCircle2 className="h-4 w-4 text-blue-400" />
                Catálogo ilimitado.
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-blue-400" />
                <span className="flex items-center gap-1.5">
                  Cobros online
                  <span className="text-[10px] bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded-md font-semibold uppercase">Múltiples Pasarelas</span>
                </span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-blue-400" />
                Envíos automatizados con tarifa de correo.
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-blue-400" />
                Analítica avanzada y seguimiento de conversiones.
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-blue-400" />
                Control total sin límites de autogestión.
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-blue-400" />
                Diseño profesional.
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-blue-400" />
                Hosting y Certificado SSL.
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-blue-400" />
                Soporte prioritario en el día.
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
