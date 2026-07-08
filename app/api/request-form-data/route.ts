import { NextResponse } from "next/server";
import { getRequestFormData, isAirtableConfigured } from "@/lib/airtable";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isAirtableConfigured()) {
    return NextResponse.json(
      { error: "Airtable is not configured." },
      { status: 503 },
    );
  }

  try {
    const data = await getRequestFormData();
    return NextResponse.json(data);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load form data";
    console.error("Failed to load request form data:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
