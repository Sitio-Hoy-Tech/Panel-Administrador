"use client";

import { Send, CheckCircle2, AlertCircle, Loader2, ChevronDown, Check } from "lucide-react";
import { useActionState, useState, useRef, useEffect } from "react";
import { submitSupportRequest, type SupportRequestState } from "@/actions/soporte";

const initialState: SupportRequestState = { success: false };

const QUERY_TYPES = [
  { value: "support_technical", label: "Problema técnico" },
  { value: "support_configuration", label: "Configuración del sitio" },
  { value: "support_billing", label: "Plan o facturación" },
  { value: "support_other", label: "Otra consulta" },
];

function CustomSelect({
  disabled,
  value,
  onChange,
}: {
  disabled: boolean;
  value: string;
  onChange: (val: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const selected = QUERY_TYPES.find((t) => t.value === value);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className="w-full bg-black/50 border border-white/[0.07] rounded-lg px-4 py-3 text-left flex items-center justify-between gap-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all disabled:opacity-50"
      >
        <span className={selected ? "text-white" : "text-slate-600"}>
          {selected ? selected.label : "Seleccioná una opción..."}
        </span>
        <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform flex-shrink-0 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <ul className="absolute z-10 mt-1 w-full bg-slate-900 border border-white/[0.07] rounded-lg overflow-hidden shadow-xl">
          {QUERY_TYPES.map((t) => (
            <li key={t.value}>
              <button
                type="button"
                onClick={() => { onChange(t.value); setOpen(false); }}
                className="w-full px-4 py-3 text-left text-sm flex items-center justify-between gap-2 hover:bg-white/5 transition-colors"
              >
                <span className={t.value === value ? "text-white font-medium" : "text-slate-300"}>
                  {t.label}
                </span>
                {t.value === value && <Check className="h-4 w-4 text-emerald-400 flex-shrink-0" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function SupportContactForm() {
  const [state, formAction, isPending] = useActionState(submitSupportRequest, initialState);
  const [selectedType, setSelectedType] = useState("");

  if (state.success) {
    return (
      <div className="glass-panel p-6 md:p-8">
        <div className="flex flex-col items-center justify-center gap-3 py-6 text-center">
          <CheckCircle2 className="h-10 w-10 text-green-400" />
          <p className="text-white font-semibold text-lg">Consulta enviada</p>
          <p className="text-sm text-slate-400">{state.message}</p>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="glass-panel p-6 md:p-8 space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <Send className="h-5 w-5 text-emerald-400" />
          Enviar consulta al equipo de SitioHoy
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Completá el formulario y te respondemos a la brevedad.
        </p>
      </div>

      {state.error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg flex items-center gap-3">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm">{state.error}</p>
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-300">Tipo de consulta</label>
        <input type="hidden" name="type" value={selectedType} />
        <CustomSelect disabled={isPending} value={selectedType} onChange={setSelectedType} />
      </div>

      <div className="space-y-2">
        <label htmlFor="message" className="text-sm font-medium text-slate-300">
          Mensaje
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          disabled={isPending}
          placeholder="Describí tu consulta con el mayor detalle posible..."
          className="w-full bg-black/50 border border-white/[0.07] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all placeholder:text-slate-700 disabled:opacity-50 resize-none"
        />
      </div>

      <div className="flex justify-end pt-1">
        <button
          type="submit"
          disabled={isPending}
          className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          {isPending ? "Enviando..." : "Enviar consulta"}
        </button>
      </div>
    </form>
  );
}
