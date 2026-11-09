import { NextRequest } from "next/server";
import { db } from "@/lib/server/db";
import { requireAdmin } from "@/lib/server/auth";
import { isValidExpiry } from "@/lib/order-pricing";
import { Coupon } from "@/types";

export const dynamic = "force-dynamic";

type CouponRouteContext = { params: Promise<{ code: string }> };

/** Admins can move a coupon's expiry date or switch it off. Past uses are never changed. */
export async function PATCH(request: NextRequest, context: CouponRouteContext) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  const { code } = await context.params;

  try {
    const body = (await request.json()) as Partial<Coupon>;
    if (body.expiryDate !== undefined && !isValidExpiry(body.expiryDate)) {
      return Response.json({ message: "Choose an expiry date from today onwards." }, { status: 400 });
    }
    if (body.status !== undefined && body.status !== "active" && body.status !== "disabled") {
      return Response.json({ message: "Invalid coupon status." }, { status: 400 });
    }

    const coupon = await db.updateCoupon(decodeURIComponent(code).toUpperCase(), {
      expiryDate: body.expiryDate,
      status: body.status,
    });
    if (!coupon) return Response.json({ message: "Coupon not found." }, { status: 404 });
    return Response.json({ data: coupon });
  } catch {
    return Response.json({ message: "Could not update coupon." }, { status: 500 });
  }
}
