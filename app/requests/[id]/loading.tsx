export default function RequestDetailLoading() {
  return (
    <div className="h-full w-full overflow-y-auto px-8 pb-8 pt-8">
      <div className="mb-4 h-4 w-40 animate-pulse rounded bg-[#ede8e3]" />
      <div className="mx-auto max-w-7xl space-y-5">
        <div className="h-32 animate-pulse rounded-2xl border border-[#eceae6] bg-white" />
        <div className="h-28 animate-pulse rounded-2xl border border-[#eceae6] bg-white" />
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="space-y-5">
            <div className="h-52 animate-pulse rounded-2xl border border-[#eceae6] bg-white" />
            <div className="h-48 animate-pulse rounded-2xl border border-[#eceae6] bg-white" />
          </div>
          <div className="h-64 animate-pulse rounded-2xl border border-[#eceae6] bg-white" />
        </div>
      </div>
    </div>
  );
}
