import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifyToken } from "@/lib/server/session";

/** Staff consoles need an admin. /admin/login only redirects, so it stays open. */
const isStaffPath = (path: string) =>
  path !== "/admin/login" &&
  (path.startsWith("/admin") || path.startsWith("/cmd") || path.startsWith("/api-docs"));

/**
 * Runs on the server before any of these pages render, so a signed-out visitor never
 * receives them. /account/orders/[id] stays public: it is a guest's receipt link, and
 * the orders API checks ownership itself.
 */
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const user = await verifyToken(request.cookies.get(SESSION_COOKIE)?.value);

  if (user && (user.role === "ADMIN" || !isStaffPath(pathname))) {
    return NextResponse.next();
  }
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  const login = new URL("/login", request.url);
  login.searchParams.set("next", `${pathname}${search}`);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/admin/:path*", "/cmd/:path*", "/api-docs/:path*", "/account", "/account/orders", "/account/coupons"],
};
