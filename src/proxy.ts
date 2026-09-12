import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_TOKEN = "nutrination_admin_session_joshit_2026";
const ADMIN_TOKEN_COOKIE = "nn_admin_token";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip login page itself (avoid redirect loops)
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  // Protect /admin/* and /cmd/* routes
  if (pathname.startsWith("/admin") || pathname.startsWith("/cmd")) {
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
  matcher: ["/admin/:path*", "/cmd/:path*"],
};
