export default function Loading() {
  return (
    <div className="w-full space-y-8 animate-pulse">
      <div className="space-y-2">
        <div className="h-9 w-32 bg-white/5 rounded-xl" />
        <div className="h-4 w-72 bg-white/[0.03] rounded-lg" />
      </div>

      <div className="glass-panel overflow-hidden">
        <div className="p-6 border-b border-white/[0.05]">
          <div className="h-10 w-full bg-white/[0.03] rounded-xl" />
        </div>
        <div className="divide-y divide-white/[0.04]">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="px-6 py-4 flex items-center gap-4">
              <div className="h-9 w-9 bg-white/[0.05] rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-4 w-40 bg-white/[0.04] rounded" />
                <div className="h-3 w-56 bg-white/[0.02] rounded" />
              </div>
              <div className="h-4 w-24 bg-white/[0.03] rounded" />
              <div className="h-8 w-20 bg-white/[0.03] rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
