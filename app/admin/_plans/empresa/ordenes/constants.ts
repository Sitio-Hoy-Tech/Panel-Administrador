"use client";

import { CheckCircle2, Package, Truck, XCircle, Clock } from "lucide-react";

export const statusMap: any = {
  confirmed: { label: "Pagado", color: "text-emerald-400", bg: "bg-emerald-400/10", icon: CheckCircle2 },
  preparing: { label: "En Preparación", color: "text-amber-400", bg: "bg-amber-400/10", icon: Package },
  shipped: { label: "Enviado", color: "text-emerald-400", bg: "bg-emerald-400/10", icon: Truck },
  delivered: { label: "Entregado", color: "text-green-400", bg: "bg-green-400/10", icon: CheckCircle2 },
  cancelled: { label: "Cancelado", color: "text-red-400", bg: "bg-red-400/10", icon: XCircle },
  pending: { label: "Pendiente Pago", color: "text-slate-500", bg: "bg-slate-500/10", icon: Clock },
};
