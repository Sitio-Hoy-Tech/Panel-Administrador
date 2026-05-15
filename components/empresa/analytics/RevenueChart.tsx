"use client";

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

interface RevenueChartProps {
  data: { name: string; value: number }[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <div className="glass-panel p-6 min-h-[400px] flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-bold text-white tracking-tight">Tendencia de Ventas</h3>
          <p className="text-zinc-500 text-xs mt-1 uppercase tracking-widest">Ingresos por día (Últimos días activos)</p>
        </div>
      </div>
      
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ffffff" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#ffffff" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis 
              dataKey="name" 
              stroke="#52525b" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false}
              dy={10}
            />
            <YAxis 
              stroke="#52525b" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: "#111111", 
                border: "1px solid rgba(255,255,255,0.1)", 
                borderRadius: "12px",
                fontSize: "12px",
                color: "#fff"
              }}
              itemStyle={{ color: "#fff" }}
              cursor={{ stroke: "rgba(255,255,255,0.1)", strokeWidth: 1 }}
            />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="#ffffff" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorValue)" 
              animationDuration={2000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
