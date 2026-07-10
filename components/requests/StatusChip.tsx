const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  Draft: { bg: "#ede8e3", text: "#6b6b6b" },
  Active: { bg: "#dff0e4", text: "#2d6a4f" },
  "Quote Requested": { bg: "#dbe7fb", text: "#274b8a" },
  "Quote Received": { bg: "#fdeecf", text: "#8a6a1f" },
  Open: { bg: "#dbe7fb", text: "#274b8a" },
  "In Progress": { bg: "#f3ddf1", text: "#7a2f74" },
  Closed: { bg: "#dff0e4", text: "#2d6a4f" },
  Complete: { bg: "#dff0e4", text: "#2d6a4f" },
  Done: { bg: "#dff0e4", text: "#2d6a4f" },
  Overdue: { bg: "#fbe0de", text: "#b3261e" },
};

const DEFAULT_STYLE = { bg: "#ede8e3", text: "#6b6b6b" };

export function StatusChip({ status }: { status: string }) {
  if (!status || status === "—") {
    return <span className="text-[#2A2A2A]/40">—</span>;
  }

  const style =
    STATUS_STYLES[status] ??
    (status.trim().toLowerCase() === "active"
      ? STATUS_STYLES.Active
      : DEFAULT_STYLE);

  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={{ backgroundColor: style.bg, color: style.text }}
    >
      {status}
    </span>
  );
}
