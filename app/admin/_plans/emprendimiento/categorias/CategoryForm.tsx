"use client";

import { useActionState, useEffect, useRef } from "react";
import { crearCategoria } from "@/actions/emprendimiento/categorias";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export function CategoryForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, isPending] = useActionState(async (prevState: any, formData: FormData) => {
    const result = await crearCategoria(formData);
    if (result.success) {
      formRef.current?.reset();
      toast.success("Categoría creada correctamente");
    } else {
      toast.error(result.error || "Error al crear la categoría");
    }
    return result;
  }, { success: false });

  return (
    <form ref={formRef} action={action} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium text-slate-300">Nombre de la categoría</label>
        <input
          id="name"
          name="name"
          type="text"
          placeholder="Ej: Remeras, Calzado..."
          required
          disabled={isPending}
          className="glass-input w-full px-4 py-3"
          suppressHydrationWarning
        />
      </div>
      
      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Guardando...
          </>
        ) : (
          "Crear Categoría"
        )}
      </button>
    </form>
  );
}
