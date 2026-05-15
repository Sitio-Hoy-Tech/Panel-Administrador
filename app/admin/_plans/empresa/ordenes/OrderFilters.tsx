"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Filter, X, CreditCard, Clock, Package, Truck, CheckCircle2 } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CustomSelect } from "@/components/empresa/CustomSelect";

const statusOptions = [
  { value: "all", label: "Todos los estados", icon: Filter },
  { value: "confirmed", label: "Nuevos", icon: Clock },
  { value: "preparing", label: "En preparación", icon: Package },
  { value: "shipped", label: "Enviados", icon: Truck },
  { value: "delivered", label: "Completados", icon: CheckCircle2 },
];

const paymentOptions = [
  { value: "all", label: "Todos los pagos", icon: CreditCard },
  { value: "paid", label: "Cobrados", icon: CheckCircle2 },
  { value: "pending", label: "Pendientes", icon: Clock },
];

export function OrderFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [status, setStatus] = useState(searchParams.get("status") || "all");
  const [payment, setPayment] = useState(searchParams.get("payment") || "all");

  const createQueryString = useCallback(
    (params: Record<string, string | null>) => {
      const newSearchParams = new URLSearchParams(searchParams.toString());
      
      for (const [key, value] of Object.entries(params)) {
        if (value === null || value === "all" || value === "") {
          newSearchParams.delete(key);
        } else {
          newSearchParams.set(key, value);
        }
      }

      // Reset page when filtering
      newSearchParams.delete("page");
      
      return newSearchParams.toString();
    },
    [searchParams]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      const query = createQueryString({ search });
      if (query !== searchParams.toString()) {
        router.push(`${pathname}?${query}`);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [search, pathname, router, createQueryString, searchParams]);

  const handleStatusChange = (val: string) => {
    setStatus(val);
    router.push(`${pathname}?${createQueryString({ status: val })}`);
  };

  const handlePaymentChange = (val: string) => {
    setPayment(val);
    router.push(`${pathname}?${createQueryString({ payment: val })}`);
  };

  const clearFilters = () => {
    setSearch("");
    setStatus("all");
    setPayment("all");
    router.push(pathname);
  };

  const hasActiveFilters = search || status !== "all" || payment !== "all";

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        {/* Search Input */}
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-focus-within:text-white transition-colors" />
          <input
            type="text"
            placeholder="Buscar por cliente, email o #orden..."
            className="w-full bg-surface border border-white/5 rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-white/10 transition-all placeholder:text-zinc-600"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button 
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/5 rounded-full text-zinc-500 hover:text-white transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Status Filter */}
        <div className="w-full md:w-64">
          <CustomSelect
            options={statusOptions}
            value={status}
            onChange={handleStatusChange}
            placeholder="Estado de entrega"
          />
        </div>

        {/* Payment Filter */}
        <div className="w-full md:w-64">
          <CustomSelect
            options={paymentOptions}
            value={payment}
            onChange={handlePaymentChange}
            placeholder="Estado de pago"
          />
        </div>
      </div>

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-300">
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest mr-2">Filtros:</span>
          
          {search && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs text-white">
              <Search className="h-3 w-3 text-zinc-500" />
              <span>"{search}"</span>
              <button onClick={() => setSearch("")} className="hover:text-red-400 transition-colors">
                <X className="h-3 w-3" />
              </button>
            </div>
          )}

          {status !== "all" && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs text-white">
              <Filter className="h-3 w-3 text-zinc-500" />
              <span>{statusOptions.find(o => o.value === status)?.label}</span>
              <button onClick={() => handleStatusChange("all")} className="hover:text-red-400 transition-colors">
                <X className="h-3 w-3" />
              </button>
            </div>
          )}

          {payment !== "all" && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs text-white">
              <CreditCard className="h-3 w-3 text-zinc-500" />
              <span>{paymentOptions.find(o => o.value === payment)?.label}</span>
              <button onClick={() => handlePaymentChange("all")} className="hover:text-red-400 transition-colors">
                <X className="h-3 w-3" />
              </button>
            </div>
          )}

          <button 
            onClick={clearFilters}
            className="text-xs font-bold text-zinc-500 hover:text-white transition-colors underline underline-offset-4 decoration-zinc-700 hover:decoration-white ml-2"
          >
            Limpiar todo
          </button>
        </div>
      )}
    </div>
  );
}
