import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/server/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const orders = db.getOrders();
  return NextResponse.json({
    status: 200,
    count: orders.length,
    data: orders,
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.items?.length) {
      return NextResponse.json(
        { status: 422, message: "Order must contain at least 1 item." },
        { status: 422 }
      );
    }
    const order = db.createOrder({ ...body, id: `ord-${Date.now()}` });
    return NextResponse.json({ status: 201, message: "Order placed", data: order }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ status: 500, message: err.message }, { status: 500 });
  }
}
