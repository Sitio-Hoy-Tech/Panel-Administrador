"use client";

import { useEffect, useState } from "react";
import { X, User, Mail, Phone, Calendar, ShoppingBag, TrendingUp, Tag } from "lucide-react";
import { createPortal } from "react-dom";

interface ClientType {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  firstOrderAt: string;
  lastOrderAt: string;
}

interface ClientDetailsModalProps {
  clientId: string | null;
  client: ClientType | undefined;
  onClose: () => void;
}

export function ClientDetailsModal({ clientId, client, onClose }: ClientDetailsModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Lock scroll when modal is open as per admin panel guidelines
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  if (!mounted || !clientId || !client) return null;

  const formattedTotal = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0
  }).format(client.totalSpent || 0);

  const formattedFirstOrder = new Date(client.firstOrderAt).toLocaleDateString('es-AR', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
  const formattedLastOrder = new Date(client.lastOrderAt).toLocaleDateString('es-AR', {
    day: '2-digit', month: 'short', year: 'numeric'
  });

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-surface/90 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-in zoom-in-95 fade-in duration-200 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl border border-primary/20 shadow-inner">
              {client.firstName ? client.firstName[0].toUpperCase() : (client.email[0].toUpperCase() || 'C')}
            </div>
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">{client.firstName} {client.lastName}</h3>
              <p className="text-xs text-zinc-500 mt-1 uppercase tracking-widest flex items-center gap-1">
                 Cliente
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg transition-colors group">
            <X className="h-5 w-5 text-zinc-400 group-hover:text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="glass-panel p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-zinc-400 text-sm">
                <ShoppingBag className="h-4 w-4" /> Pedidos
              </div>
              <p className="text-2xl font-bold text-white">{client.totalOrders}</p>
            </div>
            <div className="glass-panel p-4 flex flex-col gap-2 bg-primary/5 border-primary/10">
              <div className="flex items-center gap-2 text-primary/80 text-sm">
                <TrendingUp className="h-4 w-4" /> Total Gastado
              </div>
              <p className="text-2xl font-bold text-primary">{formattedTotal}</p>
            </div>
            <div className="glass-panel p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-zinc-400 text-sm">
                <Tag className="h-4 w-4" /> Ticket Promedio
              </div>
              <p className="text-2xl font-bold text-white">
                {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format((client.totalSpent || 0) / (client.totalOrders || 1))}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Info Contacto */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                <User className="h-3 w-3" /> Contacto
              </h4>
              <div className="glass-panel p-4 space-y-4">
                <div className="flex items-center gap-3 text-sm text-zinc-300">
                  <Mail className="h-4 w-4 text-zinc-500" />
                  <a href={`mailto:${client.email}`} className="hover:text-primary transition-colors">{client.email}</a>
                </div>
                {client.phone && (
                  <div className="flex items-center gap-3 text-sm text-zinc-300">
                    <Phone className="h-4 w-4 text-zinc-500" />
                    <a href={`https://wa.me/${client.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">{client.phone}</a>
                  </div>
                )}
              </div>
            </div>

            {/* Actividad */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                <Calendar className="h-3 w-3" /> Actividad
              </h4>
              <div className="glass-panel p-4 space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-500">Primer pedido</span>
                  <span className="text-white font-medium">{formattedFirstOrder}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-500">Último pedido</span>
                  <span className="text-white font-medium">{formattedLastOrder}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
              <ShoppingBag className="h-3 w-3" /> Historial Reciente
            </h4>
            <div className="glass-panel p-8 text-center text-zinc-500 text-sm">
              <p>El historial detallado de pedidos por cliente se habilitará próximamente.</p>
              <button className="mt-4 px-4 py-2 border border-white/10 rounded-lg hover:bg-white/5 transition-colors text-white text-sm font-medium">
                Ver todos los pedidos
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
