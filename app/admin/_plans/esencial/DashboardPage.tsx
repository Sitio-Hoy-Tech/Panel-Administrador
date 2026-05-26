import { Package, Smartphone, ArrowRight, Zap, Link as LinkIcon } from "lucide-react";
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
  ] = await Promise.all([
    supabase.from('tenants').select('name, slug, url, max_products, origin_phone, plan').eq('id', tenantId).single(),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId),
  ]);

  const maxProducts = tenant?.max_products || 50;
  const currentProductsCount = currentProducts || 0;
  const usagePercentage = (currentProductsCount / maxProducts) * 100;
  const clampedPercentage = Math.min(usagePercentage, 100);
  const strokeDasharray = 283;
  const strokeDashoffset = strokeDasharray - (strokeDasharray * clampedPercentage) / 100;
  const isAtLimit = currentProductsCount >= maxProducts;

  const baseDomain = process.env.NEXT_PUBLIC_STORE_DOMAIN || 'sitiohoy.com';
  // Si el cliente tiene un dominio personalizado guardado en 'url', se usa ese. 
  // Sino, se usa el slug + el dominio base de la variable de entorno.
  const publicUrl = tenant?.url 
    ? (tenant.url.startsWith('http') ? tenant.url : `https://${tenant.url}`)
    : (tenant?.slug ? `https://${tenant.slug}.${baseDomain}` : "#");

  const phone = tenant?.origin_phone || "No configurado";

  return (
    <div className="w-full space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/[0.07] text-xs font-medium text-slate-300 mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Plan {tenant?.plan || 'Esencial'} Activo
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white mb-2">
            Panel de Control
          </h1>
          <p className="text-slate-400 max-w-xl text-balance">
            Administrá el catálogo de {tenant?.name || 'tu negocio'}. Subí tus productos, configura tu enlace y empezá a recibir pedidos.
          </p>
        </div>
        {isAtLimit ? (
          <span
            title="Alcanzaste el límite de productos de tu plan"
            className="inline-flex items-center gap-2 bg-slate-800 text-slate-500 px-5 py-2.5 rounded-full font-semibold cursor-not-allowed opacity-60 border border-slate-700"
          >
            <Zap className="h-4 w-4" />
            Límite alcanzado
          </span>
        ) : (
          <Link
            href="/admin/productos/crear"
            className="group inline-flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-full font-semibold hover:bg-slate-200 hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
          >
            <Zap className="h-4 w-4 fill-black" />
            Añadir Producto
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(180px,auto)]">
        
        {/* Bento Box: Circular Progress */}
        <div className="md:col-span-1 glass-panel p-8 flex flex-col justify-between relative group overflow-hidden">
          <div className="absolute top-0 right-0 p-32 bg-white/5 rounded-full blur-[80px] -mr-20 -mt-20 group-hover:bg-white/10 transition-colors duration-700"></div>
          
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
                  className={`${isAtLimit ? 'stroke-red-500' : 'stroke-white'} transition-all duration-1000 ease-out`}
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className={`text-xl font-bold ${isAtLimit ? 'text-red-400' : 'text-white'}`}>{currentProductsCount}</span>
                <span className="text-[10px] text-slate-500 font-medium">/{maxProducts}</span>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-white mb-1">Productos</p>
              <p className={`text-xs ${isAtLimit ? 'text-red-400 font-semibold' : 'text-slate-500'}`}>
                {isAtLimit ? 'Límite alcanzado' : `Capacidad al ${Math.round(usagePercentage)}%`}
              </p>
            </div>
          </div>
        </div>

        {/* Bento Box: WhatsApp */}
        <div className="md:col-span-2 glass-panel p-8 relative overflow-hidden group flex flex-col justify-between">
          <div className="absolute -inset-1 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-r from-green-500/10 via-transparent to-transparent blur-xl"></div>
          
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-slate-400 font-medium tracking-wide text-sm uppercase mb-1">Canal de Ventas</h3>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Smartphone className="h-6 w-6 text-green-400" /> WhatsApp Activo
                </h2>
              </div>
              <div className="flex -space-x-2">
                <div className="h-8 w-8 rounded-full bg-black/40 border-2 border-[#0A0A0A] flex items-center justify-center relative z-20 overflow-hidden bg-cover bg-center" style={{ backgroundImage: "url('https://api.dicebear.com/9.x/initials/svg?seed=WA')" }}>
                </div>
              </div>
            </div>
            
            <div className="mt-8">
              <p className="text-sm font-medium text-white mb-1">{phone}</p>
              <p className="text-sm text-slate-400 max-w-md text-balance mb-4">
                Todos los pedidos generados en tu catálogo se enviarán directamente a este número con el detalle completo.
              </p>
              <Link href="/admin/configuracion" className="inline-flex items-center gap-2 text-sm font-semibold text-white group/link">
                Configurar número <ArrowRight className="h-4 w-4 group-hover/link:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bento Box: Quick Links */}
        <div className="md:col-span-1 glass-panel p-6 flex flex-col gap-4">
          <h3 className="text-slate-400 font-medium tracking-wide text-sm uppercase mb-2">Accesos Rápidos</h3>
          <Link href="/admin/productos" className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/[0.05] hover:bg-white/10 transition-colors group">
            <div className="flex items-center gap-3">
              <Package className="h-5 w-5 text-slate-400 group-hover:text-white transition-colors" />
              <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">Ver Catálogo</span>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-600 group-hover:text-white transition-colors" />
          </Link>
          <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/[0.05] hover:bg-white/10 transition-colors group">
            <div className="flex items-center gap-3">
              <LinkIcon className="h-5 w-5 text-slate-400 group-hover:text-white transition-colors" />
              <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">Mi Sitio Público</span>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-600 group-hover:text-white transition-colors" />
          </a>
        </div>


      </div>
    </div>
  );
}
