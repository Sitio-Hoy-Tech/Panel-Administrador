export default function Loading() {
  return (
    <div className="w-full space-y-8 animate-pulse">
      <div className="space-y-2">
        <div className="h-9 w-32 bg-white/5 rounded-xl" />
        <div className="h-4 w-72 bg-white/[0.03] rounded-lg" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-8 space-y-4">
          <div className="h-10 w-10 bg-white/[0.04] rounded-xl" />
          <div className="h-6 w-40 bg-white/5 rounded-lg" />
          <div className="space-y-2">
            <div className="h-4 w-full bg-white/[0.03] rounded" />
            <div className="h-4 w-3/4 bg-white/[0.03] rounded" />
          </div>
          <div className="h-11 w-36 bg-white/5 rounded-lg" />
        </div>
        <div className="glass-panel p-8 space-y-4">
          <div className="h-10 w-10 bg-white/[0.04] rounded-xl" />
          <div className="h-6 w-48 bg-white/5 rounded-lg" />
          <div className="space-y-2">
            <div className="h-4 w-full bg-white/[0.03] rounded" />
            <div className="h-4 w-2/3 bg-white/[0.03] rounded" />
          </div>
          <div className="h-11 w-36 bg-white/5 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
