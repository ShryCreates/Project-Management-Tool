interface Props {
  className?: string;
  rounded?: string;
}

export function Skeleton({ className = '', rounded = 'rounded-lg' }: Props) {
  return <div className={`skeleton ${rounded} ${className}`} />;
}

export function DashboardSkeleton() {
  return (
    <div className="max-w-7xl mx-auto space-y-8 fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5 space-y-3">
            <Skeleton className="h-7 w-7 rounded-lg" />
            <Skeleton className="h-7 w-12" />
            <Skeleton className="h-3 w-24" />
          </div>
        ))}
      </div>

      {/* Chart + deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-800/60 border border-slate-700/50 rounded-xl p-5 space-y-4">
          <Skeleton className="h-4 w-36" />
          <div className="flex items-end gap-2 h-24">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="flex-1">
                <Skeleton className="w-full rounded-t-sm" style={{ height: `${20 + Math.random() * 60}%` } as any} />
              </div>
            ))}
          </div>
        </div>
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5 space-y-3">
          <Skeleton className="h-4 w-40" />
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-2.5 w-2.5 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-2.5 w-20" />
              </div>
              <Skeleton className="h-3 w-14" />
            </div>
          ))}
        </div>
      </div>

      {/* Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="h-4 w-24" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-8" />
                  </div>
                  <Skeleton className="h-2 w-full rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5 space-y-3">
          <Skeleton className="h-4 w-32" />
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-start gap-3 p-2.5">
              <Skeleton className="h-5 w-5 rounded" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-2.5 w-28" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function BoardSkeleton() {
  return (
    <div className="flex gap-4 p-6 h-full overflow-x-auto fade-in-up">
      {[...Array(4)].map((_, col) => (
        <div key={col} className="w-72 shrink-0 space-y-3">
          {/* Column header */}
          <div className="flex items-center gap-2 px-1">
            <Skeleton className="h-2.5 w-2.5 rounded-full" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-5 w-6 rounded-full" />
          </div>
          {/* Cards */}
          <div className="bg-slate-800/40 rounded-xl p-2 space-y-2">
            {[...Array(col === 1 ? 3 : col === 2 ? 2 : 1)].map((_, card) => (
              <div key={card} className="bg-slate-800 border border-slate-700/50 rounded-xl p-3.5 space-y-2.5">
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-5 w-12 rounded-full" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-3/4" />
                <div className="flex items-center justify-between pt-1">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-6 w-6 rounded-full" />
                </div>
              </div>
            ))}
            <Skeleton className="h-8 w-full rounded-lg mt-1" />
          </div>
        </div>
      ))}
    </div>
  );
}
