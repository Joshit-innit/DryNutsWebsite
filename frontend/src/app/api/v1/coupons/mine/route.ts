import { NextRequest } from "next/server";
import { db } from "@/lib/server/db";
import { getRequestUser } from "@/lib/server/auth";
import { buildCouponWallet } from "@/lib/order-pricing";

export const dynamic = "force-dynamic";

/** The signed-in account's coupons: what it can use, has used, and recently missed. */
export async function GET(request: NextRequest) {
  const user = await getRequestUser(request);
  if (!user) {
    return Response.json({ message: "Please sign in to view your coupons." }, { status: 401 });
  }
  try {
    const [coupons, redemptions] = await Promise.all([db.getCoupons(), db.getRedemptions(user.sub)]);
    return Response.json({ data: buildCouponWallet(coupons, redemptions) });
  } catch {
    return Response.json({ message: "Could not load your coupons." }, { status: 500 });
  }
}
