import { NextRequest } from "next/server";
import { db } from "@/lib/server/db";
import { getRequestUser } from "@/lib/server/auth";
import { getCouponDiscount, getCouponProblem } from "@/lib/order-pricing";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  // One use per account can only be kept for accounts, so guests can't redeem coupons.
  const user = await getRequestUser(request);
  if (!user) {
    return Response.json({ data: { valid: false, discount: 0, message: "Sign in to use a coupon." } });
  }

  try {
    const body = await request.json();
    const code = String(body.code || "").trim();
    const subtotal = Number(body.subtotal || 0);

    const coupon = code ? await db.getCouponByCode(code) : undefined;
    const alreadyUsed = coupon ? await db.hasRedeemed(coupon.code, user.sub) : false;
    const problem = getCouponProblem(coupon, subtotal, alreadyUsed);
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
