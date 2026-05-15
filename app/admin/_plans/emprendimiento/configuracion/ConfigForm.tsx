"use client";

import { Save, Smartphone, CheckCircle2, AlertCircle, Loader2, Truck, Plus, Trash2, CreditCard } from "lucide-react";
import { useActionState, useState, useTransition } from "react";
import { updatePhone, saveShippingZone, deleteShippingZone, type ActionState, type ShippingZone } from "@/actions/emprendimiento/configuracion";
import { ConfirmModal } from "@/components/emprendimiento/ConfirmModal";
import { CustomNumberInput } from "@/components/emprendimiento/CustomNumberInput";

const initialPhoneState: ActionState = {
  success: false,
};

const initialZoneState: ActionState = {
  success: false,
};

export function ConfigForm({ initialPhone, shippingZones }: { initialPhone: string; shippingZones: ShippingZone[] }) {
  const [phoneState, phoneAction, isPhonePending] = useActionState(updatePhone, initialPhoneState);
  const [zoneState, zoneAction, isZonePending] = useActionState(saveShippingZone, initialZoneState);
  
  const [zones, setZones] = useState(shippingZones);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();

  const handleDeleteZone = async () => {
    if (!deleteTarget) return;
    startDeleteTransition(async () => {
      const result = await deleteShippingZone(deleteTarget);
      if (result.success) {
        setZones(prev => prev.filter(z => z.id !== deleteTarget));
      }
      setDeleteTarget(null);
    });
  };

  return (
    <div className="space-y-8">
      {/* WhatsApp */}
      <form action={phoneAction} className="glass-panel p-6 md:p-8 space-y-8">
        {phoneState.success && (
          <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-lg flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm">{phoneState.message}</p>
          </div>
        )}

        {phoneState.error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg flex items-center gap-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm">{phoneState.error}</p>
          </div>
        )}

        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-green-400" />
              WhatsApp de Ventas
            </h2>
            <p className="text-sm text-zinc-400 mt-1">
              Los botones de contacto de tu tienda redirigirán a este número.
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
                disabled={isPhonePending}
                suppressHydrationWarning
              />
            </div>
            <p className="text-xs text-zinc-500">No incluyas el 0 ni el 15. Ej: +54 9 3329 123456</p>
          </div>
        </section>

        <div className="pt-6 border-t border-white/10 flex justify-end">
          <button
            type="submit"
            disabled={isPhonePending}
            className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPhonePending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
            {isPhonePending ? "Guardando..." : "Guardar Teléfono"}
          </button>
        </div>
      </form>

      {/* MercadoPago */}
      <div className="glass-panel p-6 md:p-8 space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-blue-400" />
            MercadoPago
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            La integración con MercadoPago permite a tus clientes pagar con tarjeta, débito y cuotas directamente desde tu tienda.
          </p>
        </div>

        <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-4 flex items-center gap-3">
          <div className="h-10 w-10 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">Integración activa</p>
            <p className="text-xs text-zinc-400">Los pagos se procesan automáticamente. Configuración administrada por SitioHoy.</p>
          </div>
        </div>
      </div>

      {/* Zonas de Envío */}
      <div className="glass-panel p-6 md:p-8 space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Truck className="h-5 w-5 text-emerald-400" />
            Zonas de Envío
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            Configurá precios fijos de envío por zona geográfica. Tus clientes verán estos valores al checkout.
          </p>
        </div>

        {/* Lista de Zonas */}
        {zones.length > 0 && (
          <div className="space-y-2">
            {zones.map((zone) => (
              <div key={zone.id} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-xl group">
                <div>
                  <p className="text-sm font-medium text-white">{zone.name}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-emerald-400">${zone.price.toLocaleString("es-AR")}</span>
                  <button
                    onClick={() => setDeleteTarget(zone.id)}
                    className="p-1.5 hover:bg-red-500/10 rounded-lg transition-colors text-zinc-500 hover:text-red-400 opacity-0 group-hover:opacity-100"
                    title="Eliminar zona"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Agregar nueva zona */}
        <form action={zoneAction} className="space-y-4">
          {zoneState.success && (
            <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-lg flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm">{zoneState.message}</p>
            </div>
          )}
          {zoneState.error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg flex items-center gap-3">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm">{zoneState.error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="zone_name" className="text-sm font-medium text-zinc-300">Nombre de la zona</label>
              <input
                id="zone_name"
                name="zone_name"
                type="text"
                placeholder="Ej. CABA, GBA Norte, Interior"
                className="glass-input px-4 py-3"
                disabled={isZonePending}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="zone_price" className="text-sm font-medium text-zinc-300">Precio de envío</label>
              <CustomNumberInput 
                id="zone_price"
                name="zone_price"
                min={0}
                placeholder="2500" 
                disabled={isZonePending}
                prefix="$"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isZonePending}
            className="flex items-center gap-2 bg-surface hover:bg-surface-hover text-foreground px-4 py-2.5 rounded-lg font-medium transition-colors text-sm border border-border disabled:opacity-50"
          >
            {isZonePending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Agregar Zona
          </button>
        </form>
      </div>

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteZone}
        title="Eliminar zona de envío"
        description="¿Estás seguro? Los clientes ya no verán esta zona al comprar."
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        isDestructive={true}
        isPending={isDeleting}
      />
    </div>
  );
}
