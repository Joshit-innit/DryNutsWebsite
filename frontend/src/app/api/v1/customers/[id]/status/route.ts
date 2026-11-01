import { NextRequest } from "next/server";
import { db } from "@/lib/server/db";
import { requireAdmin } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

type CustomerRouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: CustomerRouteContext) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  const { id } = await context.params;
  try {
    const { status } = await request.json();
    if (status !== "active" && status !== "suspended") {
      return Response.json({ message: "Status must be active or suspended." }, { status: 400 });
    }
    const updated = await db.setCustomerStatus(id, status);
    if (!updated) return Response.json({ message: "Customer not found." }, { status: 404 });
    return Response.json({ data: updated });
  } catch {
    return Response.json({ message: "Could not update customer." }, { status: 500 });
  }
}
