/**
 * Steps every way of signing in shares once the Spring service has vouched for someone.
 */

import { getSessionState } from "@/lib/server/auth";
import type { SpringAuthResponse } from "@/lib/server/auth-backend";
import { getSupabase } from "@/lib/server/supabase";

/** A suspended account gets no session, however it signed in. */
export async function refuseIfSuspended(account: SpringAuthResponse): Promise<Response | void> {
  const state = await getSessionState(account.accessToken, {
    sub: account.customerId,
    email: account.email,
    name: account.name,
    role: account.role === "ADMIN" ? "ADMIN" : "CUSTOMER",
    exp: 0,
  });
  if (state === "suspended") {
    return Response.json(
      { message: "This account has been suspended. Please contact customer support." },
      { status: 403 }
    );
  }
}

/** Mirrors a new account into the admin CRM list. A failure here must not block signing up. */
export async function mirrorCustomer(account: SpringAuthResponse): Promise<void> {
  const { error } = await getSupabase()
    .from("customers")
    .upsert(
      { id: account.customerId, name: account.name, email: account.email },
      { onConflict: "email", ignoreDuplicates: true }
    );
  if (error) console.error("[auth] CRM mirror failed:", error.message);
}
