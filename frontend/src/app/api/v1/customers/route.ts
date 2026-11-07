import { NextRequest } from "next/server";
import { db } from "@/lib/server/db";
import { requireAdmin } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  try {
    return Response.json({ data: await db.getCustomers() });
  } catch {
    return Response.json({ message: "Could not load customers." }, { status: 500 });
  }
}
