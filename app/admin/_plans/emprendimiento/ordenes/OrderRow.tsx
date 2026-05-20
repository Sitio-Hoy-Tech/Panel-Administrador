"use client";

import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Eye } from "lucide-react";
import { actualizarEstadoOrden } from "@/actions/emprendimiento/ordenes";
import { toast } from "sonner";
import { StatusDropdown } from "./StatusDropdown";

interface OrderRowProps {
  order: any;
  onViewDetails: () => void;
}

export function OrderRow({ order, onViewDetails }: OrderRowProps) {
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
    <tr className="group hover:bg-white/[0.01] transition-colors">
      <td className="px-6 py-4">
        <div className="flex flex-col">
          <span className="font-bold text-white text-sm">
            #{order.id.slice(0, 8).toUpperCase()}
          </span>
          <span className="text-xs text-slate-400">
            {order.customer_first_name} {order.customer_last_name}
          </span>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className="text-sm font-bold text-white">
          ${new Intl.NumberFormat('es-AR').format(order.total)}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          {order.mp_payment_id ? (
            <div className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
              MP OK
            </div>
          ) : (
            <div className="px-2 py-0.5 rounded bg-slate-500/10 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
              PEND
            </div>
          )}
        </div>
      </td>
      <td className="px-6 py-4">
        <StatusDropdown 
          currentStatus={order.status} 
          onSelect={handleStatusChange} 
          isUpdating={isUpdating}
        />
      </td>
      <td className="px-6 py-4">
        <span className="text-xs text-slate-500">
          {format(new Date(order.created_at), "dd MMM, HH:mm", { locale: es })}
        </span>
      </td>
      <td className="px-6 py-4 text-right">
        <button 
          onClick={onViewDetails}
          className="p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-lg transition-all group-hover:scale-110"
        >
          <Eye className="h-4 w-4" />
        </button>
      </td>
    </tr>
  );
}
