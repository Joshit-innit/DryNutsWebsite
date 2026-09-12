import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/server/db";

export const dynamic = "force-dynamic";

// Next.js 16: params is now a Promise
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const product = db.getProductBySlug(id);

  if (!product) {
    return NextResponse.json({ status: 404, message: `Product '${id}' not found` }, { status: 404 });
  }

  return NextResponse.json({ status: 200, data: product, timestamp: new Date().toISOString() });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updated = db.updateProduct(id, body);
    if (!updated) {
      return NextResponse.json({ status: 404, message: "Product not found" }, { status: 404 });
    }
    return NextResponse.json({ status: 200, message: "Product updated", data: updated });
  } catch (err: any) {
    return NextResponse.json({ status: 500, message: err.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const deleted = db.deleteProduct(id);
  if (!deleted) {
    return NextResponse.json({ status: 404, message: "Product not found" }, { status: 404 });
  }
  return NextResponse.json({ status: 200, message: `Product ${id} deleted` });
}
