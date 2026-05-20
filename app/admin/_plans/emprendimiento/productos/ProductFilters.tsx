"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { CustomSelect } from "@/components/emprendimiento/CustomSelect";

interface Category {
  id: string;
  name: string;
}

export function ProductFilters({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [status, setStatus] = useState(searchParams.get("status") || "all");
  const [category, setCategory] = useState(searchParams.get("category") || "all");

  // Debounce search
  useEffect(() => {
    const timeout = setTimeout(() => {
      updateFilters({ q: search });
    }, 500);
    return () => clearTimeout(timeout);
  }, [search]);

  const updateFilters = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value === "all" || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    // Reset to page 1 on search
    params.delete("page");
    
    router.push(`${pathname}?${params.toString()}`);
  };

  const clearFilters = () => {
    setSearch("");
    setStatus("all");
    setCategory("all");
    router.push(pathname);
  };

  const hasActiveFilters = search || status !== "all" || category !== "all";

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search Input */}
        <div className="relative flex-1 group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Buscar por nombre o descripción..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full pl-10 pr-3 py-2.5 bg-white/[0.03] border border-white/[0.05] rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
          />
        </div>

        {/* Status Filter */}
        <div className="w-full md:w-56">
          <CustomSelect
            value={status}
            onChange={(val) => {
              setStatus(val);
              updateFilters({ status: val });
            }}
            options={[
              { id: "all", name: "Todos los estados" },
              { id: "active", name: "Activos" },
              { id: "paused", name: "Pausados" },
            ]}
          />
        </div>

        {/* Category Filter */}
        <div className="w-full md:w-56">
          <CustomSelect
            value={category}
            onChange={(val) => {
              setCategory(val);
              updateFilters({ category: val });
            }}
            placeholder="Categorías"
            options={[
              { id: "all", name: "Todas las categorías" },
              ...categories
            ]}
          />
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-xl transition-all border border-white/[0.05]"
          >
            <X className="h-4 w-4" />
            <span className="md:hidden lg:inline text-xs font-medium">Limpiar</span>
          </button>
        )}
      </div>

      {/* Filter Chips / Active status display */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-wider text-slate-600">
          <SlidersHorizontal className="h-3 w-3" />
          Filtros activos:
        </div>
        {!hasActiveFilters && (
          <span className="text-[10px] text-slate-500 italic">Ninguno</span>
        )}
        {search && (
          <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold">
            Búsqueda: {search}
          </span>
        )}
        {status !== "all" && (
          <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-bold uppercase">
            Estado: {status === "active" ? "Activos" : "Pausados"}
          </span>
        )}
        {category !== "all" && (
          <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold uppercase">
            Categoría: {categories.find(c => c.id === category)?.name}
          </span>
        )}
      </div>
    </div>
  );
}
