import { NextRequest } from "next/server";
import { getRequestUser } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const user = getRequestUser(request);

  if (!user) {
    return Response.json({ data: { authenticated: false } });
  }

  return Response.json({
    data: { authenticated: true, customerId: user.sub, name: user.name, email: user.email, role: user.role },
  });
}
