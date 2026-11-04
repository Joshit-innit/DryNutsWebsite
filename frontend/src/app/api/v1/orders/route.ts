import crypto from "crypto";
import { NextRequest } from "next/server";
import { db, StockError } from "@/lib/server/db";
import { getRequestUser } from "@/lib/server/auth";
import { getDeliveryFee } from "@/lib/store-settings";
import { CartItem, Order } from "@/types";

export const dynamic = "force-dynamic";

const PAYMENT_METHODS = ["UPI", "Card", "NetBanking", "COD"] as const;

function isoDate(offsetDays = 0) {
  return new Date(Date.now() + offsetDays * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
}

/** Admins see every order; signed-in customers see their own. */
export async function GET(request: NextRequest) {
  const user = getRequestUser(request);
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
  const user = getRequestUser(request);

  try {
    const body = await request.json();
    const items: CartItem[] = Array.isArray(body.items) ? body.items : [];
    const paymentMethod = String(body.paymentMethod || "");

    if (!items.length) {
      return Response.json({ message: "Your cart is empty." }, { status: 400 });
    }
    if (!PAYMENT_METHODS.includes(paymentMethod as (typeof PAYMENT_METHODS)[number])) {
      return Response.json({ message: "Choose a valid payment method." }, { status: 400 });
    }
    if (!body.shippingAddress || typeof body.shippingAddress !== "object") {
      return Response.json({ message: "A shipping address is required." }, { status: 400 });
    }

    const validItems = items.every(
      (item) => item?.productId && item?.variantId && Number.isInteger(item.quantity) && item.quantity > 0
    );
    if (!validItems) {
      return Response.json({ message: "Your cart has an invalid item." }, { status: 400 });
    }

    // The saved settings decide the delivery charge. A tab opened before an admin
    // changed them is asked to review the new total instead of being charged it silently.
    const settings = await db.getSettings();
    const subtotal = items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
    const discount = Number(body.discount || 0);
    const deliveryFee = getDeliveryFee(
      subtotal,
      settings.freeDeliveryMin,
      body.deliverySpeed === "express" ? "express" : "standard"
    );
    if (Number(body.deliveryFee) !== deliveryFee) {
      return Response.json(
        { message: "The delivery charge has changed. Please review your total and try again." },
        { status: 409 }
      );
    }

    const suffix = crypto.randomBytes(4).toString("hex");
    const order: Order = {
      id: `ord-${Date.now()}-${suffix}`,
      orderNumber: `NN-${new Date().getFullYear()}-${suffix.toUpperCase()}`,
      date: isoDate(),
      items,
      subtotal,
      discount,
      deliveryFee,
      gstRate: settings.gstRate,
      total: Math.max(0, subtotal - discount + deliveryFee),
      status: "Confirmed",
      paymentMethod: paymentMethod as Order["paymentMethod"],
      paymentStatus: paymentMethod === "COD" ? "Pending" : "Paid",
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

    const created = await db.createOrder(order, user?.role === "CUSTOMER" ? user.sub : null);
    return Response.json({ data: created }, { status: 201 });
  } catch (error) {
    if (error instanceof StockError) {
      return Response.json({ message: error.message }, { status: 409 });
    }
    return Response.json({ message: "Could not place your order." }, { status: 500 });
  }
}
