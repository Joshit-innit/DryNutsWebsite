import { NextRequest } from "next/server";
import { db } from "@/lib/server/db";
import { getCouponDiscount, getCouponProblem } from "@/lib/order-pricing";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const code = String(body.code || "").trim();
    const subtotal = Number(body.subtotal || 0);

    const coupon = code ? await db.getCouponByCode(code) : undefined;
    const problem = getCouponProblem(coupon, subtotal);
    if (!coupon || problem) {
      return Response.json({ data: { valid: false, discount: 0, message: problem } });
    }

    const discount = getCouponDiscount(coupon, subtotal);

    return Response.json({
      data: {
        valid: true,
        coupon,
        discount,
        message: `Coupon ${coupon.code} applied successfully! You saved ₹${discount}.`,
      },
    });
  } catch {
    return Response.json({ message: "Could not validate coupon." }, { status: 500 });
  }
}
