"use client";

import { useState, useEffect } from "react";
import { X, Percent, DollarSign, Truck } from "lucide-react";
import { createPortal } from "react-dom";
import { createCupon, updateCupon } from "@/actions/empresa/cupones";
import { toast } from "sonner";
import { CustomDatePicker } from "@/components/empresa/CustomDatePicker";

interface CouponModalProps {
  coupon?: any;
  onClose: () => void;
  onSuccess: (coupon: any) => void;
}

export function CouponModal({ coupon, onClose, onSuccess }: CouponModalProps) {
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    code: coupon?.code || "",
    type: coupon?.type || "percent",
    value: coupon?.value || "",
    min_amount: coupon?.min_amount || "",
    max_uses: coupon?.max_uses || "",
    expires_at: coupon?.expires_at ? new Date(coupon.expires_at).toISOString().split('T')[0] : "",
    active: coupon?.active ?? true
  });

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code) {
      toast.error("El código es obligatorio");
      return;
    }
    if (!formData.value) {
      toast.error("Debe especificar un valor de descuento");
      return;
    }

    setIsSubmitting(true);

    const dataToSubmit = {
      code: formData.code.toUpperCase(),
      type: formData.type,
      value: Number(formData.value),
      min_amount: formData.min_amount ? Number(formData.min_amount) : 0,
      max_uses: formData.max_uses ? Number(formData.max_uses) : null,
      expires_at: formData.expires_at ? new Date(formData.expires_at).toISOString() : null,
      active: formData.active
    };

    let result;
    if (coupon) {
      result = await updateCupon(coupon.id, dataToSubmit);
    } else {
      result = await createCupon(dataToSubmit);
    }

    setIsSubmitting(false);

    if (result.success) {
      toast.success(coupon ? "Cupón actualizado" : "Cupón creado exitosamente");
      onSuccess(result.data);
    } else {
      toast.error(result.error || "Ocurrió un error");
    }
  };

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in" onClick={onClose} />

      <div className="relative bg-surface border border-white/[0.07] shadow-2xl rounded-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 fade-in duration-200 flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-white/[0.05] flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            {coupon ? "Editar Cupón" : "Nuevo Cupón"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Código del Cupón
              </label>
              <input
                type="text"
                placeholder="EJ: VERANO20"
                className="glass-input w-full uppercase py-4 px-5 text-lg font-bold tracking-widest"
                value={formData.code}
                onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase().replace(/\s/g, '') })}
                required
                suppressHydrationWarning
              />
              <p className="text-xs text-slate-500 mt-1">Los clientes ingresarán este código al pagar.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Tipo de Descuento
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'percent' })}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                    formData.type === 'percent' 
                      ? 'bg-primary/10 border-primary text-primary' 
                      : 'bg-white/[0.02] border-white/[0.05] text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Percent className="h-5 w-5" />
                  <span className="text-xs font-semibold">Porcentaje</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'fixed' })}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                    formData.type === 'fixed' 
                      ? 'bg-primary/10 border-primary text-primary' 
                      : 'bg-white/[0.02] border-white/[0.05] text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <DollarSign className="h-5 w-5" />
                  <span className="text-xs font-semibold">Monto Fijo</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Valor del Descuento
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {formData.type === 'percent' ? (
                    <Percent className="h-4 w-4 text-slate-500" />
                  ) : (
                    <span className="text-slate-500 font-medium pl-2">$</span>
                  )}
                </div>
                <input
                  type="number"
                  min="1"
                  className="glass-input w-full pl-10 pr-5 py-3 text-lg font-bold"
                  value={formData.value}
                  onChange={e => setFormData({ ...formData, value: e.target.value })}
                  required
                  suppressHydrationWarning
                />
              </div>
            </div>

            <div className="pt-4 border-t border-white/[0.05]">
              <h3 className="text-sm font-semibold text-white mb-4">Condiciones (Opcional)</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Compra mínima ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Ej: 50000"
                    className="glass-input w-full text-base py-3 px-4"
                    value={formData.min_amount}
                    onChange={e => setFormData({ ...formData, min_amount: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Límite de usos
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Ej: 100"
                    className="glass-input w-full text-base py-3 px-4"
                    value={formData.max_uses}
                    onChange={e => setFormData({ ...formData, max_uses: e.target.value })}
                  />
                </div>
              </div>

              <div className="mt-4">
                <CustomDatePicker
                  label="Fecha de Vencimiento"
                  placeholder="Sin vencimiento"
                  value={formData.expires_at}
                  onChange={date => setFormData({ ...formData, expires_at: date })}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="active"
                className="rounded border-white/[0.07] bg-white/5 text-primary focus:ring-primary focus:ring-offset-0"
                checked={formData.active}
                onChange={e => setFormData({ ...formData, active: e.target.checked })}
              />
              <label htmlFor="active" className="text-sm text-white">
                Activar cupón inmediatamente
              </label>
            </div>
          </div>
        </form>

        <div className="p-6 border-t border-white/[0.05] bg-white/[0.02] flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white hover:bg-white/5 rounded-xl transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-2 bg-white text-black text-sm font-bold rounded-xl hover:bg-slate-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Guardando..." : "Guardar Cupón"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
