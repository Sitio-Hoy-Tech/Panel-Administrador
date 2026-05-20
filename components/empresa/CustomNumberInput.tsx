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
  suppressHydrationWarning,
}: CustomNumberInputProps) {
  const [value, setValue] = useState<string | number>(defaultValue);

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  const handleDecrement = () => {
    const numValue = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(numValue)) {
      setValue(min);
    } else if (numValue > min) {
      setValue(numValue - 1);
    }
  };

  const handleIncrement = () => {
    const numValue = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(numValue)) {
      setValue(min + 1);
    } else {
      setValue(numValue + 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Permitir solo números y un punto decimal
    if (val === "" || /^\d*\.?\d*$/.test(val)) {
      setValue(val);
    }
  };

  return (
    <div className={`relative group ${className}`}>
      {prefix && (
        <span className="absolute left-4 top-3.5 text-slate-500 font-medium z-10">
          {prefix}
        </span>
      )}
      
      <input
        id={id}
        name={name}
        type="text"
        inputMode="decimal"
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        value={value}
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
