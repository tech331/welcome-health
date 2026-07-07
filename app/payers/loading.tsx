export default function Loading() {
  return (
    <div className="h-full overflow-y-auto px-8 pb-8 pt-8">
      <h1 className="mb-6 font-sans text-2xl font-semibold text-[#2A2A2A]">
        Payers
      </h1>
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm"
          >
            <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-black/[0.06]" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-48 animate-pulse rounded bg-black/[0.06]" />
              <div className="h-3 w-64 animate-pulse rounded bg-black/[0.04]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
