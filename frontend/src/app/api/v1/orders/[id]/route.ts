import { NextRequest } from "next/server";
import { db } from "@/lib/server/db";
import { getRequestUser } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

type OrderRouteContext = { params: Promise<{ id: string }> };

/**
 * Admins can view any order and customers their own, by id or order number. Guest
 * orders (no owner) open only by their long random id, like a receipt link: an order
 * number is short and gets shared, so it must not be enough to see an address.
 */
export async function GET(request: NextRequest, context: OrderRouteContext) {
  const { id } = await context.params;
  const user = await getRequestUser(request);

  try {
    const order = await db.getOrderById(id);
    const allowed =
      order &&
      (user?.role === "ADMIN" ||
        (order.customerId ? order.customerId === user?.sub : order.id === id));
    if (!order || !allowed) {
      return Response.json({ message: "Order not found." }, { status: 404 });
    }
    const { customerId: _owner, ...data } = order;
    return Response.json({ data });
  } catch {
    return Response.json({ message: "Could not load order." }, { status: 500 });
  }
}
