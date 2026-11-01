import { NextRequest } from "next/server";
import { db } from "@/lib/server/db";
import { requireAdmin } from "@/lib/server/auth";
import { OrderStatus } from "@/types";

export const dynamic = "force-dynamic";

type OrderRouteContext = { params: Promise<{ id: string }> };

const STATUSES: OrderStatus[] = [
  "Pending", "Confirmed", "Packed", "Shipped", "Out for Delivery", "Delivered", "Cancelled", "Refunded",
];
const PROGRESSION: OrderStatus[] = ["Pending", "Confirmed", "Packed", "Shipped", "Out for Delivery", "Delivered"];

export async function PATCH(request: NextRequest, context: OrderRouteContext) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  const { id } = await context.params;

  try {
    const { status } = (await request.json()) as { status?: OrderStatus };
    if (!status || !STATUSES.includes(status)) {
      return Response.json({ message: "Invalid order status." }, { status: 400 });
    }

    const order = await db.getOrderById(id);
    if (!order) return Response.json({ message: "Order not found." }, { status: 404 });

    // Keep the tracking timeline in step with the new status.
    const target = PROGRESSION.indexOf(status);
    const timeline = order.timeline.map((step) => {
      const index = PROGRESSION.indexOf(step.status);
      if (target === -1) return { ...step, isCurrent: false };
      const isCompleted = index <= target;
      return {
        ...step,
        isCompleted,
        isCurrent: index === target,
        timestamp: isCompleted && !step.timestamp ? new Date().toLocaleString("en-IN") : step.timestamp,
      };
    });

    const updated = await db.updateOrder(order.id, { status, timeline });
    return Response.json({ data: updated });
  } catch {
    return Response.json({ message: "Could not update order status." }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: OrderRouteContext) {
  return PATCH(request, context);
}
