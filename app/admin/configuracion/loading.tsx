export default function Loading() {
  return (
    <div className="w-full space-y-8 animate-pulse">
      <div className="space-y-2">
        <div className="h-9 w-44 bg-white/5 rounded-xl" />
        <div className="h-4 w-72 bg-white/[0.03] rounded-lg" />
      </div>

      {[...Array(3)].map((_, section) => (
        <div key={section} className="glass-panel p-8 space-y-6">
          <div className="space-y-1">
            <div className="h-5 w-40 bg-white/5 rounded-lg" />
            <div className="h-4 w-64 bg-white/[0.03] rounded" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[...Array(4)].map((_, j) => (
              <div key={j} className="space-y-2">
                <div className="h-3 w-28 bg-white/[0.03] rounded" />
                <div className="h-11 w-full bg-white/[0.03] rounded-xl" />
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="flex justify-end">
        <div className="h-11 w-40 bg-white/5 rounded-lg" />
      </div>
    </div>
  );
}
