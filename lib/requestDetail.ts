export const REQUEST_STAGES = [
  "Draft",
  "Quote Requested",
  "Quote Received",
  "Closed",
] as const;

export type RequestStage = (typeof REQUEST_STAGES)[number];

export type RequestAttachment = {
  id: string;
  url: string;
  filename: string;
  type?: string;
};

export type RequestItemDetail = {
  id: string;
  itemId: string;
  name: string;
  category: string;
  quantity: number | null;
  url: string;
  notes: string;
};

export type RequestSupplierSummary = {
  id: string;
  name: string;
};

export type RequestClientSummary = {
  id: string;
  displayName: string;
  clientId: string;
  fundingType: string;
  phone: string;
  dob: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postcode: string;
};

export type RequestQuoteDetail = {
  id: string;
  quoteId: string;
  price: number | null;
  isManuallyEntered: boolean;
  supplier: RequestSupplierSummary | null;
  attachments: RequestAttachment[];
  createdAt: string | null;
};

export type RequestActivityDetail = {
  id: string;
  activityId: string;
  content: string;
  channel: string;
  direction: string;
  createdAt: string | null;
  relatedQuoteId: string | null;
};

export type RequestDetail = {
  id: string;
  requestId: string;
  requestor: string;
  status: string;
  notes: string;
  slaBusinessDays: number | null;
  createdAt: string | null;
  lastModifiedAt: string | null;
  lastModifiedBy: string;
  client: RequestClientSummary | null;
  caseManager: { id: string; displayName: string } | null;
  suppliers: RequestSupplierSummary[];
  items: RequestItemDetail[];
  quotes: RequestQuoteDetail[];
  activities: RequestActivityDetail[];
  daysElapsed: number | null;
  slaProgressPercent: number | null;
  isSlaOverdue: boolean;
};

/** Map Airtable status values onto the 4-stage metroline. */
export function getRequestStageIndex(status: string): number {
  const normalized = status.trim().toLowerCase();

  if (normalized === "draft") return 0;
  if (normalized === "quote requested" || normalized === "open" || normalized === "in progress") {
    return 1;
  }
  if (normalized === "quote received") return 2;
  if (
    normalized === "closed" ||
    normalized === "complete" ||
    normalized === "done"
  ) {
    return 3;
  }
  // Overdue and unknown stay on Quote Requested visually
  if (normalized === "overdue") return 1;
  return 0;
}

export function isRequestClosed(status: string): boolean {
  const normalized = status.trim().toLowerCase();
  return (
    normalized === "closed" ||
    normalized === "complete" ||
    normalized === "done"
  );
}
