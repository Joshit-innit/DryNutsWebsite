import { NextRequest } from "next/server";
import { forwardCredentials } from "@/lib/server/auth-backend";
import { refuseIfSuspended } from "@/lib/server/account-hooks";
import { MINUTE, clientIp, tooManyRequests, withinLimits } from "@/lib/server/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const email = String(body.email || "").trim();
  const password = String(body.password || "");

  if (!email || !password) {
    return Response.json({ message: "Email and password are required." }, { status: 400 });
  }

  // Per address stops one visitor trying many passwords or many accounts; per email
  // stops a password being guessed from many addresses.
  const allowed = await withinLimits(
    { key: `login:ip:${clientIp(request)}`, max: 20, windowSeconds: 15 * MINUTE },
    { key: `login:email:${email}`, max: 10, windowSeconds: 15 * MINUTE }
  );
  if (!allowed) {
    return tooManyRequests("Too many sign-in attempts. Please wait 15 minutes and try again.", 15 * MINUTE);
  }

  return forwardCredentials(
    "/login",
    { email, password },
    {
      400: "Please enter a valid email address.",
      401: "Invalid email or password.",
      403: "This account has been suspended. Please contact customer support.",
    },
    refuseIfSuspended
  );
}
