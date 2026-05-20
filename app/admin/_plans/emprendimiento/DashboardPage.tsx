import { Package, ArrowRight, Zap, Link as LinkIcon, TrendingUp, ShoppingCart, CreditCard, Truck } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { getCurrentTenant } from "@/utils/auth";
import { redirect } from "next/navigation";

export default async function Dashboard() {
  const tenantId = await getCurrentTenant();

  if (!tenantId) {
    redirect("/admin/login");
  }

  const supabase = await createClient();

  const [
    { data: tenant },
    { count: currentProducts },
    { data: recentOrders },
  ] = await Promise.all([
    supabase.from('tenants').select('name, slug, url, max_products, origin_phone, plan').eq('id', tenantId).single(),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId),
    supabase.from('orders').select('*').eq('tenant_id', tenantId).order('created_at', { ascending: false }).limit(5),
  ]);

  const maxProducts = 200; // Forzado para Plan Emprendimiento
  const usagePercentage = ((currentProducts || 0) / maxProducts) * 100;
  const strokeDasharray = 283;
  const strokeDashoffset = strokeDasharray - (strokeDasharray * usagePercentage) / 100;

  const baseDomain = process.env.NEXT_PUBLIC_STORE_DOMAIN || 'sitiohoy.com';
  const publicUrl = tenant?.url
    ? (tenant.url.startsWith('http') ? tenant.url : `https://${tenant.url}`)
    : (tenant?.slug ? `https://${tenant.slug}.${baseDomain}` : "#");

  return (
    <div className="w-full space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-medium text-emerald-400 mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Plan Emprendimiento Activo
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white mb-2">
            Panel de Control
          </h1>
          <p className="text-slate-400 max-w-xl text-balance">
            Gestioná tu tienda online de {tenant?.name || 'tu negocio'}. Productos, ordenes, envíos y cobros en un solo lugar.
          </p>
        </div>
        <Link
          href="/admin/productos/crear"
          className="group inline-flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-full font-semibold hover:bg-slate-200 hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
        >
          <Zap className="h-4 w-4 fill-black" />
          Añadir Producto
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(180px,auto)]">

        {/* Bento Box: Circular Progress */}
        <div className="md:col-span-1 glass-panel p-8 flex flex-col justify-between relative group overflow-hidden">
          <div className="absolute top-0 right-0 p-32 bg-emerald-500/5 rounded-full blur-[80px] -mr-20 -mt-20 group-hover:bg-emerald-500/10 transition-colors duration-700"></div>

          <div className="relative z-10 flex items-center justify-between mb-4">
            <h3 className="text-slate-400 font-medium tracking-wide text-sm uppercase">Límite del Plan</h3>
            <div className="p-2 bg-white/5 rounded-lg border border-white/[0.07]">
              <Package className="h-4 w-4 text-slate-300" />
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-6 mt-4">
            <div className="relative h-24 w-24">
              <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" className="stroke-white/10" strokeWidth="8" fill="none" />
                <circle
                  cx="50" cy="50" r="45"
                  className="stroke-blue-500 transition-all duration-1000 ease-out"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-xl font-bold text-white">{currentProducts || 0}</span>
                <span className="text-[10px] text-slate-500 font-medium">/{maxProducts}</span>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-white mb-1">Productos</p>
              <p className="text-xs text-slate-500">Capacidad al {Math.round(usagePercentage)}%</p>
            </div>
          </div>
        </div>

        {/* Bento Box: MercadoPago / Cobros */}
        <div className="md:col-span-2 glass-panel p-8 relative overflow-hidden group flex flex-col justify-between">
          <div className="absolute -inset-1 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-r from-blue-500/10 via-transparent to-transparent blur-xl"></div>

          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-slate-400 font-medium tracking-wide text-sm uppercase mb-1">Cobros Online</h3>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <CreditCard className="h-6 w-6 text-emerald-400" /> MercadoPago Activo
                </h2>
              </div>
              <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                <span className="text-xs font-medium text-emerald-400">+ Cuotas</span>
              </div>
            </div>

            <div className="mt-8">
              <p className="text-sm text-slate-400 max-w-md text-balance mb-4">
                Tus clientes pueden pagar directamente desde tu tienda con tarjeta de crédito, débito y cuotas sin interés a través de MercadoPago.
              </p>
              <Link href="/admin/configuracion" className="inline-flex items-center gap-2 text-sm font-semibold text-white group/link">
                Configurar pagos <ArrowRight className="h-4 w-4 group-hover/link:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bento Box: Quick Links */}
        <div className="md:col-span-1 glass-panel p-6 flex flex-col gap-3">
          <h3 className="text-slate-400 font-medium tracking-wide text-sm uppercase mb-2">Accesos Rápidos</h3>
          <Link href="/admin/productos" className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/[0.05] hover:bg-white/10 transition-colors group">
            <div className="flex items-center gap-3">
              <Package className="h-5 w-5 text-slate-400 group-hover:text-white transition-colors" />
              <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">Ver Catálogo</span>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-600 group-hover:text-white transition-colors" />
          </Link>
          <Link href="/admin/ordenes" className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/[0.05] hover:bg-white/10 transition-colors group">
            <div className="flex items-center gap-3">
              <ShoppingCart className="h-5 w-5 text-slate-400 group-hover:text-white transition-colors" />
              <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">Ver Ordenes</span>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-600 group-hover:text-white transition-colors" />
          </Link>
          <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/[0.05] hover:bg-white/10 transition-colors group">
            <div className="flex items-center gap-3">
              <LinkIcon className="h-5 w-5 text-slate-400 group-hover:text-white transition-colors" />
              <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">Mi Tienda</span>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-600 group-hover:text-white transition-colors" />
          </a>
        </div>

        {/* Bento Box: Analíticas */}
        <div className="md:col-span-1 glass-panel p-8 relative overflow-hidden flex flex-col justify-between group">
          <div className="absolute -inset-1 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-t from-blue-500/5 to-transparent blur-xl"></div>
          <div className="relative z-10 flex justify-between items-center mb-4">
            <h3 className="text-slate-400 font-medium tracking-wide text-sm uppercase">Analíticas</h3>
            <div className="p-2 bg-white/5 rounded-lg border border-white/[0.07]">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
            </div>
          </div>

          <div className="relative z-10 flex-1 flex items-end gap-1.5 h-24 w-full mt-4">
            {[40, 25, 60, 30, 85, 45, 95].map((height, i) => (
              <div key={i} className="flex-1 bg-emerald-500/10 border border-emerald-500/10 rounded-t-lg relative group/bar overflow-hidden transition-all duration-500 hover:bg-emerald-500/20" style={{ height: `${height}%` }}>
              </div>
            ))}
          </div>
          <div className="mt-4 relative z-10">
            <Link href="/admin/analiticas" className="inline-flex items-center gap-2 text-sm font-semibold text-white group/link">
              Ver analíticas <ArrowRight className="h-4 w-4 group-hover/link:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Bento Box: Envíos */}
        <div className="md:col-span-1 glass-panel p-8 relative overflow-hidden flex flex-col justify-between group">
          <div className="absolute -inset-1 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-r from-emerald-500/5 to-transparent blur-xl"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-slate-400 font-medium tracking-wide text-sm uppercase">Envíos</h3>
              <div className="p-2 bg-white/5 rounded-lg border border-white/[0.07]">
                <Truck className="h-4 w-4 text-emerald-400" />
              </div>
            </div>
            <h2 className="text-lg font-bold text-white mb-2">Valores por Zona</h2>
            <p className="text-sm text-slate-400 text-balance mb-4">
              Configurá precios fijos de envío por zona geográfica para que tus clientes vean el costo al comprar.
            </p>
          </div>
          <Link href="/admin/configuracion" className="inline-flex items-center gap-2 text-sm font-semibold text-white group/link relative z-10">
            Configurar zonas <ArrowRight className="h-4 w-4 group-hover/link:translate-x-1 transition-transform" />
          </Link>
        </div>

      </div>

      {/* Full Width Bento: Recent Orders */}
      <div className="glass-panel overflow-hidden group">
        <div className="p-6 border-b border-white/[0.05] flex items-center justify-between bg-white/[0.01]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <ShoppingCart className="h-4 w-4 text-emerald-400" />
            </div>
            <h3 className="text-white font-bold tracking-tight">Últimas Ordenes</h3>
          </div>
          <Link href="/admin/ordenes" className="text-xs font-semibold text-slate-400 hover:text-white transition-colors flex items-center gap-1 group/btn">
            Ver todas las ordenes <ArrowRight className="h-3 w-3 group-hover/btn:translate-x-0.5 transition-transform" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          {!recentOrders || recentOrders.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-slate-500 text-sm">No hay ordenes registradas todavía.</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold border-b border-white/[0.05] bg-white/[0.01]">
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Cliente</th>
                  <th className="px-6 py-4">Total</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentOrders.map((order: any) => (
                  <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-xs font-mono text-slate-400">#{order.id.slice(0, 8).toUpperCase()}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-white">{order.customer_first_name} {order.customer_last_name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-white">${new Intl.NumberFormat('es-AR').format(order.total)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${order.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-400' :
                          order.status === 'preparing' ? 'bg-amber-500/10 text-amber-400' :
                            order.status === 'shipped' ? 'bg-emerald-500/10 text-emerald-400' :
                              order.status === 'delivered' ? 'bg-green-500/10 text-green-400' :
                                'bg-slate-500/10 text-slate-500'
                        }`}>
                        {order.status === 'confirmed' ? 'Nuevo' :
                          order.status === 'preparing' ? 'En prep' :
                            order.status === 'shipped' ? 'Enviado' :
                              order.status === 'delivered' ? 'Listo' : 'Pendiente'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href="/admin/ordenes" className="p-2 text-slate-500 hover:text-white transition-colors">
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
