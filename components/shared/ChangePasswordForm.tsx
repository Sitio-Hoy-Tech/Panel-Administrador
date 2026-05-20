"use client";

import { KeyRound, CheckCircle2, AlertCircle, Loader2, Eye, EyeOff, HelpCircle } from "lucide-react";
import { useActionState, useState, useTransition } from "react";
import { updatePassword, requestPasswordReset, type PasswordActionState } from "@/actions/auth";

const initialState: PasswordActionState = { success: false };

export function ChangePasswordForm() {
  const [state, formAction, isPending] = useActionState(updatePassword, initialState);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [resetState, setResetState] = useState<{ success?: boolean; message?: string; error?: string } | null>(null);
  const [isRequestPending, startResetTransition] = useTransition();

  function handleResetRequest() {
    startResetTransition(async () => {
      const result = await requestPasswordReset();
      setResetState(result);
    });
  }

  return (
    <form action={formAction} className="glass-panel p-6 md:p-8 space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <KeyRound className="h-5 w-5 text-emerald-400" />
          Cambiar Contraseña
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Actualizá la contraseña de acceso a tu panel de administración.
        </p>
      </div>

      {state.success && (
        <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-lg flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm">{state.message}</p>
        </div>
      )}

      {state.error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg flex items-center gap-3">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm">{state.error}</p>
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="current_password" className="text-sm font-medium text-slate-300">
            Contraseña actual
          </label>
          <div className="relative">
            <input
              id="current_password"
              name="current_password"
              type={showCurrent ? "text" : "password"}
              autoComplete="current-password"
              disabled={isPending}
              className="w-full bg-black/50 border border-white/[0.07] rounded-lg px-4 py-3 pr-11 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all placeholder:text-slate-700 disabled:opacity-50"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowCurrent((v) => !v)}
              className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-300 transition-colors"
              tabIndex={-1}
              aria-label={showCurrent ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="new_password" className="text-sm font-medium text-slate-300">
            Nueva contraseña
          </label>
          <div className="relative">
            <input
              id="new_password"
              name="new_password"
              type={showNew ? "text" : "password"}
              autoComplete="new-password"
              disabled={isPending}
              className="w-full bg-black/50 border border-white/[0.07] rounded-lg px-4 py-3 pr-11 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all placeholder:text-slate-700 disabled:opacity-50"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowNew((v) => !v)}
              className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-300 transition-colors"
              tabIndex={-1}
              aria-label={showNew ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <p className="text-xs text-slate-500">Mínimo 6 caracteres.</p>
        </div>

        <div className="space-y-2">
          <label htmlFor="confirm_password" className="text-sm font-medium text-slate-300">
            Confirmar nueva contraseña
          </label>
          <div className="relative">
            <input
              id="confirm_password"
              name="confirm_password"
              type={showConfirm ? "text" : "password"}
              autoComplete="new-password"
              disabled={isPending}
              className="w-full bg-black/50 border border-white/[0.07] rounded-lg px-4 py-3 pr-11 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all placeholder:text-slate-700 disabled:opacity-50"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-300 transition-colors"
              tabIndex={-1}
              aria-label={showConfirm ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      <div className="pt-2 flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <KeyRound className="h-5 w-5" />}
          {isPending ? "Actualizando..." : "Actualizar contraseña"}
        </button>
      </div>

      <div className="border-t border-white/[0.07] pt-5">
        <p className="text-sm text-slate-500 mb-3 flex items-center gap-1.5">
          <HelpCircle className="h-4 w-4 flex-shrink-0" />
          ¿No recordás tu contraseña actual? Podés pedirle al equipo de SitioHoy que te la cambie.
        </p>

        {resetState?.success && (
          <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-lg flex items-center gap-3 mb-3">
            <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm">{resetState.message}</p>
          </div>
        )}

        {resetState?.error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg flex items-center gap-3 mb-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm">{resetState.error}</p>
          </div>
        )}

        {!resetState?.success && (
          <button
            type="button"
            onClick={handleResetRequest}
            disabled={isRequestPending}
            className="flex items-center gap-2 border border-white/[0.07] text-slate-300 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRequestPending
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <img src="/logo-sitiohoy.png" alt="SitioHoy" className="h-4 w-auto" />}
            {isRequestPending ? "Enviando solicitud..." : "Solicitar cambio a SitioHoy"}
          </button>
        )}
      </div>
    </form>
  );
}
