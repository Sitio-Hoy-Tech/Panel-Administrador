"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { createPortal } from "react-dom";
import { statusMap } from "./constants";

interface StatusDropdownProps {
  currentStatus: string;
  onSelect: (status: string) => void;
  isUpdating?: boolean;
}

const MENU_HEIGHT = 320;
const MENU_WIDTH = 200;

export function StatusDropdown({ currentStatus, onSelect, isUpdating }: StatusDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, openUp: false });
  const status = statusMap[currentStatus] || statusMap.pending;
  const StatusIcon = status.icon;

  const toggle = (e: React.MouseEvent) => {
    if (isOpen) { setIsOpen(false); return; }

    const rect = e.currentTarget.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUp = spaceBelow < MENU_HEIGHT + 8;

    let left = rect.left;
    if (left + MENU_WIDTH > window.innerWidth - 8) left = rect.right - MENU_WIDTH;
    if (left < 8) left = 8;

    setCoords({
      top: openUp ? rect.top - MENU_HEIGHT - 8 : rect.bottom + 8,
      left,
      openUp,
    });
    setIsOpen(true);
  };

  if (isUpdating) {
    return (
      <div className="flex items-center gap-2 text-[10px] text-slate-500 px-3 py-1.5 rounded-full bg-white/5 border border-white/[0.05]">
        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        Actualizando...
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={toggle}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.1em] transition-all border border-white/[0.05] hover:border-white/[0.07] shadow-lg ${status.bg} ${status.color} hover:scale-105 active:scale-95`}
      >
        <StatusIcon className="h-3 w-3" />
        {status.label}
        <ChevronDown className={`h-3 w-3 opacity-50 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && createPortal(
        <>
          <div className="fixed inset-0 z-[9998]" onClick={() => setIsOpen(false)} />
          <div
            style={{ top: coords.top, left: coords.left, width: MENU_WIDTH, zIndex: 9999 }}
            className="fixed bg-slate-900 border border-white/[0.07] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] py-2 overflow-hidden"
          >
            <div className="px-3 py-2 border-b border-white/[0.05] mb-1">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Cambiar Estado</span>
            </div>
            <div className="overflow-y-auto" style={{ maxHeight: MENU_HEIGHT - 44 }}>
              {Object.entries(statusMap).map(([key, value]: [string, any]) => {
                const Icon = value.icon;
                const isSelected = currentStatus === key;
                return (
                  <button
                    key={key}
                    onClick={() => { onSelect(key); setIsOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all hover:bg-white/5 ${isSelected ? "bg-white/5" : ""}`}
                  >
                    <div className={`p-1.5 rounded-lg ${value.bg}`}>
                      <Icon className={`h-3.5 w-3.5 ${value.color}`} />
                    </div>
                    <span className={`text-xs font-semibold ${isSelected ? "text-white" : "text-slate-400"}`}>
                      {value.label}
                    </span>
                    {isSelected && (
                      <div className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
}
