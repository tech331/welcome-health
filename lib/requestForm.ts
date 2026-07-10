// Option lists mirror the corresponding Airtable single-select fields. Keep in
// sync with the base schema (apphNCGqCCoSO0XEJ) if the choices change there.

export const FUNDING_TYPES = [
  "AT-HM Scheme - Fully Managed",
  "AT-HM Scheme - Self Managed",
  "National Disability Insurance Scheme (NDIS)",
  "Commonwealth Home Support Program (CHSP)",
  "Private",
  "Other",
] as const;

export const ITEM_CATEGORIES = [
  "Wheelchairs",
  "Powered Wheelchairs",
  "Seating Systems",
  "Standing Frames",
  "Orthotics",
  "Prosthetics",
  "Communication Devices",
  "Beds",
  "Hoists",
  "Pressure Care",
  "Bathing & Toileting",
  "Ramps",
  "Mobility Aids",
  "Other",
] as const;

export const AU_STATES = [
  "VIC",
  "NSW",
  "SA",
  "QLD",
  "WA",
  "TAS",
  "NT",
  "ACT",
] as const;

// "How often would you like to follow up suppliers" -> Requests.SLA (business days)
export const FOLLOW_UP_OPTIONS = [1, 2, 3, 5, 7, 10, 14] as const;

// Status applied to a newly submitted request.
export const NEW_REQUEST_STATUS = "Quote Requested";

export type ClientOption = {
  id: string;
  name: string;
  clientId: string;
  dateOfBirth: string;
  email: string;
  phone: string;
  fundingType: string;
  caseManagerId: string | null;
  caseManagerName: string;
  payerIds: string[];
};

export type CaseManagerOption = {
  id: string;
  name: string;
  payerIds: string[];
};

export type SupplierOption = {
  id: string;
  name: string;
  averageDeliveryDays: number | null;
  acceptedPayerIds: string[];
};

export type RequestorOption = {
  id: string;
  name: string;
};

export type RequestFormData = {
  clients: ClientOption[];
  caseManagers: CaseManagerOption[];
  suppliers: SupplierOption[];
  requestors: RequestorOption[];
};

export type NewClientInput = {
  clientId?: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phone: string;
  fundingType: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postcode: string;
  caseManagerId: string;
};

export type NewRequestItemInput = {
  name: string;
  url?: string;
  category: string;
  quantity: number;
  notes?: string;
};

export type NewRequestPayload = {
  requestorId?: string;
  client:
    | { mode: "existing"; id: string }
    | { mode: "new"; data: NewClientInput };
  items: NewRequestItemInput[];
  supplierIds: string[];
  followUpBusinessDays: number;
  notes?: string;
};

export type CreateRequestResult = {
  id: string;
  requestId: string;
};

/**
 * Suppliers approved for a client are those whose "Accepted Payers" intersect
 * with the payer(s) linked to the client's case manager.
 */
export function filterSuppliersForPayers(
  suppliers: SupplierOption[],
  payerIds: string[],
): SupplierOption[] {
  if (payerIds.length === 0) return [];
  const payerSet = new Set(payerIds);
  return suppliers.filter((supplier) =>
    supplier.acceptedPayerIds.some((id) => payerSet.has(id)),
  );
}
