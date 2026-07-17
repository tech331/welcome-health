function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-[#eceae6] bg-white p-5 shadow-sm ${className}`}
    >
      <div className="skeleton h-3 w-24 rounded" />
      <div className="mt-4 space-y-3">
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-4 w-1/2 rounded" />
        <div className="skeleton h-4 w-2/3 rounded" />
      </div>
    </div>
  );
}

export default function RequestDetailLoading() {
  return (
    <div className="h-full w-full overflow-y-auto px-8 pb-8 pt-8">
      <div className="skeleton mb-4 h-4 w-40 rounded" />

      <div className="mx-auto max-w-7xl space-y-5">
        <div className="rounded-2xl border border-[#eceae6] bg-white p-5 shadow-sm">
          <div className="skeleton h-7 w-48 rounded" />
          <div className="skeleton mt-2 h-4 w-32 rounded" />
          <div className="mt-6 flex items-center gap-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex flex-1 items-center gap-3">
                <div className="skeleton h-8 w-8 rounded-full" />
                <div className="skeleton h-3 flex-1 rounded" />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-[#eceae6] bg-white p-5 shadow-sm">
          <div className="flex flex-wrap gap-6 sm:flex-nowrap">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="min-w-0 flex-1 space-y-2">
                <div className="skeleton h-5 w-5 rounded" />
                <div className="skeleton h-3 w-20 rounded" />
                <div className="skeleton h-7 w-16 rounded" />
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_20rem] xl:items-start">
          <div className="min-w-0 space-y-5">
            <SkeletonCard className="min-h-[13rem]" />
            <SkeletonCard className="min-h-[11rem]" />
            <SkeletonCard className="min-h-[8rem]" />
          </div>
          <SkeletonCard className="min-h-[16rem]" />
        </div>
      </div>
    </div>
  );
}
