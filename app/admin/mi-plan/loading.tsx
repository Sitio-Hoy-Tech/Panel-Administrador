export default function Loading() {
  return (
    <div className="w-full space-y-8 animate-pulse">
      <div className="space-y-2">
        <div className="h-9 w-32 bg-white/5 rounded-xl" />
        <div className="h-4 w-64 bg-white/[0.03] rounded-lg" />
      </div>

      <div className="glass-panel p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-6 w-28 bg-white/5 rounded-full" />
            <div className="h-8 w-44 bg-white/5 rounded-xl" />
          </div>
          <div className="h-16 w-16 bg-white/[0.04] rounded-2xl" />
        </div>
        <div className="border-t border-white/[0.05] pt-6 space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-4 w-4 bg-white/[0.04] rounded-full flex-shrink-0" />
              <div className="h-4 w-56 bg-white/[0.03] rounded" />
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="glass-panel p-6 h-40 flex flex-col gap-3">
            <div className="h-4 w-20 bg-white/[0.03] rounded" />
            <div className="h-8 w-12 bg-white/5 rounded-lg" />
            <div className="h-3 w-32 bg-white/[0.02] rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
