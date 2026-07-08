export type CaseManagerContact = {
  id: string;
  displayName: string;
  email: string;
};

export type ClientRequestSummary = {
  id: string;
  requestId: string;
  status: string;
};

export type ClientRecord = {
  id: string;
  displayName: string;
  dob: string;
  clientId: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postcode: string;
  caseManager: CaseManagerContact | null;
  requestCount: number;
  openRequestCount: number;
  relatedRequests: ClientRequestSummary[];
};
