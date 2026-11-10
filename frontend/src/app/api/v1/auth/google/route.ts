import { NextRequest } from "next/server";
import { forwardCredentials } from "@/lib/server/auth-backend";
import { mirrorCustomer, refuseIfSuspended } from "@/lib/server/account-hooks";
import { MINUTE, clientIp, tooManyRequests, withinLimits } from "@/lib/server/rate-limit";

export const dynamic = "force-dynamic";

/**
 * Signs in, or signs up, with Google. The browser passes on the ID token Google's
 * button gave it; the Spring customer-service checks it with Google's keys, then
 * finds or creates the account and issues our usual session.
 */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const credential = String(body.credential || "");
  if (!credential || credential.length > 4096) {
    return Response.json({ message: "Google sign-in didn't complete. Please try again." }, { status: 400 });
  }

  if (!(await withinLimits({ key: `google:ip:${clientIp(request)}`, max: 20, windowSeconds: 15 * MINUTE }))) {
    return tooManyRequests("Too many sign-in attempts. Please wait 15 minutes and try again.", 15 * MINUTE);
  }

  return forwardCredentials(
    "/google",
    { credential },
    {
      400: "Google sign-in didn't complete. Please try again.",
      401: "We couldn't verify your Google account. Please try again.",
      403: "This account has been suspended. Please contact customer support.",
      501: "Google sign-in isn't available right now. Please use your email and password.",
    },
    async (account) => {
      const refused = await refuseIfSuspended(account);
      if (refused) return refused;
      await mirrorCustomer(account);
    }
  );
}
