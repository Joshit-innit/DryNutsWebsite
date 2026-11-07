import { NextRequest } from "next/server";
import { db } from "@/lib/server/db";
import { getRequestUser } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

type OrderRouteContext = { params: Promise<{ id: string }> };

/**
 * Admins can view any order and customers their own. Guest orders (no owner)
 * are viewable by their unguessable id, like a receipt link.
 */
export async function GET(request: NextRequest, context: OrderRouteContext) {
  const { id } = await context.params;
  const user = await getRequestUser(request);

  try {
    const order = await db.getOrderById(id);
    const allowed =
      order && (user?.role === "ADMIN" || !order.customerId || order.customerId === user?.sub);
    if (!order || !allowed) {
      return Response.json({ message: "Order not found." }, { status: 404 });
    }
    const { customerId: _owner, ...data } = order;
    return Response.json({ data });
  } catch {
    return Response.json({ message: "Could not load order." }, { status: 500 });
  }
}
