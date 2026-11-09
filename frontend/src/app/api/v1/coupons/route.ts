import { NextRequest } from "next/server";
import { db } from "@/lib/server/db";
import { requireAdmin } from "@/lib/server/auth";
import { isValidExpiry } from "@/lib/order-pricing";
import { Coupon } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  try {
    return Response.json({ data: await db.getCoupons() });
  } catch {
    return Response.json({ message: "Could not load coupons." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  try {
    const body = (await request.json()) as Partial<Coupon>;
    const code = String(body.code || "").trim().toUpperCase();
    if (!code) return Response.json({ message: "Coupon code is required." }, { status: 400 });
    if (body.discountType !== "percentage" && body.discountType !== "fixed") {
      return Response.json({ message: "Choose a discount type." }, { status: 400 });
    }
    if (!isValidExpiry(body.expiryDate)) {
      return Response.json({ message: "Choose an expiry date from today onwards." }, { status: 400 });
    }
    const discountValue = Number(body.discountValue);
    const validValue = discountValue > 0 && (body.discountType === "fixed" || discountValue <= 100);
    if (!validValue) {
      return Response.json({ message: "Enter a discount above 0, and no more than 100%." }, { status: 400 });
    }
    if (await db.getCouponByCode(code)) {
      return Response.json({ message: "A coupon with that code already exists." }, { status: 409 });
    }

    const coupon = await db.createCoupon({
      code,
      description: String(body.description || ""),
      discountType: body.discountType,
      discountValue,
      minOrderValue: Number(body.minOrderValue || 0),
      maxDiscount: body.maxDiscount ? Number(body.maxDiscount) : undefined,
      expiryDate: body.expiryDate,
      usageCount: 0,
      usageLimit: body.usageLimit ? Number(body.usageLimit) : undefined,
      status: body.status || "active",
      listed: body.listed !== false,
    });
    return Response.json({ data: coupon }, { status: 201 });
  } catch {
    return Response.json({ message: "Could not create coupon." }, { status: 500 });
  }
}
