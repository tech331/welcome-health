export function TableSkeleton({
  title,
  columns,
  rows = 6,
}: {
  title: string;
  columns: number;
  rows?: number;
}) {
  return (
    <div className="h-full overflow-y-auto px-8 pb-8 pt-8">
      <h1 className="mb-6 font-sans text-2xl font-semibold text-[#2A2A2A]">
        {title}
      </h1>
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="flex gap-4 border-b border-gray-200 bg-[#faf8f5] px-4 py-3">
          {Array.from({ length: columns }).map((_, index) => (
            <div
              key={index}
              className="h-4 flex-1 animate-pulse rounded bg-black/[0.06]"
            />
          ))}
        </div>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div
            key={rowIndex}
            className="flex gap-4 border-b border-gray-100 px-4 py-4 last:border-b-0"
          >
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div
                key={colIndex}
                className="h-4 flex-1 animate-pulse rounded bg-black/[0.04]"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
