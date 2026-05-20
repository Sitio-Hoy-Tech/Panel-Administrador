import Link from "next/link";
import { Plus, Image as ImageIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { getProductos } from "@/actions/esencial/productos";
import { ProductListTable } from "./ProductListTable";

export default async function ProductosPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageStr } = await searchParams;
  const currentPage = parseInt(pageStr || "1");
  const itemsPerPage = 7;

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
            <p className="mt-3 mb-5 text-slate-400">Gestioná tus servicios y productos ({totalProductosCount} / {maxProducts} disponibles).</p>
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
            <div className="h-20 w-20 bg-surface border border-white/[0.05] rounded-2xl flex items-center justify-center mb-6 shadow-lg relative z-10">
              <ImageIcon className="h-8 w-8 text-slate-500" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2 relative z-10 tracking-tight">Tu catálogo está vacío</h3>
            <p className="text-slate-400 max-w-md relative z-10 text-balance">
              Creá tu primer producto o servicio. Podés añadir foto, nombre, descripción y el precio que verá tu cliente en la web.
            </p>
            <div className="mt-8 relative z-10">
              <Link
                href="/admin/productos/crear"
                className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-lg font-medium hover:bg-slate-200 transition-colors shadow-lg shadow-white/10"
              >
                <Plus className="h-5 w-5" />
                Crear el primero
              </Link>
            </div>
          </div>
        ) : (
          <div className="glass-panel">
            <ProductListTable initialProductos={productos} startIndex={startIndex} />
          </div>
        )}
      </div>

      {/* Floating Pagination */}
      {totalPages > 1 && (
        <div className="sticky bottom-10 left-0 right-0 bg-black/40/90 backdrop-blur-xl border border-white/[0.07] px-6 py-3 z-30 mt-8 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.7)]">
          <div className="flex items-center justify-between max-w-[1400px] mx-auto">
            <div className="text-xs text-slate-500 hidden sm:block">
              Página <span className="text-slate-300 font-medium">{currentPage}</span> de <span className="text-slate-300 font-medium">{totalPages}</span>
            </div>
            <div className="flex items-center gap-2 mx-auto sm:mr-0">
              <Link
                href={currentPage > 1 ? `?page=${currentPage - 1}` : "#"}
                className={`p-2 rounded-xl border border-white/[0.05] bg-white/[0.02] hover:bg-white/5 transition-colors ${currentPage === 1 ? 'opacity-30 cursor-not-allowed pointer-events-none' : 'text-slate-300'}`}
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
                        : 'border-white/[0.05] bg-white/[0.02] text-slate-500 hover:text-slate-300 hover:border-white/10'
                        }`}
                    >
                      {pageNum}
                    </Link>
                  );
                })}
              </div>
              <Link
                href={currentPage < totalPages ? `?page=${currentPage + 1}` : "#"}
                className={`p-2 rounded-xl border border-white/[0.05] bg-white/[0.02] hover:bg-white/5 transition-colors ${currentPage === totalPages ? 'opacity-30 cursor-not-allowed pointer-events-none' : 'text-slate-300'}`}
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
