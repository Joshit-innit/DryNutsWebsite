import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/server/supabase";
import { readCookie } from "@/lib/server/auth";
import { SESSION_COOKIE, hashToken, verifyToken } from "@/lib/server/session";

export const dynamic = "force-dynamic";

/** Ends the session for good: a copied cookie stops working too, not just this browser's. */
export async function POST(request: NextRequest) {
  const token = readCookie(request, SESSION_COOKIE);
  const claims = await verifyToken(token);
  if (token && claims) {
    const { error } = await getSupabase().rpc("revoke_session", {
      p_token_hash: await hashToken(token),
      p_expires_at: new Date(claims.exp * 1000).toISOString(),
    });
    if (error) console.error("[auth/logout] could not revoke session:", error.message);
  }

  const response = NextResponse.json({ data: { authenticated: false } });
  response.cookies.delete(SESSION_COOKIE);
  return response;
}
