"use client";

import { useState } from "react";
import { Plus, Ticket, Search, MoreVertical, Trash, Edit2, CheckCircle, XCircle } from "lucide-react";
import { CouponModal } from "./CouponModal";
import { deleteCupon, toggleCuponStatus } from "@/actions/empresa/cupones";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Coupon {
  id: string;
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  min_amount: number | null;
  max_uses: number | null;
  uses_count: number;
  expires_at: string | null;
  active: boolean;
}

interface CouponsClientProps {
  initialCoupons: Coupon[];
}

export function CouponsClient({ initialCoupons }: CouponsClientProps) {
  const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  const filteredCoupons = coupons.filter(c => 
    c.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este cupón?")) return;
    
    const result = await deleteCupon(id);
    if (result.success) {
      setCoupons(prev => prev.filter(c => c.id !== id));
      toast.success("Cupón eliminado");
    } else {
      toast.error(result.error || "Error al eliminar");
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    const result = await toggleCuponStatus(id, !currentStatus);
    if (result.success) {
      setCoupons(prev => prev.map(c => c.id === id ? { ...c, active: !currentStatus } : c));
      toast.success(currentStatus ? "Cupón desactivado" : "Cupón activado");
    } else {
      toast.error(result.error || "Error al cambiar estado");
    }
  };

  const openEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setIsModalOpen(true);
  };

  const openCreate = () => {
    setEditingCoupon(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Ticket className="h-6 w-6 text-primary" />
            Cupones de Descuento
          </h1>
          <p className="text-slate-400">
            Creá y gestioná códigos promocionales para tus clientes.
          </p>
        </div>
        <button 
          onClick={openCreate}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-black font-semibold rounded-xl hover:bg-slate-200 hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
        >
          <Plus className="h-5 w-5" />
          Nuevo Cupón
        </button>
      </div>

      <div className="glass-panel overflow-hidden">
        <div className="p-4 border-b border-white/[0.05] bg-white/[0.02] flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar código..."
              className="glass-input pl-10 py-2 w-full text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              suppressHydrationWarning
            />
          </div>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-sm whitespace-nowrap min-w-[800px]">
            <thead className="bg-white/[0.02] border-b border-white/[0.05]">
              <tr>
                <th className="px-6 py-4 font-medium text-slate-400">Código</th>
                <th className="px-6 py-4 font-medium text-slate-400">Descuento</th>
                <th className="px-6 py-4 font-medium text-slate-400 text-center">Uso</th>
                <th className="px-6 py-4 font-medium text-slate-400">Vencimiento</th>
                <th className="px-6 py-4 font-medium text-slate-400 text-center">Estado</th>
                <th className="px-6 py-4 font-medium text-slate-400 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredCoupons.length > 0 ? (
                filteredCoupons.map((coupon) => (
                  <tr key={coupon.id} className="group hover:bg-white/[0.01] transition-colors">
                    <td className="px-6 py-4">
                      <div className="inline-flex items-center px-3 py-1 rounded-md bg-white/5 border border-white/[0.07] text-white font-mono font-bold tracking-wider">
                        {coupon.code}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-white">
                        {coupon.type === 'percent' && `${coupon.value}% OFF`}
                        {coupon.type === 'fixed' && `$${new Intl.NumberFormat('es-AR').format(coupon.value)} OFF`}
                      </span>
                      {coupon.min_amount && coupon.min_amount > 0 && (
                        <p className="text-[10px] text-slate-500 mt-1">Min. ${new Intl.NumberFormat('es-AR').format(coupon.min_amount)}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-white font-medium">{coupon.uses_count}</span>
                        {coupon.max_uses && (
                          <span className="text-[10px] text-slate-500">de {coupon.max_uses}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-400">
                        {coupon.expires_at ? format(new Date(coupon.expires_at), "dd MMM yyyy", { locale: es }) : 'Sin caducidad'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => handleToggleStatus(coupon.id, coupon.active)}
                        className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider transition-colors ${
                          coupon.active 
                            ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20' 
                            : 'bg-slate-500/10 text-slate-500 hover:bg-slate-500/20'
                        }`}
                      >
                        {coupon.active ? 'Activo' : 'Inactivo'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => openEdit(coupon)}
                          className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(coupon.id)}
                          className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    No se encontraron cupones.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <CouponModal 
          coupon={editingCoupon}
          onClose={() => setIsModalOpen(false)}
          onSuccess={(newCoupon) => {
            if (editingCoupon) {
              setCoupons(prev => prev.map(c => c.id === newCoupon.id ? newCoupon : c));
            } else {
              setCoupons(prev => [newCoupon, ...prev]);
            }
            setIsModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
