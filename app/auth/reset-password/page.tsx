"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Image from "next/image";
import { KeyRound, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

type Status = "loading" | "ready" | "error";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [status, setStatus] = useState<Status>("loading");
  const [linkError, setLinkError] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    const code = searchParams.get("code");
    if (!code) {
      setLinkError("El enlace no es válido o está incompleto.");
      setStatus("error");
      return;
    }

    const supabase = createClient();
    supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
      if (error) {
        setLinkError("El enlace expiró o ya fue utilizado. Solicitá uno nuevo.");
        setStatus("error");
      } else {
        setStatus("ready");
      }
    });
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError("");

    if (newPassword.length < 6) {
      setSubmitError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setSubmitError("Las contraseñas no coinciden.");
      return;
    }

    setSubmitting(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      setSubmitError("No se pudo actualizar la contraseña. Intentá de nuevo.");
      setSubmitting(false);
      return;
    }

    router.push("/admin");
  }

  return (
    <div className="min-h-screen w-full flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative z-10">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center mb-6">
          <div className="relative h-16 w-16">
            <Image src="/logo-sitiohoy.png" alt="SitioHoy" fill className="object-contain" priority />
          </div>
        </div>
        <h2 className="mt-2 text-center text-3xl font-bold tracking-tight text-white drop-shadow-md">
          Nueva contraseña
        </h2>
        <p className="mt-2 text-center text-sm text-zinc-400">
          Elegí una contraseña segura para tu panel de administración.
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="glass-panel py-10 px-6 sm:px-10 overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

          {/* Loading */}
          {status === "loading" && (
            <div className="flex flex-col items-center gap-3 py-8 text-zinc-400">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="text-sm">Verificando enlace...</p>
            </div>
          )}

          {/* Link error */}
          {status === "error" && (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <AlertCircle className="h-10 w-10 text-red-400" />
              <p className="text-white font-semibold">Enlace inválido</p>
              <p className="text-sm text-zinc-400">{linkError}</p>
            </div>
          )}

          {/* Form */}
          {status === "ready" && (
            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              {submitError && (
                <div className="p-3 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {submitError}
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="new_password" className="block text-sm font-medium text-zinc-300">
                  Nueva contraseña
                </label>
                <div className="relative">
                  <input
                    id="new_password"
                    type={showNew ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                    placeholder="••••••••"
                    className="glass-input px-4 py-3 pr-11 tracking-widest w-full"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew((v) => !v)}
                    className="absolute right-3 top-3.5 text-zinc-500 hover:text-zinc-300 transition-colors"
                    tabIndex={-1}
                    aria-label={showNew ? "Ocultar" : "Mostrar"}
                  >
                    {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-xs text-zinc-500">Mínimo 6 caracteres.</p>
              </div>

              <div className="space-y-2">
                <label htmlFor="confirm_password" className="block text-sm font-medium text-zinc-300">
                  Confirmar contraseña
                </label>
                <div className="relative">
                  <input
                    id="confirm_password"
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                    placeholder="••••••••"
                    className="glass-input px-4 py-3 pr-11 tracking-widest w-full"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3 top-3.5 text-zinc-500 hover:text-zinc-300 transition-colors"
                    tabIndex={-1}
                    aria-label={showConfirm ? "Ocultar" : "Mostrar"}
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 bg-white text-black hover:bg-zinc-200 transition-colors py-3 shadow-[0_0_20px_rgba(255,255,255,0.1)] rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <KeyRound className="h-5 w-5" />}
                  {submitting ? "Actualizando..." : "Establecer contraseña"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
