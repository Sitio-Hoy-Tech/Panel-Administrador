import Link from "next/link";
import { Plus, Image as ImageIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { getProductos } from "@/actions/esencial/productos";
import { ProductActions } from "./ProductActions";

export default async function ProductosPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageStr } = await searchParams;
  const currentPage = parseInt(pageStr || "1");
  const itemsPerPage = 5;

  const { data: allProductos, error } = await getProductos();
  const totalProductosCount = allProductos?.length || 0;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const productos = allProductos?.slice(startIndex, endIndex) || [];

  const totalPages = Math.ceil(totalProductosCount / itemsPerPage);
  const maxProducts = 50;

  return (
    <div className="w-full space-y-10">
      <div className="flex-1">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Catálogo</h1>
            <p className="mt-3 mb-5 text-zinc-400">Gestioná tus servicios y productos ({totalProductosCount} / {maxProducts} disponibles).</p>
          </div>
          <Link
            href="/admin/productos/crear"
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Nuevo Producto
          </Link>
        </div>

        {error ? (
          <div className="glass-panel p-6 text-red-400 text-center border-red-500/20 bg-red-500/5">
            {error}
          </div>
        ) : allProductos && allProductos.length === 0 ? (
          <div className="glass-panel p-16 text-center flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-primary/5 rounded-full blur-3xl"></div>
            <div className="h-20 w-20 bg-surface border border-white/5 rounded-2xl flex items-center justify-center mb-6 shadow-lg relative z-10">
              <ImageIcon className="h-8 w-8 text-zinc-500" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2 relative z-10 tracking-tight">Tu catálogo está vacío</h3>
            <p className="text-zinc-400 max-w-md relative z-10 text-balance">
              Creá tu primer producto o servicio. Podés añadir foto, nombre, descripción y el precio que verá tu cliente en la web.
            </p>
            <div className="mt-8 relative z-10">
              <Link
                href="/admin/productos/crear"
                className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-lg font-medium hover:bg-zinc-200 transition-colors shadow-lg shadow-white/10"
              >
                <Plus className="h-5 w-5" />
                Crear el primero
              </Link>
            </div>
          </div>
        ) : (
          <div className="glass-panel">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-zinc-400 min-w-[600px] md:min-w-0">
                <thead className="bg-white/[0.02] border-b border-white/5 text-xs uppercase font-semibold text-zinc-500 tracking-wider">
                  <tr>
                    <th scope="col" className="px-6 py-4">Producto / Servicio</th>
                    <th scope="col" className="px-6 py-4">Precio Público</th>
                    <th scope="col" className="px-6 py-4">Stock</th>
                    <th scope="col" className="px-6 py-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {productos?.map((prod) => (
                    <tr key={prod.id} className={`group transition-colors duration-300 hover:bg-white/[0.02] ${!prod.active ? 'opacity-50' : ''}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-xl bg-surface flex items-center justify-center border border-white/5 flex-shrink-0 shadow-inner overflow-hidden relative">
                            {prod.image ? (
                              <img src={prod.image} alt={prod.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            ) : (
                              <ImageIcon className="h-5 w-5 text-zinc-600" />
                            )}
                            {!prod.active && (
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <span className="text-[10px] font-bold text-white uppercase tracking-wider">Pausado</span>
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-foreground text-base group-hover:text-primary transition-colors flex items-center gap-2">
                              {prod.name}
                              {!prod.active && <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 text-[10px] uppercase font-bold border border-white/5">Oculto</span>}
                              {prod.is_sale && <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] uppercase font-bold border border-emerald-500/20">En Oferta</span>}
                              {prod.stock !== null && prod.stock > 0 && prod.stock <= 5 && (
                                <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-[10px] uppercase font-bold border border-amber-500/20">Últimas Unidades</span>
                              )}
                            </div>
                            <div className="text-xs mt-1 truncate max-w-[200px] md:max-w-md text-zinc-500">{prod.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-zinc-300">
                        {prod.is_sale && prod.sale_price ? (
                          <div className="flex flex-col">
                            <span className="text-zinc-500 line-through text-xs font-normal">${prod.price.toLocaleString("es-AR")}</span>
                            <span className="text-emerald-400 font-bold">${prod.sale_price.toLocaleString("es-AR")}</span>
                          </div>
                        ) : (
                          <span>${prod.price.toLocaleString("es-AR")}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-zinc-400">
                        {prod.stock !== null && prod.stock !== undefined ? (
                          <div className="flex flex-col gap-1">
                            <span className={`${prod.stock <= 5 ? 'text-amber-400 font-medium' : 'text-zinc-300'}`}>
                              {prod.stock} u.
                            </span>
                            {prod.stock === 0 && (
                              <span className="text-[10px] bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded uppercase font-bold w-fit tracking-wider">
                                Agotado
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-zinc-600">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <ProductActions product={{ id: prod.id, active: prod.active }} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Floating Pagination */}
      {totalPages > 1 && (
        <div className="sticky bottom-10 left-0 right-0 bg-[#111111]/90 backdrop-blur-xl border border-white/10 px-6 py-3 z-30 mt-8 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.7)]">
          <div className="flex items-center justify-between max-w-[1400px] mx-auto">
            <div className="text-xs text-zinc-500 hidden sm:block">
              Página <span className="text-zinc-300 font-medium">{currentPage}</span> de <span className="text-zinc-300 font-medium">{totalPages}</span>
            </div>
            <div className="flex items-center gap-2 mx-auto sm:mr-0">
              <Link
                href={currentPage > 1 ? `?page=${currentPage - 1}` : "#"}
                className={`p-2 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/5 transition-colors ${currentPage === 1 ? 'opacity-30 cursor-not-allowed pointer-events-none' : 'text-zinc-300'}`}
                aria-label="Página anterior"
              >
                <ChevronLeft className="h-5 w-5" />
              </Link>
              <div className="flex items-center gap-1">
                {[...Array(totalPages)].map((_, i) => {
                  const pageNum = i + 1;
                  const isCurrent = pageNum === currentPage;
                  return (
                    <Link
                      key={pageNum}
                      href={`?page=${pageNum}`}
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
                href={currentPage < totalPages ? `?page=${currentPage + 1}` : "#"}
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
