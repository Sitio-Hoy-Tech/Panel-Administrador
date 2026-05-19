import { HelpCircle, ExternalLink, Lightbulb, MessageCircle } from "lucide-react";
import { SupportContactForm } from "@/components/shared/SupportContactForm";

export default function SoportePage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Soporte y Ayuda</h1>
        <p className="mt-2 text-zinc-400">¿Necesitás ayuda con tu sitio? Estamos para asistirte.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Contacto Directo */}
        <div className="glass-panel p-6 flex flex-col justify-between">
          <div>
            <div className="p-3 bg-primary/10 text-primary rounded-xl inline-block mb-4">
              <MessageCircle className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-foreground">Contactar Asistencia</h3>
            <p className="mt-2 text-sm text-zinc-400">
              Nuestro equipo está disponible para ayudarte a configurar tu web o resolver problemas técnicos.
            </p>
            <p className="mt-4 text-xs font-medium text-primary">
              Tiempo de respuesta: Hasta 48hs hábiles.
            </p>
          </div>
          <button className="mt-6 w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors">
            <ExternalLink className="h-4 w-4" />
            Escribir por WhatsApp
          </button>
        </div>

        {/* Tips / Ayuda */}
        <div className="glass-panel p-6 flex flex-col">
          <div className="p-3 bg-zinc-800 text-zinc-300 rounded-xl inline-block mb-4">
            <Lightbulb className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold text-foreground">Tips de Catálogo</h3>
          <ul className="mt-4 space-y-3 text-sm text-zinc-400 flex-1">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              Asegurate de usar imágenes cuadradas (1:1) para que se vean perfectas.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              Mantené las descripciones cortas y directas al punto.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              Comprimí tus fotos antes de subirlas (menos de 2MB).
            </li>
          </ul>
        </div>
      </div>

      <SupportContactForm />
    </div>
  );
}
