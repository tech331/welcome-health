import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE, verifySessionToken } from "@/lib/auth";

function isPublicPath(pathname: string): boolean {
  if (pathname === "/login") return true;
  if (pathname === "/api/login") return true;
  if (pathname.startsWith("/api/cron/")) return true;
  if (pathname.startsWith("/_next")) return true;
  if (pathname === "/favicon.ico") return true;
  if (/\.(?:svg|png|jpg|jpeg|gif|webp|ico)$/i.test(pathname)) return true;
  return false;
}

function safeNextPath(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/";
  if (value.startsWith("/login")) return "/";
  return value;
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (isPublicPath(pathname)) {
    if (pathname === "/login") {
      const session = await verifySessionToken(
        request.cookies.get(AUTH_COOKIE)?.value,
      );
      if (session) {
        const next = safeNextPath(request.nextUrl.searchParams.get("next"));
        return NextResponse.redirect(new URL(next, request.url));
      }
    }
    return NextResponse.next();
  }

  const session = await verifySessionToken(
    request.cookies.get(AUTH_COOKIE)?.value,
  );

  if (session) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const loginUrl = new URL("/login", request.url);
  const next = `${pathname}${search}`;
  if (next && next !== "/") {
    loginUrl.searchParams.set("next", next);
  }
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static Next internals already
     * filtered in isPublicPath; keep matcher broad for API protection.
     */
    "/((?!_next/static|_next/image).*)",
  ],
};
