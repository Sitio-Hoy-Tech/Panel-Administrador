"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { Search, Filter, X, CreditCard, Clock, Package, Truck, CheckCircle2, ChevronDown, Check } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

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

type Option = { value: string; label: string; icon: any };

function FilterSelect({ options, value, onChange, placeholder }: {
  options: Option[];
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const selected = options.find(o => o.value === value);

  const openMenu = () => {
    if (btnRef.current) setRect(btnRef.current.getBoundingClientRect());
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (btnRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const menuStyle: React.CSSProperties = rect ? (() => {
    const menuH = options.length * 44 + 12;
    const spaceBelow = window.innerHeight - rect.bottom;
    const goUp = spaceBelow < menuH + 8 && rect.top > menuH + 8;
    return {
      position: "fixed",
      top: goUp ? rect.top - menuH - 4 : rect.bottom + 4,
      left: Math.min(rect.left, window.innerWidth - rect.width - 8),
      width: rect.width,
      zIndex: 99999,
    };
  })() : {};

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={() => open ? setOpen(false) : openMenu()}
        className={`flex items-center justify-between w-full px-4 py-2.5 bg-white/[0.03] border border-white/[0.05] rounded-xl text-sm text-white hover:bg-white/5 hover:border-white/[0.07] transition-all duration-200 focus:outline-none ${open ? "ring-1 ring-emerald-500/50 border-emerald-500/50" : ""}`}
      >
        <span className="flex items-center gap-2 truncate">
          {selected?.icon && <selected.icon className="h-4 w-4 text-slate-500 shrink-0" />}
          <span className={selected ? "text-white" : "text-slate-500"}>{selected?.label ?? placeholder}</span>
        </span>
        <ChevronDown className={`h-4 w-4 text-slate-500 shrink-0 transition-transform duration-200 ${open ? "rotate-180 text-emerald-400" : ""}`} />
      </button>

      {open && rect && createPortal(
        <div
          style={{ ...menuStyle, background: "rgb(15 23 42 / 0.98)", backdropFilter: "blur(12px)" }}
          className="py-1.5 rounded-xl border border-white/[0.07] shadow-[0_10px_30px_rgba(0,0,0,0.6)]"
        >
          {options.map(opt => {
            const isSelected = value === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onMouseDown={e => e.stopPropagation()}
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={`flex items-center justify-between w-full px-4 py-2.5 text-sm transition-colors ${isSelected ? "bg-emerald-500/10 text-emerald-400 font-medium" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}
              >
                <span className="flex items-center gap-2">
                  <opt.icon className={`h-4 w-4 ${isSelected ? "text-emerald-400" : "text-slate-500"}`} />
                  {opt.label}
                </span>
                {isSelected && <Check className="h-3.5 w-3.5" />}
              </button>
            );
          })}
        </div>,
        document.body
      )}
    </>
  );
}

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
      newSearchParams.delete("page");
      return newSearchParams.toString();
    },
    [searchParams]
  );

  useEffect(() => {
    const currentSearch = searchParams.get("search") || "";
    if (search === currentSearch) return;
    const timer = setTimeout(() => {
      router.push(`${pathname}?${createQueryString({ search })}`);
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
    setSearch(""); setStatus("all"); setPayment("all");
    router.push(pathname);
  };

  const hasActiveFilters = search || status !== "all" || payment !== "all";

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-white transition-colors" />
          <input
            type="text"
            placeholder="Buscar por cliente, email o #orden..."
            className="w-full bg-surface border border-white/[0.05] rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-white/10 transition-all placeholder:text-slate-600"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/5 rounded-full text-slate-500 hover:text-white transition-colors">
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        <div className="w-full md:w-64">
          <FilterSelect options={statusOptions} value={status} onChange={handleStatusChange} placeholder="Estado de entrega" />
        </div>

        <div className="w-full md:w-64">
          <FilterSelect options={paymentOptions} value={payment} onChange={handlePaymentChange} placeholder="Estado de pago" />
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-300">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mr-2">Filtros:</span>

          {search && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/[0.07] rounded-full text-xs text-white">
              <Search className="h-3 w-3 text-slate-500" />
              <span>"{search}"</span>
              <button onClick={() => setSearch("")} className="hover:text-red-400 transition-colors"><X className="h-3 w-3" /></button>
            </div>
          )}

          {status !== "all" && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/[0.07] rounded-full text-xs text-white">
              <Filter className="h-3 w-3 text-slate-500" />
              <span>{statusOptions.find(o => o.value === status)?.label}</span>
              <button onClick={() => handleStatusChange("all")} className="hover:text-red-400 transition-colors"><X className="h-3 w-3" /></button>
            </div>
          )}

          {payment !== "all" && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/[0.07] rounded-full text-xs text-white">
              <CreditCard className="h-3 w-3 text-slate-500" />
              <span>{paymentOptions.find(o => o.value === payment)?.label}</span>
              <button onClick={() => handlePaymentChange("all")} className="hover:text-red-400 transition-colors"><X className="h-3 w-3" /></button>
            </div>
          )}

          <button onClick={clearFilters} className="text-xs font-bold text-slate-500 hover:text-white transition-colors underline underline-offset-4 decoration-zinc-700 hover:decoration-white ml-2">
            Limpiar todo
          </button>
        </div>
      )}
    </div>
  );
}
