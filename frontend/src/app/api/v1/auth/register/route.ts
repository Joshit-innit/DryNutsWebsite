import { NextRequest } from "next/server";
import { forwardCredentials } from "@/lib/server/auth-backend";
import { getSupabase } from "@/lib/server/supabase";
import { HOUR, clientIp, tooManyRequests, withinLimits } from "@/lib/server/rate-limit";

export const dynamic = "force-dynamic";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim();
  const password = String(body.password || "");

  if (!name || name.length > 120) {
    return Response.json({ message: "Please enter your name." }, { status: 400 });
  }
  if (!EMAIL_PATTERN.test(email)) {
    return Response.json({ message: "Please enter a valid email address." }, { status: 400 });
  }
  if (password.length < 12 || password.length > 128) {
    return Response.json({ message: "Password must be 12 to 128 characters." }, { status: 400 });
  }

  if (!(await withinLimits({ key: `register:ip:${clientIp(request)}`, max: 5, windowSeconds: HOUR }))) {
    return tooManyRequests("Too many new accounts from this connection. Please try again in an hour.", HOUR);
  }

  return forwardCredentials(
    "/register",
    { name, email, password },
    {
      400: "Please check your details and try again.",
      409: "An account already exists for that email address.",
    },
    async (account) => {
      // Mirror the account into the admin CRM list; failures here must not block sign-up.
      const { error } = await getSupabase()
        .from("customers")
        .upsert(
          { id: account.customerId, name: account.name, email: account.email },
          { onConflict: "email", ignoreDuplicates: true }
        );
      if (error) console.error("[auth/register] CRM mirror failed:", error.message);
    }
  );
}
