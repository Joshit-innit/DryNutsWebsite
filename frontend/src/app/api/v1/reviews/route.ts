import { NextRequest } from "next/server";
import { db } from "@/lib/server/db";
import { getRequestUser, requireAdmin } from "@/lib/server/auth";
import { DAY, tooManyRequests, withinLimits } from "@/lib/server/rate-limit";

export const dynamic = "force-dynamic";

/** Reviews are not shown on the storefront; only admins can list them for moderation. */
export async function GET(request: NextRequest) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  const productId = request.nextUrl.searchParams.get("productId") || undefined;
  try {
    return Response.json({ data: await db.getReviews(productId) });
  } catch {
    return Response.json({ message: "Could not load reviews." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const user = await getRequestUser(request);
  if (!user) {
    return Response.json({ message: "Please sign in to write a review." }, { status: 401 });
  }

  if (!(await withinLimits({ key: `review:user:${user.sub}`, max: 10, windowSeconds: DAY }))) {
    return tooManyRequests("You've written several reviews today. Please come back tomorrow.", DAY);
  }

  try {
    const body = await request.json();
    const productId = String(body.productId || "");
    const customerName = user.name.trim();
    const rating = Math.round(Number(body.rating || 0));

    const product = productId ? await db.getProductBySlug(productId) : undefined;
    if (!product || product.status !== "published") {
      return Response.json({ message: "Product not found." }, { status: 404 });
    }
    if (!String(body.comment || "").trim()) {
      return Response.json({ message: "Please write a few words about the product." }, { status: 400 });
    }
    if (rating < 1 || rating > 5) {
      return Response.json({ message: "Rating must be between 1 and 5." }, { status: 400 });
    }

    if (await db.hasReviewed(user.sub, product.id)) {
      return Response.json({ message: "You've already reviewed this product." }, { status: 409 });
    }

    const review = await db.createReview({
      customerId: user.sub,
      productId: product.id,
      customerName,
      location: String(body.location || "").slice(0, 120),
      rating,
      title: String(body.title || "").slice(0, 200),
      comment: String(body.comment || "").slice(0, 4000),
      // Decided here from delivered orders, never from what the browser sends.
      verifiedPurchase: await db.hasReceivedProduct(user.sub, product.id),
    });
    return Response.json({ data: review }, { status: 201 });
  } catch {
    return Response.json({ message: "Could not save your review." }, { status: 500 });
  }
}
