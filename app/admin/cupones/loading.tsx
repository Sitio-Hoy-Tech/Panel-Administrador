export default function Loading() {
  return (
    <div className="w-full space-y-8 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-9 w-32 bg-white/5 rounded-xl" />
          <div className="h-4 w-60 bg-white/[0.03] rounded-lg" />
        </div>
        <div className="h-10 w-36 bg-white/5 rounded-lg" />
      </div>

      <div className="glass-panel overflow-hidden">
        <div className="border-b border-white/[0.05] px-6 py-4 flex gap-6">
          {["Código", "Descuento", "Usos", "Vencimiento", "Estado"].map((col) => (
            <div key={col} className="h-3 w-20 bg-white/[0.03] rounded" />
          ))}
        </div>
        <div className="divide-y divide-white/[0.04]">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="px-6 py-5 flex items-center gap-6">
              <div className="h-7 w-28 bg-white/[0.05] rounded-lg" />
              <div className="h-4 w-16 bg-white/[0.03] rounded" />
              <div className="h-4 w-12 bg-white/[0.03] rounded" />
              <div className="h-4 w-24 bg-white/[0.03] rounded" />
              <div className="h-5 w-16 bg-white/[0.03] rounded-full" />
              <div className="h-8 w-8 bg-white/[0.03] rounded-lg ml-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
