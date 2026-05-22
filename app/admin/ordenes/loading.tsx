export default function Loading() {
  return (
    <div className="w-full space-y-8 animate-pulse">
      <div className="space-y-2">
        <div className="h-9 w-36 bg-white/5 rounded-xl" />
        <div className="h-4 w-72 bg-white/[0.03] rounded-lg" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="glass-panel p-5 flex flex-col gap-3 h-28">
            <div className="h-8 w-8 bg-white/5 rounded-lg" />
            <div className="space-y-1.5">
              <div className="h-7 w-10 bg-white/5 rounded-lg" />
              <div className="h-3 w-20 bg-white/[0.03] rounded" />
            </div>
          </div>
        ))}
      </div>

      <div className="glass-panel overflow-hidden">
        <div className="p-6 border-b border-white/[0.05]">
          <div className="flex gap-3">
            <div className="h-10 flex-1 bg-white/[0.03] rounded-xl" />
            <div className="h-10 w-32 bg-white/[0.03] rounded-xl" />
            <div className="h-10 w-32 bg-white/[0.03] rounded-xl" />
          </div>
        </div>
        <div className="divide-y divide-white/[0.04]">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="px-6 py-4 flex items-center gap-6">
              <div className="h-4 w-20 bg-white/[0.03] rounded" />
              <div className="h-4 w-32 bg-white/[0.03] rounded" />
              <div className="h-4 w-16 bg-white/[0.03] rounded" />
              <div className="h-4 w-24 bg-white/[0.03] rounded ml-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
