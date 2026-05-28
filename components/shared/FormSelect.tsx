"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check } from "lucide-react";

interface Option {
  value: string;
  label: string;
}

interface FormSelectProps {
  name: string;
  options: Option[];
  defaultValue?: string;
  placeholder?: string;
  disabled?: boolean;
  label?: string;
  onChange?: (value: string) => void;
}

export function FormSelect({ name, options, defaultValue = "", placeholder = "Seleccionar...", disabled = false, onChange }: FormSelectProps) {
  const [value, setValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [mounted, setMounted] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => { setMounted(true); }, []);

  const selected = options.find(o => o.value === value);

  const openMenu = () => {
    if (disabled) return;
    if (btnRef.current) setRect(btnRef.current.getBoundingClientRect());
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (btnRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    const updatePos = () => {
      if (btnRef.current) setRect(btnRef.current.getBoundingClientRect());
    };
    document.addEventListener("mousedown", close);
    window.addEventListener("scroll", updatePos, true);
    return () => {
      document.removeEventListener("mousedown", close);
      window.removeEventListener("scroll", updatePos, true);
    };
  }, [open]);

  const menuStyle: React.CSSProperties = rect ? (() => {
    const menuH = Math.min((options.length + 1) * 44 + 12, 280);
    const spaceBelow = window.innerHeight - rect.bottom;
    const goUp = spaceBelow < menuH + 8 && rect.top > menuH + 8;
    return {
      position: "fixed",
      top: goUp ? rect.top - menuH - 4 : rect.bottom + 4,
      left: Math.min(rect.left, window.innerWidth - rect.width - 8),
      width: rect.width,
      zIndex: 99999,
    };
  })() : {};

  return (
    <>
      <input type="hidden" name={name} value={value} />

      <button
        ref={btnRef}
        type="button"
        disabled={disabled}
        onClick={() => open ? setOpen(false) : openMenu()}
        className={`glass-input px-4 py-3 w-full flex items-center justify-between text-sm transition-all ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"} ${open ? "ring-1 ring-white/20" : ""}`}
      >
        <span className={selected ? "text-foreground" : "text-slate-500"}>
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown className={`h-4 w-4 text-slate-500 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {mounted && open && rect && createPortal(
        <div
          style={{ ...menuStyle, background: "rgb(15 23 42)", backdropFilter: "blur(12px)" }}
          className="rounded-xl border border-white/[0.07] shadow-[0_10px_30px_rgba(0,0,0,0.6)] py-1.5 overflow-hidden"
        >
          <div className="max-h-64 overflow-y-auto custom-scrollbar">
            <button
              type="button"
              onMouseDown={e => e.stopPropagation()}
              onClick={() => { setValue(""); onChange?.(""); setOpen(false); }}
              className={`flex items-center justify-between w-full px-4 py-2.5 text-sm transition-colors ${value === "" ? "bg-white/5 text-white font-medium" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}
            >
              {placeholder}
              {value === "" && <Check className="h-3.5 w-3.5 text-emerald-400" />}
            </button>

            {options.map(opt => (
              <button
                key={opt.value}
                type="button"
                onMouseDown={e => e.stopPropagation()}
                onClick={() => { setValue(opt.value); onChange?.(opt.value); setOpen(false); }}
                className={`flex items-center justify-between w-full px-4 py-2.5 text-sm transition-colors ${value === opt.value ? "bg-emerald-500/10 text-emerald-400 font-medium" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}
              >
                {opt.label}
                {value === opt.value && <Check className="h-3.5 w-3.5" />}
              </button>
            ))}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
