import { NextResponse } from "next/server";
import { attachQuotePdf, isAirtableConfigured } from "@/lib/airtable";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  if (!isAirtableConfigured()) {
    return NextResponse.json(
      { error: "Service is not configured" },
      { status: 503 },
    );
  }

  const { id } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { filename, contentType, base64 } = body as {
    filename?: unknown;
    contentType?: unknown;
    base64?: unknown;
  };

  if (typeof filename !== "string" || !filename.trim()) {
    return NextResponse.json({ error: "filename is required" }, { status: 400 });
  }
  if (typeof contentType !== "string" || !contentType.trim()) {
    return NextResponse.json(
      { error: "contentType is required" },
      { status: 400 },
    );
  }
  if (typeof base64 !== "string" || !base64.trim()) {
    return NextResponse.json({ error: "base64 is required" }, { status: 400 });
  }

  // Rough size guard (~5 MB decoded)
  if (base64.length > 7_000_000) {
    return NextResponse.json(
      { error: "File is too large (max 5 MB)" },
      { status: 400 },
    );
  }

  try {
    const quote = await attachQuotePdf(id, {
      filename: filename.trim(),
      contentType: contentType.trim(),
      base64: base64.trim(),
    });
    return NextResponse.json({
      attachments: quote.attachments,
      quote,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to attach PDF";
    console.error("Failed to attach quote PDF:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
