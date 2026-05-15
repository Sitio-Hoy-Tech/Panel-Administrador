import { getOrdenes } from "@/actions/emprendimiento/ordenes";
import { OrderList } from "./OrderList";
import { OrderFilters } from "./OrderFilters";
import { ShoppingCart, Package, Clock, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

export default async function OrdenesPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ search?: string; status?: string; payment?: string; page?: string }> 
}) {
  const filters = await searchParams;
  const { data: allOrders } = await getOrdenes(filters);
  
  const itemsPerPage = 5;
  const currentPage = parseInt(filters.page || "1");
  const totalItems = allOrders?.length || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const orders = allOrders?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage) || [];

  const stats = {
    nuevos: allOrders?.filter((o: any) => o.status === 'confirmed').length || 0,
    preparacion: allOrders?.filter((o: any) => o.status === 'preparing').length || 0,
    enviados: allOrders?.filter((o: any) => o.status === 'shipped').length || 0,
    completados: allOrders?.filter((o: any) => o.status === 'delivered').length || 0,
  };

  return (
    <div className="w-full space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Ordenes</h1>
        <p className="mt-2 text-zinc-400">Gestioná las ventas de tu tienda y el estado de entrega.</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Nuevos", value: stats.nuevos, icon: ShoppingCart, color: "text-blue-400", bg: "bg-blue-500/10" },
          { label: "En preparación", value: stats.preparacion, icon: Package, color: "text-amber-400", bg: "bg-amber-500/10" },
          { label: "Enviados", value: stats.enviados, icon: Clock, color: "text-emerald-400", bg: "bg-emerald-500/10" },
          { label: "Completados", value: stats.completados, icon: CheckCircle2, color: "text-green-400", bg: "bg-green-500/10" },
        ].map((stat) => (
          <div key={stat.label} className="glass-panel p-5 flex flex-col gap-3">
            <div className={`p-2 ${stat.bg} rounded-lg w-fit`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-panel">
        <div className="p-6 border-b border-white/5 bg-white/[0.02]">
          <OrderFilters />
        </div>

        <div className="md:overflow-visible overflow-x-visible md:overflow-x-auto max-h-[600px] md:max-h-none overflow-y-auto md:overflow-y-visible custom-scrollbar md:scrollbar-none">
          <OrderList orders={orders} />
        </div>
      </div>

      {/* Floating Pagination */}
      {totalPages > 1 && (
        <div className="sticky bottom-10 left-0 right-0 bg-[#111111]/90 backdrop-blur-xl border border-white/10 px-6 py-3 z-30 mt-8 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.7)]">
          <div className="flex items-center justify-between w-full">
            <div className="text-xs text-zinc-500 hidden sm:block">
              Página <span className="text-zinc-300 font-medium">{currentPage}</span> de <span className="text-zinc-300 font-medium">{totalPages}</span>
            </div>
            <div className="flex items-center gap-2 mx-auto sm:mr-0">
              <Link
                href={currentPage > 1 ? `?page=${currentPage - 1}${filters.search ? `&search=${filters.search}` : ''}${filters.status ? `&status=${filters.status}` : ''}${filters.payment ? `&payment=${filters.payment}` : ''}` : "#"}
                className={`p-2 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/5 transition-colors ${currentPage === 1 ? 'opacity-30 cursor-not-allowed pointer-events-none' : 'text-zinc-300'}`}
                aria-label="Página anterior"
              >
                <ChevronLeft className="h-5 w-5" />
              </Link>
              <div className="flex items-center gap-1">
                {[...Array(totalPages)].map((_, i) => {
                  const pageNum = i + 1;
                  const isCurrent = pageNum === currentPage;
                  
                  // Helper to keep other filters
                  const getPageUrl = (p: number) => {
                    const params = new URLSearchParams();
                    if (filters.search) params.set("search", filters.search);
                    if (filters.status) params.set("status", filters.status);
                    if (filters.payment) params.set("payment", filters.payment);
                    params.set("page", p.toString());
                    return `?${params.toString()}`;
                  };

                  return (
                    <Link
                      key={pageNum}
                      href={getPageUrl(pageNum)}
                      className={`w-9 h-9 flex items-center justify-center rounded-xl border transition-all duration-300 text-sm font-medium ${isCurrent
                        ? 'bg-white text-black border-white shadow-lg shadow-white/10'
                        : 'border-white/5 bg-white/[0.02] text-zinc-500 hover:text-zinc-300 hover:border-white/10'
                        }`}
                    >
                      {pageNum}
                    </Link>
                  );
                })}
              </div>
              <Link
                href={currentPage < totalPages ? `?page=${currentPage + 1}${filters.search ? `&search=${filters.search}` : ''}${filters.status ? `&status=${filters.status}` : ''}${filters.payment ? `&payment=${filters.payment}` : ''}` : "#"}
                className={`p-2 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/5 transition-colors ${currentPage === totalPages ? 'opacity-30 cursor-not-allowed pointer-events-none' : 'text-zinc-300'}`}
                aria-label="Página siguiente"
              >
                <ChevronRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
