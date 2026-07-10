import type { ClientRequestSummary } from "@/lib/clients";

export type CaseManagerPayer = {
  id: string;
  name: string;
};

export type CaseManagerClientSummary = {
  id: string;
  displayName: string;
};

export type CaseManagerRecord = {
  id: string;
  displayName: string;
  email: string;
  phone: string;
  payer: string;
};

export type CaseManagerDetail = {
  id: string;
  displayName: string;
  status: string;
  email: string;
  phone: string;
  payer: CaseManagerPayer | null;
  relatedRequests: ClientRequestSummary[];
  relatedClients: CaseManagerClientSummary[];
};
