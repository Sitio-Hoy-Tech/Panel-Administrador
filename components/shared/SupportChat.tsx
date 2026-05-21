"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

const crmSupabase = createClient(
  process.env.NEXT_PUBLIC_CRM_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_CRM_SUPABASE_ANON_KEY!
);

const CRM_URL = process.env.NEXT_PUBLIC_CRM_URL!;

type Message = {
  id: string;
  sender_type: "agent" | "client";
  sender_name: string | null;
  content: string;
  created_at: string;
  _optimistic?: boolean;
};

type Props = {
  accessToken: string;
};

export default function SupportChat({ accessToken }: Props) {
  const [open, setOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [clienteNombre, setClienteNombre] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [initializing, setInitializing] = useState(false);
  const [initError, setInitError] = useState(false);
  const [unread, setUnread] = useState(0);

  const bottomRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);

  const initSession = useCallback(async () => {
    if (sessionId || initializing) return;
    setInitializing(true);
    setInitError(false);
    try {
      const res = await fetch(`${CRM_URL}/api/client/chat/init`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        console.error("[SupportChat] init failed:", res.status, body);
        setInitError(true);
        return;
      }
      const json = await res.json();
      setSessionId(json.session_id);
      setClienteNombre(json.cliente_nombre ?? "");
      setMessages(json.messages ?? []);
    } catch (err) {
      console.error("[SupportChat] init error:", err);
      setInitError(true);
    } finally {
      setInitializing(false);
    }
  }, [sessionId, initializing, accessToken]);

  function handleOpen() {
    setOpen(true);
    setUnread(0);
    if (!sessionId) initSession();
  }

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: messages.length > 10 ? "smooth" : "instant" as ScrollBehavior });
    }
  }, [messages.length, open]);

  useEffect(() => {
    if (!sessionId) return;

    const channel = crmSupabase
      .channel(`client-chat-${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          const msg = payload.new as Message;
          if (msg.sender_type === "agent") {
            setMessages(prev => {
              if (prev.some(m => m.id === msg.id)) return prev;
              return [...prev, msg];
            });
            setUnread(u => u + 1);
          }
        }
      )
      .subscribe();

    return () => { crmSupabase.removeChannel(channel); };
  }, [sessionId]);

  useEffect(() => {
    if (open) setUnread(0);
  }, [open]);

  async function loadMore() {
    if (!sessionId || !messages.length) return;
    const oldest = messages[0].created_at;
    const res = await fetch(
      `${CRM_URL}/api/client/chat/${sessionId}/messages?before=${encodeURIComponent(oldest)}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    if (!res.ok) return;
    const json = await res.json();
    const container = messagesRef.current;
    const prevHeight = container?.scrollHeight ?? 0;
    setMessages(prev => [...(json.messages ?? []), ...prev]);
    setHasMore(json.hasMore ?? false);
    requestAnimationFrame(() => {
      if (container) container.scrollTop = container.scrollHeight - prevHeight;
    });
  }

  async function sendMessage() {
    if (!sessionId || !input.trim() || sending) return;
    const content = input.trim();
    setInput("");
    setSending(true);

    const tempId = `temp-${Date.now()}`;
    const temp: Message = {
      id: tempId,
      sender_type: "client",
      sender_name: clienteNombre || "Yo",
      content,
      created_at: new Date().toISOString(),
      _optimistic: true,
    };
    setMessages(prev => [...prev, temp]);

    try {
      const res = await fetch(`${CRM_URL}/api/client/chat/${sessionId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
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
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
  }

  return (
    <>
      {/* Panel de chat */}
      {open && (
        <div
          className="fixed bottom-[90px] right-5 w-[340px] sm:w-[375px] rounded-2xl z-50 flex flex-col overflow-hidden"
          style={{
            height: "520px",
            boxShadow: "0 24px 64px rgba(0,0,0,0.16), 0 8px 24px rgba(0,0,0,0.10)",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center gap-3 px-4 py-3.5 flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #166534 0%, #16a34a 100%)" }}
          >
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-white/20 ring-2 ring-white/25 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-300 border-2 border-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm leading-tight">Soporte SitioHoy</p>
              <p className="text-white/65 text-[11px] mt-0.5 truncate">Respondemos a la brevedad</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="w-8 h-8 rounded-xl bg-black/15 hover:bg-black/25 flex items-center justify-center transition-colors flex-shrink-0"
              aria-label="Cerrar chat"
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Mensajes */}
          <div
            ref={messagesRef}
            className="flex-1 overflow-y-auto px-3.5 py-3.5 bg-slate-50 dark:bg-gray-950"
          >
            {/* Cargando */}
            {initializing && (
              <div className="flex flex-col items-center justify-center h-full gap-3">
                <div className="w-6 h-6 border-2 border-slate-200 border-t-green-500 rounded-full animate-spin" />
                <p className="text-xs text-slate-400">Conectando...</p>
              </div>
            )}

            {/* Cargar más */}
            {hasMore && !initializing && (
              <div className="flex justify-center pb-3">
                <button
                  type="button"
                  onClick={loadMore}
                  className="text-xs text-slate-400 hover:text-green-600 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 px-3 py-1.5 rounded-full shadow-sm transition-colors"
                >
                  Cargar mensajes anteriores
                </button>
              </div>
            )}

            {/* Error */}
            {!initializing && initError && (
              <div className="flex flex-col items-center justify-center h-full text-center gap-4 px-6">
                <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                  <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Sin conexión al soporte</p>
                  <p className="text-xs text-slate-400 mt-1">Verificá tu conexión e intentá de nuevo</p>
                </div>
                <button
                  type="button"
                  onClick={initSession}
                  className="text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 px-4 py-2 rounded-xl transition-colors"
                >
                  Reintentar
                </button>
              </div>
            )}

            {/* Estado vacío */}
            {!initializing && !initError && messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center px-6">
                <div className="w-16 h-16 rounded-2xl bg-green-100 dark:bg-green-900/25 flex items-center justify-center mb-4 shadow-sm">
                  <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p className="text-base font-semibold text-slate-700 dark:text-slate-200">Hola, ¿en qué te ayudamos?</p>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  Escribinos y un agente de SitioHoy<br />te responde a la brevedad.
                </p>
              </div>
            )}

            {/* Mensajes */}
            {messages.map((msg, i) => {
              const isClient = msg.sender_type === "client";
              const prevMsg = i > 0 ? messages[i - 1] : null;
              const showMeta = !prevMsg || prevMsg.sender_type !== msg.sender_type;
              const nextMsg = i < messages.length - 1 ? messages[i + 1] : null;
              const isLast = !nextMsg || nextMsg.sender_type !== msg.sender_type;

              return (
                <div
                  key={msg.id}
                  className={`flex ${isClient ? "justify-end" : "justify-start"} ${showMeta ? "mt-4" : "mt-0.5"}`}
                >
                  {/* Avatar agente */}
                  {!isClient && showMeta && (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-green-500 to-green-700 text-white text-[9px] font-bold flex items-center justify-center flex-shrink-0 mr-2 mt-auto mb-0.5 shadow-sm">
                      SH
                    </div>
                  )}
                  {!isClient && !showMeta && <div className="w-9 flex-shrink-0" />}

                  <div className={`max-w-[78%] flex flex-col ${isClient ? "items-end" : "items-start"}`}>
                    {showMeta && (
                      <span className="text-[10px] font-medium text-slate-400 mb-1 px-1">
                        {isClient ? "Vos" : (msg.sender_name ?? "Soporte")}
                      </span>
                    )}
                    <div
                      className={`px-3.5 py-2 text-sm leading-relaxed whitespace-pre-wrap break-words ${
                        isClient
                          ? `bg-green-600 text-white rounded-2xl rounded-tr-sm shadow-sm ${msg._optimistic ? "opacity-55" : ""}`
                          : "bg-white dark:bg-gray-800 text-slate-800 dark:text-slate-100 rounded-2xl rounded-tl-sm shadow-sm border border-slate-100 dark:border-gray-700"
                      }`}
                    >
                      {msg.content}
                    </div>
                    {isLast && (
                      <span className="text-[10px] text-slate-400 mt-1 px-1">
                        {formatTime(msg.created_at)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="flex-shrink-0 bg-white dark:bg-gray-900 border-t border-slate-100 dark:border-gray-800 px-3 pt-2.5 pb-3">
            <div className="flex items-end gap-2 bg-slate-100 dark:bg-gray-800 rounded-2xl px-3.5 pt-2.5 pb-2.5">
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Escribí tu mensaje..."
                rows={1}
                style={{ maxHeight: "96px" }}
                className="flex-1 bg-transparent text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 resize-none focus:outline-none overflow-y-auto leading-relaxed"
                onInput={e => {
                  const t = e.currentTarget;
                  t.style.height = "auto";
                  t.style.height = Math.min(t.scrollHeight, 96) + "px";
                }}
              />
              <button
                type="button"
                onClick={sendMessage}
                disabled={!input.trim() || sending || !sessionId}
                className="w-8 h-8 rounded-[14px] bg-green-600 hover:bg-green-700 disabled:opacity-30 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all flex-shrink-0 mb-0.5 shadow-sm"
                aria-label="Enviar"
              >
                {sending ? (
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
              </button>
            </div>
            <p className="text-center text-[10px] text-slate-300 dark:text-slate-600 mt-2">
              Soporte SitioHoy
            </p>
          </div>
        </div>
      )}

      {/* Burbuja flotante */}
      <button
        type="button"
        onClick={open ? () => setOpen(false) : handleOpen}
        className="fixed bottom-5 right-5 w-14 h-14 rounded-full text-white flex items-center justify-center z-50 transition-all duration-200 hover:scale-110 active:scale-95"
        style={{
          background: "linear-gradient(135deg, #16a34a 0%, #166534 100%)",
          boxShadow: "0 4px 24px rgba(22,163,74,0.45), 0 2px 8px rgba(0,0,0,0.12)",
        }}
        aria-label="Abrir chat de soporte"
      >
        {open ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        ) : (
          <span className="relative flex items-center justify-center w-full h-full">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2.25c-2.429 0-4.817.178-7.152.521C2.87 3.061 1.5 4.795 1.5 6.741v6.018c0 1.946 1.37 3.68 3.348 3.97.877.129 1.761.234 2.652.316V21a.75.75 0 001.28.53l4.184-4.183a14.999 14.999 0 005.574-.596c1.978-.29 3.348-2.024 3.348-3.97V6.741c0-1.946-1.37-3.68-3.348-3.97A49.145 49.145 0 0012 2.25zM8.25 8.625a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25zm2.625 1.125a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875-1.125a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25z"
              />
            </svg>
            {unread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center ring-2 ring-white">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </span>
        )}
      </button>
    </>
  );
}
