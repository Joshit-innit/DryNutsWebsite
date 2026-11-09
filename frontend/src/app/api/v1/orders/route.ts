import crypto from "crypto";
import { NextRequest } from "next/server";
import { db, StockError } from "@/lib/server/db";
import { getRequestUser } from "@/lib/server/auth";
import { buildBill } from "@/lib/server/billing";
import { PricingError } from "@/lib/order-pricing";
import { ONLINE_PAYMENTS_ENABLED } from "@/lib/store-settings";
import { DAY, HOUR, clientIp, tooManyRequests, withinLimits } from "@/lib/server/rate-limit";
import { CartItem, Order } from "@/types";

export const dynamic = "force-dynamic";

const PAYMENT_METHODS = ["UPI", "Card", "NetBanking", "COD"] as const;

function isCompleteAddress(address: Record<string, unknown> | null | undefined) {
  if (!address || typeof address !== "object") return false;
  const filled = ["name", "phone", "street", "city", "state"].every(
    (field) => typeof address[field] === "string" && address[field].trim()
  );
  return filled && /^[1-9][0-9]{5}$/.test(String(address.pincode));
}

function isoDate(offsetDays = 0) {
  return new Date(Date.now() + offsetDays * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
}

/** Admins see every order; signed-in customers see their own. */
export async function GET(request: NextRequest) {
  const user = await getRequestUser(request);
  if (!user) {
    return Response.json({ message: "Please sign in to view your orders." }, { status: 401 });
  }
  try {
    const orders = await db.getOrders(user.role === "ADMIN" ? undefined : user.sub);
    return Response.json({ data: orders });
  } catch {
    return Response.json({ message: "Could not load orders." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const user = await getRequestUser(request);

  // Every order reserves stock at once, so scripted fake orders could empty the shelves.
  // Signed-in customers are counted by account, guests by connection.
  const who = user ? `user:${user.sub}` : `ip:${clientIp(request)}`;
  const allowed =
    user?.role === "ADMIN" ||
    (await withinLimits(
      { key: `order:${who}`, max: user ? 10 : 5, windowSeconds: HOUR },
      { key: `order-day:${who}`, max: user ? 30 : 15, windowSeconds: DAY }
    ));
  if (!allowed) {
    return tooManyRequests(
      `You've placed several orders in a short time. Please try again later, or contact us if you need a bulk order.`,
      HOUR
    );
  }

  try {
    const body = await request.json();
    const cart: CartItem[] = Array.isArray(body.items) ? body.items : [];
    const paymentMethod = String(body.paymentMethod || "");

    if (!cart.length) {
      return Response.json({ message: "Your cart is empty." }, { status: 400 });
    }
    if (!PAYMENT_METHODS.includes(paymentMethod as (typeof PAYMENT_METHODS)[number])) {
      return Response.json({ message: "Choose a valid payment method." }, { status: 400 });
    }
    if (paymentMethod !== "COD" && !ONLINE_PAYMENTS_ENABLED) {
      return Response.json({ message: "Online payment is not available yet. Please choose cash on delivery." }, { status: 400 });
    }
    if (!isCompleteAddress(body.shippingAddress)) {
      return Response.json({ message: "Please complete your delivery address." }, { status: 400 });
    }

    const validItems = cart.every(
      (item) => item?.productId && item?.variantId && Number.isInteger(item.quantity) && item.quantity > 0
    );
    if (!validItems) {
      return Response.json({ message: "Your cart has an invalid item." }, { status: 400 });
    }

    const { items, subtotal, coupon, couponProblem, discount, deliveryFee, total, settings } = await buildBill(cart, {
      couponCode: String(body.couponCode || ""),
      deliverySpeed: body.deliverySpeed === "express" ? "express" : "standard",
      userId: user?.sub,
    });
    if (couponProblem) {
      return Response.json({ message: couponProblem }, { status: 409 });
    }

    // A total that no longer matches what the customer saw goes back for review.
    if (Number(body.total) !== total) {
      return Response.json(
        { message: "Your total has changed. Please review it and try again." },
        { status: 409 }
      );
    }

    // The id is a guest's receipt link, so it is long and random and shares nothing
    // with the order number, which customers read out and share.
    const order: Order = {
      id: `ord-${crypto.randomBytes(16).toString("base64url")}`,
      orderNumber: `NN-${new Date().getFullYear()}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`,
      date: isoDate(),
      items,
      subtotal,
      discount,
      couponCode: coupon?.code,
      deliveryFee,
      gstRate: settings.gstRate,
      total,
      status: "Confirmed",
      paymentMethod: paymentMethod as Order["paymentMethod"],
      paymentStatus: "Pending",
      shippingAddress: body.shippingAddress,
      estimatedDelivery: isoDate(4),
      trackingNumber: `EXP-${crypto.randomBytes(4).toString("hex").toUpperCase()}`,
      timeline: [
        { status: "Pending", label: "Order Placed", description: "Order received successfully", timestamp: "Just now", isCompleted: true, isCurrent: false },
        { status: "Confirmed", label: "Confirmed & Verified", description: "Harvest inventory reserved", timestamp: "Just now", isCompleted: true, isCurrent: true },
        { status: "Packed", label: "Clean-room Packing", description: "Vacuum nitrogen sealing", isCompleted: false, isCurrent: false },
        { status: "Shipped", label: "Express Dispatch", description: "Air logistics partner pickup", isCompleted: false, isCurrent: false },
        { status: "Out for Delivery", label: "Out for Delivery", description: "Last-mile courier", isCompleted: false, isCurrent: false },
        { status: "Delivered", label: "Delivered", description: "Delivered to doorstep", isCompleted: false, isCurrent: false },
      ],
    };

    const created = await db.createOrder(order, user?.role === "CUSTOMER" ? user.sub : null, user?.sub);
    return Response.json({ data: created }, { status: 201 });
  } catch (error) {
    if (error instanceof StockError || error instanceof PricingError) {
      return Response.json({ message: error.message }, { status: 409 });
    }
    return Response.json({ message: "Could not place your order." }, { status: 500 });
  }
}
