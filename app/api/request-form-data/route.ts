import { NextResponse } from "next/server";
import { getRequestFormData, isAirtableConfigured } from "@/lib/airtable";

export const revalidate = 30;

export async function GET() {
  if (!isAirtableConfigured()) {
    return NextResponse.json(
      { error: "Service is not configured." },
      { status: 503 },
    );
  }

  try {
    const data = await getRequestFormData();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to load request form data:", error);
    return NextResponse.json(
      { error: "Failed to load form data. Please try again." },
      { status: 500 },
    );
  }
}
