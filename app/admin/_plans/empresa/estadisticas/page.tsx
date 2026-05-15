import { BarChart3, Lock, DollarSign, ShoppingBag, TrendingUp, Globe } from "lucide-react";
import { getBusinessStats } from "@/actions/empresa/stats";
import { StatsCard } from "@/components/empresa/analytics/StatsCard";
import { RevenueChart } from "@/components/empresa/analytics/RevenueChart";
import { TopProductsList } from "@/components/empresa/analytics/TopProductsList";

export const dynamic = "force-dynamic";

export default async function EstadisticasPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab = "traffic" } = await searchParams;
  const umamiShareUrl = process.env.NEXT_PUBLIC_UMAMI_SHARE_URL;
  const { data: stats, error: statsError } = await getBusinessStats();

  return (
    <div className="w-full h-full space-y-8 flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Analítica</h1>
          <p className="mt-2 text-zinc-400">Rendimiento integral de tu tienda (Tráfico y Negocio).</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 self-start md:self-center">
            <a 
                href="?tab=traffic" 
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${tab === 'traffic' ? 'bg-white text-black shadow-lg shadow-white/10' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
                <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Tráfico
                </div>
            </a>
            <a 
                href="?tab=business" 
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${tab === 'business' ? 'bg-white text-black shadow-lg shadow-white/10' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
                <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Ventas
                </div>
            </a>
        </div>
      </div>

      {tab === 'traffic' ? (
        <div className="flex-1 glass-panel overflow-hidden relative min-h-[700px] flex flex-col">
          {umamiShareUrl ? (
            <div className="relative flex-1 flex flex-col">
              <iframe
                src={umamiShareUrl}
                className="w-full flex-1 border-none bg-transparent"
                title="Umami Analytics"
                style={{ minHeight: '700px' }}
              />
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
              <div className="h-20 w-20 bg-amber-500/10 rounded-3xl flex items-center justify-center mb-8 rotate-3 shadow-2xl shadow-amber-500/20">
                <Lock className="h-10 w-10 text-amber-400 -rotate-3" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Analíticas en Preparación</h3>
              <p className="text-zinc-400 max-w-md mb-10 leading-relaxed">
                Cuando el servicio de analíticas esté vinculado a tu tienda, podrás visualizar aquí el tráfico detallado y comportamiento de tus usuarios.
              </p>
              
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 border border-white/10 text-zinc-500 text-xs font-medium uppercase tracking-[0.2em]">
                  <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
                  Esperando conexión
              </div>

              <div className="mt-16 flex items-center gap-8 opacity-20 grayscale transition-all duration-500">
                  <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">Powered by</span>
                  <div className="flex items-center gap-2">
                      <div className="h-4 w-4 bg-white rounded-full"></div>
                      <span className="text-sm font-bold text-white tracking-tighter">umami</span>
                  </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
           {/* Grid de Métricas */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatsCard 
                    title="Ventas Totales" 
                    value={`$${stats?.totalRevenue.toLocaleString('es-AR') || 0}`} 
                    icon={DollarSign} 
                    color="emerald" 
                    trend="Activo"
                />
                <StatsCard 
                    title="Órdenes" 
                    value={stats?.totalOrders || 0} 
                    icon={ShoppingBag} 
                    color="zinc" 
                />
                <StatsCard 
                    title="Ticket Promedio" 
                    value={`$${Math.round(stats?.avgTicket || 0).toLocaleString('es-AR')}`} 
                    icon={TrendingUp} 
                    color="amber" 
                />
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
                <div className="lg:col-span-2">
                    <RevenueChart data={stats?.timeSeries || []} />
                </div>
                <div className="lg:col-span-1">
                    <TopProductsList products={stats?.topProducts || []} />
                </div>
           </div>
        </div>
      )}

      <div className="mt-auto flex justify-between items-center text-[10px] text-zinc-600 uppercase tracking-widest px-2 pb-4">
        <span>Privacidad Garantizada</span>
        <span>Sin Cookies • GDPR Compliant</span>
      </div>
    </div>
  );
}

