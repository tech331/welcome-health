import type { CaseManagerRecord } from "./caseManagers";
import type { CaseManagerContact, ClientRecord } from "./clients";
import {
  getInitials,
  type PayerCaseManager,
  type PayerRecord,
  type PayerSupplier,
} from "./payers";
import { isOpenRequest, type RequestRecord } from "./requests";
import type { SupplierRecord } from "./suppliers";
import {
  NEW_REQUEST_STATUS,
  type CaseManagerOption,
  type ClientOption,
  type CreateRequestResult,
  type NewClientInput,
  type NewRequestPayload,
  type RequestFormData,
  type RequestorOption,
  type SupplierOption,
} from "./requestForm";

const AIRTABLE_API_URL = "https://api.airtable.com/v0";

const AIRTABLE_BASE_ID =
  process.env.AIRTABLE_BASE_ID ?? "apphNCGqCCoSO0XEJ";
const AIRTABLE_REQUESTS_TABLE_ID =
  process.env.AIRTABLE_REQUESTS_TABLE_ID ?? "tblsenO8jvgTFhfHw";
const AIRTABLE_CLIENTS_TABLE_ID =
  process.env.AIRTABLE_CLIENTS_TABLE_ID ?? "Clients";
const AIRTABLE_CASE_MANAGERS_TABLE_ID =
  process.env.AIRTABLE_CASE_MANAGERS_TABLE_ID ?? "tblvcPNOPrf48XuB7";
const AIRTABLE_PAYERS_TABLE_ID =
  process.env.AIRTABLE_PAYERS_TABLE_ID ?? "Payers";
const AIRTABLE_SUPPLIERS_TABLE_ID =
  process.env.AIRTABLE_SUPPLIERS_TABLE_ID ?? "Suppliers";
const AIRTABLE_ITEMS_TABLE_ID =
  process.env.AIRTABLE_ITEMS_TABLE_ID ?? "tblvY7qWlqrtjXvR9";
// Requestor options are sourced from the Users table.
const AIRTABLE_USERS_TABLE_ID =
  process.env.AIRTABLE_USERS_TABLE_ID ?? "tbl7fqZOh1l9zfGiH";

// How long (seconds) to cache Airtable responses. Repeat page loads within
// this window are served instantly from cache instead of re-fetching.
const AIRTABLE_REVALIDATE_SECONDS = 30;

function getApiKey(): string | undefined {
  return process.env.AIRTABLE_API_KEY;
}

export function isAirtableConfigured(): boolean {
  return Boolean(getApiKey());
}

type AirtableRecord = {
  id: string;
  fields: Record<string, unknown>;
};

type AirtableListResponse = {
  records: AirtableRecord[];
  offset?: string;
};

async function fetchAirtableRecords(
  tableId: string,
): Promise<AirtableRecord[]> {
  const apiKey = getApiKey();
  if (!apiKey) {
    return [];
  }

  const records: AirtableRecord[] = [];
  let offset: string | undefined;

  do {
    const url = new URL(
      `${AIRTABLE_API_URL}/${AIRTABLE_BASE_ID}/${tableId}`,
    );
    if (offset) {
      url.searchParams.set("offset", offset);
    }

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      next: { revalidate: AIRTABLE_REVALIDATE_SECONDS },
    });

    if (!response.ok) {
      throw new Error(
        `Airtable request failed (${response.status}): ${await response.text()}`,
      );
    }

    const data = (await response.json()) as AirtableListResponse;
    records.push(...data.records);
    offset = data.offset;
  } while (offset);

  return records;
}

async function fetchAirtableRecord(
  tableId: string,
  recordId: string,
): Promise<AirtableRecord | null> {
  const apiKey = getApiKey();
  if (!apiKey) return null;

  const response = await fetch(
    `${AIRTABLE_API_URL}/${AIRTABLE_BASE_ID}/${encodeURIComponent(
      tableId,
    )}/${recordId}`,
    {
      headers: { Authorization: `Bearer ${apiKey}` },
      cache: "no-store",
    },
  );

  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(
      `Airtable request failed (${response.status}): ${await response.text()}`,
    );
  }

  return (await response.json()) as AirtableRecord;
}

async function createAirtableRecords(
  tableId: string,
  recordsFields: Record<string, unknown>[],
): Promise<AirtableRecord[]> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("Airtable is not configured (missing AIRTABLE_API_KEY)");
  }

  const created: AirtableRecord[] = [];

  // Airtable accepts a maximum of 10 records per create request.
  for (let i = 0; i < recordsFields.length; i += 10) {
    const chunk = recordsFields.slice(i, i + 10);
    const response = await fetch(
      `${AIRTABLE_API_URL}/${AIRTABLE_BASE_ID}/${encodeURIComponent(tableId)}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          records: chunk.map((fields) => ({ fields })),
          typecast: true,
        }),
        cache: "no-store",
      },
    );

    if (!response.ok) {
      throw new Error(
        `Airtable create failed (${response.status}): ${await response.text()}`,
      );
    }

    const data = (await response.json()) as AirtableListResponse;
    created.push(...data.records);
  }

  return created;
}

function fieldToString(value: unknown): string {
  if (value == null) return "—";
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }
  if (Array.isArray(value)) {
    return value.map((item) => fieldToString(item)).join(", ") || "—";
  }
  return "—";
}

function extractRecordIds(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function formatDob(value: unknown): string {
  if (value == null) return "—";
  if (typeof value !== "string") return fieldToString(value);

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getPersonDisplayName(fields: Record<string, unknown>): string {
  const firstName =
    fields["First Name"] ?? fields["First name"] ?? fields["first_name"];
  const lastName =
    fields["Last Name"] ?? fields["Last name"] ?? fields["last_name"];

  if (firstName || lastName) {
    const name = [fieldToString(firstName), fieldToString(lastName)]
      .filter((part) => part !== "—")
      .join(" ")
      .trim();
    if (name && !isPlaceholderPersonName(name)) return name;
  }

  const fullName =
    fields["Name"] ?? fields["Full Name"] ?? fields["Case Manager Name"];
  if (fullName) {
    const name = fieldToString(fullName);
    if (name !== "—" && !isPlaceholderPersonName(name)) return name;
  }

  return "—";
}

function isPlaceholderPersonName(name: string): boolean {
  const normalized = name.trim().toLowerCase();
  return (
    normalized === "unnamed record" ||
    normalized === "unnamed" ||
    normalized.startsWith("rec")
  );
}

function getClientDisplayName(fields: Record<string, unknown>): string {
  const name = getPersonDisplayName(fields);
  if (name !== "—") return name;

  const clientName = fields["Client Name"] ?? fields["name"];
  if (clientName) return fieldToString(clientName);

  return "—";
}

function getLookupValue(value: unknown): string {
  if (Array.isArray(value) && value.length > 0) {
    return fieldToString(value[0]);
  }
  return fieldToString(value);
}

function mapCaseManagerRecord(record: AirtableRecord): CaseManagerContact {
  const { fields } = record;

  return {
    id: record.id,
    displayName: getPersonDisplayName(fields),
    email: fieldToString(fields["Email"] ?? fields["email"]),
  };
}

function resolveCaseManagerFromLookups(
  fields: Record<string, unknown>,
): CaseManagerContact | null {
  const firstName = getLookupValue(
    fields["First Name (from Case Manager)"] ??
      fields["Case Manager First Name"],
  );
  const lastName = getLookupValue(
    fields["Last Name (from Case Manager)"] ?? fields["Case Manager Last Name"],
  );
  const email = getLookupValue(
    fields["Email (from Case Manager)"] ?? fields["Case Manager Email"],
  );

  const displayName = [firstName, lastName]
    .filter((part) => part !== "—")
    .join(" ")
    .trim();

  if (!displayName) return null;

  const linkedIds = extractRecordIds(
    fields["Case Manager"] ?? fields["case_manager"],
  );

  return {
    id: linkedIds[0] ?? displayName,
    displayName,
    email: email !== "—" ? email : "—",
  };
}

function mapRequestRecord(
  record: AirtableRecord,
  usersById?: Map<string, string>,
): RequestRecord {
  const { fields } = record;

  const requestId =
    fields["Request ID"] ??
    fields["RequestID"] ??
    fields["request_id"] ??
    record.id;

  const requestorField =
    fields["Requestor"] ?? fields["Requestor Name"] ?? fields["requestor"];
  const requestorIds = extractRecordIds(requestorField);
  let requestor: string;
  if (requestorIds.length > 0 && usersById) {
    const names = requestorIds
      .map((id) => usersById.get(id) ?? "")
      .filter(
        (name) => name && name !== "—" && !isPlaceholderPersonName(name),
      );
    requestor = names.join(", ") || "—";
  } else if (requestorIds.length > 0) {
    requestor = "—";
  } else {
    requestor = fieldToString(requestorField);
    if (isPlaceholderPersonName(requestor)) requestor = "—";
  }

  const status = fields["Status"] ?? fields["status"];

  const clientField =
    fields["Client"] ?? fields["Related Client"] ?? fields["client"];

  return {
    id: record.id,
    requestId: fieldToString(requestId),
    requestor,
    status: fieldToString(status),
    clientIds: extractRecordIds(clientField),
  };
}

async function getUsersNameMap(): Promise<Map<string, string>> {
  const records = await fetchAirtableRecords(AIRTABLE_USERS_TABLE_ID);
  return new Map(
    records.map((record) => [record.id, getPersonDisplayName(record.fields)]),
  );
}

function buildRequestsByClient(requests: RequestRecord[]) {
  const byClient = new Map<string, RequestRecord[]>();

  for (const request of requests) {
    for (const clientId of request.clientIds) {
      const existing = byClient.get(clientId);
      if (existing) {
        existing.push(request);
      } else {
        byClient.set(clientId, [request]);
      }
    }
  }

  return byClient;
}

function mapClientRecord(
  record: AirtableRecord,
  requestsByClient: Map<string, RequestRecord[]>,
  caseManagers: Map<string, CaseManagerContact>,
): ClientRecord {
  const { fields } = record;

  const clientIdField =
    fields["Client ID"] ?? fields["ClientID"] ?? fields["client_id"];

  const caseManagerIds = extractRecordIds(
    fields["Case Manager"] ?? fields["case_manager"],
  );
  const caseManagerFromTable = caseManagerIds[0]
    ? (caseManagers.get(caseManagerIds[0]) ?? null)
    : null;
  const caseManager =
    caseManagerFromTable ?? resolveCaseManagerFromLookups(fields);

  const dob = fields["DOB"] ?? fields["Date of Birth"] ?? fields["dob"];

  const clientRequests = requestsByClient.get(record.id) ?? [];
  const linkedRequestCount = extractRecordIds(
    fields["Related Requests"] ?? fields["Requests"] ?? fields["requests"],
  ).length;
  const requestCount = clientRequests.length || linkedRequestCount;
  const openRequestCount = clientRequests.filter((request) =>
    isOpenRequest(request.status),
  ).length;

  return {
    id: record.id,
    displayName: getClientDisplayName(fields),
    dob: formatDob(dob),
    clientId: fieldToString(clientIdField),
    email: fieldToString(fields["Email"] ?? fields["email"]),
    phone: fieldToString(pickField(fields, ["Phone", "Phone Number"])),
    addressLine1: fieldToString(
      pickField(fields, ["Address Line 1", "Address 1"]),
    ),
    addressLine2: fieldToString(
      pickField(fields, ["Address Line 2", "Address 2"]),
    ),
    city: fieldToString(pickField(fields, ["City", "Suburb"])),
    state: fieldToString(pickField(fields, ["State"])),
    postcode: fieldToString(
      pickField(fields, ["Postcode", "Post Code", "Zip"]),
    ),
    caseManager,
    requestCount,
    openRequestCount,
    relatedRequests: clientRequests.map((request) => ({
      id: request.id,
      requestId: request.requestId,
      status: request.status,
    })),
  };
}

async function getCaseManagersMap(): Promise<Map<string, CaseManagerContact>> {
  const records = await fetchAirtableRecords(AIRTABLE_CASE_MANAGERS_TABLE_ID);
  return new Map(
    records.map((record) => [record.id, mapCaseManagerRecord(record)]),
  );
}

function pickField(
  fields: Record<string, unknown>,
  names: string[],
): unknown {
  for (const name of names) {
    if (fields[name] != null) return fields[name];
  }
  return undefined;
}

function mapSupplierRecord(record: AirtableRecord): PayerSupplier {
  const { fields } = record;

  const name = fieldToString(
    pickField(fields, [
      "Supplier Name",
      "Name",
      "Company Name",
      "Company",
      "Supplier",
    ]),
  );

  const detail = fieldToString(
    pickField(fields, ["Lead Time", "Turnaround", "SLA", "Days"]),
  );

  return {
    id: record.id,
    name,
    detail: detail !== "—" ? detail : "",
  };
}

async function getSuppliersMap(): Promise<Map<string, PayerSupplier>> {
  const records = await fetchAirtableRecords(AIRTABLE_SUPPLIERS_TABLE_ID);
  return new Map(records.map((record) => [record.id, mapSupplierRecord(record)]));
}

function mapPayerRecord(
  record: AirtableRecord,
  suppliers: Map<string, PayerSupplier>,
  caseManagers: Map<string, CaseManagerContact>,
): PayerRecord {
  const { fields } = record;

  const name = fieldToString(
    pickField(fields, ["Payer Name", "Name", "Provider Name", "Account Name"]),
  );

  const category = fieldToString(
    pickField(fields, ["Category", "Type", "Payer Type", "Provider Type"]),
  );

  const email = fieldToString(pickField(fields, ["Email", "Contact Email"]));
  const phone = fieldToString(
    pickField(fields, ["Phone", "Phone Number", "Contact Phone"]),
  );

  const supplierIds = extractRecordIds(
    pickField(fields, ["Approved Suppliers", "Suppliers", "suppliers"]),
  );
  const payerSuppliers = supplierIds
    .map(
      (id) =>
        suppliers.get(id) ?? { id, name: "Unknown supplier", detail: "" },
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  const caseManagerIds = extractRecordIds(
    pickField(fields, ["Case Managers", "Case Manager", "case_managers"]),
  );
  const payerCaseManagers: PayerCaseManager[] = caseManagerIds
    .map((id) => {
      const contact = caseManagers.get(id);
      const displayName = contact?.displayName ?? "Unknown";
      return { id, displayName, initials: getInitials(displayName) };
    })
    .sort((a, b) => a.displayName.localeCompare(b.displayName));

  return {
    id: record.id,
    name: name !== "—" ? name : "Untitled payer",
    category: category !== "—" ? category : "",
    email: email !== "—" ? email : "",
    phone: phone !== "—" ? phone : "",
    suppliers: payerSuppliers,
    caseManagers: payerCaseManagers,
  };
}

export async function getPayers(): Promise<PayerRecord[]> {
  if (!isAirtableConfigured()) {
    return [];
  }

  const [payerRecords, suppliers, caseManagers] = await Promise.all([
    fetchAirtableRecords(AIRTABLE_PAYERS_TABLE_ID),
    getSuppliersMap(),
    getCaseManagersMap(),
  ]);

  return payerRecords
    .map((record) => mapPayerRecord(record, suppliers, caseManagers))
    .sort((a, b) => a.name.localeCompare(b.name));
}

async function getPayerNamesMap(): Promise<Map<string, string>> {
  const records = await fetchAirtableRecords(AIRTABLE_PAYERS_TABLE_ID);
  return new Map(
    records.map((record) => [
      record.id,
      fieldToString(
        pickField(record.fields, [
          "Payer Name",
          "Name",
          "Provider Name",
          "Account Name",
        ]),
      ),
    ]),
  );
}

function mapCaseManagerFullRecord(
  record: AirtableRecord,
  payerNames: Map<string, string>,
): CaseManagerRecord {
  const { fields } = record;

  const payerField = pickField(fields, [
    "Payer",
    "Payers",
    "Related Payer",
    "Related Payers",
  ]);
  const payerIds = extractRecordIds(payerField);
  const payer =
    payerIds.length > 0
      ? payerIds
          .map((id) => payerNames.get(id) ?? "")
          .filter((name) => name && name !== "—")
          .join(", ") || "—"
      : fieldToString(payerField);

  return {
    id: record.id,
    displayName: getPersonDisplayName(fields),
    email: fieldToString(fields["Email"] ?? fields["email"]),
    phone: fieldToString(pickField(fields, ["Phone", "Phone Number"])),
    payer: payer || "—",
  };
}

export async function getCaseManagers(): Promise<CaseManagerRecord[]> {
  if (!isAirtableConfigured()) {
    return [];
  }

  const [records, payerNames] = await Promise.all([
    fetchAirtableRecords(AIRTABLE_CASE_MANAGERS_TABLE_ID),
    getPayerNamesMap(),
  ]);

  return records
    .map((record) => mapCaseManagerFullRecord(record, payerNames))
    .sort((a, b) => a.displayName.localeCompare(b.displayName));
}

function mapSupplierFullRecord(
  record: AirtableRecord,
  payerNames: Map<string, string>,
): SupplierRecord {
  const { fields } = record;

  const acceptedPayerIds = extractRecordIds(
    pickField(fields, ["Accepted Payers", "Payers", "Accepted Payer"]),
  );
  const acceptedPayers = acceptedPayerIds
    .map((id) => payerNames.get(id) ?? "")
    .filter((name) => name && name !== "—")
    .sort((a, b) => a.localeCompare(b));

  return {
    id: record.id,
    name: fieldToString(pickField(fields, ["Supplier Name", "Name"])),
    group: fieldToString(
      pickField(fields, [
        "Supplier Group",
        "Group",
        "Supplier group",
        "Parent Group",
      ]),
    ),
    contactEmail: fieldToString(
      pickField(fields, ["Contact Email", "Email"]),
    ),
    averageDeliveryTime: fieldToString(
      pickField(fields, [
        "Average delivery time (days)",
        "Average Delivery Time (days)",
        "Average Delivery Time",
        "Avg Delivery Time",
        "Delivery Time",
        "Average Delivery",
      ]),
    ),
    website: fieldToString(pickField(fields, ["Website", "URL"])),
    phone: fieldToString(pickField(fields, ["Phone", "Phone Number"])),
    addressLine1: fieldToString(
      pickField(fields, ["Address Line 1", "Address 1"]),
    ),
    addressLine2: fieldToString(
      pickField(fields, ["Address Line 2", "Address 2"]),
    ),
    city: fieldToString(pickField(fields, ["City", "Suburb"])),
    state: fieldToString(pickField(fields, ["State"])),
    postcode: fieldToString(pickField(fields, ["Postcode", "Post Code", "Zip"])),
    acceptedPayers,
  };
}

export async function getSuppliers(): Promise<SupplierRecord[]> {
  if (!isAirtableConfigured()) {
    return [];
  }

  const [records, payerNames] = await Promise.all([
    fetchAirtableRecords(AIRTABLE_SUPPLIERS_TABLE_ID),
    getPayerNamesMap(),
  ]);

  return records
    .map((record) => mapSupplierFullRecord(record, payerNames))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function getRequests(): Promise<RequestRecord[]> {
  if (!isAirtableConfigured()) {
    return [];
  }

  const [records, usersById] = await Promise.all([
    fetchAirtableRecords(AIRTABLE_REQUESTS_TABLE_ID),
    getUsersNameMap(),
  ]);
  return records.map((record) => mapRequestRecord(record, usersById));
}

export async function getRequestById(
  id: string,
): Promise<RequestRecord | null> {
  const requests = await getRequests();
  return requests.find((request) => request.id === id) ?? null;
}

export async function getClients(): Promise<ClientRecord[]> {
  if (!isAirtableConfigured()) {
    return [];
  }

  const [clientRecords, requests, caseManagers] = await Promise.all([
    fetchAirtableRecords(AIRTABLE_CLIENTS_TABLE_ID),
    getRequests(),
    getCaseManagersMap(),
  ]);

  const requestsByClient = buildRequestsByClient(requests);

  return clientRecords
    .map((record) => mapClientRecord(record, requestsByClient, caseManagers))
    .sort((a, b) => a.displayName.localeCompare(b.displayName));
}

function cleanString(value: unknown): string {
  const result = fieldToString(value);
  return result === "—" ? "" : result;
}

function toNumberOrNull(value: unknown): number | null {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  }
  return null;
}

export async function getRequestFormData(): Promise<RequestFormData> {
  if (!isAirtableConfigured()) {
    return { clients: [], caseManagers: [], suppliers: [], requestors: [] };
  }

  const [clientRecords, caseManagerRecords, supplierRecords, userRecords] =
    await Promise.all([
      fetchAirtableRecords(AIRTABLE_CLIENTS_TABLE_ID),
      fetchAirtableRecords(AIRTABLE_CASE_MANAGERS_TABLE_ID),
      fetchAirtableRecords(AIRTABLE_SUPPLIERS_TABLE_ID),
      fetchAirtableRecords(AIRTABLE_USERS_TABLE_ID),
    ]);

  const caseManagers: CaseManagerOption[] = caseManagerRecords
    .map((record) => ({
      id: record.id,
      name: getPersonDisplayName(record.fields),
      payerIds: extractRecordIds(record.fields["Related Payer"]),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
  const caseManagerById = new Map(caseManagers.map((cm) => [cm.id, cm]));

  const clients: ClientOption[] = clientRecords
    .map((record) => {
      const caseManagerIds = extractRecordIds(record.fields["Case Manager"]);
      const caseManager = caseManagerIds[0]
        ? (caseManagerById.get(caseManagerIds[0]) ?? null)
        : null;
      const payerIds =
        caseManager?.payerIds ??
        extractRecordIds(record.fields["Related Payer (from Case Manager)"]);

      return {
        id: record.id,
        name: getClientDisplayName(record.fields),
        clientId: cleanString(record.fields["Client ID"]),
        fundingType: cleanString(record.fields["Funding Type"]),
        caseManagerId: caseManager?.id ?? caseManagerIds[0] ?? null,
        caseManagerName: caseManager?.name ?? "",
        payerIds,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const suppliers: SupplierOption[] = supplierRecords
    .map((record) => ({
      id: record.id,
      name: cleanString(record.fields["Supplier Name"]) || "Unnamed supplier",
      averageDeliveryDays: toNumberOrNull(
        record.fields["Average delivery time (days)"],
      ),
      acceptedPayerIds: extractRecordIds(record.fields["Accepted Payers"]),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const requestors: RequestorOption[] = userRecords
    .map((record) => ({
      id: record.id,
      name: getPersonDisplayName(record.fields).replace(/^—$/, "") || "Unnamed",
    }))
    .filter((requestor) => requestor.name !== "Unnamed")
    .sort((a, b) => a.name.localeCompare(b.name));

  return { clients, caseManagers, suppliers, requestors };
}

async function createClientRecord(data: NewClientInput): Promise<string> {
  const fields: Record<string, unknown> = {
    "First Name": data.firstName,
    "Last Name": data.lastName,
    "Date of Birth": data.dateOfBirth,
    Phone: data.phone,
    "Funding Type": data.fundingType,
    "Address Line 1": data.addressLine1,
    City: data.city,
    State: data.state,
    Postcode: data.postcode,
    "Case Manager": [data.caseManagerId],
  };
  if (data.clientId?.trim()) fields["Client ID"] = data.clientId.trim();
  if (data.addressLine2?.trim()) fields["Address Line 2"] = data.addressLine2.trim();

  const [created] = await createAirtableRecords(AIRTABLE_CLIENTS_TABLE_ID, [
    fields,
  ]);
  return created.id;
}

async function resolveClientCaseManager(
  clientRecordId: string,
): Promise<{ caseManagerId: string | null; payerIds: string[] }> {
  const client = await fetchAirtableRecord(
    AIRTABLE_CLIENTS_TABLE_ID,
    clientRecordId,
  );
  if (!client) return { caseManagerId: null, payerIds: [] };

  const caseManagerIds = extractRecordIds(client.fields["Case Manager"]);
  const payerIds = extractRecordIds(
    client.fields["Related Payer (from Case Manager)"],
  );
  return { caseManagerId: caseManagerIds[0] ?? null, payerIds };
}

export async function createNewRequest(
  payload: NewRequestPayload,
): Promise<CreateRequestResult> {
  let clientRecordId: string;
  let caseManagerId: string | null = null;
  let payerIds: string[] = [];

  if (payload.client.mode === "new") {
    caseManagerId = payload.client.data.caseManagerId;
    clientRecordId = await createClientRecord(payload.client.data);
    const caseManager = await fetchAirtableRecord(
      AIRTABLE_CASE_MANAGERS_TABLE_ID,
      caseManagerId,
    );
    payerIds = caseManager
      ? extractRecordIds(caseManager.fields["Related Payer"])
      : [];
  } else {
    clientRecordId = payload.client.id;
    const resolved = await resolveClientCaseManager(clientRecordId);
    caseManagerId = resolved.caseManagerId;
    payerIds = resolved.payerIds;
  }

  const requestFields: Record<string, unknown> = {
    Client: [clientRecordId],
    Status: NEW_REQUEST_STATUS,
    "SLA (business days)": payload.followUpBusinessDays,
  };
  if (payload.requestorId) requestFields["Requestor"] = [payload.requestorId];
  if (caseManagerId) requestFields["Case Manager"] = [caseManagerId];
  if (payload.supplierIds.length > 0) {
    requestFields["Suppliers"] = payload.supplierIds;
  }
  if (payerIds.length > 0) requestFields["Payers"] = payerIds;
  if (payload.notes?.trim()) requestFields["Notes"] = payload.notes.trim();

  const [requestRecord] = await createAirtableRecords(
    AIRTABLE_REQUESTS_TABLE_ID,
    [requestFields],
  );

  if (payload.items.length > 0) {
    const itemFields = payload.items.map((item) => {
      const fields: Record<string, unknown> = {
        Name: item.name,
        Category: item.category,
        Quantity: item.quantity,
        Requests: [requestRecord.id],
      };
      if (item.url?.trim()) fields["URL"] = item.url.trim();
      if (item.notes?.trim()) fields["Notes"] = item.notes.trim();
      return fields;
    });
    await createAirtableRecords(AIRTABLE_ITEMS_TABLE_ID, itemFields);
  }

  const requestId = fieldToString(requestRecord.fields["Request ID"]);
  return {
    id: requestRecord.id,
    requestId: requestId === "—" ? requestRecord.id : requestId,
  };
}
