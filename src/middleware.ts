import { NextRequest, NextResponse } from "next/server";

const ADMIN_TOKEN = "nutrination_admin_session_joshit_2026";
const ADMIN_TOKEN_COOKIE = "nn_admin_token";

// Routes that require admin authentication
const ADMIN_PROTECTED = ["/admin"];
const CMD_PROTECTED = ["/cmd"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip login pages themselves to avoid redirect loops
  if (pathname === "/admin/login" || pathname === "/cmd/login") {
    return NextResponse.next();
  }

  // Protect /admin/* routes
  if (ADMIN_PROTECTED.some((p) => pathname.startsWith(p))) {
    const token = request.cookies.get(ADMIN_TOKEN_COOKIE)?.value;
    if (token !== ADMIN_TOKEN) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect /cmd/* routes
  if (CMD_PROTECTED.some((p) => pathname.startsWith(p))) {
    const token = request.cookies.get(ADMIN_TOKEN_COOKIE)?.value;
    if (token !== ADMIN_TOKEN) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/cmd/:path*",
  ],
};
