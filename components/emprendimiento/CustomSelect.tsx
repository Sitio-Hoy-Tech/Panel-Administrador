"use client";

import { useState, useRef, useEffect } from "react";
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
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => (opt.id || opt.value) === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={containerRef}>
      {label && <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5 ml-1">{label}</label>}
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center justify-between w-full px-4 py-2.5 
          bg-white/[0.03] border border-white/5 rounded-xl text-sm text-white 
          hover:bg-white/5 hover:border-white/10 transition-all duration-200
          focus:outline-none focus:ring-1 focus:ring-blue-500/50
          ${isOpen ? "ring-1 ring-blue-500/50 border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.1)]" : ""}
        `}
      >
        <span className="flex items-center gap-2 truncate text-left">
          {selectedOption?.icon && <selectedOption.icon className="h-4 w-4 text-zinc-500" />}
          <span className={!selectedOption ? "text-zinc-500" : "text-white"}>
            {selectedOption ? (selectedOption.name || selectedOption.label) : placeholder}
          </span>
        </span>
        <ChevronDown className={`h-4 w-4 text-zinc-500 transition-transform duration-300 ${isOpen ? "rotate-180 text-blue-400" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute z-[100] w-full mt-2 py-1.5 bg-[#111111] border border-white/10 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] backdrop-blur-xl animate-in fade-in zoom-in duration-200 origin-top">
          <div className="max-h-60 overflow-y-auto custom-scrollbar">
            {options.map((option, idx) => {
              const optId = option.id || option.value || `opt-${idx}`;
              const optName = option.name || option.label;
              const isSelected = value === optId;
              
              return (
                <button
                  key={optId}
                  type="button"
                  onClick={() => {
                    onChange(optId);
                    setIsOpen(false);
                  }}
                  className={`
                    flex items-center justify-between w-full px-4 py-2.5 text-sm transition-colors
                    ${isSelected 
                      ? "bg-blue-500/10 text-blue-400 font-medium" 
                      : "text-zinc-400 hover:bg-white/5 hover:text-white"}
                  `}
                >
                  <div className="flex items-center gap-2">
                    {option.icon && <option.icon className={`h-4 w-4 ${isSelected ? "text-blue-400" : "text-zinc-500"}`} />}
                    <span>{optName}</span>
                  </div>
                  {isSelected && <Check className="h-3.5 w-3.5" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
