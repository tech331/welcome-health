import type { RequestRecord } from "@/lib/requests";

type SlaProgressProps = Pick<
  RequestRecord,
  "slaBusinessDays" | "daysElapsed" | "slaProgressPercent" | "isSlaOverdue"
>;

export function SlaProgress({
  slaBusinessDays,
  daysElapsed,
  slaProgressPercent,
  isSlaOverdue,
}: SlaProgressProps) {
  if (slaBusinessDays == null || daysElapsed == null) {
    return <span className="text-[#2A2A2A]/40">—</span>;
  }

  const percent = Math.max(0, Math.min(100, slaProgressPercent ?? 0));
  const nearingSla = !isSlaOverdue && percent >= 80;

  const barColor = isSlaOverdue
    ? "bg-[#b3261e]"
    : nearingSla
      ? "bg-[#c88a1f]"
      : "bg-[#2d6a4f]";

  const labelColor = isSlaOverdue
    ? "text-[#b3261e]"
    : nearingSla
      ? "text-[#8a6a1f]"
      : "text-[#606060]";

  const label = isSlaOverdue
    ? `${daysElapsed - slaBusinessDays}d over`
    : `${daysElapsed}/${slaBusinessDays}d`;

  return (
    <div className="flex w-36 max-w-full flex-col gap-1">
      <div
        className="h-1.5 w-full overflow-hidden rounded-full bg-black/[0.06]"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`SLA ${label}`}
      >
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${Math.max(percent, isSlaOverdue ? 100 : 4)}%` }}
        />
      </div>
      <span className={`text-xs font-medium ${labelColor}`}>{label}</span>
    </div>
  );
}
