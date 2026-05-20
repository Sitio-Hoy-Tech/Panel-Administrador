"use client";

import { useState, useRef, useEffect } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from "lucide-react";
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  eachDayOfInterval,
  parseISO
} from "date-fns";
import { es } from "date-fns/locale";
import clsx from "clsx";

interface CustomDatePickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
}

export function CustomDatePicker({ value, onChange, label, placeholder = "Seleccionar fecha" }: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(value ? parseISO(value) : new Date());
  const containerRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  const selectedDate = value ? parseISO(value) : null;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        calendarRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
      }, 150);
    }
  }, [isOpen]);

  // Update currentMonth when value changes externally (e.g. when opening modal with existing coupon)

  const onDateClick = (day: Date) => {
    onChange(format(day, "yyyy-MM-dd"));
    setIsOpen(false);
  };

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.05]">
        <button
          type="button"
          onClick={prevMonth}
          className="p-1.5 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="text-sm font-bold text-white capitalize">
          {format(currentMonth, "MMMM yyyy", { locale: es })}
        </span>
        <button
          type="button"
          onClick={nextMonth}
          className="p-1.5 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    );
  };

  const renderDays = () => {
    const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
    return (
      <div className="grid grid-cols-7 mb-2 px-2">
        {days.map((day) => (
          <div key={day} className="text-[10px] font-bold text-slate-500 uppercase text-center py-2">
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const calendarDays = eachDayOfInterval({
      start: startDate,
      end: endDate,
    });

    return (
      <div className="grid grid-cols-7 gap-1 px-2 pb-3">
        {calendarDays.map((day) => {
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isToday = isSameDay(day, new Date());

          return (
            <button
              key={day.toString()}
              type="button"
              onClick={() => onDateClick(day)}
              className={clsx(
                "h-9 w-9 rounded-xl flex items-center justify-center text-sm transition-all relative",
                !isCurrentMonth ? "text-slate-600 opacity-30" : "text-slate-300",
                isSelected 
                  ? "bg-white text-black font-bold shadow-lg shadow-white/10" 
                  : "hover:bg-white/10",
                isToday && !isSelected && "text-white border border-white/[0.07]"
              )}
            >
              {format(day, "d")}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      {label && (
        <label className="block text-xs font-medium text-slate-400 mb-1">
          {label}
        </label>
      )}
      
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          "glass-input w-full flex items-center justify-between py-3 px-4 cursor-pointer group transition-all",
          isOpen ? "ring-2 ring-white/10 border-white/[0.07]" : "hover:border-white/[0.07]"
        )}
      >
        <div className="flex items-center gap-3">
          <CalendarIcon className={clsx(
            "h-4 w-4 transition-colors",
            selectedDate ? "text-white" : "text-slate-500 group-hover:text-slate-400"
          )} />
          <span className={clsx(
            "text-base transition-colors",
            selectedDate ? "text-white font-medium" : "text-slate-500"
          )}>
            {selectedDate ? format(selectedDate, "dd 'de' MMMM, yyyy", { locale: es }) : placeholder}
          </span>
        </div>
        
        {selectedDate && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange("");
            }}
            className="p-1 hover:bg-white/10 rounded-full transition-colors text-slate-500 hover:text-white"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      {isOpen && (
        <div 
          ref={calendarRef}
          className="absolute top-full left-0 mt-2 z-[100] w-full min-w-[310px] bg-slate-900/90 border border-white/[0.07] rounded-2xl shadow-2xl backdrop-blur-3xl animate-in fade-in zoom-in-95 duration-200"
        >
          {renderHeader()}
          <div className="p-1">
            {renderDays()}
            {renderCells()}
          </div>
          
          <div className="p-3 border-t border-white/[0.05] bg-white/[0.02] flex justify-between items-center">
            <button
              type="button"
              onClick={() => {
                const today = new Date();
                onChange(format(today, "yyyy-MM-dd"));
                setIsOpen(false);
              }}
              className="text-xs font-bold text-slate-400 hover:text-white transition-colors"
            >
              Hoy
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-xs font-bold text-white hover:opacity-80 transition-opacity"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
