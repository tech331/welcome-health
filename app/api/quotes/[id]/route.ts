import { NextResponse } from "next/server";
import { isAirtableConfigured, updateQuotePrice } from "@/lib/airtable";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  if (!isAirtableConfigured()) {
    return NextResponse.json(
      { error: "Airtable is not configured" },
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

  const price =
    body && typeof body === "object" && "price" in body
      ? (body as { price: unknown }).price
      : undefined;

  if (typeof price !== "number" || !Number.isFinite(price) || price < 0) {
    return NextResponse.json(
      { error: "price must be a non-negative number" },
      { status: 400 },
    );
  }

  try {
    const quote = await updateQuotePrice(id, price);
    return NextResponse.json(quote);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update quote";
    console.error("Failed to update quote price:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
