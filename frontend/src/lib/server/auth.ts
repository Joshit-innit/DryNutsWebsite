/**
 * Who is calling? Accounts, passwords and token issuing all belong to the Spring
 * customer-service. These route handlers only verify the token it signed.
 */

import { SESSION_COOKIE, TokenClaims, verifyToken } from "@/lib/server/session";

function readCookie(request: Request, name: string): string | undefined {
  const cookies = request.headers.get("cookie") || "";
  for (const cookie of cookies.split(";")) {
    const [key, ...value] = cookie.trim().split("=");
    if (key === name) return value.join("=");
  }
  return undefined;
}

export async function getRequestUser(request: Request): Promise<TokenClaims | null> {
  return verifyToken(readCookie(request, SESSION_COOKIE));
}

/** Returns an error Response when the caller is not an authenticated admin. */
export async function requireAdmin(request: Request): Promise<Response | null> {
  const user = await getRequestUser(request);
  if (!user) {
    return Response.json({ message: "Please sign in as an administrator." }, { status: 401 });
  }
  if (user.role !== "ADMIN") {
    return Response.json({ message: "Administrator access is required." }, { status: 403 });
  }
  return null;
}
