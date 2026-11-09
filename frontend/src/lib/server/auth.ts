/**
 * Who is calling? Accounts, passwords and token issuing all belong to the Spring
 * customer-service. These route handlers verify the token it signed, then ask the
 * database whether that session was signed out or the account suspended since.
 */

import { getSupabase } from "@/lib/server/supabase";
import { SESSION_COOKIE, TokenClaims, hashToken, verifyToken } from "@/lib/server/session";

export type SessionState = "ok" | "revoked" | "suspended";

export function readCookie(request: Request, name: string): string | undefined {
  const cookies = request.headers.get("cookie") || "";
  for (const cookie of cookies.split(";")) {
    const [key, ...value] = cookie.trim().split("=");
    if (key === name) return value.join("=");
  }
  return undefined;
}

/**
 * A signed token stays valid until it expires, so this is what makes signing out and
 * suspending an account take effect at once. If the check itself fails the session
 * is allowed, so a database hiccup doesn't sign everyone out.
 */
export async function getSessionState(token: string, claims: TokenClaims): Promise<SessionState> {
  const { data, error } = await getSupabase().rpc("session_state", {
    p_token_hash: await hashToken(token),
    p_customer_id: claims.sub,
    p_email: claims.email,
  });
  if (error) {
    console.error("[auth] session check failed:", error.message);
    return "ok";
  }
  return data === "revoked" || data === "suspended" ? data : "ok";
}

export async function getRequestUser(request: Request): Promise<TokenClaims | null> {
  const token = readCookie(request, SESSION_COOKIE);
  const claims = await verifyToken(token);
  if (!token || !claims) return null;
  return (await getSessionState(token, claims)) === "ok" ? claims : null;
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
