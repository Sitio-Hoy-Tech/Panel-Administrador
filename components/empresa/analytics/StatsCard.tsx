import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  color: string;
}

export function StatsCard({ title, value, icon: Icon, trend, color }: StatsCardProps) {
  return (
    <div className="glass-panel p-6 flex flex-col gap-4 group transition-all duration-300 hover:border-white/20">
      <div className="flex items-start justify-between">
        <div className={`h-12 w-12 rounded-2xl bg-${color}-500/10 border border-${color}-500/20 flex items-center justify-center shadow-lg`}>
          <Icon className={`h-6 w-6 text-${color}-400`} />
        </div>
        {trend && (
          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full uppercase tracking-wider">
            {trend}
          </span>
        )}
      </div>
      <div>
        <h3 className="text-zinc-500 text-xs font-semibold uppercase tracking-widest">{title}</h3>
        <p className="text-3xl font-bold text-white mt-1 group-hover:scale-105 transition-transform origin-left duration-500">
          {value}
        </p>
      </div>
    </div>
  );
}
