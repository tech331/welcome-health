import { Clock, Gauge, ReceiptText, Truck, type LucideIcon } from "lucide-react";
import type { RequestDetail } from "@/lib/requestDetail";

type RequestMetricsProps = {
  request: RequestDetail;
};

function Metric({
  icon: Icon,
  label,
  value,
  tone = "default",
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  tone?: "default" | "warning" | "danger" | "success";
}) {
  const valueColor =
    tone === "danger"
      ? "text-[#b3261e]"
      : tone === "warning"
        ? "text-[#8a6a1f]"
        : tone === "success"
          ? "text-[#2d6a4f]"
          : "text-[#1a1a1a]";

  return (
    <div className="flex min-w-0 flex-1 flex-col items-center px-4 py-1 text-center sm:items-start sm:text-left">
      <Icon
        className="mb-2 h-5 w-5 text-[#6f9a85]"
        strokeWidth={1.75}
        aria-hidden="true"
      />
      <div className="text-[11px] font-medium uppercase tracking-wide text-[#606060]">
        {label}
      </div>
      <div className={`mt-1 truncate text-2xl font-semibold ${valueColor}`}>
        {value}
      </div>
    </div>
  );
}

export function RequestMetrics({ request }: RequestMetricsProps) {
  const quotesWithPrice = request.quotes.filter((q) => q.price != null).length;
  const slaLabel =
    request.slaBusinessDays != null
      ? `${request.slaBusinessDays} ${
          request.slaBusinessDays === 1 ? "day" : "days"
        }`
      : "—";

  let slaProgress = "—";
  let slaTone: "default" | "warning" | "danger" | "success" = "default";

  if (request.daysElapsed != null && request.slaBusinessDays != null) {
    slaProgress = `${request.daysElapsed} / ${request.slaBusinessDays} days`;
    if (request.isSlaOverdue) {
      slaTone = "danger";
    } else if ((request.slaProgressPercent ?? 0) >= 80) {
      slaTone = "warning";
    } else {
      slaTone = "success";
    }
  }

  return (
    <div className="rounded-2xl border border-[#eceae6] bg-white p-5 shadow-sm">
      <div className="flex flex-wrap divide-y divide-[#f0eee9] sm:flex-nowrap sm:divide-x sm:divide-y-0">
        <Metric icon={Clock} label="SLA" value={slaLabel} />
        <Metric
          icon={Gauge}
          label="SLA progress"
          value={slaProgress}
          tone={slaTone}
        />
        <Metric
          icon={ReceiptText}
          label="Quotes"
          value={String(quotesWithPrice || request.quotes.length)}
        />
        <Metric
          icon={Truck}
          label="Suppliers contacted"
          value={String(request.suppliers.length)}
        />
      </div>
    </div>
  );
}
