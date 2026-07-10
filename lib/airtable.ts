import type { CaseManagerDetail, CaseManagerRecord } from "./caseManagers";
import type { CaseManagerContact, ClientRecord } from "./clients";
import { businessDaysBetween, formatRequestId } from "./format";
import {
  getInitials,
  type PayerCaseManager,
  type PayerRecord,
  type PayerSupplier,
} from "./payers";
import type {
  RequestActivityDetail,
  RequestAttachment,
  RequestClientSummary,
  RequestDetail,
  RequestItemDetail,
  RequestQuoteDetail,
  RequestSupplierSummary,
} from "./requestDetail";
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
const AIRTABLE_QUOTES_TABLE_ID =
  process.env.AIRTABLE_QUOTES_TABLE_ID ?? "tblgXBwjlZCl3nGFy";
const AIRTABLE_ACTIVITIES_TABLE_ID =
  process.env.AIRTABLE_ACTIVITIES_TABLE_ID ?? "tblaElDNG68teCUTz";

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
  createdTime?: string;
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
      next: { revalidate: AIRTABLE_REVALIDATE_SECONDS },
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

async function updateAirtableRecord(
  tableId: string,
  recordId: string,
  fields: Record<string, unknown>,
): Promise<AirtableRecord> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("Airtable is not configured (missing AIRTABLE_API_KEY)");
  }

  const response = await fetch(
    `${AIRTABLE_API_URL}/${AIRTABLE_BASE_ID}/${encodeURIComponent(
      tableId,
    )}/${encodeURIComponent(recordId)}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fields, typecast: true }),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(
      `Airtable update failed (${response.status}): ${await response.text()}`,
    );
  }

  return (await response.json()) as AirtableRecord;
}

async function fetchAirtableRecordsByIds(
  tableId: string,
  ids: string[],
): Promise<AirtableRecord[]> {
  if (ids.length === 0) return [];

  const uniqueIds = [...new Set(ids)];
  const records: AirtableRecord[] = [];

  // Airtable formula OR() is practical in small batches.
  for (let i = 0; i < uniqueIds.length; i += 10) {
    const chunk = uniqueIds.slice(i, i + 10);
    const formula = `OR(${chunk
      .map((id) => `RECORD_ID()='${id}'`)
      .join(",")})`;
    const apiKey = getApiKey();
    if (!apiKey) return [];

    const url = new URL(
      `${AIRTABLE_API_URL}/${AIRTABLE_BASE_ID}/${encodeURIComponent(tableId)}`,
    );
    url.searchParams.set("filterByFormula", formula);

    const response = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${apiKey}` },
      next: { revalidate: AIRTABLE_REVALIDATE_SECONDS },
    });

    if (!response.ok) {
      throw new Error(
        `Airtable request failed (${response.status}): ${await response.text()}`,
      );
    }

    const data = (await response.json()) as AirtableListResponse;
    records.push(...data.records);
  }

  return records;
}

async function fetchRecordsLinkedToRequest(
  tableId: string,
  requestId: string,
): Promise<AirtableRecord[]> {
  const apiKey = getApiKey();
  if (!apiKey) return [];

  const url = new URL(
    `${AIRTABLE_API_URL}/${AIRTABLE_BASE_ID}/${encodeURIComponent(tableId)}`,
  );
  url.searchParams.set(
    "filterByFormula",
    `FIND('${requestId}', ARRAYJOIN({Related Request}))`,
  );

  const response = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${apiKey}` },
    next: { revalidate: AIRTABLE_REVALIDATE_SECONDS },
  });

  if (!response.ok) return [];
  const data = (await response.json()) as AirtableListResponse;
  return data.records;
}

async function fetchAirtableRecordsByFormula(
  tableId: string,
  formula: string,
): Promise<AirtableRecord[]> {
  const apiKey = getApiKey();
  if (!apiKey) return [];

  const url = new URL(
    `${AIRTABLE_API_URL}/${AIRTABLE_BASE_ID}/${encodeURIComponent(tableId)}`,
  );
  url.searchParams.set("filterByFormula", formula);

  const response = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${apiKey}` },
    next: { revalidate: AIRTABLE_REVALIDATE_SECONDS },
  });

  if (!response.ok) {
    throw new Error(
      `Airtable request failed (${response.status}): ${await response.text()}`,
    );
  }

  const data = (await response.json()) as AirtableListResponse;
  return data.records;
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

  const createdAt =
    typeof fields["Created time"] === "string"
      ? fields["Created time"]
      : record.createdTime ?? null;
  const slaBusinessDays = toNumberOrNull(fields["SLA (business days)"]);
  const sla = computeSlaProgress(createdAt, slaBusinessDays);

  return {
    id: record.id,
    requestId: formatRequestId(fieldToString(requestId)),
    requestor,
    status: fieldToString(status),
    clientIds: extractRecordIds(clientField),
    createdAt,
    slaBusinessDays,
    ...sla,
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

export async function getClientById(id: string): Promise<ClientRecord | null> {
  if (!isAirtableConfigured()) return null;

  const record = await fetchAirtableRecord(AIRTABLE_CLIENTS_TABLE_ID, id);
  if (!record) return null;

  const caseManagerIds = extractRecordIds(
    record.fields["Case Manager"] ?? record.fields["case_manager"],
  );
  const [caseManagerRecords, requestRecords] = await Promise.all([
    fetchAirtableRecordsByIds(AIRTABLE_CASE_MANAGERS_TABLE_ID, caseManagerIds),
    fetchAirtableRecordsByFormula(
      AIRTABLE_REQUESTS_TABLE_ID,
      `FIND('${id}', ARRAYJOIN({Client}))`,
    ),
  ]);
  const caseManagers = new Map(
    caseManagerRecords.map((item) => [item.id, mapCaseManagerRecord(item)]),
  );
  const requestsByClient = new Map<string, RequestRecord[]>([
    [id, requestRecords.map((item) => mapRequestRecord(item))],
  ]);

  return mapClientRecord(record, requestsByClient, caseManagers);
}

export async function getCaseManagerDetailById(
  id: string,
): Promise<CaseManagerDetail | null> {
  if (!isAirtableConfigured()) return null;

  const record = await fetchAirtableRecord(AIRTABLE_CASE_MANAGERS_TABLE_ID, id);
  if (!record) return null;

  const { fields } = record;
  const payerNames = await getPayerNamesMap();
  const base = mapCaseManagerFullRecord(record, payerNames);

  const payerField = pickField(fields, [
    "Payer",
    "Payers",
    "Related Payer",
    "Related Payers",
  ]);
  const payerIds = extractRecordIds(payerField);
  const payer =
    payerIds.length > 0
      ? {
          id: payerIds[0],
          name: payerNames.get(payerIds[0]) ?? base.payer,
        }
      : base.payer && base.payer !== "—"
        ? { id: "", name: base.payer }
        : null;

  const status = fieldToString(pickField(fields, ["Status", "status"]));

  const [clientRecords, requestRecords] = await Promise.all([
    fetchAirtableRecordsByFormula(
      AIRTABLE_CLIENTS_TABLE_ID,
      `FIND('${id}', ARRAYJOIN({Case Manager}))`,
    ),
    fetchAirtableRecordsByFormula(
      AIRTABLE_REQUESTS_TABLE_ID,
      `FIND('${id}', ARRAYJOIN({Case Manager}))`,
    ),
  ]);

  const relatedClients = clientRecords
    .filter((client) =>
      extractRecordIds(client.fields["Case Manager"]).includes(id),
    )
    .map((client) => ({
      id: client.id,
      displayName: getClientDisplayName(client.fields),
    }))
    .sort((a, b) => a.displayName.localeCompare(b.displayName));

  const relatedRequests = requestRecords
    .filter((request) =>
      extractRecordIds(request.fields["Case Manager"]).includes(id),
    )
    .map((request) => ({
      id: request.id,
      requestId: formatRequestId(
        fieldToString(request.fields["Request ID"] ?? request.id),
      ),
      status: fieldToString(request.fields["Status"]),
    }))
    .sort((a, b) => a.requestId.localeCompare(b.requestId));

  return {
    id: base.id,
    displayName: base.displayName,
    status,
    email: base.email,
    phone: base.phone,
    payer,
    relatedRequests,
    relatedClients,
  };
}

export async function getSupplierById(
  id: string,
): Promise<SupplierRecord | null> {
  if (!isAirtableConfigured()) return null;

  const record = await fetchAirtableRecord(AIRTABLE_SUPPLIERS_TABLE_ID, id);
  if (!record) return null;

  const payerNames = await getPayerNamesMap();
  return mapSupplierFullRecord(record, payerNames);
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

async function getRandomRequestorId(): Promise<string | null> {
  const records = await fetchAirtableRecords(AIRTABLE_USERS_TABLE_ID);
  if (records.length === 0) return null;
  const random = records[Math.floor(Math.random() * records.length)];
  return random.id;
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
  const requestorId = payload.requestorId ?? (await getRandomRequestorId());
  if (requestorId) requestFields["Requestor"] = [requestorId];
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
    requestId:
      requestId === "—" ? requestRecord.id : formatRequestId(requestId),
  };
}

function mapAttachments(value: unknown): RequestAttachment[] {
  if (!Array.isArray(value)) return [];
  const attachments: RequestAttachment[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const attachment = item as Record<string, unknown>;
    const id = typeof attachment.id === "string" ? attachment.id : "";
    const url = typeof attachment.url === "string" ? attachment.url : "";
    const filename =
      typeof attachment.filename === "string" ? attachment.filename : "file";
    if (!id || !url) continue;
    const mapped: RequestAttachment = { id, url, filename };
    if (typeof attachment.type === "string") {
      mapped.type = attachment.type;
    }
    attachments.push(mapped);
  }
  return attachments;
}

function stripHtml(value: string): string {
  return value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function mapClientSummary(record: AirtableRecord): RequestClientSummary {
  const { fields } = record;
  return {
    id: record.id,
    displayName: getClientDisplayName(fields),
    clientId: cleanString(fields["Client ID"]),
    fundingType: cleanString(fields["Funding Type"]),
    phone: cleanString(pickField(fields, ["Phone", "Phone Number"])),
    dob: formatDob(fields["DOB"] ?? fields["Date of Birth"] ?? fields["dob"]),
    addressLine1: cleanString(
      pickField(fields, ["Address Line 1", "Address 1"]),
    ),
    addressLine2: cleanString(
      pickField(fields, ["Address Line 2", "Address 2"]),
    ),
    city: cleanString(pickField(fields, ["City", "Suburb"])),
    state: cleanString(pickField(fields, ["State"])),
    postcode: cleanString(
      pickField(fields, ["Postcode", "Post Code", "Zip"]),
    ),
  };
}

function mapItemDetail(record: AirtableRecord): RequestItemDetail {
  const { fields } = record;
  return {
    id: record.id,
    itemId: fieldToString(fields["Item ID"]),
    name:
      cleanString(
        pickField(fields, ["Item Name", "Name", "name", "Item"]),
      ) || "Untitled item",
    category: cleanString(fields["Category"]),
    quantity: toNumberOrNull(fields["Quantity"]),
    url: cleanString(fields["URL"]),
    notes: cleanString(fields["Notes"]),
  };
}

function mapQuoteDetail(
  record: AirtableRecord,
  suppliersById: Map<string, RequestSupplierSummary>,
): RequestQuoteDetail {
  const { fields } = record;
  const supplierIds = extractRecordIds(fields["Related Supplier"]);
  const supplier = supplierIds[0]
    ? (suppliersById.get(supplierIds[0]) ?? {
        id: supplierIds[0],
        name: "Unknown supplier",
      })
    : null;

  return {
    id: record.id,
    quoteId: fieldToString(fields["Quote ID"]),
    price: toNumberOrNull(fields["Price"]),
    isManuallyEntered: Boolean(fields["Is Manually Entered?"]),
    supplier,
    attachments: mapAttachments(fields["Attachments"]),
    createdAt:
      typeof fields["Created time"] === "string"
        ? fields["Created time"]
        : record.createdTime ?? null,
  };
}

function mapActivityDetail(record: AirtableRecord): RequestActivityDetail {
  const { fields } = record;
  const contentRaw = fields["Content"];
  const content =
    typeof contentRaw === "string"
      ? stripHtml(contentRaw)
      : cleanString(contentRaw);

  const quoteIds = extractRecordIds(fields["Related Quote"]);

  return {
    id: record.id,
    activityId: fieldToString(fields["Activity ID"]),
    content: content || "Activity recorded",
    channel: cleanString(fields["Channel"]) || "—",
    direction: cleanString(fields["Direction"]) || "—",
    createdAt:
      typeof fields["Created time"] === "string"
        ? fields["Created time"]
        : record.createdTime ?? null,
    relatedQuoteId: quoteIds[0] ?? null,
  };
}

function computeSlaProgress(
  createdAt: string | null,
  slaBusinessDays: number | null,
): {
  daysElapsed: number | null;
  slaProgressPercent: number | null;
  isSlaOverdue: boolean;
} {
  if (!createdAt || slaBusinessDays == null || slaBusinessDays <= 0) {
    return {
      daysElapsed: null,
      slaProgressPercent: null,
      isSlaOverdue: false,
    };
  }

  const daysElapsed = businessDaysBetween(new Date(createdAt), new Date());
  const slaProgressPercent = Math.min(
    100,
    Math.round((daysElapsed / slaBusinessDays) * 100),
  );

  return {
    daysElapsed,
    slaProgressPercent,
    isSlaOverdue: daysElapsed > slaBusinessDays,
  };
}

export async function getRequestDetailById(
  id: string,
): Promise<RequestDetail | null> {
  if (!isAirtableConfigured()) return null;

  const record = await fetchAirtableRecord(AIRTABLE_REQUESTS_TABLE_ID, id);
  if (!record) return null;

  const { fields } = record;
  const usersById = await getUsersNameMap();

  const requestorIds = extractRecordIds(fields["Requestor"]);
  const requestor =
    requestorIds
      .map((userId) => usersById.get(userId) ?? "")
      .filter((name) => name && name !== "—" && !isPlaceholderPersonName(name))
      .join(", ") || "—";

  const clientIds = extractRecordIds(fields["Client"]);
  const supplierIds = extractRecordIds(fields["Suppliers"]);
  const itemIds = extractRecordIds(fields["Items"]);
  const quoteIds = extractRecordIds(fields["Supplier Quotes"]);
  const activityIds = extractRecordIds(fields["Activities"]);
  const caseManagerIds = extractRecordIds(fields["Case Manager"]);

  const [
    clientRecords,
    supplierRecords,
    itemRecords,
    quoteRecords,
    activityRecords,
    caseManagerRecords,
  ] = await Promise.all([
    fetchAirtableRecordsByIds(AIRTABLE_CLIENTS_TABLE_ID, clientIds),
    fetchAirtableRecordsByIds(AIRTABLE_SUPPLIERS_TABLE_ID, supplierIds),
    fetchAirtableRecordsByIds(AIRTABLE_ITEMS_TABLE_ID, itemIds),
    fetchAirtableRecordsByIds(AIRTABLE_QUOTES_TABLE_ID, quoteIds),
    fetchAirtableRecordsByIds(AIRTABLE_ACTIVITIES_TABLE_ID, activityIds),
    fetchAirtableRecordsByIds(AIRTABLE_CASE_MANAGERS_TABLE_ID, caseManagerIds),
  ]);

  const [linkedQuotes, linkedActivities] = await Promise.all([
    quoteRecords.length === 0
      ? fetchRecordsLinkedToRequest(AIRTABLE_QUOTES_TABLE_ID, id)
      : Promise.resolve([] as AirtableRecord[]),
    activityRecords.length === 0
      ? fetchRecordsLinkedToRequest(AIRTABLE_ACTIVITIES_TABLE_ID, id)
      : Promise.resolve([] as AirtableRecord[]),
  ]);

  const allQuoteRecords =
    quoteRecords.length > 0 ? quoteRecords : linkedQuotes;
  const allActivityRecords =
    activityRecords.length > 0 ? activityRecords : linkedActivities;

  // Ensure suppliers referenced only via quotes are resolvable.
  const quoteSupplierIds = allQuoteRecords.flatMap((quote) =>
    extractRecordIds(quote.fields["Related Supplier"]),
  );
  const missingSupplierIds = quoteSupplierIds.filter(
    (supplierId) => !supplierRecords.some((s) => s.id === supplierId),
  );
  const extraSuppliers =
    missingSupplierIds.length > 0
      ? await fetchAirtableRecordsByIds(
          AIRTABLE_SUPPLIERS_TABLE_ID,
          missingSupplierIds,
        )
      : [];

  const suppliersById = new Map<string, RequestSupplierSummary>(
    [...supplierRecords, ...extraSuppliers].map((supplier) => [
      supplier.id,
      {
        id: supplier.id,
        name:
          cleanString(supplier.fields["Supplier Name"]) ||
          cleanString(supplier.fields["Name"]) ||
          "Unnamed supplier",
      },
    ]),
  );

  const suppliers: RequestSupplierSummary[] = supplierIds.map(
    (supplierId) =>
      suppliersById.get(supplierId) ?? {
        id: supplierId,
        name: "Unknown supplier",
      },
  );

  const quotes = allQuoteRecords
    .map((quote) => mapQuoteDetail(quote, suppliersById))
    .sort((a, b) => {
      if (a.price == null && b.price == null) return 0;
      if (a.price == null) return 1;
      if (b.price == null) return -1;
      return a.price - b.price;
    });

  const activities = allActivityRecords
    .map(mapActivityDetail)
    .sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    });

  const caseManagerRecord = caseManagerRecords[0];
  const caseManager = caseManagerRecord
    ? {
        id: caseManagerRecord.id,
        displayName: getPersonDisplayName(caseManagerRecord.fields),
      }
    : null;

  const createdAt =
    typeof fields["Created time"] === "string"
      ? fields["Created time"]
      : record.createdTime ?? null;
  const lastModifiedAt =
    typeof fields["Last modified time"] === "string"
      ? fields["Last modified time"]
      : null;
  const slaBusinessDays = toNumberOrNull(fields["SLA (business days)"]);
  const sla = computeSlaProgress(createdAt, slaBusinessDays);

  const requestIdValue = fields["Request ID"] ?? record.id;

  return {
    id: record.id,
    requestId: formatRequestId(fieldToString(requestIdValue)),
    requestor,
    status: fieldToString(fields["Status"]),
    notes: cleanString(fields["Notes"]),
    slaBusinessDays,
    createdAt,
    lastModifiedAt,
    lastModifiedBy: "—",
    client: clientRecords[0] ? mapClientSummary(clientRecords[0]) : null,
    caseManager,
    suppliers,
    items: itemRecords.map(mapItemDetail),
    quotes,
    activities,
    ...sla,
  };
}

export async function updateQuotePrice(
  quoteId: string,
  price: number,
): Promise<RequestQuoteDetail> {
  const updated = await updateAirtableRecord(AIRTABLE_QUOTES_TABLE_ID, quoteId, {
    Price: price,
    "Is Manually Entered?": true,
  });

  const supplierIds = extractRecordIds(updated.fields["Related Supplier"]);
  const supplierRecords = await fetchAirtableRecordsByIds(
    AIRTABLE_SUPPLIERS_TABLE_ID,
    supplierIds,
  );
  const suppliersById = new Map(
    supplierRecords.map((supplier) => [
      supplier.id,
      {
        id: supplier.id,
        name:
          cleanString(supplier.fields["Supplier Name"]) ||
          cleanString(supplier.fields["Name"]) ||
          "Unnamed supplier",
      } satisfies RequestSupplierSummary,
    ]),
  );

  return mapQuoteDetail(updated, suppliersById);
}

export async function attachQuotePdf(
  quoteId: string,
  file: { filename: string; contentType: string; base64: string },
): Promise<RequestQuoteDetail> {
  const existing = await fetchAirtableRecord(AIRTABLE_QUOTES_TABLE_ID, quoteId);
  if (!existing) {
    throw new Error("Quote not found");
  }

  const existingAttachments = mapAttachments(existing.fields["Attachments"]);
  const nextAttachments = [
    ...existingAttachments.map((attachment) => ({ url: attachment.url })),
    {
      url: `data:${file.contentType};base64,${file.base64}`,
      filename: file.filename,
    },
  ];

  const updated = await updateAirtableRecord(AIRTABLE_QUOTES_TABLE_ID, quoteId, {
    Attachments: nextAttachments,
  });

  const supplierIds = extractRecordIds(updated.fields["Related Supplier"]);
  const supplierRecords = await fetchAirtableRecordsByIds(
    AIRTABLE_SUPPLIERS_TABLE_ID,
    supplierIds,
  );
  const suppliersById = new Map(
    supplierRecords.map((supplier) => [
      supplier.id,
      {
        id: supplier.id,
        name:
          cleanString(supplier.fields["Supplier Name"]) ||
          cleanString(supplier.fields["Name"]) ||
          "Unnamed supplier",
      } satisfies RequestSupplierSummary,
    ]),
  );

  return mapQuoteDetail(updated, suppliersById);
}
