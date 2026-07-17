import { NextResponse } from "next/server";
import { isAirtableConfigured } from "@/lib/airtable";
import { processQuoteReminders } from "@/lib/email/processQuoteReminders";

export const runtime = "nodejs";
export const maxDuration = 60;

function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;
  const authHeader = request.headers.get("authorization");
  return authHeader === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isAirtableConfigured()) {
    return NextResponse.json(
      { error: "Airtable is not configured" },
      { status: 503 },
    );
  }

  try {
    const result = await processQuoteReminders();
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("Quote reminder cron failed:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Quote reminder cron failed",
      },
      { status: 500 },
    );
  }
}
