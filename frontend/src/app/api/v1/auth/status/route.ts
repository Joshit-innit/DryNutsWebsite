import { isAuthServiceAvailable } from "@/lib/server/auth-backend";

export const dynamic = "force-dynamic";

/** Polled by the sign-in form while the backend wakes; also what wakes it. */
export async function GET() {
  return Response.json({ data: { available: await isAuthServiceAvailable() } });
}
