import { NextResponse } from "next/server";
import {
  getCaseManagerDetailById,
  getClientById,
  getSupplierById,
  isAirtableConfigured,
} from "@/lib/airtable";
import type { RelatedRecordType } from "@/lib/relatedRecords";

type RouteContext = {
  params: Promise<{ type: string; id: string }>;
};

const VALID_TYPES = new Set<RelatedRecordType>([
  "client",
  "caseManager",
  "supplier",
]);

export async function GET(_request: Request, context: RouteContext) {
  const { type, id } = await context.params;

  if (!VALID_TYPES.has(type as RelatedRecordType)) {
    return NextResponse.json({ error: "Invalid record type" }, { status: 400 });
  }

  if (!isAirtableConfigured()) {
    return NextResponse.json(
      { error: "Airtable is not configured" },
      { status: 503 },
    );
  }

  try {
    let record = null;

    if (type === "client") {
      record = await getClientById(id);
    } else if (type === "caseManager") {
      record = await getCaseManagerDetailById(id);
    } else {
      record = await getSupplierById(id);
    }

    if (!record) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    return NextResponse.json(record);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch record";
    console.error(`Failed to fetch related record (${type}/${id}):`, error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
