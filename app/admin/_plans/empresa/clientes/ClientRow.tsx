"use client";

import { Eye, Mail, Phone, Calendar } from "lucide-react";

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

interface ClientRowProps {
  client: ClientType;
  onClick: () => void;
  isMobile?: boolean;
}

export function ClientRow({ client, onClick, isMobile = false }: ClientRowProps) {
  const formattedTotal = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0
  }).format(client.totalSpent || 0);

  const formattedDate = new Date(client.lastOrderAt).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  if (isMobile) {
    return (
      <div className="p-4 space-y-4 hover:bg-white/[0.02] transition-colors cursor-pointer" onClick={onClick}>
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
              {client.firstName ? client.firstName[0].toUpperCase() : (client.email[0].toUpperCase() || 'C')}
            </div>
            <div>
              <p className="font-bold text-white text-sm">{client.firstName} {client.lastName}</p>
              <p className="text-xs text-slate-400">{client.email}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-bold text-white text-sm">{formattedTotal}</p>
            <p className="text-xs text-slate-500">{client.totalOrders} pedidos</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <tr className="hover:bg-white/[0.02] transition-colors group">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
            {client.firstName ? client.firstName[0].toUpperCase() : (client.email[0].toUpperCase() || 'C')}
          </div>
          <div>
            <p className="font-bold text-white group-hover:text-primary transition-colors cursor-pointer" onClick={onClick}>
              {client.firstName} {client.lastName}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-xs text-slate-400 flex items-center gap-1"><Mail className="h-3 w-3" /> {client.email}</p>
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className="font-bold text-white">{formattedTotal}</span>
      </td>
      <td className="px-6 py-4 text-center text-slate-300">
        <span className="bg-white/5 px-2.5 py-1 rounded-md text-xs font-medium border border-white/[0.05]">
          {client.totalOrders}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-slate-300 flex items-center gap-2">
          <Calendar className="h-4 w-4 text-slate-500" />
          {formattedDate}
        </div>
      </td>
      <td className="px-6 py-4 text-right">
        <button
          onClick={onClick}
          className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors tooltip-trigger relative"
          title="Ver Detalle"
        >
          <Eye className="h-4 w-4" />
        </button>
      </td>
    </tr>
  );
}
