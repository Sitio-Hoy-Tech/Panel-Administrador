import { ExternalLink, Lightbulb, MessageCircle, ShoppingCart, BarChart3 } from "lucide-react";
import { SupportContactForm } from "@/components/shared/SupportContactForm";

export default function SoportePage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Soporte y Ayuda</h1>
        <p className="mt-2 text-slate-400">¿Necesitás ayuda con tu tienda? Estamos para asistirte.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Contacto Directo */}
        <div className="glass-panel p-6 flex flex-col justify-between">
          <div>
            <div className="p-3 bg-primary/10 text-primary rounded-xl inline-block mb-4">
              <MessageCircle className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-foreground">Contactar Asistencia</h3>
            <p className="mt-2 text-sm text-slate-400">
              Nuestro equipo está disponible para ayudarte a configurar tu tienda, resolver problemas técnicos o cualquier otra consulta.
            </p>
            <p className="mt-4 text-xs font-medium text-emerald-400">
              Tiempo de respuesta: Hasta 24hs hábiles.
            </p>
          </div>
          <button className="mt-6 w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors">
            <ExternalLink className="h-4 w-4" />
            Escribir por WhatsApp
          </button>
        </div>

        {/* Tips */}
        <div className="glass-panel p-6 flex flex-col">
          <div className="p-3 bg-slate-800 text-slate-300 rounded-xl inline-block mb-4">
            <Lightbulb className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold text-foreground">Tips para tu Tienda</h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-400 flex-1">
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 mt-0.5">•</span>
              Usá imágenes cuadradas (1:1) y con fondo limpio para destacar tus productos.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 mt-0.5">•</span>
              Configurá tus zonas de envío para que el cliente vea el costo total antes de pagar.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 mt-0.5">•</span>
              Completá el stock para generar urgencia cuando queden pocas unidades.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 mt-0.5">•</span>
              Revisá las analíticas semanalmente para entender qué productos generan más visitas.
            </li>
          </ul>
        </div>
      </div>

      <SupportContactForm />
    </div>
  );
}
