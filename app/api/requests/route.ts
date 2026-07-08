import { NextResponse } from "next/server";
import { createNewRequest, isAirtableConfigured } from "@/lib/airtable";
import {
  FOLLOW_UP_OPTIONS,
  type NewRequestItemInput,
  type NewRequestPayload,
} from "@/lib/requestForm";

export const dynamic = "force-dynamic";

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function validatePayload(body: unknown): {
  payload?: NewRequestPayload;
  error?: string;
} {
  if (!body || typeof body !== "object") {
    return { error: "Invalid request body." };
  }

  const data = body as Record<string, unknown>;
  const client = data.client as Record<string, unknown> | undefined;

  if (!client || typeof client !== "object") {
    return { error: "A client is required." };
  }

  let clientPayload: NewRequestPayload["client"];

  if (client.mode === "existing") {
    if (!isNonEmptyString(client.id)) {
      return { error: "Please select an existing client." };
    }
    clientPayload = { mode: "existing", id: client.id };
  } else if (client.mode === "new") {
    const c = client.data as Record<string, unknown> | undefined;
    if (!c || typeof c !== "object") {
      return { error: "New client details are required." };
    }
    const required: [keyof typeof c, string][] = [
      ["firstName", "First name"],
      ["lastName", "Last name"],
      ["dateOfBirth", "Date of birth"],
      ["phone", "Phone"],
      ["fundingType", "Funding type"],
      ["addressLine1", "Address line 1"],
      ["city", "City"],
      ["state", "State"],
      ["postcode", "Postcode"],
      ["caseManagerId", "Case manager"],
    ];
    for (const [key, label] of required) {
      if (!isNonEmptyString(c[key])) {
        return { error: `${label} is required for a new client.` };
      }
    }
    clientPayload = {
      mode: "new",
      data: {
        clientId: isNonEmptyString(c.clientId) ? c.clientId : undefined,
        firstName: c.firstName as string,
        lastName: c.lastName as string,
        dateOfBirth: c.dateOfBirth as string,
        phone: c.phone as string,
        fundingType: c.fundingType as string,
        addressLine1: c.addressLine1 as string,
        addressLine2: isNonEmptyString(c.addressLine2)
          ? c.addressLine2
          : undefined,
        city: c.city as string,
        state: c.state as string,
        postcode: c.postcode as string,
        caseManagerId: c.caseManagerId as string,
      },
    };
  } else {
    return { error: "Invalid client selection." };
  }

  const rawItems = Array.isArray(data.items) ? data.items : [];
  const items: NewRequestItemInput[] = [];
  for (const raw of rawItems) {
    if (!raw || typeof raw !== "object") continue;
    const item = raw as Record<string, unknown>;
    if (!isNonEmptyString(item.name)) {
      return { error: "Every item needs a name." };
    }
    if (!isNonEmptyString(item.category)) {
      return { error: "Every item needs a category." };
    }
    const quantity = Number(item.quantity);
    if (!Number.isFinite(quantity) || quantity < 1) {
      return { error: "Every item needs a quantity of at least 1." };
    }
    items.push({
      name: item.name,
      category: item.category,
      quantity: Math.floor(quantity),
      url: isNonEmptyString(item.url) ? item.url : undefined,
      notes: isNonEmptyString(item.notes) ? item.notes : undefined,
    });
  }

  if (items.length === 0) {
    return { error: "Please add at least one item." };
  }

  const supplierIds = Array.isArray(data.supplierIds)
    ? data.supplierIds.filter(isNonEmptyString)
    : [];
  if (supplierIds.length === 0) {
    return { error: "Please select at least one supplier." };
  }

  const followUpBusinessDays = Number(data.followUpBusinessDays);
  if (
    !FOLLOW_UP_OPTIONS.includes(
      followUpBusinessDays as (typeof FOLLOW_UP_OPTIONS)[number],
    )
  ) {
    return { error: "Please choose a valid follow-up frequency." };
  }

  return {
    payload: {
      requestorId: isNonEmptyString(data.requestorId)
        ? data.requestorId
        : undefined,
      client: clientPayload,
      items,
      supplierIds,
      followUpBusinessDays,
      notes: isNonEmptyString(data.notes) ? data.notes : undefined,
    },
  };
}

export async function POST(request: Request) {
  if (!isAirtableConfigured()) {
    return NextResponse.json(
      { error: "Airtable is not configured." },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { payload, error } = validatePayload(body);
  if (error || !payload) {
    return NextResponse.json(
      { error: error ?? "Invalid request." },
      { status: 400 },
    );
  }

  try {
    const result = await createNewRequest(payload);
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to create request";
    console.error("Failed to create request:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
