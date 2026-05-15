"use client";

import { Save, Smartphone, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useActionState, useEffect } from "react";
import { updatePhone, type ActionState } from "@/actions/esencial/configuracion";

const initialState: ActionState = {
  success: false,
};

export function ConfigForm({ initialPhone }: { initialPhone: string }) {
  const [state, formAction, isPending] = useActionState(updatePhone, initialState);

  return (
    <form action={formAction} className="glass-panel p-6 md:p-8 space-y-8">
      {/* Mensajes de feedback */}
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

      {/* WhatsApp */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-green-400" />
            WhatsApp de Ventas
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            Todos los botones de "Comprar" y "Contactar" de tu web redirigirán a este número.
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="phone" className="text-sm font-medium text-zinc-300">Número con código de área</label>
          <div className="relative">
            <span className="absolute left-4 top-3.5 text-zinc-500 font-medium">+54 9</span>
            <input
              id="phone"
              name="phone"
              type="text"
              placeholder="11 1234 5678"
              className="w-full bg-black/50 border border-white/10 rounded-lg pl-16 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all placeholder:text-zinc-700"
              defaultValue={initialPhone}
              disabled={isPending}
            />
          </div>
          <p className="text-xs text-zinc-500">No incluyas el 0 ni el 15. Ej: +54 9 3329 123456</p>
        </div>
      </section>

      <div className="pt-6 border-t border-white/10 flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
          {isPending ? "Guardando..." : "Guardar Cambios"}
        </button>
      </div>
    </form>
  );
}
