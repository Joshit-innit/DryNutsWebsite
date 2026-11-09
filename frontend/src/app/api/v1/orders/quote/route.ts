import { NextRequest } from "next/server";
import { getRequestUser } from "@/lib/server/auth";
import { buildBill } from "@/lib/server/billing";
import { PricingError } from "@/lib/order-pricing";
import { CartItem } from "@/types";

export const dynamic = "force-dynamic";

/** Prices a cart without placing it, so checkout can correct itself before the customer commits. */
export async function POST(request: NextRequest) {
  const user = await getRequestUser(request);

  try {
    const body = await request.json();
    const cart: CartItem[] = Array.isArray(body.items) ? body.items : [];
    const { settings: _settings, ...quote } = await buildBill(cart, {
      couponCode: String(body.couponCode || ""),
      deliverySpeed: body.deliverySpeed === "express" ? "express" : "standard",
      userId: user?.sub,
    });
    return Response.json({ data: quote });
  } catch (error) {
    if (error instanceof PricingError) {
      return Response.json({ message: error.message }, { status: 409 });
    }
    return Response.json({ message: "Could not price your order." }, { status: 500 });
  }
}
