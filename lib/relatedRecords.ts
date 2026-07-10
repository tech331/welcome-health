export type RelatedRecordType = "client" | "caseManager" | "supplier";

export const RELATED_RECORD_LIST_PATHS: Record<RelatedRecordType, string> = {
  client: "/clients",
  caseManager: "/case-managers",
  supplier: "/suppliers",
};

export const RELATED_RECORD_LIST_LABELS: Record<RelatedRecordType, string> = {
  client: "Clients",
  caseManager: "Case Managers",
  supplier: "Suppliers",
};
