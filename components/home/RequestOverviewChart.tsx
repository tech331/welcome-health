"use client";

export type StatusSlice = {
  label: string;
  count: number;
  color: string;
};

const RADIUS = 70;
const STROKE = 26;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function RequestOverviewChart({ slices }: { slices: StatusSlice[] }) {
  const total = slices.reduce((sum, slice) => sum + slice.count, 0);

  if (total === 0) {
    return (
      <div className="flex h-[180px] items-center justify-center text-sm text-[#2A2A2A]/50">
        No requests to display yet.
      </div>
    );
  }

  let cumulative = 0;
  const multipleSlices = slices.length > 1;
  const gap = multipleSlices ? 3 : 0;

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:gap-8">
      <div className="relative h-[180px] w-[180px] shrink-0">
        <svg
          viewBox="0 0 180 180"
          className="h-full w-full -rotate-90"
          role="img"
          aria-label="Requests by status"
        >
          {slices.map((slice) => {
            const fraction = slice.count / total;
            const dash = Math.max(fraction * CIRCUMFERENCE - gap, 0.5);
            const offset = -cumulative * CIRCUMFERENCE;
            cumulative += fraction;
            return (
              <circle
                key={slice.label}
                cx="90"
                cy="90"
                r={RADIUS}
                fill="none"
                stroke={slice.color}
                strokeWidth={STROKE}
                strokeLinecap="round"
                strokeDasharray={`${dash} ${CIRCUMFERENCE - dash}`}
                strokeDashoffset={offset}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-semibold text-[#2A2A2A]">{total}</span>
          <span className="text-xs text-[#2A2A2A]/50">
            {total === 1 ? "request" : "requests"}
          </span>
        </div>
      </div>

      <ul className="w-full space-y-2">
        {slices.map((slice) => (
          <li
            key={slice.label}
            className="flex items-center justify-between gap-3 text-sm"
          >
            <span className="flex min-w-0 items-center gap-2">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: slice.color }}
              />
              <span className="truncate text-[#2A2A2A]">{slice.label}</span>
            </span>
            <span className="shrink-0 font-medium text-[#2A2A2A]">
              {slice.count}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
