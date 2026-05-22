"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { useSubscription } from "./SubscriptionContext";

export function GracePeriodBanner() {
  const { atRisk, graceDaysLeft, paymentUrl } = useSubscription();

  if (!atRisk) return null;

  const dayLabel = graceDaysLeft === 1 ? "día" : "días";

  const btnClass = "flex-shrink-0 rounded-lg bg-amber-500 hover:bg-amber-400 active:bg-amber-600 px-3.5 py-1.5 text-xs font-bold text-slate-950 transition-colors duration-150 whitespace-nowrap shadow-[0_0_12px_rgba(245,158,11,0.35)]";

  return (
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
          <a
            href={paymentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={btnClass}
          >
            Renovar ahora
          </a>
        ) : (
          <Link href="/admin/mi-plan" className={btnClass}>
            Renovar ahora
          </Link>
        )}
      </div>
    </div>
  );
}
