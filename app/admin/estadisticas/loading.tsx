export default function Loading() {
  return (
    <div className="w-full space-y-8 animate-pulse">
      <div className="space-y-2">
        <div className="h-9 w-52 bg-white/5 rounded-xl" />
        <div className="h-4 w-80 bg-white/[0.03] rounded-lg" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="glass-panel p-5 h-28 flex flex-col gap-3">
            <div className="h-8 w-8 bg-white/5 rounded-lg" />
            <div className="space-y-1.5">
              <div className="h-7 w-16 bg-white/5 rounded-lg" />
              <div className="h-3 w-24 bg-white/[0.03] rounded" />
            </div>
          </div>
        ))}
      </div>

      <div className="glass-panel p-6 h-72" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-6 h-64" />
        <div className="glass-panel p-6 h-64" />
      </div>
    </div>
  );
}
