"use client";

import { login } from "@/actions/auth";
import { useActionState } from "react";
import { SubmitButton } from "@/components/empresa/SubmitButton";
import Image from "next/image";

const initialState = {
  error: "",
};

// Adaptador para cumplir con la firma de useActionState
async function loginAction(prevState: { error: string }, formData: FormData) {
  const result = await login(formData);
  if (result?.error) {
    return { error: result.error };
  }
  return prevState;
}

export default function LoginPage() {
  const [state, formAction] = useActionState(loginAction, initialState);

  return (
    <div className="min-h-screen w-full flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative z-10">
      
      {/* Decorative background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center mb-6">
          <div className="relative h-16 w-16">
            <Image
              src="/logo-sitiohoy.png"
              alt="SitioHoy Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>
        <h2 className="mt-2 text-center text-3xl font-bold tracking-tight text-white drop-shadow-md">
          Panel de Control
        </h2>
        <p className="mt-2 text-center text-sm text-zinc-400 text-balance px-4 italic">
          Gestioná tu negocio con la tecnología de alto rendimiento de SitioHoy y llevá tu marca al siguiente nivel.
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="glass-panel py-10 px-6 sm:px-10 overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
          
          <form action={formAction} className="space-y-6 relative z-10">
            
            {state?.error && (
              <div className="p-3 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl text-center backdrop-blur-sm">
                {state.error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-zinc-300">
                Correo Electrónico
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="tu@email.com"
                  className="glass-input px-4 py-3"
                  suppressHydrationWarning
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-zinc-300">
                Contraseña
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  className="glass-input px-4 py-3 tracking-widest"
                  suppressHydrationWarning
                />
              </div>
            </div>

            <div className="pt-4">
              <SubmitButton className="w-full bg-white text-black hover:bg-zinc-200 transition-colors py-3 shadow-[0_0_20px_rgba(255,255,255,0.1)] rounded-xl font-semibold">
                Iniciar Sesión
              </SubmitButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
