import { BarChart3, Lock } from "lucide-react";

export default function AnaliticasPage() {
  const umamiShareUrl = process.env.NEXT_PUBLIC_UMAMI_SHARE_URL;

  return (
    <div className="w-full h-full space-y-8 flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Analítica Avanzada</h1>
          <p className="mt-2 text-zinc-400">Rendimiento y tráfico de tu tienda impulsado por Umami.</p>
        </div>
      </div>

      {/* Umami Integration Area */}
      <div className="flex-1 glass-panel overflow-hidden relative min-h-[700px] flex flex-col">
        {umamiShareUrl ? (
          <div className="relative flex-1 flex flex-col">
            <iframe
              src={umamiShareUrl}
              className="w-full flex-1 border-none bg-transparent"
              title="Umami Analytics"
              style={{ minHeight: '700px' }}
            />
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <div className="h-20 w-20 bg-amber-500/10 rounded-3xl flex items-center justify-center mb-8 rotate-3 shadow-2xl shadow-amber-500/20">
              <Lock className="h-10 w-10 text-amber-400 -rotate-3" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Analíticas en Preparación</h3>
            <p className="text-zinc-400 max-w-md mb-10 leading-relaxed">
              Cuando el servicio de analíticas esté vinculado a tu tienda, podrás visualizar aquí el tráfico detallado y comportamiento de tus usuarios.
            </p>
            
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 border border-white/10 text-zinc-500 text-xs font-medium uppercase tracking-[0.2em]">
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
                Esperando conexión
            </div>

            <div className="mt-16 flex items-center gap-8 opacity-20 grayscale transition-all duration-500">
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">Powered by</span>
                <div className="flex items-center gap-2">
                    <div className="h-4 w-4 bg-white rounded-full"></div>
                    <span className="text-sm font-bold text-white tracking-tighter">umami</span>
                </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center text-[10px] text-zinc-600 uppercase tracking-widest px-2">
        <span>Privacidad Garantizada</span>
        <span>Sin Cookies • GDPR Compliant</span>
      </div>
    </div>
  );
}
