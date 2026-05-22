export default function Loading() {
  return (
    <div className="w-full space-y-8 animate-pulse">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-3">
          <div className="h-5 w-32 bg-white/5 rounded-full" />
          <div className="h-10 w-64 bg-white/5 rounded-xl" />
          <div className="h-4 w-96 bg-white/[0.03] rounded-lg" />
        </div>
        <div className="h-10 w-40 bg-white/5 rounded-full" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(180px,auto)]">
        <div className="glass-panel h-48" />
        <div className="md:col-span-2 glass-panel h-48" />
        <div className="glass-panel h-48" />
        <div className="glass-panel h-48" />
        <div className="glass-panel h-48" />
      </div>

      <div className="glass-panel overflow-hidden">
        <div className="p-6 border-b border-white/[0.05] flex items-center justify-between">
          <div className="h-5 w-44 bg-white/5 rounded-lg" />
          <div className="h-4 w-28 bg-white/[0.03] rounded-lg" />
        </div>
        <div className="p-6 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-14 bg-white/[0.02] rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
