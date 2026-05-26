"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check } from "lucide-react";

interface Option {
  id?: string;
  name?: string;
  value?: string;
  label?: string;
  icon?: any;
}

interface CustomSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
}

export function CustomSelect({ options, value, onChange, placeholder = "Seleccionar...", label }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [style, setStyle] = useState<React.CSSProperties>({});
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const selectedOption = options.find((opt) => (opt.id || opt.value) === value);

  const calcStyle = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const menuHeight = Math.min(options.length * 44 + 24, 260);
    const spaceBelow = window.innerHeight - rect.bottom - 8;
    const openUp = spaceBelow < menuHeight && rect.top > menuHeight;

    const left = Math.max(8, Math.min(rect.left, window.innerWidth - rect.width - 8));

    setStyle({
      position: "fixed",
      top: openUp ? rect.top - menuHeight - 8 : rect.bottom + 8,
      left,
      width: rect.width,
      zIndex: 99999,
    });
  };

  const handleOpen = () => {
    calcStyle();
    setIsOpen(true);
  };

  useEffect(() => {
    if (!isOpen) return;
    const close = (e: MouseEvent) => {
      if (buttonRef.current?.contains(e.target as Node)) return;
      setIsOpen(false);
    };
    const reposition = () => calcStyle();
    document.addEventListener("mousedown", close);
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);
    return () => {
      document.removeEventListener("mousedown", close);
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
    };
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const menu = (
    <div
      style={style}
      className="py-1.5 bg-slate-900 border border-white/[0.07] rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.6)] backdrop-blur-xl animate-in fade-in zoom-in duration-200 origin-top"
    >
      <div className="max-h-60 overflow-y-auto custom-scrollbar">
        {options.map((option, idx) => {
          const optId = option.id || option.value || `opt-${idx}`;
          const optName = option.name || option.label;
          const isSelected = value === optId;
          return (
            <button
              key={optId}
              type="button"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={() => {
                onChange(optId);
                setIsOpen(false);
              }}
              className={`
                flex items-center justify-between w-full px-4 py-2.5 text-sm transition-colors
                ${isSelected ? "bg-emerald-500/10 text-emerald-400 font-medium" : "text-slate-400 hover:bg-white/5 hover:text-white"}
              `}
            >
              <div className="flex items-center gap-2">
                {option.icon && <option.icon className={`h-4 w-4 ${isSelected ? "text-emerald-400" : "text-slate-500"}`} />}
                <span>{optName}</span>
              </div>
              {isSelected && <Check className="h-3.5 w-3.5" />}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="relative w-full">
      {label && <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 ml-1">{label}</label>}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => (isOpen ? setIsOpen(false) : handleOpen())}
        className={`
          flex items-center justify-between w-full px-4 py-2.5
          bg-white/[0.03] border border-white/[0.05] rounded-xl text-sm text-white
          hover:bg-white/5 hover:border-white/[0.07] transition-all duration-200
          focus:outline-none focus:ring-1 focus:ring-emerald-500/50
          ${isOpen ? "ring-1 ring-emerald-500/50 border-emerald-500/50" : ""}
        `}
      >
        <span className="flex items-center gap-2 truncate text-left">
          {selectedOption?.icon && <selectedOption.icon className="h-4 w-4 text-slate-500" />}
          <span className={!selectedOption ? "text-slate-500" : "text-white"}>
            {selectedOption ? (selectedOption.name || selectedOption.label) : placeholder}
          </span>
        </span>
        <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform duration-300 flex-shrink-0 ${isOpen ? "rotate-180 text-emerald-400" : ""}`} />
      </button>

      {mounted && isOpen && createPortal(menu, document.body)}
    </div>
  );
}
