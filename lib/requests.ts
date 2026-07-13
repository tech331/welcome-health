export type RequestRecord = {
  id: string;
  requestId: string;
  requestor: string;
  clientName: string;
  status: string;
  clientIds: string[];
  createdAt: string | null;
  slaBusinessDays: number | null;
  daysElapsed: number | null;
  slaProgressPercent: number | null;
  isSlaOverdue: boolean;
};

export type RequestTab = "all" | "open" | "closed" | "overdue";

const OPEN_STATUSES = new Set([
  "Draft",
  "Quote Requested",
  "Open",
  "In Progress",
]);

const CLOSED_STATUSES = new Set(["Quote Received", "Closed", "Complete"]);

const OVERDUE_STATUSES = new Set(["Overdue"]);

export function isOpenRequest(status: string): boolean {
  return OPEN_STATUSES.has(status);
}

export function filterRequestsByTab(
  requests: RequestRecord[],
  tab: RequestTab,
): RequestRecord[] {
  if (tab === "all") return requests;

  return requests.filter((request) => {
    const status = request.status;

    if (tab === "open") return OPEN_STATUSES.has(status);
    if (tab === "closed") return CLOSED_STATUSES.has(status);
    if (tab === "overdue") return OVERDUE_STATUSES.has(status);

    return true;
  });
}

export function getRequestTabCounts(requests: RequestRecord[]) {
  return {
    all: requests.length,
    open: filterRequestsByTab(requests, "open").length,
    closed: filterRequestsByTab(requests, "closed").length,
    overdue: filterRequestsByTab(requests, "overdue").length,
  };
}
