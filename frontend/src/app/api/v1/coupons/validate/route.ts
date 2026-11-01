import { NextRequest } from "next/server";
import { db } from "@/lib/server/db";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const code = String(body.code || "").trim();
    const subtotal = Number(body.subtotal || 0);

    const coupon = code ? await db.getCouponByCode(code) : undefined;
    const today = new Date().toISOString().split("T")[0];
    const exhausted = coupon?.usageLimit !== undefined && coupon.usageCount >= coupon.usageLimit;

    if (!coupon || coupon.status !== "active" || coupon.expiryDate < today || exhausted) {
      return Response.json({ data: { valid: false, discount: 0, message: "Invalid or expired promo code." } });
    }

    if (subtotal < coupon.minOrderValue) {
      return Response.json({
        data: {
          valid: false,
          discount: 0,
          message: `Add items worth ₹${coupon.minOrderValue - subtotal} more to apply code ${coupon.code}.`,
        },
      });
    }

    let discount =
      coupon.discountType === "percentage" ? Math.round((subtotal * coupon.discountValue) / 100) : coupon.discountValue;
    if (coupon.maxDiscount && discount > coupon.maxDiscount) discount = coupon.maxDiscount;

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
