"use client";

import Link from "next/link";
import Image from "next/image";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="fixed inset-0 z-[9999] bg-[#09090b] flex flex-col items-center justify-center p-6 overflow-hidden font-sans">
      {/* Decorative background elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
      <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none animate-bounce duration-[10s]"></div>
      
      <div className="relative z-10 text-center w-full px-4">
        <h1 className="text-[180px] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/10 select-none">
          404
        </h1>
        
        <div className="space-y-6 -mt-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-white tracking-tight">Página no encontrada</h2>
            <p className="text-zinc-500 text-lg leading-relaxed text-balance">
              Parece que te has perdido en la galaxia de tu administración. No te preocupes, el camino de regreso es simple.
            </p>
          </div>

          <div className="flex items-center justify-center pt-4">
            <Link
              href="/admin"
              className="group flex items-center gap-2 bg-white text-black px-8 py-4 rounded-2xl font-bold hover:bg-zinc-200 transition-all shadow-[0_20px_50px_rgba(255,255,255,0.1)] active:scale-95"
            >
              <Home className="h-5 w-5" />
              Volver al Inicio
            </Link>
          </div>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 opacity-40 hover:opacity-100 transition-all duration-700">
        <div className="h-px w-12 bg-gradient-to-r from-transparent via-zinc-500 to-transparent mb-2"></div>
        <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-500 whitespace-nowrap">Powered by</span>
            <Image 
              src="/logo-sitiohoy.png" 
              alt="SitioHoy" 
              width={100} 
              height={28} 
              className="h-7 w-auto object-contain"
            />
        </div>
      </div>
    </div>
  );
}
