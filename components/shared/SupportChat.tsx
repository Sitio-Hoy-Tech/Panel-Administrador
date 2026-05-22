"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Image from "next/image";

const crmSupabase = createClient(
  process.env.NEXT_PUBLIC_CRM_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_CRM_SUPABASE_ANON_KEY!
);

const CRM_URL = process.env.NEXT_PUBLIC_CRM_URL!;

// Paleta SitioHoy
const C = {
  bg:           "#020617",
  surface:      "rgba(255,255,255,0.05)",
  elevated:     "rgba(255,255,255,0.10)",
  card:         "#0f172a",
  accent:       "#10b981",
  accentHover:  "#059669",
  accentSoft:   "rgba(16,185,129,0.10)",
  accentBorder: "rgba(16,185,129,0.30)",
  text:         "#f8fafc",
  textBody:     "#94a3b8",
  textMuted:    "#64748b",
  border:       "rgba(255,255,255,0.05)",
  borderAlt:    "rgba(255,255,255,0.07)",
  inputBg:      "rgba(0,0,0,0.4)",
};

type Message = {
  id: string;
  sender_type: "agent" | "client";
  sender_name: string | null;
  content: string;
  created_at: string;
  _optimistic?: boolean;
};

type SessionStatus = "open" | "closed" | "pending";
type Screen = "home" | "pending" | "chat" | "resolved";

type Props = { accessToken: string };

export default function SupportChat({ accessToken }: Props) {
  const [open, setOpen] = useState(false);
  const [screen, setScreen] = useState<Screen>("home");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [clienteNombre, setClienteNombre] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [unread, setUnread] = useState(0);
  const [requesting, setRequesting] = useState(false);
  const [requestError, setRequestError] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const openRef = useRef(open);
  useEffect(() => { openRef.current = open; }, [open]);

  function playResolvedSound() {
    try {
      const ctx = new AudioContext();

      // Arco ascendente → descendente estilo Skype end call
      // Tono fundamental + armónico para darle cuerpo de campana
      [1, 2.4].forEach((harmonic, i) => {
        const osc  = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        const baseFreq = 480;
        const t        = ctx.currentTime;
        const vol      = i === 0 ? 0.32 : 0.10;
        const dur      = i === 0 ? 1.1  : 0.7;

        osc.type = "sine";
        // Sube rápido hasta el pico, luego desciende lento
        osc.frequency.setValueAtTime(baseFreq * harmonic, t);
        osc.frequency.linearRampToValueAtTime(baseFreq * harmonic * 1.45, t + 0.12);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * harmonic * 0.6, t + dur);

        // Ataque rápido + decay largo tipo campana
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(vol, t + 0.008);
        gain.gain.setValueAtTime(vol, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

        osc.start(t);
        osc.stop(t + dur);
      });
    } catch {
      // silently fail
    }
  }

  function playNotificationSound() {
    try {
      const ctx = new AudioContext();

      // Tres notas ascendentes (E5 → G5 → B5) con ataque rápido y cuerpo
      const notes = [
        { freq: 659,  delay: 0,    dur: 0.18 },
        { freq: 784,  delay: 0.16, dur: 0.18 },
        { freq: 988,  delay: 0.32, dur: 0.45 },
      ];

      notes.forEach(({ freq, delay, dur }) => {
        const osc  = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);

        const t = ctx.currentTime + delay;
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.38, t + 0.006); // ataque rápido
        gain.gain.setValueAtTime(0.38, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

        osc.start(t);
        osc.stop(t + dur);
      });
    } catch {
      // El navegador puede bloquear AudioContext sin interacción previa
    }
  }

  useEffect(() => {
    if (!sessionId) return;
    const channel = crmSupabase
      .channel(`client-chat-${sessionId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages", filter: `session_id=eq.${sessionId}` }, (payload) => {
        const msg = payload.new as Message;
        if (msg.sender_type === "agent") {
          setMessages(prev => prev.some(m => m.id === msg.id) ? prev : [...prev, msg]);
          if (!openRef.current) {
            setUnread(u => u + 1);
            playNotificationSound();
          }
        }
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "chat_sessions", filter: `id=eq.${sessionId}` }, (payload) => {
        const updated = payload.new as { status: SessionStatus };
        if (updated.status === "open") { setScreen("chat"); playNotificationSound(); }
        if (updated.status === "closed") { setMessages([]); setScreen("resolved"); playResolvedSound(); }
      })
      .subscribe();
    return () => { crmSupabase.removeChannel(channel); };
  }, [sessionId]);

  useEffect(() => {
    if (screen === "chat") bottomRef.current?.scrollIntoView({ behavior: messages.length > 10 ? "smooth" : "instant" as ScrollBehavior });
  }, [messages.length, screen]);

  useEffect(() => {
    if (screen === "chat") setTimeout(() => inputRef.current?.focus(), 80);
  }, [screen]);

  useEffect(() => { if (open) setUnread(0); }, [open]);

  async function handleRequestSupport() {
    setRequesting(true);
    setRequestError(false);
    try {
      const initRes = await fetch(`${CRM_URL}/api/client/chat/init`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
      });
      if (!initRes.ok) { setRequestError(true); return; }
      const initJson = await initRes.json();
      const sid: string = initJson.session_id;
      setSessionId(sid);
      setClienteNombre(initJson.cliente_nombre ?? "");
      if (initJson.status === "pending") { setScreen("pending"); return; }
      const supportRes = await fetch(`${CRM_URL}/api/client/chat/${sid}/request-support`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (supportRes.ok) setScreen("pending");
      else setRequestError(true);
    } catch (err) {
      console.error("[SupportChat]", err);
      setRequestError(true);
    } finally {
      setRequesting(false);
    }
  }

  function handleNewConsulta() {
    setSessionId(null); setMessages([]); setHasMore(false); setInput(""); setRequestError(false); setScreen("home");
  }

  async function loadMore() {
    if (!sessionId || !messages.length) return;
    const res = await fetch(`${CRM_URL}/api/client/chat/${sessionId}/messages?before=${encodeURIComponent(messages[0].created_at)}`, { headers: { Authorization: `Bearer ${accessToken}` } });
    if (!res.ok) return;
    const json = await res.json();
    const container = messagesRef.current;
    const prevH = container?.scrollHeight ?? 0;
    setMessages(prev => [...(json.messages ?? []), ...prev]);
    setHasMore(json.hasMore ?? false);
    requestAnimationFrame(() => { if (container) container.scrollTop = container.scrollHeight - prevH; });
  }

  async function sendMessage() {
    if (!sessionId || !input.trim() || sending) return;
    const content = input.trim();
    setInput("");
    setSending(true);
    const tempId = `temp-${Date.now()}`;
    setMessages(prev => [...prev, { id: tempId, sender_type: "client", sender_name: clienteNombre || "Yo", content, created_at: new Date().toISOString(), _optimistic: true }]);
    try {
      const res = await fetch(`${CRM_URL}/api/client/chat/${sessionId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ content }),
      });
      if (res.ok) {
        const json = await res.json();
        setMessages(prev => prev.map(m => m.id === tempId ? json.message : m));
      } else {
        setMessages(prev => prev.filter(m => m.id !== tempId));
      }
    } catch {
      setMessages(prev => prev.filter(m => m.id !== tempId));
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  }

  function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
  }

  return (
    <>
      {open && (
        <div
          className="fixed bottom-[90px] right-5 w-[340px] sm:w-[375px] rounded-2xl z-50 flex flex-col overflow-hidden"
          style={{ height: "520px", background: C.bg, boxShadow: "0 24px 64px rgba(0,0,0,0.6), 0 8px 24px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.06)" }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3.5 flex-shrink-0" style={{ background: `linear-gradient(135deg, ${C.accentHover} 0%, ${C.accent} 100%)` }}>
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "rgba(0,0,0,0.2)", boxShadow: "0 0 0 2px rgba(255,255,255,0.2)" }}>
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white" style={{ background: screen === "pending" ? "#f59e0b" : screen === "chat" ? C.accent : C.textMuted, animation: screen === "pending" ? "pulse 1.5s infinite" : "none" }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm leading-tight">Soporte SitioHoy</p>
              <p className="text-[11px] mt-0.5 truncate" style={{ color: "rgba(255,255,255,0.65)" }}>
                {screen === "pending" ? "Conectando con un operador..." : screen === "chat" ? "Operador conectado" : "Respondemos a la brevedad"}
              </p>
            </div>
            <button type="button" onClick={() => setOpen(false)} className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors flex-shrink-0" style={{ background: "rgba(0,0,0,0.2)" }} aria-label="Cerrar chat">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* HOME */}
          {screen === "home" && (
            <div className="flex-1 flex flex-col" style={{ background: C.bg }}>
              {/* Zona superior */}
              <div className="flex flex-col items-center justify-center px-6 pt-8 pb-5" style={{ background: `linear-gradient(180deg, ${C.accentSoft} 0%, transparent 100%)` }}>
                <div className="w-16 h-16 mb-4 relative">
                  <Image src="/logo-sitiohoy.png" alt="SitioHoy" fill className="object-contain" priority />
                </div>
                <h2 className="text-[17px] font-bold text-center leading-snug" style={{ color: C.text }}>
                  ¿En qué podemos<br />ayudarte hoy?
                </h2>
                <p className="text-[12px] mt-2 text-center leading-relaxed" style={{ color: C.textBody }}>
                  Nuestro equipo de soporte está<br />disponible para asistirte.
                </p>
              </div>

              {/* Botón principal */}
              <div className="flex-1 px-5 flex flex-col justify-center gap-3">
                <button
                  type="button"
                  onClick={handleRequestSupport}
                  disabled={requesting}
                  className="w-full flex items-center gap-3.5 px-4 py-4 rounded-xl text-left transition-all active:scale-[0.98] disabled:opacity-60"
                  style={{ background: C.accentSoft, border: `1.5px solid ${C.accentBorder}` }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = C.accent)}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = C.accentBorder)}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `linear-gradient(135deg, ${C.accentHover} 0%, ${C.accent} 100%)` }}>
                    {requesting ? (
                      <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: "rgba(255,255,255,0.3)", borderTopColor: "white" }} />
                    ) : (
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 18v-6a9 9 0 0118 0v6" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z" />
                        <path strokeLinecap="round" strokeWidth={1.8} d="M17 19Q13.5 22 12 24" />
                        <circle cx="12" cy="24" r="1.2" fill="currentColor" stroke="none" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold" style={{ color: C.text }}>
                      {requesting ? "Conectando..." : "Hablar con un operador"}
                    </p>
                    <p className="text-[11px] mt-0.5" style={{ color: C.textMuted }}>Soporte técnico en tiempo real</p>
                  </div>
                  {!requesting && (
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: C.accent }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </button>

                {requestError && (
                  <p className="text-[11px] text-center" style={{ color: "#ef4444" }}>
                    No se pudo conectar. Intentá de nuevo.
                  </p>
                )}

                <div className="flex items-center gap-2 rounded-xl px-4 py-3" style={{ background: C.surface, border: `1px solid ${C.borderAlt}` }}>
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: C.textMuted }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-[11px]" style={{ color: C.textBody }}>
                    Tiempo de respuesta: <span className="font-semibold" style={{ color: C.text }}>pocos minutos</span>
                  </p>
                </div>
              </div>

              <p className="text-center text-[10px] pb-3" style={{ color: C.textMuted }}>Soporte SitioHoy</p>
            </div>
          )}

          {/* PENDING */}
          {screen === "pending" && (
            <div className="flex-1 flex flex-col items-center justify-center px-8 text-center" style={{ background: C.bg }}>
              <div className="relative mb-6">
                <div className="w-24 h-24 relative" style={{ animation: "logoPulse 2s ease-in-out infinite" }}>
                  <Image src="/logo-sitiohoy.png" alt="SitioHoy" fill className="object-contain" priority />
                </div>
                <style>{`@keyframes logoPulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.08);opacity:0.75} }`}</style>
              </div>
              <h3 className="text-[17px] font-bold leading-snug" style={{ color: C.text }}>Buscando operador...</h3>
              <p className="text-[13px] mt-2.5 leading-relaxed" style={{ color: C.textBody }}>
                Tu solicitud fue enviada.<br />Un operador se conectará<br />
                <span className="font-semibold" style={{ color: C.accent }}>a la brevedad.</span>
              </p>
              <div className="mt-5 flex items-center gap-2 text-[12px]" style={{ color: C.textMuted }}>
                <div className="flex gap-1">
                  {[0, 150, 300].map(d => (
                    <span key={d} className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: C.accent, animationDelay: `${d}ms` }} />
                  ))}
                </div>
                <span>Esperando conexión</span>
              </div>
            </div>
          )}

          {/* CHAT */}
          {screen === "chat" && (
            <>
              <div ref={messagesRef} className="flex-1 overflow-y-auto px-3.5 py-3.5" style={{ background: C.bg }}>
                {hasMore && (
                  <div className="flex justify-center pb-3">
                    <button type="button" onClick={loadMore} className="text-xs px-3 py-1.5 rounded-full transition-colors" style={{ color: C.textMuted, background: C.surface, border: `1px solid ${C.borderAlt}` }}>
                      Cargar mensajes anteriores
                    </button>
                  </div>
                )}

                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-center px-6">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center mb-3" style={{ background: C.accentSoft }}>
                      <svg className="w-5 h-5" fill="none" stroke={C.accent} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-sm font-semibold" style={{ color: C.text }}>Operador conectado</p>
                    <p className="text-xs mt-1" style={{ color: C.textMuted }}>Podés empezar a escribir tu consulta.</p>
                  </div>
                )}

                {messages.map((msg, i) => {
                  const isClient = msg.sender_type === "client";
                  const prevMsg = i > 0 ? messages[i - 1] : null;
                  const showMeta = !prevMsg || prevMsg.sender_type !== msg.sender_type;
                  const nextMsg = i < messages.length - 1 ? messages[i + 1] : null;
                  const isLast = !nextMsg || nextMsg.sender_type !== msg.sender_type;

                  return (
                    <div key={msg.id} className={`flex ${isClient ? "justify-end" : "justify-start"} ${showMeta ? "mt-4" : "mt-0.5"}`}>
                      {!isClient && showMeta && (
                        <div className="w-7 h-7 rounded-full text-white text-[9px] font-bold flex items-center justify-center flex-shrink-0 mr-2 mt-auto mb-0.5" style={{ background: `linear-gradient(135deg, ${C.accentHover} 0%, ${C.accent} 100%)` }}>
                          SH
                        </div>
                      )}
                      {!isClient && !showMeta && <div className="w-9 flex-shrink-0" />}
                      <div className={`max-w-[78%] flex flex-col ${isClient ? "items-end" : "items-start"}`}>
                        {showMeta && (
                          <span className="text-[10px] font-medium mb-1 px-1" style={{ color: C.textMuted }}>
                            {isClient ? "Vos" : (msg.sender_name ?? "Soporte")}
                          </span>
                        )}
                        <div
                          className="px-3.5 py-2 text-sm leading-relaxed whitespace-pre-wrap break-words rounded-2xl"
                          style={isClient
                            ? { background: C.accent, color: "white", borderTopRightRadius: "4px", opacity: msg._optimistic ? 0.55 : 1 }
                            : { background: C.card, color: C.text, borderTopLeftRadius: "4px", border: `1px solid ${C.borderAlt}` }
                          }
                        >
                          {msg.content}
                        </div>
                        {isLast && (
                          <span className="text-[10px] mt-1 px-1" style={{ color: C.textMuted }}>{formatTime(msg.created_at)}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              <div className="flex-shrink-0 px-3 pt-2.5 pb-3" style={{ background: C.card, borderTop: `1px solid ${C.borderAlt}` }}>
                <div className="flex items-end gap-2 rounded-2xl px-3.5 pt-2.5 pb-2.5" style={{ background: C.inputBg, border: `1px solid ${C.border}` }}>
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Escribí tu mensaje..."
                    rows={1}
                    style={{ maxHeight: "96px", color: C.text, caretColor: C.accent }}
                    className="flex-1 bg-transparent text-sm resize-none focus:outline-none overflow-y-auto leading-relaxed placeholder:text-slate-600"
                    onInput={e => { const t = e.currentTarget; t.style.height = "auto"; t.style.height = Math.min(t.scrollHeight, 96) + "px"; }}
                  />
                  <button
                    type="button"
                    onClick={sendMessage}
                    disabled={!input.trim() || sending}
                    className="w-8 h-8 rounded-[14px] flex items-center justify-center transition-all flex-shrink-0 mb-0.5 disabled:opacity-30 disabled:cursor-not-allowed"
                    style={{ background: C.accent }}
                    aria-label="Enviar"
                  >
                    {sending ? (
                      <div className="w-3.5 h-3.5 border-2 rounded-full animate-spin" style={{ borderColor: "rgba(255,255,255,0.3)", borderTopColor: "white" }} />
                    ) : (
                      <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    )}
                  </button>
                </div>
                <p className="text-center text-[10px] mt-2" style={{ color: C.textMuted }}>Soporte SitioHoy</p>
              </div>
            </>
          )}

          {/* RESOLVED */}
          {screen === "resolved" && (
            <div className="flex-1 flex flex-col items-center justify-center px-8 text-center" style={{ background: C.bg }}>
              <div className="w-20 h-20 rounded-full flex items-center justify-center mb-5" style={{ background: C.accentSoft, border: `1px solid ${C.accentBorder}` }}>
                <svg className="w-10 h-10" fill="none" stroke={C.accent} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-[17px] font-bold leading-snug" style={{ color: C.text }}>¡Consulta resuelta!</h3>
              <p className="text-[13px] mt-2.5 leading-relaxed" style={{ color: C.textBody }}>
                El operador marcó esta conversación<br />como resuelta.<br />
                <span className="font-medium" style={{ color: C.text }}>¡Gracias por contactarnos!</span>
              </p>
              <button
                type="button"
                onClick={handleNewConsulta}
                className="mt-8 w-full px-5 py-3 rounded-xl text-white text-sm font-semibold transition-all active:scale-[0.98]"
                style={{ background: `linear-gradient(135deg, ${C.accentHover} 0%, ${C.accent} 100%)` }}
              >
                Tengo otra consulta
              </button>
              <p className="text-[11px] mt-3" style={{ color: C.textMuted }}>Te respondemos a la brevedad</p>
            </div>
          )}
        </div>
      )}

      {/* Burbuja flotante */}
      <button
        type="button"
        onClick={() => { setOpen(o => !o); if (!open) setUnread(0); }}
        className="fixed bottom-5 right-5 w-14 h-14 rounded-full text-white flex items-center justify-center z-50 transition-all duration-200 hover:scale-110 active:scale-95"
        style={{ background: `linear-gradient(135deg, ${C.accent} 0%, ${C.accentHover} 100%)`, boxShadow: `0 4px 24px rgba(16,185,129,0.45), 0 2px 8px rgba(0,0,0,0.3)` }}
        aria-label="Abrir chat de soporte"
      >
        {open ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        ) : (
          <span className="relative flex items-center justify-center w-full h-full">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2.25c-2.429 0-4.817.178-7.152.521C2.87 3.061 1.5 4.795 1.5 6.741v6.018c0 1.946 1.37 3.68 3.348 3.97.877.129 1.761.234 2.652.316V21a.75.75 0 001.28.53l4.184-4.183a14.999 14.999 0 005.574-.596c1.978-.29 3.348-2.024 3.348-3.97V6.741c0-1.946-1.37-3.68-3.348-3.97A49.145 49.145 0 0012 2.25zM8.25 8.625a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25zm2.625 1.125a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875-1.125a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25z" />
            </svg>
            {unread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full text-white text-[10px] font-black flex items-center justify-center ring-2 ring-white" style={{ background: "#ef4444" }}>
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </span>
        )}
      </button>
    </>
  );
}
