import { NextRequest } from "next/server";
import { db } from "@/lib/server/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const productId = request.nextUrl.searchParams.get("productId") || undefined;
  try {
    return Response.json({ data: await db.getReviews(productId) });
  } catch {
    return Response.json({ message: "Could not load reviews." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const productId = String(body.productId || "");
    const customerName = String(body.customerName || "").trim();
    const rating = Math.round(Number(body.rating || 0));

    if (!productId || !(await db.getProductBySlug(productId))) {
      return Response.json({ message: "Product not found." }, { status: 404 });
    }
    if (!customerName || customerName.length > 120) {
      return Response.json({ message: "Please enter your name." }, { status: 400 });
    }
    if (rating < 1 || rating > 5) {
      return Response.json({ message: "Rating must be between 1 and 5." }, { status: 400 });
    }

    const review = await db.createReview({
      productId,
      customerName,
      location: String(body.location || "").slice(0, 120),
      rating,
      title: String(body.title || "").slice(0, 200),
      comment: String(body.comment || "").slice(0, 4000),
      // Purchase verification is not implemented yet, so never trust the client flag.
      verifiedPurchase: false,
    });
    return Response.json({ data: review }, { status: 201 });
  } catch {
    return Response.json({ message: "Could not save your review." }, { status: 500 });
  }
}
