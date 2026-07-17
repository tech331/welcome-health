import { NextResponse } from "next/server";
import {
  createQuoteWithLineItems,
  isAirtableConfigured,
} from "@/lib/airtable";

function isIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00`);
  return !Number.isNaN(date.getTime());
}

export async function POST(request: Request) {
  if (!isAirtableConfigured()) {
    return NextResponse.json(
      { error: "Service is not configured" },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const {
    requestId,
    supplierId,
    dateReceived,
    lines,
  } = body as {
    requestId?: unknown;
    supplierId?: unknown;
    dateReceived?: unknown;
    lines?: unknown;
  };

  if (typeof requestId !== "string" || !requestId.trim()) {
    return NextResponse.json(
      { error: "requestId is required" },
      { status: 400 },
    );
  }

  if (typeof supplierId !== "string" || !supplierId.trim()) {
    return NextResponse.json(
      { error: "supplierId is required" },
      { status: 400 },
    );
  }

  if (typeof dateReceived !== "string" || !isIsoDate(dateReceived)) {
    return NextResponse.json(
      { error: "dateReceived must be a YYYY-MM-DD date" },
      { status: 400 },
    );
  }

  if (!Array.isArray(lines) || lines.length === 0) {
    return NextResponse.json(
      { error: "lines must be a non-empty array" },
      { status: 400 },
    );
  }

  const parsedLines: { itemId: string; unitPrice: number }[] = [];
  for (const line of lines) {
    if (!line || typeof line !== "object") {
      return NextResponse.json(
        { error: "Each line must be an object" },
        { status: 400 },
      );
    }
    const { itemId, unitPrice } = line as {
      itemId?: unknown;
      unitPrice?: unknown;
    };
    if (typeof itemId !== "string" || !itemId.trim()) {
      return NextResponse.json(
        { error: "Each line requires itemId" },
        { status: 400 },
      );
    }
    if (
      typeof unitPrice !== "number" ||
      !Number.isFinite(unitPrice) ||
      unitPrice < 0
    ) {
      return NextResponse.json(
        { error: "Each line unitPrice must be a non-negative number" },
        { status: 400 },
      );
    }
    parsedLines.push({ itemId: itemId.trim(), unitPrice });
  }

  try {
    const quote = await createQuoteWithLineItems({
      requestId: requestId.trim(),
      supplierId: supplierId.trim(),
      dateReceived,
      lines: parsedLines,
    });
    return NextResponse.json(quote, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create quote";
    console.error("Failed to create quote:", error);
    const status =
      message.includes("not found") ||
      message.includes("not linked") ||
      message.includes("not on this request") ||
      message.includes("required") ||
      message.includes("AIRTABLE_QUOTE_ITEMS")
        ? 400
        : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
