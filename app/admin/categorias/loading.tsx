export default function Loading() {
  return (
    <div className="w-full space-y-8 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-9 w-40 bg-white/5 rounded-xl" />
          <div className="h-4 w-64 bg-white/[0.03] rounded-lg" />
        </div>
        <div className="h-10 w-40 bg-white/5 rounded-lg" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="glass-panel p-5 h-24 flex items-center gap-4">
            <div className="h-10 w-10 bg-white/[0.04] rounded-xl flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 bg-white/[0.04] rounded" />
              <div className="h-3 w-20 bg-white/[0.02] rounded" />
            </div>
            <div className="h-8 w-8 bg-white/[0.03] rounded-lg flex-shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
