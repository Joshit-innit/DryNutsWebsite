import { NextRequest } from "next/server";
import { db } from "@/lib/server/db";
import { requireAdmin } from "@/lib/server/auth";
import { Coupon } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  try {
    return Response.json({ data: await db.getCoupons() });
  } catch {
    return Response.json({ message: "Could not load coupons." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  try {
    const body = (await request.json()) as Partial<Coupon>;
    const code = String(body.code || "").trim().toUpperCase();
    if (!code) return Response.json({ message: "Coupon code is required." }, { status: 400 });
    if (body.discountType !== "percentage" && body.discountType !== "fixed") {
      return Response.json({ message: "Choose a discount type." }, { status: 400 });
    }
    if (!body.expiryDate) return Response.json({ message: "Expiry date is required." }, { status: 400 });
    if (await db.getCouponByCode(code)) {
      return Response.json({ message: "A coupon with that code already exists." }, { status: 409 });
    }

    const coupon = await db.createCoupon({
      code,
      description: String(body.description || ""),
      discountType: body.discountType,
      discountValue: Number(body.discountValue || 0),
      minOrderValue: Number(body.minOrderValue || 0),
      maxDiscount: body.maxDiscount ? Number(body.maxDiscount) : undefined,
      expiryDate: body.expiryDate,
      usageCount: Number(body.usageCount || 0),
      usageLimit: body.usageLimit ? Number(body.usageLimit) : undefined,
      status: body.status || "active",
    });
    return Response.json({ data: coupon }, { status: 201 });
  } catch {
    return Response.json({ message: "Could not create coupon." }, { status: 500 });
  }
}
