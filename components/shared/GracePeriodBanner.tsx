"use client";

import Link from "next/link";
import { AlertTriangle, X, CreditCard, CheckCircle2, ExternalLink, Tag, Calendar } from "lucide-react";
import { useState, useEffect } from "react";
import { useSubscription } from "./SubscriptionContext";

export function GracePeriodBanner() {
  const { atRisk, graceDaysLeft, paymentUrl, planName, planPrice } = useSubscription();
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const main = document.querySelector("main");
    if (!main) return;
    main.style.overflow = modalOpen ? "hidden" : "";
    return () => { main.style.overflow = ""; };
  }, [modalOpen]);

  if (!atRisk) return null;

  const dayLabel = graceDaysLeft === 1 ? "día" : "días";

  const btnClass = "flex-shrink-0 rounded-lg bg-amber-500 hover:bg-amber-400 active:bg-amber-600 px-3.5 py-1.5 text-xs font-bold text-slate-950 transition-colors duration-150 whitespace-nowrap shadow-[0_0_12px_rgba(245,158,11,0.35)]";

  return (
    <>
      <div className="sticky top-0 z-20 w-full bg-gradient-to-r from-amber-950/80 via-orange-950/80 to-amber-950/80 border-b border-amber-500/25 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-3 px-5 py-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex-shrink-0 h-7 w-7 rounded-full bg-amber-500/15 border border-amber-500/40 flex items-center justify-center">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
            </div>
            <p className="text-sm text-amber-200/90 leading-snug">
              <span className="font-semibold text-amber-300">Tu suscripción está vencida.</span>{" "}
              {graceDaysLeft > 0 ? (
                <>
                  Tenés un plazo de{" "}
                  <span className="font-bold text-white">{graceDaysLeft} {dayLabel}</span>{" "}
                  para renovar tu suscripción antes de que tu panel sea bloqueado.
                </>
              ) : (
                <>Tenés hasta hoy para renovar tu suscripción antes de que tu panel sea bloqueado.</>
              )}
            </p>
          </div>
          {paymentUrl ? (
            <button onClick={() => setModalOpen(true)} className={btnClass}>
              Renovar ahora
            </button>
          ) : (
            <Link href="/admin/mi-plan" className={btnClass}>
              Renovar ahora
            </Link>
          )}
        </div>
      </div>

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95"
          onClick={(e) => { if (e.target === e.currentTarget) setModalOpen(false); }}
        >
          <div className="w-full max-w-md bg-[#111318] border border-border rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                  <CreditCard className="h-4 w-4 text-amber-400" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground">Renovar suscripción</h2>
                  <p className="text-xs text-slate-500">Revisá los detalles antes de continuar</p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Plan info */}
            <div className="px-6 py-5 space-y-4">
              <div className="rounded-xl bg-white/[0.03] border border-border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Tag className="h-4 w-4 text-slate-400" />
                    <span className="text-sm font-medium">Plan contratado</span>
                  </div>
                  <span className="text-sm font-bold text-foreground">{planName ?? "—"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-300">
                    <CreditCard className="h-4 w-4 text-slate-400" />
                    <span className="text-sm font-medium">Monto a renovar</span>
                  </div>
                  <span className="text-sm font-bold text-amber-400">{planPrice ?? "—"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <span className="text-sm font-medium">Período de gracia</span>
                  </div>
                  <span className="text-sm font-semibold text-white">
                    {graceDaysLeft > 0 ? `${graceDaysLeft} ${dayLabel} restantes` : "Vence hoy"}
                  </span>
                </div>
              </div>

              <div className="rounded-xl bg-amber-500/5 border border-amber-500/15 px-4 py-3 flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-amber-300/80 leading-relaxed">
                  Al renovar, serás redirigido a MercadoPago para completar el pago de forma segura. Tu suscripción se reactivará automáticamente una vez confirmado.
                </p>
              </div>

              <div className="pt-1 space-y-2">
                <a
                  href={paymentUrl!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 px-4 py-3 text-sm font-bold text-slate-950 transition-colors shadow-[0_0_20px_rgba(245,158,11,0.25)]"
                >
                  Continuar a MercadoPago
                  <ExternalLink className="h-4 w-4" />
                </a>
                <button
                  onClick={() => setModalOpen(false)}
                  className="w-full rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
