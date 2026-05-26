import Link from "next/link";
import { Plus, Image as ImageIcon, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { getProductos } from "@/actions/emprendimiento/productos";
import { getCategorias } from "@/actions/emprendimiento/categorias";
import { ProductListTable } from "./ProductListTable";
import { ProductFilters } from "./ProductFilters";

export default async function ProductosPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; status?: string; category?: string }>;
}) {
  const { page: pageStr, q, status, category } = await searchParams;
  const currentPage = parseInt(pageStr || "1");
  const itemsPerPage = 7;

  const { data: allProductos, error } = await getProductos();
  const { data: categories } = await getCategorias();

  // Apply filters
  let filteredProductos = allProductos || [];

  if (q) {
    const searchLower = q.toLowerCase();
    filteredProductos = filteredProductos.filter(p => 
      p.name.toLowerCase().includes(searchLower) || 
      p.description?.toLowerCase().includes(searchLower)
    );
  }

  if (status === "active") {
    filteredProductos = filteredProductos.filter(p => p.active);
  } else if (status === "paused") {
    filteredProductos = filteredProductos.filter(p => !p.active);
  }

  if (category && category !== "all") {
    filteredProductos = filteredProductos.filter(p => p.category_id === category);
  }

  const totalProductosCount = allProductos?.length || 0;
  const filteredCount = filteredProductos.length;
  const maxProducts = 200;
  const isAtLimit = totalProductosCount >= maxProducts;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const productos = filteredProductos.slice(startIndex, endIndex);

  const totalPages = Math.ceil(filteredCount / itemsPerPage);

  return (
    <div className="w-full space-y-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Catálogo</h1>
          <p className="mt-2 text-slate-400">
            {q || status || (category && category !== "all") ? (
              <>Mostrando {filteredCount} productos filtrados (de {totalProductosCount})</>
            ) : (
              <>Gestioná tus productos y servicios ({totalProductosCount} / {maxProducts} disponibles).</>
            )}
          </p>
        </div>
        {isAtLimit ? (
          <span
            title="Alcanzaste el límite de productos de tu plan"
            className="flex items-center gap-2 bg-slate-800 text-slate-500 px-4 py-2 rounded-lg font-medium cursor-not-allowed opacity-60 border border-slate-700"
          >
            <Plus className="h-5 w-5" />
            Límite alcanzado
          </span>
        ) : (
          <Link
            href="/admin/productos/crear"
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Nuevo Producto
          </Link>
        )}
      </div>

      <ProductFilters categories={categories || []} />

      {error ? (
        <div className="glass-panel p-6 text-red-400 text-center border-red-500/20 bg-red-500/5">
          {error}
        </div>
      ) : productos && productos.length === 0 ? (
        <div className="glass-panel p-16 text-center flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-primary/5 rounded-full blur-3xl"></div>

          <div className="h-20 w-20 bg-surface border border-white/[0.05] rounded-2xl flex items-center justify-center mb-6 shadow-lg relative z-10">
            <ImageIcon className="h-8 w-8 text-slate-500" />
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-2 relative z-10 tracking-tight">Tu catálogo está vacío</h3>
          <p className="text-slate-400 max-w-md relative z-10 text-balance">
            Creá tu primer producto. Podés añadir fotos, nombre, descripción, precio y stock. Tus clientes podrán comprarlo directamente con MercadoPago.
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

      {/* No results for active filters */}
      {!error && allProductos && allProductos.length > 0 && filteredCount === 0 && (
        <div className="glass-panel p-16 text-center flex flex-col items-center justify-center border-dashed border-white/[0.05] bg-white/[0.01]">
          <div className="h-16 w-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
            <Search className="h-6 w-6 text-slate-600" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-1">No se encontraron productos</h3>
          <p className="text-slate-500 text-sm">
            Probá ajustando los filtros o la búsqueda para encontrar lo que estás buscando.
          </p>
        </div>
      )}

      {/* Floating Pagination */}
      {totalPages > 1 && (
        <div className="sticky bottom-10 left-0 right-0 bg-black/40/90 backdrop-blur-xl border border-white/[0.07] px-6 py-3 z-30 mt-8 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.7)]">
          <div className="flex items-center justify-between w-full">
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
