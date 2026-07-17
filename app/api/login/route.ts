import { NextResponse } from "next/server";
import { authenticateUser, isAirtableConfigured } from "@/lib/airtable";
import {
  AUTH_COOKIE,
  createSessionToken,
  isAuthConfigured,
  sessionCookieOptions,
} from "@/lib/auth";

export async function POST(request: Request) {
  if (!isAirtableConfigured() || !isAuthConfigured()) {
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

  const { email, password } = body as {
    email?: unknown;
    password?: unknown;
  };

  if (typeof email !== "string" || !email.trim()) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }
  if (typeof password !== "string" || !password) {
    return NextResponse.json(
      { error: "Password is required" },
      { status: 400 },
    );
  }

  try {
    const user = await authenticateUser(email, password);
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
    });

    const response = NextResponse.json({ ok: true });
    response.cookies.set(AUTH_COOKIE, token, sessionCookieOptions());
    return response;
  } catch (error) {
    console.error("Login failed:", error);
    return NextResponse.json(
      { error: "Failed to sign in" },
      { status: 500 },
    );
  }
}
