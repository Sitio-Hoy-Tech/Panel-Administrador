"use client";

import { Minus, Plus } from "lucide-react";
import { useState, useEffect } from "react";

interface CustomNumberInputProps {
  id: string;
  name: string;
  defaultValue?: string | number;
  placeholder?: string;
  min?: number;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  prefix?: string;
  suppressHydrationWarning?: boolean;
}

function formatDisplay(val: string | number): string {
  if (val === "" || val === undefined || val === null) return "";
  const digits = String(val).replace(/\./g, "");
  if (digits === "") return "";
  const num = parseInt(digits, 10);
  if (isNaN(num)) return digits;
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function toRaw(display: string): string {
  return display.replace(/\./g, "");
}

export function CustomNumberInput({
  id,
  name,
  defaultValue = "",
  placeholder,
  min = 0,
  required,
  disabled,
  className = "",
  prefix,
}: CustomNumberInputProps) {
  const [displayValue, setDisplayValue] = useState<string>(() => formatDisplay(defaultValue));

  useEffect(() => {
    setDisplayValue(formatDisplay(defaultValue));
  }, [defaultValue]);

  const rawValue = toRaw(displayValue);

  const handleDecrement = () => {
    const num = rawValue === "" ? NaN : parseInt(rawValue, 10);
    if (isNaN(num)) {
      setDisplayValue(formatDisplay(min));
    } else if (num > min) {
      setDisplayValue(formatDisplay(num - 1));
    }
  };

  const handleIncrement = () => {
    const num = rawValue === "" ? NaN : parseInt(rawValue, 10);
    if (isNaN(num)) {
      setDisplayValue(formatDisplay(min + 1));
    } else {
      setDisplayValue(formatDisplay(num + 1));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const digits = val.replace(/\./g, "");
    if (digits === "" || /^\d+$/.test(digits)) {
      setDisplayValue(digits === "" ? "" : formatDisplay(parseInt(digits, 10)));
    }
  };

  return (
    <div className={`relative group ${className}`}>
      {prefix && (
        <span className="absolute left-4 top-3.5 text-slate-500 font-medium z-10">
          {prefix}
        </span>
      )}

      <input type="hidden" name={name} value={rawValue} />

      <input
        id={id}
        type="text"
        inputMode="numeric"
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        value={displayValue}
        onChange={handleInputChange}
        className={`glass-input w-full py-3 ${prefix ? "pl-8" : "pl-4"} pr-24 transition-all duration-300 focus:ring-2 focus:ring-primary/20`}
        suppressHydrationWarning
      />

      <div className="absolute right-2 top-1.5 flex gap-1">
        <button
          type="button"
          onClick={handleDecrement}
          disabled={disabled}
          className="h-8 w-8 flex items-center justify-center rounded-lg bg-white/5 border border-white/[0.07] text-slate-400 hover:text-white hover:bg-white/10 hover:border-white/[0.07] transition-all active:scale-90 disabled:opacity-30"
        >
          <Minus className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={handleIncrement}
          disabled={disabled}
          className="h-8 w-8 flex items-center justify-center rounded-lg bg-white/5 border border-white/[0.07] text-slate-400 hover:text-white hover:bg-white/10 hover:border-white/[0.07] transition-all active:scale-90 disabled:opacity-30"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
