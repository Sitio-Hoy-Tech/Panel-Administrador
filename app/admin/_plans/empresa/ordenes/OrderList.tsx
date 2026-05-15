"use client";

import { useState } from "react";
import { OrderRow } from "./OrderRow";
import { OrderDetailsModal } from "./OrderDetailsModal";
import { ShoppingCart, Eye, Calendar, User, CreditCard } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { StatusDropdown } from "./StatusDropdown";
import { actualizarEstadoOrden } from "@/actions/empresa/ordenes";
import { toast } from "sonner";

export function OrderList({ orders }: { orders: any[] }) {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  if (!orders || orders.length === 0) {
    return (
      <div className="p-16 text-center flex flex-col items-center justify-center relative overflow-hidden">
        <div className="h-20 w-20 bg-surface border border-white/5 rounded-2xl flex items-center justify-center mb-6">
          <ShoppingCart className="h-8 w-8 text-zinc-500" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">Sin ordenes todavía</h3>
        <p className="text-zinc-400 max-w-md text-sm">
          Cuando tus clientes compren productos, aparecerán acá.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop View */}
      <div className="hidden md:block">
        <table className="w-full text-left">
          <thead>
            <tr className="text-zinc-500 text-[11px] uppercase tracking-[0.15em] font-bold border-b border-white/5">
              <th className="px-6 py-4">Orden / Cliente</th>
              <th className="px-6 py-4">Total</th>
              <th className="px-6 py-4">Estado Pago</th>
              <th className="px-6 py-4">Estado Entrega</th>
              <th className="px-6 py-4">Fecha</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {orders.map((order: any) => (
              <OrderRow 
                key={order.id} 
                order={order} 
                onViewDetails={() => setSelectedOrderId(order.id)} 
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile View */}
      <div className="md:hidden grid grid-cols-1 gap-4 p-4">
        {orders.map((order: any) => (
          <OrderCard 
            key={order.id} 
            order={order} 
            onViewDetails={() => setSelectedOrderId(order.id)} 
          />
        ))}
      </div>

      <OrderDetailsModal 
        orderId={selectedOrderId} 
        onClose={() => setSelectedOrderId(null)} 
      />
    </>
  );
}

function OrderCard({ order, onViewDetails }: { order: any, onViewDetails: () => void }) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === order.status) return;
    setIsUpdating(true);
    const result = await actualizarEstadoOrden(order.id, newStatus);
    setIsUpdating(false);
    if (result.success) {
      toast.success("Estado actualizado");
    } else {
      toast.error("Error al actualizar");
    }
  };

  return (
    <div className="glass-panel p-5 space-y-4 relative group">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-blue-500/10 transition-colors" />
      
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-zinc-500 uppercase tracking-widest">Orden</span>
            <span className="text-sm font-bold text-white">#{order.id.slice(0, 8).toUpperCase()}</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-400">
            <User className="h-3.5 w-3.5" />
            <span className="text-sm font-medium">{order.customer_first_name} {order.customer_last_name}</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-black text-white">${new Intl.NumberFormat('es-AR').format(order.total)}</p>
          <div className="flex items-center justify-end gap-1.5 mt-1">
            <CreditCard className={`h-3 w-3 ${order.mp_payment_id ? 'text-emerald-400' : 'text-zinc-500'}`} />
            <span className={`text-[10px] font-bold uppercase tracking-wider ${order.mp_payment_id ? 'text-emerald-400' : 'text-zinc-500'}`}>
              {order.mp_payment_id ? 'Cobrado' : 'Pendiente'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-white/5">
        <div className="flex items-center gap-2 text-zinc-500">
          <Calendar className="h-3.5 w-3.5" />
          <span className="text-xs">{format(new Date(order.created_at), "dd MMM, HH:mm", { locale: es })}</span>
        </div>
        <div className="flex items-center gap-3">
          <StatusDropdown 
            currentStatus={order.status} 
            onSelect={handleStatusChange} 
            isUpdating={isUpdating}
          />
          <button 
            onClick={onViewDetails}
            className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-zinc-400 hover:text-white transition-all active:scale-90"
          >
            <Eye className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
