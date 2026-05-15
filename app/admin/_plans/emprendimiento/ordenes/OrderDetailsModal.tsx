"use client";

import { useEffect, useState } from "react";
import { getOrdenById } from "@/actions/emprendimiento/ordenes";
import { X, Package, Truck, CreditCard, User, Mail, Phone, MapPin, Loader2 } from "lucide-react";
import { createPortal } from "react-dom";

interface OrderDetailsModalProps {
  orderId: string | null;
  onClose: () => void;
}

export function OrderDetailsModal({ orderId, onClose }: OrderDetailsModalProps) {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (orderId) {
      loadOrderDetails();
    } else {
      setOrder(null);
    }
  }, [orderId]);

  const loadOrderDetails = async () => {
    if (!orderId) return;
    setLoading(true);
    const result = await getOrdenById(orderId);
    if (result.success) {
      setOrder(result.data);
    }
    setLoading(false);
  };

  if (!mounted || !orderId) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-surface/90 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-in zoom-in-95 fade-in duration-200 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">Detalle de la Orden</h3>
            <p className="text-xs text-zinc-500 mt-1 uppercase tracking-widest">#{orderId.slice(0, 8).toUpperCase()}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
            <X className="h-5 w-5 text-zinc-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-3">
              <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
              <p className="text-sm text-zinc-500">Cargando detalles...</p>
            </div>
          ) : order ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Info Cliente */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                    <User className="h-3 w-3" /> Cliente
                  </h4>
                  <div className="glass-panel p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 font-bold text-xs">
                        {order.customer_first_name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{order.customer_first_name} {order.customer_last_name}</p>
                        <p className="text-xs text-zinc-500">Comprador</p>
                      </div>
                    </div>
                    <div className="pt-2 space-y-2 border-t border-white/5">
                      <div className="flex items-center gap-2 text-xs text-zinc-400">
                        <Mail className="h-3 w-3" /> {order.payer_email}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-zinc-400">
                        <Phone className="h-3 w-3" /> {order.customer_phone}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Envío */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                    <Truck className="h-3 w-3" /> Envío
                  </h4>
                  <div className="glass-panel p-4 space-y-2">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-zinc-500 mt-0.5" />
                      <div>
                        <p className="text-sm text-white">{order.shipping_address?.address}, {order.shipping_address?.city}</p>
                        <p className="text-xs text-zinc-500">{order.shipping_address?.province}, {order.shipping_address?.zip_code}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Productos */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                  <Package className="h-3 w-3" /> Productos
                </h4>
                <div className="glass-panel overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-white/[0.02] border-b border-white/5">
                      <tr>
                        <th className="px-4 py-3 font-medium text-zinc-500">Producto</th>
                        <th className="px-4 py-3 font-medium text-zinc-500 text-center">Cant.</th>
                        <th className="px-4 py-3 font-medium text-zinc-500 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {order.order_items?.map((item: any) => (
                        <tr key={item.id}>
                          <td className="px-4 py-4">
                            <p className="text-white font-medium">{item.name}</p>
                            {item.variant_name && <p className="text-[10px] text-zinc-500">{item.variant_name}</p>}
                          </td>
                          <td className="px-4 py-4 text-center text-zinc-400">x{item.quantity}</td>
                          <td className="px-4 py-4 text-right text-white font-bold">${new Intl.NumberFormat('es-AR').format(item.unit_price * item.quantity)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-white/[0.02] border-t border-white/5">
                      <tr>
                        <td colSpan={2} className="px-4 py-3 text-zinc-400">Envío</td>
                        <td className="px-4 py-3 text-right text-white font-bold">${new Intl.NumberFormat('es-AR').format(order.shipping_cost || 0)}</td>
                      </tr>
                      {order.discount_amount > 0 && (
                        <tr>
                          <td colSpan={2} className="px-4 py-3 text-emerald-400 font-medium">Descuento ({order.coupon_code})</td>
                          <td className="px-4 py-3 text-right text-emerald-400 font-bold">-${new Intl.NumberFormat('es-AR').format(order.discount_amount)}</td>
                        </tr>
                      )}
                      <tr className="border-t border-white/10">
                        <td colSpan={2} className="px-4 py-4 text-white font-bold text-lg">Total</td>
                        <td className="px-4 py-4 text-right text-blue-400 font-bold text-xl">${new Intl.NumberFormat('es-AR').format(order.total)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <p className="text-center text-zinc-500 py-12">No se pudo encontrar la información de la orden.</p>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-black/20 border-t border-white/5 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
