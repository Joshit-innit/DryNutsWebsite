import { NextRequest, NextResponse } from "next/server";
import { couponService } from "@/services/coupons";

export async function GET(request: NextRequest) {
  const coupons = await couponService.getAllCoupons();
  return NextResponse.json({
    status: 200,
    count: coupons.length,
    data: coupons,
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: NextRequest) {
  try {
    const { code, subtotal } = await request.json();
    if (!code) {
      return NextResponse.json({ status: 422, message: "Coupon code is required" }, { status: 422 });
    }
    const result = await couponService.validateCoupon(code, Number(subtotal || 0));
    return NextResponse.json({ status: result.valid ? 200 : 400, ...result });
  } catch (err: any) {
    return NextResponse.json({ status: 500, message: err.message }, { status: 500 });
  }
}
